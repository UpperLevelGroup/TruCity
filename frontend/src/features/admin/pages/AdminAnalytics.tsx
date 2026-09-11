import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import AdminPageHeader from "../components/AdminPageHeader";
import AdminStatCard from "../components/AdminStatCard";

import { getAdminReport } from "../admin.service";

import type {
  AdminReport,
  AdminReportStatusCount,
} from "../admin.types";


const PERIODS = [
  {
    value: 7,
    label: "Last 7 days",
  },
  {
    value: 30,
    label: "Last 30 days",
  },
  {
    value: 90,
    label: "Last 90 days",
  },
  {
    value: 365,
    label: "Last 365 days",
  },
];


export default function AdminAnalytics() {

  const navigate = useNavigate();

  const [period, setPeriod] =
    useState<number>(30);

  const [report, setReport] =
    useState<AdminReport | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string>("");


  useEffect(() => {

    void loadAnalytics();

  }, [period]);


  async function loadAnalytics() {

    try {

      setLoading(true);
      setError("");

      const result =
        await getAdminReport(period);

      const normalizedReport: AdminReport = {

        period:
          result?.period ??
          String(period),

        generatedAt:
          result?.generatedAt ??
          "",

        overview: {
          totalUsers:
            toNumber(
              result?.overview?.totalUsers
            ),

          candidates:
            toNumber(
              result?.overview?.candidates
            ),

          employers:
            toNumber(
              result?.overview?.employers
            ),

          jobs:
            toNumber(
              result?.overview?.jobs
            ),

          applications:
            toNumber(
              result?.overview?.applications
            ),

          verifications:
            toNumber(
              result?.overview?.verifications
            ),
        },

        users: {
          newUsers:
            toNumber(
              result?.users?.newUsers
            ),

          newCandidates:
            toNumber(
              result?.users?.newCandidates
            ),

          newEmployers:
            toNumber(
              result?.users?.newEmployers
            ),
        },

        jobs: {
          total:
            toNumber(
              result?.jobs?.total
            ),

          created:
            toNumber(
              result?.jobs?.created
            ),

          active:
            toNumber(
              result?.jobs?.active
            ),

          pending:
            toNumber(
              result?.jobs?.pending
            ),

          closed:
            toNumber(
              result?.jobs?.closed
            ),
        },

        applications: {
          total:
            toNumber(
              result?.applications?.total
            ),

          statuses:
            Array.isArray(
              result?.applications?.statuses
            )
              ? result.applications.statuses.map(
                  (item) => ({
                    status:
                      item?.status ?? "UNKNOWN",

                    count:
                      toNumber(item?.count),
                  })
                )
              : [],
        },

        verifications: {
          total:
            toNumber(
              result?.verifications?.total
            ),

          statuses:
            Array.isArray(
              result?.verifications?.statuses
            )
              ? result.verifications.statuses.map(
                  (item) => ({
                    status:
                      item?.status ?? "UNKNOWN",

                    count:
                      toNumber(item?.count),
                  })
                )
              : [],
        },

        dailyActivity:
          Array.isArray(
            result?.dailyActivity
          )
            ? result.dailyActivity.map(
                (day) => ({
                  date:
                    day?.date ?? "",

                  users:
                    toNumber(day?.users),

                  jobs:
                    toNumber(day?.jobs),

                  applications:
                    toNumber(
                      day?.applications
                    ),

                  verifications:
                    toNumber(
                      day?.verifications
                    ),
                })
              )
            : [],
      };

      console.log(
        "Admin analytics loaded:",
        normalizedReport
      );

      setReport(
        normalizedReport
      );

    } catch (err) {

      console.error(
        "Failed to load admin analytics:",
        err
      );

      setReport(null);

      setError(
        "Unable to load analytics data."
      );

    } finally {

      setLoading(false);

    }
  }


  const analytics = useMemo(() => {

    if (!report) {
      return null;
    }

    const dailyActivity =
      Array.isArray(
        report.dailyActivity
      )
        ? report.dailyActivity
        : [];


    const totalActivity =
      dailyActivity.reduce(
        (sum, day) =>
          sum +
          day.users +
          day.jobs +
          day.applications +
          day.verifications,
        0
      );


    const totalUsersActivity =
      dailyActivity.reduce(
        (sum, day) =>
          sum + day.users,
        0
      );


    const totalJobsActivity =
      dailyActivity.reduce(
        (sum, day) =>
          sum + day.jobs,
        0
      );


    const totalApplicationsActivity =
      dailyActivity.reduce(
        (sum, day) =>
          sum + day.applications,
        0
      );


    const totalVerificationActivity =
      dailyActivity.reduce(
        (sum, day) =>
          sum + day.verifications,
        0
      );


    const activeJobPercentage =
      report.jobs.total > 0
        ? Math.round(
            (
              report.jobs.active /
              report.jobs.total
            ) * 100
          )
        : 0;


    const verificationApprovalRate =
      getStatusPercentage(
        report.verifications.statuses,
        [
          "APPROVED",
          "VERIFIED",
          "COMPLETED",
        ]
      );


    const applicationSuccessRate =
      getStatusPercentage(
        report.applications.statuses,
        [
          "ACCEPTED",
          "HIRED",
          "SUCCESSFUL",
        ]
      );


    const averageDailyActivity =
      dailyActivity.length > 0
        ? Math.round(
            totalActivity /
            dailyActivity.length
          )
        : 0;


    return {

      totalActivity,

      totalUsersActivity,

      totalJobsActivity,

      totalApplicationsActivity,

      totalVerificationActivity,

      activeJobPercentage,

      verificationApprovalRate,

      applicationSuccessRate,

      averageDailyActivity,

    };

  }, [report]);


  const maximumActivity =
    useMemo(() => {

      if (
        !report ||
        !Array.isArray(
          report.dailyActivity
        ) ||
        report.dailyActivity.length === 0
      ) {
        return 1;
      }


      return Math.max(
        ...report.dailyActivity.map(
          (day) =>
            day.users +
            day.jobs +
            day.applications +
            day.verifications
        ),
        1
      );

    }, [report]);


  if (loading) {

    return (
      <div className="admin-page">

        <AdminPageHeader
          eyebrow="ANALYTICS"
          title="Platform Analytics"
          description="Monitor platform growth, engagement, jobs, applications and verification performance."
        />

        <div className="admin-table-state">
          Loading analytics...
        </div>

      </div>
    );
  }


  if (
    error ||
    !report ||
    !analytics
  ) {

    return (
      <div className="admin-page">

        <AdminPageHeader
          eyebrow="ANALYTICS"
          title="Platform Analytics"
          description="Monitor platform growth, engagement, jobs, applications and verification performance."
        />

        <div className="admin-error">
          {error ||
            "No analytics data available."}
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={() => {
            void loadAnalytics();
          }}
        >
          Retry
        </button>

      </div>
    );
  }


  return (
    <div className="admin-page">

      <AdminPageHeader
        eyebrow="ANALYTICS"
        title="Platform Analytics"
        description="Monitor platform growth, engagement, jobs, applications and verification performance."
      />


      {/* PERIOD */}

      <section className="admin-report-toolbar">

        <div>
          <strong>
            Analytics period
          </strong>

          <span>
            View platform performance across the selected period.
          </span>
        </div>

        <select
          value={period}
          onChange={(event) => {
            setPeriod(
              Number(
                event.target.value
              )
            );
          }}
          className="admin-report-period"
          aria-label="Analytics period"
        >

          {PERIODS.map(
            (option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            )
          )}

        </select>

      </section>


      {/* OVERVIEW */}

      <section className="admin-stat-grid">

        <AdminStatCard
          label="Total Users"
          value={formatNumber(
            report.overview.totalUsers
          )}
          description="All registered users"
          icon="◉"
          onClick={() =>
            navigate("/admin/users")
          }
        />

        <AdminStatCard
          label="Candidates"
          value={formatNumber(
            report.overview.candidates
          )}
          description="Registered candidates"
          icon="♙"
          onClick={() =>
            navigate("/admin/candidates")
          }
        />

        <AdminStatCard
          label="Employers"
          value={formatNumber(
            report.overview.employers
          )}
          description="Registered employers"
          icon="▣"
          onClick={() =>
            navigate("/admin/employers")
          }
        />

        <AdminStatCard
          label="Jobs"
          value={formatNumber(
            report.overview.jobs
          )}
          description="Total job listings"
          icon="▤"
          onClick={() =>
            navigate("/admin/jobs")
          }
        />

        <AdminStatCard
          label="Applications"
          value={formatNumber(
            report.overview.applications
          )}
          description="Applications on the platform"
          icon="◫"
          onClick={() =>
            navigate("/admin/applications")
          }
        />

        <AdminStatCard
          label="Verifications"
          value={formatNumber(
            report.overview.verifications
          )}
          description="Verification records"
          icon="✓"
          onClick={() =>
            navigate("/admin/verifications")
          }
        />

      </section>


      {/* KEY PERFORMANCE */}

      <section className="admin-report-grid">

        <div className="admin-dashboard-card">

          <div className="admin-dashboard-card-header">

            <div>
              <h2>
                Platform Activity
              </h2>

              <p>
                Activity generated during the selected period.
              </p>
            </div>

            <strong className="admin-report-total">
              {formatNumber(
                analytics.totalActivity
              )}
            </strong>

          </div>


          <div className="admin-report-metric-list">

            <ReportMetric
              label="User activity"
              value={
                analytics.totalUsersActivity
              }
            />

            <ReportMetric
              label="Job activity"
              value={
                analytics.totalJobsActivity
              }
            />

            <ReportMetric
              label="Application activity"
              value={
                analytics.totalApplicationsActivity
              }
            />

            <ReportMetric
              label="Verification activity"
              value={
                analytics.totalVerificationActivity
              }
            />

            <ReportMetric
              label="Average daily activity"
              value={
                analytics.averageDailyActivity
              }
            />

          </div>

        </div>


        <div className="admin-dashboard-card">

          <div className="admin-dashboard-card-header">

            <div>
              <h2>
                Job Performance
              </h2>

              <p>
                Current distribution of job listings.
              </p>
            </div>

          </div>


          <div className="admin-report-metric-list">

            <ReportMetric
              label="Total jobs"
              value={
                report.jobs.total
              }
            />

            <ReportMetric
              label="Created during period"
              value={
                report.jobs.created
              }
            />

            <ReportMetric
              label="Active jobs"
              value={
                report.jobs.active
              }
            />

            <ReportMetric
              label="Pending jobs"
              value={
                report.jobs.pending
              }
            />

            <ReportMetric
              label="Closed jobs"
              value={
                report.jobs.closed
              }
            />

          </div>


          <div className="admin-analytics-percentage">

            <span>
              Active job rate
            </span>

            <strong>
              {analytics.activeJobPercentage}%
            </strong>

          </div>


          <button
            type="button"
            className="admin-analytics-link"
            onClick={() =>
              navigate("/admin/jobs")
            }
          >
            Manage jobs →
          </button>

        </div>

      </section>


      {/* APPLICATIONS + VERIFICATIONS */}

      <section className="admin-report-grid">

        <div className="admin-dashboard-card">

          <div className="admin-dashboard-card-header">

            <div>
              <h2>
                Application Performance
              </h2>

              <p>
                Application activity and status distribution.
              </p>
            </div>

            <strong className="admin-report-total">
              {formatNumber(
                report.applications.total
              )}
            </strong>

          </div>


          <StatusBreakdown
            statuses={
              report.applications.statuses
            }
          />


          <div className="admin-analytics-percentage">

            <span>
              Application success rate
            </span>

            <strong>
              {analytics.applicationSuccessRate}%
            </strong>

          </div>


          <button
            type="button"
            className="admin-analytics-link"
            onClick={() =>
              navigate("/admin/applications")
            }
          >
            View applications →
          </button>

        </div>


        <div className="admin-dashboard-card">

          <div className="admin-dashboard-card-header">

            <div>
              <h2>
                Verification Performance
              </h2>

              <p>
                Verification requests and completion rate.
              </p>
            </div>

            <strong className="admin-report-total">
              {formatNumber(
                report.verifications.total
              )}
            </strong>

          </div>


          <StatusBreakdown
            statuses={
              report.verifications.statuses
            }
          />


          <div className="admin-analytics-percentage">

            <span>
              Approval / completion rate
            </span>

            <strong>
              {analytics.verificationApprovalRate}%
            </strong>

          </div>


          <button
            type="button"
            className="admin-analytics-link"
            onClick={() =>
              navigate("/admin/verifications")
            }
          >
            Review verifications →
          </button>

        </div>

      </section>


      {/* ACTIVITY TREND */}

      <section className="admin-dashboard-card">

        <div className="admin-dashboard-card-header">

          <div>
            <h2>
              Platform Activity Trend
            </h2>

            <p>
              Combined daily platform activity across the selected period.
            </p>
          </div>

          <strong className="admin-report-total">
            {formatNumber(
              analytics.totalActivity
            )}
          </strong>

        </div>


        {report.dailyActivity.length === 0 ? (

          <div className="admin-table-state">
            No activity recorded for this period.
          </div>

        ) : (

          <div className="admin-analytics-chart">

            {report.dailyActivity.map(
              (day) => {

                const total =
                  day.users +
                  day.jobs +
                  day.applications +
                  day.verifications;


                const height =
                  Math.max(
                    (
                      total /
                      maximumActivity
                    ) * 100,
                    4
                  );


                return (
                  <div
                    className="admin-analytics-chart-column"
                    key={day.date}
                    title={
                      `${formatDate(
                        day.date
                      )}: ${formatNumber(
                        total
                      )} activities`
                    }
                  >

                    <div className="admin-analytics-chart-value">
                      {total > 0
                        ? formatNumber(total)
                        : ""}
                    </div>

                    <div
                      className="admin-analytics-chart-bar"
                      style={{
                        height:
                          `${height}%`,
                      }}
                    />

                    <span>
                      {formatShortDate(
                        day.date
                      )}
                    </span>

                  </div>
                );
              }
            )}

          </div>

        )}

      </section>


      {/* USER GROWTH */}

      <section className="admin-report-grid">

        <div className="admin-dashboard-card">

          <div className="admin-dashboard-card-header">

            <div>
              <h2>
                User Growth
              </h2>

              <p>
                New accounts created during the selected period.
              </p>
            </div>

          </div>


          <div className="admin-analytics-highlight">

            <strong>
              {formatNumber(
                report.users.newUsers
              )}
            </strong>

            <span>
              New users
            </span>

          </div>


          <div className="admin-report-metric-list">

            <ReportMetric
              label="New candidates"
              value={
                report.users.newCandidates
              }
            />

            <ReportMetric
              label="New employers"
              value={
                report.users.newEmployers
              }
            />

          </div>


          <button
            type="button"
            className="admin-analytics-link"
            onClick={() =>
              navigate("/admin/users")
            }
          >
            Manage users →
          </button>

        </div>


        <div className="admin-dashboard-card">

          <div className="admin-dashboard-card-header">

            <div>
              <h2>
                Platform Engagement
              </h2>

              <p>
                Activity generated across the platform.
              </p>
            </div>

          </div>


          <div className="admin-analytics-highlight">

            <strong>
              {formatNumber(
                report.applications.total
              )}
            </strong>

            <span>
              Applications
            </span>

          </div>


          <div className="admin-report-metric-list">

            <ReportMetric
              label="Applications"
              value={
                report.applications.total
              }
            />

            <ReportMetric
              label="Verifications"
              value={
                report.verifications.total
              }
            />

            <ReportMetric
              label="Job listings"
              value={
                report.jobs.total
              }
            />

          </div>


          <button
            type="button"
            className="admin-analytics-link"
            onClick={() =>
              navigate("/admin/applications")
            }
          >
            View applications →
          </button>

        </div>

      </section>


      {/* REPORTS */}

      <section className="admin-dashboard-card admin-analytics-footer-card">

        <div>

          <h2>
            Need detailed reporting?
          </h2>

          <p>
            Open Platform Reports for detailed daily activity,
            status breakdowns and historical reporting.
          </p>

        </div>


        <button
          type="button"
          className="admin-primary-button"
          onClick={() =>
            navigate("/admin/reports")
          }
        >
          Open Platform Reports
        </button>

      </section>


      <div className="admin-report-generated">

        Analytics generated{" "}

        {formatGeneratedAt(
          report.generatedAt
        )}

      </div>

    </div>
  );
}


/*
 * =====================================================
 * REPORT METRIC
 * =====================================================
 */

function ReportMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {

  return (
    <div className="admin-report-metric">

      <span>
        {label}
      </span>

      <strong>
        {formatNumber(value)}
      </strong>

    </div>
  );
}


/*
 * =====================================================
 * STATUS BREAKDOWN
 * =====================================================
 */

function StatusBreakdown({
  statuses,
}: {
  statuses: AdminReportStatusCount[];
}) {

  const safeStatuses =
    Array.isArray(statuses)
      ? statuses
      : [];


  if (
    safeStatuses.length === 0
  ) {

    return (
      <div className="admin-table-state">
        No status data recorded.
      </div>
    );
  }


  const total =
    safeStatuses.reduce(
      (sum, item) =>
        sum +
        toNumber(
          item?.count
        ),
      0
    );


  return (
    <div className="admin-report-status-list">

      {safeStatuses.map(
        (item, index) => {

          const count =
            toNumber(
              item?.count
            );


          const percentage =
            total > 0
              ? Math.round(
                  (
                    count /
                    total
                  ) * 100
                )
              : 0;


          return (
            <div
              className="admin-report-status-item"
              key={
                item?.status ||
                `status-${index}`
              }
            >

              <div className="admin-report-status-header">

                <span>
                  {formatStatus(
                    item?.status ||
                    "Unknown"
                  )}
                </span>

                <strong>
                  {formatNumber(count)}
                </strong>

              </div>


              <div className="admin-report-progress">

                <div
                  className="admin-report-progress-fill"
                  style={{
                    width:
                      `${percentage}%`,
                  }}
                />

              </div>


              <small>
                {percentage}% of total
              </small>

            </div>
          );

        }
      )}

    </div>
  );
}


/*
 * =====================================================
 * STATUS PERCENTAGE
 * =====================================================
 */

function getStatusPercentage(
  statuses: AdminReportStatusCount[],
  successfulStatuses: string[]
): number {

  if (
    !Array.isArray(statuses) ||
    statuses.length === 0
  ) {
    return 0;
  }


  const total =
    statuses.reduce(
      (sum, item) =>
        sum +
        toNumber(
          item?.count
        ),
      0
    );


  if (total === 0) {
    return 0;
  }


  const successful =
    statuses.reduce(
      (sum, item) => {

        const status =
          (
            item?.status ||
            ""
          ).toUpperCase();


        if (
          successfulStatuses.includes(
            status
          )
        ) {

          return (
            sum +
            toNumber(
              item?.count
            )
          );
        }


        return sum;

      },
      0
    );


  return Math.round(
    (
      successful /
      total
    ) * 100
  );
}


/*
 * =====================================================
 * SAFE NUMBER
 * =====================================================
 */

function toNumber(
  value: unknown
): number {

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }


  if (
    typeof value === "string" &&
    value.trim() !== ""
  ) {

    const parsed =
      Number(value);


    if (
      Number.isFinite(parsed)
    ) {
      return parsed;
    }
  }


  return 0;
}


/*
 * =====================================================
 * FORMAT NUMBER
 * =====================================================
 */

function formatNumber(
  value: number
): string {

  return toNumber(
    value
  ).toLocaleString(
    "en-ZA"
  );
}


/*
 * =====================================================
 * FORMAT STATUS
 * =====================================================
 */

function formatStatus(
  status: string
): string {

  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}


/*
 * =====================================================
 * FORMAT DATE
 * =====================================================
 */

function formatDate(
  value: string
): string {

  if (!value) {
    return "Unknown date";
  }


  const date =
    parseDate(value);


  if (!date) {
    return value;
  }


  return date.toLocaleDateString(
    "en-ZA",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


/*
 * =====================================================
 * FORMAT SHORT DATE
 * =====================================================
 */

function formatShortDate(
  value: string
): string {

  if (!value) {
    return "";
  }


  const date =
    parseDate(value);


  if (!date) {
    return "";
  }


  return date.toLocaleDateString(
    "en-ZA",
    {
      day: "2-digit",
      month: "short",
    }
  );
}


/*
 * =====================================================
 * PARSE DATE
 * =====================================================
 */

function parseDate(
  value: string
): Date | null {

  if (!value) {
    return null;
  }


  const dateOnly =
    /^\d{4}-\d{2}-\d{2}$/;


  const date =
    dateOnly.test(value)
      ? new Date(
          `${value}T00:00:00`
        )
      : new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }


  return date;
}


/*
 * =====================================================
 * FORMAT GENERATED AT
 * =====================================================
 */

function formatGeneratedAt(
  value: string
): string {

  if (!value) {
    return "recently";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "recently";
  }


  return date.toLocaleString(
    "en-ZA",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}