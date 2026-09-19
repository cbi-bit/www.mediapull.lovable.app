export type ToolGroup = "convert-pdf" | "video-audio" | "image-create" | "utilities";

export type ToolEntry = {
  slug: string;
  name: string;
  tagline: string;
  group: ToolGroup;
  live: boolean;
  /** Where the work happens, shown to the visitor. */
  runsIn: "browser" | "service";
};

export const toolGroups: { id: ToolGroup; title: string; blurb: string }[] = [
  { id: "convert-pdf", title: "Convert & PDF", blurb: "Documents, conversions, and everything PDF." },
  { id: "video-audio", title: "Videos & Audio", blurb: "Download, trim, convert, and inspect media." },
  { id: "image-create", title: "Create & Extract Images", blurb: "Edit, resize, generate, and pull images." },
  { id: "utilities", title: "Web & Sharing", blurb: "Link inspection, SEO signals, and file sharing." },
];

export const tools: ToolEntry[] = [
  // Convert & PDF
  { slug: "file-converter", name: "File Converter", tagline: "Convert images between PNG, JPG, and WebP instantly.", group: "convert-pdf", live: true, runsIn: "browser" },
  { slug: "merge-pdf", name: "Merge PDF", tagline: "Combine several PDFs in the order you choose.", group: "convert-pdf", live: true, runsIn: "browser" },
  { slug: "split-pdf", name: "Split PDF", tagline: "Pull out a page range into a new PDF.", group: "convert-pdf", live: true, runsIn: "browser" },
  { slug: "pdf-watermark", name: "PDF Watermark", tagline: "Stamp text across every page of a PDF.", group: "convert-pdf", live: true, runsIn: "browser" },
  { slug: "image-compressor", name: "Image Compressor", tagline: "Shrink photos without leaving your device.", group: "convert-pdf", live: true, runsIn: "browser" },
  { slug: "split-merge-files", name: "Split & Merge Files", tagline: "Chunk a large file, then join the parts back.", group: "convert-pdf", live: true, runsIn: "browser" },
  { slug: "pdf-signature", name: "PDF Signature", tagline: "Draw a signature and place it on a page.", group: "convert-pdf", live: false, runsIn: "browser" },
  { slug: "webpage-to-pdf", name: "Webpage to PDF", tagline: "Save any URL as a clean PDF file.", group: "convert-pdf", live: false, runsIn: "service" },
  { slug: "file-repair", name: "File Repair", tagline: "Recover damaged documents and media files.", group: "convert-pdf", live: false, runsIn: "service" },

  // Videos & Audio
  { slug: "video-downloader", name: "Video Downloader", tagline: "Paste a public link and pick a format.", group: "video-audio", live: true, runsIn: "service" },
  { slug: "youtube-to-mp3", name: "Video to MP3", tagline: "Grab the audio-only track from a public video.", group: "video-audio", live: true, runsIn: "service" },
  { slug: "audio-trimmer", name: "Audio Trimmer", tagline: "Cut an audio clip and export it as WAV.", group: "video-audio", live: true, runsIn: "browser" },
  { slug: "subtitle-converter", name: "Subtitle Converter", tagline: "Convert between SRT and VTT captions.", group: "video-audio", live: true, runsIn: "browser" },
  { slug: "media-metadata", name: "Media Metadata", tagline: "Inspect duration, size, and dimensions.", group: "video-audio", live: true, runsIn: "browser" },
  { slug: "video-trimmer", name: "Video Trimmer", tagline: "Cut a clip out of a longer video.", group: "video-audio", live: false, runsIn: "service" },
  { slug: "video-editor", name: "Video Editor", tagline: "Crop, rotate, and stitch clips together.", group: "video-audio", live: false, runsIn: "service" },
  { slug: "video-to-gif", name: "Video to GIF", tagline: "Turn a short clip into a looping GIF.", group: "video-audio", live: false, runsIn: "service" },
  { slug: "mute-video", name: "Mute Video", tagline: "Remove the audio track from a video.", group: "video-audio", live: false, runsIn: "service" },
  { slug: "add-audio-to-video", name: "Add Audio to Video", tagline: "Lay a soundtrack over your footage.", group: "video-audio", live: false, runsIn: "service" },
  { slug: "convert-aac-to-mp3", name: "AAC to MP3", tagline: "Convert AAC audio into a universal MP3.", group: "video-audio", live: false, runsIn: "service" },
  { slug: "convert-3gp-to-mp4", name: "3GP to MP4", tagline: "Modernise old phone recordings.", group: "video-audio", live: false, runsIn: "service" },
  { slug: "convert-avi-to-mp4", name: "AVI to MP4", tagline: "Convert AVI files for phones and browsers.", group: "video-audio", live: false, runsIn: "service" },
  { slug: "audio-converter", name: "Audio Converter", tagline: "Move between MP3, WAV, M4A, and OGG.", group: "video-audio", live: false, runsIn: "service" },

  // Create & extract images
  { slug: "image-editor", name: "Image Editor", tagline: "Rotate, flip, and adjust colours in seconds.", group: "image-create", live: true, runsIn: "browser" },
  { slug: "image-resizer", name: "Image Resizer", tagline: "Set an exact width and height.", group: "image-create", live: true, runsIn: "browser" },
  { slug: "social-image-resizer", name: "Social Image Resizer", tagline: "One upload, every social size.", group: "image-create", live: true, runsIn: "browser" },
  { slug: "meme-generator", name: "Meme Generator", tagline: "Classic top and bottom meme text.", group: "image-create", live: true, runsIn: "browser" },
  { slug: "qr-generator", name: "QR Code Generator", tagline: "Designed QR codes with your own colours.", group: "image-create", live: true, runsIn: "browser" },
  { slug: "media-extractor", name: "Media Extractor", tagline: "Pull every image from a page as a ZIP.", group: "image-create", live: false, runsIn: "service" },
  { slug: "background-remover", name: "Background Remover", tagline: "Cut the subject out of a photo.", group: "image-create", live: false, runsIn: "service" },
  { slug: "image-downloader", name: "Image Downloader", tagline: "Save pictures from a public link.", group: "image-create", live: true, runsIn: "service" },

  // Utilities
  { slug: "url-metadata", name: "URL Metadata", tagline: "Preview how a link looks when shared.", group: "utilities", live: true, runsIn: "service" },
  { slug: "domain-authority", name: "Domain Authority", tagline: "Quick SEO trust signals for any domain.", group: "utilities", live: false, runsIn: "service" },
  { slug: "social-post-generator", name: "Social Post Generator", tagline: "Draft ready-to-post captions for any topic.", group: "utilities", live: true, runsIn: "browser" },
  { slug: "file-inspector", name: "File Details", tagline: "See everything about a file, then download it again.", group: "utilities", live: true, runsIn: "browser" },
  { slug: "share-file", name: "Share File", tagline: "Send a file with a short-lived link.", group: "utilities", live: false, runsIn: "service" },
];

export function getTool(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}
