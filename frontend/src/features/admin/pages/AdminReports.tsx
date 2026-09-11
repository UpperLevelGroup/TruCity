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


export default function AdminReports() {

  /*
   * =====================================================
   * NAVIGATION
   * =====================================================
   */

  const navigate = useNavigate();


  /*
   * =====================================================
   * STATE
   * =====================================================
   */

  const [period, setPeriod] =
    useState<number>(30);

  const [report, setReport] =
    useState<AdminReport | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string>("");


  /*
   * =====================================================
   * LOAD REPORT
   * =====================================================
   */

  useEffect(() => {

    void loadReport();

  }, [period]);


  async function loadReport() {

    try {

      setLoading(true);
      setError("");

      const result =
        await getAdminReport(period);


      /*
       * Normalize the backend response.
       *
       * This prevents the page from crashing if the API
       * returns null/undefined for optional arrays.
       */

      const normalizedReport: AdminReport = {
        ...result,

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
              ? result.applications.statuses
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
              ? result.verifications.statuses
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
                    toNumber(
                      day?.users
                    ),

                  jobs:
                    toNumber(
                      day?.jobs
                    ),

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
        "Admin report loaded:",
        normalizedReport
      );


      setReport(
        normalizedReport
      );

    } catch (err) {

      console.error(
        "Failed to load admin report:",
        err
      );

      setReport(null);

      setError(
        "Unable to load report data."
      );

    } finally {

      setLoading(false);

    }
  }


  /*
   * =====================================================
   * MAXIMUM DAILY ACTIVITY
   * =====================================================
   */

  const maximumDailyActivity =
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


  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (loading) {

    return (
      <div className="admin-page">

        <AdminPageHeader
          eyebrow="REPORTING"
          title="Platform Reports"
          description="Analyse platform activity, users, jobs, applications and verification activity."
        />

        <div className="admin-table-state">
          Loading report...
        </div>

      </div>
    );
  }


  /*
   * =====================================================
   * ERROR
   * =====================================================
   */

  if (error || !report) {

    return (
      <div className="admin-page">

        <AdminPageHeader
          eyebrow="REPORTING"
          title="Platform Reports"
          description="Analyse platform activity, users, jobs, applications and verification activity."
        />

        <div className="admin-error">
          {error ||
            "No report data available."}
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={() => {
            void loadReport();
          }}
        >
          Retry
        </button>

      </div>
    );
  }


  /*
   * =====================================================
   * MAIN PAGE
   * =====================================================
   */

  return (

    <div className="admin-page">

      <AdminPageHeader
        eyebrow="REPORTING"
        title="Platform Reports"
        description="Analyse platform activity, users, jobs, applications and verification activity."
      />


      {/* =====================================================
          REPORT CONTROLS
      ===================================================== */}

      <section className="admin-report-toolbar">

        <div>

          <strong>
            Reporting period
          </strong>

          <span>
            Choose the period used for activity reporting.
          </span>

        </div>


        <select
          value={period}
          onChange={(event) => {

            const selectedPeriod =
              Number(
                event.target.value
              );

            setPeriod(
              selectedPeriod
            );
          }}
          className="admin-report-period"
          aria-label="Reporting period"
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


      {/* =====================================================
          OVERVIEW
      ===================================================== */}

      <section className="admin-stat-grid">

        {/* TOTAL USERS */}

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


        {/* CANDIDATES */}

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


        {/* EMPLOYERS */}

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


        {/* JOBS */}

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

      </section>


      {/* =====================================================
          ACTIVITY SUMMARY
      ===================================================== */}

      <section className="admin-report-grid">


        {/* USER ACTIVITY */}

        <div className="admin-dashboard-card">

          <div className="admin-dashboard-card-header">

            <div>

              <h2>
                User Activity
              </h2>

              <p>
                New accounts created during this period.
              </p>

            </div>

          </div>


          <div className="admin-report-metric-list">

            <ReportMetric
              label="New Users"
              value={
                report.users.newUsers
              }
            />

            <ReportMetric
              label="New Candidates"
              value={
                report.users.newCandidates
              }
            />

            <ReportMetric
              label="New Employers"
              value={
                report.users.newEmployers
              }
            />

          </div>

        </div>


        {/* JOB ACTIVITY */}

        <div className="admin-dashboard-card">

          <div className="admin-dashboard-card-header">

            <div>

              <h2>
                Jobs
              </h2>

              <p>
                Current job listing status.
              </p>

            </div>

          </div>


          <div className="admin-report-metric-list">

            <ReportMetric
              label="Created during period"
              value={
                report.jobs.created
              }
            />

            <ReportMetric
              label="Active"
              value={
                report.jobs.active
              }
            />

            <ReportMetric
              label="Pending"
              value={
                report.jobs.pending
              }
            />

            <ReportMetric
              label="Closed"
              value={
                report.jobs.closed
              }
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          APPLICATIONS + VERIFICATIONS
      ===================================================== */}

      <section className="admin-report-grid">


        {/* APPLICATIONS */}

        <div className="admin-dashboard-card">

          <div className="admin-dashboard-card-header">

            <div>

              <h2>
                Applications
              </h2>

              <p>
                Applications submitted during this period.
              </p>

            </div>

            <strong
              className="admin-report-total"
            >
              {formatNumber(
                report.applications.total
              )}
            </strong>

          </div>


          <StatusBreakdown
            statuses={
              Array.isArray(
                report.applications.statuses
              )
                ? report.applications.statuses
                : []
            }
          />

        </div>


        {/* VERIFICATIONS */}

        <div className="admin-dashboard-card">

          <div className="admin-dashboard-card-header">

            <div>

              <h2>
                Verifications
              </h2>

              <p>
                Verification requests submitted during this period.
              </p>

            </div>

            <strong
              className="admin-report-total"
            >
              {formatNumber(
                report.verifications.total
              )}
            </strong>

          </div>


          <StatusBreakdown
            statuses={
              Array.isArray(
                report.verifications.statuses
              )
                ? report.verifications.statuses
                : []
            }
          />

        </div>

      </section>


      {/* =====================================================
          DAILY ACTIVITY
      ===================================================== */}

      <section className="admin-dashboard-card">

        <div className="admin-dashboard-card-header">

          <div>

            <h2>
              Daily Platform Activity
            </h2>

            <p>
              Activity recorded across the selected reporting period.
            </p>

          </div>

        </div>


        {!Array.isArray(
          report.dailyActivity
        ) ||
        report.dailyActivity.length === 0 ? (

          <div className="admin-table-state">
            No activity recorded for this period.
          </div>

        ) : (

          <>

            {/* =================================================
                CHART
            ================================================= */}

            <div className="admin-report-chart">

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
                        maximumDailyActivity
                      ) * 100,
                      4
                    );

                  return (

                    <div
                      className="admin-report-chart-column"
                      key={day.date}
                      title={
                        `${formatDate(
                          day.date
                        )}: ${formatNumber(
                          total
                        )} activities`
                      }
                    >

                      <div
                        className="admin-report-chart-bar"
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


            {/* =================================================
                LEGEND
            ================================================= */}

            <div className="admin-report-legend">

              <span>
                <i className="admin-report-legend-dot" />
                Users
              </span>

              <span>
                <i className="admin-report-legend-dot" />
                Jobs
              </span>

              <span>
                <i className="admin-report-legend-dot" />
                Applications
              </span>

              <span>
                <i className="admin-report-legend-dot" />
                Verifications
              </span>

            </div>


            {/* =================================================
                DAILY TABLE
            ================================================= */}

            <div className="admin-report-table-wrapper">

              <table className="admin-table">

                <thead>

                  <tr>

                    <th>
                      Date
                    </th>

                    <th>
                      Users
                    </th>

                    <th>
                      Jobs
                    </th>

                    <th>
                      Applications
                    </th>

                    <th>
                      Verifications
                    </th>

                    <th>
                      Total
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {report.dailyActivity.map(
                    (day) => {

                      const total =
                        day.users +
                        day.jobs +
                        day.applications +
                        day.verifications;

                      return (

                        <tr
                          key={day.date}
                        >

                          <td>
                            {formatDate(
                              day.date
                            )}
                          </td>

                          <td>
                            {formatNumber(
                              day.users
                            )}
                          </td>

                          <td>
                            {formatNumber(
                              day.jobs
                            )}
                          </td>

                          <td>
                            {formatNumber(
                              day.applications
                            )}
                          </td>

                          <td>
                            {formatNumber(
                              day.verifications
                            )}
                          </td>

                          <td>

                            <strong>
                              {formatNumber(
                                total
                              )}
                            </strong>

                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          </>

        )}

      </section>


      {/* =====================================================
          REPORT FOOTER
      ===================================================== */}

      <div className="admin-report-generated">

        Report generated{" "}

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

  /*
   * Defensive protection against an undefined
   * or malformed API response.
   */

  const safeStatuses =
    Array.isArray(statuses)
      ? statuses
      : [];


  if (
    safeStatuses.length === 0
  ) {

    return (
      <div className="admin-table-state">
        No data recorded.
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
        (item) => {

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
                `status-${count}`
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
                  {formatNumber(
                    count
                  )}
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
    new Date(
      `${value}T00:00:00`
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
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
    new Date(
      `${value}T00:00:00`
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
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