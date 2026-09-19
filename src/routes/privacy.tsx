import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Privacy Policy — MediaPull.co" },
      { name: "description", content: "How MediaPull.co handles links, technical data, cookies, and advertising." },
      { property: "og:title", content: "Privacy Policy — MediaPull.co" },
      { property: "og:description", content: "How MediaPull.co handles links, technical data, cookies, and advertising." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mediapull.lovable.app/privacy" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://mediapull.lovable.app/privacy" }],
  }),
  component: PrivacyPage,
});

const sections = [
  ["Your files stay with you", "MediaPull.co does not store, keep, or collect your files. Every download is saved directly to your own computer or phone, and tools that run in your browser never send your files to us at all. We have no accounts and no file storage — once a download finishes, only you have it."],
  ["Information we process", "When you submit a link, it is sent to our extraction service to identify available files. We may also process basic technical information such as browser type, approximate region, request time, and error details to operate and protect the service. We do not build profiles of what you download."],
  ["Advertising and cookies", "MediaPull.co may display advertising supplied by Google AdSense or other advertising providers. Those providers may use cookies or similar technologies to select, measure, and personalize ads according to their own policies and your available consent choices."],
  ["How information is used", "Information is used to provide extraction results, prevent abuse, diagnose failures, measure service performance, and support advertising. We do not claim ownership of links or files you submit."],
  ["Data sharing", "Information may be shared with infrastructure, analytics, security, proxy, and advertising providers only as needed to operate the service. Their processing is governed by their own terms and privacy policies."],
  ["Retention and choices", "Operational records may be kept for a limited period for security and reliability. Browser controls can restrict cookies, though doing so may affect advertising or parts of the service."],
  ["Children and changes", "The service is not directed to children under 13. This policy may be updated as the service or legal requirements change; the current version will remain available on this page."],
];

function PrivacyPage() {
  return <main className="min-h-screen bg-background text-foreground"><SiteHeader /><article className="mx-auto max-w-3xl px-5 py-16 sm:px-8"><p className="text-xs font-semibold uppercase text-primary">Legal</p><h1 className="mt-3 text-4xl font-bold sm:text-5xl">Privacy Policy</h1><p className="mt-4 text-sm text-muted-foreground">Last updated September 19, 2026</p><div className="mt-10 space-y-9">{sections.map(([title, body]) => <section key={title}><h2 className="text-xl font-semibold">{title}</h2><p className="mt-3 leading-7 text-muted-foreground">{body}</p></section>)}</div></article><SiteFooter /></main>;
}