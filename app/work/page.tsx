import { redirect } from "next/navigation";

// The work is home for now (Noah, Nov 11: "for now lets make noah oh and work the same - selected work doesn't need
// its own zone"), so /work leads there. The bento that was here since Nov 11 (Noah, Nov 9: "selected work is found
// when you click on noah oh, and a separate library bento of case studies are found when you click work") is kept at
// components/v2/work/WorkA.tsx; to bring it back, render <Nav current="work" />, <WorkA /> and <Footer /> here again,
// and point "work" at /work in content/site.ts and hrefOf (components/v2/nav/RailShell.tsx).
export default function WorkPage() {
  redirect("/");
}
