import * as React from "react";
import { CLUB_BY_SLUG } from "../lib/clubs";

type Props = {
  clubSlug: string;
  title?: string; // tooltip / a11y label
  size?: number;  // px height
};

export default function CaptainArmband({ clubSlug, title = "Captain", size = 16 }: Props) {
  const club = CLUB_BY_SLUG[clubSlug];

  // fallbacks if anything is missing
  const primary = club?.colors?.primary ? `#${club.colors.primary}` : "#F15D5D";
  const secondary = club?.colors?.secondary ? `#${club.colors.secondary}` : "#FFD54C";

  return (
    <span
      title={title}
      aria-label={title}
      className="armbandWrap"
      style={{
        display: "inline-flex",
        alignItems: "center",
        marginLeft: 6,
        // CSS vars consumed by the SVG
        ["--armband-primary" as any]: primary,
        ["--armband-secondary" as any]: secondary,
        ["--armband-mark" as any]: "#FFFFFF",
        ["--armband-outline" as any]: "transparent",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 240"
        role="img"
        aria-label="Captain armband"
        style={{ height: size, width: "auto", display: "block" }}
      >
        <defs>
          <clipPath id={`bandClip-${clubSlug}`}>
            <rect x="0" y="0" width="400" height="240" rx="28" ry="28" />
          </clipPath>
        </defs>

        <g clipPath={`url(#bandClip-${clubSlug})`}>
          <rect x="0" y="0" width="400" height="240" rx="28" ry="28" fill="var(--armband-primary)" />

          <rect
            x="1"
            y="1"
            width="398"
            height="238"
            rx="26"
            ry="26"
            fill="none"
            stroke="var(--armband-outline)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          <polygon points="0,72 120,72 105,104 0,104" fill="var(--armband-secondary)" />
          <polygon points="0,136 105,136 120,168 0,168" fill="var(--armband-secondary)" />

          <polygon points="400,72 280,72 295,104 400,104" fill="var(--armband-secondary)" />
          <polygon points="400,136 295,136 280,168 400,168" fill="var(--armband-secondary)" />

          <path
              d="M 252 72 A 68 68 0 1 0 252 168"
              fill="none"
              stroke="var(--armband-mark)"
              stroke-width="28"
              stroke-linecap="round"
            />
        </g>
      </svg>
    </span>
  );
}
