import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import { site } from "@/content/site";
import { EasterEggs } from "@/components/EasterEggs";
import { SelectionColor } from "@/components/SelectionColor";
import { Loader } from "@/components/Loader";
import { IndexRail } from "@/components/IndexRail";
import { projects } from "@/content/projects";
import { Scroll } from "@/components/Scroll";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${site.domain}`),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    url: "/",
    siteName: site.name,
    type: "website",
  },
  // The link preview (app/opengraph-image.png, the lander as it opens; Nov 1, for sharing): a large card everywhere
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        {/* Runs before first paint so CSS can tell when JavaScript is available.
            Prototype: /?caps previews the whole page in capitals. */}
        <Script id="js-flag" strategy="beforeInteractive">
          {`document.documentElement.classList.add('js');if(new URLSearchParams(location.search).has('caps'))document.documentElement.classList.add('caps')`}
        </Script>
        <Loader />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <Scroll />
        <EasterEggs />
        <SelectionColor />
        <IndexRail studies={projects.map((p) => ({ slug: p.slug, title: p.title, soon: p.soon }))} />
      </body>
    </html>
  );
}
