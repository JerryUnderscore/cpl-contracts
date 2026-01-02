// app/about/page.tsx
import * as React from "react";

export const revalidate = 3600;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ marginTop: "1.75rem", marginBottom: "0.5rem" }}>{children}</h2>;
}

export default function AboutPage() {
  const formUrl = process.env.NEXT_PUBLIC_CORRECTIONS_FORM_URL;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "1rem 0" }}>
      <h1 style={{ marginTop: "0.5rem" }}>About</h1>

      <p style={{ color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.6 }}>
        CPL Contracts is an independent, fan-run site that tracks player contracts, roster status,
        and transfers in the Canadian Premier League.
        <br />
        <br />
        This is a best-effort dataset built from public reporting — it is <b>not</b> an official league
        or club database.
      </p>

      <SectionTitle>Data sources</SectionTitle>
      <p style={{ lineHeight: 1.6 }}>
        Information on this site is compiled from a mix of official announcements and reputable
        third-party reporting, including:
      </p>

      <ul style={{ lineHeight: 1.8 }}>
        <li>
          Official league and club announcements (
          <a href="https://canpl.ca" target="_blank" rel="noreferrer">CanPL.ca</a> and club sites)
        </li>
        <li>
          Independent reporting such as{" "}
          <a href="https://northerntribune.ca/" target="_blank" rel="noreferrer">
            Northern Tribune
          </a>
          ,{" "}
          <a href="https://www.hfxfootballpost.ca/" target="_blank" rel="noreferrer">
            HFX Football Post
          </a>
          , and{" "}
          <a href="https://truenorthfoot.ca/" target="_blank" rel="noreferrer">
            TrueNorthFoot
          </a>
        </li>
        <li>Occasional player or agent posts, when independently verifiable</li>
      </ul>

      <SectionTitle>Notes and limitations</SectionTitle>
      <ul style={{ lineHeight: 1.8 }}>
        <li>Updates are added as they’re reported; timing may lag behind announcements.</li>
        <li>
          Contract statuses are simplified into categories to make roster rules and compliance easier
          to understand.
        </li>
        <li>
          Some details (options, bonuses, exact expiry dates) are not publicly available and may be
          incomplete or inferred.
        </li>
      </ul>

      <SectionTitle>Corrections & submissions</SectionTitle>
      {formUrl ? (
        <p style={{ lineHeight: 1.6 }}>
          If you spot an error, have additional context, or can provide a source that improves the
          data, please submit it here:{" "}
          <a href={formUrl} target="_blank" rel="noreferrer">
            <u>Corrections / submissions form</u>
          </a>
          .
        </p>
      ) : (
        <p style={{ lineHeight: 1.6 }}>
          If you spot an error, a corrections form will be available shortly.
        </p>
      )}

      <p style={{ marginTop: "2rem", color: "var(--muted2)", fontSize: "0.95rem" }}>
        CPL Contracts is an independent fan project and is not affiliated with the Canadian Premier
        League or any of its clubs.
      </p>
    </div>
  );
}