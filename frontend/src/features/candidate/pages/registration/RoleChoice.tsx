import {
  ArrowRight,
  BriefcaseBusiness,
  UserRound,
} from 'lucide-react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

export default function RoleChoice() {
  const navigate = useNavigate();

  const handleCandidate = () => {
    navigate('/register/candidate');
  };

  const handleEmployer = () => {
    navigate('/register/employer');
  };

  return (
    <div
      className="
        relative
        min-h-screen
        min-h-[100dvh]
        overflow-hidden
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
          -right-[125px]
          top-[105px]
          z-[3]
          h-[360px]
          w-[360px]
          rounded-full

          sm:-right-[145px]
          sm:h-[430px]
          sm:w-[430px]

          lg:-right-[170px]
          lg:top-[115px]
          lg:h-[500px]
          lg:w-[500px]
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
            h-[70%]
            w-[70%]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-brand-bg
          "
        />
      </div>

      {/* BOTTOM RIGHT BLUE CIRCLE */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-[190px]
          -right-[160px]
          z-[3]
          hidden
          h-[430px]
          w-[430px]
          rounded-full

          md:block

          lg:-bottom-[220px]
          lg:-right-[180px]
          lg:h-[510px]
          lg:w-[510px]
        "
        style={{
          background:
            'linear-gradient(145deg, #00466D 0%, #00466D 58%, #1E92D2 100%)',
        }}
      />

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header
        className="
          relative
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
            gap-6
            overflow-visible
            px-5

            sm:px-8
            lg:px-10
          "
        >
          {/* =================================================
              LARGE, VISIBLE NAVIGATION LOGO
          ================================================== */}

          <Link
            to="/"
            aria-label="TruCity home"
            className="
              relative
              flex
              h-[88px]
              w-[150px]
              shrink-0
              items-center
              overflow-visible
              no-underline

              sm:w-[170px]
              lg:w-[195px]
            "
          >
            <img
              src="/trucity-nav-logo.png"
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
              items-center
              gap-9

              lg:flex
            "
          >
            {/* HOME */}

            <Link
              to="/"
              className="
                relative
                text-[14px]
                font-bold
                text-brand-primary
                no-underline
                transition-colors
                duration-150

                after:absolute
                after:-bottom-2
                after:left-0
                after:h-[2px]
                after:w-full
                after:rounded-full
                after:bg-brand-gold

                focus-visible:rounded-md
                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-accent/20
              "
            >
              Home
            </Link>

            {/* GUIDANCE HUB */}

            <Link
              to="/guidance"
              className="
                text-[14px]
                font-semibold
                text-brand-textMuted
                no-underline
                transition-colors
                duration-150

                hover:text-brand-primary

                focus-visible:rounded-md
                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-accent/20
              "
            >
              Guidance Hub
            </Link>

            {/* ABOUT */}

            <Link
              to="/about"
              className="
                text-[14px]
                font-semibold
                text-brand-textMuted
                no-underline
                transition-colors
                duration-150

                hover:text-brand-primary

                focus-visible:rounded-md
                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-accent/20
              "
            >
              About
            </Link>

            {/* CONTACT */}

            <Link
              to="/contact"
              className="
                text-[14px]
                font-semibold
                text-brand-textMuted
                no-underline
                transition-colors
                duration-150

                hover:text-brand-primary

                focus-visible:rounded-md
                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-accent/20
              "
            >
              Contact
            </Link>
          </nav>

          {/* =================================================
              SIGN IN
          ================================================== */}

          <Link
            to="/login"
            className="
              inline-flex
              min-h-[46px]
              shrink-0
              items-center
              justify-center
              rounded-[14px]
              border
              border-brand-primary
              bg-brand-bg
              px-5
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

              sm:px-6
            "
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main
        className="
          relative
          z-10
          bg-transparent
        "
      >
        <div
          className="
            mx-auto
            grid
            min-h-[calc(100dvh-88px)]
            w-full
            max-w-[1480px]
            grid-cols-1
            items-center
            gap-8
            px-5
            py-10

            sm:px-8

            lg:grid-cols-12
            lg:px-10
            lg:py-8
          "
        >
          {/* =================================================
              LEFT CONTENT
          ================================================== */}

          <section
            className="
              relative
              z-10
              -translate-y-[38px]

              sm:-translate-y-[48px]

              lg:col-span-7
              lg:-translate-y-[62px]
              lg:pr-6

              xl:-translate-y-[72px]
            "
          >
            <div className="w-full">
              {/* HERO HEADING */}

              <h1
                className="
                  !m-0
                  max-w-[720px]
                  text-[38px]
                  font-bold
                  leading-[1.08]
                  tracking-[-0.035em]
                  !text-brand-primary

                  sm:text-[44px]
                  lg:text-[48px]
                "
              >
                Where verified Professionals,
                <br />

                <span className="text-brand-gold">
                  Meet real Opportunities.
                </span>
              </h1>

              {/* HERO DESCRIPTION */}

              <p
                className="
                  mt-5
                  max-w-[620px]
                  text-[16px]
                  font-normal
                  leading-7
                  text-brand-textMuted
                "
              >
                TruCity connects skilled professionals with
                vetted employers, making job searches simplier,
                safer and more meaningful.
              </p>

              {/* =================================================
                  ROLE OPTIONS
              ================================================== */}

              <div className="mt-8 space-y-4">
                {/* FIND A JOB */}

                <button
                  type="button"
                  onClick={handleCandidate}
                  className="
                    group
                    flex
                    w-full
                    max-w-[580px]
                    items-center
                    gap-4
                    rounded-[18px]
                    border
                    border-brand-border
                    bg-white
                    p-5
                    text-left
                    transition-all
                    duration-200

                    hover:-translate-y-0.5
                    hover:border-brand-accent
                    hover:shadow-[0_12px_28px_rgba(0,70,109,0.09)]

                    focus-visible:outline-none
                    focus-visible:ring-4
                    focus-visible:ring-brand-accent/20
                  "
                >
                  <div
                    className="
                      grid
                      h-14
                      w-14
                      shrink-0
                      place-items-center
                      rounded-[14px]
                      bg-brand-accent/10
                      text-brand-primary
                      transition-colors
                      duration-200

                      group-hover:bg-brand-primary
                      group-hover:text-white
                    "
                  >
                    <UserRound
                      className="h-7 w-7"
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2
                      className="
                        !m-0
                        text-[20px]
                        font-bold
                        text-brand-primary
                      "
                    >
                      Find a Job
                    </h2>

                    <p
                      className="
                        mt-1
                        text-[14px]
                        font-normal
                        leading-6
                        text-brand-textMuted
                      "
                    >
                      Find vetted jobs and build a trusted
                      professional profile.
                    </p>
                  </div>

                  <ArrowRight
                    className="
                      h-6
                      w-6
                      shrink-0
                      text-brand-accent
                      transition-transform
                      duration-200

                      group-hover:translate-x-1
                    "
                    strokeWidth={1.8}
                  />
                </button>

                {/* HIRE TALENT */}

                <button
                  type="button"
                  onClick={handleEmployer}
                  className="
                    group
                    flex
                    w-full
                    max-w-[580px]
                    items-center
                    gap-4
                    rounded-[18px]
                    border
                    border-brand-border
                    bg-white
                    p-5
                    text-left
                    transition-all
                    duration-200

                    hover:-translate-y-0.5
                    hover:border-brand-gold
                    hover:shadow-[0_12px_28px_rgba(255,173,1,0.10)]

                    focus-visible:outline-none
                    focus-visible:ring-4
                    focus-visible:ring-brand-gold/20
                  "
                >
                  <div
                    className="
                      grid
                      h-14
                      w-14
                      shrink-0
                      place-items-center
                      rounded-[14px]
                      bg-brand-orange/40
                      text-brand-primary
                      transition-colors
                      duration-200

                      group-hover:bg-brand-gold
                      group-hover:text-brand-dark
                    "
                  >
                    <BriefcaseBusiness
                      className="h-7 w-7"
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2
                      className="
                        !m-0
                        text-[20px]
                        font-bold
                        text-brand-primary
                      "
                    >
                      Hire Talent
                    </h2>

                    <p
                      className="
                        mt-1
                        text-[14px]
                        font-normal
                        leading-6
                        text-brand-textMuted
                      "
                    >
                      Hire verified professionals and manage
                      credible talent.
                    </p>
                  </div>

                  <ArrowRight
                    className="
                      h-6
                      w-6
                      shrink-0
                      text-brand-gold
                      transition-transform
                      duration-200

                      group-hover:translate-x-1
                    "
                    strokeWidth={1.8}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* =================================================
              DESKTOP / TABLET HERO
          ================================================== */}

          <section
            className="
              relative
              z-10
              hidden
              min-h-[620px]
              items-center
              justify-center

              md:flex
              lg:col-span-5
            "
          >
            <div
              className="
                relative
                flex
                h-[620px]
                w-full
                items-center
                justify-center

                lg:h-[680px]
                xl:h-[720px]
              "
            >
              {/* ORANGE HERO FRAME */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  z-[4]
                  h-[480px]
                  w-[480px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full

                  lg:h-[550px]
                  lg:w-[550px]

                  xl:h-[620px]
                  xl:w-[620px]
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
                    h-[84%]
                    w-[84%]
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-brand-bg
                  "
                />
              </div>

              {/* LARGE HERO IMAGE */}

              <img
                src="/hero-logo.png"
                alt="Two professionals using TruCity"
                draggable={false}
                className="
                  relative
                  z-10
                  block
                  h-auto
                  w-[680px]
                  max-w-none
                  select-none
                  object-contain

                  lg:w-[790px]
                  xl:w-[900px]
                  2xl:w-[980px]
                "
              />
            </div>
          </section>

          {/* =================================================
              MOBILE HERO
          ================================================== */}

          <section
            className="
              relative
              z-10
              flex
              justify-center
              pb-2
              pt-6

              md:hidden
            "
          >
            <div
              className="
                relative
                flex
                h-[390px]
                w-full
                max-w-[440px]
                items-center
                justify-center
              "
            >
              {/* MOBILE ORANGE FRAME */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  z-[4]
                  h-[300px]
                  w-[300px]
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
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
                    h-[84%]
                    w-[84%]
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-brand-bg
                  "
                />
              </div>

              {/* MOBILE HERO IMAGE */}

              <img
                src="/hero-logo.png"
                alt="Two professionals using TruCity"
                draggable={false}
                className="
                  relative
                  z-10
                  block
                  h-auto
                  w-[470px]
                  max-w-none
                  select-none
                  object-contain
                "
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}