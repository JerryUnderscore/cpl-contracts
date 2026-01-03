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
    <>
      <header className="siteHeader">
        <nav className="siteHeaderNav">
          {/* Logo */}
          <a href="/" className="siteHeaderLogo">
            <img src="/logo.png" alt="CPL Contracts" className="siteHeaderLogoImg" />
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

      <style>{`
        .siteHeader {
          position: sticky;
          top: 0;
          z-index: 20;
          border-bottom: 1px solid var(--border);

          /* Critical for iOS Safari: allow the menu/panel to extend outside header */
          overflow: visible;

          /* Make the header its own stacking context without using transform/filter
             (transform/filter can break fixed/overlay behavior in iOS) */
          isolation: isolate;
          background: transparent;
        }

        /* Put the blur/tint on a background layer, NOT on the sticky element itself */
        .siteHeader::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.88);
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
          pointer-events: none;
          z-index: -1;
        }

        .siteHeaderNav {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0.95rem 1.25rem; /* more breathing room */
          display: flex;
          align-items: center;
          gap: 1.1rem;
        }

        .siteHeaderLogo {
          display: inline-flex;
          align-items: center;
          flex: 0 0 auto;
        }

        .siteHeaderLogoImg {
          height: 38px; /* slightly smaller logo */
          width: auto;
          display: block;
        }

        .siteHeaderClubs {
          margin-left: auto;
          display: flex;
          gap: 1.05rem;
          flex-wrap: nowrap;
          align-items: center;
          justify-content: flex-end;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          white-space: nowrap;
          max-width: 100%;
          padding: 0.15rem 0;
        }

        .siteHeaderClubLink {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-weight: 600;
          color: #1d4ed8;
          white-space: nowrap;
          flex: 0 0 auto;
          padding: 0.25rem 0.25rem;
          border-radius: 10px;
        }

        .siteHeaderClubLogo {
          height: 18px;
          width: 18px;
          object-fit: contain;
          display: block;
        }

        .siteHeaderMobile {
          margin-left: auto;
        }
      `}</style>
    </>
  );
}