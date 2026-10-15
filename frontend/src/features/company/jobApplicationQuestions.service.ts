import api from "../../api/axios";

export type ApplicationQuestionType =
  | "TEXT"
  | "TEXTAREA"
  | "YES_NO"
  | "SINGLE_SELECT"
  | "MULTI_SELECT"
  | "NUMBER";

export interface JobApplicationQuestion {
  id: string;
  questionText: string;
  questionType: ApplicationQuestionType;
  required: boolean;
  options: string[];
  displayOrder: number;
}

export interface JobApplicationQuestionRequest {
  id?: string;
  questionText: string;
  questionType: ApplicationQuestionType;
  required: boolean;
  options: string[];
}

const endpoint = (jobId: string) =>
  `/api/jobs/company/${encodeURIComponent(jobId)}/application-questions`;

export const jobApplicationQuestionsService = {
  async getQuestions(jobId: string): Promise<JobApplicationQuestion[]> {
    const response = await api.get<JobApplicationQuestion[]>(endpoint(jobId));
    return Array.isArray(response.data) ? response.data : [];
  },

  async saveQuestions(
    jobId: string,
    questions: JobApplicationQuestionRequest[],
  ): Promise<JobApplicationQuestion[]> {
    const response = await api.put<JobApplicationQuestion[]>(endpoint(jobId), questions);
    return Array.isArray(response.data) ? response.data : [];
  },

  async deleteQuestion(jobId: string, questionId: string): Promise<void> {
    await api.delete(`${endpoint(jobId)}/${encodeURIComponent(questionId)}`);
  },
};

export default jobApplicationQuestionsService;
