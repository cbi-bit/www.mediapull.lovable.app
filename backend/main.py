import ipaddress
import logging
import os
import random
import socket
from urllib.parse import urljoin, urlparse

import requests
import yt_dlp
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, HttpUrl

app = FastAPI(title="MediaPull.co API Engine")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "").split(",") if origin.strip()],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
from media_ops import router as media_router  # noqa: E402

app.include_router(media_router)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MediaPullBackend")

BRIGHTDATA_HOST = os.getenv("BRIGHTDATA_HOST", "brd.superproxy.io")
BRIGHTDATA_PORT = os.getenv("BRIGHTDATA_PORT", "33335")


class ExtractRequest(BaseModel):
    url: HttpUrl


def validate_public_url(value: str) -> str:
    parsed = urlparse(value)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise HTTPException(status_code=400, detail="Enter a valid public HTTP URL.")
    try:
        addresses = socket.getaddrinfo(parsed.hostname, parsed.port or 443)
        if any(ipaddress.ip_address(item[4][0]).is_private or ipaddress.ip_address(item[4][0]).is_loopback for item in addresses):
            raise HTTPException(status_code=400, detail="Private network URLs are not supported.")
    except socket.gaierror as exc:
        raise HTTPException(status_code=400, detail="The link host could not be resolved.") from exc
    return value


def get_brightdata_proxy() -> str | None:
    customer = os.getenv("BRIGHTDATA_CUSTOMER_ID")
    zone = os.getenv("BRIGHTDATA_ZONE")
    password = os.getenv("BRIGHTDATA_PASSWORD")
    if not all([customer, zone, password]):
        return None
    session = random.SystemRandom().randint(100000, 999999)
    username = f"brd-customer-{customer}-zone-{zone}-session-{session}"
    return f"http://{username}:{password}@{BRIGHTDATA_HOST}:{BRIGHTDATA_PORT}"


def public_logs(using_proxy: bool) -> list[str]:
    return [
        "Validated public URL.",
        "Secure network route selected." if using_proxy else "Direct network route selected.",
        "Inspected source metadata and available formats.",
        "Extraction completed.",
    ]


@app.get("/health")
def health():
    return {"ok": True, "proxy_configured": get_brightdata_proxy() is not None}


@app.get("/api/download")
def download_file(src: str, filename: str = "mediapull-download"):
    target_url = validate_public_url(src)
    proxy = get_brightdata_proxy()

    def open_stream(active_proxy: str | None):
        return requests.get(
            target_url,
            headers={"User-Agent": "Mozilla/5.0 (compatible; MediaPull/1.0)"},
            proxies={"http": active_proxy, "https": active_proxy} if active_proxy else None,
            stream=True,
            timeout=60,
        )

    try:
        response = open_stream(proxy)
        if response.status_code >= 400 and proxy:
            response.close()
            response = open_stream(None)
        response.raise_for_status()
    except requests.RequestException as exc:
        logger.warning("Download proxy failed: %s", str(exc)[:200])
        raise HTTPException(status_code=502, detail="The file could not be fetched from the source.") from exc

    safe_name = "".join(character for character in filename if character.isalnum() or character in "-_. ")[:120] or "mediapull-download"
    headers = {
        "Content-Disposition": f'attachment; filename="{safe_name}"',
        "Cache-Control": "no-store",
    }
    if response.headers.get("Content-Length"):
        headers["Content-Length"] = response.headers["Content-Length"]
    return StreamingResponse(
        response.iter_content(chunk_size=262144),
        media_type=response.headers.get("Content-Type", "application/octet-stream"),
        headers=headers,
    )


@app.post("/api/extract")
def extract_media(request: ExtractRequest):
    target_url = validate_public_url(str(request.url))
    proxy = get_brightdata_proxy()
    logs = public_logs(proxy is not None)
    lowered = target_url.lower().split("?", 1)[0]
    is_document = lowered.endswith((".pdf", ".docx", ".epub", ".txt")) or "archive.org" in target_url

    if is_document:
        if lowered.endswith((".pdf", ".docx", ".epub", ".txt")):
            extension = lowered.rsplit(".", 1)[-1]
            return {"success": True, "type": "document", "title": target_url.rsplit("/", 1)[-1], "logs": logs, "formats": [{"format_id": "source", "ext": extension, "url": target_url, "resolution": "Original file"}]}
        try:
            response = requests.get(
                target_url,
                headers={"User-Agent": "Mozilla/5.0 (compatible; MediaPull/1.0)"},
                proxies={"http": proxy, "https": proxy} if proxy else None,
                timeout=20,
            )
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            formats = []
            for link in soup.find_all("a", href=True):
                href = str(link["href"])
                clean_href = href.lower().split("?", 1)[0]
                if clean_href.endswith((".pdf", ".docx", ".epub", ".txt")):
                    formats.append({"format_id": "document_extract", "ext": clean_href.rsplit(".", 1)[-1], "url": urljoin(target_url, href), "resolution": "Extracted document"})
            if not formats:
                raise HTTPException(status_code=404, detail="No visible documents were found on this page.")
            return {"success": True, "type": "document", "title": "Extracted page documents", "logs": logs, "formats": formats[:24]}
        except HTTPException:
            raise
        except requests.RequestException as exc:
            logger.warning("Document extraction failed: %s", type(exc).__name__)
            raise HTTPException(status_code=502, detail="The source page could not be read.") from exc

    def run_ydl(active_proxy: str | None):
        options = {"quiet": True, "no_warnings": True, "skip_download": True, "format": "best"}
        if active_proxy:
            options["proxy"] = active_proxy
        with yt_dlp.YoutubeDL(options) as ydl:
            return ydl.extract_info(target_url, download=False)

    try:
        try:
            info = run_ydl(proxy)
        except Exception as proxy_exc:  # noqa: BLE001
            if not proxy:
                raise
            logger.warning("Proxy route failed, retrying direct: %s", str(proxy_exc)[:200])
            logs = public_logs(False)
            info = run_ydl(None)
        formats = []
        for item in info.get("formats", []):
            if item.get("vcodec") == "none" and item.get("acodec") == "none":
                continue
            height = item.get("height")
            audio_only = item.get("vcodec") == "none" and item.get("acodec") not in {None, "none"}
            bitrate = item.get("abr")
            formats.append({"format_id": item.get("format_id"), "ext": item.get("ext"), "resolution": "Audio only" if audio_only else item.get("resolution") or (f"{height}p" if height else "Original"), "url": item.get("url"), "note": f"{round(bitrate)} kbps" if audio_only and bitrate else item.get("format_note") or "Standard quality", "audio_only": audio_only})
        formats.sort(key=lambda item: (not item["audio_only"], item["resolution"]), reverse=True)
        return {"success": True, "type": "video_audio", "title": info.get("title") or "Extracted media", "thumbnail": info.get("thumbnail"), "duration": info.get("duration"), "logs": logs, "formats": formats[:16]}
    except Exception as exc:
        logger.warning("Media extraction failed for %s: %s: %s", target_url, type(exc).__name__, str(exc)[:400])
        reason = str(exc)[:300] or type(exc).__name__
        raise HTTPException(status_code=400, detail=f"Unable to extract this public link. Reason: {reason}") from exc