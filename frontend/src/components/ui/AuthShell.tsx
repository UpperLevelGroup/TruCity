import type { ReactNode } from 'react';

import {
  BookOpenCheck,
  CircleUserRound,
  Home,
  Info,
  LogIn,
  Mail,
  type LucideIcon,
} from 'lucide-react';

import {
  Link,
  NavLink,
} from 'react-router-dom';
import trucityLogo from '../../assets/trucity-logo.png';

interface AuthShellProps {
  title: string;
  body: ReactNode;
  children: ReactNode;
  wide?: boolean;
}

/* =========================================================
   PUBLIC NAVIGATION
========================================================= */

const PUBLIC_NAV_ITEMS = [
  {
    to: '/',
    label: 'Home',
    icon: Home,
    end: true,
  },
  {
    to: '/guidance',
    label: 'Guidance Hub',
    icon: BookOpenCheck,
  },
  {
    to: '/about',
    label: 'About',
    icon: Info,
  },
  {
    to: '/contact',
    label: 'Contact',
    icon: Mail,
  },
] satisfies Array<{
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}>;

/* =========================================================
   AUTH SHELL
========================================================= */

export default function AuthShell({
  title,
  body,
  children,
  wide = false,
}: AuthShellProps) {
  return (
    <div
      className="
        relative
        min-h-screen
        min-h-[100dvh]
        overflow-x-hidden
        bg-transparent
        font-sans
        text-brand-text
      "
    >
      {/* =====================================================
          DECORATIVE BRAND SHAPES
      ====================================================== */}

      {/* TOP RIGHT ORANGE RING */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-[150px]
          top-[150px]
          z-[2]
          hidden
          h-[390px]
          w-[390px]
          rounded-full

          md:block

          lg:-right-[180px]
          lg:h-[470px]
          lg:w-[470px]
        "
        style={{
          background:
            'linear-gradient(135deg, #FFAD01 0%, #FFD784 100%)',
        }}
      >
        <div
          className="
            absolute
            left-1/2
            top-1/2
            h-[72%]
            w-[72%]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-brand-bg
          "
        />
      </div>

      {/* BOTTOM LEFT BLUE CIRCLE */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-[240px]
          -left-[190px]
          z-[2]
          hidden
          h-[470px]
          w-[470px]
          rounded-full

          lg:block
        "
        style={{
          background:
            'linear-gradient(145deg, #00466D 0%, #00466D 58%, #1E92D2 100%)',
        }}
      />

      {/* =====================================================
          PUBLIC NAVBAR
      ====================================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          overflow-visible
          border-b
          border-brand-border
          bg-brand-bg/95
          backdrop-blur-md
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
            justify-between
            gap-4
            overflow-visible
            px-5

            sm:px-8
            lg:gap-6
            lg:px-10
          "
        >
          {/* =================================================
              TRUCITY NAV LOGO
          ================================================== */}

          <Link
            to="/"
            aria-label="TruCity home"
            className="
              relative
              flex
              h-[88px]
              w-[130px]
              shrink-0
              items-center
              overflow-visible
              no-underline

              sm:w-[160px]
              lg:w-[195px]
            "
          >
            <img
              src={trucityLogo}
              alt="TruCity"
              draggable={false}
              className="
                absolute
                left-[-22px]
                top-1/2
                block
                h-auto
                w-[145px]
                max-w-none
                -translate-y-1/2
                select-none
                object-contain

                sm:left-[-26px]
                sm:w-[165px]

                lg:left-[-30px]
                lg:w-[190px]
              "
            />
          </Link>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================== */}

          <nav
            aria-label="Public navigation"
            className="
              hidden
              h-full
              items-center
              gap-6

              lg:flex
            "
          >
            {PUBLIC_NAV_ITEMS.map((item) => (
              <PublicNavLink
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                end={item.end}
              />
            ))}
          </nav>

          {/* =================================================
              TABLET / MOBILE NAVIGATION
          ================================================== */}

          <nav
            aria-label="Public mobile navigation"
            className="
              flex
              min-w-0
              flex-1
              items-center
              justify-end
              gap-1

              lg:hidden
            "
          >
            {PUBLIC_NAV_ITEMS.map((item) => (
              <MobilePublicNavLink
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                end={item.end}
              />
            ))}
          </nav>

          {/* =================================================
              SIGN IN
          ================================================== */}

          <Link
            to="/login"
            aria-label="Sign in"
            className="
              inline-flex
              min-h-[46px]
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-[14px]
              border
              border-brand-primary
              bg-brand-bg
              px-3
              text-[14px]
              font-bold
              text-brand-primary
              no-underline
              transition-all
              duration-200

              hover:bg-brand-primary
              hover:text-white

              focus-visible:outline-none
              focus-visible:ring-4
              focus-visible:ring-brand-accent/25

              sm:px-5
              lg:px-6
            "
          >
            <LogIn
              className="
                h-[18px]
                w-[18px]
                shrink-0
              "
              strokeWidth={2}
            />

            <span className="hidden sm:inline">
              Sign In
            </span>
          </Link>
        </div>
      </header>

      {/* =====================================================
          AUTH CONTENT
      ====================================================== */}

      <main
        className="
          relative
          z-10
          bg-transparent
        "
      >
        <div
          className={`
            mx-auto
            grid
            min-h-[calc(100dvh-88px)]
            w-full
            items-center
            gap-10
            px-5
            py-10

            sm:px-8
            lg:px-10
            lg:py-14

            ${
              wide
                ? 'max-w-[1480px] lg:grid-cols-[0.9fr_1.1fr]'
                : 'max-w-[1320px] lg:grid-cols-[0.85fr_1.15fr]'
            }
          `}
        >
          {/* =================================================
              LEFT BRAND / INTRO CONTENT
          ================================================== */}

          <section
            className="
              relative
              z-10
              mx-auto
              w-full
              max-w-[590px]

              lg:mx-0
              lg:pr-8
            "
          >
            <div
              className="
                mb-4
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-brand-accent/20
                bg-brand-accent/10
                px-3
                py-1.5
                text-[12px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-brand-primary
              "
            >
              <CircleUserRound
                className="
                  h-[15px]
                  w-[15px]
                  text-brand-accent
                "
                strokeWidth={2}
              />

              TruCity Account
            </div>

            <h1
              className="
                !m-0
                text-[36px]
                font-bold
                leading-[1.08]
                tracking-[-0.035em]
                !text-brand-primary

                sm:text-[42px]
                lg:text-[48px]
              "
            >
              {title}
            </h1>

            <div
              className="
                mt-6
                max-w-[540px]
                text-[16px]
                font-normal
                leading-7
                text-brand-textMuted
              "
            >
              {body}
            </div>

            <div
              className="
                mt-8
                flex
                items-center
                gap-3
              "
            >
              <div
                aria-hidden="true"
                className="
                  h-[2px]
                  w-10
                  rounded-full
                  bg-brand-gold
                "
              />

              <p
                className="
                  text-[12px]
                  font-bold
                  uppercase
                  tracking-[0.13em]
                  text-brand-primary
                "
              >
                Verify • Connect • Pursue
              </p>
            </div>
          </section>

          {/* =================================================
              FORM / CHILD CONTENT
          ================================================== */}

          <section
            className="
              relative
              z-10
              flex
              w-full
              justify-center

              lg:justify-end
            "
          >
            {children}
          </section>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   PUBLIC DESKTOP NAV LINK
========================================================= */

function PublicNavLink({
  to,
  label,
  icon: Icon,
  end = false,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      className={({ isActive }) => `
        group
        relative
        flex
        h-full
        items-center
        gap-2
        text-[14px]
        no-underline
        transition-colors
        duration-150

        ${
          isActive
            ? `
              font-bold
              text-brand-primary

              after:absolute
              after:bottom-[20px]
              after:left-0
              after:h-[2px]
              after:w-full
              after:rounded-full
              after:bg-brand-gold
            `
            : `
              font-semibold
              text-brand-textMuted

              hover:text-brand-primary
            `
        }

        focus-visible:rounded-md
        focus-visible:outline-none
        focus-visible:ring-4
        focus-visible:ring-brand-accent/20
      `}
    >
      <span
        className="
          grid
          h-[30px]
          w-[30px]
          shrink-0
          place-items-center
          rounded-[9px]
          bg-brand-accent/10
          text-brand-primary
          transition-all
          duration-150

          group-hover:bg-brand-primary
          group-hover:text-white
        "
      >
        <Icon
          className="
            h-[17px]
            w-[17px]
          "
          strokeWidth={2}
        />
      </span>

      <span>
        {label}
      </span>
    </NavLink>
  );
}

/* =========================================================
   PUBLIC MOBILE NAV LINK
========================================================= */

function MobilePublicNavLink({
  to,
  label,
  icon: Icon,
  end = false,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      title={label}
      className={({ isActive }) => `
        group
        relative
        flex
        shrink-0
        items-center
        justify-center
        rounded-[12px]
        p-2
        no-underline
        transition-all
        duration-150

        ${
          isActive
            ? `
              bg-brand-primary
              text-white
            `
            : `
              text-brand-textMuted

              hover:bg-brand-accent/10
              hover:text-brand-primary
            `
        }

        focus-visible:outline-none
        focus-visible:ring-4
        focus-visible:ring-brand-accent/20
      `}
    >
      <Icon
        className="
          h-[19px]
          w-[19px]
        "
        strokeWidth={2}
      />
    </NavLink>
  );
}