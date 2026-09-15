import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleCheck,
  Eye,
  FileCheck2,
  FileText,
  Image,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
  Video,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

import {
  Link,
  NavLink,
  useNavigate,
} from 'react-router-dom';

/* =========================================================
   TYPES
========================================================= */

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface JourneyStep {
  number: string;
  title: string;
  description: string;
}

interface PlatformFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  candidate: boolean;
  employer: boolean;
}

/* =========================================================
   DATA
========================================================= */

const PLATFORM_FEATURES: PlatformFeature[] = [
  {
    icon: UserRound,
    title: 'Professional Profiles',
    description:
      'Candidates can build a professional identity that goes beyond a traditional CV and grows with their career.',
    candidate: true,
    employer: true,
  },
  {
    icon: BadgeCheck,
    title: 'Verification',
    description:
      'Verification signals help create greater confidence around the people and organisations using the platform.',
    candidate: true,
    employer: true,
  },
  {
    icon: FileText,
    title: 'CV Builder',
    description:
      'Candidates can create and maintain a structured professional CV as part of their TruCity presence.',
    candidate: true,
    employer: false,
  },
  {
    icon: Image,
    title: 'Professional Gallery',
    description:
      'Candidates can present professional images, projects, certificates and other supporting career material.',
    candidate: true,
    employer: true,
  },
  {
    icon: Video,
    title: 'Intro Reel',
    description:
      'A professional introduction gives candidates another way to communicate who they are beyond written information.',
    candidate: true,
    employer: true,
  },
  {
    icon: Building2,
    title: 'Vetted Employers',
    description:
      'TruCity is designed to create a more credible environment for candidates exploring companies and opportunities.',
    candidate: true,
    employer: false,
  },
  {
    icon: Search,
    title: 'Opportunity Discovery',
    description:
      'Candidates can browse companies and open roles while employers can connect opportunities with suitable professionals.',
    candidate: true,
    employer: true,
  },
  {
    icon: MessageSquare,
    title: 'Direct Communication',
    description:
      'Candidates and employers can continue professional conversations without separating the hiring journey across multiple tools.',
    candidate: true,
    employer: true,
  },
  {
    icon: Bell,
    title: 'Application & Interview Updates',
    description:
      'Important application activity, messages and interview communication can remain connected to the candidate experience.',
    candidate: true,
    employer: true,
  },
];

const CANDIDATE_FEATURES: Feature[] = [
  {
    icon: BadgeCheck,
    title: 'Build credibility before you need it',
    description:
      'Create a professional presence now instead of rebuilding your career story from scratch every time you need a new opportunity.',
  },
  {
    icon: Eye,
    title: 'Show more than a CV',
    description:
      'Experience, projects, professional media and supporting information can give employers more context about your value.',
  },
  {
    icon: Building2,
    title: 'Explore vetted employers',
    description:
      'Discover companies and opportunities in an environment designed around safer, more credible professional connections.',
  },
  {
    icon: FileCheck2,
    title: 'Apply using your profile',
    description:
      'Express interest in an open role using the TruCity professional profile you have already built.',
  },
  {
    icon: MessageSquare,
    title: 'Message employers',
    description:
      'Continue professional conversations with employers and optionally share your CV when appropriate.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Keep your career in one place',
    description:
      'Your profile, CV, opportunities, applications, messages and professional development can become part of one connected journey.',
  },
];

const EMPLOYER_FEATURES: Feature[] = [
  {
    icon: UsersRound,
    title: 'Discover professionals',
    description:
      'Explore candidates who are investing in richer professional profiles rather than relying on a CV alone.',
  },
  {
    icon: Eye,
    title: 'See more before the interview',
    description:
      'Use professional information, experience and supporting profile content to build a stronger first impression.',
  },
  {
    icon: ShieldCheck,
    title: 'Reduce early-stage uncertainty',
    description:
      'Verification signals and clearer professional information can support more informed screening decisions.',
  },
  {
    icon: FileCheck2,
    title: 'Receive profile-led applications',
    description:
      'When candidates express interest in a role, employers can review the professional profile connected to that candidate.',
  },
  {
    icon: MessageSquare,
    title: 'Communicate directly',
    description:
      'Move from discovery to professional conversation without disconnecting the candidate from the hiring journey.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Build a credible employer presence',
    description:
      'Present your organisation as a professional participant in a platform built around greater trust on both sides.',
  },
];

const CANDIDATE_STEPS: JourneyStep[] = [
  {
    number: '01',
    title: 'Create your profile',
    description:
      'Add your professional identity, experience and career information.',
  },
  {
    number: '02',
    title: 'Build credibility',
    description:
      'Complete your profile and use available verification features to strengthen it.',
  },
  {
    number: '03',
    title: 'Tell a fuller story',
    description:
      'Add your CV, projects, professional gallery and introduction.',
  },
  {
    number: '04',
    title: 'Discover',
    description:
      'Explore vetted employers and open opportunities.',
  },
  {
    number: '05',
    title: 'Apply',
    description:
      'Express interest using the professional profile you have already built.',
  },
  {
    number: '06',
    title: 'Connect',
    description:
      'Continue through messaging and interview communication when opportunities progress.',
  },
];

/* =========================================================
   COMPONENT
========================================================= */

export default function PublicGuidanceHub() {
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
        min-h-screen
        min-h-[100dvh]
        bg-brand-bg
        font-sans
        text-brand-text
      "
    >
      {/* =====================================================
          HEADER — SAME AS ROLECHOICE
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
            gap-6
            overflow-visible
            px-5

            sm:px-8
            lg:px-10
          "
        >
          {/* =================================================
              LARGE VISIBLE TRUCITY NAV LOGO
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
            <NavLink
              to="/"
              end
              className={({ isActive }) => `
                relative
                text-[14px]
                font-semibold
                no-underline
                transition-colors
                duration-150

                ${
                  isActive
                    ? `
                      font-bold
                      text-brand-primary

                      after:absolute
                      after:-bottom-2
                      after:left-0
                      after:h-[2px]
                      after:w-full
                      after:rounded-full
                      after:bg-brand-gold
                    `
                    : `
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
              Home
            </NavLink>

            <NavLink
              to="/guidance"
              className={({ isActive }) => `
                relative
                text-[14px]
                font-semibold
                no-underline
                transition-colors
                duration-150

                ${
                  isActive
                    ? `
                      font-bold
                      text-brand-primary

                      after:absolute
                      after:-bottom-2
                      after:left-0
                      after:h-[2px]
                      after:w-full
                      after:rounded-full
                      after:bg-brand-gold
                    `
                    : `
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
              Guidance Hub
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) => `
                relative
                text-[14px]
                font-semibold
                no-underline
                transition-colors
                duration-150

                ${
                  isActive
                    ? `
                      font-bold
                      text-brand-primary

                      after:absolute
                      after:-bottom-2
                      after:left-0
                      after:h-[2px]
                      after:w-full
                      after:rounded-full
                      after:bg-brand-gold
                    `
                    : `
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
              About
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) => `
                relative
                text-[14px]
                font-semibold
                no-underline
                transition-colors
                duration-150

                ${
                  isActive
                    ? `
                      font-bold
                      text-brand-primary

                      after:absolute
                      after:-bottom-2
                      after:left-0
                      after:h-[2px]
                      after:w-full
                      after:rounded-full
                      after:bg-brand-gold
                    `
                    : `
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
              Contact
            </NavLink>
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

      <main>
        {/* ===================================================
            HERO
        ==================================================== */}

        <section className="relative overflow-hidden bg-white">
          {/* ORANGE RING */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -right-[220px]
              -top-[180px]
              hidden
              h-[600px]
              w-[600px]
              rounded-full

              lg:block
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
                h-[76%]
                w-[76%]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-white
              "
            />
          </div>

          {/* BLUE CIRCLE */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              -bottom-[150px]
              right-[25%]
              hidden
              h-[280px]
              w-[280px]
              rounded-full

              lg:block
            "
            style={{
              background:
                'linear-gradient(145deg, #00466D 0%, #00466D 58%, #1E92D2 100%)',
            }}
          />

          <div
            className="
              relative
              z-10
              mx-auto
              grid
              min-h-[650px]
              max-w-[1280px]
              items-center
              gap-12
              px-5
              py-16

              sm:px-8

              lg:grid-cols-[1.05fr_0.95fr]
              lg:px-10
              lg:py-20
            "
          >
            {/* =================================================
                HERO COPY
            ================================================== */}

            <div>
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-brand-border
                  bg-brand-bg
                  px-4
                  py-2
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-brand-primary
                "
              >
                <Sparkles
                  className="h-4 w-4 text-brand-gold"
                />

                TruCity Guidance Hub
              </div>

              <h1
                className="
                  !m-0
                  mt-5
                  max-w-[720px]
                  text-[40px]
                  font-bold
                  leading-[1.03]
                  tracking-[-0.045em]
                  !text-brand-primary

                  sm:text-[48px]
                "
              >
                Understand what TruCity can
                do for your career or your
                business.
              </h1>

              <p
                className="
                  mt-5
                  max-w-[680px]
                  text-[16px]
                  font-normal
                  leading-7
                  text-brand-textMuted
                "
              >
                TruCity is a professional
                recruitment platform built to
                make job searching and hiring
                more credible, more informative
                and more connected.
              </p>

              <p
                className="
                  mt-4
                  max-w-[680px]
                  text-[16px]
                  font-semibold
                  leading-7
                  text-brand-primary
                "
              >
                Instead of reducing a person to
                a CV and an employer to a job
                advert, TruCity gives both sides
                more information before they
                decide to connect.
              </p>

              <div
                className="
                  mt-8
                  flex
                  flex-col
                  gap-3

                  sm:flex-row
                "
              >
                <button
                  type="button"
                  onClick={handleCandidate}
                  className="
                    inline-flex
                    min-h-[50px]
                    items-center
                    justify-center
                    gap-2
                    rounded-[14px]
                    px-6
                    text-[14px]
                    font-bold
                    text-white
                    shadow-[0_12px_26px_rgba(0,70,109,0.16)]
                    transition
                    duration-200

                    hover:opacity-95

                    focus-visible:outline-none
                    focus-visible:ring-4
                    focus-visible:ring-brand-accent/20
                  "
                  style={{
                    background:
                      'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)',
                  }}
                >
                  Explore as a Candidate

                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleEmployer}
                  className="
                    inline-flex
                    min-h-[50px]
                    items-center
                    justify-center
                    gap-2
                    rounded-[14px]
                    border
                    border-brand-primary
                    bg-white
                    px-6
                    text-[14px]
                    font-bold
                    text-brand-primary
                    transition
                    duration-200

                    hover:bg-brand-bg

                    focus-visible:outline-none
                    focus-visible:ring-4
                    focus-visible:ring-brand-accent/20
                  "
                >
                  Explore as an Employer

                  <BriefcaseBusiness className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                <TrustPoint text="Professional profiles" />
                <TrustPoint text="Verification" />
                <TrustPoint text="Vetted employers" />
                <TrustPoint text="Connected hiring" />
              </div>
            </div>

            {/* =================================================
                PRODUCT PREVIEW
            ================================================== */}

            <div className="mx-auto w-full max-w-[480px]">
              <div
                className="
                  rounded-[32px]
                  border
                  border-brand-border
                  bg-brand-bg
                  p-5
                  shadow-[0_25px_60px_rgba(0,70,109,0.12)]

                  sm:p-6
                "
              >
                <div className="rounded-[26px] bg-white p-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        grid
                        h-14
                        w-14
                        shrink-0
                        place-items-center
                        rounded-full
                        bg-brand-primary
                        text-white
                      "
                    >
                      <UserRound className="h-6 w-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-bold text-brand-primary">
                          TruCity Professional Profile
                        </p>

                        <BadgeCheck className="h-4 w-4 text-brand-accent" />
                      </div>

                      <p className="mt-1 text-[10px] text-brand-textMuted">
                        More than a traditional CV
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <MiniStat
                      value="Profile"
                      label="Identity"
                    />

                    <MiniStat
                      value="Career"
                      label="Experience"
                    />

                    <MiniStat
                      value="Media"
                      label="Portfolio"
                    />
                  </div>

                  <div className="mt-5 space-y-2">
                    <ProfileFeature
                      icon={BadgeCheck}
                      title="Professional identity"
                      status="Verified"
                    />

                    <ProfileFeature
                      icon={FileText}
                      title="CV & experience"
                      status="Added"
                    />

                    <ProfileFeature
                      icon={Image}
                      title="Professional gallery"
                      status="Ready"
                    />

                    <ProfileFeature
                      icon={Video}
                      title="Intro reel"
                      status="Added"
                    />

                    <ProfileFeature
                      icon={BriefcaseBusiness}
                      title="Projects"
                      status="Visible"
                    />
                  </div>

                  <div
                    className="
                      mt-5
                      rounded-[18px]
                      bg-brand-primary
                      p-4
                      text-white
                    "
                  >
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-white/70
                      "
                    >
                      One professional presence
                    </p>

                    <p className="mt-2 text-[14px] font-bold leading-5">
                      Build your profile before
                      the right opportunity
                      arrives.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            SIMPLE EXPLANATION
        ==================================================== */}

        <section
          className="
            border-y
            border-brand-border
            bg-brand-primary
          "
        >
          <div
            className="
              mx-auto
              max-w-[1100px]
              px-5
              py-14
              text-center

              sm:px-8
              lg:px-10
            "
          >
            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-brand-orange
              "
            >
              The simple version
            </p>

            <h2
              className="
                !m-0
                mx-auto
                mt-3
                max-w-[900px]
                text-[28px]
                font-bold
                leading-[1.2]
                tracking-[-0.03em]
                !text-white

                sm:text-[36px]
              "
            >
              Candidates get a stronger way to
              present themselves. Employers get
              a stronger way to understand who
              they&apos;re considering.
            </h2>

            <p
              className="
                mx-auto
                mt-5
                max-w-[740px]
                text-[14px]
                leading-6
                text-white/75
              "
            >
              TruCity connects those two
              experiences so that discovery,
              applications, professional
              information and communication
              don&apos;t have to feel like
              disconnected steps.
            </p>
          </div>
        </section>

        {/* ===================================================
            WHAT TRUCITY OFFERS
        ==================================================== */}

        <section
          className="
            mx-auto
            max-w-[1220px]
            px-5
            py-16

            sm:px-8

            lg:px-10
            lg:py-20
          "
        >
          <SectionTitle
            eyebrow="Inside TruCity"
            title="What does the platform actually offer?"
            description="TruCity brings together the tools and professional information that matter before, during and after an application."
          />

          <div
            className="
              mt-10
              grid
              gap-4

              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {PLATFORM_FEATURES.map((feature) => (
              <PlatformFeatureCard
                key={feature.title}
                {...feature}
              />
            ))}
          </div>
        </section>

        {/* ===================================================
            CANDIDATES
        ==================================================== */}

        <section
          className="
            border-y
            border-brand-border
            bg-white
          "
        >
          <div
            className="
              mx-auto
              max-w-[1220px]
              px-5
              py-16

              sm:px-8

              lg:px-10
              lg:py-20
            "
          >
            <SectionTitle
              eyebrow="If you're a professional"
              title="Your career should not disappear inside a PDF."
              description="A CV is important, but it cannot always communicate the full professional behind it. TruCity gives you more ways to build and present that story."
            />

            <div
              className="
                mt-10
                grid
                gap-4

                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {CANDIDATE_FEATURES.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  {...feature}
                />
              ))}
            </div>

            <div className="mt-9 flex justify-center">
              <button
                type="button"
                onClick={handleCandidate}
                className="
                  group
                  inline-flex
                  min-h-[48px]
                  items-center
                  justify-center
                  gap-2
                  rounded-[14px]
                  px-6
                  text-[14px]
                  font-bold
                  text-white
                  transition
                  duration-200

                  hover:opacity-95
                "
                style={{
                  background:
                    'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)',
                }}
              >
                Build Your Professional Profile

                <ArrowRight
                  className="
                    h-4
                    w-4
                    transition-transform
                    group-hover:translate-x-1
                  "
                />
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================
            CANDIDATE JOURNEY
        ==================================================== */}

        <section
          className="
            mx-auto
            max-w-[1220px]
            px-5
            py-16

            sm:px-8

            lg:px-10
            lg:py-20
          "
        >
          <SectionTitle
            eyebrow="How it works"
            title="From creating your profile to connecting with an employer."
            description="TruCity is designed to support more of the professional journey than simply finding a job advert."
          />

          <div
            className="
              mt-10
              grid
              gap-4

              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            {CANDIDATE_STEPS.map((step) => (
              <JourneyStepCard
                key={step.number}
                {...step}
              />
            ))}
          </div>
        </section>

        {/* ===================================================
            WHAT YOU COULD BE MISSING
        ==================================================== */}

        <section
          className="
            border-y
            border-brand-border
            bg-brand-primary
          "
        >
          <div
            className="
              mx-auto
              max-w-[1180px]
              px-5
              py-16

              sm:px-8

              lg:px-10
              lg:py-20
            "
          >
            <div className="text-center">
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-brand-orange
                "
              >
                What could you be missing?
              </p>

              <h2
                className="
                  !m-0
                  mx-auto
                  mt-3
                  max-w-[850px]
                  text-[30px]
                  font-bold
                  leading-[1.15]
                  tracking-[-0.035em]
                  !text-white

                  sm:text-[38px]
                "
              >
                The opportunity isn&apos;t only
                the job. It&apos;s being ready
                when the right one appears.
              </h2>

              <p
                className="
                  mx-auto
                  mt-4
                  max-w-[720px]
                  text-[14px]
                  leading-6
                  text-white/70
                "
              >
                If your professional presence
                only exists when you urgently
                need work, you may be rebuilding
                it at exactly the moment you
                need it most.
              </p>
            </div>

            <div
              className="
                mt-10
                grid
                gap-4

                md:grid-cols-3
              "
            >
              <MissingCard
                number="01"
                title="Being discoverable"
                description="A completed professional presence gives you something meaningful to build on when opportunities appear."
              />

              <MissingCard
                number="02"
                title="Showing the full picture"
                description="A CV may list what you have done. Projects, professional media and richer profile information can add valuable context."
              />

              <MissingCard
                number="03"
                title="Building credibility early"
                description="Professional trust is easier to build deliberately than at the last minute before an application."
              />
            </div>

            <div className="mt-9 text-center">
              <button
                type="button"
                onClick={handleCandidate}
                className="
                  inline-flex
                  min-h-[50px]
                  items-center
                  justify-center
                  gap-2
                  rounded-[14px]
                  px-6
                  text-[14px]
                  font-bold
                  text-brand-dark
                  transition
                  duration-200

                  hover:opacity-90
                "
                style={{
                  background:
                    'linear-gradient(135deg, #FFAD01 0%, #FFD784 100%)',
                }}
              >
                Start Before You Need It

                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================
            EMPLOYERS
        ==================================================== */}

        <section
          className="
            mx-auto
            max-w-[1220px]
            px-5
            py-16

            sm:px-8

            lg:px-10
            lg:py-20
          "
        >
          <div
            className="
              grid
              gap-10

              lg:grid-cols-[0.7fr_1.3fr]
              lg:items-start
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-brand-accent
                "
              >
                If you&apos;re an employer
              </p>

              <h2
                className="
                  !m-0
                  mt-3
                  text-[30px]
                  font-bold
                  leading-[1.15]
                  tracking-[-0.035em]
                  !text-brand-primary
                "
              >
                Hiring should begin with more
                context, not more guesswork.
              </h2>

              <p
                className="
                  mt-4
                  text-[14px]
                  leading-6
                  text-brand-textMuted
                "
              >
                Traditional recruitment often
                asks employers to make early
                decisions from limited candidate
                information. TruCity is designed
                to provide a more informative
                starting point.
              </p>

              <p
                className="
                  mt-4
                  text-[14px]
                  font-semibold
                  leading-6
                  text-brand-primary
                "
              >
                Credibility works both ways:
                candidates also want confidence
                in the organisations they engage
                with.
              </p>

              <button
                type="button"
                onClick={handleEmployer}
                className="
                  mt-6
                  inline-flex
                  min-h-[48px]
                  items-center
                  justify-center
                  gap-2
                  rounded-[14px]
                  px-6
                  text-[14px]
                  font-bold
                  text-white
                  transition
                  duration-200

                  hover:opacity-95
                "
                style={{
                  background:
                    'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)',
                }}
              >
                Join as an Employer

                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div
              className="
                grid
                gap-4

                sm:grid-cols-2
              "
            >
              {EMPLOYER_FEATURES.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  {...feature}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================
            WHY WE ARE DIFFERENT
        ==================================================== */}

        <section
          className="
            border-y
            border-brand-border
            bg-white
          "
        >
          <div
            className="
              mx-auto
              max-w-[1080px]
              px-5
              py-16

              sm:px-8

              lg:px-10
              lg:py-20
            "
          >
            <SectionTitle
              eyebrow="Why we're different"
              title="From a job application to a professional ecosystem."
              description="TruCity is not designed to replace the CV. It is designed to give the CV and the person behind it more context."
            />

            <div
              className="
                mt-10
                overflow-x-auto
                rounded-[28px]
                border
                border-brand-border
              "
            >
              <div className="min-w-[650px]">
                <div
                  className="
                    grid
                    grid-cols-[1fr_0.8fr_0.8fr]
                    bg-brand-primary
                    px-5
                    py-4
                    text-[12px]
                    font-bold
                    text-white

                    sm:px-7
                  "
                >
                  <span>Experience</span>

                  <span className="text-center">
                    Traditional approach
                  </span>

                  <span className="text-center">
                    TruCity
                  </span>
                </div>

                <ComparisonRow
                  label="Professional identity"
                  traditional="Mostly CV-based"
                  trucity="Profile-led"
                />

                <ComparisonRow
                  label="Verification signals"
                  traditional="Often separate"
                  trucity="Connected"
                />

                <ComparisonRow
                  label="Professional media"
                  traditional="Limited"
                  trucity="Supported"
                />

                <ComparisonRow
                  label="Employer environment"
                  traditional="Varies"
                  trucity="Vetted"
                />

                <ComparisonRow
                  label="Applications"
                  traditional="Repeated information"
                  trucity="Existing profile"
                />

                <ComparisonRow
                  label="Communication"
                  traditional="Often fragmented"
                  trucity="Connected"
                />

                <ComparisonRow
                  label="Career presence"
                  traditional="Built when needed"
                  trucity="Developed over time"
                  last
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   TRUST POINT
========================================================= */

function TrustPoint({
  text,
}: {
  text: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        text-[12px]
        font-semibold
        text-brand-textMuted
      "
    >
      <CircleCheck className="h-4 w-4 text-brand-accent" />

      {text}
    </div>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div
      className="
        rounded-[14px]
        bg-brand-bg
        px-2
        py-3
        text-center
      "
    >
      <p className="text-[10px] font-bold text-brand-primary">
        {value}
      </p>

      <p className="mt-0.5 text-[8px] text-brand-textMuted">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   PROFILE FEATURE
========================================================= */

function ProfileFeature({
  icon: Icon,
  title,
  status,
}: {
  icon: LucideIcon;
  title: string;
  status: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        rounded-[14px]
        border
        border-brand-border
        px-4
        py-3
      "
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="
            grid
            h-8
            w-8
            shrink-0
            place-items-center
            rounded-full
            bg-brand-bg
            text-brand-primary
          "
        >
          <Icon className="h-4 w-4" />
        </div>

        <span
          className="
            truncate
            text-[11px]
            font-semibold
            text-brand-primary
          "
        >
          {title}
        </span>
      </div>

      <span
        className="
          flex
          shrink-0
          items-center
          gap-1
          text-[9px]
          font-bold
          text-brand-primary
        "
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-brand-emerald" />

        {status}
      </span>
    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-[780px] text-center">
      <p
        className="
          text-[10px]
          font-bold
          uppercase
          tracking-[0.16em]
          text-brand-accent
        "
      >
        {eyebrow}
      </p>

      <h2
        className="
          !m-0
          mt-2
          text-[30px]
          font-bold
          leading-[1.15]
          tracking-[-0.035em]
          !text-brand-primary
        "
      >
        {title}
      </h2>

      <p
        className="
          mx-auto
          mt-3
          max-w-[700px]
          text-[14px]
          leading-6
          text-brand-textMuted
        "
      >
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   PLATFORM FEATURE
========================================================= */

function PlatformFeatureCard({
  icon: Icon,
  title,
  description,
  candidate,
  employer,
}: PlatformFeature) {
  return (
    <article
      className="
        rounded-[24px]
        border
        border-brand-border
        bg-white
        p-5
        shadow-[0_8px_24px_rgba(0,70,109,0.05)]
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className="
            grid
            h-11
            w-11
            place-items-center
            rounded-full
            bg-brand-bg
            text-brand-primary
          "
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex flex-wrap justify-end gap-1.5">
          {candidate && (
            <span
              className="
                rounded-full
                bg-brand-accent/10
                px-2.5
                py-1
                text-[8px]
                font-bold
                uppercase
                tracking-[0.08em]
                text-brand-accent
              "
            >
              Candidates
            </span>
          )}

          {employer && (
            <span
              className="
                rounded-full
                bg-brand-gold/15
                px-2.5
                py-1
                text-[8px]
                font-bold
                uppercase
                tracking-[0.08em]
                text-brand-dark
              "
            >
              Employers
            </span>
          )}
        </div>
      </div>

      <h3
        className="
          !m-0
          mt-5
          text-[16px]
          font-bold
          !text-brand-primary
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2
          text-[12px]
          leading-5
          text-brand-textMuted
        "
      >
        {description}
      </p>
    </article>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  icon: Icon,
  title,
  description,
}: Feature) {
  return (
    <article
      className="
        rounded-[24px]
        border
        border-brand-border
        bg-brand-bg
        p-5
      "
    >
      <div
        className="
          grid
          h-11
          w-11
          place-items-center
          rounded-full
          bg-white
          text-brand-primary
          shadow-sm
        "
      >
        <Icon className="h-5 w-5" />
      </div>

      <h3
        className="
          !m-0
          mt-5
          text-[16px]
          font-bold
          !text-brand-primary
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2
          text-[12px]
          leading-5
          text-brand-textMuted
        "
      >
        {description}
      </p>
    </article>
  );
}

/* =========================================================
   JOURNEY STEP
========================================================= */

function JourneyStepCard({
  number,
  title,
  description,
}: JourneyStep) {
  return (
    <article
      className="
        rounded-[22px]
        border
        border-brand-border
        bg-white
        p-5
        shadow-[0_6px_20px_rgba(0,70,109,0.04)]
      "
    >
      <div className="flex items-center justify-between gap-4">
        <span
          className="
            text-[10px]
            font-bold
            tracking-[0.12em]
            text-brand-accent
          "
        >
          {number}
        </span>

        <ChevronRight className="h-4 w-4 text-brand-border" />
      </div>

      <h3
        className="
          !m-0
          mt-6
          text-[16px]
          font-bold
          !text-brand-primary
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2
          text-[12px]
          leading-5
          text-brand-textMuted
        "
      >
        {description}
      </p>
    </article>
  );
}

/* =========================================================
   MISSING CARD
========================================================= */

function MissingCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <article
      className="
        rounded-[22px]
        border
        border-white/15
        bg-white/10
        p-5
      "
    >
      <span
        className="
          text-[10px]
          font-bold
          tracking-[0.12em]
          text-brand-orange
        "
      >
        {number}
      </span>

      <h3
        className="
          !m-0
          mt-5
          text-[18px]
          font-bold
          !text-white
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2
          text-[12px]
          leading-5
          text-white/65
        "
      >
        {description}
      </p>
    </article>
  );
}

/* =========================================================
   COMPARISON
========================================================= */

function ComparisonRow({
  label,
  traditional,
  trucity,
  last = false,
}: {
  label: string;
  traditional: string;
  trucity: string;
  last?: boolean;
}) {
  return (
    <div
      className={`
        grid
        grid-cols-[1fr_0.8fr_0.8fr]
        items-center
        px-5
        py-4
        text-[12px]

        sm:px-7

        ${
          last
            ? ''
            : 'border-b border-brand-border'
        }
      `}
    >
      <span className="font-semibold text-brand-primary">
        {label}
      </span>

      <span className="text-center text-brand-textMuted">
        {traditional}
      </span>

      <span
        className="
          flex
          items-center
          justify-center
          gap-1.5
          text-center
          font-bold
          text-brand-primary
        "
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-brand-emerald" />

        {trucity}
      </span>
    </div>
  );
}