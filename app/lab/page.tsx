import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { labOpen } from "@/content/site";
import { Nav } from "@/components/Nav";
import { LabC } from "@/components/v2/lab/LabC";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = { title: "Lab" };

// The lab, v2 since Nov 11: a still grid, each piece opened one at a time over the page (components/v2/lab/LabC.tsx),
// holding the live lab's seven until the new lab projects are built (Noah, Nov 11: "The live lab's seven"). The lab
// before it is components/Lab.tsx, unused now.
export default function LabPage() {
  if (!labOpen) redirect("/"); // until it has a real piece (content/site.ts)
  return (
    <>
      <Nav current="lab" />
      <main id="main">
        <LabC />
      </main>
      <Footer />
    </>
  );
}
