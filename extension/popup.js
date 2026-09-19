const SITE = "https://mediapull.co";

const tools = [
  ["Video downloader", "video-downloader"],
  ["Video to MP3", "youtube-to-mp3"],
  ["Merge PDF", "merge-pdf"],
  ["Split PDF", "split-pdf"],
  ["Image converter", "file-converter"],
  ["Image resizer", "image-resizer"],
  ["Social sizes", "social-image-resizer"],
  ["Meme generator", "meme-generator"],
  ["QR code", "qr-generator"],
  ["Audio trimmer", "audio-trimmer"],
  ["Subtitles SRT/VTT", "subtitle-converter"],
  ["Link preview", "url-metadata"],
];

const grid = document.getElementById("tools");
for (const [label, slug] of tools) {
  const link = document.createElement("a");
  link.className = "tool";
  link.textContent = label;
  link.href = `${SITE}/tools/${slug}`;
  link.target = "_blank";
  link.rel = "noreferrer";
  grid.appendChild(link);
}

document.getElementById("pull").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab && tab.url ? tab.url : "";
  chrome.tabs.create({ url: `${SITE}/tools/video-downloader?url=${encodeURIComponent(url)}` });
});
