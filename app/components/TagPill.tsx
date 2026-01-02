// app/components/TagPill.tsx
import * as React from "react";

export default function TagPill({
  label,
  title,
}: {
  label: string;
  title?: string;
}) {
  const style: React.CSSProperties = {
    display: "inline-block",
    marginLeft: "0.35rem",
    fontSize: "0.65rem",
    lineHeight: 1.2,
    padding: "0.05rem 0.3rem",
    borderRadius: 6,
    background: "#99999933",
    border: "1px solid #dddddd",
    color: "inherit",
    whiteSpace: "nowrap",
    verticalAlign: "baseline",
  };

  return (
    <span style={style} title={title}>
      {label}
    </span>
  );
}