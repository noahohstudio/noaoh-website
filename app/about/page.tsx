import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { About } from "@/components/About";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main id="main">
        <About />
      </main>
      <Footer />
    </>
  );
}
