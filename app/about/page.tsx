import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { AboutB2 } from "@/components/v2/about/AboutB2";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = { title: "About" };

// About, v2 since Nov 11: a personal index (components/v2/about/AboutB2.tsx), showing only what's filled in (Noah,
// Nov 11: "Hide what's unfilled"; components/v2/about/personal.ts). The about page before it is components/About.tsx,
// unused now.
export default function AboutPage() {
  return (
    <>
      <Nav current="about" />
      <main id="main">
        <AboutB2 />
      </main>
      <Footer />
    </>
  );
}
