"""Server-side media operations (ffmpeg) and webpage-to-PDF.

Nothing is ever stored: every upload is written to a temporary directory that is
deleted as soon as the response has been streamed back to the visitor.
"""

import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

router = APIRouter()

MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_MB", "512")) * 1024 * 1024
FFMPEG = shutil.which("ffmpeg") or "ffmpeg"


def ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None


def _require_ffmpeg() -> None:
    if not ffmpeg_available():
        raise HTTPException(status_code=503, detail="Media processing is not available on this server.")


def _save_upload(upload: UploadFile, folder: Path) -> Path:
    target = folder / (Path(upload.filename or "input").name or "input")
    size = 0
    with target.open("wb") as handle:
        while chunk := upload.file.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_UPLOAD_BYTES:
                raise HTTPException(status_code=413, detail="That file is larger than this server accepts.")
            handle.write(chunk)
    return target


def _run(args: list[str]) -> None:
    result = subprocess.run(args, capture_output=True, text=True, timeout=600)
    if result.returncode != 0:
        raise HTTPException(status_code=422, detail="The file could not be processed.")


def _respond(path: Path, folder: str, tasks: BackgroundTasks, media_type: str) -> FileResponse:
    tasks.add_task(shutil.rmtree, folder, True)
    return FileResponse(path, media_type=media_type, filename=path.name, background=None)


@router.get("/api/capabilities")
def capabilities() -> dict:
    return {"ffmpeg": ffmpeg_available(), "webpage_pdf": _chromium_available()}


@router.post("/api/media/transcode")
def transcode(
    tasks: BackgroundTasks,
    file: UploadFile = File(...),
    operation: str = Form(...),
    start: str | None = Form(None),
    end: str | None = Form(None),
    target: str | None = Form(None),
) -> FileResponse:
    """operation: trim | mute | gif | convert-video | convert-audio"""
    _require_ffmpeg()
    folder = tempfile.mkdtemp(prefix="mediapull-")
    try:
        source = _save_upload(file, Path(folder))
        stem = source.stem
        args = [FFMPEG, "-y"]
        if operation in {"trim", "gif"} and start:
            args += ["-ss", start]
        args += ["-i", str(source)]
        if operation in {"trim", "gif"} and end:
            args += ["-to", end]

        if operation == "trim":
            output = Path(folder) / f"{stem}-trimmed{source.suffix or '.mp4'}"
            args += ["-c", "copy", str(output)]
            media_type = "video/mp4"
        elif operation == "mute":
            output = Path(folder) / f"{stem}-muted{source.suffix or '.mp4'}"
            args += ["-an", "-c:v", "copy", str(output)]
            media_type = "video/mp4"
        elif operation == "gif":
            output = Path(folder) / f"{stem}.gif"
            args += ["-vf", "fps=12,scale=480:-1:flags=lanczos", "-loop", "0", str(output)]
            media_type = "image/gif"
        elif operation == "convert-video":
            extension = (target or "mp4").lower().lstrip(".")
            if extension not in {"mp4", "webm", "mov", "mkv"}:
                raise HTTPException(status_code=400, detail="Choose mp4, webm, mov, or mkv.")
            output = Path(folder) / f"{stem}.{extension}"
            args += ["-movflags", "+faststart", str(output)]
            media_type = f"video/{extension}"
        elif operation == "convert-audio":
            extension = (target or "mp3").lower().lstrip(".")
            if extension not in {"mp3", "wav", "m4a", "ogg", "flac"}:
                raise HTTPException(status_code=400, detail="Choose mp3, wav, m4a, ogg, or flac.")
            output = Path(folder) / f"{stem}.{extension}"
            args += ["-vn", str(output)]
            media_type = f"audio/{extension}"
        else:
            raise HTTPException(status_code=400, detail="Unknown operation.")

        _run(args)
        return _respond(output, folder, tasks, media_type)
    except Exception:
        shutil.rmtree(folder, ignore_errors=True)
        raise


@router.post("/api/media/add-audio")
def add_audio(
    tasks: BackgroundTasks,
    video: UploadFile = File(...),
    audio: UploadFile = File(...),
) -> FileResponse:
    _require_ffmpeg()
    folder = tempfile.mkdtemp(prefix="mediapull-")
    try:
        video_path = _save_upload(video, Path(folder))
        audio_path = _save_upload(audio, Path(folder))
        output = Path(folder) / f"{video_path.stem}-with-audio.mp4"
        _run([
            FFMPEG, "-y", "-i", str(video_path), "-i", str(audio_path),
            "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-shortest", str(output),
        ])
        return _respond(output, folder, tasks, "video/mp4")
    except Exception:
        shutil.rmtree(folder, ignore_errors=True)
        raise


def _chromium_available() -> bool:
    try:
        from playwright.sync_api import sync_playwright  # noqa: F401
    except Exception:
        return False
    return True


@router.post("/api/webpage-pdf")
def webpage_pdf(tasks: BackgroundTasks, url: str = Form(...)) -> FileResponse:
    if not _chromium_available():
        raise HTTPException(status_code=503, detail="Webpage to PDF is not available on this server.")
    if not url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="Enter a valid public HTTP URL.")
    from playwright.sync_api import sync_playwright

    folder = tempfile.mkdtemp(prefix="mediapull-")
    output = Path(folder) / "webpage.pdf"
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(args=["--no-sandbox"])
            page = browser.new_page()
            page.goto(url, wait_until="networkidle", timeout=45000)
            page.pdf(path=str(output), format="A4", print_background=True)
            browser.close()
        return _respond(output, folder, tasks, "application/pdf")
    except Exception:
        shutil.rmtree(folder, ignore_errors=True)
        raise HTTPException(status_code=422, detail="That page could not be saved as a PDF.")
