import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Gallery } from "@/components/landing/Gallery";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MangaMorph — Turn Your Stories Into Manga" },
      { name: "description", content: "AI-powered manga storytelling platform. Transform written stories into stunning manga panels with character consistency, director controls, and cinematic styles." },
      { property: "og:title", content: "MangaMorph — Turn Your Stories Into Manga" },
      { property: "og:description", content: "Transform written stories into stunning manga panels in seconds." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <Features />
        <Gallery />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
