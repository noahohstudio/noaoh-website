import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Noah Oh — Visual Designer",
  description:
    "Noah Oh is a visual designer focused on product, branding, and typography. Based at The Cooper Union, New York City.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${geist.variable} h-full`}
    >
      <body className="min-h-full bg-paper font-grotesk text-ink antialiased">
        <div className="overflow-x-hidden">{children}</div>
      </body>
    </html>
  );
}
