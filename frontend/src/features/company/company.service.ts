import api from "../../api/axios";

import type {
  CompanyCandidate,
  CompanyDashboardSummary,
  CompanyJob,
  CompanyMessage,
  CompanyOnboardingData,
  CompanyPipelineCandidate,
  CompanyProfile,
  CompanyChatThread,
  PipelineStage,
  CreateCompanyJobRequest,
  UpdateCompanyJobRequest,
  SendCompanyMessageRequest,
  WorkplaceType,
} from "./company.types";

/*
|--------------------------------------------------------------------------
| BACKEND CANDIDATE RESPONSE
|--------------------------------------------------------------------------
*/

interface BackendCandidateResponse {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  headline: string;
  category: string;
  location: string;
  bio: string;
  yearsExperience: number;
  verified: boolean;
  skills: string[];
  status: string;
}

/*
|--------------------------------------------------------------------------
| BACKEND PIPELINE RESPONSE
|--------------------------------------------------------------------------
*/

interface BackendPipelineResponse {
  applicationId: string;
  candidateId: string;
  userId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  headline: string;
  category: string;
  location: string;
  bio: string;
  yearsExperience: number;
  verified: boolean;
  skills: string[];
  status: string;
  jobId: string;
  jobTitle: string;
  applicationStatus: string;
  stage: string;
  appliedAt?: string;
}

/*
|--------------------------------------------------------------------------
| BACKEND JOB RESPONSE
|--------------------------------------------------------------------------
*/

interface BackendJobResponse {
  id: string;
  companyId: string;
  companyName: string;

  title: string;
  department?: string | null;
  description?: string | null;

  location: string;
  workplaceType?: string | null;
  employmentType: string;

  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryNegotiable?: boolean | null;

  qualifications?: string | null;
  experienceRequired?: string | null;

  skills?: string[] | null;

  responsibilities?: string | null;
  benefits?: string | null;

  openings?: number | null;
  applicationDeadline?: string | null;

  status: string;

  createdAt?: string | null;

  applicationCount?: number | null;
}

/*
|--------------------------------------------------------------------------
| BACKEND MESSAGING RESPONSE
|--------------------------------------------------------------------------
*/

interface BackendMessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: string;
  senderName?: string | null;
  message: string;
  createdAt: string;
  readAt?: string | null;
}

interface BackendConversationResponse {
  id: string;

  participantId: string;
  participantType: string;

  participantName?: string | null;
  participantRole?: string | null;
  participantEmail?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;

  messages?: BackendMessageResponse[];
}

/*
|--------------------------------------------------------------------------
| CANDIDATE MAPPING
|--------------------------------------------------------------------------
*/

function mapCandidate(
  candidate: BackendCandidateResponse
): CompanyCandidate {
  return {
    id: candidate.id,

    userId: candidate.userId,

    firstName: candidate.firstName,

    lastName: candidate.lastName,

    name:
      candidate.name ||
      `${candidate.firstName} ${candidate.lastName}`.trim() ||
      "Unnamed Candidate",

    role: candidate.headline || "Professional",

    category: normalizeCandidateCategory(
      candidate.category
    ),

    status: normalizeCandidateStatus(
      candidate.status
    ),

    verified: Boolean(candidate.verified),

    skills: Array.isArray(candidate.skills)
      ? candidate.skills
      : [],

    experience: Number.isFinite(
      candidate.yearsExperience
    )
      ? candidate.yearsExperience
      : 0,

    email: candidate.email,

    location: candidate.location,

    bio: candidate.bio,
  };
}

/*
|--------------------------------------------------------------------------
| PIPELINE MAPPING
|--------------------------------------------------------------------------
*/

function mapPipelineCandidate(
  candidate: BackendPipelineResponse
): CompanyPipelineCandidate {
  return {
    id: candidate.candidateId,

    applicationId: candidate.applicationId,

    jobId: candidate.jobId,

    jobTitle: candidate.jobTitle,

    userId: candidate.userId,

    firstName: candidate.firstName,

    lastName: candidate.lastName,

    name:
      candidate.name ||
      `${candidate.firstName} ${candidate.lastName}`.trim() ||
      "Unnamed Candidate",

    role: candidate.headline || "Professional",

    category: normalizeCandidateCategory(
      candidate.category
    ),

    status: normalizeCandidateStatus(
      candidate.status
    ),

    verified: Boolean(candidate.verified),

    skills: Array.isArray(candidate.skills)
      ? candidate.skills
      : [],

    experience: Number.isFinite(
      candidate.yearsExperience
    )
      ? candidate.yearsExperience
      : 0,

    email: candidate.email,

    location: candidate.location,

    bio: candidate.bio,

    applicationStatus:
      candidate.applicationStatus,

    stage: normalizePipelineStage(
      candidate.stage
    ),

    appliedAt: candidate.appliedAt,
  };
}

/*
|--------------------------------------------------------------------------
| JOB STATUS NORMALISATION
|--------------------------------------------------------------------------
*/

function normalizeJobStatus(
  status: string
): CompanyJob["status"] {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return "Active";

    case "PENDING":
      return "Paused";

    case "SUSPENDED":
      return "Paused";

    case "CLOSED":
      return "Closed";

    case "OPEN":
      return "Active";

    default:
      return "Paused";
  }
}

/*
|--------------------------------------------------------------------------
| EMPLOYMENT TYPE NORMALISATION
|--------------------------------------------------------------------------
*/

function normalizeEmploymentType(
  type: string
): CompanyJob["type"] {
  switch (type?.toLowerCase()) {
    case "full-time":
    case "full time":
      return "Full-time";

    case "part-time":
    case "part time":
      return "Part-time";

    case "contract":
      return "Contract";

    case "internship":
      return "Internship";

    case "temporary":
      return "Temporary";

    default:
      return "Full-time";
  }
}

/*
|--------------------------------------------------------------------------
| WORKPLACE TYPE NORMALISATION
|--------------------------------------------------------------------------
*/

function normalizeWorkplaceType(
  type?: string | null
): WorkplaceType {
  switch (type?.toLowerCase()) {
    case "remote":
      return "Remote";

    case "hybrid":
      return "Hybrid";

    case "on-site":
    case "onsite":
    case "on site":
      return "On-site";

    default:
      return "On-site";
  }
}

/*
|--------------------------------------------------------------------------
| JOB MAPPING
|--------------------------------------------------------------------------
*/

function mapJob(
  job: BackendJobResponse
): CompanyJob {
  return {
    id: job.id,

    title:
      job.title ||
      "Untitled Position",

    department:
      job.department ||
      "General",

    location:
      job.location ||
      "Location not specified",

    workplaceType:
      normalizeWorkplaceType(
        job.workplaceType
      ),

    type:
      normalizeEmploymentType(
        job.employmentType
      ),

    status:
      normalizeJobStatus(
        job.status
      ),

    applicants:
      Number.isFinite(
        job.applicationCount
      )
        ? Number(job.applicationCount)
        : 0,

    postedDate:
      job.createdAt
        ? job.createdAt.split("T")[0]
        : "",

    description:
      job.description || "",

    salaryMin:
      job.salaryMin != null
        ? Number(job.salaryMin)
        : undefined,

    salaryMax:
      job.salaryMax != null
        ? Number(job.salaryMax)
        : undefined,

    salaryCurrency:
      job.salaryCurrency ||
      "ZAR",

    salaryNegotiable:
      Boolean(
        job.salaryNegotiable
      ),

    qualifications:
      job.qualifications ||
      "",

    experienceRequired:
      job.experienceRequired ||
      "",

    skills:
      Array.isArray(job.skills)
        ? job.skills
        : [],

    responsibilities:
      job.responsibilities ||
      "",

    benefits:
      job.benefits ||
      "",

    openings:
      job.openings != null
        ? Number(job.openings)
        : 1,

    applicationDeadline:
      job.applicationDeadline ||
      undefined,
  };
}

/*
|--------------------------------------------------------------------------
| CANDIDATE CATEGORY NORMALISATION
|--------------------------------------------------------------------------
*/

function normalizeCandidateCategory(
  category: string
): CompanyCandidate["category"] {
  switch (category) {
    case "Software Engineering":
      return "Software Engineering";

    case "DevOps & Cloud":
      return "DevOps & Cloud";

    case "Data & AI":
      return "Data & AI";

    case "Design":
      return "Design";

    default:
      return "Other";
  }
}

/*
|--------------------------------------------------------------------------
| CANDIDATE STATUS NORMALISATION
|--------------------------------------------------------------------------
*/

function normalizeCandidateStatus(
  status: string
): CompanyCandidate["status"] {
  switch (status) {
    case "Available":
      return "Available";

    case "Interviewing":
      return "Interviewing";

    case "Hired":
      return "Hired";

    case "Unavailable":
      return "Unavailable";

    case "In Review":
      return "In Review";

    default:
      return "In Review";
  }
}

/*
|--------------------------------------------------------------------------
| PIPELINE STAGE NORMALISATION
|--------------------------------------------------------------------------
*/

function normalizePipelineStage(
  stage: string
): PipelineStage {
  switch (stage?.toLowerCase()) {
    case "shortlisted":
      return "shortlisted";

    case "interviewing":
      return "interviewing";

    case "offered":
      return "offered";

    case "rejected":
      return "rejected";

    case "sourced":
    default:
      return "sourced";
  }
}

/*
|--------------------------------------------------------------------------
| MESSAGE PARTICIPANT TYPE
|--------------------------------------------------------------------------
*/

function normalizeParticipantType(
  type: string
): string {
  switch (type?.toUpperCase()) {
    case "CANDIDATE":
      return "Candidate";

    case "ADMIN":
      return "Admin";

    case "CHATBOT":
      return "Chatbot";

    case "COMPANY":
      return "Company";

    case "EMPLOYER":
      return "Company";

    default:
      return "Participant";
  }
}

/*
|--------------------------------------------------------------------------
| MESSAGE TIME
|--------------------------------------------------------------------------
*/

function formatMessageTime(
  createdAt?: string | null
): string {
  if (!createdAt) {
    return "";
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/*
|--------------------------------------------------------------------------
| MAP BACKEND MESSAGE
|--------------------------------------------------------------------------
*/

function mapMessage(
  message: BackendMessageResponse,
  currentUserSenderId?: string
): CompanyMessage {
  const senderIsMe =
    currentUserSenderId
      ? message.senderId ===
        currentUserSenderId
      : message.senderType?.toUpperCase() ===
        "EMPLOYER";

  return {
    id: message.id,

    sender: senderIsMe
      ? "me"
      : "them",

    text: message.message,

    timestamp:
      formatMessageTime(
        message.createdAt
      ),
  };
}

/*
|--------------------------------------------------------------------------
| MAP BACKEND CONVERSATION
|--------------------------------------------------------------------------
*/

function mapConversation(
  conversation: BackendConversationResponse
): CompanyChatThread {
  const messages =
    Array.isArray(
      conversation.messages
    )
      ? conversation.messages
      : [];

  return {
    id: conversation.id,

    name:
      conversation.participantName ||
      "Conversation",

    role:
      conversation.participantRole ||
      normalizeParticipantType(
        conversation.participantType
      ),

    messages:
      messages.map(
        (message) =>
          mapMessage(message)
      ),

    unread: 0,
  };
}

/*
|--------------------------------------------------------------------------
| COMPANY SERVICE
|--------------------------------------------------------------------------
*/

export const companyService = {
  /*
  |--------------------------------------------------------------------------
  | REAL BACKEND — CANDIDATES
  |--------------------------------------------------------------------------
  */

  async getCandidates(): Promise<
    CompanyCandidate[]
  > {
    try {
      const response =
        await api.get<
          BackendCandidateResponse[]
        >(
          "/api/company/candidates"
        );

      if (
        !Array.isArray(
          response.data
        )
      ) {
        console.error(
          "Unexpected candidate response:",
          response.data
        );

        return [];
      }

      return response.data.map(
        mapCandidate
      );
    } catch (error) {
      console.error(
        "Failed to load candidates:",
        error
      );

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | REAL BACKEND — SINGLE CANDIDATE
  |--------------------------------------------------------------------------
  */

  async getCandidate(
    candidateId: string
  ): Promise<
    CompanyCandidate | null
  > {
    const candidates =
      await this.getCandidates();

    return (
      candidates.find(
        (candidate) =>
          candidate.id ===
          candidateId
      ) ?? null
    );
  },

  /*
  |--------------------------------------------------------------------------
  | REAL BACKEND — COMPANY PIPELINE
  |--------------------------------------------------------------------------
  */

  async getPipeline(): Promise<
    CompanyPipelineCandidate[]
  > {
    try {
      const response =
        await api.get<
          BackendPipelineResponse[]
        >(
          "/api/applications/company-pipeline"
        );

      if (
        !Array.isArray(
          response.data
        )
      ) {
        console.error(
          "Unexpected pipeline response:",
          response.data
        );

        return [];
      }

      return response.data.map(
        mapPipelineCandidate
      );
    } catch (error) {
      console.error(
        "Failed to load company pipeline:",
        error
      );

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | REAL BACKEND — UPDATE PIPELINE
  |--------------------------------------------------------------------------
  */

  async updatePipelineStage(
    applicationId: string,
    stage: PipelineStage
  ): Promise<
    CompanyPipelineCandidate[]
  > {
    try {
      await api.patch(
        `/api/applications/company-pipeline/${applicationId}/stage`,
        null,
        {
          params: {
            stage,
          },
        }
      );

      return await this.getPipeline();
    } catch (error) {
      console.error(
        "Failed to update pipeline stage:",
        error
      );

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | REAL BACKEND — COMPANY JOBS
  |--------------------------------------------------------------------------
  */

  async getJobs(): Promise<
    CompanyJob[]
  > {
    try {
      const response =
        await api.get<
          BackendJobResponse[]
        >(
          "/api/jobs/company"
        );

      if (
        !Array.isArray(
          response.data
        )
      ) {
        console.error(
          "Unexpected company jobs response:",
          response.data
        );

        return [];
      }

      return response.data.map(
        mapJob
      );
    } catch (error) {
      console.error(
        "Failed to load company jobs:",
        error
      );

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | REAL BACKEND — SINGLE COMPANY JOB
  |--------------------------------------------------------------------------
  |
  | Used by the View Details functionality so the frontend can request
  | the latest version of a specific job from PostgreSQL.
  |
  */

  async getJob(
    jobId: string
  ): Promise<CompanyJob | null> {
    try {
      if (!jobId) {
        throw new Error(
          "Job ID is required."
        );
      }

      const response =
        await api.get<
          BackendJobResponse
        >(
          `/api/jobs/company/${jobId}`
        );

      if (
        !response.data ||
        typeof response.data !==
          "object"
      ) {
        return null;
      }

      return mapJob(
        response.data
      );
    } catch (error: any) {
      if (
        error?.response?.status ===
        404
      ) {
        return null;
      }

      console.error(
        "Failed to load company job:",
        error
      );

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | REAL BACKEND — CREATE COMPANY JOB
  |--------------------------------------------------------------------------
  |
  | Sends the complete job posting to Spring Boot.
  |
  */

  async createJob(
    data: CreateCompanyJobRequest
  ): Promise<CompanyJob> {
    try {
      if (!data) {
        throw new Error(
          "Job data is required."
        );
      }

      const response =
        await api.post<
          BackendJobResponse
        >(
          "/api/jobs/company",
          {
            title:
              data.title?.trim(),

            department:
              data.department?.trim(),

            description:
              data.description?.trim() ??
              "",

            location:
              data.location?.trim(),

            workplaceType:
              data.workplaceType,

            employmentType:
              data.type,

            salaryMin:
              data.salaryMin ??
              null,

            salaryMax:
              data.salaryMax ??
              null,

            salaryCurrency:
              data.salaryCurrency ??
              "ZAR",

            salaryNegotiable:
              Boolean(
                data.salaryNegotiable
              ),

            qualifications:
              data.qualifications?.trim() ??
              "",

            experienceRequired:
              data.experienceRequired?.trim() ??
              "",

            skills:
              Array.isArray(data.skills)
                ? data.skills
                    .map((skill) =>
                      skill.trim()
                    )
                    .filter(Boolean)
                : [],

            responsibilities:
              data.responsibilities?.trim() ??
              "",

            benefits:
              data.benefits?.trim() ??
              "",

            openings:
              data.openings ??
              1,

            applicationDeadline:
              data.applicationDeadline ??
              null,
          }
        );

      if (
        !response.data ||
        typeof response.data !==
          "object"
      ) {
        throw new Error(
          "The server returned an invalid job."
        );
      }

      return mapJob(
        response.data
      );
    } catch (error) {
      console.error(
        "Failed to create company job:",
        error
      );

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | REAL BACKEND — UPDATE COMPANY JOB
  |--------------------------------------------------------------------------
  |
  | PUT /api/jobs/company/{id}
  |
  | Updates an existing job belonging to the authenticated employer.
  |
  */

  async updateJob(
    jobId: string,
    data: UpdateCompanyJobRequest
  ): Promise<CompanyJob> {
    try {
      if (!jobId) {
        throw new Error(
          "Job ID is required."
        );
      }

      if (!data) {
        throw new Error(
          "Job data is required."
        );
      }

      const response =
        await api.put<
          BackendJobResponse
        >(
          `/api/jobs/company/${jobId}`,
          {
            title:
              data.title?.trim(),

            department:
              data.department?.trim(),

            description:
              data.description?.trim() ??
              "",

            location:
              data.location?.trim(),

            workplaceType:
              data.workplaceType,

            employmentType:
              data.type,

            salaryMin:
              data.salaryMin ??
              null,

            salaryMax:
              data.salaryMax ??
              null,

            salaryCurrency:
              data.salaryCurrency ??
              "ZAR",

            salaryNegotiable:
              Boolean(
                data.salaryNegotiable
              ),

            qualifications:
              data.qualifications?.trim() ??
              "",

            experienceRequired:
              data.experienceRequired?.trim() ??
              "",

            skills:
              Array.isArray(data.skills)
                ? data.skills
                    .map((skill) =>
                      skill.trim()
                    )
                    .filter(Boolean)
                : [],

            responsibilities:
              data.responsibilities?.trim() ??
              "",

            benefits:
              data.benefits?.trim() ??
              "",

            openings:
              data.openings ??
              1,

            applicationDeadline:
              data.applicationDeadline ??
              null,
          }
        );

      if (
        !response.data ||
        typeof response.data !==
          "object"
      ) {
        throw new Error(
          "The server returned an invalid updated job."
        );
      }

      return mapJob(
        response.data
      );
    } catch (error) {
      console.error(
        "Failed to update company job:",
        error
      );

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | REAL BACKEND — DELETE COMPANY JOB
  |--------------------------------------------------------------------------
  |
  | Important:
  |
  | The backend decides whether permanent deletion is allowed.
  |
  | Jobs with applications should NOT be permanently deleted because
  | applications reference jobs in PostgreSQL.
  |
  */

  async deleteJob(
    jobId: string
  ): Promise<CompanyJob[]> {
    try {
      if (!jobId) {
        throw new Error(
          "Job ID is required."
        );
      }

      await api.delete(
        `/api/jobs/company/${jobId}`
      );

      return await this.getJobs();
    } catch (error) {
      console.error(
        "Failed to delete company job:",
        error
      );

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | REAL BACKEND — CLOSE COMPANY JOB
  |--------------------------------------------------------------------------
  |
  | Closing is different from deleting.
  |
  | DELETE:
  |   Permanently removes a job when allowed.
  |
  | CLOSE:
  |   Keeps the job and application history but prevents it from being
  |   treated as an active vacancy.
  |
  */

  async closeJob(
    jobId: string
  ): Promise<CompanyJob> {
    try {
      if (!jobId) {
        throw new Error(
          "Job ID is required."
        );
      }

      const response =
        await api.patch<
          BackendJobResponse
        >(
          `/api/jobs/company/${jobId}/close`
        );

      if (
        !response.data ||
        typeof response.data !==
          "object"
      ) {
        throw new Error(
          "The server returned an invalid closed job."
        );
      }

      return mapJob(
        response.data
      );
    } catch (error) {
      console.error(
        "Failed to close company job:",
        error
      );

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | REAL BACKEND — MESSAGES
  |--------------------------------------------------------------------------
  |
  | There is NO localStorage here.
  |
  | Conversations are stored in PostgreSQL through the Spring Boot
  | messaging API.
  |
  */

  async getMessages(): Promise<
    CompanyChatThread[]
  > {
    try {
      const response =
        await api.get<
          BackendConversationResponse[]
        >(
          "/api/messages/conversations"
        );

      if (
        !Array.isArray(
          response.data
        )
      ) {
        console.error(
          "Unexpected messaging response:",
          response.data
        );

        return [];
      }

      return response.data.map(
        mapConversation
      );
    } catch (error) {
      console.error(
        "Failed to load messages:",
        error
      );

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | REAL BACKEND — SEND MESSAGE
  |--------------------------------------------------------------------------
  */

  async sendMessage(
    data: SendCompanyMessageRequest
  ): Promise<
    CompanyChatThread[]
  > {
    try {
      if (!data.threadId) {
        throw new Error(
          "A conversation must be selected before sending a message."
        );
      }

      const messageText =
        data.text?.trim();

      if (!messageText) {
        throw new Error(
          "Message cannot be empty."
        );
      }

      await api.post(
        `/api/messages/conversations/${data.threadId}/messages`,
        {
          message:
            messageText,
        }
      );

      return await this.getMessages();
    } catch (error) {
      console.error(
        "Failed to send message:",
        error
      );

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | REAL BACKEND — START CONVERSATION
  |--------------------------------------------------------------------------
  */

  async startConversation(
    participantId: string,
    participantType: string
  ): Promise<CompanyChatThread> {
    try {
      const response =
        await api.post<
          BackendConversationResponse
        >(
          "/api/messages/conversations",
          {
            participantId,

            participantType:
              participantType.toUpperCase(),
          }
        );

      if (
        !response.data ||
        typeof response.data !==
          "object"
      ) {
        throw new Error(
          "The server returned an invalid conversation."
        );
      }

      return mapConversation(
        response.data
      );
    } catch (error) {
      console.error(
        "Failed to start conversation:",
        error
      );

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | REAL BACKEND — GET SINGLE CONVERSATION
  |--------------------------------------------------------------------------
  */

  async getConversation(
    conversationId: string
  ): Promise<
    CompanyChatThread | null
  > {
    try {
      const response =
        await api.get<
          BackendConversationResponse
        >(
          `/api/messages/conversations/${conversationId}`
        );

      if (
        !response.data ||
        typeof response.data !==
          "object"
      ) {
        return null;
      }

      return mapConversation(
        response.data
      );
    } catch (error: any) {
      if (
        error?.response?.status ===
        404
      ) {
        return null;
      }

      console.error(
        "Failed to load conversation:",
        error
      );

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | REAL BACKEND — MARK CONVERSATION READ
  |--------------------------------------------------------------------------
  */

  async markConversationRead(
    conversationId: string
  ): Promise<void> {
    try {
      await api.patch(
        `/api/messages/conversations/${conversationId}/read`
      );
    } catch (error) {
      console.error(
        "Failed to mark conversation as read:",
        error
      );
    }
  },

  /*
  |--------------------------------------------------------------------------
  | REAL BACKEND — COMPANY PROFILE
  |--------------------------------------------------------------------------
  */

  async getProfile(): Promise<
    CompanyProfile | null
  > {
    try {
      const response =
        await api.get<
          CompanyProfile
        >(
          "/api/company/profile"
        );

      if (
        !response.data ||
        typeof response.data !==
          "object"
      ) {
        console.error(
          "Unexpected company profile response:",
          response.data
        );

        return null;
      }

      return response.data;
    } catch (error: any) {
      if (
        error?.response?.status ===
        404
      ) {
        return null;
      }

      console.error(
        "Failed to load company profile:",
        error
      );

      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | REAL BACKEND — SAVE COMPANY PROFILE
  |--------------------------------------------------------------------------
  */

  async saveProfile(
    profile: CompanyProfile
  ): Promise<CompanyProfile> {
    const response =
      await api.put<
        CompanyProfile
      >(
        "/api/company/profile",
        profile
      );

    if (
      !response.data ||
      typeof response.data !==
        "object"
    ) {
      throw new Error(
        "The server returned an invalid company profile."
      );
    }

    return response.data;
  },

  /*
  |--------------------------------------------------------------------------
  | TEMPORARY LOCAL — ONBOARDING
  |--------------------------------------------------------------------------
  */

  async getOnboarding(): Promise<
    CompanyOnboardingData | null
  > {
    if (
      typeof window ===
        "undefined" ||
      typeof window.localStorage ===
        "undefined"
    ) {
      return null;
    }

    try {
      const value =
        window.localStorage.getItem(
          "trucity_company_onboarding"
        );

      if (!value) {
        return null;
      }

      return JSON.parse(
        value
      ) as CompanyOnboardingData;
    } catch (error) {
      console.error(
        "Failed to read company onboarding:",
        error
      );

      return null;
    }
  },

  async saveOnboarding(
    data: CompanyOnboardingData
  ): Promise<
    CompanyOnboardingData
  > {
    if (
      typeof window !==
        "undefined" &&
      typeof window.localStorage !==
        "undefined"
    ) {
      try {
        window.localStorage.setItem(
          "trucity_company_onboarding",
          JSON.stringify(data)
        );
      } catch (error) {
        console.error(
          "Failed to save company onboarding:",
          error
        );
      }
    }

    return data;
  },

  /*
  |--------------------------------------------------------------------------
  | DASHBOARD
  |--------------------------------------------------------------------------
  */

  async getDashboardSummary(): Promise<
    CompanyDashboardSummary
  > {
    const [
      jobs,
      candidates,
      pipeline,
    ] = await Promise.all([
      this.getJobs(),
      this.getCandidates(),
      this.getPipeline(),
    ]);

    const activeJobs =
      jobs.filter(
        (job) =>
          job.status ===
          "Active"
      ).length;

    const verifiedCandidates =
      candidates.filter(
        (candidate) =>
          candidate.verified
      ).length;

    const interviews =
      pipeline.filter(
        (candidate) =>
          candidate.stage ===
          "interviewing"
      ).length;

    return {
      metrics: [
        {
          title:
            "Active Positions",

          value:
            activeJobs,

          change:
            `${activeJobs} active`,

          color:
            "#003366",
        },

        {
          title:
            "Verified Candidates",

          value:
            verifiedCandidates,

          change:
            `${verifiedCandidates} verified`,

          color:
            "#ffb703",
        },

        {
          title:
            "Interviews Scheduled",

          value:
            interviews,

          change:
            `${interviews} in progress`,

          color:
            "#0369a1",
        },
      ],

      recentActivity: [],
    };
  },

  /*
  |--------------------------------------------------------------------------
  | RESET DEMO DATA
  |--------------------------------------------------------------------------
  */

  async resetDemoData(): Promise<void> {
    if (
      typeof window ===
        "undefined" ||
      typeof window.localStorage ===
        "undefined"
    ) {
      return;
    }

    window.localStorage.removeItem(
      "trucity_company_onboarding"
    );
  },
};

export default companyService;