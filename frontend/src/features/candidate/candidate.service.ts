import api from "../../api/axios";

export interface CompanyCandidate {
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

export const getCompanyCandidates = async (): Promise<CompanyCandidate[]> => {
  const response = await api.get<CompanyCandidate[]>(
    "/api/company/candidates"
  );

  if (!Array.isArray(response.data)) {
    return [];
  }

  return response.data;
};