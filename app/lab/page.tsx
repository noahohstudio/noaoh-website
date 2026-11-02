import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { labOpen } from "@/content/site";
import { Nav } from "@/components/Nav";
import { Lab } from "@/components/Lab";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = { title: "Lab" };

export default function LabPage() {
  if (!labOpen) redirect("/"); // until it has a real piece (content/site.ts)
  return (
    <>
      <Nav />
      <main id="main">
        <Lab />
      </main>
      <Footer />
    </>
  );
}
