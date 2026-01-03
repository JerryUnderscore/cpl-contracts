// app/components/Card.tsx
import * as React from "react";

export default function Card({
  title,
  subtitle,
  children,
  style,
  contentStyle,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
}) {
  return (
    <section
      style={{
        border: "1px solid var(--borderSoft)",
        borderRadius: 14,
        background: "var(--card)",
        padding: "1rem",
        minWidth: 0,
        ...style,
      }}
    >
      {(title || subtitle) ? (
        <header style={{ marginBottom: "0.75rem" }}>
          {title ? (
            <h3 style={{ margin: 0, fontSize: "1.05rem" }}>{title}</h3>
          ) : null}
          {subtitle ? (
            <div style={{ marginTop: "0.35rem", color: "var(--muted)", lineHeight: 1.5 }}>
              {subtitle}
            </div>
          ) : null}
        </header>
      ) : null}

      <div style={contentStyle}>{children}</div>
    </section>
  );
}