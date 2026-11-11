import { Fragment } from "react";

// Text that never breaks inside a hyphenated word ("early-stage", "Front-end"), as the site's flipping letters don't
export function Keep({ text }: { text: string }) {
  return text.split(/(\s+)/).map((chunk, i) =>
    chunk.includes("-") ? (
      <span key={i} style={{ whiteSpace: "nowrap" }}>
        {chunk}
      </span>
    ) : (
      <Fragment key={i}>{chunk}</Fragment>
    ),
  );
}
