import Nav from "@/components/nav";
import HeroOrbit from "@/components/hero-orbit";
import EmailFollow from "@/components/email-follow";
import Hero from "@/components/hero";
import WorkGrid from "@/components/work-grid";

export default function FullSite() {
  return (
    <>
      <Nav />
      <div className="relative">
        <EmailFollow />
        <HeroOrbit />
        <Hero />
      </div>
      <WorkGrid />
    </>
  );
}
