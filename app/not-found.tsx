import Link from "next/link";
import { Nav } from "@/components/Nav";
import { FlipText } from "@/components/Flip";
import { Footer } from "@/components/Footer";
import styles from "@/components/CaseStudy.module.css";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main" className={styles.page}>
        <div className={styles.head}>
          <h1 className={styles.title}>page not found</h1>
          <p className={styles.summary}>
            This page doesn&apos;t exist, or it moved. <Link href="/">
              <FlipText text="Back to home" />
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
