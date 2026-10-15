import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleHelp,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

import api from '../../../api/axios';
import logo from '../../../assets/trucity-nav-logo.png';

import CompanyHub from './CompanyHub';
import Pipeline from './Pipeline';
import JobListing from './JobListing';
import Messages from './Messages';
import Plans from './Plans';
import CompanyProfile from './CompanyProfile';

import { companyService } from '../company.service';

import type {
  CompanyDashboardSummary,
} from '../company.types';

/* =========================================================
   TRUCITY BRAND
========================================================= */

const COLORS = {
  white: '#FFFFFF',
  page: '#F8FCFF',
  teal: '#00466D',
  darkBlue: '#00273D',
  blue: '#1E92D2',
  gold: '#FFAD01',
  orange: '#FFD784',
  border: '#DCE7EF',
  bodyText: '#334155',
  mutedText: '#64748B',
  success: '#15803D',
  successBg: '#F0FDF4',
  warning: '#B45309',
  warningBg: '#FFFBEB',
  purple: '#6D5BD0',
  purpleBg: '#F5F3FF',
};

type CompanyTab =
  | 'overview'
  | 'companyHub'
  | 'guidance'
  | 'pipeline'
  | 'jobs'
  | 'messages'
  | 'profile';

type ProfileSection = 'details' | 'billing';

type NavigationItem = {
  id: CompanyTab;
  label: string;
  icon: React.ElementType;
  group: 'workspace' | 'recruitment';
};

const NAVIGATION: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    group: 'workspace',
  },
  {
    id: 'companyHub',
    label: 'Company Hub',
    icon: Building2,
    group: 'workspace',
  },
  {
    id: 'guidance',
    label: 'Guidance Hub',
    icon: BookOpen,
    group: 'workspace',
  },
  {
    id: 'pipeline',
    label: 'Talent Pipeline',
    icon: Users,
    group: 'recruitment',
  },
  {
    id: 'jobs',
    label: 'Job Listings',
    icon: BriefcaseBusiness,
    group: 'recruitment',
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageSquare,
    group: 'recruitment',
  },
  {
    id: 'profile',
    label: 'Profile & Settings',
    icon: Settings2,
    group: 'recruitment',
  },
];

/* =========================================================
   SHARED DISPLAY HELPERS
========================================================= */

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }

  return {};
}

function getFirstValue(
  record: Record<string, unknown>,
  keys: string[],
): unknown {
  for (const key of keys) {
    const value = record[key];

    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return undefined;
}

function displayValue(
  value: unknown,
  fallback = '0',
): string {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value === 'number') {
    return value.toLocaleString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return fallback;
}

function getActivityTitle(
  activity: Record<string, unknown>,
): string {
  return displayValue(
    getFirstValue(activity, [
      'title',
      'action',
      'event',
      'type',
      'activity',
    ]),
    'Recent activity',
  );
}

function getActivityDescription(
  activity: Record<string, unknown>,
): string {
  return displayValue(
    getFirstValue(activity, [
      'description',
      'message',
      'details',
      'summary',
    ]),
    'A recruitment activity was recorded.',
  );
}

function getActivityTime(
  activity: Record<string, unknown>,
): string {
  const rawTime = getFirstValue(activity, [
    'time',
    'timestamp',
    'createdAt',
    'date',
    'occurredAt',
  ]);

  if (!rawTime) {
    return '';
  }

  const date = new Date(String(rawTime));

  if (Number.isNaN(date.getTime())) {
    return String(rawTime);
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}

/* =========================================================
   GLOBAL DASHBOARD STYLES
========================================================= */

const STYLES = `
  .tc-company {
    min-height: 100vh;
    color: ${COLORS.bodyText};
    background: ${COLORS.page};
    font-family: Helvetica, Arial, sans-serif;
    isolation: isolate;
    position: relative;
  }

  .tc-company *,
  .tc-company *::before,
  .tc-company *::after {
    box-sizing: border-box;
  }

  .tc-company button,
  .tc-company input {
    font: inherit;
  }

  .tc-company button {
    cursor: pointer;
  }

  
  .tc-shell {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 258px minmax(0, 1fr);
  }

  /* SIDEBAR */

  .tc-sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
    min-height: 0;
    overflow-y: auto;
    background: ${COLORS.white};
    border-right: 1px solid ${COLORS.border};
    display: flex;
    flex-direction: column;
    padding: 24px 16px 18px;
    z-index: 30;
  }

  .tc-brand {
    padding: 0 12px 24px;
    border-bottom: 1px solid #EDF2F6;
  }

  .tc-brand img {
    display: block;
    width: auto;
    max-width: 176px;
    max-height: 58px;
    object-fit: contain;
    object-position: left center;
  }

  .tc-brand-caption {
    margin-top: 12px;
    color: ${COLORS.mutedText};
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.45px;
    text-transform: uppercase;
  }

  .tc-workspace-card {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 13px 11px;
    margin: 18px 0 24px;
    border: 1px solid #E5EDF3;
    border-radius: 13px;
    background: linear-gradient(135deg, #F3FAFE, #FFFFFF);
  }

  .tc-workspace-icon {
    width: 39px;
    height: 39px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 11px;
    color: ${COLORS.white};
    background: linear-gradient(145deg, ${COLORS.blue}, ${COLORS.teal});
  }

  .tc-workspace-name {
    color: ${COLORS.darkBlue};
    font-size: 12px;
    font-weight: 800;
    margin-bottom: 4px;
  }

  .tc-workspace-subtitle {
    color: ${COLORS.mutedText};
    font-size: 10px;
  }

  .tc-nav-label {
    padding: 0 12px;
    margin: 0 0 9px;
    color: #94A3B8;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.3px;
    text-transform: uppercase;
  }

  .tc-nav {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .tc-nav-button {
    position: relative;
    width: 100%;
    min-height: 44px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 13px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: transparent;
    color: #64748B;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    transition:
      background .18s ease,
      color .18s ease,
      border-color .18s ease;
  }

  .tc-nav-button:hover {
    color: ${COLORS.teal};
    background: #F5F9FC;
  }

  .tc-nav-button.active {
    color: ${COLORS.teal};
    background: #EAF5FB;
    border-color: #D7EAF5;
    font-weight: 800;
  }

  .tc-nav-button.active::before {
    content: "";
    position: absolute;
    left: -1px;
    top: 50%;
    width: 3px;
    height: 21px;
    transform: translateY(-50%);
    border-radius: 0 4px 4px 0;
    background: ${COLORS.blue};
  }

  .tc-nav-button.active svg {
    color: ${COLORS.blue};
  }

  .tc-sidebar-bottom {
    margin-top: auto;
    padding-top: 22px;
  }

  .tc-help-card {
    padding: 15px;
    margin-bottom: 13px;
    border-radius: 13px;
    color: ${COLORS.white};
    background: linear-gradient(145deg, ${COLORS.darkBlue}, ${COLORS.teal});
  }

  .tc-help-card > svg {
    color: ${COLORS.orange};
  }

  .tc-help-title {
    margin: 10px 0 5px;
    font-size: 12px;
    font-weight: 800;
  }

  .tc-help-copy {
    margin-bottom: 12px;
    color: #D5E6F0;
    font-size: 10px;
    line-height: 1.65;
  }

  .tc-help-button {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 0;
    border: 0;
    background: transparent;
    color: ${COLORS.white};
    font-size: 11px;
    font-weight: 800;
  }

  .tc-logout {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 12px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: transparent;
    color: #64748B;
    text-align: left;
    font-size: 12px;
    font-weight: 700;
  }

  .tc-logout:hover {
    color: #B91C1C;
    background: #FEF2F2;
  }

  /* TOP BAR */

  .tc-main {
    min-width: 0;
  }

  .tc-topbar {
    position: sticky;
    top: 0;
    z-index: 20;
    min-height: 76px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 14px 32px;
    border-bottom: 1px solid ${COLORS.border};
    background: rgba(255,255,255,.94);
    backdrop-filter: blur(14px);
  }

  .tc-topbar-left,
  .tc-topbar-right {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 13px;
  }

  .tc-mobile-menu {
    display: none;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border: 1px solid ${COLORS.border};
    border-radius: 10px;
    background: ${COLORS.white};
    color: ${COLORS.teal};
  }

  .tc-breadcrumb {
    margin-bottom: 4px;
    color: ${COLORS.mutedText};
    font-size: 10px;
  }

  .tc-topbar-title {
    color: ${COLORS.darkBlue};
    font-size: 15px;
    font-weight: 800;
    white-space: nowrap;
  }

  .tc-verified {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 11px;
    border: 1px solid #D5EADF;
    border-radius: 999px;
    background: #F1FBF5;
    color: #187347;
    font-size: 10px;
    font-weight: 800;
    white-space: nowrap;
  }

  .tc-search {
    width: 215px;
    height: 39px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 0 12px;
    border: 1px solid ${COLORS.border};
    border-radius: 10px;
    background: #FAFCFE;
    color: #94A3B8;
  }

  .tc-search input {
    width: 100%;
    min-width: 0;
    outline: 0;
    border: 0;
    background: transparent;
    color: ${COLORS.bodyText};
    font-size: 10px;
  }

  .tc-icon-button {
    position: relative;
    width: 39px;
    height: 39px;
    display: grid;
    place-items: center;
    border: 1px solid ${COLORS.border};
    border-radius: 10px;
    background: ${COLORS.white};
    color: #64748B;
  }

  .tc-icon-button:hover {
    color: ${COLORS.teal};
    background: #F5FAFD;
  }

  .tc-notification-dot {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 7px;
    height: 7px;
    border: 1px solid ${COLORS.white};
    border-radius: 50%;
    background: ${COLORS.gold};
  }

  .tc-avatar {
    width: 39px;
    height: 39px;
    display: grid;
    place-items: center;
    border: 1px solid #D5EAF5;
    border-radius: 11px;
    background: #E6F3FA;
    color: ${COLORS.teal};
  }

  /* MAIN CONTENT */

  .tc-content {
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    padding: 32px;
  }

  .tc-page-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 27px;
  }

  .tc-eyebrow {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 10px;
    color: ${COLORS.blue};
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  .tc-page-title {
    margin: 0;
    color: ${COLORS.darkBlue};
    font-size: clamp(25px, 2.5vw, 33px);
    font-weight: 900;
    letter-spacing: -1px;
    line-height: 1.2;
  }

  .tc-page-description {
    max-width: 620px;
    margin: 10px 0 0;
    color: ${COLORS.mutedText};
    font-size: 12px;
    line-height: 1.75;
  }

  .tc-heading-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .tc-button {
    min-height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 0 15px;
    border: 1px solid transparent;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 800;
    white-space: nowrap;
    transition:
      transform .18s ease,
      box-shadow .18s ease,
      background .18s ease;
  }

  .tc-button:hover {
    transform: translateY(-1px);
  }

  .tc-button-primary {
    color: ${COLORS.white};
    background: ${COLORS.teal};
    box-shadow: 0 5px 13px rgba(0,70,109,.13);
  }

  .tc-button-primary:hover {
    background: ${COLORS.darkBlue};
    box-shadow: 0 7px 18px rgba(0,70,109,.18);
  }

  .tc-button-secondary {
    color: ${COLORS.teal};
    background: ${COLORS.white};
    border-color: ${COLORS.border};
  }

  .tc-button-secondary:hover {
    background: #F4FAFD;
    border-color: #BDD7E5;
  }

  /* METRICS */

  .tc-section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin: 29px 0 15px;
  }

  .tc-section-title {
    margin: 0;
    color: ${COLORS.darkBlue};
    font-size: 14px;
    font-weight: 900;
  }

  .tc-section-subtitle {
    margin: 5px 0 0;
    color: ${COLORS.mutedText};
    font-size: 11px;
  }

  .tc-live-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-radius: 7px;
    background: #F0FDF4;
    color: #15803D;
    font-size: 9px;
    font-weight: 800;
    white-space: nowrap;
  }

  .tc-live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22C55E;
  }

  .tc-metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .tc-metric {
    min-width: 0;
    padding: 20px;
    border: 1px solid ${COLORS.border};
    border-radius: 15px;
    background: ${COLORS.white};
    box-shadow: 0 3px 12px rgba(15,42,62,.025);
    transition: transform .18s ease, box-shadow .18s ease;
  }

  .tc-metric:hover {
    transform: translateY(-2px);
    box-shadow: 0 9px 24px rgba(15,42,62,.06);
  }

  .tc-metric-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 21px;
  }

  .tc-metric-icon {
    width: 41px;
    height: 41px;
    display: grid;
    place-items: center;
    border-radius: 12px;
  }

  .tc-metric-icon.blue {
    background: #EAF5FC;
    color: ${COLORS.blue};
  }

  .tc-metric-icon.gold {
    background: #FFF7E4;
    color: #C18400;
  }

  .tc-metric-icon.green {
    background: #ECFDF3;
    color: #15803D;
  }

  .tc-metric-icon.purple {
    background: ${COLORS.purpleBg};
    color: ${COLORS.purple};
  }

  .tc-metric-trend {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 5px 7px;
    border-radius: 7px;
    background: ${COLORS.successBg};
    color: ${COLORS.success};
    font-size: 10px;
    font-weight: 800;
  }

  .tc-metric-label {
    margin-bottom: 8px;
    color: ${COLORS.mutedText};
    font-size: 11px;
    font-weight: 600;
  }

  .tc-metric-value {
    color: ${COLORS.darkBlue};
    font-size: clamp(25px, 2.4vw, 32px);
    font-weight: 900;
    letter-spacing: -1px;
    line-height: 1;
    overflow-wrap: anywhere;
  }

  .tc-metric-note {
    margin-top: 11px;
    color: #94A3B8;
    font-size: 10px;
    line-height: 1.5;
  }

  /* ACTIVITY AND QUICK ACTIONS */

  .tc-overview-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(290px, .85fr);
    gap: 18px;
    margin-top: 27px;
  }

  .tc-panel {
    min-width: 0;
    padding: 22px;
    border: 1px solid ${COLORS.border};
    border-radius: 15px;
    background: ${COLORS.white};
    box-shadow: 0 3px 12px rgba(15,42,62,.025);
  }

  .tc-panel-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 20px;
  }

  .tc-panel-title {
    margin: 0;
    color: ${COLORS.darkBlue};
    font-size: 13px;
    font-weight: 900;
  }

  .tc-panel-description {
    margin: 5px 0 0;
    color: ${COLORS.mutedText};
    font-size: 10px;
    line-height: 1.6;
  }

  .tc-activity-list {
    display: flex;
    flex-direction: column;
  }

  .tc-activity-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 15px 0;
    border-bottom: 1px solid #EEF2F6;
  }

  .tc-activity-row:first-child {
    padding-top: 0;
  }

  .tc-activity-row:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }

  .tc-activity-icon {
    width: 35px;
    height: 35px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: #EFF8FD;
    color: ${COLORS.blue};
  }

  .tc-activity-title {
    color: ${COLORS.darkBlue};
    font-size: 11px;
    font-weight: 800;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .tc-activity-description {
    margin-top: 4px;
    color: ${COLORS.mutedText};
    font-size: 10px;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }

  .tc-activity-time {
    flex-shrink: 0;
    margin-left: auto;
    padding-top: 3px;
    color: #94A3B8;
    font-size: 9px;
    white-space: nowrap;
  }

  .tc-quick-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .tc-quick-action {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px;
    border: 1px solid #E7EEF3;
    border-radius: 11px;
    background: ${COLORS.white};
    text-align: left;
    transition: border-color .18s ease, background .18s ease;
  }

  .tc-quick-action:hover {
    border-color: #BDDCEC;
    background: #F8FCFF;
  }

  .tc-quick-icon {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: #EAF5FB;
    color: ${COLORS.teal};
  }

  .tc-quick-action-copy {
    flex: 1;
    min-width: 0;
  }

  .tc-quick-action-title {
    display: block;
    color: ${COLORS.darkBlue};
    font-size: 11px;
    font-weight: 800;
  }

  .tc-quick-action-description {
    display: block;
    margin-top: 4px;
    color: ${COLORS.mutedText};
    font-size: 10px;
    line-height: 1.5;
  }

  .tc-quick-arrow {
    flex-shrink: 0;
    color: #94A3B8;
  }

  .tc-callout {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-top: 18px;
    padding: 15px;
    border: 1px solid #F4E3B3;
    border-radius: 12px;
    background: #FFFBF0;
  }

  .tc-callout-icon {
    flex-shrink: 0;
    color: #B77900;
  }

  .tc-callout-title {
    margin-bottom: 4px;
    color: #754D00;
    font-size: 11px;
    font-weight: 900;
  }

  .tc-callout-copy {
    color: #8A6B32;
    font-size: 10px;
    line-height: 1.65;
  }

  /* LOADING AND ERROR STATES */

  .tc-state-card {
    padding: 25px;
    border: 1px solid ${COLORS.border};
    border-radius: 13px;
    background: ${COLORS.white};
    color: ${COLORS.mutedText};
    font-size: 12px;
    line-height: 1.7;
  }

  .tc-state-card strong {
    display: block;
    margin-bottom: 5px;
    color: ${COLORS.darkBlue};
    font-size: 13px;
  }

  .tc-state-card.error {
    border-color: #FECACA;
    background: #FFF7F7;
    color: #991B1B;
  }

  .tc-skeleton {
    height: 150px;
    border: 1px solid ${COLORS.border};
    border-radius: 15px;
    background: linear-gradient(
      100deg,
      #FFFFFF 20%,
      #F1F6F9 40%,
      #FFFFFF 60%
    );
    background-size: 200% 100%;
    animation: tc-shimmer 1.5s ease infinite;
  }

  @keyframes tc-shimmer {
    from { background-position: 100% 0; }
    to { background-position: -100% 0; }
  }

  /* PROFILE TABS */

  .tc-profile-switch {
    width: fit-content;
    max-width: 100%;
    display: flex;
    gap: 5px;
    padding: 5px;
    margin-bottom: 20px;
    border: 1px solid ${COLORS.border};
    border-radius: 11px;
    background: ${COLORS.white};
  }

  .tc-profile-switch button {
    padding: 10px 13px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: ${COLORS.mutedText};
    font-size: 11px;
    font-weight: 800;
  }

  .tc-profile-switch button.active {
    background: #EAF5FB;
    color: ${COLORS.teal};
  }

  /* GUIDANCE HUB */

  .tc-guidance-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 17px;
  }

  .tc-guidance-card {
    min-width: 0;
    padding: 20px;
    border: 1px solid ${COLORS.border};
    border-radius: 14px;
    background: ${COLORS.white};
    transition: box-shadow .18s ease, transform .18s ease;
  }

  .tc-guidance-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 9px 24px rgba(15,42,62,.06);
  }

  .tc-guidance-category {
    display: inline-flex;
    padding: 6px 9px;
    border-radius: 7px;
    background: #EAF5FB;
    color: ${COLORS.teal};
    font-size: 9px;
    font-weight: 800;
  }

  .tc-guidance-title {
    margin: 13px 0 8px;
    color: ${COLORS.darkBlue};
    font-size: 15px;
    font-weight: 900;
    line-height: 1.45;
  }

  .tc-guidance-summary {
    color: ${COLORS.mutedText};
    font-size: 11px;
    line-height: 1.8;
    overflow-wrap: anywhere;
  }

  .tc-guidance-date {
    margin-top: 15px;
    color: #94A3B8;
    font-size: 10px;
  }

  .tc-guidance-media {
    display: block;
    max-width: 100%;
    margin-top: 14px;
    border-radius: 10px;
  }

  .tc-guidance-empty {
    grid-column: 1 / -1;
  }

  .tc-mobile-overlay {
    display: none;
  }

  /* RESPONSIVE */

  @media (max-width: 1200px) {
    .tc-metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .tc-search {
      width: 175px;
    }

    .tc-content {
      padding: 27px 24px;
    }
  }

  @media (max-width: 900px) {
    .tc-shell {
      grid-template-columns: minmax(0, 1fr);
    }

    .tc-sidebar {
      position: fixed;
      top: 0;
      left: 0;
      width: 258px;
      height: 100dvh;
      transform: translateX(-105%);
      transition: transform .22s ease;
      box-shadow: 12px 0 40px rgba(15,42,62,.08);
    }

    .tc-sidebar.open {
      transform: translateX(0);
    }

    .tc-mobile-menu {
      display: inline-flex;
    }

    .tc-mobile-overlay.visible {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 25;
      background: rgba(0,24,40,.36);
    }

    .tc-topbar {
      padding: 13px 20px;
    }

    .tc-overview-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .tc-content {
      padding: 25px 20px;
    }
  }

  @media (max-width: 600px) {
    .tc-topbar {
      min-height: 66px;
      gap: 8px;
      padding: 11px 13px;
    }

    .tc-topbar-left,
    .tc-topbar-right {
      gap: 8px;
    }

    .tc-search,
    .tc-verified {
      display: none;
    }

    .tc-topbar-title {
      font-size: 13px;
    }

    .tc-content {
      padding: 23px 14px;
    }

    .tc-page-heading {
      flex-direction: column;
      margin-bottom: 22px;
    }

    .tc-page-title {
      font-size: 26px;
    }

    .tc-heading-actions {
      width: 100%;
    }

    .tc-heading-actions .tc-button {
      flex: 1;
    }

    .tc-metrics {
      gap: 10px;
    }

    .tc-metric {
      padding: 14px;
      border-radius: 12px;
    }

    .tc-metric-top {
      margin-bottom: 16px;
    }

    .tc-metric-icon {
      width: 35px;
      height: 35px;
    }

    .tc-metric-trend {
      padding: 4px 5px;
      font-size: 9px;
    }

    .tc-metric-label {
      font-size: 10px;
      line-height: 1.5;
    }

    .tc-metric-value {
      font-size: 25px;
    }

    .tc-panel {
      padding: 16px;
    }

    .tc-activity-time {
      display: none;
    }

    .tc-guidance-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .tc-profile-switch {
      width: 100%;
    }

    .tc-profile-switch button {
      flex: 1;
      padding: 10px 8px;
    }
  }
`;

/* =========================================================
   GUIDANCE HUB NOTICES
   Kept in this file, using the existing API endpoint.
========================================================= */

type GuidanceNotice = {
  id: string | number;
  title: string;
  category: string;
  summary: string;
  description: string;
  content: string;
  body: string;
  publishedAt: string;
  createdAt: string;
  mediaUrl: string;
  featured: boolean;
};

function GuidanceHubNotices() {
  const [notices, setNotices] = useState<GuidanceNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadNotices = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(
          '/api/guidance?audience=COMPANY',
        );

        const responseData = response.data;

        const rawItems = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.content)
            ? responseData.content
            : [];

        const mapped: GuidanceNotice[] = rawItems.map(
          (item: Record<string, unknown>, index: number) => {
            const title = displayValue(
              getFirstValue(item, ['title', 'name']),
              'Guidance update',
            );

            const content = displayValue(
              getFirstValue(item, [
                'content',
                'body',
                'description',
                'summary',
              ]),
              '',
            );

            return {
              id: displayValue(
                getFirstValue(item, ['id']),
                String(index),
              ),
              title,
              category: displayValue(
                getFirstValue(item, ['category', 'type']),
                'Company guidance',
              ),
              summary: displayValue(
                getFirstValue(item, ['summary', 'description']),
                content,
              ),
              description: displayValue(
                getFirstValue(item, ['description']),
                '',
              ),
              content,
              body: displayValue(
                getFirstValue(item, ['body']),
                '',
              ),
              publishedAt: displayValue(
                getFirstValue(item, ['publishedAt']),
                '',
              ),
              createdAt: displayValue(
                getFirstValue(item, ['createdAt']),
                '',
              ),
              mediaUrl: displayValue(
                getFirstValue(item, [
                  'mediaUrl',
                  'imageUrl',
                  'thumbnailUrl',
                ]),
                '',
              ),
              featured: Boolean(item.featured),
            };
          },
        );

        if (mounted) {
          setNotices(mapped);
        }
      } catch (requestError) {
        console.error(
          'Failed to load company guidance notices:',
          requestError,
        );

        if (mounted) {
          setError(
            'Guidance notices could not be loaded. Please try again.',
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadNotices();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section>
      <div className="tc-page-heading">
        <div>
          <div className="tc-eyebrow">
            <BookOpen size={13} />
            KNOWLEDGE & SUPPORT
          </div>

          <h1 className="tc-page-title">Guidance Hub</h1>

          <p className="tc-page-description">
            Explore company guidance, recruitment resources and
            important platform updates to help your organisation
            get the most out of TruCity.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="tc-state-card">
          Loading company guidance…
        </div>
      ) : error ? (
        <div className="tc-state-card error">
          <strong>Unable to load guidance</strong>
          {error}
        </div>
      ) : notices.length === 0 ? (
        <div className="tc-state-card">
          <strong>No guidance updates yet</strong>
          New guidance articles and announcements for companies
          will appear here when they are published.
        </div>
      ) : (
        <div className="tc-guidance-grid">
          {notices.map((notice) => (
            <article
              className="tc-guidance-card"
              key={notice.id}
            >
              <span className="tc-guidance-category">
                {notice.category}
              </span>

              <h2 className="tc-guidance-title">
                {notice.title}
              </h2>

              <div className="tc-guidance-summary">
                {notice.summary ||
                  notice.description ||
                  notice.content ||
                  notice.body ||
                  'Open this guidance item to review its details.'}
              </div>

              {notice.mediaUrl && (
                <img
                  className="tc-guidance-media"
                  src={notice.mediaUrl}
                  alt=""
                  loading="lazy"
                  style={{
                    maxHeight: 230,
                    objectFit: 'cover',
                  }}
                />
              )}

              {(notice.publishedAt || notice.createdAt) && (
                <div className="tc-guidance-date">
                  {notice.publishedAt || notice.createdAt}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   COMPANY DASHBOARD
========================================================= */

export default function CompanyDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState<CompanyTab>('overview');

  const [profileSection, setProfileSection] =
    useState<ProfileSection>('details');

  const [dashboard, setDashboard] =
    useState<CompanyDashboardSummary | null>(null);

  const [loadingDashboard, setLoadingDashboard] =
    useState(true);

  const [dashboardError, setDashboardError] =
    useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  /* ---------------------------------------------------------
     DASHBOARD API
  --------------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      setLoadingDashboard(true);
      setDashboardError(null);

      try {
        const result =
          await companyService.getDashboardSummary();

        if (mounted) {
          setDashboard(result);
        }
      } catch (error) {
        console.error(
          'Failed to load company dashboard:',
          error,
        );

        if (mounted) {
          setDashboardError(
            'We could not load your recruitment overview. Please try again.',
          );
        }
      } finally {
        if (mounted) {
          setLoadingDashboard(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  /* ---------------------------------------------------------
     DASHBOARD DATA
  --------------------------------------------------------- */

  const dashboardRecord = asRecord(dashboard);

  const metrics = useMemo(() => {
    const rawMetrics = dashboardRecord.metrics;

    return Array.isArray(rawMetrics)
      ? rawMetrics
      : [];
  }, [dashboardRecord.metrics]);

  const recentActivity = useMemo(() => {
    const rawActivity = dashboardRecord.recentActivity;

    return Array.isArray(rawActivity)
      ? rawActivity
      : [];
  }, [dashboardRecord.recentActivity]);

  const visibleMetrics = useMemo(() => {
    if (!searchTerm.trim()) {
      return metrics;
    }

    const term = searchTerm.toLowerCase();

    return metrics.filter((item) => {
      const metric = asRecord(item);

      const label = displayValue(
        getFirstValue(metric, [
          'label',
          'title',
          'name',
          'metric',
        ]),
        '',
      );

      return label.toLowerCase().includes(term);
    });
  }, [metrics, searchTerm]);

  const currentPage = NAVIGATION.find(
    (item) => item.id === activeTab,
  );

  /* ---------------------------------------------------------
     NAVIGATION AND LOGOUT
  --------------------------------------------------------- */

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    navigate('/login');
  };

  const handleTabChange = (tab: CompanyTab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const handlePostJob = () => {
    handleTabChange('jobs');
  };

  const reloadDashboard = async () => {
    setLoadingDashboard(true);
    setDashboardError(null);

    try {
      const result =
        await companyService.getDashboardSummary();

      setDashboard(result);
    } catch (error) {
      console.error(
        'Failed to reload company dashboard:',
        error,
      );

      setDashboardError(
        'We could not load your recruitment overview. Please try again.',
      );
    } finally {
      setLoadingDashboard(false);
    }
  };

  /* ---------------------------------------------------------
     OVERVIEW PAGE
  --------------------------------------------------------- */

  const renderOverview = () => (
    <>
      <div className="tc-page-heading">
        <div>
          <div className="tc-eyebrow">
            <Sparkles size={13} />
            COMPANY WORKSPACE
          </div>

          <h1 className="tc-page-title">
            Executive Overview
          </h1>

          <p className="tc-page-description">
            Your recruitment command centre. Monitor hiring
            activity, manage opportunities and keep your
            talent pipeline moving.
          </p>
        </div>

        <div className="tc-heading-actions">
          <button
            type="button"
            className="tc-button tc-button-secondary"
            onClick={() => handleTabChange('pipeline')}
          >
            <Users size={15} />
            View Pipeline
          </button>

          <button
            type="button"
            className="tc-button tc-button-primary"
            onClick={handlePostJob}
          >
            <Plus size={16} />
            Post a Job
          </button>
        </div>
      </div>

      <div className="tc-section-heading">
        <div>
          <h2 className="tc-section-title">
            Recruitment at a glance
          </h2>

          <p className="tc-section-subtitle">
            A snapshot of your company’s recruitment activity.
          </p>
        </div>

        <span className="tc-live-label">
          <span className="tc-live-dot" />
          Dashboard overview
        </span>
      </div>

      {loadingDashboard ? (
        <div className="tc-metrics">
          {[0, 1, 2, 3].map((item) => (
            <div
              className="tc-skeleton"
              key={item}
            />
          ))}
        </div>
      ) : dashboardError ? (
        <div className="tc-state-card error">
          <strong>Dashboard unavailable</strong>

          {dashboardError}

          <div style={{ marginTop: 14 }}>
            <button
              type="button"
              className="tc-button tc-button-secondary"
              onClick={() => void reloadDashboard()}
            >
              Try again
            </button>
          </div>
        </div>
      ) : (
        <div className="tc-metrics">
          {visibleMetrics.length > 0 ? (
            visibleMetrics.map((item, index) => {
              const metric = asRecord(item);

              const iconOptions = [
                {
                  icon: BriefcaseBusiness,
                  color: 'blue',
                },
                {
                  icon: Users,
                  color: 'purple',
                },
                {
                  icon: FileText,
                  color: 'gold',
                },
                {
                  icon: CheckCircle2,
                  color: 'green',
                },
              ];

              const iconOption =
                iconOptions[index % iconOptions.length];

              const MetricIcon = iconOption.icon;

              const label = displayValue(
                getFirstValue(metric, [
                  'label',
                  'title',
                  'name',
                  'metric',
                ]),
                `Metric ${index + 1}`,
              );

              const value = displayValue(
                getFirstValue(metric, [
                  'value',
                  'count',
                  'total',
                  'amount',
                ]),
              );

              const trend = getFirstValue(metric, [
                'trend',
                'change',
                'percentageChange',
              ]);

              const note = displayValue(
                getFirstValue(metric, [
                  'description',
                  'subtitle',
                  'caption',
                  'period',
                ]),
                'Based on your recruitment activity',
              );

              return (
                <article
                  className="tc-metric"
                  key={`${label}-${index}`}
                >
                  <div className="tc-metric-top">
                    <div
                      className={`tc-metric-icon ${iconOption.color}`}
                    >
                      <MetricIcon size={19} />
                    </div>

                    {trend !== undefined && (
                      <span className="tc-metric-trend">
                        <ArrowUpRight size={12} />
                        {String(trend)}
                      </span>
                    )}
                  </div>

                  <div className="tc-metric-label">
                    {label}
                  </div>

                  <div className="tc-metric-value">
                    {value}
                  </div>

                  <div className="tc-metric-note">
                    {note}
                  </div>
                </article>
              );
            })
          ) : (
            <div
              className="tc-state-card"
              style={{ gridColumn: '1 / -1' }}
            >
              <strong>No dashboard metrics available</strong>

              {searchTerm
                ? 'No metrics match your search. Try a different term.'
                : 'Your recruitment metrics will appear here when dashboard data is available.'}
            </div>
          )}
        </div>
      )}

      <div className="tc-overview-grid">
        <section className="tc-panel">
          <div className="tc-panel-heading">
            <div>
              <h2 className="tc-panel-title">
                Real-Time Recruitment Activity
              </h2>

              <p className="tc-panel-description">
                Recent updates across your recruitment workspace.
              </p>
            </div>

            <Activity
              size={18}
              color={COLORS.blue}
            />
          </div>

          {loadingDashboard ? (
            <div className="tc-state-card">
              Loading recent activity…
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="tc-activity-list">
              {recentActivity.map((item, index) => {
                const activity = asRecord(item);

                const activityId = getFirstValue(
                  activity,
                  ['id', 'activityId'],
                );

                return (
                  <div
                    className="tc-activity-row"
                    key={String(activityId ?? index)}
                  >
                    <div className="tc-activity-icon">
                      <Activity size={16} />
                    </div>

                    <div
                      style={{
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <div className="tc-activity-title">
                        {getActivityTitle(activity)}
                      </div>

                      <div className="tc-activity-description">
                        {getActivityDescription(activity)}
                      </div>
                    </div>

                    <div className="tc-activity-time">
                      {getActivityTime(activity)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="tc-state-card">
              <strong>You’re all caught up</strong>

              Your recent recruitment activity will appear here
              as applications and other events come in.
            </div>
          )}
        </section>

        <section className="tc-panel">
          <div className="tc-panel-heading">
            <div>
              <h2 className="tc-panel-title">
                Quick Actions
              </h2>

              <p className="tc-panel-description">
                Get straight to your next recruitment task.
              </p>
            </div>
          </div>

          <div className="tc-quick-actions">
            <button
              type="button"
              className="tc-quick-action"
              onClick={() => handleTabChange('jobs')}
            >
              <span className="tc-quick-icon">
                <BriefcaseBusiness size={17} />
              </span>

              <span className="tc-quick-action-copy">
                <span className="tc-quick-action-title">
                  Manage Job Listings
                </span>

                <span className="tc-quick-action-description">
                  Create and manage opportunities.
                </span>
              </span>

              <ArrowRight
                className="tc-quick-arrow"
                size={15}
              />
            </button>

            <button
              type="button"
              className="tc-quick-action"
              onClick={() => handleTabChange('pipeline')}
            >
              <span className="tc-quick-icon">
                <Users size={17} />
              </span>

              <span className="tc-quick-action-copy">
                <span className="tc-quick-action-title">
                  Review Talent Pipeline
                </span>

                <span className="tc-quick-action-description">
                  Follow candidates through recruitment stages.
                </span>
              </span>

              <ArrowRight
                className="tc-quick-arrow"
                size={15}
              />
            </button>

            <button
              type="button"
              className="tc-quick-action"
              onClick={() => handleTabChange('companyHub')}
            >
              <span className="tc-quick-icon">
                <Building2 size={17} />
              </span>

              <span className="tc-quick-action-copy">
                <span className="tc-quick-action-title">
                  Company Hub
                </span>

                <span className="tc-quick-action-description">
                  Access your company workspace.
                </span>
              </span>

              <ArrowRight
                className="tc-quick-arrow"
                size={15}
              />
            </button>

            <button
              type="button"
              className="tc-quick-action"
              onClick={() => handleTabChange('profile')}
            >
              <span className="tc-quick-icon">
                <ShieldCheck size={17} />
              </span>

              <span className="tc-quick-action-copy">
                <span className="tc-quick-action-title">
                  Company Profile & Plans
                </span>

                <span className="tc-quick-action-description">
                  Review company details and subscription.
                </span>
              </span>

              <ArrowRight
                className="tc-quick-arrow"
                size={15}
              />
            </button>
          </div>

          <div className="tc-callout">
            <div className="tc-callout-icon">
              <Sparkles size={18} />
            </div>

            <div>
              <div className="tc-callout-title">
                Build trust with candidates
              </div>

              <div className="tc-callout-copy">
                Keep your company profile accurate and up to date
                so candidates can learn more about your organisation.
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );

  /* ---------------------------------------------------------
     PAGE ROUTING
  --------------------------------------------------------- */

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();

      case 'companyHub':
        return <CompanyHub />;

      case 'guidance':
        return <GuidanceHubNotices />;

      case 'pipeline':
        return <Pipeline />;

      case 'jobs':
        return <JobListing />;

      case 'messages':
        return <Messages />;

      case 'profile':
        return (
          <>
            <div className="tc-page-heading">
              <div>
                <div className="tc-eyebrow">
                  <Settings2 size={13} />
                  ACCOUNT MANAGEMENT
                </div>

                <h1 className="tc-page-title">
                  Profile & Settings
                </h1>

                <p className="tc-page-description">
                  Manage your company information and subscription
                  settings from one place.
                </p>
              </div>
            </div>

            <div className="tc-profile-switch">
              <button
                type="button"
                className={
                  profileSection === 'details' ? 'active' : ''
                }
                onClick={() => setProfileSection('details')}
              >
                Company Details
              </button>

              <button
                type="button"
                className={
                  profileSection === 'billing' ? 'active' : ''
                }
                onClick={() => setProfileSection('billing')}
              >
                Subscription & Billing
              </button>
            </div>

            {profileSection === 'details'
              ? <CompanyProfile />
              : <Plans />}
          </>
        );

      default:
        return renderOverview();
    }
  };

  /* ---------------------------------------------------------
     MAIN LAYOUT
  --------------------------------------------------------- */

  return (
    <div className="tc-company">
      <style>{STYLES}</style>

      
      <div
        className={`tc-mobile-overlay ${
          sidebarOpen ? 'visible' : ''
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <div className="tc-shell">
        {/* SIDEBAR */}

        <aside
          className={`tc-sidebar ${
            sidebarOpen ? 'open' : ''
          }`}
        >
          <div className="tc-brand">
            <img
              src={logo}
              alt="TruCity"
            />

            <div className="tc-brand-caption">
              VERIFY · CONNECT · PERSUE
            </div>
          </div>

          <div className="tc-workspace-card">
            <div className="tc-workspace-icon">
              <Building2 size={18} />
            </div>

            <div>
              <div className="tc-workspace-name">
                Company Workspace
              </div>

              <div className="tc-workspace-subtitle">
                Recruitment & talent
              </div>
            </div>
          </div>

          <div className="tc-nav-label">
            Workspace
          </div>

          <nav
            className="tc-nav"
            aria-label="Workspace navigation"
          >
            {NAVIGATION
              .filter((item) => item.group === 'workspace')
              .map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`tc-nav-button ${
                      activeTab === item.id ? 'active' : ''
                    }`}
                    onClick={() => handleTabChange(item.id)}
                  >
                    <Icon
                      size={17}
                      strokeWidth={1.9}
                    />

                    <span>{item.label}</span>
                  </button>
                );
              })}
          </nav>

          <div
            className="tc-nav-label"
            style={{ marginTop: 26 }}
          >
            Recruitment
          </div>

          <nav
            className="tc-nav"
            aria-label="Recruitment navigation"
          >
            {NAVIGATION
              .filter((item) => item.group === 'recruitment')
              .map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`tc-nav-button ${
                      activeTab === item.id ? 'active' : ''
                    }`}
                    onClick={() => handleTabChange(item.id)}
                  >
                    <Icon
                      size={17}
                      strokeWidth={1.9}
                    />

                    <span>{item.label}</span>
                  </button>
                );
              })}
          </nav>

          <div className="tc-sidebar-bottom">
            <div className="tc-help-card">
              <CircleHelp size={19} />

              <div className="tc-help-title">
                Need a hand?
              </div>

              <div className="tc-help-copy">
                Explore guidance to make the most of your
                TruCity recruitment workspace.
              </div>

              <button
                type="button"
                className="tc-help-button"
                onClick={() => handleTabChange('guidance')}
              >
                Explore Guidance
                <ArrowRight size={13} />
              </button>
            </div>

            <button
              type="button"
              className="tc-logout"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              Sign out
            </button>
          </div>
        </aside>

        {/* MAIN WORKSPACE */}

        <main className="tc-main">
          <header className="tc-topbar">
            <div className="tc-topbar-left">
              <button
                type="button"
                className="tc-mobile-menu"
                onClick={() => {
                  setSidebarOpen((open) => !open);
                }}
                aria-label={
                  sidebarOpen
                    ? 'Close navigation'
                    : 'Open navigation'
                }
              >
                {sidebarOpen
                  ? <X size={19} />
                  : <Menu size={19} />}
              </button>

              <div>
                <div className="tc-breadcrumb">
                  TruCity / Company
                </div>

                <div className="tc-topbar-title">
                  {currentPage?.label ?? 'Company Workspace'}
                </div>
              </div>
            </div>

            <div className="tc-topbar-right">
              <label className="tc-search">
                <Search size={15} />

                <input
                  type="search"
                  placeholder="Search dashboard metrics"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                  }}
                  aria-label="Search dashboard metrics"
                />
              </label>

              <span className="tc-verified">
                <ShieldCheck size={14} />
                Verified Workspace
              </span>

              <button
                type="button"
                className="tc-icon-button"
                aria-label="Open Guidance Hub"
                title="Guidance Hub"
                onClick={() => handleTabChange('guidance')}
              >
                <Bell size={17} />
                <span className="tc-notification-dot" />
              </button>

              <button
                type="button"
                className="tc-avatar"
                aria-label="Open profile settings"
                title="Profile & Settings"
                onClick={() => handleTabChange('profile')}
              >
                <Building2 size={17} />
              </button>
            </div>
          </header>

          <div className="tc-content">
            {renderActivePage()}
          </div>
        </main>
      </div>
    </div>
  );
}