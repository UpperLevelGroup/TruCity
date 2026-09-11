import React, { useEffect, useState } from 'react';
import TalentFeed from './TalentFeed';
import Pipeline from './Pipeline';
import JobListing from './JobListing';
import Messages from './Messages';
import Plans from './Plans';
import CompanyProfile from './CompanyProfile';

import logo from '../../../assets/branding/trucity-logo.png';
import { companyService } from '../company.service';
import type {
  CompanyDashboardSummary,
  CompanyDashboardMetric,
  CompanyActivity,
} from '../company.types';

type CompanyTab =
  | 'overview'
  | 'talent'
  | 'pipeline'
  | 'jobs'
  | 'messages'
  | 'plans'
  | 'profile';

const COLORS = {
  white: '#FFFFFF',
  page: '#F8FCFF',
  teal: '#00466D',
  darkBlue: '#00273D',
  blue: '#1E92D2',
  gold: '#FFAD01',
  orange: '#FFD784',
  lightPurple: '#E9E8F3',
  lighterPurple: '#F4F3FA',
  border: '#D4D2E6',
  bodyText: '#334155',
  mutedText: '#64748B',
  success: '#43ED9C',
  errorBg: '#FFF5F5',
  errorBorder: '#FF4672',
  errorText: '#A61B3C',
} as const;

export default function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState<CompanyTab>('overview');
  const [dashboard, setDashboard] =
    useState<CompanyDashboardSummary | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoadingDashboard(true);
      setDashboardError('');
      const data = await companyService.getDashboardSummary();
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load company dashboard:', error);
      setDashboardError('Unable to load dashboard data.');
    } finally {
      setLoadingDashboard(false);
    }
  };

  const handleOpenMessage = (_candidateName: string) => {
    setActiveTab('messages');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const metrics: CompanyDashboardMetric[] = dashboard?.metrics ?? [];
  const recentActivity: CompanyActivity[] = dashboard?.recentActivity ?? [];

  return (
    <div style={styles.appLayout}>
      <div
        style={{
          ...styles.bgLogoWatermark,
          backgroundImage: `url(${logo})`,
        }}
        aria-hidden="true"
      />

      {/* Maximum four decorative circles, per TruCity guidelines. */}
      <div style={styles.circleTopLeft} aria-hidden="true" />
      <div style={styles.circleTopRight} aria-hidden="true" />
      <div style={styles.circleBottomLeft} aria-hidden="true" />
      <div style={styles.circleBottomRight} aria-hidden="true" />

      <header style={styles.topNavbar}>
        <div style={styles.navLeft}>
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            style={styles.brandButton}
            aria-label="Go to TruCity dashboard"
          >
            <img
              src={logo}
              alt="TruCity — VERIFY • CONNECT • PERSUE"
              style={styles.logo}
            />
          </button>

          <div style={styles.companyBadge}>
            <span style={styles.companyBadgeDot}>●</span>
            <span style={styles.companyBadgeText}>Verified Workspace</span>
          </div>
        </div>

        <nav style={styles.navMenu} aria-label="Company navigation">
          {([
            ['overview', 'Dashboard'],
            ['talent', 'Talent Feed'],
            ['pipeline', 'Pipeline'],
            ['jobs', 'Job Listings'],
            ['messages', 'Messages'],
            ['plans', 'Plans & Billing'],
            ['profile', 'Company Profile'],
          ] as const).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              style={
                activeTab === tab
                  ? styles.activeNavItem
                  : styles.navItem
              }
              onClick={() => setActiveTab(tab)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div style={styles.navRight}>
          <button
            type="button"
            style={styles.logoutBtn}
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </header>

      <main style={styles.mainWrapper}>
        <div style={styles.mainContent}>
          {activeTab === 'overview' && (
            <div>
              <div style={styles.headerArea}>
                <div>
                  <p style={styles.eyebrow}>TRUCITY • COMPANY WORKSPACE</p>
                  <h1 style={styles.title}>Executive Overview</h1>
                  <p style={styles.subtitle}>
                    Track cross-department hiring velocity, active listings,
                    and candidate activity streams.
                  </p>
                </div>

                <div style={styles.quickActionRow}>
                  <button
                    type="button"
                    style={styles.primaryActionBtn}
                    onClick={() => setActiveTab('jobs')}
                  >
                    + Post New Job
                  </button>

                  <button
                    type="button"
                    style={styles.secondaryActionBtn}
                    onClick={() => setActiveTab('talent')}
                  >
                    Explore Talent Feed
                  </button>
                </div>
              </div>

              {loadingDashboard && (
                <div style={styles.statusCard}>
                  <span style={styles.statusText}>
                    Loading dashboard data...
                  </span>
                </div>
              )}

              {!loadingDashboard && dashboardError && (
                <div style={styles.errorCard}>
                  <span>{dashboardError}</span>
                  <button
                    type="button"
                    style={styles.retryButton}
                    onClick={loadDashboard}
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loadingDashboard && !dashboardError && (
                <>
                  <div style={styles.metricsGrid}>
                    {metrics.length > 0 ? (
                      metrics.map((metric, idx) => (
                        <div
                          key={`${metric.title}-${idx}`}
                          style={styles.metricCard}
                        >
                          <div style={styles.metricHeader}>
                            <span style={styles.metricTitle}>
                              {metric.title}
                            </span>
                            <div style={styles.metricIconDot} />
                          </div>

                          <div style={styles.metricValueRow}>
                            <span style={styles.metricValue}>
                              {metric.value}
                            </span>
                            <span
                              style={{
                                ...styles.metricChange,
                                color: metric.color ?? COLORS.teal,
                              }}
                            >
                              {metric.change}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={styles.emptyCard}>
                        No dashboard metrics available.
                      </div>
                    )}
                  </div>

                  <div style={styles.sectionCard}>
                    <div style={styles.sectionHeader}>
                      <h3 style={styles.sectionTitle}>
                        Real-Time Recruitment Activity
                      </h3>
                      <span style={styles.liveBadge}>
                        <span style={styles.liveDot}>●</span>
                        Live Stream
                      </span>
                    </div>

                    <div style={styles.activityList}>
                      {recentActivity.length > 0 ? (
                        recentActivity.map((activity) => (
                          <div
                            key={activity.id}
                            style={styles.activityItem}
                          >
                            <div style={styles.activityMain}>
                              <span style={styles.activityCategoryTag}>
                                {activity.category}
                              </span>
                              <span style={styles.activityText}>
                                {activity.text}
                              </span>
                            </div>
                            <span style={styles.activityTime}>
                              {activity.time}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div style={styles.emptyActivity}>
                          No recent recruitment activity.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'talent' && (
            <TalentFeed onOpenMessage={handleOpenMessage} />
          )}
          {activeTab === 'pipeline' && <Pipeline />}
          {activeTab === 'jobs' && <JobListing />}
          {activeTab === 'messages' && <Messages />}
          {activeTab === 'plans' && <Plans />}
          {activeTab === 'profile' && <CompanyProfile />}
        </div>
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  appLayout: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: COLORS.page,
    fontFamily: 'Helvetica, Arial, sans-serif',
    position: 'relative',
    overflowX: 'hidden',
    boxSizing: 'border-box',
  },

  bgLogoWatermark: {
    position: 'fixed',
    inset: 0,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'min(72vw, 720px)',
    opacity: 0.025,
    pointerEvents: 'none',
    zIndex: 0,
  },

  circleTopLeft: {
    position: 'absolute',
    top: '90px',
    left: '-180px',
    width: '360px',
    height: '360px',
    borderRadius: '50%',
    backgroundColor: 'rgba(30, 146, 210, 0.08)',
    filter: 'blur(42px)',
    zIndex: 0,
    pointerEvents: 'none',
  },

  circleTopRight: {
    position: 'absolute',
    top: '170px',
    right: '-170px',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 173, 1, 0.09)',
    filter: 'blur(42px)',
    zIndex: 0,
    pointerEvents: 'none',
  },

  circleBottomLeft: {
    position: 'absolute',
    bottom: '-180px',
    left: '8%',
    width: '370px',
    height: '370px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 215, 132, 0.10)',
    filter: 'blur(44px)',
    zIndex: 0,
    pointerEvents: 'none',
  },

  circleBottomRight: {
    position: 'absolute',
    bottom: '-170px',
    right: '8%',
    width: '380px',
    height: '380px',
    borderRadius: '50%',
    backgroundColor: 'rgba(30, 146, 210, 0.07)',
    filter: 'blur(44px)',
    zIndex: 0,
    pointerEvents: 'none',
  },

  brandButton: {
    border: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },

  logo: {
    width: '150px',
    height: 'auto',
    maxHeight: '48px',
    objectFit: 'contain',
    objectPosition: 'left center',
    display: 'block',
  },

  companyBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 11px',
    backgroundColor: COLORS.white,
    borderRadius: '8px',
    border: `1px solid ${COLORS.orange}`,
  },

  companyBadgeDot: {
    color: COLORS.gold,
    fontSize: '10px',
    lineHeight: 1,
  },

  companyBadgeText: {
    color: COLORS.teal,
    fontWeight: 700,
    fontSize: '11px',
    lineHeight: 1.2,
  },

  topNavbar: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    borderBottom: `1px solid ${COLORS.border}`,
    padding: '0 42px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '76px',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 4px 14px rgba(0, 39, 61, 0.05)',
    gap: '18px',
  },

  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    zIndex: 1,
    flexShrink: 0,
  },

  navMenu: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    zIndex: 1,
    overflowX: 'auto',
    flex: 1,
    scrollbarWidth: 'none',
  },

  navItem: {
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    color: COLORS.mutedText,
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
  },

  activeNavItem: {
    padding: '9px 12px',
    borderRadius: '8px',
    border: `1px solid ${COLORS.orange}`,
    backgroundColor: 'rgba(255, 215, 132, 0.25)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 700,
    color: COLORS.teal,
    boxShadow: '0 2px 6px rgba(255, 173, 1, 0.12)',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
  },

  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 1,
    flexShrink: 0,
  },

  logoutBtn: {
    backgroundColor: COLORS.white,
    color: COLORS.teal,
    border: `1px solid ${COLORS.teal}`,
    padding: '8px 15px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
  },

  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '100%',
    width: '100%',
    margin: '0 auto',
    zIndex: 1,
  },

  mainContent: {
    flex: 1,
    padding: '38px 48px 48px',
    backgroundColor: 'transparent',
  },

  headerArea: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
    gap: '24px',
  },

  eyebrow: {
    margin: '0 0 8px',
    fontSize: '11px',
    fontWeight: 700,
    color: COLORS.gold,
    letterSpacing: '0.08em',
  },

  title: {
    fontSize: '36px',
    fontWeight: 700,
    color: COLORS.teal,
    margin: '0 0 6px',
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
  },

  subtitle: {
    fontSize: '15px',
    lineHeight: 1.6,
    color: COLORS.mutedText,
    fontWeight: 400,
    margin: 0,
    maxWidth: '760px',
  },

  quickActionRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },

  primaryActionBtn: {
    padding: '11px 18px',
    backgroundColor: COLORS.teal,
    color: COLORS.white,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0, 70, 109, 0.16)',
    fontFamily: 'inherit',
  },

  secondaryActionBtn: {
    padding: '11px 18px',
    backgroundColor: COLORS.white,
    color: COLORS.teal,
    border: `1px solid ${COLORS.teal}`,
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '18px',
    marginBottom: '26px',
  },

  metricCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: '12px',
    padding: '22px',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 8px 22px rgba(0, 39, 61, 0.055)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  metricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  metricTitle: {
    fontSize: '11px',
    fontWeight: 700,
    color: COLORS.mutedText,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },

  metricIconDot: {
    width: '9px',
    height: '9px',
    backgroundColor: COLORS.orange,
    borderRadius: '50%',
    border: `2px solid ${COLORS.gold}`,
    flexShrink: 0,
  },

  metricValueRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: '12px',
  },

  metricValue: {
    fontSize: '32px',
    fontWeight: 700,
    color: COLORS.darkBlue,
    lineHeight: 1,
  },

  metricChange: {
    fontSize: '12px',
    fontWeight: 700,
    textAlign: 'right',
  },

  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: '12px',
    padding: '26px',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 8px 22px rgba(0, 39, 61, 0.055)',
  },

  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    gap: '16px',
  },

  sectionTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: COLORS.teal,
    margin: 0,
  },

  liveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: COLORS.teal,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  liveDot: {
    color: COLORS.success,
    fontSize: '11px',
  },

  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  activityItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '18px',
    padding: '14px 16px',
    backgroundColor: COLORS.lighterPurple,
    borderRadius: '9px',
    border: `1px solid ${COLORS.border}`,
  },

  activityMain: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: 0,
  },

  activityCategoryTag: {
    flexShrink: 0,
    fontSize: '10px',
    fontWeight: 700,
    color: COLORS.teal,
    backgroundColor: 'rgba(255, 215, 132, 0.45)',
    padding: '4px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  activityText: {
    fontSize: '13px',
    fontWeight: 500,
    color: COLORS.bodyText,
  },

  activityTime: {
    flexShrink: 0,
    fontSize: '12px',
    color: COLORS.mutedText,
    fontWeight: 400,
  },

  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: '12px',
    padding: '28px',
    marginBottom: '26px',
    border: `1px solid ${COLORS.border}`,
    boxShadow: '0 8px 22px rgba(0, 39, 61, 0.05)',
    textAlign: 'center',
  },

  statusText: {
    fontSize: '14px',
    color: COLORS.mutedText,
    fontWeight: 500,
  },

  errorCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '18px',
    backgroundColor: COLORS.errorBg,
    border: `1px solid ${COLORS.errorBorder}`,
    color: COLORS.errorText,
    borderRadius: '10px',
    padding: '15px 18px',
    marginBottom: '26px',
    fontSize: '13px',
    fontWeight: 600,
  },

  retryButton: {
    border: `1px solid ${COLORS.errorBorder}`,
    backgroundColor: COLORS.white,
    color: COLORS.errorText,
    borderRadius: '8px',
    padding: '7px 14px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: '12px',
    padding: '28px',
    border: `1px solid ${COLORS.border}`,
    color: COLORS.mutedText,
    fontSize: '13px',
    fontWeight: 500,
    textAlign: 'center',
    gridColumn: '1 / -1',
  },

  emptyActivity: {
    padding: '28px',
    textAlign: 'center',
    color: COLORS.mutedText,
    fontSize: '13px',
    fontWeight: 500,
    backgroundColor: COLORS.lighterPurple,
    borderRadius: '9px',
    border: `1px solid ${COLORS.border}`,
  },
};
