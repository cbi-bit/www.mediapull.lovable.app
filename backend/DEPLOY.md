# Deploying the MediaPull engine

The engine needs a real server (it runs yt-dlp, ffmpeg and a headless browser).
It cannot run inside the website itself.

## 1. Deploy the container

Any host that accepts a Dockerfile works: Render, Railway, Fly.io, Hetzner, DigitalOcean.

```bash
cd backend
docker build -t mediapull-engine .
docker run -p 8000:8000 --env-file .env mediapull-engine
```

## 2. Environment variables

| Name | Value |
| --- | --- |
| `ALLOWED_ORIGINS` | `https://your-site.lovable.app,https://mediapull.co` |
| `BRIGHTDATA_CUSTOMER_ID` | Bright Data customer ID |
| `BRIGHTDATA_ZONE` | Residential zone name |
| `BRIGHTDATA_PASSWORD` | Zone password |
| `BRIGHTDATA_HOST` | `brd.superproxy.io` |
| `BRIGHTDATA_PORT` | `33335` |
| `MAX_UPLOAD_MB` | `512` (optional) |

## 3. Point the website at it

In Lovable, add the secret `EXTRACTOR_API_URL` with the engine's public base URL
(for example `https://mediapull-engine.onrender.com`, no trailing slash).

## 4. Check it

```bash
curl https://your-engine-url/health          # {"ok":true,"proxy_configured":true}
curl https://your-engine-url/api/capabilities # {"ffmpeg":true,"webpage_pdf":true}
```

## Endpoints

- `POST /api/extract` — `{ "url": "..." }`, returns formats + documents.
- `POST /api/media/transcode` — multipart `file`, `operation`
  (`trim` | `mute` | `gif` | `convert-video` | `convert-audio`), optional
  `start`, `end`, `target`. Streams the finished file back.
- `POST /api/media/add-audio` — multipart `video` + `audio`.
- `POST /api/webpage-pdf` — form field `url`, returns a PDF.

Uploads are written to a temporary folder and deleted the moment the response is
sent. Nothing is stored, logged to disk, or linked to a visitor.
