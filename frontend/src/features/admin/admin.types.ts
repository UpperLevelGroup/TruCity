export interface AdminDashboard {
  totalUsers: number;
  candidates: number;
  employers: number;
  jobs: number;
  recentActivity: AdminActivity[];
}

export interface AdminActivity {
  action: string;
  description: string;
  createdAt?: string;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  verified: boolean;
  status: string;
  createdAt?: string;
}

export interface AdminCandidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  location?: string;
  verificationStatus?: string;
  status?: string;
  createdAt?: string;
}

export interface AdminEmployer {
    id: string;
    company: string;
    email: string;
    industry: string | null;
    verified: boolean;
    status: string;
}

export interface AdminJob {
  id: string;
  companyId?: string;
  companyName: string;
  title: string;
  description?: string;
  location: string;
  employmentType: string;
  salaryMin?: number;
  salaryMax?: number;
  status: string;
  createdAt?: string;
  applicationCount: number;
}

export interface AdminApplication {
  id: string;
  candidateId?: string;
  candidateName: string;
  email: string;
  jobId?: string;
  jobTitle: string;
  companyId?: string;
  companyName: string;
  status: string;
  appliedAt?: string;
}

export interface AdminVerification {
  id: string;
  candidateId?: string;
  candidateName: string;
  email: string;
  verificationType: string;
  status: string;
  submittedAt?: string;
  verifierName?: string;
  result?: string;
  notes?: string;
  verifiedAt?: string;
}


export interface AdminReport {
  period: string;
  generatedAt: string;

  overview: AdminReportOverview;

  users: AdminReportUsers;

  jobs: AdminReportJobs;

  applications: AdminReportApplications;

  verifications: AdminReportVerifications;

  dailyActivity: AdminDailyActivity[];
}


export interface AdminReportOverview {
  totalUsers: number;
  candidates: number;
  employers: number;
  jobs: number;
  applications: number;
  verifications: number;
}


export interface AdminReportUsers {
  newUsers: number;
  newCandidates: number;
  newEmployers: number;
}


export interface AdminReportJobs {
  total: number;
  created: number;
  active: number;
  pending: number;
  closed: number;
}


export interface AdminReportApplications {
  total: number;
  statuses: AdminReportStatusCount[];
}


export interface AdminReportVerifications {
  total: number;
  statuses: AdminReportStatusCount[];
}


export interface AdminReportStatusCount {
  status: string;
  count: number;
}


export interface AdminDailyActivity {
  date: string;
  users: number;
  jobs: number;
  applications: number;
  verifications: number;
}

export interface AdminSettings {
  id: string;
  platform: AdminPlatformSettings;
  users: AdminUserSettings;
  jobs: AdminJobSettings;
  verification: AdminVerificationSettings;
  applications: AdminApplicationSettings;
  notifications: AdminNotificationSettings;
  security: AdminSecuritySettings;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminPlatformSettings {
  platformName: string;
  platformDescription: string | null;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
}

export interface AdminUserSettings {
  candidateRegistrationEnabled: boolean;
  employerRegistrationEnabled: boolean;
  requireEmailVerification: boolean;
  autoEnableNewAccounts: boolean;
}

export interface AdminJobSettings {
  jobCreationEnabled: boolean;
  requireJobApproval: boolean;
  allowPublishedJobEditing: boolean;
  allowJobClosing: boolean;
}

export interface AdminVerificationSettings {
  candidateVerificationRequired: boolean;
  documentVerificationRequired: boolean;
  verifierWorkflowEnabled: boolean;
}

export interface AdminApplicationSettings {
  applicationsEnabled: boolean;
  allowMultipleApplications: boolean;
  allowApplicationWithdrawal: boolean;
}

export interface AdminNotificationSettings {
  emailNotificationsEnabled: boolean;
  applicationNotificationsEnabled: boolean;
  verificationNotificationsEnabled: boolean;
  jobNotificationsEnabled: boolean;
}

export interface AdminSecuritySettings {
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  requireMfaForAdmins: boolean;
  dataRetentionDays: number;
}

export interface AdminPermission {
  id: string;
  name: string;
  description?: string | null;
}

export interface AdminRole {
  id: string;
  name: string;
  permissions: AdminPermission[];
}

export interface AdminAuditLog {
  id: string;
  action: string;
  description: string;
  createdAt?: string;
  userEmail: string;
}

export interface AdminSystemInformation {
  application: string;
  backend: string;
  springBootVersion: string;
  javaVersion: string;
  databaseStatus: string;
  database: string;
  environment: string;
}