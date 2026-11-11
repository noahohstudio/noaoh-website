import { Nav } from "@/components/Nav";
import { HomeB2 } from "@/components/v2/home/HomeB2";
import { Footer } from "@/components/Footer";

// Home, v2 since Nov 11 (Noah: "v2 replaces the site"): the line, Currently and Previously, then Selected work, the
// case studies with the lab between them (components/v2/home/HomeB2.tsx). The home before it, the name lander with its
// glass and the work column, is components/NameLander.tsx, Now.tsx and Work.tsx, unused now.
export default function Home() {
  return (
    <>
      {/* Your name at the top, "work" once Selected work fills most of the screen (Nav.tsx) */}
      <Nav />
      <HomeB2 />
      <Footer />
    </>
  );
}
