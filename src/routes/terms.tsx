import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const Route = createFileRoute("/terms")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Terms of Service — MediaPull.co" },
      { name: "description", content: "Rules for using the free MediaPull.co extraction service." },
      { property: "og:title", content: "Terms of Service — MediaPull.co" },
      { property: "og:description", content: "Rules for using the free MediaPull.co extraction service." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mediapull.lovable.app/terms" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://mediapull.lovable.app/terms" }],
  }),
  component: TermsPage,
});

const sections = [
  ["Using MediaPull.co", "MediaPull.co is provided free of charge and may be supported by advertising. You may use it only for lawful purposes and in accordance with these terms."],
  ["Your responsibility", "Only access or download content that you own, that is in the public domain, or that you have permission to use. You are responsible for respecting copyright, privacy, platform rules, and all applicable laws."],
  ["Prohibited use", "Do not use the service to evade access controls, obtain private or restricted content, distribute malware, infringe intellectual property, overload systems, or automate abusive requests."],
  ["Third-party services", "Results may link to files hosted by third parties. MediaPull.co does not host, control, endorse, or guarantee third-party content, availability, safety, or accuracy."],
  ["Availability", "The service is provided as available without guarantees of uninterrupted operation, successful extraction, file quality, or compatibility. Features and limits may change at any time."],
  ["Limitation of liability", "To the extent permitted by law, MediaPull.co is not liable for losses arising from use of the service, downloaded files, third-party sites, or service interruption."],
];

function TermsPage() {
  return <main className="min-h-screen bg-background text-foreground"><SiteHeader /><article className="mx-auto max-w-3xl px-5 py-16 sm:px-8"><p className="text-xs font-semibold uppercase text-primary">Legal</p><h1 className="mt-3 text-4xl font-bold sm:text-5xl">Terms of Service</h1><p className="mt-4 text-sm text-muted-foreground">Last updated September 19, 2026</p><div className="mt-10 space-y-9">{sections.map(([title, body]) => <section key={title}><h2 className="text-xl font-semibold">{title}</h2><p className="mt-3 leading-7 text-muted-foreground">{body}</p></section>)}</div></article><SiteFooter /></main>;
}