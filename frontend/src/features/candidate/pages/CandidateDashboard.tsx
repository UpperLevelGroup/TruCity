import { useMemo, useState } from "react";

import {
  ArrowRight,
  BarChart3,
  Bell,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  Check,
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
  X,
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

interface OpportunityMatch {
  id: number;
  company: string;
  title: string;
  location: string;
  employmentType: string;
  matchPercentage: number;
  summary: string;
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  experienceRequired: string;
  candidateExperience: string;
  qualification: string;
  category: string;
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

  const [selectedMatch, setSelectedMatch] =
    useState<OpportunityMatch | null>(null);

  /*
   * =========================================================
   * QUICK METRICS
   * =========================================================
   */

  const metrics = useMemo(
    () => [
      {
        label: "Profile Completion",
        value: "—",
        icon: UserRound,
        description: "Complete your profile",
        action: "Complete Profile",
        onClick: () =>
          navigate("/candidate/profile"),
      },
      {
        label: "Applications",
        value: "—",
        icon: BriefcaseBusiness,
        description: "Track your applications",
        action: "View Opportunities",
        onClick: () =>
          navigate("/candidate/feed"),
      },
      {
        label: "Interviews",
        value: "—",
        icon: MessageSquare,
        description: "Your interview activity",
        action: "View Messages",
        onClick: () =>
          navigate("/candidate/messages"),
      },
      {
        label: "Verification",
        value: "—",
        icon: ShieldCheck,
        description: "Verification status",
        action: "View Verification",
        onClick: () =>
          navigate("/candidate/verify"),
      },
    ],
    [navigate]
  );

  /*
   * =========================================================
   * SMART OPPORTUNITY MATCHING - MOCK DATA
   * =========================================================
   *
   * This is intentionally mock data.
   *
   * Future version:
   * Candidate profile + CV + skills + experience
   *        ↓
   * Matching engine
   *        ↓
   * Open jobs
   *        ↓
   * Match percentage + reasons
   */

  const opportunityMatches: OpportunityMatch[] = [
    {
      id: 101,
      company: "TechNova",
      title: "Backend Software Engineer",
      location: "Johannesburg",
      employmentType: "Full-time",
      matchPercentage: 94,
      summary:
        "Your backend development experience strongly aligns with the technical requirements for this role.",
      requiredSkills: [
        "Java",
        "Spring Boot",
        "PostgreSQL",
        "REST APIs",
        "Git",
      ],
      matchedSkills: [
        "Java",
        "Spring Boot",
        "PostgreSQL",
        "REST APIs",
        "Git",
      ],
      missingSkills: [
        "AWS",
      ],
      experienceRequired: "3–5 years",
      candidateExperience: "4 years",
      qualification:
        "Computer Science / Software Engineering",
      category: "Software Engineering",
    },
    {
      id: 102,
      company: "DataCore",
      title: "Full Stack Developer",
      location: "Pretoria",
      employmentType: "Full-time",
      matchPercentage: 88,
      summary:
        "Your Java and React experience matches most of the core development requirements for this opportunity.",
      requiredSkills: [
        "Java",
        "React",
        "REST APIs",
        "PostgreSQL",
        "Docker",
      ],
      matchedSkills: [
        "Java",
        "React",
        "REST APIs",
        "PostgreSQL",
      ],
      missingSkills: [
        "Docker",
      ],
      experienceRequired: "2–4 years",
      candidateExperience: "4 years",
      qualification:
        "Computer Science or related qualification",
      category: "Full Stack Development",
    },
    {
      id: 103,
      company: "CloudWorks",
      title: "Cloud Application Developer",
      location: "Cape Town / Remote",
      employmentType: "Hybrid",
      matchPercentage: 82,
      summary:
        "Your software engineering background is a strong foundation, with cloud skills representing the main development opportunity.",
      requiredSkills: [
        "Java",
        "Spring Boot",
        "AWS",
        "Docker",
        "CI/CD",
      ],
      matchedSkills: [
        "Java",
        "Spring Boot",
      ],
      missingSkills: [
        "AWS",
        "Docker",
        "CI/CD",
      ],
      experienceRequired: "3+ years",
      candidateExperience: "4 years",
      qualification:
        "Information Technology / Computer Science",
      category: "Cloud & DevOps",
    },
    {
      id: 104,
      company: "BuildRight",
      title: "Technology Project Analyst",
      location: "Pretoria",
      employmentType: "Full-time",
      matchPercentage: 76,
      summary:
        "Your technical background aligns with several requirements, while project management experience could strengthen the match.",
      requiredSkills: [
        "Technology",
        "Data Analysis",
        "Project Management",
        "Communication",
        "Reporting",
      ],
      matchedSkills: [
        "Technology",
        "Data Analysis",
        "Communication",
      ],
      missingSkills: [
        "Project Management",
        "Advanced Reporting",
      ],
      experienceRequired: "2–5 years",
      candidateExperience: "4 years",
      qualification:
        "Technology / Business qualification",
      category: "Technology & Projects",
    },
  ];

  const topOpportunityMatches =
    opportunityMatches.slice(0, 3);

  /*
   * =========================================================
   * BUSINESS / CAREER FEED
   * =========================================================
   */

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
      accent: "#1E92D2",
    },
    {
      id: 2,
      category: "Companies",
      tag: "COMPANY UPDATE",
      title:
        "TechNova announces its annual innovation and careers expo",
      description:
        "Meet technology teams, explore emerging career paths and connect with professionals at the upcoming industry showcase.",
      source: "TechNova",
      time: "4 hours ago",
      icon: Users,
      accent: "#FFAD01",
    },
    {
      id: 3,
      category: "Events",
      tag: "EXPO • SEMINAR",
      title:
        "Future Skills & Digital Careers Summit",
      description:
        "A mock upcoming event covering AI, cloud computing, cybersecurity, digital careers and the future of work.",
      source: "TruCity Events",
      time: "Tomorrow",
      icon: CalendarDays,
      accent: "#00466D",
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
      accent: "#1E92D2",
    },
    {
      id: 5,
      category: "Career",
      tag: "CAREER INSIGHT",
      title:
        "Why verified digital skills are becoming increasingly valuable",
      description:
        "Employers are placing greater emphasis on demonstrable technical skills, relevant experience and trustworthy candidate information.",
      source: "TruCity Career Hub",
      time: "Yesterday",
      icon: ShieldCheck,
      accent: "#FFAD01",
    },
    {
      id: 6,
      category: "Companies",
      tag: "EMPLOYER POST",
      title:
        "BuildRight opens applications for its graduate development programme",
      description:
        "A mock employer announcement highlighting graduate opportunities in engineering, project management and technology.",
      source: "BuildRight",
      time: "2 days ago",
      icon: BriefcaseBusiness,
      accent: "#00466D",
    },
    {
      id: 7,
      category: "Business",
      tag: "PUBLIC FINANCE",
      title:
        "Understanding South Africa's national budget",
      description:
        "Explore how government spending, revenue, infrastructure investment and public services can affect the wider economy.",
      source: "TruCity Finance Desk",
      time: "2 days ago",
      icon: Landmark,
      accent: "#1E92D2",
    },
    {
      id: 8,
      category: "Career",
      tag: "SKILLS",
      title:
        "Cloud, data and cybersecurity remain important areas to watch",
      description:
        "A mock career briefing highlighting technology areas candidates may want to explore when planning their next skills investment.",
      source: "TruCity Career Hub",
      time: "3 days ago",
      icon: Globe2,
      accent: "#FFAD01",
    },
  ];

  const filteredFeed = useMemo(() => {
    const filtered =
      activeCategory === "All"
        ? feedItems
        : feedItems.filter(
            (item) =>
              item.category === activeCategory
          );

    if (!searchTerm.trim()) {
      return filtered;
    }

    const search =
      searchTerm.toLowerCase().trim();

    return filtered.filter((item) =>
      [
        item.title,
        item.description,
        item.source,
        item.tag,
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
        ? current.filter(
            (itemId) => itemId !== id
          )
        : [...current, id]
    );
  };

  /*
   * =========================================================
   * EVENTS
   * =========================================================
   */

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

  const getMatchLabel = (
    percentage: number
  ) => {
    if (percentage >= 90) {
      return "Excellent Match";
    }

    if (percentage >= 80) {
      return "Strong Match";
    }

    return "Potential Match";
  };

  const getMatchWidth = (
    percentage: number
  ) => `${percentage}%`;

  return (
    <div
      className="relative min-h-full overflow-hidden"
      style={{
        fontFamily:
          "Helvetica, Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* =====================================================
          DECORATIVE BACKGROUND
      ====================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 top-0 overflow-hidden"
      >
        <div
          className="absolute -left-32 -top-32 h-72 w-72 rounded-full opacity-90"
          style={{
            background: "#00273D",
            boxShadow:
              "0 0 0 12px rgba(255,173,1,0.16)",
          }}
        />

        <div
          className="absolute -right-24 -top-24 h-64 w-64 rounded-full border-[22px] opacity-80"
          style={{
            borderColor: "#FFAD01",
          }}
        />

        <div
          className="absolute right-[18%] top-[8%] h-48 w-48 rotate-12 rounded-[42%] opacity-25 blur-[1px]"
          style={{
            background: "#FFAD01",
          }}
        />

        <div
          className="absolute left-[6%] top-[34%] h-24 w-24 rounded-full opacity-40"
          style={{
            background: "#FFD784",
          }}
        />

        <div
          className="absolute bottom-[20%] right-[5%] h-32 w-32 rounded-full opacity-30"
          style={{
            background: "#1E92D2",
          }}
        />

        <div
          className="absolute bottom-[-100px] left-[-80px] h-64 w-64 rounded-full opacity-80"
          style={{
            background: "#FFAD01",
          }}
        />

        <div
          className="absolute bottom-[-120px] right-[-100px] h-72 w-72 rounded-full opacity-90"
          style={{
            background: "#00273D",
          }}
        />
      </div>

      {/* =====================================================
          PAGE CONTENT
      ====================================================== */}

      <div className="relative z-10 space-y-7">
        {/* ===================================================
            WELCOME HEADER
        ==================================================== */}

        <section className="relative overflow-hidden rounded-[28px] border border-[#D4D2E6] bg-white/95 px-6 py-7 shadow-sm backdrop-blur-md sm:px-8">
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    background: "#FFAD01",
                  }}
                />

                <span
                  className="text-xs font-bold tracking-[0.18em]"
                  style={{
                    color: "#00466D",
                  }}
                >
                  TRUCITY • CANDIDATE WORKSPACE
                </span>
              </div>

              <h1
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{
                  color: "#00273D",
                }}
              >
                Your career, your city,
                your opportunities.
              </h1>

              <p
                className="mt-3 max-w-2xl text-sm leading-6 sm:text-base"
                style={{
                  color: "#64748B",
                }}
              >
                Stay connected to opportunities,
                employers, business news, industry
                events and information that can help
                you make your next career move.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate("/candidate/feed")
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, #00466D 0%, #1E92D2 100%)",
                }}
              >
                <BriefcaseBusiness className="h-4 w-4" />
                Browse Opportunities
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/candidate/profile")
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition hover:bg-[#F8FCFF]"
                style={{
                  borderColor: "#00466D",
                  color: "#00466D",
                }}
              >
                <UserRound className="h-4 w-4" />
                My Profile
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================
            QUICK METRICS
        ==================================================== */}

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <div
                key={metric.label}
                className="group rounded-[24px] border bg-white/95 p-5 shadow-sm backdrop-blur-md transition hover:-translate-y-1 hover:shadow-md"
                style={{
                  borderColor: "#D4D2E6",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full"
                    style={{
                      background: "#F8FCFF",
                      border:
                        "1px solid #D4D2E6",
                      color: "#00466D",
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <span
                    className="text-3xl font-bold"
                    style={{
                      color: "#00273D",
                    }}
                  >
                    {metric.value}
                  </span>
                </div>

                <div className="mt-5">
                  <h2
                    className="text-sm font-bold"
                    style={{
                      color: "#334155",
                    }}
                  >
                    {metric.label}
                  </h2>

                  <p
                    className="mt-1 text-xs"
                    style={{
                      color: "#64748B",
                    }}
                  >
                    {metric.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={metric.onClick}
                  className="mt-5 inline-flex items-center gap-1 text-xs font-bold transition hover:gap-2"
                  style={{
                    color: "#00466D",
                  }}
                >
                  {metric.action}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </section>

        {/* ===================================================
            SMART OPPORTUNITY MATCHING
        ==================================================== */}

        <section
          className="relative overflow-hidden rounded-[28px] border bg-white/95 p-6 shadow-sm backdrop-blur-md sm:p-7"
          style={{
            borderColor: "#BFD9E8",
          }}
        >
          {/* Decorative glow */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full opacity-20 blur-2xl"
            style={{
              background: "#1E92D2",
            }}
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 left-1/3 h-40 w-40 rounded-full opacity-10 blur-2xl"
            style={{
              background: "#FFAD01",
            }}
          />

          <div className="relative z-10">
            {/* Section heading */}

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div
                  className="flex items-center gap-2 text-xs font-bold tracking-[0.14em]"
                  style={{
                    color: "#1E92D2",
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                  SMART OPPORTUNITY MATCHING
                </div>

                <h2
                  className="mt-2 text-2xl font-bold tracking-tight"
                  style={{
                    color: "#00273D",
                  }}
                >
                  Opportunities matched to your
                  profile
                </h2>

                <p
                  className="mt-2 max-w-2xl text-sm leading-6"
                  style={{
                    color: "#64748B",
                  }}
                >
                  TruCity can compare your skills,
                  experience and qualifications with
                  employer requirements to surface
                  opportunities that closely match your
                  profile.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    background: "#EAF5FB",
                    color: "#00466D",
                  }}
                >
                  <Sparkles className="h-6 w-6" />
                </div>

                <div>
                  <p
                    className="text-[10px] font-bold tracking-wide"
                    style={{
                      color: "#64748B",
                    }}
                  >
                    PROFILE MATCHING
                  </p>

                  <p
                    className="mt-0.5 text-sm font-bold"
                    style={{
                      color: "#00466D",
                    }}
                  >
                    Active
                  </p>
                </div>
              </div>
            </div>

            {/* Profile readiness banner */}

            <div
              className="mt-6 rounded-2xl border p-4"
              style={{
                borderColor: "#D4D2E6",
                background:
                  "linear-gradient(135deg, #F8FCFF 0%, #FFFFFF 100%)",
              }}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: "#EAF5FB",
                      color: "#1E92D2",
                    }}
                  >
                    <UserRound className="h-5 w-5" />
                  </div>

                  <div>
                    <p
                      className="text-sm font-bold"
                      style={{
                        color: "#334155",
                      }}
                    >
                      Your matching profile
                    </p>

                    <p
                      className="mt-1 text-xs leading-5"
                      style={{
                        color: "#64748B",
                      }}
                    >
                      Matching currently uses your
                      profile skills, experience and
                      qualifications.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/candidate/profile")
                  }
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition hover:bg-white"
                  style={{
                    borderColor: "#00466D",
                    color: "#00466D",
                  }}
                >
                  Update Profile
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Match cards */}

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
              {topOpportunityMatches.map(
                (match) => (
                  <button
                    key={match.id}
                    type="button"
                    onClick={() =>
                      setSelectedMatch(match)
                    }
                    className="group relative overflow-hidden rounded-2xl border p-5 text-left transition hover:-translate-y-1 hover:shadow-md"
                    style={{
                      borderColor: "#D4D2E6",
                      background: "#FFFFFF",
                    }}
                  >
                    {/* Match percentage */}

                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl"
                        style={{
                          background: "#F8FCFF",
                          color: "#00466D",
                          border:
                            "1px solid #D4D2E6",
                        }}
                      >
                        <BriefcaseBusiness className="h-5 w-5" />
                      </div>

                      <div className="text-right">
                        <div
                          className="text-2xl font-bold"
                          style={{
                            color:
                              match.matchPercentage >=
                              90
                                ? "#16803C"
                                : "#00466D",
                          }}
                        >
                          {match.matchPercentage}%
                        </div>

                        <div
                          className="text-[9px] font-bold uppercase tracking-wide"
                          style={{
                            color: "#64748B",
                          }}
                        >
                          Match
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wide"
                        style={{
                          color: "#1E92D2",
                        }}
                      >
                        {match.category}
                      </span>

                      <h3
                        className="mt-1 text-base font-bold leading-5"
                        style={{
                          color: "#00273D",
                        }}
                      >
                        {match.title}
                      </h3>

                      <p
                        className="mt-1 text-xs font-semibold"
                        style={{
                          color: "#475569",
                        }}
                      >
                        {match.company}
                      </p>

                      <p
                        className="mt-2 text-xs"
                        style={{
                          color: "#64748B",
                        }}
                      >
                        {match.location} •{" "}
                        {match.employmentType}
                      </p>
                    </div>

                    {/* Match bar */}

                    <div className="mt-4">
                      <div className="mb-1 flex items-center justify-between">
                        <span
                          className="text-[10px] font-semibold"
                          style={{
                            color: "#64748B",
                          }}
                        >
                          Profile alignment
                        </span>

                        <span
                          className="text-[10px] font-bold"
                          style={{
                            color: "#00466D",
                          }}
                        >
                          {getMatchLabel(
                            match.matchPercentage
                          )}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#EAF5FB]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: getMatchWidth(
                              match.matchPercentage
                            ),
                            background:
                              "linear-gradient(90deg, #00466D 0%, #1E92D2 100%)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Matched skills */}

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {match.matchedSkills
                        .slice(0, 3)
                        .map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold"
                            style={{
                              background: "#EAF5FB",
                              color: "#00466D",
                            }}
                          >
                            <Check className="h-2.5 w-2.5" />
                            {skill}
                          </span>
                        ))}

                      {match.matchedSkills.length >
                        3 && (
                        <span
                          className="rounded-full px-2 py-1 text-[9px] font-bold"
                          style={{
                            background: "#F8FCFF",
                            color: "#64748B",
                          }}
                        >
                          +
                          {match.matchedSkills
                            .length - 3}{" "}
                          more
                        </span>
                      )}
                    </div>

                    {/* Click hint */}

                    <div
                      className="mt-5 flex items-center justify-between border-t pt-4"
                      style={{
                        borderColor: "#EEF2F6",
                      }}
                    >
                      <span
                        className="text-[10px] font-bold"
                        style={{
                          color: "#00466D",
                        }}
                      >
                        View match details
                      </span>

                      <ChevronRight
                        className="h-4 w-4 transition group-hover:translate-x-1"
                        style={{
                          color: "#1E92D2",
                        }}
                      />
                    </div>
                  </button>
                )
              )}
            </div>

            {/* Bottom action */}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className="h-4 w-4"
                  style={{
                    color: "#1E92D2",
                  }}
                />

                <p
                  className="text-[11px]"
                  style={{
                    color: "#64748B",
                  }}
                >
                  Matches are based on the information
                  currently available in your profile.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/candidate/feed")
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, #00466D 0%, #1E92D2 100%)",
                }}
              >
                View All Opportunities
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================
            BUSINESS SNAPSHOT
        ==================================================== */}

        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Currency */}

          <div
            className="rounded-[24px] border bg-white/95 p-5 shadow-sm backdrop-blur-md"
            style={{
              borderColor: "#D4D2E6",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full"
                  style={{
                    background: "#EAF5FB",
                    color: "#00466D",
                  }}
                >
                  <CircleDollarSign className="h-5 w-5" />
                </span>

                <div>
                  <p
                    className="text-xs font-bold tracking-wide"
                    style={{
                      color: "#64748B",
                    }}
                  >
                    MARKET SNAPSHOT
                  </p>

                  <h2
                    className="text-sm font-bold"
                    style={{
                      color: "#00273D",
                    }}
                  >
                    Currency Watch
                  </h2>
                </div>
              </div>

              <span
                className="rounded-full px-2 py-1 text-[10px] font-bold"
                style={{
                  background: "#FFF8E7",
                  color: "#B77900",
                }}
              >
                MOCK
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
                  className="flex items-center justify-between border-b border-[#EEF2F6] pb-3 last:border-0 last:pb-0"
                >
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color: "#475569",
                    }}
                  >
                    {pair}
                  </span>

                  <span
                    className="text-sm font-bold"
                    style={{
                      color: "#00273D",
                    }}
                  >
                    R {value}
                  </span>

                  <span
                    className="text-[11px] font-bold"
                    style={{
                      color: change.startsWith("+")
                        ? "#16803C"
                        : "#B45309",
                    }}
                  >
                    {change}
                  </span>
                </div>
              ))}
            </div>

            <p
              className="mt-4 text-[10px]"
              style={{
                color: "#94A3B8",
              }}
            >
              Example values for the dashboard.
              Live market data can be connected later.
            </p>
          </div>

          {/* Public Finance */}

          <div
            className="rounded-[24px] border bg-white/95 p-5 shadow-sm backdrop-blur-md"
            style={{
              borderColor: "#D4D2E6",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full"
                  style={{
                    background: "#FFF8E7",
                    color: "#FFAD01",
                  }}
                >
                  <Landmark className="h-5 w-5" />
                </span>

                <div>
                  <p
                    className="text-xs font-bold tracking-wide"
                    style={{
                      color: "#64748B",
                    }}
                  >
                    SOUTH AFRICA
                  </p>

                  <h2
                    className="text-sm font-bold"
                    style={{
                      color: "#00273D",
                    }}
                  >
                    Public Finance
                  </h2>
                </div>
              </div>

              <span
                className="rounded-full px-2 py-1 text-[10px] font-bold"
                style={{
                  background: "#FFF8E7",
                  color: "#B77900",
                }}
              >
                MOCK
              </span>
            </div>

            <div className="mt-5">
              <div className="flex items-end justify-between">
                <div>
                  <p
                    className="text-xs"
                    style={{
                      color: "#64748B",
                    }}
                  >
                    Budget Focus
                  </p>

                  <p
                    className="mt-1 text-xl font-bold"
                    style={{
                      color: "#00273D",
                    }}
                  >
                    Infrastructure
                  </p>
                </div>

                <BarChart3
                  className="h-7 w-7"
                  style={{
                    color: "#1E92D2",
                  }}
                />
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#EAF5FB]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "68%",
                    background:
                      "linear-gradient(90deg, #00466D, #1E92D2)",
                  }}
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p
                    className="text-[10px]"
                    style={{
                      color: "#94A3B8",
                    }}
                  >
                    Focus area
                  </p>

                  <p
                    className="text-xs font-bold"
                    style={{
                      color: "#334155",
                    }}
                  >
                    Infrastructure
                  </p>
                </div>

                <div>
                  <p
                    className="text-[10px]"
                    style={{
                      color: "#94A3B8",
                    }}
                  >
                    Candidate angle
                  </p>

                  <p
                    className="text-xs font-bold"
                    style={{
                      color: "#334155",
                    }}
                  >
                    Skills & jobs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Opportunity Pulse */}

          <div
            className="rounded-[24px] border bg-white/95 p-5 shadow-sm backdrop-blur-md"
            style={{
              borderColor: "#D4D2E6",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full"
                  style={{
                    background: "#EAF5FB",
                    color: "#1E92D2",
                  }}
                >
                  <Sparkles className="h-5 w-5" />
                </span>

                <div>
                  <p
                    className="text-xs font-bold tracking-wide"
                    style={{
                      color: "#64748B",
                    }}
                  >
                    TRUCITY PULSE
                  </p>

                  <h2
                    className="text-sm font-bold"
                    style={{
                      color: "#00273D",
                    }}
                  >
                    Opportunity Areas
                  </h2>
                </div>
              </div>

              <span
                className="rounded-full px-2 py-1 text-[10px] font-bold"
                style={{
                  background: "#FFF8E7",
                  color: "#B77900",
                }}
              >
                MOCK
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {[
                ["Software Engineering", "High interest"],
                ["Data & AI", "Growing"],
                ["Cloud & DevOps", "Growing"],
              ].map(([name, status]) => (
                <div
                  key={name}
                  className="flex items-center justify-between"
                >
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color: "#475569",
                    }}
                  >
                    {name}
                  </span>

                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                    style={{
                      background: "#EAF5FB",
                      color: "#00466D",
                    }}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================
            MAIN FEED + EVENTS
        ==================================================== */}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.65fr_1fr]">
          {/* NEWS / COMPANY FEED */}

          <div
            className="rounded-[28px] border bg-white/95 p-6 shadow-sm backdrop-blur-md sm:p-7"
            style={{
              borderColor: "#D4D2E6",
            }}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div
                    className="flex items-center gap-2 text-xs font-bold tracking-[0.14em]"
                    style={{
                      color: "#FFAD01",
                    }}
                  >
                    <Newspaper className="h-4 w-4" />
                    TRUCITY FEED
                  </div>

                  <h2
                    className="mt-2 text-xl font-bold"
                    style={{
                      color: "#00273D",
                    }}
                  >
                    Business, companies & career
                    updates
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowAllFeed(
                      (current) => !current
                    )
                  }
                  className="inline-flex items-center gap-1 text-xs font-bold"
                  style={{
                    color: "#00466D",
                  }}
                >
                  {showAllFeed
                    ? "Show Less"
                    : "View All"}

                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Search */}

              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{
                    color: "#94A3B8",
                  }}
                />

                <input
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  placeholder="Search business, companies, events..."
                  className="w-full rounded-xl border bg-[#F8FCFF] py-3 pl-10 pr-4 text-sm outline-none transition focus:bg-white"
                  style={{
                    borderColor: "#D4D2E6",
                    color: "#334155",
                  }}
                />
              </div>

              {/* Categories */}

              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  "All",
                  "Business",
                  "Companies",
                  "Events",
                  "Career",
                ].map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      setActiveCategory(
                        category as FeedCategory
                      )
                    }
                    className="shrink-0 rounded-full px-4 py-2 text-xs font-bold transition"
                    style={{
                      background:
                        activeCategory === category
                          ? "#00466D"
                          : "#F8FCFF",
                      color:
                        activeCategory === category
                          ? "#FFFFFF"
                          : "#475569",
                      border:
                        activeCategory === category
                          ? "1px solid #00466D"
                          : "1px solid #D4D2E6",
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Feed Items */}

            <div className="mt-5 space-y-3">
              {visibleFeed.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center">
                  <Search
                    className="mx-auto h-7 w-7"
                    style={{
                      color: "#94A3B8",
                    }}
                  />

                  <p
                    className="mt-3 text-sm font-bold"
                    style={{
                      color: "#334155",
                    }}
                  >
                    No updates found
                  </p>

                  <p
                    className="mt-1 text-xs"
                    style={{
                      color: "#64748B",
                    }}
                  >
                    Try another search or category.
                  </p>
                </div>
              ) : (
                visibleFeed.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article
                      key={item.id}
                      className="group rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:bg-[#F8FCFF] hover:shadow-sm"
                      style={{
                        borderColor: "#D4D2E6",
                      }}
                    >
                      <div className="flex gap-4">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            background: "#F8FCFF",
                            color: item.accent,
                            border:
                              "1px solid #D4D2E6",
                          }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className="text-[10px] font-bold tracking-wide"
                                  style={{
                                    color: item.accent,
                                  }}
                                >
                                  {item.tag}
                                </span>

                                <span
                                  className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                                  style={{
                                    background: "#FFF8E7",
                                    color: "#B77900",
                                  }}
                                >
                                  MOCK
                                </span>
                              </div>

                              <h3
                                className="mt-1 text-sm font-bold leading-5"
                                style={{
                                  color: "#334155",
                                }}
                              >
                                {item.title}
                              </h3>
                            </div>

                            <button
                              type="button"
                              aria-label={
                                savedItems.includes(
                                  item.id
                                )
                                  ? "Remove bookmark"
                                  : "Save update"
                              }
                              onClick={() =>
                                toggleSaved(item.id)
                              }
                              className="shrink-0 rounded-lg p-2 transition hover:bg-white"
                            >
                              <Bookmark
                                className="h-4 w-4"
                                fill={
                                  savedItems.includes(
                                    item.id
                                  )
                                    ? "#FFAD01"
                                    : "none"
                                }
                                style={{
                                  color:
                                    savedItems.includes(
                                      item.id
                                    )
                                      ? "#FFAD01"
                                      : "#94A3B8",
                                }}
                              />
                            </button>
                          </div>

                          <p
                            className="mt-2 text-xs leading-5"
                            style={{
                              color: "#64748B",
                            }}
                          >
                            {item.description}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <div
                              className="flex items-center gap-2 text-[10px]"
                              style={{
                                color: "#94A3B8",
                              }}
                            >
                              <span className="font-semibold">
                                {item.source}
                              </span>

                              <span>•</span>

                              <span>
                                {item.time}
                              </span>
                            </div>

                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-[10px] font-bold"
                              style={{
                                color: "#00466D",
                              }}
                            >
                              Read Update
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>

          {/* EVENTS */}

          <div
            className="rounded-[28px] border bg-white/95 p-6 shadow-sm backdrop-blur-md sm:p-7"
            style={{
              borderColor: "#D4D2E6",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div
                  className="flex items-center gap-2 text-xs font-bold tracking-[0.14em]"
                  style={{
                    color: "#FFAD01",
                  }}
                >
                  <CalendarDays className="h-4 w-4" />
                  WHAT'S HAPPENING
                </div>

                <h2
                  className="mt-2 text-xl font-bold"
                  style={{
                    color: "#00273D",
                  }}
                >
                  Expos & seminars
                </h2>

                <p
                  className="mt-2 text-xs leading-5"
                  style={{
                    color: "#64748B",
                  }}
                >
                  Discover events where you can
                  learn, network and meet employers.
                </p>
              </div>

              <span
                className="rounded-full px-2 py-1 text-[10px] font-bold"
                style={{
                  background: "#FFF8E7",
                  color: "#B77900",
                }}
              >
                MOCK
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {events.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className="w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:bg-[#F8FCFF] hover:shadow-sm"
                  style={{
                    borderColor: "#D4D2E6",
                  }}
                >
                  <div className="flex gap-3">
                    <div
                      className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl"
                      style={{
                        background: "#EAF5FB",
                        color: "#00466D",
                      }}
                    >
                      <CalendarDays className="h-4 w-4" />

                      <span className="mt-0.5 text-[9px] font-bold">
                        {event.date}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div
                        className="text-[10px] font-bold"
                        style={{
                          color: "#1E92D2",
                        }}
                      >
                        {event.type}
                      </div>

                      <h3
                        className="mt-1 text-sm font-bold"
                        style={{
                          color: "#334155",
                        }}
                      >
                        {event.title}
                      </h3>

                      <p
                        className="mt-1 text-xs"
                        style={{
                          color: "#64748B",
                        }}
                      >
                        {event.company} •{" "}
                        {event.location}
                      </p>
                    </div>

                    <ChevronRight
                      className="mt-3 h-4 w-4 shrink-0"
                      style={{
                        color: "#94A3B8",
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setActiveCategory("Events")
              }
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-xs font-bold transition hover:bg-[#F8FCFF]"
              style={{
                borderColor: "#00466D",
                color: "#00466D",
              }}
            >
              Explore More Events
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* ===================================================
            GET STARTED + QUICK ACTIONS
        ==================================================== */}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* GET STARTED */}

          <div
            className="rounded-[28px] border bg-white/95 p-6 shadow-sm backdrop-blur-md sm:p-7"
            style={{
              borderColor: "#D4D2E6",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div
                  className="mb-2 text-xs font-bold tracking-[0.14em]"
                  style={{
                    color: "#FFAD01",
                  }}
                >
                  GET STARTED
                </div>

                <h2
                  className="text-xl font-bold"
                  style={{
                    color: "#00273D",
                  }}
                >
                  Build a stronger candidate
                  profile
                </h2>

                <p
                  className="mt-2 max-w-xl text-sm leading-6"
                  style={{
                    color: "#64748B",
                  }}
                >
                  Make sure your profile, CV and
                  verification information are ready
                  before applying for opportunities.
                </p>
              </div>

              <div
                className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full sm:flex"
                style={{
                  background: "#FFF8E7",
                  color: "#FFAD01",
                }}
              >
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() =>
                  navigate("/candidate/profile")
                }
                className="rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                style={{
                  borderColor: "#D4D2E6",
                }}
              >
                <UserRound
                  className="h-5 w-5"
                  style={{
                    color: "#00466D",
                  }}
                />

                <div
                  className="mt-3 text-sm font-bold"
                  style={{
                    color: "#334155",
                  }}
                >
                  Complete Profile
                </div>

                <div
                  className="mt-1 text-xs leading-5"
                  style={{
                    color: "#64748B",
                  }}
                >
                  Keep your professional information
                  up to date.
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/candidate/cv")
                }
                className="rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                style={{
                  borderColor: "#D4D2E6",
                }}
              >
                <FileText
                  className="h-5 w-5"
                  style={{
                    color: "#1E92D2",
                  }}
                />

                <div
                  className="mt-3 text-sm font-bold"
                  style={{
                    color: "#334155",
                  }}
                >
                  Update CV
                </div>

                <div
                  className="mt-1 text-xs leading-5"
                  style={{
                    color: "#64748B",
                  }}
                >
                  Make sure employers can see your
                  latest experience.
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/candidate/verify")
                }
                className="rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                style={{
                  borderColor: "#D4D2E6",
                }}
              >
                <ShieldCheck
                  className="h-5 w-5"
                  style={{
                    color: "#FFAD01",
                  }}
                />

                <div
                  className="mt-3 text-sm font-bold"
                  style={{
                    color: "#334155",
                  }}
                >
                  Verify Account
                </div>

                <div
                  className="mt-1 text-xs leading-5"
                  style={{
                    color: "#64748B",
                  }}
                >
                  Review your candidate verification
                  requirements.
                </div>
              </button>
            </div>
          </div>

          {/* QUICK ACTIONS */}

          <div
            className="rounded-[28px] border bg-white/95 p-6 shadow-sm backdrop-blur-md sm:p-7"
            style={{
              borderColor: "#D4D2E6",
            }}
          >
            <div
              className="text-xs font-bold tracking-[0.14em]"
              style={{
                color: "#FFAD01",
              }}
            >
              QUICK ACTIONS
            </div>

            <h2
              className="mt-2 text-xl font-bold"
              style={{
                color: "#00273D",
              }}
            >
              What would you like to do?
            </h2>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() =>
                  navigate("/candidate/feed")
                }
                className="flex w-full items-center justify-between rounded-2xl border p-4 text-left transition hover:bg-[#F8FCFF]"
                style={{
                  borderColor: "#D4D2E6",
                }}
              >
                <span className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{
                      background: "#EAF5FB",
                      color: "#00466D",
                    }}
                  >
                    <BriefcaseBusiness className="h-5 w-5" />
                  </span>

                  <span>
                    <span
                      className="block text-sm font-bold"
                      style={{
                        color: "#334155",
                      }}
                    >
                      Browse Opportunities
                    </span>

                    <span
                      className="block text-xs"
                      style={{
                        color: "#64748B",
                      }}
                    >
                      Find roles that match your skills
                    </span>
                  </span>
                </span>

                <ArrowRight
                  className="h-4 w-4"
                  style={{
                    color: "#00466D",
                  }}
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/candidate/messages")
                }
                className="flex w-full items-center justify-between rounded-2xl border p-4 text-left transition hover:bg-[#F8FCFF]"
                style={{
                  borderColor: "#D4D2E6",
                }}
              >
                <span className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{
                      background: "#FFF8E7",
                      color: "#FFAD01",
                    }}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </span>

                  <span>
                    <span
                      className="block text-sm font-bold"
                      style={{
                        color: "#334155",
                      }}
                    >
                      Check Messages
                    </span>

                    <span
                      className="block text-xs"
                      style={{
                        color: "#64748B",
                      }}
                    >
                      Stay up to date with employers
                    </span>
                  </span>
                </span>

                <ArrowRight
                  className="h-4 w-4"
                  style={{
                    color: "#00466D",
                  }}
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/candidate/hub")
                }
                className="flex w-full items-center justify-between rounded-2xl border p-4 text-left transition hover:bg-[#F8FCFF]"
                style={{
                  borderColor: "#D4D2E6",
                }}
              >
                <span className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{
                      background: "#EAF5FB",
                      color: "#1E92D2",
                    }}
                  >
                    <FileText className="h-5 w-5" />
                  </span>

                  <span>
                    <span
                      className="block text-sm font-bold"
                      style={{
                        color: "#334155",
                      }}
                    >
                      Guidance Hub
                    </span>

                    <span
                      className="block text-xs"
                      style={{
                        color: "#64748B",
                      }}
                    >
                      Get career and application guidance
                    </span>
                  </span>
                </span>

                <ArrowRight
                  className="h-4 w-4"
                  style={{
                    color: "#00466D",
                  }}
                />
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================
            TRUCITY JOURNEY
        ==================================================== */}

        <section
          className="rounded-[28px] border bg-white/95 p-6 shadow-sm backdrop-blur-md sm:p-7"
          style={{
            borderColor: "#D4D2E6",
          }}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div
                className="text-xs font-bold tracking-[0.14em]"
                style={{
                  color: "#FFAD01",
                }}
              >
                YOUR TRUCITY JOURNEY
              </div>

              <h2
                className="mt-2 text-xl font-bold"
                style={{
                  color: "#00273D",
                }}
              >
                Stay ready for your next
                opportunity
              </h2>

              <p
                className="mt-2 max-w-2xl text-sm leading-6"
                style={{
                  color: "#64748B",
                }}
              >
                Keep your information current,
                maintain your CV, complete verification,
                follow business developments and engage
                with employers through TruCity.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/candidate/profile")
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, #00466D 0%, #1E92D2 100%)",
              }}
            >
              Open My Profile
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* ===================================================
            MOCK DATA NOTICE
        ==================================================== */}

        <div className="flex items-center justify-center gap-2 pb-4 text-[10px] font-semibold">
          <Bell
            className="h-3.5 w-3.5"
            style={{
              color: "#94A3B8",
            }}
          />

          <span
            style={{
              color: "#94A3B8",
            }}
          >
            Dashboard business, market, event and
            matching information is currently mock
            data for development.
          </span>
        </div>
      </div>

      {/* =====================================================
          SMART MATCH DETAIL MODAL
      ====================================================== */}

      {selectedMatch && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#00273D]/55 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="smart-match-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedMatch(null);
            }
          }}
        >
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-2xl">
            {/* Modal header */}

            <div
              className="relative overflow-hidden px-6 pb-6 pt-6 sm:px-7"
              style={{
                background:
                  "linear-gradient(135deg, #F8FCFF 0%, #FFFFFF 100%)",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setSelectedMatch(null)
                }
                aria-label="Close match details"
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border bg-white transition hover:bg-[#F8FCFF]"
                style={{
                  borderColor: "#D4D2E6",
                  color: "#64748B",
                }}
              >
                <X className="h-4 w-4" />
              </button>

              <div className="pr-12">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                    style={{
                      background: "#EAF5FB",
                      color: "#00466D",
                    }}
                  >
                    SMART MATCH
                  </span>

                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                    style={{
                      background: "#FFF8E7",
                      color: "#B77900",
                    }}
                  >
                    MOCK
                  </span>
                </div>

                <h2
                  id="smart-match-title"
                  className="mt-3 text-2xl font-bold"
                  style={{
                    color: "#00273D",
                  }}
                >
                  {selectedMatch.title}
                </h2>

                <p
                  className="mt-1 text-sm font-semibold"
                  style={{
                    color: "#475569",
                  }}
                >
                  {selectedMatch.company}
                </p>

                <p
                  className="mt-1 text-xs"
                  style={{
                    color: "#64748B",
                  }}
                >
                  {selectedMatch.location} •{" "}
                  {selectedMatch.employmentType}
                </p>
              </div>
            </div>

            <div className="space-y-6 px-6 pb-7 sm:px-7">
              {/* Match score */}

              <div
                className="rounded-2xl border p-5"
                style={{
                  borderColor: "#BFD9E8",
                  background: "#F8FCFF",
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p
                      className="text-xs font-bold tracking-wide"
                      style={{
                        color: "#64748B",
                      }}
                    >
                      PROFILE MATCH
                    </p>

                    <p
                      className="mt-1 text-sm font-bold"
                      style={{
                        color: "#334155",
                      }}
                    >
                      {getMatchLabel(
                        selectedMatch.matchPercentage
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className="text-3xl font-bold"
                      style={{
                        color:
                          selectedMatch.matchPercentage >=
                          90
                            ? "#16803C"
                            : "#00466D",
                      }}
                    >
                      {selectedMatch.matchPercentage}%
                    </span>
                  </div>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#DDEFF8]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${selectedMatch.matchPercentage}%`,
                      background:
                        "linear-gradient(90deg, #00466D 0%, #1E92D2 100%)",
                    }}
                  />
                </div>

                <p
                  className="mt-3 text-xs leading-5"
                  style={{
                    color: "#64748B",
                  }}
                >
                  {selectedMatch.summary}
                </p>
              </div>

              {/* Why this matches */}

              <div>
                <h3
                  className="text-sm font-bold"
                  style={{
                    color: "#00273D",
                  }}
                >
                  Why this opportunity matches
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor: "#D4D2E6",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{
                          background: "#EAF7EE",
                          color: "#16803C",
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </div>

                      <span
                        className="text-xs font-bold"
                        style={{
                          color: "#334155",
                        }}
                      >
                        Matched Skills
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedMatch.matchedSkills.map(
                        (skill) => (
                          <span
                            key={skill}
                            className="rounded-full px-2.5 py-1.5 text-[10px] font-bold"
                            style={{
                              background: "#EAF7EE",
                              color: "#16803C",
                            }}
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor: "#D4D2E6",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        style={{
                          background: "#FFF8E7",
                          color: "#B77900",
                        }}
                      >
                        <Sparkles className="h-4 w-4" />
                      </div>

                      <span
                        className="text-xs font-bold"
                        style={{
                          color: "#334155",
                        }}
                      >
                        Skills to Develop
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedMatch.missingSkills.length >
                      0 ? (
                        selectedMatch.missingSkills.map(
                          (skill) => (
                            <span
                              key={skill}
                              className="rounded-full px-2.5 py-1.5 text-[10px] font-bold"
                              style={{
                                background: "#FFF8E7",
                                color: "#B77900",
                              }}
                            >
                              {skill}
                            </span>
                          )
                        )
                      ) : (
                        <span
                          className="text-xs"
                          style={{
                            color: "#64748B",
                          }}
                        >
                          No major gaps identified.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Experience / qualification */}

              <div>
                <h3
                  className="text-sm font-bold"
                  style={{
                    color: "#00273D",
                  }}
                >
                  Profile alignment
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor: "#D4D2E6",
                    }}
                  >
                    <p
                      className="text-[10px] font-semibold"
                      style={{
                        color: "#94A3B8",
                      }}
                    >
                      Experience required
                    </p>

                    <p
                      className="mt-1 text-sm font-bold"
                      style={{
                        color: "#334155",
                      }}
                    >
                      {selectedMatch.experienceRequired}
                    </p>
                  </div>

                  <div
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor: "#D4D2E6",
                    }}
                  >
                    <p
                      className="text-[10px] font-semibold"
                      style={{
                        color: "#94A3B8",
                      }}
                    >
                      Your experience
                    </p>

                    <p
                      className="mt-1 text-sm font-bold"
                      style={{
                        color: "#16803C",
                      }}
                    >
                      {selectedMatch.candidateExperience}
                    </p>
                  </div>

                  <div
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor: "#D4D2E6",
                    }}
                  >
                    <p
                      className="text-[10px] font-semibold"
                      style={{
                        color: "#94A3B8",
                      }}
                    >
                      Qualification
                    </p>

                    <p
                      className="mt-1 text-xs font-bold leading-5"
                      style={{
                        color: "#334155",
                      }}
                    >
                      {selectedMatch.qualification}
                    </p>
                  </div>
                </div>
              </div>

              {/* Required skills */}

              <div>
                <h3
                  className="text-sm font-bold"
                  style={{
                    color: "#00273D",
                  }}
                >
                  Role requirements
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedMatch.requiredSkills.map(
                    (skill) => {
                      const isMatched =
                        selectedMatch.matchedSkills.includes(
                          skill
                        );

                      return (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-bold"
                          style={{
                            background: isMatched
                              ? "#EAF5FB"
                              : "#F8FCFF",
                            color: isMatched
                              ? "#00466D"
                              : "#64748B",
                            border:
                              "1px solid #D4D2E6",
                          }}
                        >
                          {isMatched && (
                            <Check className="h-3 w-3" />
                          )}

                          {skill}
                        </span>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Modal actions */}

              <div
                className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end"
                style={{
                  borderColor: "#EEF2F6",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    navigate("/candidate/profile")
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-xs font-bold transition hover:bg-[#F8FCFF]"
                  style={{
                    borderColor: "#00466D",
                    color: "#00466D",
                  }}
                >
                  <UserRound className="h-4 w-4" />
                  Improve My Profile
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/candidate/feed")
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    background:
                      "linear-gradient(135deg, #00466D 0%, #1E92D2 100%)",
                  }}
                >
                  View Opportunity
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <p
                className="text-center text-[10px]"
                style={{
                  color: "#94A3B8",
                }}
              >
                ds net for show my lannie
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}