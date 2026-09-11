

import axios from "./axios";

export interface AdminCandidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  location?: string;
  status?: string;
  verificationStatus?: string;
  createdAt?: string;
}

export async function getAdminCandidates(): Promise<
  AdminCandidate[]
> {
  const response = await axios.get("/admin/candidates");

  return response.data;
}