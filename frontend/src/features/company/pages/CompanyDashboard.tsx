import React, { useEffect, useState } from "react";

import TalentFeed from "./TalentFeed";
import Pipeline from "./Pipeline";
import JobListing from "./JobListing";
import Messages from "./Messages";
import Plans from "./Plans";
import CompanyProfile from "./CompanyProfile";

import { companyService } from "../company.service";

import type {
  CompanyDashboardSummary,
  CompanyDashboardMetric,
  CompanyActivity,
} from "../company.types";

import logo from "../../../assets/trucity-logo.png";

interface GuideItem {
  id: string;
  title: string;
  category: string;
  readTime: string;
  description: string;
  badge: string;
}

interface VideoItem {
  id: string;
  title: string;
  duration: string;
  category: string;
  description: string;
}

type CompanyTab =
  | "overview"
  | "talent"
  | "pipeline"
  | "jobs"
  | "messages"
  | "plans"
  | "profile"
  | "guidance";

const COLORS = {
  white: "#FFFFFF",
  page: "#F8FCFF",
  teal: "#00466D",
  darkBlue: "#00273D",
  blue: "#1E92D2",
  gold: "#FFAD01",
  orange: "#FFD784",
  border: "#D4D2E6",
  bodyText: "#334155",
  mutedText: "#64748B",
  success: "#43ED9C",
  errorBg: "#FFF5F5",
  errorBorder: "#FF4672",
  errorText: "#A61B3C",
} as const;

/* =========================================================
   GUIDANCE HUB
   ========================================================= */

function GuidanceHubContent() {
  const guides: GuideItem[] = [
    {
      id: "1",
      title: "CIPC Enterprise Verification Workflow",
      category: "Compliance & Legal",
      readTime: "4 min read",
      description:
        "Step-by-step guide to cross-referencing South African company registration details and director background validation.",
      badge: "Essential",
    },
    {
      id: "2",
      title: "Optimizing Embedded C++ Candidate Assessments",
      category: "Technical Hiring",
      readTime: "6 min read",
      description:
        "Frameworks for evaluating microcontroller firmware engineers, BLE protocol implementations, and real-time hardware testing.",
      badge: "Best Practice",
    },
    {
      id: "3",
      title: "Direct Talent Messaging Protocols",
      category: "Recruitment",
      readTime: "3 min read",
      description:
        "Effective communication strategies for outreach, scheduling technical screens, and extending verified offers.",
      badge: "Guide",
    },
  ];

  const videos: VideoItem[] = [
    {
      id: "v1",
      title: "Platform Walkthrough & Dashboard Overview",
      duration: "04:45",
      category: "Getting Started",
      description:
        "A complete video demonstration on navigating candidate views, filtering verified profiles, and managing team permissions.",
    },
    {
      id: "v2",
      title: "Running Automated CIPC Compliance Checks",
      duration: "03:15",
      category: "Compliance",
      description:
        "See how real-time registry queries validate company legitimacy and director status instantly.",
    },
    {
      id: "v3",
      title: "Conducting Technical Interviews for Embedded Engineers",
      duration: "08:20",
      category: "Best Practices",
      description:
        "Expert tips on reviewing microcontroller code submissions, testing BLE modules, and hardware integration tasks.",
    },
  ];

  return (
    <div style={styles.guidanceWrapper}>
      <div style={styles.guidanceHeader}>
        <div>
          <p style={styles.eyebrow}>TRUCITY • RESOURCES</p>

          <h1 style={styles.guidanceTitle}>
            Guidance Hub & Video Tutorials
          </h1>

          <p style={styles.guidanceSubtitle}>
            Resources, CIPC verification standards, video tutorials, and best
            practices for hiring verified technical talent.
          </p>
        </div>
      </div>

      {/* Feature Banner */}
      <div style={styles.guidanceBanner}>
        <div>
          <span style={styles.resourceBadge}>
            Platform Resource
          </span>

          <h2 style={styles.bannerTitle}>
            CIPC Verification & Compliance Standards
          </h2>

          <p style={styles.bannerText}>
            Learn how TruCity integrates with direct business registry data to
            validate candidate credentials safely.
          </p>
        </div>

        <button
          type="button"
          style={styles.bannerButton}
          onClick={() => {
            window.alert(
              "Integration specifications will be available here."
            );
          }}
        >
          Read Integration Specs →
        </button>
      </div>

      {/* Video Tutorials */}
      <section style={styles.guidanceSection}>
        <div style={styles.guidanceSectionHeader}>
          <h2 style={styles.guidanceSectionTitle}>
            Video Tutorials & Walkthroughs
          </h2>

          <button
            type="button"
            style={styles.viewAllButton}
            onClick={() => {
              window.alert("All video tutorials will be available here.");
            }}
          >
            View all videos →
          </button>
        </div>

        <div style={styles.guidanceGrid}>
          {videos.map((video) => (
            <div key={video.id} style={styles.guidanceCard}>
              <div style={styles.videoPreview}>
                <button
                  type="button"
                  aria-label={`Play ${video.title}`}
                  style={styles.playButton}
                  onClick={() => {
                    window.alert(`Playing: ${video.title}`);
                  }}
                >
                  ▶
                </button>

                <span style={styles.videoDuration}>
                  {video.duration}
                </span>
              </div>

              <div style={styles.guidanceCardContent}>
                <div>
                  <span style={styles.categoryLabel}>
                    {video.category}
                  </span>

                  <h3 style={styles.guidanceCardTitle}>
                    {video.title}
                  </h3>

                  <p style={styles.guidanceCardDescription}>
                    {video.description}
                  </p>
                </div>

                <div style={styles.guidanceCardFooter}>
                  <button
                    type="button"
                    style={styles.cardLinkButton}
                    onClick={() => {
                      window.alert(`Opening: ${video.title}`);
                    }}
                  >
                    Watch Video →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Written Guides */}
      <section style={styles.guidanceSection}>
        <h2 style={styles.guidanceSectionTitle}>
          Documentation & Guides
        </h2>

        <div style={styles.guidanceGrid}>
          {guides.map((guide) => (
            <div key={guide.id} style={styles.guidanceCardWritten}>
              <div>
                <div style={styles.guideMeta}>
                  <span style={styles.categoryLabel}>
                    {guide.category}
                  </span>

                  <span style={styles.readTime}>
                    {guide.readTime}
                  </span>
                </div>

                <h3 style={styles.guidanceCardTitle}>
                  {guide.title}
                </h3>

                <p style={styles.guidanceCardDescription}>
                  {guide.description}
                </p>
              </div>

              <div style={styles.guideFooter}>
                <span style={styles.guideBadge}>
                  ✓ {guide.badge}
                </span>

                <button
                  type="button"
                  style={styles.cardLinkButton}
                  onClick={() => {
                    window.alert(`Opening: ${guide.title}`);
                  }}
                >
                  View Guide →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   COMPANY DASHBOARD
   ========================================================= */

export default function CompanyDashboard() {
  const [activeTab, setActiveTab] =
    useState<CompanyTab>("overview");

  const [dashboard, setDashboard] =
    useState<CompanyDashboardSummary | null>(null);

  const [loadingDashboard, setLoadingDashboard] =
    useState(true);

  const [dashboardError, setDashboardError] =
    useState("");

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [hasNewAlerts, setHasNewAlerts] =
    useState(true);

  const notifications = [
    {
      id: 1,
      text: "Jessica Taylor moved to Offered stage",
      time: "10 mins ago",
    },
    {
      id: 2,
      text: "New job posted: Chartered Accountant (SAICA)",
      time: "1 hour ago",
    },
    {
      id: 3,
      text: "Sipho Ndlovu sent a new message",
      time: "3 hours ago",
    },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoadingDashboard(true);
      setDashboardError("");

      const data =
        await companyService.getDashboardSummary();

      setDashboard(data);
    } catch (error) {
      console.error(
        "Failed to load company dashboard:",
        error
      );

      setDashboardError(
        "Unable to load dashboard data."
      );
    } finally {
      setLoadingDashboard(false);
    }
  };

  const handleOpenMessage = (_candidateName: string) => {
    setActiveTab("messages");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    window.location.href = "/login";
  };

  const metrics: CompanyDashboardMetric[] =
    dashboard?.metrics ?? [];

  const recentActivity: CompanyActivity[] =
    dashboard?.recentActivity ?? [];

  return (
    <div style={styles.appLayout}>

      {/* =================================================
          BACKGROUND
          ================================================= */}

      <div
        style={{
          ...styles.bgLogoWatermark,
          backgroundImage: `url(${logo})`,
        }}
        aria-hidden="true"
      />

      <div
        style={styles.circleTopLeft}
        aria-hidden="true"
      />

      <div
        style={styles.circleTopRight}
        aria-hidden="true"
      />

      <div
        style={styles.circleBottomLeft}
        aria-hidden="true"
      />

      <div
        style={styles.circleBottomRight}
        aria-hidden="true"
      />

      {/* =================================================
          NAVBAR
          ================================================= */}

      <header style={styles.topNavbar}>

        <div style={styles.navLeft}>

          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            style={styles.brandButton}
            aria-label="Go to TruCity dashboard"
          >
            <img
              src={logo}
              alt="TruCity"
              style={styles.logo}
            />
          </button>

          <div style={styles.companyBadge}>
            <span style={styles.companyBadgeDot}>
              ●
            </span>

            <span style={styles.companyBadgeText}>
              Verified Workspace
            </span>
          </div>

        </div>

        <nav
          style={styles.navMenu}
          aria-label="Company navigation"
        >
          {(
            [
              ["overview", "Dashboard"],
              ["talent", "Talent Feed"],
              ["pipeline", "Pipeline"],
              ["jobs", "Job Listings"],
              ["messages", "Messages"],
              ["guidance", "Guidance Hub"],
              ["plans", "Plans & Billing"],
              ["profile", "Company Profile"],
            ] as const
          ).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              style={
                activeTab === tab
                  ? styles.activeNavItem
                  : styles.navItem
              }
              onClick={() =>
                setActiveTab(tab)
              }
            >
              {label}
            </button>
          ))}
        </nav>

        <div style={styles.navRight}>

          {/* Notifications */}
          <div style={styles.notificationWrapper}>
            <button
              type="button"
              style={styles.notificationBtn}
              onClick={() => {
                setShowNotifications(
                  !showNotifications
                );
                setHasNewAlerts(false);
              }}
              title="Notifications"
              aria-label="Notifications"
            >
              🔔

              {hasNewAlerts && (
                <span
                  style={styles.notificationBadge}
                />
              )}
            </button>

            {showNotifications && (
              <div
                style={
                  styles.notificationDropdown
                }
              >
                <div
                  style={
                    styles.notificationHeader
                  }
                >
                  <span
                    style={
                      styles.notificationTitle
                    }
                  >
                    Notifications
                  </span>

                  <span
                    style={
                      styles.notificationCount
                    }
                  >
                    {notifications.length} new
                  </span>
                </div>

                <div
                  style={
                    styles.notificationList
                  }
                >
                  {notifications.map(
                    (notification) => (
                      <div
                        key={notification.id}
                        style={
                          styles.notificationItem
                        }
                      >
                        <span
                          style={
                            styles.notificationText
                          }
                        >
                          {notification.text}
                        </span>

                        <span
                          style={
                            styles.notificationTime
                          }
                        >
                          {notification.time}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            style={styles.logoutBtn}
            onClick={handleLogout}
          >
            Log Out
          </button>

        </div>
      </header>

      {/* =================================================
          MAIN
          ================================================= */}

      <main style={styles.mainWrapper}>
        <div style={styles.mainContent}>

          {/* ================= OVERVIEW ================= */}

          {activeTab === "overview" && (
            <div>

              <div style={styles.headerArea}>

                <div>
                  <p style={styles.eyebrow}>
                    TRUCITY • COMPANY WORKSPACE
                  </p>

                  <h1 style={styles.title}>
                    Executive Overview
                  </h1>

                  <p style={styles.subtitle}>
                    Track cross-department hiring
                    velocity, active listings, and
                    candidate activity streams.
                  </p>
                </div>

                <div
                  style={
                    styles.quickActionRow
                  }
                >
                  <button
                    type="button"
                    style={
                      styles.primaryActionBtn
                    }
                    onClick={() =>
                      setActiveTab("jobs")
                    }
                  >
                    + Post New Job
                  </button>

                  <button
                    type="button"
                    style={
                      styles.secondaryActionBtn
                    }
                    onClick={() =>
                      setActiveTab("talent")
                    }
                  >
                    Explore Talent Feed
                  </button>
                </div>

              </div>

              {/* Loading */}

              {loadingDashboard && (
                <div
                  style={styles.statusCard}
                >
                  <span
                    style={styles.statusText}
                  >
                    Loading dashboard data...
                  </span>
                </div>
              )}

              {/* Error */}

              {!loadingDashboard &&
                dashboardError && (
                  <div
                    style={styles.errorCard}
                  >
                    <span>
                      {dashboardError}
                    </span>

                    <button
                      type="button"
                      style={
                        styles.retryButton
                      }
                      onClick={loadDashboard}
                    >
                      Retry
                    </button>
                  </div>
                )}

              {/* Dashboard */}

              {!loadingDashboard &&
                !dashboardError && (
                  <>
                    <div
                      style={
                        styles.metricsGrid
                      }
                    >
                      {metrics.length > 0 ? (
                        metrics.map(
                          (metric, index) => (
                            <div
                              key={`${metric.title}-${index}`}
                              style={
                                styles.metricCard
                              }
                            >
                              <div
                                style={
                                  styles.metricHeader
                                }
                              >
                                <span
                                  style={
                                    styles.metricTitle
                                  }
                                >
                                  {metric.title}
                                </span>

                                <div
                                  style={
                                    styles.metricIconDot
                                  }
                                />
                              </div>

                              <div
                                style={
                                  styles.metricValueRow
                                }
                              >
                                <span
                                  style={
                                    styles.metricValue
                                  }
                                >
                                  {metric.value}
                                </span>

                                <span
                                  style={{
                                    ...styles.metricChange,
                                    color:
                                      metric.color ??
                                      COLORS.teal,
                                  }}
                                >
                                  {metric.change}
                                </span>
                              </div>
                            </div>
                          )
                        )
                      ) : (
                        <div
                          style={
                            styles.emptyCard
                          }
                        >
                          No dashboard metrics
                          available.
                        </div>
                      )}
                    </div>

                    <div
                      style={
                        styles.sectionCard
                      }
                    >
                      <div
                        style={
                          styles.sectionHeader
                        }
                      >
                        <h3
                          style={
                            styles.sectionTitle
                          }
                        >
                          Real-Time Recruitment
                          Activity
                        </h3>

                        <span
                          style={
                            styles.liveBadge
                          }
                        >
                          <span
                            style={
                              styles.liveDot
                            }
                          >
                            ●
                          </span>

                          LIVE STREAM
                        </span>
                      </div>

                      <div
                        style={
                          styles.activityList
                        }
                      >
                        {recentActivity.length >
                        0 ? (
                          recentActivity.map(
                            (activity) => (
                              <div
                                key={activity.id}
                                style={
                                  styles.activityItem
                                }
                              >
                                <div
                                  style={
                                    styles.activityMain
                                  }
                                >
                                  <span
                                    style={
                                      styles.activityCategoryTag
                                    }
                                  >
                                    {
                                      activity.category
                                    }
                                  </span>

                                  <span
                                    style={
                                      styles.activityText
                                    }
                                  >
                                    {activity.text}
                                  </span>
                                </div>

                                <span
                                  style={
                                    styles.activityTime
                                  }
                                >
                                  {activity.time}
                                </span>
                              </div>
                            )
                          )
                        ) : (
                          <div
                            style={
                              styles.emptyActivity
                            }
                          >
                            No recent recruitment
                            activity.
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
            </div>
          )}

          {/* ================= OTHER TABS ================= */}

          {activeTab === "talent" && (
            <TalentFeed
              onOpenMessage={
                handleOpenMessage
              }
            />
          )}

          {activeTab === "pipeline" && (
            <Pipeline />
          )}

          {activeTab === "jobs" && (
            <JobListing />
          )}

          {activeTab === "messages" && (
            <Messages />
          )}

          {activeTab === "guidance" && (
            <GuidanceHubContent />
          )}

          {activeTab === "plans" && (
            <Plans />
          )}

          {activeTab === "profile" && (
            <CompanyProfile />
          )}

        </div>
      </main>

      {/* =================================================
          FOOTER
          ================================================= */}

      <footer style={styles.footer}>
        <span>
          TruCity © 2026
        </span>

        <span>•</span>

        <a
          href="#"
          style={styles.footerLink}
        >
          User Agreement
        </a>

        <span>•</span>

        <a
          href="#"
          style={styles.footerLink}
        >
          Privacy Policy
        </a>

        <span>•</span>

        <a
          href="#"
          style={styles.footerLink}
        >
          Cookie Policy
        </a>
      </footer>

    </div>
  );
}

/* =========================================================
   STYLES
   ========================================================= */

const styles: {
  [key: string]: React.CSSProperties;
} = {
  appLayout: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: COLORS.page,
    fontFamily: "Helvetica, Arial, sans-serif",
    position: "relative",
    overflowX: "hidden",
    boxSizing: "border-box",
  },

  bgLogoWatermark: {
    position: "fixed",
    inset: 0,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "min(72vw, 720px)",
    opacity: 0.025,
    pointerEvents: "none",
    zIndex: 0,
  },

  circleTopLeft: {
    position: "absolute",
    top: "90px",
    left: "-180px",
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    backgroundColor: "rgba(30, 146, 210, 0.08)",
    filter: "blur(42px)",
    zIndex: 0,
    pointerEvents: "none",
  },

  circleTopRight: {
    position: "absolute",
    top: "170px",
    right: "-170px",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 173, 1, 0.09)",
    filter: "blur(42px)",
    zIndex: 0,
    pointerEvents: "none",
  },

  circleBottomLeft: {
    position: "absolute",
    bottom: "-180px",
    left: "8%",
    width: "370px",
    height: "370px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 215, 132, 0.1)",
    filter: "blur(44px)",
    zIndex: 0,
    pointerEvents: "none",
  },

  circleBottomRight: {
    position: "absolute",
    bottom: "-170px",
    right: "8%",
    width: "380px",
    height: "380px",
    borderRadius: "50%",
    backgroundColor: "rgba(30, 146, 210, 0.07)",
    filter: "blur(44px)",
    zIndex: 0,
    pointerEvents: "none",
  },

  brandButton: {
    border: "none",
    background: "transparent",
    padding: 0,
    margin: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },

  logo: {
    width: "150px",
    height: "auto",
    maxHeight: "48px",
    objectFit: "contain",
    objectPosition: "left center",
    display: "block",
  },

  companyBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 11px",
    backgroundColor: COLORS.white,
    borderRadius: "8px",
    border: `1px solid ${COLORS.orange}`,
  },

  companyBadgeDot: {
    color: COLORS.gold,
    fontSize: "10px",
    lineHeight: 1,
  },

  companyBadgeText: {
    color: COLORS.teal,
    fontWeight: 700,
    fontSize: "11px",
    lineHeight: 1.2,
  },

  topNavbar: {
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    borderBottom: `1px solid ${COLORS.border}`,
    padding: "0 42px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: "76px",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    boxShadow:
      "0 4px 14px rgba(0, 39, 61, 0.05)",
    gap: "18px",
  },

  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    zIndex: 1,
    flexShrink: 0,
  },

  navMenu: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "3px",
    zIndex: 1,
    overflowX: "auto",
    flex: 1,
    scrollbarWidth: "none",
  },

  navItem: {
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid transparent",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
    color: COLORS.mutedText,
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
  },

  activeNavItem: {
    padding: "9px 12px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.orange}`,
    backgroundColor:
      "rgba(255, 215, 132, 0.25)",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 700,
    color: COLORS.teal,
    boxShadow:
      "0 2px 6px rgba(255, 173, 1, 0.12)",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
  },

  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    zIndex: 1,
    flexShrink: 0,
  },

  notificationWrapper: {
    position: "relative",
  },

  notificationBtn: {
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    padding: "8px 11px",
    borderRadius: "8px",
    fontSize: "17px",
    cursor: "pointer",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  notificationBadge: {
    position: "absolute",
    top: "5px",
    right: "5px",
    width: "8px",
    height: "8px",
    backgroundColor: "#DC2626",
    borderRadius: "50%",
    border: "2px solid #FFFFFF",
  },

  notificationDropdown: {
    position: "absolute",
    top: "48px",
    right: 0,
    width: "320px",
    backgroundColor:
      "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "12px",
    boxShadow:
      "0 20px 40px rgba(0, 39, 61, 0.15)",
    border: `1px solid ${COLORS.border}`,
    zIndex: 1100,
    overflow: "hidden",
  },

  notificationHeader: {
    padding: "14px 18px",
    borderBottom:
      "1px solid rgba(226, 232, 240, 0.8)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  notificationTitle: {
    fontWeight: 800,
    fontSize: "14px",
    color: COLORS.teal,
  },

  notificationCount: {
    fontSize: "12px",
    color: COLORS.mutedText,
    fontWeight: 600,
  },

  notificationList: {
    display: "flex",
    flexDirection: "column",
    maxHeight: "280px",
    overflowY: "auto",
  },

  notificationItem: {
    padding: "12px 18px",
    borderBottom:
      "1px solid rgba(241, 245, 249, 0.8)",
    display: "flex",
    flexDirection: "column",
  },

  notificationText: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#1E293B",
  },

  notificationTime: {
    fontSize: "11px",
    color: COLORS.mutedText,
    marginTop: "3px",
    fontWeight: 500,
  },

  logoutBtn: {
    backgroundColor: COLORS.white,
    color: COLORS.teal,
    border: `1px solid ${COLORS.teal}`,
    padding: "8px 15px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
  },

  mainWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    maxWidth: "100%",
    width: "100%",
    margin: "0 auto",
    zIndex: 1,
  },

  mainContent: {
    flex: 1,
    padding: "38px 48px 48px",
    backgroundColor: "transparent",
  },

  headerArea: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "30px",
    gap: "24px",
  },

  eyebrow: {
    margin: "0 0 8px",
    fontSize: "11px",
    fontWeight: 700,
    color: COLORS.gold,
    letterSpacing: "0.08em",
  },

  title: {
    fontSize: "36px",
    fontWeight: 700,
    color: COLORS.teal,
    margin: "0 0 6px",
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
  },

  subtitle: {
    fontSize: "15px",
    lineHeight: 1.6,
    color: COLORS.mutedText,
    fontWeight: 400,
    margin: 0,
    maxWidth: "760px",
  },

  quickActionRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  primaryActionBtn: {
    padding: "11px 18px",
    backgroundColor: COLORS.teal,
    color: COLORS.white,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
    boxShadow:
      "0 4px 10px rgba(0, 70, 109, 0.16)",
    fontFamily: "inherit",
  },

  secondaryActionBtn: {
    padding: "11px 18px",
    backgroundColor: COLORS.white,
    color: COLORS.teal,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  metricsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
    marginBottom: "26px",
  },

  metricCard: {
    backgroundColor:
      "rgba(255, 255, 255, 0.97)",
    borderRadius: "12px",
    padding: "22px",
    border: `1px solid ${COLORS.border}`,
    boxShadow:
      "0 8px 22px rgba(0, 39, 61, 0.055)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  metricHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  metricTitle: {
    fontSize: "11px",
    fontWeight: 700,
    color: COLORS.mutedText,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  metricIconDot: {
    width: "9px",
    height: "9px",
    backgroundColor: COLORS.orange,
    borderRadius: "50%",
    border: `2px solid ${COLORS.gold}`,
    flexShrink: 0,
  },

  metricValueRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "12px",
  },

  metricValue: {
    fontSize: "32px",
    fontWeight: 700,
    color: COLORS.darkBlue,
    lineHeight: 1,
  },

  metricChange: {
    fontSize: "12px",
    fontWeight: 700,
    textAlign: "right",
  },

  sectionCard: {
    backgroundColor:
      "rgba(255, 255, 255, 0.97)",
    borderRadius: "12px",
    padding: "26px",
    border: `1px solid ${COLORS.border}`,
    boxShadow:
      "0 8px 22px rgba(0, 39, 61, 0.055)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    gap: "16px",
  },

  sectionTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: COLORS.teal,
    margin: 0,
  },

  liveBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: COLORS.teal,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  liveDot: {
    color: COLORS.success,
    fontSize: "11px",
  },

  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  activityItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
    padding: "14px 16px",
    backgroundColor: "#F4F3FA",
    borderRadius: "9px",
    border: `1px solid ${COLORS.border}`,
  },

  activityMain: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },

  activityCategoryTag: {
    flexShrink: 0,
    fontSize: "10px",
    fontWeight: 700,
    color: COLORS.teal,
    backgroundColor:
      "rgba(255, 215, 132, 0.45)",
    padding: "4px 8px",
    borderRadius: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  activityText: {
    fontSize: "13px",
    fontWeight: 500,
    color: COLORS.bodyText,
  },

  activityTime: {
    flexShrink: 0,
    fontSize: "12px",
    color: COLORS.mutedText,
    fontWeight: 400,
  },

  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    padding: "28px",
    marginBottom: "26px",
    border: `1px solid ${COLORS.border}`,
    boxShadow:
      "0 8px 22px rgba(0, 39, 61, 0.05)",
    textAlign: "center",
  },

  statusText: {
    fontSize: "14px",
    color: COLORS.mutedText,
    fontWeight: 500,
  },

  errorCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
    backgroundColor: COLORS.errorBg,
    border: `1px solid ${COLORS.errorBorder}`,
    color: COLORS.errorText,
    borderRadius: "10px",
    padding: "15px 18px",
    marginBottom: "26px",
    fontSize: "13px",
    fontWeight: 600,
  },

  retryButton: {
    border: `1px solid ${COLORS.errorBorder}`,
    backgroundColor: COLORS.white,
    color: COLORS.errorText,
    borderRadius: "8px",
    padding: "7px 14px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    padding: "28px",
    border: `1px solid ${COLORS.border}`,
    color: COLORS.mutedText,
    fontSize: "13px",
    fontWeight: 500,
    textAlign: "center",
    gridColumn: "1 / -1",
  },

  emptyActivity: {
    padding: "28px",
    textAlign: "center",
    color: COLORS.mutedText,
    fontSize: "13px",
    fontWeight: 500,
    backgroundColor: "#F4F3FA",
    borderRadius: "9px",
    border: `1px solid ${COLORS.border}`,
  },

  /* =====================================================
     GUIDANCE
     ===================================================== */

  guidanceWrapper: {
    width: "100%",
    boxSizing: "border-box",
  },

  guidanceHeader: {
    marginBottom: "30px",
  },

  guidanceTitle: {
    fontSize: "36px",
    fontWeight: 700,
    color: COLORS.teal,
    margin: "0 0 8px",
    lineHeight: 1.15,
  },

  guidanceSubtitle: {
    color: COLORS.mutedText,
    fontSize: "15px",
    lineHeight: 1.6,
    margin: 0,
    maxWidth: "850px",
  },

  guidanceBanner: {
    backgroundColor:
      "rgba(255, 255, 255, 0.92)",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "14px",
    padding: "28px",
    marginBottom: "36px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "28px",
    boxShadow:
      "0 12px 28px rgba(0, 70, 109, 0.06)",
  },

  resourceBadge: {
    display: "inline-block",
    backgroundColor:
      "rgba(255, 215, 132, 0.35)",
    color: COLORS.teal,
    fontSize: "11px",
    fontWeight: 700,
    padding: "6px 11px",
    borderRadius: "7px",
    textTransform: "uppercase",
    border: `1px solid ${COLORS.orange}`,
  },

  bannerTitle: {
    fontSize: "23px",
    fontWeight: 700,
    color: COLORS.teal,
    margin: "12px 0 8px",
  },

  bannerText: {
    color: COLORS.mutedText,
    fontSize: "14px",
    margin: 0,
    lineHeight: 1.6,
  },

  bannerButton: {
    flexShrink: 0,
    backgroundColor: COLORS.teal,
    color: COLORS.white,
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
    boxShadow:
      "0 4px 12px rgba(0, 70, 109, 0.18)",
  },

  guidanceSection: {
    marginBottom: "38px",
  },

  guidanceSectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  guidanceSectionTitle: {
    fontSize: "21px",
    fontWeight: 700,
    color: COLORS.teal,
    margin: 0,
  },

  viewAllButton: {
    border: "none",
    background: "transparent",
    color: COLORS.blue,
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },

  guidanceGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "20px",
  },

  guidanceCard: {
    backgroundColor:
      "rgba(255, 255, 255, 0.96)",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "14px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow:
      "0 10px 24px rgba(0, 70, 109, 0.055)",
  },

  videoPreview: {
    height: "150px",
    backgroundColor: "#F4F7FA",
    backgroundImage:
      "radial-gradient(circle, rgba(203, 213, 225, 0.6) 1px, transparent 1px)",
    backgroundSize: "16px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  playButton: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: COLORS.teal,
    color: COLORS.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow:
      "0 6px 16px rgba(0, 70, 109, 0.25)",
  },

  videoDuration: {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    backgroundColor: COLORS.teal,
    color: COLORS.white,
    fontSize: "11px",
    fontWeight: 700,
    padding: "3px 7px",
    borderRadius: "5px",
  },

  guidanceCardContent: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    justifyContent: "space-between",
  },

  categoryLabel: {
    color: COLORS.blue,
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  guidanceCardTitle: {
    fontSize: "17px",
    fontWeight: 700,
    color: COLORS.teal,
    margin: "7px 0 9px",
    lineHeight: 1.4,
  },

  guidanceCardDescription: {
    color: COLORS.mutedText,
    fontSize: "13px",
    lineHeight: 1.55,
    margin: 0,
  },

  guidanceCardFooter: {
    marginTop: "18px",
    paddingTop: "13px",
    borderTop:
      "1px solid rgba(226, 232, 240, 0.8)",
  },

  cardLinkButton: {
    border: "none",
    background: "transparent",
    padding: 0,
    color: COLORS.blue,
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },

  guidanceCardWritten: {
    backgroundColor:
      "rgba(255, 255, 255, 0.96)",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "14px",
    padding: "21px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "230px",
    boxShadow:
      "0 10px 24px rgba(0, 70, 109, 0.055)",
  },

  guideMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },

  readTime: {
    backgroundColor: "#F4F7FA",
    border: `1px solid ${COLORS.border}`,
    color: COLORS.mutedText,
    fontSize: "11px",
    padding: "3px 8px",
    borderRadius: "10px",
    fontWeight: 600,
  },

  guideFooter: {
    marginTop: "20px",
    paddingTop: "13px",
    borderTop:
      "1px solid rgba(226, 232, 240, 0.8)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },

  guideBadge: {
    color: "#059669",
    fontSize: "11px",
    fontWeight: 700,
  },

  footer: {
    position: "relative",
    zIndex: 10,
    backgroundColor:
      "rgba(255, 255, 255, 0.92)",
    backdropFilter: "blur(8px)",
    padding: "18px 24px",
    textAlign: "center",
    fontSize: "11px",
    fontWeight: 400,
    borderTop: `1px solid ${COLORS.border}`,
    color: COLORS.mutedText,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  footerLink: {
    textDecoration: "none",
    color: COLORS.mutedText,
  },
};
