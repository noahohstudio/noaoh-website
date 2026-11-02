import { site } from "@/content/site";
import { Nav } from "@/components/Nav";
import { NameLander } from "@/components/NameLander";
import { Now } from "@/components/Now";
import { Work } from "@/components/Work";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        {/* "intro" is what the nav highlights as your name */}
        <div id="intro">
          {/* One main moment, then supporting text, in the footer's manner (Noah, Oct 28, of the options: "lets keep the
              left align, go with A2"). The sentence-filling lander before it is components/Lander.tsx, unused now. */}
          <NameLander sentence={site.lander.sentence} glass={site.lander.glass} variant="echo" align="left" />
          <Now />
        </div>
        <Work />
      </main>
      <Footer />
    </>
  );
}
