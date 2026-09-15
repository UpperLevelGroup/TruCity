import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";

interface AuthShellProps {
  title: string;
  body: ReactNode;
  children: ReactNode;
  wide?: boolean;
}

export default function AuthShell({
  title,
  body,
  children,
  wide = false,
}: AuthShellProps) {
  return (
    <div
      className="min-h-screen flex flex-col bg-[#F8FCFF] overflow-x-hidden relative"
      style={{
        fontFamily:
          "Helvetica, Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* =========================================================
          BACKGROUND
          EXACT SAME PATTERN AS HOME
      ========================================================== */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">

        {/* CITY WATERMARK */}

        <img
          src="/city-watermark.png"
          alt=""
          aria-hidden="true"
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            opacity-[0.12]
            mix-blend-overlay
          "
        />

        {/* TOP LEFT DARK BLUE CIRCLE */}

        <div
          className="
            absolute
            top-[-8%]
            left-[-5%]
            w-[320px]
            h-[320px]
            rounded-full
            bg-[#00273D]
            overflow-hidden

            sm:w-[370px]
            sm:h-[370px]

            lg:w-[430px]
            lg:h-[430px]
          "
        >
          <div
            className="
              absolute
              inset-0
              rounded-full
              border
              border-[#FFAD01]
              translate-x-6
              translate-y-6
              scale-90
            "
          />
        </div>

        {/* TOP RIGHT GOLD RING */}

        <div
          className="
            absolute
            top-[-10%]
            right-[-5%]
            w-[380px]
            h-[380px]
            rounded-full
            border-[65px]
            border-[#FFAD01]
            overflow-hidden

            sm:w-[410px]
            sm:h-[410px]

            lg:w-[495px]
            lg:h-[495px]
          "
        >
          <div
            className="
              absolute
              inset-0
              rounded-full
              border
              border-[#00273D]/40
              -translate-x-8
              -translate-y-8
              scale-110
            "
          />
        </div>

        {/* LARGE GOLD ORGANIC SHAPE */}

        <div
          className="
            absolute
            top-[-5%]
            left-[-10%]
            w-[950px]
            h-[750px]
            rounded-[50%_40%_60%_50%/60%_50%_50%_40%]
            bg-[#FFAD01]
            opacity-75
            blur-[1px]
          "
        />

        {/* LIGHT GOLD BUBBLE */}

        <div
          className="
            absolute
            top-[10%]
            right-[5%]
            w-[320px]
            h-[320px]
            rounded-full
            bg-[#FFD784]
            opacity-40
            blur-2xl
          "
        />

        {/* GOLD BUBBLE */}

        <div
          className="
            absolute
            top-[45%]
            right-[15%]
            w-[200px]
            h-[200px]
            rounded-full
            bg-[#FFAD01]
            opacity-55
            blur-xl
          "
        />

        {/* LOWER LEFT BLUE CIRCLE */}

        <div
          className="
            absolute
            top-[72%]
            left-[10%]
            w-[220px]
            h-[220px]
            rounded-full
            bg-[#1E92D2]
            shadow-xl
            overflow-hidden
          "
        >
          <div
            className="
              absolute
              inset-0
              rounded-full
              border
              border-[#FFAD01]
              -translate-x-6
              -translate-y-6
              scale-95
            "
          />
        </div>

        {/* BOTTOM RIGHT DARK BLUE CIRCLE */}

        <div
          className="
            absolute
            bottom-[-8%]
            right-[-5%]
            w-[340px]
            h-[340px]
            rounded-full
            bg-[#00273D]
            overflow-hidden

            sm:w-[435px]
            sm:h-[435px]

            lg:w-[515px]
            lg:h-[515px]
          "
        >
          <div
            className="
              absolute
              inset-0
              rounded-full
              border
              border-[#FFAD01]
              -translate-x-8
              -translate-y-8
              scale-90
            "
          />
        </div>

        {/* BOTTOM LEFT GOLD CIRCLE */}

        <div
          className="
            absolute
            bottom-[-10%]
            left-[-5%]
            w-[300px]
            h-[300px]
            rounded-full
            bg-[#FFAD01]

            sm:w-[410px]
            sm:h-[410px]

            lg:w-[495px]
            lg:h-[495px]
          "
        />

        {/* BOTTOM FADE */}

        <div
          className="
            absolute
            bottom-0
            left-0
            right-0
            h-[120px]
            bg-gradient-to-t
            from-slate-200/50
            to-transparent
          "
        />
      </div>

      {/* =========================================================
          HEADER
          SAME AS HOME
      ========================================================== */}

      <header
        className="
          relative
          z-20
          px-6
          lg:px-12
          py-4
          bg-white/90
          backdrop-blur-md
          border-b
          border-slate-100
          flex
          items-center
          justify-between
        "
      >
        <Link
          to="/"
          className="
            flex
            items-center
            gap-3
            no-underline
          "
        >
          <img
            src="/Logo TruCity.png"
            alt="TruCity Logo"
            className="
              h-[60px]
              w-auto
              object-contain
            "
          />

          <div className="flex flex-col justify-center">
            <div
              className="
                text-[28px]
                font-[900]
                tracking-tight
                leading-[1.1]
              "
            >
              <span className="text-[#f59e0b]">
                Tru
              </span>

              <span className="text-[#00466D]">
                City
              </span>
            </div>

            <div
              className="
                text-[8.5px]
                font-[800]
                text-[#00466D]
                tracking-[1.2px]
                mt-[2px]
                whitespace-nowrap
              "
            >
              VERIFY • CONNECT • PERSUE
            </div>
          </div>
        </Link>

        <nav
          className="
            hidden
            md:flex
            items-center
            gap-8
            text-[14px]
            font-medium
            text-[#00273D]
          "
        >
          <PublicNavLink
            to="/"
            label="HOME"
            end
          />

          <PublicNavLink
            to="/login"
            label="SIGN IN"
          />

          <PublicNavLink
            to="/register"
            label="GET STARTED"
          />
        </nav>
      </header>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}

      <main
        className="
          relative
          z-10
          flex-1
          flex
          items-center
          justify-center
          px-6
          lg:px-12
          py-12
        "
      >
        <div
          className={`
            w-full
            max-w-[1300px]
            flex
            flex-wrap
            items-center
            justify-between
            gap-12

            ${
              wide
                ? "lg:max-w-[1450px]"
                : ""
            }
          `}
        >

          {/* =====================================================
              LEFT — INTRO
          ====================================================== */}

          <section
            className="
              flex-1
              min-w-[320px]
              max-w-[610px]
              relative
              z-10
            "
          >
            <div className="mb-5">
              <span
                className="
                  inline-block
                  px-6
                  py-2.5
                  rounded-full
                  text-white
                  font-bold
                  text-sm
                  shadow-md
                "
                style={{
                  background:
                    "linear-gradient(135deg, #1E92D2 0%, #00273D 100%)",
                }}
              >
                VERIFY • CONNECT • PERSUE
              </span>
            </div>

            <h1
              className="
                text-4xl
                sm:text-5xl
                lg:text-[58px]
                font-black
                leading-[1.05]
                tracking-tight
                mb-6
              "
              style={{
                color: "#00466D",
              }}
            >
              {title}
            </h1>

            <div
              className="
                text-lg
                sm:text-xl
                font-bold
                leading-relaxed
                max-w-[570px]
              "
              style={{
                color: "#00466D",
              }}
            >
              {body}
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-3">
                <span
                  className="
                    font-black
                    text-lg
                    bg-white/90
                    w-8
                    h-8
                    rounded-full
                    flex
                    items-center
                    justify-center
                    shadow-md
                    text-[#00466D]
                  "
                >
                  ✓
                </span>

                <span className="font-bold text-[#00466D]">
                  Trusted and verified professional network
                </span>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <span
                  className="
                    font-black
                    text-lg
                    bg-white/90
                    w-8
                    h-8
                    rounded-full
                    flex
                    items-center
                    justify-center
                    shadow-md
                    text-[#00466D]
                  "
                >
                  ✓
                </span>

                <span className="font-bold text-[#00466D]">
                  Secure profiles and protected data
                </span>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <span
                  className="
                    font-black
                    text-lg
                    bg-white/90
                    w-8
                    h-8
                    rounded-full
                    flex
                    items-center
                    justify-center
                    shadow-md
                    text-[#00466D]
                  "
                >
                  ✓
                </span>

                <span className="font-bold text-[#00466D]">
                  Built for trusted employers and professionals
                </span>
              </div>
            </div>
          </section>

          {/* =====================================================
              RIGHT — LOGIN CARD
          ====================================================== */}

          <section
            className="
              flex-1
              min-w-[340px]
              flex
              justify-center
              relative
              z-10
            "
          >
            {children}
          </section>
        </div>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================== */}

      <footer
        className="
          relative
          z-10
          bg-white/90
          backdrop-blur-md
          px-6
          lg:px-12
          py-4
          text-center
          text-xs
          font-medium
          border-t
          border-slate-200
          text-slate-500
        "
      >
        <span>TruCity © 2026</span>
        {" • "}

        <a
          href="#"
          className="
            no-underline
            text-slate-500
            hover:text-[#00466D]
          "
        >
          User Agreement
        </a>

        {" • "}

        <a
          href="#"
          className="
            no-underline
            text-slate-500
            hover:text-[#00466D]
          "
        >
          Privacy Policy
        </a>

        {" • "}

        <a
          href="#"
          className="
            no-underline
            text-slate-500
            hover:text-[#00466D]
          "
        >
          Cookie Policy
        </a>
      </footer>
    </div>
  );
}

/* =========================================================
   PUBLIC NAV LINK
========================================================= */

function PublicNavLink({
  to,
  label,
  end = false,
}: {
  to: string;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `
          no-underline
          transition-colors
          ${
            isActive
              ? "border-b-2 border-[#FFAD01] pb-1 text-[#00273D]"
              : "text-[#00273D] hover:text-[#00466D]"
          }
        `
      }
    >
      {label}
    </NavLink>
  );
}
