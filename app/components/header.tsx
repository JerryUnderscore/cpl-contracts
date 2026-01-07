// app/components/header.tsx
import * as React from "react";
import Link from "next/link";
import ClubMenu from "./club-menu";

type ClubNavItem = {
  slug: string;
  name: string;
  navLabel: string;
  logoFile: string;
};

export default function Header({ clubs }: { clubs: ClubNavItem[] }) {
  return (
    <header className="siteHeader">
      <nav className="siteHeaderNav">
        {/* Logo */}
        <Link href="/" className="siteHeaderLogo" aria-label="CPL Contracts Home">
          {/* Light-mode logo */}
          <img
            src="/brand/logo-light.png"
            alt="CPL Contracts"
            className="siteHeaderLogoImg siteLogoLight"
          />

          {/* Dark-mode logo */}
          <img
            src="/brand/logo-dark.png"
            alt="CPL Contracts"
            className="siteHeaderLogoImg siteLogoDark"
          />
        </Link>

        {/* Desktop club navigation */}
        <div className="clubNavDesktop siteHeaderClubs" aria-label="Club navigation">
          {clubs.map((c) => (
            <Link
              key={c.slug}
              href={`/clubs/${c.slug}`}
              title={c.name}
              className="siteHeaderClubLink"
            >
              <img
                src={`/clubs/${c.logoFile}`}
                alt={`${c.name} logo`}
                className="siteHeaderClubLogo"
                loading="lazy"
              />
              <span>{c.navLabel}</span>
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <div className="clubNavMobile siteHeaderMobile" aria-label="Club menu">
          {/* IMPORTANT:
              Mobile menu theming is controlled inside <ClubMenu />.
              If the menu is still showing light in dark mode, it means ClubMenu
              (or its overlay/panel/buttons) has hard-coded colors.
              Swap those to CSS variables: var(--bg), var(--card), var(--text), var(--border), var(--link), var(--rowHover).
           */}
          <ClubMenu clubs={clubs} />
        </div>
      </nav>
    </header>
  );
}