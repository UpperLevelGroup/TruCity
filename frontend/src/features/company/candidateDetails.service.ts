import api from "../../api/axios";

export interface CandidateSkillDetail {
  name: string;
  proficiency?: string | null;
  yearsUsed?: number | null;
}

export interface CandidateQualificationDetail {
  id: string;
  institution?: string | null;
  qualificationName?: string | null;
  fieldOfStudy?: string | null;
  startYear?: number | null;
  completionYear?: number | null;
  verificationStatus?: string | null;
}

export interface CandidateExperienceDetail {
  id: string;
  companyName?: string | null;
  jobTitle?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface CompanyCandidateDetails {
  id: string;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  yearsExperience: number;
  profileCompletion?: number | null;
  verified: boolean;
  skills: CandidateSkillDetail[];
  qualifications: CandidateQualificationDetail[];
  experienceHistory: CandidateExperienceDetail[];
}

export async function getCandidateDetails(
  candidateId: string
): Promise<CompanyCandidateDetails> {
  const response = await api.get<CompanyCandidateDetails>(
    `/api/company/candidate-details/${candidateId}`
  );

  if (!response.data || typeof response.data !== "object") {
    throw new Error("The server returned invalid candidate details.");
  }

  return response.data;
}
