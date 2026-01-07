// app/components/header.tsx
import * as React from "react";
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
        <a href="/" className="siteHeaderLogo" aria-label="CPL Contracts Home">
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
        </a>

        {/* Desktop club navigation */}
        <div className="clubNavDesktop siteHeaderClubs">
          {clubs.map((c) => (
            <a
              key={c.slug}
              href={`/clubs/${c.slug}`}
              title={c.name}
              className="siteHeaderClubLink"
            >
              <img
                src={`/clubs/${c.logoFile}`}
                alt={`${c.name} logo`}
                className="siteHeaderClubLogo"
              />
              <span>{c.navLabel}</span>
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <div className="clubNavMobile siteHeaderMobile">
          <ClubMenu clubs={clubs} />
        </div>
      </nav>
    </header>
  );
}