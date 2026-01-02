import * as React from "react";

type SourcePillProps = {
  label: string;
  title?: string;
  href?: string;
};

export default function SourcePill({ label, title, href }: SourcePillProps) {
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
    textDecoration: "none",
    whiteSpace: "nowrap",
    verticalAlign: "baseline",
  };

  if (!href) {
    return (
      <span style={style} title={title}>
        {label}
      </span>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" style={style} title={title}>
      {label}
    </a>
  );
}
