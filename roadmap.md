# Roadmap

- [x] Create the MediaPull inline SVG brand mark and wordmark.
- [x] Add the responsive application header and mobile icon presentation.
- [x] Add matching favicon and installable app manifest assets.
- [x] Verify the finished design in desktop and mobile layouts.
- [x] Connect the paste box to `/api/extract` with loading and error states.
- [x] Display extracted documents, video/audio formats, metadata, and processing logs.
- [ ] Configure the extraction service URL and Bright Data credentials securely. Blocked: deployed extractor URL and Bright Data account credentials are still required.
- [ ] Verify extraction results and mobile/desktop layouts.
- [x] Add full homepage navigation and footer.
- [x] Explain how to download videos, pictures, documents, and other supported files.
- [x] Add Privacy Policy and Terms of Service pages.
- [x] Add clearly labeled, provider-neutral advertisement placements.
- [x] Open the homepage directly, use the device theme by default, and remember changes from the header theme button.
- [x] Add a searchable right-side mobile menu for all tool groups and key pages.
- [x] Add audio-only download identification and actions to extraction results.
## Tools hub (done)
- [x] Tool catalog + /tools directory with search and group filters
- [x] /tools/$slug pages with per-tool SEO metadata and related tools
- [x] 20 working tools (images, PDF, files, audio, subtitles, QR, link tools)
- [x] Coming-soon panels for video/ffmpeg tools
- [x] Browser extension (popup toolbox + right-click) packaged at public/mediapull-extension.zip
- [x] File Details tool (/tools/file-inspector) — browser-only inspect + re-download
- [x] Server package: Dockerfile (ffmpeg + Chromium), transcode/add-audio/webpage-PDF endpoints, DEPLOY.md
- [ ] Deploy backend/ to a host and give me the public URL (saves as EXTRACTOR_API_URL)
- [ ] Bright Data credentials set as env vars on that host
- [ ] Switch the "Soon" video/audio tools to live once the engine URL is connected
## Google AdSense
- [x] ads.txt with publisher pub-1636922398620774 + AdSense loader script in the site head
- [x] Real ad slots (AdSlot component) replacing the homepage and tools placeholders
- [ ] User enables Auto Ads (or sends ad-unit slot IDs) in the AdSense dashboard; site must be republished for Google to review it
