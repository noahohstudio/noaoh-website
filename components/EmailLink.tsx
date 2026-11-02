"use client";

import { useState } from "react";
import styles from "./EmailLink.module.css";

export function EmailLink({ email, tone = "screen" }: { email: string; tone?: "screen" | "house" }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <span className={styles.email} data-tone={tone}>
      <a href={`mailto:${email}`}>{email}</a>
      <button type="button" onClick={copy} aria-label={copied ? "Email copied" : `Copy ${email}`}>
        {copied ? "Copied" : "Copy"}
      </button>
      <span className="visually-hidden" aria-live="polite">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
    </span>
  );
}
