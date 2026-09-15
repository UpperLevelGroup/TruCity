import { Link, NavLink } from 'react-router-dom';
import BrandLogo from './BrandLogo';

interface PublicHeaderProps {
  ctaLabel?: string;
  ctaTo?: string;
}

const links = [
  {
    label: 'Guidance Hub',
    to: '/guidance',
  },
  {
    label: 'About',
    to: '/about',
  },
  {
    label: 'Contact',
    to: '/contact',
  },
];

export default function PublicHeader({
  ctaLabel = 'Create Account',
  ctaTo = '/register',
}: PublicHeaderProps) {
  return (
    <header
      className="
        relative
        z-50
        border-b
        border-brand-border
        bg-brand-bg/95
        shadow-[0_4px_18px_rgba(0,70,109,0.04)]
        backdrop-blur-xl
      "
    >
      <div
        className="
          mx-auto
          flex
          h-[88px]
          w-full
          max-w-[1480px]
          items-center
          gap-6
          px-5

          sm:px-8

          lg:px-10
        "
      >
        {/* =================================================
            COMPACT TRUCITY UI LOGO
        ================================================== */}

        <BrandLogo
          compact
          showTagline={false}
          to="/"
        />

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================== */}

        <nav
          aria-label="Public navigation"
          className="
            hidden
            h-full
            flex-1
            items-center
            justify-center
            gap-8

            lg:flex
          "
        >
          {links.map((item) => (
            <PublicNavLink
              key={item.to}
              to={item.to}
              label={item.label}
            />
          ))}
        </nav>

        {/* =================================================
            ACTIONS
        ================================================== */}

        <div
          className="
            ml-auto
            flex
            shrink-0
            items-center
            gap-2.5

            sm:gap-3
          "
        >
          {/* ===============================================
              CREATE ACCOUNT
          ================================================ */}

          <Link
            to={ctaTo}
            className="
              trucity-button
              trucity-button-primary
              hidden
              min-h-[44px]
              px-5
              text-[14px]
              font-bold

              sm:inline-flex
            "
          >
            {ctaLabel}
          </Link>

          {/* ===============================================
              SIGN IN
          ================================================ */}

          <Link
            to="/login"
            className="
              trucity-button
              trucity-button-secondary
              min-h-[44px]
              px-4
              text-[14px]
              font-bold

              sm:px-5
            "
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   PUBLIC NAV LINK
========================================================= */

interface PublicNavLinkProps {
  to: string;
  label: string;
}

function PublicNavLink({
  to,
  label,
}: PublicNavLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        relative
        flex
        h-full
        items-center
        text-[14px]
        no-underline
        transition-colors
        duration-200

        ${
          isActive
            ? `
              font-bold
              text-brand-primary
            `
            : `
              font-medium
              text-brand-textMuted
              hover:text-brand-primary
            `
        }
      `}
    >
      {({ isActive }) => (
        <>
          {label}

          {isActive && (
            <span
              aria-hidden="true"
              className="
                absolute
                bottom-[17px]
                left-1/2
                h-[3px]
                w-8
                -translate-x-1/2
                rounded-full
                bg-brand-gold
              "
            />
          )}
        </>
      )}
    </NavLink>
  );
}