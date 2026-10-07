/*
|--------------------------------------------------------------------------
| JOBS
|--------------------------------------------------------------------------
*/

export type CompanyJobStatus =
  | "Active"
  | "Paused"
  | "Closed";

export type EmploymentType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Internship"
  | "Temporary";

export type WorkplaceType =
  | "On-site"
  | "Hybrid"
  | "Remote";

/*
|--------------------------------------------------------------------------
| PIPELINE
|--------------------------------------------------------------------------
*/

export type PipelineStage =
  | "sourced"
  | "shortlisted"
  | "interviewing"
  | "offered"
  | "rejected";

/*
|--------------------------------------------------------------------------
| CANDIDATES
|--------------------------------------------------------------------------
*/

export type CandidateCategory =
  | "Software Engineering"
  | "DevOps & Cloud"
  | "Data & AI"
  | "Design"
  | "Other";

export type CandidateStatus =
  | "Available"
  | "Interviewing"
  | "Hired"
  | "Unavailable"
  | "In Review";

/*
|--------------------------------------------------------------------------
| VERIFICATION
|--------------------------------------------------------------------------
*/

export type VerificationStatus =
  | "NOT_VERIFIED"
  | "pending"
  | "verifying"
  | "approved"
  | "rejected";
/*
|--------------------------------------------------------------------------
| PAYMENT
|--------------------------------------------------------------------------
*/

export type PaymentMethod =
  | "card"
  | "invoice"
  | "paypal";

/*
|--------------------------------------------------------------------------
| COMPANY JOB
|--------------------------------------------------------------------------
|
| Represents a job returned by the company jobs API.
|
*/

export interface CompanyJob {
  id: string;

  companyId?: string;

  companyName?: string;

  title: string;

  department: string;

  location: string;

  workplaceType: WorkplaceType;

  type: EmploymentType;

  status: CompanyJobStatus;

  applicants: number;

  postedDate: string;

  description?: string;

  salaryMin?: number;

  salaryMax?: number;

  salaryCurrency?: string;

  salaryNegotiable?: boolean;

  qualifications?: string;

  experienceRequired?: string;

  skills: string[];

  responsibilities?: string;

  benefits?: string;

  openings?: number;

  applicationDeadline?: string;
}

/*
|--------------------------------------------------------------------------
| COMPANY JOB REQUEST
|--------------------------------------------------------------------------
|
| Shared payload used when creating or updating a company job.
|
*/

export interface CompanyJobRequest {
  title: string;

  department: string;

  description?: string;

  location: string;

  workplaceType: WorkplaceType;

  type: EmploymentType;

  salaryMin?: number;

  salaryMax?: number;

  salaryCurrency?: string;

  salaryNegotiable?: boolean;

  qualifications?: string;

  experienceRequired?: string;

  skills: string[];

  responsibilities?: string;

  benefits?: string;

  openings?: number;

  applicationDeadline?: string;
}

/*
|--------------------------------------------------------------------------
| CANDIDATE
|--------------------------------------------------------------------------
|
| Lightweight candidate representation.
|
| This is intentionally NOT the full candidate profile.
|
| Talent Feed uses this model for the searchable/paginated candidate list.
| The full profile is retrieved through candidateDetails.service.ts.
|
*/

export interface CompanyCandidate {
  id: string;

  userId?: string;

  firstName?: string;

  lastName?: string;

  name: string;

  role: string;

  category: CandidateCategory;

  status: CandidateStatus;

  verified: boolean;

  skills: string[];

  experience: number;

  email?: string;

  phone?: string;

  location?: string;

  bio?: string;

  /*
  |----------------------------------------------------------------------
  | Optional profile completion
  |----------------------------------------------------------------------
  |
  | The lightweight endpoint may not currently return this value.
  | Keeping it optional allows the UI to use it when available without
  | making the existing candidate API contract stricter.
  |
  */

  profileCompletion?: number;
}

/*
|--------------------------------------------------------------------------
| PIPELINE CANDIDATE
|--------------------------------------------------------------------------
|
| Extends the lightweight candidate model with application-specific
| pipeline information.
|
*/

export interface CompanyPipelineCandidate
  extends CompanyCandidate {
  applicationId: string;

  jobId: string;

  jobTitle: string;

  applicationStatus: string;

  stage: PipelineStage;

  appliedAt?: string;
}

/*
|--------------------------------------------------------------------------
| MESSAGING
|--------------------------------------------------------------------------
*/

export interface CompanyMessage {
  id: string;

  sender: "me" | "them";

  text: string;

  timestamp: string;
}

export interface CompanyChatThread {
  id: string;

  name: string;

  role: string;

  messages: CompanyMessage[];

  unread?: number;
}

/*
|--------------------------------------------------------------------------
| COMPANY PROFILE
|--------------------------------------------------------------------------
*/

export interface CompanyProfile {
  id: string;

  legalName: string;

  tradingName?: string;

  companyRegNo: string;

  website: string;

  industry: string;

  region: string;

  registeredAddress: string;

  companyEmail: string;

  phone: string;

  companyDescription: string;

  representativeName?: string;

  representativeEmail?: string;

  representativePhone?: string;

  representativeRole?: string;

  verificationStatus: VerificationStatus;

  createdAt: string;

  updatedAt: string;

  billingContactName?: string;

  billingContactEmail?: string;

  invoicingAddress?: string;

  agreeToTerms?: boolean;
}
/*
|--------------------------------------------------------------------------
| COMPANY ONBOARDING
|--------------------------------------------------------------------------
*/

export interface CompanyOnboardingData {
  legalName: string;

  tradingName?: string;

  region: string;

  companyRegNo: string;

  website: string;

  industry: string;

  registeredAddress: string;

  companyEmail: string;

  phone: string;

  companyDescription: string;

  representativeName?: string;

  representativeEmail?: string;

  representativePhone?: string;

  representativeRole?: string;

  verificationStatus: VerificationStatus;

  billingContactName: string;

  billingContactEmail: string;

  invoicingAddress: string;

  agreeToTerms: boolean;
}

/*
|--------------------------------------------------------------------------
| COMPANY PLANS
|--------------------------------------------------------------------------
*/

export interface CompanyPlan {
  id: string;

  name: string;

  price: number;

  billingPeriod:
    | "monthly"
    | "yearly";

  description: string;

  features: string[];

  recommended?: boolean;
}

/*
|--------------------------------------------------------------------------
| COMPANY SUBSCRIPTION
|--------------------------------------------------------------------------
*/

export interface CompanySubscription {
  planId: string;

  status:
    | "active"
    | "cancelled"
    | "trial";

  startedAt: string;

  renewalDate?: string;

  paymentMethod?: PaymentMethod;
}

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

export interface CompanyDashboardMetric {
  title: string;

  value: string | number;

  change: string;

  color?: string;
}

export interface CompanyActivity {
  id: string;

  text: string;

  time: string;

  category: string;

  createdAt?: string;
}

export interface CompanyDashboardSummary {
  metrics: CompanyDashboardMetric[];

  recentActivity: CompanyActivity[];
}

/*
|--------------------------------------------------------------------------
| JOB REQUEST ALIASES
|--------------------------------------------------------------------------
|
| Kept as aliases so existing company pages can continue using the more
| explicit Create/Update names.
|
*/

export type CreateCompanyJobRequest =
  CompanyJobRequest;

export type UpdateCompanyJobRequest =
  CompanyJobRequest;

/*
|--------------------------------------------------------------------------
| MESSAGING REQUEST
|--------------------------------------------------------------------------
*/

export interface SendCompanyMessageRequest {
  threadId: string;

  text: string;
}

/*
|--------------------------------------------------------------------------
| PIPELINE REQUEST
|--------------------------------------------------------------------------
*/

export interface UpdatePipelineStageRequest {
  applicationId: string;

  stage: PipelineStage;
}
