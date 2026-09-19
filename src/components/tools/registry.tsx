import type { ComponentType } from "react";
import { FileConverter, ImageEditor, ImageResizer, MemeGenerator, SocialImageResizer } from "./ImageTools";
import { AudioTrimmer, MediaMetadata, SplitMergeFiles, SubtitleConverter } from "./FileTools";
import { ImageDownloader, MediaExtractor, SocialCaptionGenerator, UrlMetadata } from "./LinkTools";
import { MergePdf, PdfWatermark, SplitPdf } from "./PdfTools";
import { QrGenerator } from "./QrTool";
import { FileInspector } from "./FileInspector";

export const toolComponents: Record<string, ComponentType> = {
  "file-converter": FileConverter,
  "image-compressor": () => <FileConverter compress />,
  "merge-pdf": MergePdf,
  "split-pdf": SplitPdf,
  "pdf-watermark": PdfWatermark,
  "split-merge-files": SplitMergeFiles,
  "video-downloader": MediaExtractor,
  "youtube-to-mp3": () => <MediaExtractor audioOnly />,
  "audio-trimmer": AudioTrimmer,
  "subtitle-converter": SubtitleConverter,
  "media-metadata": MediaMetadata,
  "image-editor": ImageEditor,
  "image-resizer": ImageResizer,
  "social-image-resizer": SocialImageResizer,
  "meme-generator": MemeGenerator,
  "qr-generator": QrGenerator,
  "image-downloader": ImageDownloader,
  "url-metadata": UrlMetadata,
  "social-post-generator": SocialCaptionGenerator,
  "file-inspector": FileInspector,
};
