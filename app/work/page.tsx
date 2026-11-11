import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { WorkA } from "@/components/v2/work/WorkA";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = { title: "Work" };

// The work, v2 since Nov 11: a bento of the case studies alone (Noah, Nov 9: "selected work is found when you click on
// noah oh, and a separate library bento of case studies are found when you click work"; components/v2/work/WorkA.tsx)
export default function WorkPage() {
  return (
    <>
      <Nav current="work" />
      <WorkA />
      <Footer />
    </>
  );
}
