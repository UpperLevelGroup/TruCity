import { useMemo, useState } from "react";

import {
  ArrowRight,
  BarChart3,
  Bell,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Globe2,
  Landmark,
  MessageSquare,
  Newspaper,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

type FeedCategory =
  | "All"
  | "Business"
  | "Companies"
  | "Events"
  | "Career";

interface FeedItem {
  id: number;
  category: Exclude<FeedCategory, "All">;
  tag: string;
  title: string;
  description: string;
  source: string;
  time: string;
  icon: typeof Newspaper;
  accent: string;
}

interface EventItem {
  id: number;
  company: string;
  title: string;
  date: string;
  location: string;
  type: string;
}

/*
 * =========================================================
 * BRAND TOKENS
 * =========================================================
 */

const BRAND = {
  navy: "#00273D",
  teal: "#00466D",
  blue: "#1E92D2",
  gold: "#FFAD01",
  orange: "#FFD784",
  background: "#F8FCFF",
  border: "#D4D2E6",
  mutedBorder: "#E9E8F3",
  text: "#334155",
  muted: "#64748B",
  subtle: "#94A3B8",
  white: "#FFFFFF",
};

const panelStyle = {
  background: BRAND.white,
  border: `1px solid ${BRAND.border}`,
  borderRadius: "20px",
};

const primaryButtonStyle = {
  background: `linear-gradient(135deg, ${BRAND.teal} 0%, ${BRAND.blue} 100%)`,
  color: BRAND.white,
};

const secondaryButtonStyle = {
  background: BRAND.white,
  border: `1px solid ${BRAND.teal}`,
  color: BRAND.teal,
};

const feedItems: FeedItem[] = [
  {
    id: 1,
    category: "Business",
    tag: "BUSINESS AFFAIRS",
    title:
      "South African businesses continue investing in digital transformation",
    description:
      "Companies across technology, finance and professional services are increasing their focus on digital skills, automation and data-driven operations.",
    source: "TruCity Business Desk",
    time: "2 hours ago",
    icon: TrendingUp,
    accent: BRAND.blue,
  },
  {
    id: 2,
    category: "Companies",
    tag: "COMPANY UPDATE",
    title:
      "TechNova announces its annual innovation and careers expo",
    description:
      "Meet technology teams, explore emerging career paths and connect with professionals at an industry showcase.",
    source: "TechNova",
    time: "4 hours ago",
    icon: Users,
    accent: BRAND.gold,
  },
  {
    id: 3,
    category: "Events",
    tag: "EXPO • SEMINAR",
    title: "Future Skills & Digital Careers Summit",
    description:
      "A sample event covering AI, cloud computing, cybersecurity, digital careers and the future of work.",
    source: "TruCity Events",
    time: "Tomorrow",
    icon: CalendarDays,
    accent: BRAND.teal,
  },
  {
    id: 4,
    category: "Business",
    tag: "ECONOMY",
    title:
      "What changing interest rates could mean for businesses and professionals",
    description:
      "A simple overview of how borrowing costs can influence investment, hiring and business expansion.",
    source: "TruCity Business Desk",
    time: "Yesterday",
    icon: BarChart3,
    accent: BRAND.blue,
  },
  {
    id: 5,
    category: "Career",
    tag: "CAREER INSIGHT",
    title:
      "Why verified digital skills are becoming increasingly valuable",
    description:
      "Employers are placing greater emphasis on demonstrable skills, relevant experience and trustworthy candidate information.",
    source: "TruCity Career Hub",
    time: "Yesterday",
    icon: ShieldCheck,
    accent: BRAND.gold,
  },
  {
    id: 6,
    category: "Companies",
    tag: "EMPLOYER POST",
    title:
      "BuildRight opens applications for its graduate development programme",
    description:
      "A sample employer announcement highlighting graduate opportunities in engineering, project management and technology.",
    source: "BuildRight",
    time: "2 days ago",
    icon: BriefcaseBusiness,
    accent: BRAND.teal,
  },
  {
    id: 7,
    category: "Business",
    tag: "PUBLIC FINANCE",
    title: "Understanding South Africa's national budget",
    description:
      "Explore how government spending, revenue, infrastructure investment and public services can affect the wider economy.",
    source: "TruCity Finance Desk",
    time: "2 days ago",
    icon: Landmark,
    accent: BRAND.blue,
  },
  {
    id: 8,
    category: "Career",
    tag: "SKILLS",
    title:
      "Cloud, data and cybersecurity remain important areas to watch",
    description:
      "A sample career briefing highlighting technology areas candidates may want to explore when planning their next skills investment.",
    source: "TruCity Career Hub",
    time: "3 days ago",
    icon: Globe2,
    accent: BRAND.gold,
  },
];

const events: EventItem[] = [
  {
    id: 1,
    company: "TechNova",
    title: "Innovation & Careers Expo",
    date: "15 Oct",
    location: "Johannesburg",
    type: "Expo",
  },
  {
    id: 2,
    company: "FutureWork SA",
    title: "AI & The Future of Work",
    date: "22 Oct",
    location: "Online",
    type: "Seminar",
  },
  {
    id: 3,
    company: "BuildRight",
    title: "Graduate Careers Showcase",
    date: "30 Oct",
    location: "Pretoria",
    type: "Career Event",
  },
];

const categories: FeedCategory[] = [
  "All",
  "Business",
  "Companies",
  "Events",
  "Career",
];

function SectionLabel({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon?: typeof Newspaper;
}) {
  return (
    <div
      className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]"
      style={{ color: BRAND.teal }}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </div>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 p-5 shadow-[0_2px_12px_rgba(0,39,61,0.035)] sm:p-6 ${className}`}
      style={panelStyle}
    >
      {children}
    </section>
  );
}

function PrimaryButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E92D2] focus-visible:ring-offset-2 ${className}`}
      style={primaryButtonStyle}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition hover:bg-[#F8FCFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E92D2] focus-visible:ring-offset-2 ${className}`}
      style={secondaryButtonStyle}
    >
      {children}
    </button>
  );
}

export default function CandidateDashboard() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] =
    useState<FeedCategory>("All");

  const [savedItems, setSavedItems] =
    useState<number[]>([]);

  const [showAllFeed, setShowAllFeed] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  /*
   * =========================================================
   * QUICK METRICS
   *
   * Values remain unreported until connected to real data.
   * =========================================================
   */

  const metrics = useMemo(
    () => [
      {
        label: "Profile completion",
        value: "—",
        description: "Keep your profile up to date",
        action: "Review profile",
        icon: UserRound,
        onClick: () => navigate("/candidate/profile"),
      },
      {
        label: "Applications",
        value: "—",
        description: "Follow your application progress",
        action: "View opportunities",
        icon: BriefcaseBusiness,
        onClick: () => navigate("/candidate/feed"),
      },
      {
        label: "Interviews",
        value: "—",
        description: "Stay on top of interview activity",
        action: "Open messages",
        icon: MessageSquare,
        onClick: () => navigate("/candidate/messages"),
      },
      {
        label: "Verification",
        value: "—",
        description: "Review your verification status",
        action: "Review verification",
        icon: ShieldCheck,
        onClick: () => navigate("/candidate/verify"),
      },
    ],
    [navigate]
  );

  /*
   * =========================================================
   * FEED FILTERING AND SEARCH
   * =========================================================
   */

  const filteredFeed = useMemo(() => {
    const categoryFiltered =
      activeCategory === "All"
        ? feedItems
        : feedItems.filter(
            (item) => item.category === activeCategory
          );

    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return categoryFiltered;
    }

    return categoryFiltered.filter((item) =>
      [
        item.title,
        item.description,
        item.source,
        item.tag,
        item.category,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [activeCategory, searchTerm]);

  const visibleFeed = showAllFeed
    ? filteredFeed
    : filteredFeed.slice(0, 4);

  const toggleSaved = (id: number) => {
    setSavedItems((current) =>
      current.includes(id)
        ? current.filter((itemId) => itemId !== id)
        : [...current, id]
    );
  };

  return (
    <div
      className="relative min-h-full overflow-hidden"
      style={{
        background: BRAND.background,
        color: BRAND.text,
        fontFamily:
          "Helvetica, Inter, Arial, sans-serif",
      }}
    >
      {/* Subtle brand accent. No competing decorative shapes. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-bl-full opacity-40"
        style={{
          background:
            "radial-gradient(circle at top right, #FFD784 0%, #F8FCFF 70%)",
        }}
      />

      <div className="relative z-10 space-y-6 pb-5">
        {/* ===================================================
            WELCOME HEADER
        ==================================================== */}

        <header
          className="relative overflow-hidden rounded-[22px] p-6 sm:p-8"
          style={{
            background: BRAND.white,
            border: `1px solid ${BRAND.border}`,
            boxShadow: "0 3px 18px rgba(0,39,61,0.045)",
          }}
        >
          <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <SectionLabel icon={Sparkles}>
                TruCity · Candidate workspace
              </SectionLabel>

              <h1
                className="mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl"
                style={{ color: BRAND.navy }}
              >
                Your next opportunity starts here.
              </h1>

              <p
                className="mt-3 max-w-2xl text-sm leading-6 sm:text-base"
                style={{ color: BRAND.muted }}
              >
                Discover opportunities, prepare your
                professional profile and stay connected
                to the business and career developments
                that matter to you.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck
                    className="h-4 w-4"
                    style={{ color: BRAND.teal }}
                  />
                  Verified professionals
                </span>

                <span className="hidden h-4 w-px sm:block" style={{ background: BRAND.border }} />

                <span className="inline-flex items-center gap-2">
                  <BriefcaseBusiness
                    className="h-4 w-4"
                    style={{ color: BRAND.blue }}
                  />
                  Career opportunities
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row xl:flex-col">
              <PrimaryButton
                onClick={() =>
                  navigate("/candidate/feed")
                }
              >
                <Search className="h-4 w-4" />
                Browse opportunities
                <ArrowRight className="h-4 w-4" />
              </PrimaryButton>

              <SecondaryButton
                onClick={() =>
                  navigate("/candidate/profile")
                }
              >
                <UserRound className="h-4 w-4" />
                View my profile
              </SecondaryButton>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-1 w-full"
            style={{
              background: `linear-gradient(90deg, ${BRAND.teal} 0%, ${BRAND.blue} 72%, ${BRAND.gold} 100%)`,
            }}
          />
        </header>

        {/* ===================================================
            QUICK METRICS
        ==================================================== */}

        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                className="text-lg font-bold"
                style={{ color: BRAND.navy }}
              >
                Your career overview
              </h2>
              <p
                className="mt-1 text-sm"
                style={{ color: BRAND.muted }}
              >
                Shortcuts to the most important parts of
                your candidate account.
              </p>
            </div>

            <span
              className="text-xs font-medium"
              style={{ color: BRAND.subtle }}
            >
              Account summary
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;

              return (
                <article
                  key={metric.label}
                  className="group rounded-[18px] p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    ...panelStyle,
                    boxShadow:
                      "0 2px 12px rgba(0,39,61,0.025)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{
                        background: BRAND.background,
                        color: BRAND.teal,
                        border: `1px solid ${BRAND.mutedBorder}`,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <span
                      className="text-2xl font-bold"
                      style={{ color: BRAND.navy }}
                    >
                      {metric.value}
                    </span>
                  </div>

                  <h3
                    className="mt-5 text-sm font-bold"
                    style={{ color: BRAND.text }}
                  >
                    {metric.label}
                  </h3>

                  <p
                    className="mt-1 min-h-8 text-xs leading-5"
                    style={{ color: BRAND.muted }}
                  >
                    {metric.description}
                  </p>

                  <button
                    type="button"
                    onClick={metric.onClick}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-bold transition hover:gap-3 focus-visible:outline-none focus-visible:underline"
                    style={{ color: BRAND.teal }}
                  >
                    {metric.action}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        {/* ===================================================
            OPPORTUNITY CENTRE
        ==================================================== */}

        <Panel>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <SectionLabel icon={BriefcaseBusiness}>
                Opportunity centre
              </SectionLabel>

              <h2
                className="mt-3 text-xl font-bold sm:text-2xl"
                style={{ color: BRAND.navy }}
              >
                Find work that fits your ambitions.
              </h2>

              <p
                className="mt-2 text-sm leading-6"
                style={{ color: BRAND.muted }}
              >
                Explore available roles, review the
                requirements and make sure your
                professional information is ready before
                applying.
              </p>
            </div>

            <PrimaryButton
              onClick={() =>
                navigate("/candidate/feed")
              }
              className="shrink-0"
            >
              <Search className="h-4 w-4" />
              Explore jobs
              <ArrowRight className="h-4 w-4" />
            </PrimaryButton>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              {
                icon: BriefcaseBusiness,
                title: "Discover opportunities",
                description:
                  "Explore open roles and employer opportunities.",
                color: BRAND.teal,
              },
              {
                icon: FileText,
                title: "Understand requirements",
                description:
                  "Review responsibilities, qualifications and closing dates.",
                color: BRAND.blue,
              },
              {
                icon: ShieldCheck,
                title: "Present your credentials",
                description:
                  "Keep your profile and verification information current.",
                color: BRAND.gold,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl p-4"
                  style={{
                    background: BRAND.background,
                    border: `1px solid ${BRAND.mutedBorder}`,
                  }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background: BRAND.white,
                      color: item.color,
                      border: `1px solid ${BRAND.border}`,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3
                    className="mt-3 text-sm font-bold"
                    style={{ color: BRAND.navy }}
                  >
                    {item.title}
                  </h3>

                  <p
                    className="mt-1 text-xs leading-5"
                    style={{ color: BRAND.muted }}
                  >
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* ===================================================
            BUSINESS SNAPSHOT
        ==================================================== */}

        <section>
          <div className="mb-3">
            <h2
              className="text-lg font-bold"
              style={{ color: BRAND.navy }}
            >
              Business & industry snapshot
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: BRAND.muted }}
            >
              Context for understanding the wider
              business and employment landscape.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {/* Currency */}

            <Panel className="!p-5">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: BRAND.background,
                    color: BRAND.teal,
                    border: `1px solid ${BRAND.mutedBorder}`,
                  }}
                >
                  <CircleDollarSign className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: BRAND.muted }}
                  >
                    Market snapshot
                  </p>
                  <h3
                    className="mt-1 text-sm font-bold"
                    style={{ color: BRAND.navy }}
                  >
                    Currency watch
                  </h3>
                </div>

                <span
                  className="rounded-md px-2 py-1 text-[10px] font-bold"
                  style={{
                    background: "#FFF8E7",
                    color: "#8A5D00",
                  }}
                >
                  SAMPLE
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  ["USD / ZAR", "18.20", "+0.4%"],
                  ["EUR / ZAR", "21.35", "-0.2%"],
                  ["GBP / ZAR", "24.65", "+0.3%"],
                ].map(([pair, value, change]) => (
                  <div
                    key={pair}
                    className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                    style={{ borderColor: BRAND.mutedBorder }}
                  >
                    <span
                      className="text-xs font-semibold"
                      style={{ color: BRAND.text }}
                    >
                      {pair}
                    </span>

                    <span
                      className="text-sm font-bold"
                      style={{ color: BRAND.navy }}
                    >
                      R {value}
                    </span>

                    <span
                      className="text-[11px] font-bold"
                      style={{ color: BRAND.muted }}
                    >
                      {change}
                    </span>
                  </div>
                ))}
              </div>

              <p
                className="mt-4 text-[10px] leading-4"
                style={{ color: BRAND.subtle }}
              >
                Illustrative values only. These are not
                live exchange rates.
              </p>
            </Panel>

            {/* Public finance */}

            <Panel className="!p-5">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: BRAND.background,
                    color: BRAND.blue,
                    border: `1px solid ${BRAND.mutedBorder}`,
                  }}
                >
                  <Landmark className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: BRAND.muted }}
                  >
                    South Africa
                  </p>
                  <h3
                    className="mt-1 text-sm font-bold"
                    style={{ color: BRAND.navy }}
                  >
                    Public finance
                  </h3>
                </div>

                <span
                  className="rounded-md px-2 py-1 text-[10px] font-bold"
                  style={{
                    background: "#FFF8E7",
                    color: "#8A5D00",
                  }}
                >
                  SAMPLE
                </span>
              </div>

              <div className="mt-6">
                <p
                  className="text-xs"
                  style={{ color: BRAND.muted }}
                >
                  Example focus area
                </p>

                <div className="mt-1 flex items-center justify-between gap-3">
                  <h3
                    className="text-xl font-bold"
                    style={{ color: BRAND.navy }}
                  >
                    Infrastructure
                  </h3>
                  <BarChart3
                    className="h-6 w-6"
                    style={{ color: BRAND.blue }}
                  />
                </div>

                <div
                  className="mt-4 h-2 overflow-hidden rounded-full"
                  style={{ background: BRAND.mutedBorder }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "68%",
                      background: BRAND.blue,
                    }}
                  />
                </div>

                <p
                  className="mt-3 text-xs leading-5"
                  style={{ color: BRAND.muted }}
                >
                  Explore how infrastructure investment
                  can relate to engineering, construction,
                  logistics and technology careers.
                </p>
              </div>
            </Panel>

            {/* Opportunity pulse */}

            <Panel className="!p-5 md:col-span-2 xl:col-span-1">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: BRAND.background,
                    color: BRAND.teal,
                    border: `1px solid ${BRAND.mutedBorder}`,
                  }}
                >
                  <Sparkles className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: BRAND.muted }}
                  >
                    TruCity pulse
                  </p>
                  <h3
                    className="mt-1 text-sm font-bold"
                    style={{ color: BRAND.navy }}
                  >
                    Areas to explore
                  </h3>
                </div>

                <span
                  className="rounded-md px-2 py-1 text-[10px] font-bold"
                  style={{
                    background: "#FFF8E7",
                    color: "#8A5D00",
                  }}
                >
                  SAMPLE
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  ["Software engineering", "Explore"],
                  ["Data & AI", "Explore"],
                  ["Cloud & DevOps", "Explore"],
                ].map(([name, status]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                    style={{ borderColor: BRAND.mutedBorder }}
                  >
                    <span
                      className="text-xs font-semibold"
                      style={{ color: BRAND.text }}
                    >
                      {name}
                    </span>

                    <span
                      className="rounded-md px-2 py-1 text-[10px] font-bold"
                      style={{
                        background: BRAND.background,
                        color: BRAND.teal,
                      }}
                    >
                      {status}
                    </span>
                  </div>
                ))}
              </div>

              <p
                className="mt-4 text-[10px] leading-4"
                style={{ color: BRAND.subtle }}
              >
                Example areas, not live hiring or demand
                statistics.
              </p>
            </Panel>
          </div>
        </section>

        {/* ===================================================
            FEED + EVENTS
        ==================================================== */}

        <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
          {/* Feed */}

          <Panel>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <SectionLabel icon={Newspaper}>
                    TruCity feed
                  </SectionLabel>

                  <h2
                    className="mt-2 text-xl font-bold"
                    style={{ color: BRAND.navy }}
                  >
                    Business, companies & careers
                  </h2>

                  <p
                    className="mt-1 text-sm"
                    style={{ color: BRAND.muted }}
                  >
                    Updates to help you stay informed.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowAllFeed((current) => !current)
                  }
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-bold transition hover:bg-[#F8FCFF]"
                  style={{ color: BRAND.teal }}
                >
                  {showAllFeed ? "Show less" : "View all"}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: BRAND.subtle }}
                />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Search updates, companies or careers..."
                  aria-label="Search TruCity feed"
                  className="w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-[#1E92D2]/30"
                  style={{
                    borderColor: BRAND.border,
                    background: BRAND.background,
                    color: BRAND.text,
                  }}
                />
              </div>

              <div
                className="flex gap-2 overflow-x-auto pb-1"
                role="group"
                aria-label="Filter feed by category"
              >
                {categories.map((category) => {
                  const isActive =
                    activeCategory === category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        setActiveCategory(category)
                      }
                      aria-pressed={isActive}
                      className="shrink-0 rounded-lg px-3.5 py-2 text-xs font-bold transition"
                      style={{
                        background: isActive
                          ? BRAND.teal
                          : BRAND.white,
                        color: isActive
                          ? BRAND.white
                          : BRAND.muted,
                        border: `1px solid ${
                          isActive
                            ? BRAND.teal
                            : BRAND.border
                        }`,
                      }}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {visibleFeed.length === 0 ? (
                <div
                  className="rounded-xl border border-dashed p-8 text-center"
                  style={{ borderColor: BRAND.border }}
                >
                  <Search
                    className="mx-auto h-7 w-7"
                    style={{ color: BRAND.subtle }}
                  />

                  <h3
                    className="mt-3 text-sm font-bold"
                    style={{ color: BRAND.text }}
                  >
                    No updates found
                  </h3>

                  <p
                    className="mt-1 text-xs"
                    style={{ color: BRAND.muted }}
                  >
                    Try another search term or category.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setActiveCategory("All");
                    }}
                    className="mt-3 text-xs font-bold underline underline-offset-4"
                    style={{ color: BRAND.teal }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                visibleFeed.map((item) => {
                  const Icon = item.icon;
                  const isSaved = savedItems.includes(item.id);

                  return (
                    <article
                      key={item.id}
                      className="rounded-xl p-4 transition hover:bg-[#F8FCFF]"
                      style={{
                        border: `1px solid ${BRAND.mutedBorder}`,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            background: BRAND.background,
                            color: item.accent,
                            border: `1px solid ${BRAND.mutedBorder}`,
                          }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="text-[10px] font-bold tracking-wide"
                              style={{ color: item.accent }}
                            >
                              {item.tag}
                            </span>

                            <span
                              className="rounded-md px-1.5 py-0.5 text-[9px] font-bold"
                              style={{
                                background: "#FFF8E7",
                                color: "#8A5D00",
                              }}
                            >
                              SAMPLE
                            </span>
                          </div>

                          <h3
                            className="mt-1 text-sm font-bold leading-5"
                            style={{ color: BRAND.navy }}
                          >
                            {item.title}
                          </h3>

                          <p
                            className="mt-2 text-xs leading-5"
                            style={{ color: BRAND.muted }}
                          >
                            {item.description}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <div
                              className="flex flex-wrap items-center gap-2 text-[10px]"
                              style={{ color: BRAND.subtle }}
                            >
                              <span className="font-semibold">
                                {item.source}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{item.time}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleSaved(item.id)}
                              aria-pressed={isSaved}
                              aria-label={
                                isSaved
                                  ? `Remove saved update: ${item.title}`
                                  : `Save update: ${item.title}`
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-bold transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E92D2]"
                              style={{
                                color: isSaved
                                  ? BRAND.teal
                                  : BRAND.muted,
                              }}
                            >
                              <Bookmark
                                className="h-3.5 w-3.5"
                                fill={
                                  isSaved
                                    ? BRAND.gold
                                    : "none"
                                }
                                style={{
                                  color: isSaved
                                    ? BRAND.gold
                                    : BRAND.subtle,
                                }}
                              />
                              {isSaved ? "Saved" : "Save"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {filteredFeed.length > 4 && (
              <button
                type="button"
                onClick={() =>
                  setShowAllFeed((current) => !current)
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition hover:bg-[#F8FCFF]"
                style={{
                  color: BRAND.teal,
                  border: `1px solid ${BRAND.border}`,
                }}
              >
                {showAllFeed
                  ? "Show fewer updates"
                  : `Show all ${filteredFeed.length} updates`}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </Panel>

          {/* Events */}

          <Panel>
            <SectionLabel icon={CalendarDays}>
              What's happening
            </SectionLabel>

            <h2
              className="mt-2 text-xl font-bold"
              style={{ color: BRAND.navy }}
            >
              Expos & seminars
            </h2>

            <p
              className="mt-1 text-sm leading-5"
              style={{ color: BRAND.muted }}
            >
              Discover events where you can learn,
              network and meet employers.
            </p>

            <div className="mt-5 space-y-3">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="rounded-xl p-3.5"
                  style={{
                    border: `1px solid ${BRAND.mutedBorder}`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl p-2 text-center"
                      style={{
                        background: BRAND.background,
                        border: `1px solid ${BRAND.mutedBorder}`,
                        color: BRAND.teal,
                      }}
                    >
                      <CalendarDays className="h-4 w-4" />
                      <span className="mt-1 text-[10px] font-bold">
                        {event.date}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wide"
                        style={{ color: BRAND.blue }}
                      >
                        {event.type}
                      </span>

                      <h3
                        className="mt-1 text-sm font-bold leading-5"
                        style={{ color: BRAND.navy }}
                      >
                        {event.title}
                      </h3>

                      <p
                        className="mt-1 text-xs leading-5"
                        style={{ color: BRAND.muted }}
                      >
                        {event.company} · {event.location}
                      </p>
                    </div>

                    <ChevronRight
                      className="mt-2 h-4 w-4 shrink-0"
                      style={{ color: BRAND.subtle }}
                    />
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveCategory("Events");
                setShowAllFeed(true);
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition hover:bg-[#F8FCFF]"
              style={{
                border: `1px solid ${BRAND.teal}`,
                color: BRAND.teal,
              }}
            >
              Explore event updates
              <ArrowRight className="h-4 w-4" />
            </button>

            <p
              className="mt-3 text-[10px] leading-4"
              style={{ color: BRAND.subtle }}
            >
              The events shown here are sample content,
              not confirmed event listings.
            </p>
          </Panel>
        </section>

        {/* ===================================================
            PROFILE READINESS + QUICK ACTIONS
        ==================================================== */}

        <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
          {/* Get started */}

          <Panel>
            <SectionLabel icon={CheckCircle2}>
              Get started
            </SectionLabel>

            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: BRAND.navy }}
                >
                  Put your best profile forward.
                </h2>

                <p
                  className="mt-2 max-w-xl text-sm leading-6"
                  style={{ color: BRAND.muted }}
                >
                  Keep your professional information,
                  CV and verification details up to date
                  so you are prepared when the right
                  opportunity appears.
                </p>
              </div>

              <div
                className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:flex"
                style={{
                  background: BRAND.background,
                  color: BRAND.gold,
                  border: `1px solid ${BRAND.mutedBorder}`,
                }}
              >
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: UserRound,
                  title: "Professional profile",
                  description:
                    "Review your personal and professional details.",
                  action: "Open profile",
                  color: BRAND.teal,
                  onClick: () =>
                    navigate("/candidate/profile"),
                },
                {
                  icon: FileText,
                  title: "CV & documents",
                  description:
                    "Check your CV and supporting documents.",
                  action: "Review CV",
                  color: BRAND.blue,
                  onClick: () =>
                    navigate("/candidate/cv"),
                },
                {
                  icon: ShieldCheck,
                  title: "Verification",
                  description:
                    "Review your account verification requirements.",
                  action: "Check status",
                  color: BRAND.gold,
                  onClick: () =>
                    navigate("/candidate/verify"),
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={item.onClick}
                    className="rounded-xl p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E92D2]"
                    style={{
                      border: `1px solid ${BRAND.border}`,
                      background: BRAND.white,
                    }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: item.color }}
                    />

                    <h3
                      className="mt-3 text-sm font-bold"
                      style={{ color: BRAND.navy }}
                    >
                      {item.title}
                    </h3>

                    <p
                      className="mt-1 min-h-10 text-xs leading-5"
                      style={{ color: BRAND.muted }}
                    >
                      {item.description}
                    </p>

                    <span
                      className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold"
                      style={{ color: BRAND.teal }}
                    >
                      {item.action}
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>

          {/* Quick actions */}

          <Panel>
            <SectionLabel icon={Sparkles}>
              Quick actions
            </SectionLabel>

            <h2
              className="mt-2 text-xl font-bold"
              style={{ color: BRAND.navy }}
            >
              Where would you like to go?
            </h2>

            <div className="mt-5 space-y-2.5">
              {[
                {
                  icon: BriefcaseBusiness,
                  title: "Browse opportunities",
                  description:
                    "Explore available roles and requirements.",
                  color: BRAND.teal,
                  onClick: () =>
                    navigate("/candidate/feed"),
                },
                {
                  icon: MessageSquare,
                  title: "Messages",
                  description:
                    "Open your existing messaging area.",
                  color: BRAND.blue,
                  onClick: () =>
                    navigate("/candidate/messages"),
                },
                {
                  icon: FileText,
                  title: "Guidance Hub",
                  description:
                    "Explore career and application guidance.",
                  color: BRAND.gold,
                  onClick: () =>
                    navigate("/candidate/hub"),
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={item.onClick}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-[#F8FCFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E92D2]"
                    style={{
                      border: `1px solid ${BRAND.mutedBorder}`,
                    }}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: BRAND.background,
                        color: item.color,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-sm font-bold"
                        style={{ color: BRAND.text }}
                      >
                        {item.title}
                      </h3>

                      <p
                        className="mt-1 text-xs leading-5"
                        style={{ color: BRAND.muted }}
                      >
                        {item.description}
                      </p>
                    </div>

                    <ArrowRight
                      className="h-4 w-4 shrink-0"
                      style={{ color: BRAND.teal }}
                    />
                  </button>
                );
              })}
            </div>
          </Panel>
        </section>

        {/* ===================================================
            CAREER JOURNEY
        ==================================================== */}

        <section
          className="overflow-hidden rounded-[20px] p-6 sm:p-7"
          style={{
            background: BRAND.navy,
            border: `1px solid ${BRAND.teal}`,
          }}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: BRAND.orange }}>
                <Sparkles className="h-4 w-4" />
                Your TruCity journey
              </div>

              <h2 className="mt-3 text-xl font-bold sm:text-2xl" style={{ color: BRAND.white }}>
                Stay ready for your next opportunity.
              </h2>

              <p className="mt-2 text-sm leading-6" style={{ color: "#D5E5EF" }}>
                Keep your profile current, prepare your
                documents, review verification and
                explore opportunities that align with
                your career goals.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/candidate/profile")
              }
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              style={{
                background: BRAND.gold,
                color: BRAND.navy,
              }}
            >
              Review my profile
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* ===================================================
            DEVELOPMENT NOTICE
        ==================================================== */}

        <footer className="flex flex-wrap items-center justify-center gap-2 px-2 pb-2 text-center text-[11px]" style={{ color: BRAND.subtle }}>
          <Bell className="h-3.5 w-3.5 shrink-0" />
          <span>
            Sample business, market and event content is
            for development purposes. Candidate metrics
            are not yet connected to live dashboard data.
          </span>
        </footer>
      </div>
    </div>
  );
}