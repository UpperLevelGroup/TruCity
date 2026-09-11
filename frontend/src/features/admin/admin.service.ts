import axios from "../../api/axios";

import type {
  AdminDashboard,
  AdminUser,
  AdminCandidate,
  AdminEmployer,
  AdminJob,
  AdminApplication,
  AdminVerification,
  AdminReport,
  AdminAuditLog,
  AdminPermission,
  AdminRole,
  AdminSettings,
  AdminSystemInformation,
} from "./admin.types";

export interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
}
/*
 * =====================================================
 * API RESPONSE TYPES
 * =====================================================
 */

interface AdminUserApiResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  verified: boolean;
  createdAt?: string;
}


interface AdminCandidateApiResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  location?: string;
  verified: boolean;
  createdAt?: string;
}


interface AdminEmployerApiResponse {
  id: string;
  company: string;
  email: string;
  industry?: string;
  verified: boolean;
  status: string;
}


interface JobsApiResponse {
  id: string;
  companyId?: string;
  companyName: string;
  title: string;
  description?: string;
  location?: string;
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
  status?: string;
  createdAt?: string;
  applicationCount: number;
}


interface ApplicationsApiResponse {
  id: string;
  candidateId?: string;
  candidateName: string;
  email: string;
  jobId?: string;
  jobTitle: string;
  companyId?: string;
  companyName: string;
  status?: string;
  appliedAt?: string;
}


interface VerificationApiResponse {
  id: string;
  candidateId?: string;
  candidateName: string;
  email: string;
  verificationType?: string;
  status?: string;
  submittedAt?: string;
  verifierName?: string;
  result?: string;
  notes?: string;
  verifiedAt?: string;
}


export interface VerificationReviewRequest {
  status: string;
  notes?: string;
}


export interface JobStatusUpdateRequest {
  status: string;
}


/*
 * =====================================================
 * JOB MAPPER
 * =====================================================
 *
 * Keeps all job response conversion in one place.
 */

function mapAdminJob(
  job: JobsApiResponse
): AdminJob {

  return {

    id: job.id,

    companyId:
      job.companyId,

    companyName:
      job.companyName ||
      "Unknown Company",

    title:
      job.title ||
      "Untitled Job",

    description:
      job.description,

    location:
      job.location ||
      "Not specified",

    employmentType:
      job.employmentType ||
      "Not specified",

    salaryMin:
      job.salaryMin,

    salaryMax:
      job.salaryMax,

    status:
      job.status ||
      "UNKNOWN",

    createdAt:
      job.createdAt,

    applicationCount:
      job.applicationCount ?? 0,

  };
}


/*
 * =====================================================
 * ADMIN DASHBOARD
 * =====================================================
 */

export async function getAdminDashboard(): Promise<AdminDashboard> {

  const response =
    await axios.get<AdminDashboard>(
      "/admin/dashboard"
    );

  return response.data;
}


/*
 * =====================================================
 * ADMIN USERS
 * =====================================================
 */

export async function getAdminUsers(): Promise<AdminUser[]> {

  const response =
    await axios.get<AdminUserApiResponse[]>(
      "/admin/users"
    );

  return response.data.map((user) => ({

    id:
      user.id,

    firstName:
      user.firstName,

    lastName:
      user.lastName,

    email:
      user.email,

    role:
      user.role,

    verified:
      user.verified,

    status:
      "ACTIVE",

    createdAt:
      user.createdAt,

  }));
}


/*
 * =====================================================
 * ADMIN CANDIDATES
 * =====================================================
 */

export async function getAdminCandidates(): Promise<AdminCandidate[]> {

  const response =
    await axios.get<AdminCandidateApiResponse[]>(
      "/admin/candidates"
    );

  return response.data.map((candidate) => ({

    id:
      candidate.id,

    firstName:
      candidate.firstName,

    lastName:
      candidate.lastName,

    email:
      candidate.email,

    location:
      candidate.location,

    status:
      "ACTIVE",

    verificationStatus:
      candidate.verified
        ? "VERIFIED"
        : "UNVERIFIED",

    createdAt:
      candidate.createdAt,

  }));
}


/*
 * =====================================================
 * ADMIN EMPLOYERS
 * =====================================================
 */

export async function getAdminEmployers(): Promise<AdminEmployer[]> {

  const response =
    await axios.get<AdminEmployerApiResponse[]>(
      "/admin/employers"
    );

  return response.data.map((employer) => ({

    id:
      employer.id,

    company:
      employer.company,

    email:
      employer.email,

    industry:
      employer.industry ??
      "Not specified",

    verified:
      employer.verified,

    status:
      employer.status,

  }));
}


/*
 * =====================================================
 * ADMIN JOBS
 * =====================================================
 *
 * GET ALL JOBS
 */

export async function getAdminJobs(): Promise<AdminJob[]> {

  const response =
    await axios.get<JobsApiResponse[]>(
      "/api/jobs"
    );

  return response.data.map(mapAdminJob);
}


/*
 * =====================================================
 * ADMIN - GET SINGLE JOB
 * =====================================================
 *
 * Used when the administrator clicks "View".
 */

export async function getAdminJob(
  id: string
): Promise<AdminJob> {

  const response =
    await axios.get<JobsApiResponse>(
      `/api/jobs/${id}`
    );

  return mapAdminJob(response.data);
}


/*
 * =====================================================
 * ADMIN - UPDATE JOB STATUS
 * =====================================================
 *
 * IMPORTANT:
 *
 * This does NOT delete the job.
 *
 * The job remains in the database together with:
 *
 * - applications
 * - application history
 * - company relationship
 * - creation date
 *
 * Changing the status controls whether the listing
 * remains visible/usable on the public side.
 */

export async function updateAdminJobStatus(
  id: string,
  status: string
): Promise<AdminJob> {

  const request: JobStatusUpdateRequest = {
    status,
  };

  const response =
    await axios.patch<JobsApiResponse>(
      `/api/jobs/${id}/status`,
      request
    );

  return mapAdminJob(response.data);
}


/*
 * =====================================================
 * ADMIN APPLICATIONS
 * =====================================================
 */

export async function getAdminApplications(): Promise<AdminApplication[]> {

  const response =
    await axios.get<ApplicationsApiResponse[]>(
      "/api/applications"
    );

  return response.data.map((application) => ({

    id:
      application.id,

    candidateId:
      application.candidateId,

    candidateName:
      application.candidateName ||
      "Unknown Candidate",

    email:
      application.email ||
      "",

    jobId:
      application.jobId,

    jobTitle:
      application.jobTitle ||
      "Unknown Job",

    companyId:
      application.companyId,

    companyName:
      application.companyName ||
      "Unknown Company",

    status:
      application.status ||
      "APPLIED",

    appliedAt:
      application.appliedAt,

  }));
}


/*
 * =====================================================
 * ADMIN VERIFICATIONS
 * =====================================================
 */

export async function getAdminVerifications(): Promise<AdminVerification[]> {

  const response =
    await axios.get<VerificationApiResponse[]>(
      "/api/verifications"
    );

  return response.data.map((verification) => ({

    id:
      verification.id,

    candidateId:
      verification.candidateId,

    candidateName:
      verification.candidateName ||
      "Unknown Candidate",

    email:
      verification.email ||
      "",

    verificationType:
      verification.verificationType ||
      "UNKNOWN",

    status:
      verification.status ||
      "UNKNOWN",

    submittedAt:
      verification.submittedAt,

    verifierName:
      verification.verifierName,

    result:
      verification.result,

    notes:
      verification.notes,

    verifiedAt:
      verification.verifiedAt,

  }));
}


/*
 * =====================================================
 * REVIEW VERIFICATION
 * =====================================================
 */

export async function reviewAdminVerification(
  id: string,
  request: VerificationReviewRequest
): Promise<AdminVerification> {

  const response =
    await axios.patch<AdminVerification>(
      `/api/verifications/${id}`,
      request
    );

  return response.data;
}

/*
 * =====================================================
 * ADMIN REPORTS
 * =====================================================
 */

export async function getAdminReport(
  period: number
): Promise<AdminReport> {

  const response =
    await axios.get<AdminReport>(
      `/admin/reports?period=${period}`
    );

  return response.data;
}

/*
 * =====================================================
 * ADMIN settinggs
 * =====================================================
 */
export async function getAdminSettings(): Promise<AdminSettings> {
  const response = await axios.get<AdminSettings>("/admin/settings");
  return response.data;
}

export async function updateAdminPlatformSettings(
  settings: AdminSettings["platform"]
): Promise<AdminSettings> {
  const response = await axios.patch<AdminSettings>(
    "/admin/settings/platform",
    settings
  );

  return response.data;
}

export async function updateAdminUserSettings(
  settings: AdminSettings["users"]
): Promise<AdminSettings> {
  const response = await axios.patch<AdminSettings>(
    "/admin/settings/users",
    settings
  );

  return response.data;
}

export async function updateAdminJobSettings(
  settings: AdminSettings["jobs"]
): Promise<AdminSettings> {
  const response = await axios.patch<AdminSettings>(
    "/admin/settings/jobs",
    settings
  );

  return response.data;
}

export async function updateAdminVerificationSettings(
  settings: AdminSettings["verification"]
): Promise<AdminSettings> {
  const response = await axios.patch<AdminSettings>(
    "/admin/settings/verification",
    settings
  );

  return response.data;
}

export async function updateAdminApplicationSettings(
  settings: AdminSettings["applications"]
): Promise<AdminSettings> {
  const response = await axios.patch<AdminSettings>(
    "/admin/settings/applications",
    settings
  );

  return response.data;
}

export async function updateAdminNotificationSettings(
  settings: AdminSettings["notifications"]
): Promise<AdminSettings> {
  const response = await axios.patch<AdminSettings>(
    "/admin/settings/notifications",
    settings
  );

  return response.data;
}

export async function updateAdminSecuritySettings(
  settings: AdminSettings["security"]
): Promise<AdminSettings> {
  const response = await axios.patch<AdminSettings>(
    "/admin/settings/security",
    settings
  );

  return response.data;
}

export async function getAdminRoles(): Promise<AdminRole[]> {
  const response = await axios.get<AdminRole[]>(
    "/admin/settings/roles"
  );

  return response.data;
}

export async function getAdminPermissions(): Promise<AdminPermission[]> {
  const response = await axios.get<AdminPermission[]>(
    "/admin/settings/permissions"
  );

  return response.data;
}

export async function updateAdminRolePermissions(
  roleId: string,
  permissionIds: string[]
): Promise<AdminRole[]> {
  const response = await axios.patch<AdminRole[]>(
    `/admin/settings/roles/${roleId}/permissions`,
    {
      permissionIds,
    }
  );

  return response.data;
}

export async function getAdminAuditLogs(): Promise<AdminAuditLog[]> {
  const response = await axios.get<AdminAuditLog[]>(
    "/admin/settings/audit"
  );

  return response.data;
}

export async function getAdminSystemInformation(): Promise<AdminSystemInformation> {
  const response = await axios.get<AdminSystemInformation>(
    "/admin/settings/system"
  );

  return response.data;
}

/*
 * =====================================================
 * ADMIn User Name
 * =====================================================
 */


export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await axios.get<CurrentUser>(
    "/api/v1/auth/me"
  );

  return response.data;
}