import api from "../../api/axios";

/*
|--------------------------------------------------------------------------
| CANDIDATE SKILL
|--------------------------------------------------------------------------
*/

export interface CandidateSkillDetail {
  name: string;
  proficiency?: string | null;
  yearsUsed?: number | null;
}

/*
|--------------------------------------------------------------------------
| QUALIFICATION
|--------------------------------------------------------------------------
*/

export interface CandidateQualificationDetail {
  id: string;
  institution?: string | null;
  qualificationName?: string | null;
  fieldOfStudy?: string | null;
  startYear?: number | null;
  completionYear?: number | null;
  verificationStatus?: string | null;
}

/*
|--------------------------------------------------------------------------
| EXPERIENCE
|--------------------------------------------------------------------------
*/

export interface CandidateExperienceDetail {
  id: string;
  companyName?: string | null;
  jobTitle?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

/*
|--------------------------------------------------------------------------
| GALLERY IMAGE
|--------------------------------------------------------------------------
*/

export interface CandidateGalleryImageDetail {
  id: string;
  name: string;
  category: string;
  image: string;
  uploadedAt: string;
}

/*
|--------------------------------------------------------------------------
| DOCUMENT
|--------------------------------------------------------------------------
*/

export interface CandidateDocumentDetail {
  id: number;
  name: string;
  status: string;
  fileName?: string | null;
  fileSize?: string | null;
  dataUrl?: string | null;
}

/*
|--------------------------------------------------------------------------
| PROJECT
|--------------------------------------------------------------------------
*/

export interface CandidateProjectDetail {
  id: number;
  name: string;
  tech: string;
  status: string;
  desc: string;
}

/*
|--------------------------------------------------------------------------
| INTRO REEL
|--------------------------------------------------------------------------
*/

export interface CandidateReelDetail {
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  dataUrl?: string | null;
}

/*
|--------------------------------------------------------------------------
| PREFERENCES
|--------------------------------------------------------------------------
*/

export interface CandidatePreferencesDetail {
  availability?: string | null;
}

/*
|--------------------------------------------------------------------------
| CANDIDATE MEDIA
|--------------------------------------------------------------------------
|
| This represents all media and profile-related information returned by:
|
| GET /api/company/candidate-details/{candidateId}
|
|--------------------------------------------------------------------------
*/

export interface CompanyCandidateMedia {
  facePhoto?: string | null;
  fullBodyPhoto?: string | null;

  galleryImages: CandidateGalleryImageDetail[];

  documents: CandidateDocumentDetail[];

  projects: CandidateProjectDetail[];

  reelMeta?: CandidateReelDetail | null;

  preferences?: CandidatePreferencesDetail | null;
}

/*
|--------------------------------------------------------------------------
| COMPLETE CANDIDATE DETAILS
|--------------------------------------------------------------------------
*/

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

  media: CompanyCandidateMedia;
}

/*
|--------------------------------------------------------------------------
| EMPTY MEDIA
|--------------------------------------------------------------------------
|
| Explicitly typed so TypeScript does not infer:
|
| galleryImages: never[]
| documents: never[]
| projects: never[]
|
|--------------------------------------------------------------------------
*/

const EMPTY_MEDIA: CompanyCandidateMedia = {
  facePhoto: null,
  fullBodyPhoto: null,
  galleryImages: [],
  documents: [],
  projects: [],
  reelMeta: null,
  preferences: null,
};

/*
|--------------------------------------------------------------------------
| MEDIA NORMALISATION
|--------------------------------------------------------------------------
*/

function normaliseMedia(
  media?: Partial<CompanyCandidateMedia> | null
): CompanyCandidateMedia {
  return {
    facePhoto: media?.facePhoto ?? null,

    fullBodyPhoto: media?.fullBodyPhoto ?? null,

    galleryImages: Array.isArray(media?.galleryImages)
      ? media.galleryImages
      : [],

    documents: Array.isArray(media?.documents)
      ? media.documents
      : [],

    projects: Array.isArray(media?.projects)
      ? media.projects
      : [],

    reelMeta: media?.reelMeta ?? null,

    preferences: media?.preferences ?? null,
  };
}

/*
|--------------------------------------------------------------------------
| GET CANDIDATE DETAILS
|--------------------------------------------------------------------------
*/

export async function getCandidateDetails(
  candidateId: string
): Promise<CompanyCandidateDetails> {
  if (!candidateId) {
    throw new Error("Candidate ID is required.");
  }

  const response = await api.get<CompanyCandidateDetails>(
    `/api/company/candidate-details/${candidateId}`
  );

  if (!response.data || typeof response.data !== "object") {
    throw new Error("The server returned invalid candidate details.");
  }

  return {
    ...response.data,

    skills: Array.isArray(response.data.skills)
      ? response.data.skills
      : [],

    qualifications: Array.isArray(response.data.qualifications)
      ? response.data.qualifications
      : [],

    experienceHistory: Array.isArray(response.data.experienceHistory)
      ? response.data.experienceHistory
      : [],

    /*
     * Normalise the media response.
     *
     * If the backend does not return a media object,
     * use the typed EMPTY_MEDIA object.
     */
    media: response.data.media
      ? normaliseMedia(response.data.media)
      : EMPTY_MEDIA,
  };
}
