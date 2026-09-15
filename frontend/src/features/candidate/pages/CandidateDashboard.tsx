import { useMemo } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  MessageSquare,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function CandidateDashboard() {
  const navigate = useNavigate();

  const metrics = useMemo(
    () => [
      {
        label: "Profile Completion",
        value: "—",
        icon: UserRound,
        description: "Complete your profile",
        action: "Complete Profile",
        onClick: () => navigate("/candidate/profile"),
      },
      {
        label: "Applications",
        value: "—",
        icon: BriefcaseBusiness,
        description: "Track your applications",
        action: "View Opportunities",
        onClick: () => navigate("/candidate/feed"),
      },
      {
        label: "Interviews",
        value: "—",
        icon: MessageSquare,
        description: "Your interview activity",
        action: "View Messages",
        onClick: () => navigate("/candidate/messages"),
      },
      {
        label: "Verification",
        value: "—",
        icon: ShieldCheck,
        description: "Verification status",
        action: "View Verification",
        onClick: () => navigate("/candidate/verify"),
      },
    ],
    [navigate]
  );

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

          IMPORTANT:
          The CandidateNavBar is fixed at 88px.
          This background begins BELOW that header so that
          the watermark and decorative shapes never sit behind
          the navbar.
      ====================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 top-0 overflow-hidden"
      >
        {/* TruCity watermark */}

        <img
          src="/city-watermark.png"
          alt=""
          className="absolute right-[-80px] top-[20px] w-[520px] opacity-[0.08] mix-blend-multiply"
        />

        {/* Top-left dark blue circle */}

        <div
          className="absolute -left-32 -top-32 h-72 w-72 rounded-full opacity-90"
          style={{
            background: "#00273D",
            boxShadow: "0 0 0 12px rgba(255,173,1,0.16)",
          }}
        />

        {/* Top-right gold ring */}

        <div
          className="absolute -right-24 -top-24 h-64 w-64 rounded-full border-[22px] opacity-80"
          style={{
            borderColor: "#FFAD01",
          }}
        />

        {/* Gold organic shape */}

        <div
          className="absolute right-[18%] top-[8%] h-48 w-48 rotate-12 rounded-[42%] opacity-25 blur-[1px]"
          style={{
            background: "#FFAD01",
          }}
        />

        {/* Light gold bubble */}

        <div
          className="absolute left-[6%] top-[34%] h-24 w-24 rounded-full opacity-40"
          style={{
            background: "#FFD784",
          }}
        />

        {/* Blue bubble */}

        <div
          className="absolute bottom-[20%] right-[5%] h-32 w-32 rounded-full opacity-30"
          style={{
            background: "#1E92D2",
          }}
        />

        {/* Bottom-left gold circle */}

        <div
          className="absolute bottom-[-100px] left-[-80px] h-64 w-64 rounded-full opacity-80"
          style={{
            background: "#FFAD01",
          }}
        />

        {/* Bottom-right dark blue circle */}

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

      <div className="relative z-10 space-y-8">
        {/* ===================================================
            HEADER
        ==================================================== */}

        <section className="relative overflow-hidden rounded-[28px] border border-[#D4D2E6] bg-white/95 px-6 py-7 shadow-sm backdrop-blur-md sm:px-8">
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: "#FFAD01" }}
                />

                <span
                  className="text-xs font-bold tracking-[0.18em]"
                  style={{ color: "#00466D" }}
                >
                  TRUCITY • CANDIDATE WORKSPACE
                </span>
              </div>

              <h1
                className="text-3xl font-bold tracking-tight sm:text-4xl"
                style={{ color: "#00273D" }}
              >
                Candidate Overview
              </h1>

              <p
                className="mt-3 max-w-2xl text-sm leading-6 sm:text-base"
                style={{ color: "#64748B" }}
              >
                Manage your profile, discover opportunities, keep track of
                your applications, and stay ready for your next career move.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/candidate/feed")}
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
                onClick={() => navigate("/candidate/profile")}
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
            METRICS
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
                      border: "1px solid #D4D2E6",
                      color: "#00466D",
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <span
                    className="text-3xl font-bold"
                    style={{ color: "#00273D" }}
                  >
                    {metric.value}
                  </span>
                </div>

                <div className="mt-5">
                  <h2
                    className="text-sm font-bold"
                    style={{ color: "#334155" }}
                  >
                    {metric.label}
                  </h2>

                  <p className="mt-1 text-xs" style={{ color: "#64748B" }}>
                    {metric.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={metric.onClick}
                  className="mt-5 inline-flex items-center gap-1 text-xs font-bold transition hover:gap-2"
                  style={{ color: "#00466D" }}
                >
                  {metric.action}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </section>

        {/* ===================================================
            MAIN CONTENT
        ==================================================== */}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* GET STARTED */}

          <div
            className="rounded-[28px] border bg-white/95 p-6 shadow-sm backdrop-blur-md sm:p-7"
            style={{ borderColor: "#D4D2E6" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div
                  className="mb-2 text-xs font-bold tracking-[0.14em]"
                  style={{ color: "#FFAD01" }}
                >
                  GET STARTED
                </div>

                <h2
                  className="text-xl font-bold"
                  style={{ color: "#00273D" }}
                >
                  Build a stronger candidate profile
                </h2>

                <p
                  className="mt-2 max-w-xl text-sm leading-6"
                  style={{ color: "#64748B" }}
                >
                  Make sure your profile, CV, and verification information
                  are ready before applying for opportunities.
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
                onClick={() => navigate("/candidate/profile")}
                className="rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                style={{ borderColor: "#D4D2E6" }}
              >
                <UserRound
                  className="h-5 w-5"
                  style={{ color: "#00466D" }}
                />

                <div
                  className="mt-3 text-sm font-bold"
                  style={{ color: "#334155" }}
                >
                  Complete Profile
                </div>

                <div
                  className="mt-1 text-xs leading-5"
                  style={{ color: "#64748B" }}
                >
                  Keep your professional information up to date.
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate("/candidate/cv")}
                className="rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                style={{ borderColor: "#D4D2E6" }}
              >
                <FileText
                  className="h-5 w-5"
                  style={{ color: "#1E92D2" }}
                />

                <div
                  className="mt-3 text-sm font-bold"
                  style={{ color: "#334155" }}
                >
                  Update CV
                </div>

                <div
                  className="mt-1 text-xs leading-5"
                  style={{ color: "#64748B" }}
                >
                  Make sure employers can see your latest experience.
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate("/candidate/verify")}
                className="rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                style={{ borderColor: "#D4D2E6" }}
              >
                <ShieldCheck
                  className="h-5 w-5"
                  style={{ color: "#FFAD01" }}
                />

                <div
                  className="mt-3 text-sm font-bold"
                  style={{ color: "#334155" }}
                >
                  Verify Account
                </div>

                <div
                  className="mt-1 text-xs leading-5"
                  style={{ color: "#64748B" }}
                >
                  Review your candidate verification requirements.
                </div>
              </button>
            </div>
          </div>

          {/* QUICK ACTIONS */}

          <div
            className="rounded-[28px] border bg-white/95 p-6 shadow-sm backdrop-blur-md sm:p-7"
            style={{ borderColor: "#D4D2E6" }}
          >
            <div
              className="text-xs font-bold tracking-[0.14em]"
              style={{ color: "#FFAD01" }}
            >
              QUICK ACTIONS
            </div>

            <h2
              className="mt-2 text-xl font-bold"
              style={{ color: "#00273D" }}
            >
              What would you like to do?
            </h2>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => navigate("/candidate/feed")}
                className="flex w-full items-center justify-between rounded-2xl border p-4 text-left transition hover:bg-[#F8FCFF]"
                style={{ borderColor: "#D4D2E6" }}
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
                      style={{ color: "#334155" }}
                    >
                      Browse Opportunities
                    </span>

                    <span
                      className="block text-xs"
                      style={{ color: "#64748B" }}
                    >
                      Find roles that match your skills
                    </span>
                  </span>
                </span>

                <ArrowRight
                  className="h-4 w-4"
                  style={{ color: "#00466D" }}
                />
              </button>

              <button
                type="button"
                onClick={() => navigate("/candidate/messages")}
                className="flex w-full items-center justify-between rounded-2xl border p-4 text-left transition hover:bg-[#F8FCFF]"
                style={{ borderColor: "#D4D2E6" }}
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
                      style={{ color: "#334155" }}
                    >
                      Check Messages
                    </span>

                    <span
                      className="block text-xs"
                      style={{ color: "#64748B" }}
                    >
                      Stay up to date with employers
                    </span>
                  </span>
                </span>

                <ArrowRight
                  className="h-4 w-4"
                  style={{ color: "#00466D" }}
                />
              </button>

              <button
                type="button"
                onClick={() => navigate("/candidate/hub")}
                className="flex w-full items-center justify-between rounded-2xl border p-4 text-left transition hover:bg-[#F8FCFF]"
                style={{ borderColor: "#D4D2E6" }}
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
                      style={{ color: "#334155" }}
                    >
                      Guidance Hub
                    </span>

                    <span
                      className="block text-xs"
                      style={{ color: "#64748B" }}
                    >
                      Get career and application guidance
                    </span>
                  </span>
                </span>

                <ArrowRight
                  className="h-4 w-4"
                  style={{ color: "#00466D" }}
                />
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================
            CANDIDATE STATUS
        ==================================================== */}

        <section
          className="rounded-[28px] border bg-white/95 p-6 shadow-sm backdrop-blur-md sm:p-7"
          style={{ borderColor: "#D4D2E6" }}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div
                className="text-xs font-bold tracking-[0.14em]"
                style={{ color: "#FFAD01" }}
              >
                YOUR TRUCITY JOURNEY
              </div>

              <h2
                className="mt-2 text-xl font-bold"
                style={{ color: "#00273D" }}
              >
                Stay ready for your next opportunity
              </h2>

              <p
                className="mt-2 max-w-2xl text-sm leading-6"
                style={{ color: "#64748B" }}
              >
                Keep your information current, maintain your CV, complete
                verification, and engage with employers through TruCity.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/candidate/profile")}
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
      </div>
    </div>
  );
}