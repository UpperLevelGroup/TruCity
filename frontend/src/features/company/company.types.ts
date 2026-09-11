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

export type PipelineStage =
  | "sourced"
  | "shortlisted"
  | "interviewing"
  | "offered"
  | "rejected";

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

export type VerificationStatus =
  | "pending"
  | "verifying"
  | "approved"
  | "rejected";

export type PaymentMethod =
  | "card"
  | "invoice"
  | "paypal";


/*
|--------------------------------------------------------------------------
| Company Jobs
|--------------------------------------------------------------------------
*/

export interface CompanyJob {
  id: string;

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
| Job Request
|--------------------------------------------------------------------------
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
| Candidates
|--------------------------------------------------------------------------
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
}


/*
|--------------------------------------------------------------------------
| Pipeline
|--------------------------------------------------------------------------
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
| Messaging
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
| Company Profile
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

  verificationStatus: VerificationStatus;

  createdAt: string;

  updatedAt: string;
}


/*
|--------------------------------------------------------------------------
| Company Onboarding
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
| Subscription / Plans
|--------------------------------------------------------------------------
*/

export interface CompanyPlan {
  id: string;

  name: string;

  price: number;

  billingPeriod: "monthly" | "yearly";

  description: string;

  features: string[];

  recommended?: boolean;
}

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
| Dashboard
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
| Requests
|--------------------------------------------------------------------------
*/

export type CreateCompanyJobRequest =
  CompanyJobRequest;

export type UpdateCompanyJobRequest =
  CompanyJobRequest;

export interface SendCompanyMessageRequest {
  threadId: string;

  text: string;
}

export interface UpdatePipelineStageRequest {
  applicationId: string;

  stage: PipelineStage;
}