import styles from "./InteractiveMark.module.css";

// Sits beside a case study header whose section holds an interactive piece. Case studies only:
// nothing else on the site (the lander, the lab) gets it.
// One icon, faint until hovered or focused; then a small glass card says "Interactive",
// after the footer's hint. `how` (how to use the piece) is read to screen readers.
export function InteractiveMark({ how }: { how?: string }) {
  return (
    <span className={styles.mark}>
      <button type="button" className={styles.icon} aria-label={how ? `Interactive: ${how}` : "Interactive"}>
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M5.5 4.5 13 7.4 9.6 8.6 8.4 12z" fill="currentColor" />
          <path d="M3.4 1.6v1.8M1.6 3.4h1.8M1.9 1.9l1.1 1.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>
      <span className={styles.card} aria-hidden="true">
        Interactive
      </span>
    </span>
  );
}
