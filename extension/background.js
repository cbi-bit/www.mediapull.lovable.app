const SITE = "https://mediapull.co";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "mediapull-page",
    title: "Pull media from this page",
    contexts: ["page", "video", "audio"],
  });
  chrome.contextMenus.create({
    id: "mediapull-link",
    title: "Pull media from this link",
    contexts: ["link"],
  });
  chrome.contextMenus.create({
    id: "mediapull-image",
    title: "Open this picture in MediaPull tools",
    contexts: ["image"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const target =
    info.menuItemId === "mediapull-link"
      ? info.linkUrl
      : info.menuItemId === "mediapull-image"
        ? info.srcUrl
        : (tab && tab.url) || info.pageUrl;

  if (!target) return;
  const path = info.menuItemId === "mediapull-image" ? "/tools/image-downloader" : "/tools/video-downloader";
  chrome.tabs.create({ url: `${SITE}${path}?url=${encodeURIComponent(target)}` });
});
