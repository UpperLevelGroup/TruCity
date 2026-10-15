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

export interface CandidateGalleryImageDetail {
id: string;
name: string;
category: string;
image: string;
uploadedAt: string;
}

export interface CandidateDocumentDetail {
id: number;
name: string;
status: string;
fileName?: string | null;
fileSize?: string | null;
dataUrl?: string | null;
}

export interface CandidateProjectDetail {
id: number;
name: string;
tech: string;
status: string;
desc: string;
}

export interface CandidateReelDetail {
fileName: string;
fileSize: string;
uploadedAt: string;
dataUrl?: string | null;
url?: string | null;
publicUrl?: string | null;
signedUrl?: string | null;
}

export interface CandidatePreferencesDetail {
availability?: string | null;
}

export interface CompanyCandidateMedia {
facePhoto?: string | null;
fullBodyPhoto?: string | null;
galleryImages: CandidateGalleryImageDetail[];
documents: CandidateDocumentDetail[];
projects: CandidateProjectDetail[];
reelMeta?: CandidateReelDetail | null;
preferences?: CandidatePreferencesDetail | null;
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
media: CompanyCandidateMedia;
}

const EMPTY_MEDIA: CompanyCandidateMedia = {
facePhoto: null,
fullBodyPhoto: null,
galleryImages: [],
documents: [],
projects: [],
reelMeta: null,
preferences: null,
};

type UnknownRecord = Record<string, unknown>;

interface HttpAwareError extends Error {
response?: {
status?: number;
data?: unknown;
};
}

function isRecord(value: unknown): value is UnknownRecord {
return (
value !== null &&
typeof value === "object" &&
!Array.isArray(value)
);
}

function parseResponseBody(value: unknown): unknown {
if (typeof value !== "string") {
return value;
}

const trimmed = value.trim();

if (!trimmed) {
return null;
}

try {
return JSON.parse(trimmed) as unknown;
} catch {
return value;
}
}

function looksLikeCandidate(value: UnknownRecord): boolean {
return (
typeof value.id === "string" ||
typeof value.userId === "string" ||
typeof value.name === "string" ||
typeof value.firstName === "string" ||
typeof value.lastName === "string"
);
}

function unwrapCandidateResponse(value: unknown): unknown {
let current = parseResponseBody(value);

for (let depth = 0; depth < 5; depth += 1) {
if (!isRecord(current)) {
return current;
}

if (looksLikeCandidate(current)) {
  return current;
}

const wrapperKeys = [
  "candidateDetails",
  "candidate",
  "profile",
  "data",
] as const;

let unwrapped = false;

for (const key of wrapperKeys) {
  const nested = current[key];

  if (nested === undefined || nested === null) {
    continue;
  }

  const parsedNested = parseResponseBody(nested);

  if (isRecord(parsedNested)) {
    current = parsedNested;
    unwrapped = true;
    break;
  }
}

if (!unwrapped) {
  return current;
}

}

return current;
}

function getResponseError(
message: string,
status?: number,
data?: unknown
): HttpAwareError {
const error = new Error(message) as HttpAwareError;

error.name = "CandidateDetailsError";
error.response = {
status,
data,
};

return error;
}

function describeResponse(value: unknown): string {
if (value === null) {
return "null";
}

if (value === undefined) {
return "undefined";
}

if (typeof value === "string") {
const trimmed = value.trim();

if (!trimmed) {
  return "empty string";
}

return `string (${trimmed.length} characters): ${trimmed
  .slice(0, 120)
  .replace(/\s+/g, " ")}`;

}

if (Array.isArray(value)) {
return `array (${value.length} items)`;
}

if (isRecord(value)) {
const keys = Object.keys(value);

return `object with keys: ${
  keys.length ? keys.join(", ") : "(none)"
}`;


}

return typeof value;
}

function normaliseMedia(
media?: Partial<CompanyCandidateMedia> | null
): CompanyCandidateMedia {
const reelMeta = media?.reelMeta;

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
reelMeta: reelMeta
? {
...reelMeta,
fileName: reelMeta.fileName ?? "",
fileSize: reelMeta.fileSize ?? "",
uploadedAt: reelMeta.uploadedAt ?? "",
dataUrl: reelMeta.dataUrl ?? null,
url: reelMeta.url ?? null,
publicUrl: reelMeta.publicUrl ?? null,
signedUrl: reelMeta.signedUrl ?? null,
}
: null,
preferences: media?.preferences ?? null,
};
}

export async function getCandidateDetails(
candidateId: string
): Promise<CompanyCandidateDetails> {
const requestedCandidateId = candidateId?.trim();

if (!requestedCandidateId) {
throw new Error("Candidate ID is required.");
}

let response;

try {
response = await api.get<unknown>(
`/api/company/candidate-details/${encodeURIComponent(
        requestedCandidateId
      )}`
);
} catch (requestError: unknown) {
if (
requestError !== null &&
typeof requestError === "object" &&
"response" in requestError
) {
const axiosError = requestError as {
message?: string;
response?: {
status?: number;
data?: unknown;
};
};

const status = axiosError.response?.status;

  throw getResponseError(
    status === 401
      ? "Your session has expired. Please sign in again."
      : status === 403
        ? "You are not authorised to view this candidate's profile."
        : status === 404
          ? "The candidate profile could not be found."
          : `Unable to load candidate details${
              status ? ` (HTTP ${status})` : ""
            }.${
              axiosError.message
                ? ` ${axiosError.message}`
                : ""
            }`,
    status,
    axiosError.response?.data
  );
}

throw requestError;

}

const payload = unwrapCandidateResponse(response.data);

if (!isRecord(payload) || !looksLikeCandidate(payload)) {
const responseDescription = describeResponse(response.data);
const payloadDescription = describeResponse(payload);

throw getResponseError(
  "The candidate-details endpoint returned an unexpected response. " +
    `HTTP ${response.status}; response: ${responseDescription}; ` +
    `unwrapped payload: ${payloadDescription}.`,
  response.status,
  {
    responseType: responseDescription,
    payloadType: payloadDescription,
  }
);

}

const firstName =
typeof payload.firstName === "string"
? payload.firstName
: "";

const lastName =
typeof payload.lastName === "string"
? payload.lastName
: "";

const candidateName =
typeof payload.name === "string" && payload.name.trim()
? payload.name.trim()
: `${firstName} ${lastName}`.trim();

const candidateIdFromResponse =
payload.id ?? payload.userId ?? requestedCandidateId;

const userIdFromResponse =
payload.userId ?? payload.id ?? requestedCandidateId;

const media = isRecord(payload.media)
? (payload.media as Partial<CompanyCandidateMedia>)
: EMPTY_MEDIA;

return {
...(payload as unknown as CompanyCandidateDetails),
id: String(candidateIdFromResponse),
userId: String(userIdFromResponse),
firstName,
lastName,
name: candidateName || "Candidate",
email: typeof payload.email === "string" ? payload.email : null,
phone: typeof payload.phone === "string" ? payload.phone : null,
headline:
typeof payload.headline === "string" ? payload.headline : null,
bio: typeof payload.bio === "string" ? payload.bio : null,
location:
typeof payload.location === "string" ? payload.location : null,
yearsExperience:
typeof payload.yearsExperience === "number"
? payload.yearsExperience
: 0,
profileCompletion:
typeof payload.profileCompletion === "number"
? payload.profileCompletion
: null,
verified: payload.verified === true,
skills: Array.isArray(payload.skills)
? (payload.skills as CandidateSkillDetail[])
: [],
qualifications: Array.isArray(payload.qualifications)
? (payload.qualifications as CandidateQualificationDetail[])
: [],
experienceHistory: Array.isArray(payload.experienceHistory)
? (payload.experienceHistory as CandidateExperienceDetail[])
: [],
media: normaliseMedia(media),
};
}
