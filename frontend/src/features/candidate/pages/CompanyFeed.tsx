import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flag,
  Layers3,
  MapPin,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useNotifications } from "../../../context/NotificationsContext";
import { companyService } from "../../company/company.service";

import type {
  CompanyJob,
  EmploymentType,
  WorkplaceType,
} from "../../company/company.types";

import logo from "../../../assets/branding/trucity-logo.png";

/* =========================================================
   TYPES
========================================================= */

type ActiveTab =
  | "companies"
  | "jobs"
  | "saved";

interface CompanyFeedProps {
  onReport?: (company: string) => void;
}

interface CompanySummary {
  name: string;
  jobs: CompanyJob[];
}

interface JobDetailSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

/* =========================================================
   BRAND
========================================================= */

const COLORS = {
  white: "#FFFFFF",
  page: "#F8FCFF",
  teal: "#00466D",
  darkBlue: "#00273D",
  blue: "#1E92D2",
  gold: "#FFAD01",
  orange: "#FFD784",
  border: "#D4E2EA",
  text: "#334155",
  muted: "#64748B",
  soft: "#94A3B8",
  green: "#16804A",
  greenBg: "#E9FFF4",
  red: "#A61B3C",
  redBg: "#FFF1F4",
};

/* =========================================================
   HELPERS
========================================================= */

function safeText(
  value?: string | null,
  fallback = "Not provided"
): string {
  if (!value || !value.trim()) {
    return fallback;
  }

  return value.trim();
}

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-ZA",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function formatRelativeDate(
  value?: string | null
): string {
  if (!value) {
    return "Recently posted";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently posted";
  }

  const diff =
    Date.now() - date.getTime();

  const days = Math.floor(
    diff / (1000 * 60 * 60 * 24)
  );

  if (days <= 0) {
    return "Posted today";
  }

  if (days === 1) {
    return "Posted yesterday";
  }

  if (days < 7) {
    return `Posted ${days} days ago`;
  }

  if (days < 30) {
    return `Posted ${Math.floor(days / 7)} week${
      Math.floor(days / 7) === 1
        ? ""
        : "s"
    } ago`;
  }

  return `Posted ${Math.floor(days / 30)} month${
    Math.floor(days / 30) === 1
      ? ""
      : "s"
  } ago`;
}

function formatSalary(
  job: CompanyJob
): string {
  const currency =
    job.salaryCurrency || "ZAR";

  const symbol =
    currency === "ZAR"
      ? "R"
      : currency;

  const min = job.salaryMin;
  const max = job.salaryMax;

  if (
    min == null &&
    max == null
  ) {
    return job.salaryNegotiable
      ? "Salary negotiable"
      : "Salary not provided";
  }

  const formatNumber = (
    value: number
  ) =>
    new Intl.NumberFormat(
      "en-ZA",
      {
        maximumFractionDigits: 0,
      }
    ).format(value);

  if (
    min != null &&
    max != null
  ) {
    return `${symbol}${formatNumber(
      min
    )} – ${symbol}${formatNumber(max)}`;
  }

  if (min != null) {
    return `From ${symbol}${formatNumber(
      min
    )}`;
  }

  return `Up to ${symbol}${formatNumber(
    max as number
  )}`;
}

function formatEmploymentType(
  value?: EmploymentType | string | null
): string {
  return safeText(
    value,
    "Employment type not provided"
  );
}

function formatWorkplaceType(
  value?: WorkplaceType | string | null
): string {
  return safeText(
    value,
    "Workplace type not provided"
  );
}

function normaliseList(
  value?: string[] | null
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) =>
      typeof item === "string"
        ? item.trim()
        : ""
    )
    .filter(Boolean);
}

function splitTextList(
  value?: string | null
): string[] {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(/\r?\n|•|;/)
    .map((item) =>
      item
        .replace(/^[-*]\s*/, "")
        .trim()
    )
    .filter(Boolean);
}

function getCompanyInitial(
  name: string
): string {
  return (
    name
      .trim()
      .charAt(0)
      .toUpperCase() || "C"
  );
}

function isActiveJob(
  job: CompanyJob
): boolean {
  return (
    String(job.status).toLowerCase() ===
    "active"
  );
}

/* =========================================================
   COMPANY AVATAR
========================================================= */

function CompanyAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-10 w-10 rounded-xl text-sm",
    md: "h-14 w-14 rounded-2xl text-lg",
    lg: "h-20 w-20 rounded-[22px] text-2xl",
  };

  return (
    <div
      className={`
        ${sizes[size]}
        flex
        shrink-0
        items-center
        justify-center
        border
        border-white
        font-bold
        text-white
        shadow-[0_8px_24px_rgba(0,70,109,0.16)]
      `}
      style={{
        background:
          "linear-gradient(135deg,#00466D 0%,#1E92D2 100%)",
      }}
    >
      {getCompanyInitial(name)}
    </div>
  );
}

/* =========================================================
   DETAIL SECTION
========================================================= */

function JobDetailSection({
  title,
  icon,
  children,
}: JobDetailSectionProps) {
  return (
    <section className="rounded-2xl border border-[#D4E2EA] bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[#00466D]">
          {icon}
        </span>

        <h3 className="text-base font-bold text-[#00273D]">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CompanyFeed({
  onReport = () => {},
}: CompanyFeedProps) {
  const navigate = useNavigate();

  const { addNotification } =
    useNotifications();

  /*
   * IMPORTANT:
   *
   * Open Roles is intentionally the default tab.
   */
  const [activeTab, setActiveTab] =
    useState<ActiveTab>("jobs");

  const [jobs, setJobs] =
    useState<CompanyJob[]>([]);

  const [loadingJobs, setLoadingJobs] =
    useState(true);

  const [jobError, setJobError] =
    useState<string | null>(null);

  const [jobSearchQuery, setJobSearchQuery] =
    useState("");

  const [jobFilter, setJobFilter] =
    useState("All");

  const [selectedJob, setSelectedJob] =
    useState<CompanyJob | null>(null);

  const [selectedCompany, setSelectedCompany] =
    useState<CompanySummary | null>(null);

  const [dismissedCompanies, setDismissedCompanies] =
    useState<string[]>([]);

  /*
   * Saved jobs are local to the candidate browser.
   * The actual job information still comes from PostgreSQL.
   */
  const [savedJobs, setSavedJobs] =
    useState<string[]>(() => {
      try {
        const stored =
          localStorage.getItem(
            "trucity-saved-jobs"
          );

        if (!stored) {
          return [];
        }

        const parsed: unknown =
          JSON.parse(stored);

        if (!Array.isArray(parsed)) {
          return [];
        }

        return parsed.filter(
          (value): value is string =>
            typeof value === "string"
        );
      } catch {
        return [];
      }
    });

  /*
   * Applied jobs are also retained locally so the
   * candidate can immediately see which jobs they
   * already expressed interest in.
   */
  const [appliedJobs, setAppliedJobs] =
    useState<string[]>(() => {
      try {
        const stored =
          localStorage.getItem(
            "trucity-candidate-applied-jobs"
          );

        if (!stored) {
          return [];
        }

        const parsed: unknown =
          JSON.parse(stored);

        if (!Array.isArray(parsed)) {
          return [];
        }

        return parsed.filter(
          (value): value is string =>
            typeof value === "string"
        );
      } catch {
        return [];
      }
    });

  /* =========================================================
     LOAD OPEN ROLES IMMEDIATELY
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const loadOpenJobs = async () => {
      try {
        setLoadingJobs(true);
        setJobError(null);

        /*
         * getOpenJobs() is the candidate-safe service
         * method for /api/jobs/open.
         *
         * This is deliberately NOT getJobs(), because
         * getJobs() is the employer's own-job endpoint.
         */
        const service =
          companyService as typeof companyService & {
            getOpenJobs?: () => Promise<CompanyJob[]>;
          };

        let result: CompanyJob[] = [];

        if (
          typeof service.getOpenJobs ===
          "function"
        ) {
          result =
            await service.getOpenJobs();
        } else {
          /*
           * Compatibility fallback in case the currently
           * installed service has not yet exposed getOpenJobs.
           *
           * The active filtering still prevents closed jobs
           * from appearing in the candidate feed.
           */
          result =
            await service.getJobs();
        }

        if (!mounted) {
          return;
        }

        setJobs(
          Array.isArray(result)
            ? result.filter(isActiveJob)
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load open roles:",
          error
        );

        if (!mounted) {
          return;
        }

        setJobs([]);

        setJobError(
          "We could not load open roles right now. Please try again."
        );
      } finally {
        if (mounted) {
          setLoadingJobs(false);
        }
      }
    };

    void loadOpenJobs();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================================================
     SAVE STATE
  ========================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        "trucity-saved-jobs",
        JSON.stringify(savedJobs)
      );
    } catch {
      // Ignore localStorage failures.
    }
  }, [savedJobs]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "trucity-candidate-applied-jobs",
        JSON.stringify(appliedJobs)
      );
    } catch {
      // Ignore localStorage failures.
    }
  }, [appliedJobs]);

  /* =========================================================
     COMPANY GROUPING
  ========================================================= */

  const companies = useMemo<CompanySummary[]>(
    () => {
      const map =
        new Map<string, CompanyJob[]>();

      jobs.forEach((job) => {
        const companyName =
          safeText(
            job.companyName,
            "Company"
          );

        const existing =
          map.get(companyName) ?? [];

        existing.push(job);

        map.set(
          companyName,
          existing
        );
      });

      return Array.from(map.entries())
        .map(
          ([name, companyJobs]) => ({
            name,
            jobs: companyJobs,
          })
        )
        .filter(
          (company) =>
            !dismissedCompanies.includes(
              company.name
            )
        );
    },
    [
      jobs,
      dismissedCompanies,
    ]
  );

  /* =========================================================
     FILTER OPTIONS
  ========================================================= */

  const departments = useMemo(() => {
    const values =
      jobs
        .map((job) =>
          job.department?.trim()
        )
        .filter(
          (value): value is string =>
            Boolean(value)
        );

    return [
      "All",
      ...Array.from(
        new Set(values)
      ).sort(),
    ];
  }, [jobs]);

  /* =========================================================
     FILTERED JOBS
  ========================================================= */

  const filteredJobs = useMemo(() => {
    const query =
      jobSearchQuery
        .trim()
        .toLowerCase();

    return jobs.filter((job) => {
      if (
        jobFilter !== "All" &&
        job.department !== jobFilter
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        job.title,
        job.companyName,
        job.department,
        job.location,
        job.workplaceType,
        job.type,
        job.description,
        job.qualifications,
        job.experienceRequired,
        job.responsibilities,
        job.benefits,
        ...(job.skills ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        query
      );
    });
  }, [
    jobs,
    jobFilter,
    jobSearchQuery,
  ]);

  /* =========================================================
     SAVED JOBS VIEW
  ========================================================= */

  const savedJobList = useMemo(
    () =>
      jobs.filter((job) =>
        savedJobs.includes(
          job.id
        )
      ),
    [jobs, savedJobs]
  );

  /* =========================================================
     TOGGLE SAVE
  ========================================================= */

  const toggleSaveJob = (
    jobId: string
  ) => {
    setSavedJobs((current) => {
      if (current.includes(jobId)) {
        return current.filter(
          (id) => id !== jobId
        );
      }

      return [
        ...current,
        jobId,
      ];
    });
  };

  /* =========================================================
     EXPRESS INTEREST
  ========================================================= */

  const handleExpressInterest = (
    job: CompanyJob
  ) => {
    if (appliedJobs.includes(job.id)) {
      return;
    }

    const companyName =
      safeText(
        job.companyName,
        "the company"
      );

    setAppliedJobs((current) => [
      ...current,
      job.id,
    ]);

    try {
      addNotification({
        id: crypto.randomUUID(),
        type: "application",
        title: "Interest submitted",
        message: `Your interest in ${job.title} at ${companyName} has been recorded.`,
        time: new Date().toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
        read: false,
        destination: "/candidate",
      });
    } catch (error) {
      console.error(
        "Unable to create notification:",
        error
      );
    }
  };

  /* =========================================================
     COMPANY ACTIONS
  ========================================================= */

  const handleReportCompany = (
    companyName: string
  ) => {
    onReport(companyName);
  };

  const dismissCompany = (
    companyName: string
  ) => {
    setDismissedCompanies(
      (current) =>
        current.includes(companyName)
          ? current
          : [
              ...current,
              companyName,
            ]
    );

    setSelectedCompany(null);
  };

  /* =========================================================
     JOB CARD
  ========================================================= */

  const renderJobCard = (
    job: CompanyJob
  ) => {
    const saved =
      savedJobs.includes(job.id);

    const applied =
      appliedJobs.includes(job.id);

    const companyName =
      safeText(
        job.companyName,
        "Company"
      );

    const skills =
      normaliseList(
        job.skills
      );

    return (
      <article
        key={job.id}
        className="
          group
          rounded-[24px]
          border
          border-[#D4E2EA]
          bg-white
          p-5
          shadow-[0_12px_35px_rgba(0,70,109,0.07)]
          transition
          duration-200
          hover:-translate-y-0.5
          hover:shadow-[0_18px_42px_rgba(0,70,109,0.12)]
        "
      >
        <div className="flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <CompanyAvatar
                name={companyName}
                size="md"
              />

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight text-[#00273D]">
                    {safeText(
                      job.title,
                      "Untitled position"
                    )}
                  </h2>

                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E9FFF4] px-2.5 py-1 text-[11px] font-bold text-[#16804A]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Open
                  </span>
                </div>

                <p className="mt-1 text-sm font-semibold text-[#00466D]">
                  {companyName}
                </p>

                <p className="mt-1 text-xs text-[#64748B]">
                  {formatRelativeDate(
                    job.postedDate
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                toggleSaveJob(job.id)
              }
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-[#D4E2EA]
                bg-white
                text-[#00466D]
                transition
                hover:border-[#FFAD01]
                hover:bg-[#FFF8E8]
              "
              aria-label={
                saved
                  ? "Remove saved job"
                  : "Save job"
              }
              title={
                saved
                  ? "Remove from saved jobs"
                  : "Save job"
              }
            >
              {saved ? (
                <BookmarkCheck className="h-5 w-5 text-[#FFAD01]" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Quick information */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-[#F8FCFF] p-3">
              <div className="mb-1 flex items-center gap-2 text-[#64748B]">
                <MapPin className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">
                  Location
                </span>
              </div>

              <p className="text-sm font-semibold text-[#334155]">
                {safeText(
                  job.location
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F8FCFF] p-3">
              <div className="mb-1 flex items-center gap-2 text-[#64748B]">
                <Briefcase className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">
                  Employment
                </span>
              </div>

              <p className="text-sm font-semibold text-[#334155]">
                {formatEmploymentType(
                  job.type
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F8FCFF] p-3">
              <div className="mb-1 flex items-center gap-2 text-[#64748B]">
                <Building2 className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">
                  Workplace
                </span>
              </div>

              <p className="text-sm font-semibold text-[#334155]">
                {formatWorkplaceType(
                  job.workplaceType
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-[#FFF8E8] p-3">
              <div className="mb-1 flex items-center gap-2 text-[#8A6500]">
                <span className="text-sm font-bold">
                  R
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide">
                  Salary
                </span>
              </div>

              <p className="text-sm font-bold text-[#334155]">
                {formatSalary(job)}
              </p>
            </div>
          </div>

          {/* Description */}
          {job.description && (
            <p className="line-clamp-3 text-sm leading-6 text-[#64748B]">
              {job.description}
            </p>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills
                .slice(0, 5)
                .map((skill) => (
                  <span
                    key={skill}
                    className="
                      rounded-full
                      border
                      border-[#D4E2EA]
                      bg-[#F8FCFF]
                      px-3
                      py-1.5
                      text-xs
                      font-medium
                      text-[#334155]
                    "
                  >
                    {skill}
                  </span>
                ))}

              {skills.length > 5 && (
                <span className="rounded-full bg-[#EEF8FD] px-3 py-1.5 text-xs font-semibold text-[#00466D]">
                  +{skills.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-col gap-3 border-t border-[#E7EEF2] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Clock3 className="h-4 w-4" />

              <span>
                {job.applicationDeadline
                  ? `Apply by ${formatDate(
                      job.applicationDeadline
                    )}`
                  : "No closing date provided"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setSelectedJob(job)
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-[#D4E2EA]
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-[#00466D]
                  transition
                  hover:border-[#00466D]
                  hover:bg-[#F8FCFF]
                "
              >
                More Info
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                disabled={applied}
                onClick={() =>
                  handleExpressInterest(
                    job
                  )
                }
                className={`
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  transition
                  ${
                    applied
                      ? "cursor-default bg-[#E9FFF4] text-[#16804A]"
                      : "bg-[#FFAD01] text-[#00273D] hover:bg-[#FFD784]"
                  }
                `}
              >
                {applied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Interest Submitted
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Express Interest
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  };

  /* =========================================================
     COMPANY CARD
  ========================================================= */

  const renderCompanyCard = (
    company: CompanySummary
  ) => {
    const companyJobs =
      company.jobs;

    const locations =
      Array.from(
        new Set(
          companyJobs
            .map((job) =>
              job.location?.trim()
            )
            .filter(Boolean)
        )
      );

    const departments =
      Array.from(
        new Set(
          companyJobs
            .map((job) =>
              job.department?.trim()
            )
            .filter(Boolean)
        )
      );

    return (
      <article
        key={company.name}
        className="
          rounded-[24px]
          border
          border-[#D4E2EA]
          bg-white
          p-5
          shadow-[0_12px_35px_rgba(0,70,109,0.07)]
        "
      >
        <div className="flex items-start gap-4">
          <CompanyAvatar
            name={company.name}
            size="lg"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#00273D]">
                  {company.name}
                </h2>

                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E9FFF4] px-3 py-1 text-xs font-bold text-[#16804A]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Open roles available
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF8FD] px-3 py-1 text-xs font-semibold text-[#00466D]">
                    <Briefcase className="h-3.5 w-3.5" />
                    {companyJobs.length} open role
                    {companyJobs.length ===
                    1
                      ? ""
                      : "s"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedCompany(
                    company
                  )
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-[#D4E2EA]
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-[#00466D]
                  transition
                  hover:border-[#00466D]
                  hover:bg-[#F8FCFF]
                "
              >
                More Info
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#F8FCFF] p-4">
                <div className="mb-2 flex items-center gap-2 text-[#64748B]">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs font-semibold">
                    Locations
                  </span>
                </div>

                <p className="text-sm font-semibold text-[#334155]">
                  {locations.length > 0
                    ? locations.join(
                        " • "
                      )
                    : "Not provided"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#F8FCFF] p-4">
                <div className="mb-2 flex items-center gap-2 text-[#64748B]">
                  <Layers3 className="h-4 w-4" />
                  <span className="text-xs font-semibold">
                    Areas hiring
                  </span>
                </div>

                <p className="text-sm font-semibold text-[#334155]">
                  {departments.length > 0
                    ? departments.join(
                        " • "
                      )
                    : "Various roles"}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
                Current open roles
              </p>

              <div className="space-y-2">
                {companyJobs
                  .slice(0, 3)
                  .map((job) => (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() =>
                        setSelectedJob(
                          job
                        )
                      }
                      className="
                        flex
                        w-full
                        items-center
                        justify-between
                        gap-3
                        rounded-xl
                        border
                        border-[#E7EEF2]
                        bg-white
                        px-3
                        py-3
                        text-left
                        transition
                        hover:border-[#FFAD01]
                        hover:bg-[#FFFDF7]
                      "
                    >
                      <span className="text-sm font-semibold text-[#334155]">
                        {safeText(
                          job.title,
                          "Open position"
                        )}
                      </span>

                      <ChevronRight className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  };

  /* =========================================================
     BACKGROUND
  ========================================================= */

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        backgroundColor:
          COLORS.page,
      }}
    >
      {/* Background watermark */}
      <div
        className="
          pointer-events-none
          fixed
          inset-0
          z-0
          bg-center
          bg-no-repeat
          opacity-[0.035]
        "
        style={{
          backgroundImage: `url(${logo})`,
          backgroundSize: "620px",
        }}
      />

      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-24 top-20 h-64 w-64 rounded-full bg-[#1E92D2]/[0.05]" />
      <div className="pointer-events-none absolute -left-28 top-[42%] h-72 w-72 rounded-full bg-[#FFAD01]/[0.06]" />
      <div className="pointer-events-none absolute right-[8%] bottom-20 h-48 w-48 rounded-full bg-[#1E92D2]/[0.04]" />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <section className="mb-7">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#FFAD01]">
            Discover Opportunities
          </p>

          <h1 className="text-[32px] font-bold tracking-[-0.035em] text-[#00466D] sm:text-[40px]">
            Find your next{" "}
            <span className="text-[#FFAD01]">
              opportunity.
            </span>
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">
            Browse open roles from employers
            on TruCity and explore the
            opportunities that match your
            professional profile.
          </p>
        </section>

        {/* =====================================================
            TABS
        ===================================================== */}

        <div
          className="
            sticky
            top-4
            z-30
            mb-7
            rounded-[24px]
            border
            border-[#D4E2EA]
            bg-white/95
            p-4
            shadow-[0_16px_40px_rgba(0,70,109,0.10)]
            backdrop-blur-xl
          "
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex overflow-x-auto rounded-[14px] border border-[#D4E2EA] bg-[#F8FCFF] p-1">
              <button
                type="button"
                onClick={() =>
                  setActiveTab("companies")
                }
                className={`
                  inline-flex
                  shrink-0
                  items-center
                  gap-2
                  rounded-xl
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  transition
                  ${
                    activeTab ===
                    "companies"
                      ? "bg-[#00466D] text-white shadow-sm"
                      : "text-[#64748B] hover:text-[#00466D]"
                  }
                `}
              >
                <Building2 className="h-4 w-4" />
                Companies
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveTab("jobs")
                }
                className={`
                  inline-flex
                  shrink-0
                  items-center
                  gap-2
                  rounded-xl
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  transition
                  ${
                    activeTab === "jobs"
                      ? "bg-[#00466D] text-white shadow-sm"
                      : "text-[#64748B] hover:text-[#00466D]"
                  }
                `}
              >
                <Briefcase className="h-4 w-4" />
                Open Roles ({jobs.length})
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveTab("saved")
                }
                className={`
                  inline-flex
                  shrink-0
                  items-center
                  gap-2
                  rounded-xl
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  transition
                  ${
                    activeTab === "saved"
                      ? "bg-[#00466D] text-white shadow-sm"
                      : "text-[#64748B] hover:text-[#00466D]"
                  }
                `}
              >
                <Bookmark className="h-4 w-4" />
                Saved ({savedJobList.length})
              </button>
            </div>

            {/* Search */}
            {activeTab === "jobs" && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative min-w-0 sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

                  <input
                    value={
                      jobSearchQuery
                    }
                    onChange={(event) =>
                      setJobSearchQuery(
                        event.target.value
                      )
                    }
                    placeholder="Search jobs, skills or companies..."
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-[#D4E2EA]
                      bg-white
                      pl-10
                      pr-4
                      text-sm
                      text-[#334155]
                      outline-none
                      transition
                      placeholder:text-[#94A3B8]
                      focus:border-[#1E92D2]
                      focus:ring-2
                      focus:ring-[#1E92D2]/10
                    "
                  />
                </div>

                <select
                  value={jobFilter}
                  onChange={(event) =>
                    setJobFilter(
                      event.target.value
                    )
                  }
                  className="
                    h-11
                    rounded-xl
                    border
                    border-[#D4E2EA]
                    bg-white
                    px-3
                    text-sm
                    font-medium
                    text-[#334155]
                    outline-none
                    focus:border-[#1E92D2]
                  "
                >
                  {departments.map(
                    (department) => (
                      <option
                        key={department}
                        value={department}
                      >
                        {department ===
                        "All"
                          ? "All departments"
                          : department}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            COMPANIES
        ===================================================== */}

        {activeTab === "companies" && (
          <section>
            {loadingJobs ? (
              <LoadingState text="Loading companies..." />
            ) : companies.length ===
              0 ? (
              <EmptyState
                icon={
                  <Building2 className="h-8 w-8" />
                }
                title="No companies available"
                message="There are currently no employers with open roles to display."
              />
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {companies.map(
                  renderCompanyCard
                )}
              </div>
            )}
          </section>
        )}

        {/* =====================================================
            OPEN ROLES
        ===================================================== */}

        {activeTab === "jobs" && (
          <section>
            {loadingJobs ? (
              <LoadingState text="Loading open roles..." />
            ) : jobError ? (
              <EmptyState
                icon={
                  <Briefcase className="h-8 w-8" />
                }
                title="Open roles could not be loaded"
                message={jobError}
                action={
                  <button
                    type="button"
                    onClick={() =>
                      window.location.reload()
                    }
                    className="rounded-xl bg-[#00466D] px-4 py-2.5 text-sm font-bold text-white"
                  >
                    Try Again
                  </button>
                }
              />
            ) : filteredJobs.length ===
              0 ? (
              <EmptyState
                icon={
                  <Search className="h-8 w-8" />
                }
                title={
                  jobs.length === 0
                    ? "No open roles available"
                    : "No matching roles"
                }
                message={
                  jobs.length === 0
                    ? "There are currently no active job opportunities."
                    : "Try changing your search or department filter."
                }
                action={
                  jobs.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setJobSearchQuery(
                          ""
                        );
                        setJobFilter(
                          "All"
                        );
                      }}
                      className="rounded-xl bg-[#00466D] px-4 py-2.5 text-sm font-bold text-white"
                    >
                      Clear Filters
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-[#00273D]">
                      Open Roles
                    </h2>

                    <p className="mt-1 text-sm text-[#64748B]">
                      {filteredJobs.length} role
                      {filteredJobs.length ===
                      1
                        ? ""
                        : "s"}{" "}
                      available
                    </p>
                  </div>
                </div>

                {filteredJobs.map(
                  renderJobCard
                )}
              </div>
            )}
          </section>
        )}

        {/* =====================================================
            SAVED JOBS
        ===================================================== */}

        {activeTab === "saved" && (
          <section>
            {savedJobList.length ===
            0 ? (
              <EmptyState
                icon={
                  <Bookmark className="h-8 w-8" />
                }
                title="No saved jobs yet"
                message="Save roles you're interested in and they'll appear here."
                action={
                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab("jobs")
                    }
                    className="rounded-xl bg-[#00466D] px-4 py-2.5 text-sm font-bold text-white"
                  >
                    Browse Open Roles
                  </button>
                }
              />
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-[#00273D]">
                    Saved Roles
                  </h2>

                  <p className="mt-1 text-sm text-[#64748B]">
                    Jobs you've saved for later.
                  </p>
                </div>

                {savedJobList.map(
                  renderJobCard
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {/* =======================================================
          JOB MORE INFO MODAL
      ======================================================= */}

      {selectedJob && (
        <div
          className="
            fixed
            left-0
            right-0
            bottom-0
            top-[88px]
            z-[100]
            flex
            items-center
            justify-center
            bg-[#00273D]/50
            p-3
            sm:p-4
            backdrop-blur-sm
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedJob(null);
            }
          }}
        >
          <div
            className="
              flex
              h-[calc(100dvh-88px)]
              max-h-[calc(100dvh-88px)]
              w-full
              max-w-4xl
              flex-col
              overflow-hidden
              rounded-[28px]
              bg-[#F8FCFF]
              shadow-[0_30px_90px_rgba(0,39,61,0.30)]
            "
          >
            {/* Modal header */}
            <div className="relative shrink-0 border-b border-[#D4E2EA] bg-white px-5 py-5 sm:px-7">
              <button
                type="button"
                onClick={() =>
                  setSelectedJob(null)
                }
                className="
                  absolute
                  right-4
                  top-4
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-[#D4E2EA]
                  bg-white
                  text-[#64748B]
                  transition
                  hover:border-[#00466D]
                  hover:text-[#00466D]
                "
                aria-label="Close job details"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-start gap-4 pr-12">
                <CompanyAvatar
                  name={safeText(
                    selectedJob.companyName,
                    "Company"
                  )}
                  size="lg"
                />

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#E9FFF4] px-3 py-1 text-xs font-bold text-[#16804A]">
                      Open Position
                    </span>

                    {selectedJob.applicationDeadline && (
                      <span className="rounded-full bg-[#EEF8FD] px-3 py-1 text-xs font-semibold text-[#00466D]">
                        Apply by{" "}
                        {formatDate(
                          selectedJob.applicationDeadline
                        )}
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#00273D] sm:text-3xl">
                    {safeText(
                      selectedJob.title,
                      "Untitled position"
                    )}
                  </h2>

                  <p className="mt-1 text-base font-semibold text-[#00466D]">
                    {safeText(
                      selectedJob.companyName,
                      "Company"
                    )}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#64748B]">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {safeText(
                        selectedJob.location
                      )}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" />
                      {formatEmploymentType(
                        selectedJob.type
                      )}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" />
                      {formatWorkplaceType(
                        selectedJob.workplaceType
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal body */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-7">
              <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
                <div className="space-y-5">
                  {/* About this role */}
                  <JobDetailSection
                    title="About this role"
                    icon={
                      <Briefcase className="h-5 w-5" />
                    }
                  >
                    <p className="whitespace-pre-line text-sm leading-7 text-[#475569]">
                      {safeText(
                        selectedJob.description,
                        "The employer has not provided a detailed description for this role yet."
                      )}
                    </p>
                  </JobDetailSection>

                  {/* Responsibilities */}
                  <JobDetailSection
                    title="What you'll do"
                    icon={
                      <CheckCircle2 className="h-5 w-5" />
                    }
                  >
                    {(() => {
                      const items =
                        splitTextList(
                          selectedJob.responsibilities
                        );

                      if (
                        items.length ===
                        0
                      ) {
                        return (
                          <p className="text-sm leading-6 text-[#64748B]">
                            Responsibilities have
                            not been provided for
                            this position.
                          </p>
                        );
                      }

                      return (
                        <ul className="space-y-3">
                          {items.map(
                            (
                              item,
                              index
                            ) => (
                              <li
                                key={`${item}-${index}`}
                                className="flex gap-3 text-sm leading-6 text-[#475569]"
                              >
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FFAD01]" />
                                <span>
                                  {item}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      );
                    })()}
                  </JobDetailSection>

                  {/* Requirements */}
                  <JobDetailSection
                    title="What we're looking for"
                    icon={
                      <Users className="h-5 w-5" />
                    }
                  >
                    <div className="space-y-5">
                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
                          Experience
                        </p>

                        <p className="whitespace-pre-line text-sm leading-6 text-[#475569]">
                          {safeText(
                            selectedJob.experienceRequired,
                            "Experience requirements have not been provided."
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
                          Qualifications
                        </p>

                        <p className="whitespace-pre-line text-sm leading-6 text-[#475569]">
                          {safeText(
                            selectedJob.qualifications,
                            "Qualification requirements have not been provided."
                          )}
                        </p>
                      </div>

                      {normaliseList(
                        selectedJob.skills
                      ).length >
                        0 && (
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
                            Skills
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {normaliseList(
                              selectedJob.skills
                            ).map(
                              (skill) => (
                                <span
                                  key={
                                    skill
                                  }
                                  className="rounded-full border border-[#D4E2EA] bg-[#F8FCFF] px-3 py-1.5 text-xs font-semibold text-[#334155]"
                                >
                                  {skill}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </JobDetailSection>

                  {/* Benefits */}
                  <JobDetailSection
                    title="What you get"
                    icon={
                      <CheckCircle2 className="h-5 w-5" />
                    }
                  >
                    {(() => {
                      const items =
                        splitTextList(
                          selectedJob.benefits
                        );

                      if (
                        items.length ===
                        0
                      ) {
                        return (
                          <p className="text-sm leading-6 text-[#64748B]">
                            Benefits have not
                            been provided for
                            this position.
                          </p>
                        );
                      }

                      return (
                        <ul className="space-y-3">
                          {items.map(
                            (
                              item,
                              index
                            ) => (
                              <li
                                key={`${item}-${index}`}
                                className="flex gap-3 text-sm leading-6 text-[#475569]"
                              >
                                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#16804A]" />
                                <span>
                                  {item}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      );
                    })()}
                  </JobDetailSection>
                </div>

                {/* Right information column */}
                <aside className="space-y-4">
                  <div className="rounded-2xl border border-[#D4E2EA] bg-white p-5">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#94A3B8]">
                      Job information
                    </h3>

                    <div className="space-y-4">
                      <InfoRow
                        icon={
                          <span className="font-bold text-sm">
                            R
                          </span>
                        }
                        label="Salary"
                        value={formatSalary(
                          selectedJob
                        )}
                      />

                      <InfoRow
                        icon={
                          <MapPin className="h-4 w-4" />
                        }
                        label="Location"
                        value={safeText(
                          selectedJob.location
                        )}
                      />

                      <InfoRow
                        icon={
                          <Building2 className="h-4 w-4" />
                        }
                        label="Workplace"
                        value={formatWorkplaceType(
                          selectedJob.workplaceType
                        )}
                      />

                      <InfoRow
                        icon={
                          <Briefcase className="h-4 w-4" />
                        }
                        label="Employment"
                        value={formatEmploymentType(
                          selectedJob.type
                        )}
                      />

                      <InfoRow
                        icon={
                          <Layers3 className="h-4 w-4" />
                        }
                        label="Department"
                        value={safeText(
                          selectedJob.department,
                          "Not specified"
                        )}
                      />

                      <InfoRow
                        icon={
                          <Users className="h-4 w-4" />
                        }
                        label="Openings"
                        value={
                          selectedJob.openings !=
                          null
                            ? String(
                                selectedJob.openings
                              )
                            : "Not specified"
                        }
                      />

                      <InfoRow
                        icon={
                          <CalendarDays className="h-4 w-4" />
                        }
                        label="Posted"
                        value={formatDate(
                          selectedJob.postedDate
                        )}
                      />

                      <InfoRow
                        icon={
                          <Clock3 className="h-4 w-4" />
                        }
                        label="Deadline"
                        value={
                          selectedJob.applicationDeadline
                            ? formatDate(
                                selectedJob.applicationDeadline
                              )
                            : "Not specified"
                        }
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div className="rounded-2xl border border-[#D4E2EA] bg-white p-5">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#94A3B8]">
                      Company
                    </h3>

                    <div className="flex items-center gap-3">
                      <CompanyAvatar
                        name={safeText(
                          selectedJob.companyName,
                          "Company"
                        )}
                        size="sm"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#00273D]">
                          {safeText(
                            selectedJob.companyName,
                            "Company"
                          )}
                        </p>

                        <p className="mt-1 text-xs text-[#64748B]">
                          {safeText(
                            selectedJob.location
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const companyName =
                          safeText(
                            selectedJob.companyName,
                            "Company"
                          );

                        const companyJobs =
                          jobs.filter(
                            (job) =>
                              safeText(
                                job.companyName,
                                "Company"
                              ) ===
                              companyName
                          );

                        setSelectedJob(
                          null
                        );

                        setSelectedCompany({
                          name: companyName,
                          jobs: companyJobs,
                        });
                      }}
                      className="
                        mt-4
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-[#D4E2EA]
                        px-4
                        py-2.5
                        text-sm
                        font-bold
                        text-[#00466D]
                        transition
                        hover:border-[#00466D]
                        hover:bg-[#F8FCFF]
                      "
                    >
                      View Company
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </aside>
              </div>
            </div>

            {/* Modal footer */}
            <div className="shrink-0 border-t border-[#D4E2EA] bg-white px-5 py-4 sm:px-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() =>
                    toggleSaveJob(
                      selectedJob.id
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-[#D4E2EA]
                    px-4
                    py-3
                    text-sm
                    font-bold
                    text-[#00466D]
                  "
                >
                  {savedJobs.includes(
                    selectedJob.id
                  ) ? (
                    <>
                      <BookmarkCheck className="h-4 w-4 text-[#FFAD01]" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4" />
                      Save Job
                    </>
                  )}
                </button>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={appliedJobs.includes(
                      selectedJob.id
                    )}
                    onClick={() =>
                      handleExpressInterest(
                        selectedJob
                      )
                    }
                    className={`
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      px-5
                      py-3
                      text-sm
                      font-bold
                      ${
                        appliedJobs.includes(
                          selectedJob.id
                        )
                          ? "bg-[#E9FFF4] text-[#16804A]"
                          : "bg-[#FFAD01] text-[#00273D] hover:bg-[#FFD784]"
                      }
                    `}
                  >
                    {appliedJobs.includes(
                      selectedJob.id
                    ) ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Interest Submitted
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Express Interest
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          COMPANY MORE INFO MODAL
      ======================================================= */}

      {selectedCompany && (
        <div
          className="
            fixed
            left-0
            right-0
            bottom-0
            top-[88px]
            z-[100]
            flex
            items-center
            justify-center
            bg-[#00273D]/50
            p-3
            sm:p-4
            backdrop-blur-sm
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedCompany(null);
            }
          }}
        >
          <div
            className="
              flex
              h-[calc(100dvh-88px)]
              max-h-[calc(100dvh-88px)]
              w-full
              max-w-3xl
              flex-col
              overflow-hidden
              rounded-[28px]
              bg-[#F8FCFF]
              shadow-[0_30px_90px_rgba(0,39,61,0.30)]
            "
          >
            {/* Header */}
            <div className="shrink-0 border-b border-[#D4E2EA] bg-white px-5 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <CompanyAvatar
                    name={
                      selectedCompany.name
                    }
                    size="lg"
                  />

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFAD01]">
                      Employer
                    </p>

                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#00273D]">
                      {selectedCompany.name}
                    </h2>

                    <p className="mt-1 text-sm text-[#64748B]">
                      {selectedCompany.jobs.length}{" "}
                      open role
                      {selectedCompany.jobs.length ===
                      1
                        ? ""
                        : "s"}{" "}
                      currently available
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedCompany(
                      null
                    )
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D4E2EA] text-[#64748B] hover:text-[#00466D]"
                  aria-label="Close company details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-7">
              <div className="space-y-5">
                <section className="rounded-2xl border border-[#D4E2EA] bg-white p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#00466D]" />

                    <h3 className="text-base font-bold text-[#00273D]">
                      About this company
                    </h3>
                  </div>

                  <p className="text-sm leading-7 text-[#475569]">
                    {selectedCompany.name} is
                    currently advertising{" "}
                    {
                      selectedCompany.jobs
                        .length
                    }{" "}
                    open position
                    {selectedCompany.jobs
                      .length === 1
                      ? ""
                      : "s"}{" "}
                    on TruCity.
                  </p>

                  <p className="mt-3 text-sm leading-7 text-[#64748B]">
                    The company information shown
                    here is based on the employer and
                    role information currently available
                    through TruCity. We do not display
                    information that has not been supplied
                    by the employer.
                  </p>
                </section>

                <section className="rounded-2xl border border-[#D4E2EA] bg-white p-5">
                  <h3 className="mb-4 text-base font-bold text-[#00273D]">
                    Current opportunities
                  </h3>

                  <div className="space-y-3">
                    {selectedCompany.jobs.map(
                      (job) => (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => {
                            setSelectedCompany(
                              null
                            );
                            setSelectedJob(
                              job
                            );
                          }}
                          className="
                            flex
                            w-full
                            items-center
                            justify-between
                            gap-4
                            rounded-2xl
                            border
                            border-[#E7EEF2]
                            bg-[#F8FCFF]
                            p-4
                            text-left
                            transition
                            hover:border-[#FFAD01]
                            hover:bg-[#FFFDF7]
                          "
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#00273D]">
                              {safeText(
                                job.title,
                                "Open position"
                              )}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#64748B]">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {safeText(
                                  job.location
                                )}
                              </span>

                              <span className="inline-flex items-center gap-1">
                                <Briefcase className="h-3.5 w-3.5" />
                                {formatEmploymentType(
                                  job.type
                                )}
                              </span>
                            </div>
                          </div>

                          <ChevronRight className="h-5 w-5 shrink-0 text-[#94A3B8]" />
                        </button>
                      )
                    )}
                  </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#D4E2EA] bg-white p-5">
                    <div className="mb-3 flex items-center gap-2 text-[#00466D]">
                      <MapPin className="h-5 w-5" />

                      <h3 className="text-sm font-bold">
                        Locations
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {Array.from(
                        new Set(
                          selectedCompany.jobs
                            .map(
                              (job) =>
                                job.location?.trim()
                            )
                            .filter(Boolean)
                        )
                      ).map(
                        (location) => (
                          <p
                            key={
                              location
                            }
                            className="text-sm text-[#475569]"
                          >
                            {location}
                          </p>
                        )
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#D4E2EA] bg-white p-5">
                    <div className="mb-3 flex items-center gap-2 text-[#00466D]">
                      <Layers3 className="h-5 w-5" />

                      <h3 className="text-sm font-bold">
                        Areas of work
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {Array.from(
                        new Set(
                          selectedCompany.jobs
                            .map(
                              (job) =>
                                job.department?.trim()
                            )
                            .filter(Boolean)
                        )
                      ).map(
                        (department) => (
                          <p
                            key={
                              department
                            }
                            className="text-sm text-[#475569]"
                          >
                            {department}
                          </p>
                        )
                      )}

                      {selectedCompany.jobs.every(
                        (job) =>
                          !job.department?.trim()
                      ) && (
                        <p className="text-sm text-[#64748B]">
                          Department information
                          has not been provided.
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-[#D4E2EA] bg-[#EEF8FD] p-5">
                  <div className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#16804A]" />

                    <div>
                      <h3 className="text-sm font-bold text-[#00273D]">
                        Information available on
                        TruCity
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-[#475569]">
                        Job information is provided by
                        the employer and displayed from
                        the current TruCity listing.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-[#D4E2EA] bg-white px-5 py-4 sm:px-7">
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    dismissCompany(
                      selectedCompany.name
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-[#D4E2EA]
                    px-4
                    py-3
                    text-sm
                    font-bold
                    text-[#64748B]
                    hover:border-[#FF4672]
                    hover:text-[#A61B3C]
                  "
                >
                  <Flag className="h-4 w-4" />
                  Hide Company
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleReportCompany(
                      selectedCompany.name
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-[#D4E2EA]
                    px-4
                    py-3
                    text-sm
                    font-bold
                    text-[#A61B3C]
                    hover:bg-[#FFF1F4]
                  "
                >
                  <Flag className="h-4 w-4" />
                  Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F8FCFF] text-[#00466D]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm font-semibold text-[#334155]">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#D4E2EA] bg-white p-10 text-center shadow-[0_12px_35px_rgba(0,70,109,0.06)]">
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#D4E2EA] border-t-[#00466D]" />

      <p className="text-sm font-semibold text-[#64748B]">
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-[#D4E2EA] bg-white p-10 text-center shadow-[0_12px_35px_rgba(0,70,109,0.06)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF8FD] text-[#00466D]">
        {icon}
      </div>

      <h2 className="mt-5 text-lg font-bold text-[#00273D]">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">
        {message}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
}