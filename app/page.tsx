import FullSite from "@/components/full-site";
import UnderConstruction from "@/components/under-construction";

// Flip to false to bring the full site back (orbit hero, hero 2, work grid).
const UNDER_CONSTRUCTION = true;

export default function HomePage() {
  return UNDER_CONSTRUCTION ? <UnderConstruction /> : <FullSite />;
}
