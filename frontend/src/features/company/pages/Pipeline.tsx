import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { companyService } from "../company.service";
import {
  getCandidateDetails,
  type CompanyCandidateDetails,
} from "../candidateDetails.service";

import type {
  CompanyPipelineCandidate,
  PipelineStage,
} from "../company.types";

type JobGroup = {
  key: string;
  label: string;
  description: string;
  candidates: CompanyPipelineCandidate[];
};

type CandidateDocument =
  CompanyCandidateDetails["media"]["documents"][number];

type PipelineView =
  | "applicants"
  | "shortlisted"
  | "interviewing"
  | "offered"
  | "rejected";

  

type ApplicationResponseItem = {
  id?: string | number;
  questionId?: string | number;
  questionText?: string | null;
  question?: string | null;
  questionType?: string | null;
  answerText?: string | null;
  answerJson?: unknown;
  answer?: string | null;
  response?: string | null;
  submittedAt?: string | null;
};


type ApplicationResume = {
  applicationId: string;
  candidateId: string;
  resumeId: string | null;
  resume: Record<string, unknown> | null;
};



function normalizeApplicationResponses(
  value: unknown
): ApplicationResponseItem[] {
  if (Array.isArray(value)) {
    return value as ApplicationResponseItem[];
  }

  if (value && typeof value === "object") {
    const result = value as Record<string, unknown>;

    for (const key of ["responses", "answers", "data"]) {
      if (Array.isArray(result[key])) {
        return result[key] as ApplicationResponseItem[];
      }
    }
  }

  return [];
}


function formatDate(value?: string | null): string {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString();
}

function formatVerificationStatus(value?: string | null): string {
  if (!value) return "Not verified";

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}


function ResumeValue({
  value,
}: {
  value: unknown;
}): React.ReactElement {
  if (value == null || value === "") {
    return <span>Not provided</span>;
  }

  if (typeof value === "boolean" || typeof value === "number") {
    return <span>{String(value)}</span>;
  }

  if (typeof value === "string") {
    return <span style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{value}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span>Not provided</span>;
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {value.map((item, index) => (
          <div
            key={index}
            style={{
              padding: 10,
              border: "1px solid #E9E8F3",
              borderRadius: 8,
              background: "#FFFFFF",
            }}
          >
            <ResumeValue value={item} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item != null && item !== "");

    if (entries.length === 0) {
      return <span>Not provided</span>;
    }

    return (
      <div style={{ display: "grid", gap: 8 }}>
        {entries.map(([key, item]) => (
          <div
            key={key}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(110px, 0.35fr) minmax(0, 1fr)",
              gap: 10,
              padding: "8px 0",
              borderBottom: "1px solid #E9E8F3",
            }}
          >
            <strong
              style={{
                color: "#00466D",
                fontSize: 10,
                overflowWrap: "anywhere",
              }}
            >
              {key
                .replace(/([a-z])([A-Z])/g, "$1 $2")
                .replace(/[_-]/g, " ")
                .replace(/\b\w/g, (letter) => letter.toUpperCase())}
            </strong>

            <div style={{ minWidth: 0, color: "#475569", fontSize: 10 }}>
              <ResumeValue value={item} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <span>{String(value)}</span>;
}


function getJobGroupKey(
  candidate: CompanyPipelineCandidate
): string {
  const title = candidate.jobTitle?.trim();

  return title
    ? title.toLowerCase()
    : `application-${candidate.jobId || candidate.applicationId}`;
}

function groupByJob(
  candidates: CompanyPipelineCandidate[]
): JobGroup[] {
  const groups = new Map<string, JobGroup>();

  candidates.forEach((candidate) => {
    const key = getJobGroupKey(candidate);
    const label = candidate.jobTitle?.trim() || "Job application";
    const existing = groups.get(key);

    if (existing) {
      existing.candidates.push(candidate);
    } else {
      groups.set(key, {
        key,
        label,
        description: `Candidates who applied for ${label}`,
        candidates: [candidate],
      });
    }
  });

  return Array.from(groups.values()).sort((a, b) =>
    a.label.localeCompare(b.label, undefined, {
      sensitivity: "base",
    })
  );
}



function createCandidateFallback(
  candidate: CompanyPipelineCandidate
): CompanyCandidateDetails {
  return {
    id: candidate.id || "",
    userId: candidate.userId || "",
    firstName: candidate.firstName || "",
    lastName: candidate.lastName || "",
    name: candidate.name || "Candidate",
    email: candidate.email || null,
    phone: null,
    headline: candidate.role || null,
    bio: candidate.bio || null,
    location: candidate.location || null,
    yearsExperience: candidate.experience || 0,
    profileCompletion: null,
    verified: Boolean(candidate.verified),
    skills: (candidate.skills || []).map((skill) => ({
      name: skill,
      proficiency: null,
      yearsUsed: null,
    })),
    qualifications: [],
    experienceHistory: [],
    media: {
      facePhoto: null,
      fullBodyPhoto: null,
      galleryImages: [],
      documents: [],
      projects: [],
      reelMeta: null,
      preferences: null,
    },
  };
}


export default function Pipeline() {
  
  const [pipeline, setPipeline] = useState<
    CompanyPipelineCandidate[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [loadingDetails, setLoadingDetails] = useState(false);

  const [applicationResume, setApplicationResume] = useState<ApplicationResume | null>(null);

  const [loadingApplicationResume, setLoadingApplicationResume] = useState(false);

  const [applicationResumeError, setApplicationResumeError] = useState<string | null>(null);

  const [resumeRetryKey, setResumeRetryKey] = useState(0);


  const [applicationResponses, setApplicationResponses] = useState<
    ApplicationResponseItem[]
  >([]);

  const [loadingApplicationResponses, setLoadingApplicationResponses] =
    useState(false);

  const [applicationResponsesError, setApplicationResponsesError] =
     useState<string | null>(null);

  const [responsesRetryKey, setResponsesRetryKey] = useState(0);

  const [updatingApplication, setUpdatingApplication] =
    useState<string | null>(null);

  const [selectedPipelineCandidate, setSelectedPipelineCandidate] =
    useState<CompanyPipelineCandidate | null>(null);

  const [selectedCandidate, setSelectedCandidate] =
    useState<CompanyCandidateDetails | null>(null);

  const [isProfileExpanded, setIsProfileExpanded] = useState(false);

  useEffect(() => {
    if (!isProfileExpanded) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileExpanded(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProfileExpanded]);

  const [selectedDocument, setSelectedDocument] =
    useState<CandidateDocument | null>(null);

  const [expandedGroups, setExpandedGroups] =
    useState<string[]>([]);

  const [activeView, setActiveView] =
    useState<PipelineView>("applicants");

  const requestSequence = useRef(0);

  useEffect(() => {
    let mounted = true;

    async function loadPipeline() {
      try {
        setLoading(true);

        const result = await companyService.getPipeline();

        if (!mounted) return;

        setPipeline(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Failed to load recruitment pipeline:", error);

        if (mounted) setPipeline([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadPipeline();

    return () => {
      mounted = false;
    };
  }, []);

  const applicantCandidates = useMemo(
    () => pipeline.filter((candidate) => candidate.stage === "sourced"),
    [pipeline]
  );

  const shortlistedCandidates = useMemo(
    () =>
      pipeline.filter((candidate) => candidate.stage === "shortlisted"),
    [pipeline]
  );

  const interviewingCandidates = useMemo(
    () =>
      pipeline.filter((candidate) => candidate.stage === "interviewing"),
    [pipeline]
  );

  const offeredCandidates = useMemo(
    () => pipeline.filter((candidate) => candidate.stage === "offered"),
    [pipeline]
  );

  const rejectedCandidates = useMemo(
    () => pipeline.filter((candidate) => candidate.stage === "rejected"),
    [pipeline]
  );

  const activePipelineCount =
    shortlistedCandidates.length +
    interviewingCandidates.length +
    offeredCandidates.length;

  const groupsByView = useMemo<Record<PipelineView, JobGroup[]>>(
    () => ({
      applicants: groupByJob(applicantCandidates),
      shortlisted: groupByJob(shortlistedCandidates),
      interviewing: groupByJob(interviewingCandidates),
      offered: groupByJob(offeredCandidates),
      rejected: groupByJob(rejectedCandidates),
    }),
    [
      applicantCandidates,
      shortlistedCandidates,
      interviewingCandidates,
      offeredCandidates,
      rejectedCandidates,
    ]
  );

  const candidatesByView = useMemo<
    Record<PipelineView, CompanyPipelineCandidate[]>
  >(
    () => ({
      applicants: applicantCandidates,
      shortlisted: shortlistedCandidates,
      interviewing: interviewingCandidates,
      offered: offeredCandidates,
      rejected: rejectedCandidates,
    }),
    [
      applicantCandidates,
      shortlistedCandidates,
      interviewingCandidates,
      offeredCandidates,
      rejectedCandidates,
    ]
  );

  const visibleCandidates = candidatesByView[activeView];
  const visibleGroups = groupsByView[activeView];

  useEffect(() => {
    const groupKeys = groupsByView.applicants.map((group) => group.key);

    setExpandedGroups((current) => {
      const retained = current.filter((key) => groupKeys.includes(key));
      const added = groupKeys.filter((key) => !current.includes(key));

      return [...retained, ...added];
    });
  }, [groupsByView.applicants]);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((current) =>
      current.includes(groupKey)
        ? current.filter((key) => key !== groupKey)
        : [...current, groupKey]
    );
  };

  
const handleViewCandidate = useCallback(
  async (candidate: CompanyPipelineCandidate) => {
    const requestId = ++requestSequence.current;

    setSelectedPipelineCandidate(candidate);
    setSelectedCandidate(createCandidateFallback(candidate));
    
    setSelectedDocument(null);
    setLoadingDetails(false);

    const candidateId =
      typeof candidate.id === "string" ? candidate.id.trim() : "";

    if (!candidateId) {
      console.warn(
        "Cannot load candidate details: candidate ID is missing.",
        candidate
      );
      return;
    }

    setLoadingDetails(true);

    try {
      const details = await getCandidateDetails(candidateId);

      if (requestId !== requestSequence.current) return;

      setSelectedCandidate(details);
    } catch (error) {
      if (requestId !== requestSequence.current) return;

      console.error("Failed to load candidate details:", error);
      // Keep the lightweight fallback profile visible.
    } finally {
      if (requestId === requestSequence.current) {
        setLoadingDetails(false);
      }
    }
  },
  []
);

const [messagingCandidateId, setMessagingCandidateId] =
  useState<string | null>(null);

const handleMessageCandidate = useCallback(
  async (candidate: CompanyPipelineCandidate) => {
    const participantId = String(candidate.userId || "").trim();

    if (!participantId) {
      window.alert(
        "This candidate does not have a user ID available for messaging."
      );
      return;
    }

    const openingMessage = window.prompt(
      `Write your opening message to ${candidate.name}:`
    );

    if (openingMessage === null) return;

    const messageText = openingMessage.trim();

    if (!messageText) {
      window.alert("Please enter a message before continuing.");
      return;
    }

    setMessagingCandidateId(candidate.applicationId);

    try {
      // Use the existing conversation-creation method.
      const conversation =
        await companyService.startConversation(
          participantId,
          "CANDIDATE"
        );

      if (!conversation?.id) {
        throw new Error(
          "The messaging service did not return a conversation ID."
        );
      }

      // sendMessage accepts one SendCompanyMessageRequest object.
      await companyService.sendMessage({
        threadId: String(conversation.id),
        text: messageText,
      });

      window.alert(
        `Your message to ${candidate.name} has been sent. Open Messages to continue the conversation.`
      );
    } catch (error) {
      console.error(
        "Failed to initiate conversation with candidate:",
        error
      );

      window.alert(
        "The message could not be sent. Please check the browser console and messaging API response."
      );
    } finally {
      setMessagingCandidateId(null);
    }
  },
  []
);

useEffect(() => {
  let active = true;

  const applicationId =
    selectedPipelineCandidate?.applicationId?.trim() || "";

  // Clear the previous application's answers immediately.
  setApplicationResponses([]);
  setApplicationResponsesError(null);

  if (!applicationId) {
    setLoadingApplicationResponses(false);
    return () => {
      active = false;
    };
  }

  async function loadApplicationResponses() {
    setLoadingApplicationResponses(true);

    try {
      const result: unknown =
        await companyService.getApplicationResponses(applicationId);

      if (!active) return;

      setApplicationResponses(normalizeApplicationResponses(result));
    } catch (error) {
      if (!active) return;

      console.error(
        "Failed to load application-question responses:",
        error
      );

      setApplicationResponsesError(
        "Application answers could not be loaded."
      );
    } finally {
      if (active) {
        setLoadingApplicationResponses(false);
      }
    }
  }

  void loadApplicationResponses();

  return () => {
    active = false;
  };
}, [
  selectedPipelineCandidate?.applicationId,
  responsesRetryKey,
]);


  
useEffect(() => {
  let active = true;

  const applicationId =
    selectedPipelineCandidate?.applicationId?.trim() || "";

  setApplicationResume(null);
  setApplicationResumeError(null);

  if (!applicationId) {
    setLoadingApplicationResume(false);

    return () => {
      active = false;
    };
  }

  async function loadResume() {
    setLoadingApplicationResume(true);

    try {
      const result =
        await companyService.getApplicationResume(applicationId);

      if (!active) return;

      setApplicationResume(result);
    } catch (error) {
      if (!active) return;

      console.error(
        "Failed to load the application CV:",
        error
      );

      setApplicationResumeError(
        "The CV submitted with this application could not be loaded."
      );
    } finally {
      if (active) {
        setLoadingApplicationResume(false);
      }
    }
  }

  void loadResume();

  return () => {
    active = false;
  };
}, [
  selectedPipelineCandidate?.applicationId,
  resumeRetryKey,
]);

  useEffect(() => {
    if (visibleCandidates.length === 0) {
      if (
        selectedPipelineCandidate &&
        selectedPipelineCandidate.stage !== activeView
      ) {
        setSelectedPipelineCandidate(null);
        setSelectedCandidate(null);
        setSelectedDocument(null);
      }
      return;
    }

    const selectedStillVisible = visibleCandidates.some(
      (candidate) =>
        candidate.applicationId ===
        selectedPipelineCandidate?.applicationId
    );

    if (!selectedStillVisible) {
      void handleViewCandidate(visibleCandidates[0]);
    }
  }, [
    visibleCandidates,
    selectedPipelineCandidate?.applicationId,
    selectedPipelineCandidate?.stage,
    activeView,
    handleViewCandidate,
  ]);

  const moveCandidate = async (
    applicationId: string,
    stage: PipelineStage
  ) => {
    try {
      setUpdatingApplication(applicationId);

      const updated = await companyService.updatePipelineStage(
        applicationId,
        stage
      );

      setPipeline(Array.isArray(updated) ? updated : []);

      // Clear the old selection. The selection effect will pick the
      // first available candidate in the active stage if necessary.
      const selectedApplication =
        selectedPipelineCandidate?.applicationId;

      if (selectedApplication === applicationId) {
        setSelectedPipelineCandidate(null);
        setSelectedCandidate(null);
        setSelectedDocument(null);
        requestSequence.current += 1;
        setLoadingDetails(false);
      }
    } catch (error) {
      console.error(
        `Failed to update application ${applicationId} to ${stage}:`,
        error
      );

      window.alert(
        stage === "offered"
          ? "The offer could not be made. Please try again."
          : "The application status could not be updated. Please try again."
      );
    } finally {
      setUpdatingApplication(null);
    }
  };

  const toggleShortlist = async (
    candidate: CompanyPipelineCandidate
  ) => {
    const nextStage: PipelineStage =
      candidate.stage === "shortlisted" ? "sourced" : "shortlisted";

    await moveCandidate(candidate.applicationId, nextStage);
  };

  const handleInterview = async (
    candidate: CompanyPipelineCandidate
  ) => {
    await moveCandidate(candidate.applicationId, "interviewing");
  };

  const handleReject = async (
    candidate: CompanyPipelineCandidate
  ) => {
    const confirmed = window.confirm(
      `Reject ${candidate.name} for "${candidate.jobTitle || "this role"}"?`
    );

    if (!confirmed) return;

    await moveCandidate(candidate.applicationId, "rejected");
  };

  const handleOffer = async (
    candidate: CompanyPipelineCandidate
  ) => {
    const confirmed = window.confirm(
      `Make an offer to ${candidate.name} for "${candidate.jobTitle || "this role"}"?`
    );

    if (!confirmed) return;

    await moveCandidate(candidate.applicationId, "offered");
  };

  const renderStageActions = (
    candidate: CompanyPipelineCandidate,
    compact = false
  ) => {
    const isUpdating =
      updatingApplication === candidate.applicationId;

    const commonStyle: React.CSSProperties = compact
      ? styles.compactAction
      : {};

    const buttonProps = {
      type: "button" as const,
      disabled: isUpdating,
    };

    if (candidate.stage === "sourced") {
      return (
        <>
          <button
            {...buttonProps}
            style={{ ...styles.shortlistButton, ...commonStyle }}
            onClick={() => void toggleShortlist(candidate)}
          >
            {isUpdating ? "Updating..." : "Shortlist"}
          </button>

          <button
            {...buttonProps}
            style={{ ...styles.rejectButton, ...commonStyle }}
            onClick={() => void handleReject(candidate)}
          >
            Reject
          </button>
        </>
      );
    }

    if (candidate.stage === "shortlisted") {
      return (
        <>
          <button
            {...buttonProps}
            style={{ ...styles.removeButton, ...commonStyle }}
            onClick={() => void toggleShortlist(candidate)}
          >
            {isUpdating ? "Updating..." : "Remove shortlist"}
          </button>

          <button
            {...buttonProps}
            style={{ ...styles.interviewButton, ...commonStyle }}
            onClick={() => void handleInterview(candidate)}
          >
            {isUpdating ? "Moving..." : "Start Interview"}
          </button>

          <button
            {...buttonProps}
            style={{ ...styles.rejectButton, ...commonStyle }}
            onClick={() => void handleReject(candidate)}
          >
            Reject
          </button>
        </>
      );
    }

    if (candidate.stage === "interviewing") {
      return (
        <>
          <button
            {...buttonProps}
            style={{ ...styles.offerButton, ...commonStyle }}
            onClick={() => void handleOffer(candidate)}
          >
            {isUpdating ? "Making offer..." : "Make Offer"}
          </button>

          <button
            {...buttonProps}
            style={{ ...styles.rejectButton, ...commonStyle }}
            onClick={() => void handleReject(candidate)}
          >
            Reject
          </button>
        </>
      );
    }

    if (candidate.stage === "offered") {
      return (
        <button
          {...buttonProps}
          style={{ ...styles.rejectButton, ...commonStyle }}
          onClick={() => void handleReject(candidate)}
        >
          Reject
        </button>
      );
    }

    return null;
  };

  const renderCandidateCard = (
    candidate: CompanyPipelineCandidate
  ) => {
    const selected =
      selectedPipelineCandidate?.applicationId === candidate.applicationId;

    const isUpdating =
      updatingApplication === candidate.applicationId;

    return (
      <button
        key={candidate.applicationId}
        type="button"
        style={{
          ...styles.candidateCard,
          ...(selected ? styles.candidateCardSelected : {}),
        }}
        onClick={() => void handleViewCandidate(candidate)}
        aria-pressed={selected}
      >
        <div style={styles.candidateCardTop}>
          <div style={styles.avatar}>
            {candidate.name?.charAt(0).toUpperCase() || "?"}
          </div>

          <div style={styles.candidateIdentity}>
            <div style={styles.nameRow}>
              <strong style={styles.candidateName}>
                {candidate.name}
              </strong>

              {candidate.verified && (
                <span style={styles.verifiedBadge} title="Verified candidate">
                  ✓
                </span>
              )}
            </div>

            <span style={styles.candidateRole}>
              {candidate.role || "Professional"}
            </span>
          </div>

          <span style={selected ? styles.selectedDot : styles.unselectedDot}>
            {selected ? "✓" : ""}
          </span>
        </div>

        <div style={styles.candidateMeta}>
          <span style={styles.categoryBadge}>
            {candidate.category || "Uncategorised"}
          </span>

          <span style={styles.experienceText}>
            {candidate.experience ?? 0}{" "}
            {(candidate.experience ?? 0) === 1 ? "year" : "years"}
          </span>
        </div>

        {candidate.jobTitle && (
          <div style={styles.appliedFor}>
            Applied for <strong>{candidate.jobTitle}</strong>
          </div>
        )}

        <div style={styles.skillsRow}>
          {(candidate.skills || []).slice(0, 3).map((skill) => (
            <span key={skill} style={styles.skillChip}>
              {skill}
            </span>
          ))}
        </div>

        <div style={styles.candidateCardFooter}>
          <span
            style={
              candidate.stage === "rejected"
                ? styles.rejectedBadge
                : candidate.stage === "offered"
                  ? styles.offerStageBadge
                  : candidate.stage === "interviewing"
                    ? styles.interviewStageBadge
                    : candidate.stage === "shortlisted"
                      ? styles.shortlistedBadge
                      : styles.reviewBadge
            }
          >
            {candidate.stage === "rejected"
              ? "Rejected"
              : candidate.stage === "offered"
                ? "Offer stage"
                : candidate.stage === "interviewing"
                  ? "Interviewing"
                  : candidate.stage === "shortlisted"
                    ? "Shortlisted"
                    : "Needs review"}
          </span>

          <span style={styles.applicationDate}>
            {formatDate(candidate.appliedAt)}
          </span>
        </div>

        {isUpdating && (
          <span style={styles.updatingText}>Updating application…</span>
        )}
      </button>
    );
  };

  const renderGroupList = (groups: JobGroup[]) => {
    if (groups.length === 0) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>✓</div>
          <strong>No applications in this stage</strong>
          <p>Applications will appear here as candidates progress.</p>
        </div>
      );
    }

    return (
      <div style={styles.groups}>
        {groups.map((group) => {
          const expanded = expandedGroups.includes(group.key);

          return (
            <section key={group.key} style={styles.group}>
              <button
                type="button"
                style={styles.groupHeader}
                onClick={() => toggleGroup(group.key)}
                aria-expanded={expanded}
              >
                <span style={styles.groupIcon}>
                  {group.label.charAt(0).toUpperCase()}
                </span>

                <span style={styles.groupHeaderText}>
                  <strong style={styles.groupTitle}>{group.label}</strong>
                  <span style={styles.groupDescription}>
                    {group.description}
                  </span>
                </span>

                <span style={styles.groupCount}>
                  {group.candidates.length}
                </span>

                <span style={styles.expandIcon}>
                  {expanded ? "−" : "+"}
                </span>
              </button>

              {expanded && (
                <div style={styles.groupCandidates}>
                  {group.candidates.map(renderCandidateCard)}
                </div>
              )}
            </section>
          );
        })}
      </div>
    );
  };

  const renderProfileSection = (
    title: string,
    content: React.ReactNode,
    count?: number
  ) => (
    <section style={styles.profileSection}>
      <div style={styles.profileSectionHeader}>
        <h3 style={styles.profileSectionTitle}>{title}</h3>
        {count !== undefined && (
          <span style={styles.countBadge}>{count}</span>
        )}
      </div>
      {content}
    </section>
  );

  const candidate = selectedCandidate;
  const application = selectedPipelineCandidate;

  return (
    <div style={styles.container}>
      <header style={styles.pageHeader}>
        <div>
          <span style={styles.eyebrow}>RECRUITMENT MANAGEMENT</span>
          <h1 style={styles.pageTitle}>Recruitment Pipeline</h1>
          <p style={styles.pageSubtitle}>
            Review applicants by job, select a candidate, and inspect their
            complete profile alongside the application list.
          </p>
        </div>

        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <strong>{applicantCandidates.length}</strong>
            <span>Applicants</span>
          </div>
          <div style={styles.summaryCard}>
            <strong>{shortlistedCandidates.length}</strong>
            <span>Shortlisted</span>
          </div>
          <div style={styles.summaryCard}>
            <strong>{activePipelineCount}</strong>
            <span>In pipeline</span>
          </div>
        </div>
      </header>

      <div style={styles.workflow}>
        {[
          ["1", "Review Applicants"],
          ["2", "Shortlist"],
          ["3", "Interview"],
          ["4", "Offer"],
        ].map(([number, label], index) => (
          <React.Fragment key={number}>
            {index > 0 && <span style={styles.workflowArrow}>→</span>}
            <div style={styles.workflowStep}>
              <span style={styles.workflowNumber}>{number}</span>
              <strong>{label}</strong>
            </div>
          </React.Fragment>
        ))}
      </div>

      <nav style={styles.viewTabs} aria-label="Application stages">
        {(
          [
            ["applicants", "Applicants", applicantCandidates.length],
            ["shortlisted", "Shortlist", shortlistedCandidates.length],
            ["interviewing", "Interviews", interviewingCandidates.length],
            ["offered", "Offers", offeredCandidates.length],
            ["rejected", "Rejects", rejectedCandidates.length],
          ] as [PipelineView, string, number][]
        ).map(([view, label, count]) => (
          <button
            key={view}
            type="button"
            style={{
              ...styles.viewTab,
              ...(activeView === view ? styles.activeViewTab : {}),
            }}
            onClick={() => setActiveView(view)}
          >
            {label}
            <span style={styles.tabCount}>{count}</span>
          </button>
        ))}
      </nav>

      {loading ? (
        <div style={styles.loadingState}>
          <div style={styles.loadingCircle} />
          <span>Loading recruitment pipeline…</span>
        </div>
      ) : (
        <div style={styles.workspace}>
          <aside style={styles.leftPanel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.panelTitle}>
                  {activeView === "applicants"
                    ? "Applicants by job"
                    : activeView === "shortlisted"
                      ? "Shortlisted candidates"
                      : activeView === "interviewing"
                        ? "Interview candidates"
                        : activeView === "offered"
                          ? "Offer stage"
                          : "Rejected applications"}
                </h2>
                <p style={styles.panelSubtitle}>
                  Select a candidate to view their profile.
                </p>
              </div>
              <span style={styles.panelCount}>{visibleCandidates.length}</span>
            </div>

            <div style={styles.leftPanelContent}>
              {renderGroupList(visibleGroups)}
            </div>
          </aside>

          <main style={styles.rightPanel}>
            {!candidate || !application ? (
              <div style={styles.profileEmptyState}>
                <div style={styles.emptyProfileIcon}>👤</div>
                <h2 style={styles.profileEmptyTitle}>
                  Select a candidate
                </h2>
                <p style={styles.profileEmptyText}>
                  Choose an applicant from the left panel to view their
                  introduction reel, photos, professional summary, skills,
                  qualifications, work history, projects, and documents.
                </p>
                {visibleCandidates.length === 0 && (
                  <span style={styles.emptyStageHint}>
                    There are no candidates in this stage yet.
                  </span>
                )}
              </div>
            ) : (
              <div
                style={{
                  ...styles.profilePanel,
                  ...(isProfileExpanded
                    ? {
                        position: "fixed",
                        inset: 12,
                        zIndex: 10000,
                        width: "auto",
                        height: "auto",
                        maxHeight: "calc(100vh - 24px)",
                        border: "1px solid #D4D2E6",
                        borderRadius: 13,
                        background: "#FFFFFF",
                        boxShadow: "0 0 0 100vmax rgba(0, 20, 35, 0.72), 0 18px 60px rgba(0,0,0,0.25)",
                      }
                    : {}),
                }}
                role={isProfileExpanded ? "dialog" : undefined}
                aria-modal={isProfileExpanded ? true : undefined}
                aria-label={isProfileExpanded ? `${candidate.name} expanded profile` : undefined}
              >
                <header style={styles.profileHeader}>
                  <div style={styles.profileHeading}>
                    <div style={styles.profileAvatar}>
                      {candidate.media.facePhoto ? (
                        <img
                          src={candidate.media.facePhoto}
                          alt={`${candidate.name} profile`}
                          style={styles.profileAvatarImage}
                        />
                      ) : (
                        candidate.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div style={styles.profileHeadingText}>
                      <span style={styles.eyebrow}>CANDIDATE PROFILE</span>
                      <h2 style={styles.profileName}>{candidate.name}</h2>
                      <p style={styles.profileRole}>
                        {candidate.headline || application.role || "Professional"}
                      </p>
                      <div style={styles.profileBadges}>
                        <span
                          style={
                            candidate.verified
                              ? styles.verifiedStatus
                              : styles.unverifiedStatus
                          }
                        >
                          {candidate.verified ? "✓ Verified" : "Not verified"}
                        </span>
                        <span style={styles.categoryBadge}>
                          {application.category || "Uncategorised"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.profileHeaderActions}>
                    <button
                      type="button"
                      style={styles.expandProfileButton}
                      onClick={() => setIsProfileExpanded((expanded) => !expanded)}
                      aria-label={isProfileExpanded ? "Close expanded candidate profile" : "Expand candidate profile"}
                      title={isProfileExpanded ? "Close expanded profile (Esc)" : "Expand profile"}
                    >
                      {isProfileExpanded ? "✕ Close" : "⛶ Expand profile"}
                    </button>
                    
                    <button
                     type="button"
                     style={styles.interviewButton}
                     disabled={
                    messagingCandidateId === application.applicationId
                       }
                     onClick={() => void handleMessageCandidate(application)}
                    >
                    {messagingCandidateId === application.applicationId
                    ? "Sending message..."
                    : "Message candidate"}
                    </button>
                    {renderStageActions(application, true)}

                    
                  </div>
                </header>

                {loadingDetails && (
                  <div style={styles.loadingNotice}>
                    Loading the complete candidate profile…
                  </div>
                )}

                <div style={styles.profileContent}>
                  <div style={styles.quickFacts}>
                    {[
                      ["Location", candidate.location || "Not provided"],
                      ["Email", candidate.email || "Not provided"],
                      ["Phone", candidate.phone || "Not provided"],
                      [
                        "Experience",
                        `${candidate.yearsExperience ?? 0} ${
                          candidate.yearsExperience === 1 ? "year" : "years"
                        }`,
                      ],
                      [
                        "Profile completion",
                        candidate.profileCompletion != null
                          ? `${candidate.profileCompletion}%`
                          : "Not available",
                      ],
                      ["Applied role", application.jobTitle || "Job application"],
                    ].map(([label, value]) => (
                      <div key={label} style={styles.factCard}>
                        <span style={styles.factLabel}>{label}</span>
                        <strong style={styles.factValue}>{value}</strong>
                      </div>
                    ))}
                  </div>

                  {renderProfileSection(
                    "Introduction Reel",
                    candidate.media.reelMeta?.dataUrl ? (
                      <div style={styles.mediaCard}>
                        <video
                          key={`${candidate.id}-${candidate.media.reelMeta.dataUrl}`}
                          src={candidate.media.reelMeta.dataUrl}
                          controls
                          playsInline
                          preload="metadata"
                          style={styles.reel}
                        />
                        <div style={styles.mediaMeta}>
                          {candidate.media.reelMeta.fileName ||
                            "Candidate introduction video"}
                          {candidate.media.reelMeta.fileSize
                            ? ` · ${candidate.media.reelMeta.fileSize}`
                            : ""}
                        </div>
                      </div>
                    ) : (
                      <div style={styles.mediaPlaceholder}>
                        No introduction reel has been uploaded.
                      </div>
                    )
                  )}

                  {renderProfileSection(
                    "Profile Photos",
                    <div style={styles.photoGrid}>
                      <div style={styles.photoCard}>
                        <h4 style={styles.photoTitle}>Profile photo</h4>
                        {candidate.media.facePhoto ? (
                          <img
                            src={candidate.media.facePhoto}
                            alt={`${candidate.name} profile`}
                            style={styles.profilePhoto}
                          />
                        ) : (
                          <div style={styles.mediaPlaceholder}>
                            No profile photo uploaded.
                          </div>
                        )}
                      </div>

                      <div style={styles.photoCard}>
                        <h4 style={styles.photoTitle}>Full-body photo</h4>
                        {candidate.media.fullBodyPhoto ? (
                          <img
                            src={candidate.media.fullBodyPhoto}
                            alt={`${candidate.name} full body`}
                            style={styles.fullBodyPhoto}
                          />
                        ) : (
                          <div style={styles.mediaPlaceholder}>
                            No full-body photo uploaded.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {renderProfileSection(
                    "Professional Summary",
                    <p style={styles.summaryText}>
                      {candidate.bio ||
                        "No professional summary has been provided."}
                    </p>
                  )}

                  {renderProfileSection(
                    "Skills",
                    candidate.skills.length > 0 ? (
                      <div style={styles.detailSkills}>
                        {candidate.skills.map((skill, index) => (
                          <div
                            key={`${skill.name}-${index}`}
                            style={styles.detailSkill}
                          >
                            <strong>{skill.name}</strong>
                            {skill.proficiency && (
                              <small>{skill.proficiency}</small>
                            )}
                            {skill.yearsUsed != null && (
                              <small>
                                {skill.yearsUsed}{" "}
                                {skill.yearsUsed === 1 ? "year" : "years"}
                              </small>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={styles.mutedText}>No skills provided.</p>
                    ),
                    candidate.skills.length
                  )}

                  {renderProfileSection(
                    "Qualifications",
                    candidate.qualifications.length > 0 ? (
                      <div style={styles.timeline}>
                        {candidate.qualifications.map((qualification) => (
                          <article
                            key={qualification.id}
                            style={styles.timelineItem}
                          >
                            <span style={styles.timelineDot} />
                            <div style={styles.timelineContent}>
                              <strong style={styles.timelineTitle}>
                                {qualification.qualificationName ||
                                  "Qualification"}
                              </strong>
                              <p style={styles.timelineMeta}>
                                {qualification.institution ||
                                  "Institution not provided"}
                              </p>
                              {qualification.fieldOfStudy && (
                                <p style={styles.timelineMeta}>
                                  Field: {qualification.fieldOfStudy}
                                </p>
                              )}
                              {(qualification.startYear ||
                                qualification.completionYear) && (
                                <p style={styles.timelineMeta}>
                                  {qualification.startYear || "—"} –{" "}
                                  {qualification.completionYear || "Present"}
                                </p>
                              )}
                              {qualification.verificationStatus && (
                                <span style={styles.statusTag}>
                                  {formatVerificationStatus(
                                    qualification.verificationStatus
                                  )}
                                </span>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p style={styles.mutedText}>
                        No qualifications have been recorded.
                      </p>
                    ),
                    candidate.qualifications.length
                  )}

                  {renderProfileSection(
                    "Work History",
                    candidate.experienceHistory.length > 0 ? (
                      <div style={styles.timeline}>
                        {candidate.experienceHistory.map((experience) => (
                          <article
                            key={experience.id}
                            style={styles.timelineItem}
                          >
                            <span style={styles.timelineDot} />
                            <div style={styles.timelineContent}>
                              <strong style={styles.timelineTitle}>
                                {experience.jobTitle || "Position"}
                              </strong>
                              <p style={styles.timelineMeta}>
                                {experience.companyName ||
                                  "Company not provided"}
                              </p>
                              {(experience.startDate ||
                                experience.endDate) && (
                                <p style={styles.timelineMeta}>
                                  {formatDate(experience.startDate)} –{" "}
                                  {experience.endDate
                                    ? formatDate(experience.endDate)
                                    : "Present"}
                                </p>
                              )}
                              {experience.description && (
                                <p style={styles.descriptionText}>
                                  {experience.description}
                                </p>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p style={styles.mutedText}>
                        No work history has been recorded.
                      </p>
                    ),
                    candidate.experienceHistory.length
                  )}

                  {renderProfileSection(
                    "Portfolio Projects",
                    candidate.media.projects.length > 0 ? (
                      <div style={styles.projectGrid}>
                        {candidate.media.projects.map((project) => (
                          <article
                            key={project.id}
                            style={styles.projectCard}
                          >
                            <div style={styles.projectHeader}>
                              <strong>
                                {project.name || "Portfolio project"}
                              </strong>
                              {project.status && (
                                <span style={styles.projectStatus}>
                                  {project.status}
                                </span>
                              )}
                            </div>
                            <p>
                              {project.desc ||
                                "No project description provided."}
                            </p>
                            {project.tech && (
                              <small>{project.tech}</small>
                            )}
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p style={styles.mutedText}>
                        No portfolio projects have been recorded.
                      </p>
                    ),
                    candidate.media.projects.length
                  )}

                  {renderProfileSection(
                    "Documents",
                    candidate.media.documents.length > 0 ? (
                      <div style={styles.documentList}>
                        {candidate.media.documents.map((document) => (
                          <article
                            key={document.id}
                            style={styles.documentCard}
                          >
                            <div style={styles.documentIcon}>DOC</div>
                            <div style={styles.documentInfo}>
                              <strong>
                                {document.name ||
                                  document.fileName ||
                                  "Candidate document"}
                              </strong>
                              <span style={styles.documentMeta}>
                                {document.fileName ||
                                  "File name not provided"}
                                {document.fileSize
                                  ? ` · ${document.fileSize}`
                                  : ""}
                              </span>
                              <span
                                style={
                                  document.status?.toLowerCase() === "verified"
                                    ? styles.documentVerified
                                    : styles.documentPending
                                }
                              >
                                {formatVerificationStatus(document.status)}
                              </span>
                            </div>

                            {document.dataUrl ? (
                              <a
                                href={document.dataUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={styles.documentLink}
                              >
                                Open document
                              </a>
                            ) : (
                              <span style={styles.mutedText}>
                                File unavailable
                              </span>
                            )}
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p style={styles.mutedText}>
                        No candidate documents have been uploaded.
                      </p>
                    ),
                    candidate.media.documents.length
                  )}

                  {renderProfileSection(
                    "Profile Gallery",
                    candidate.media.galleryImages.length > 0 ? (
                      <div style={styles.galleryGrid}>
                        {candidate.media.galleryImages.map((image) => (
                          <div key={image.id} style={styles.galleryCard}>
                            {image.image ? (
                              <img
                                src={image.image}
                                alt={image.name || "Candidate gallery image"}
                                style={styles.galleryImage}
                              />
                            ) : (
                              <div style={styles.mediaPlaceholder}>
                                Image unavailable
                              </div>
                            )}
                            <div style={styles.galleryCaption}>
                              <strong>{image.name || "Gallery image"}</strong>
                              <span>{image.category || "Uncategorised"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={styles.mutedText}>
                        No gallery images have been uploaded.
                      </p>
                    ),
                    candidate.media.galleryImages.length
                  )}

                  {renderProfileSection(
                   "Application Question Responses",
                    loadingApplicationResponses ? (
                    <div style={styles.responseNotice}>
                    Loading application answers…
                  </div>
                   ) : applicationResponsesError ? (
                  <div style={styles.responseError}>
                  <p style={styles.responseErrorText}>
                  {applicationResponsesError}
                  </p>
                 <button
                 type="button"
                 style={styles.responseRetryButton}
                  onClick={() => setResponsesRetryKey((current) => current + 1)}
                 >
                 Try again
                 </button>
                 </div>
                 ) : applicationResponses.length > 0 ? (
                  <div style={styles.responseList}>
                  {applicationResponses.map((item, index) => {
                   const question =
                   item.questionText || item.question || "Application question";

                   
                    const answer =
                    item.answerText ??
                    item.answer ??
                    item.response ??
                    item.answerJson;

                    const formattedAnswer =
                    answer == null
                    ? ""
                    : typeof answer === "string"
                    ? answer
                    : JSON.stringify(answer, null, 2);


                return (
                <article
               key={item.id ?? `${application?.applicationId}-${index}`}
               style={styles.responseCard}
               >
                <div style={styles.responseNumber}>
                Question {index + 1}
               </div>

            <strong style={styles.responseQuestion}>
              {question}
            </strong>

            {item.questionType && (
              <span style={styles.responseType}>
                {formatVerificationStatus(item.questionType)}
              </span>
            )}

            
              <p style={styles.responseAnswer}>
               {formattedAnswer.trim()
               ? formattedAnswer
               : "No answer provided."}
              </p>

             </article>
              );
                 })}
              </div>
          ) : (
              <div style={styles.responseNotice}>
           No application-question responses were found for this application.
            </div>
          ),
         applicationResponses.length
          )}


                  
{renderProfileSection(
  "CV Submitted With This Application",
  loadingApplicationResume ? (
    <div style={styles.responseNotice}>
      Loading the CV submitted for this application…
    </div>
  ) : applicationResumeError ? (
    <div style={styles.responseError}>
      <p style={styles.responseErrorText}>
        {applicationResumeError}
      </p>

      <button
        type="button"
        style={styles.responseRetryButton}
        onClick={() => setResumeRetryKey((current) => current + 1)}
      >
        Try again
      </button>
    </div>
  ) : applicationResume?.resume &&
    Object.keys(applicationResume.resume).length > 0 ? (
    <div
      style={{
        padding: 14,
        border: "1px solid #D4D2E6",
        borderRadius: 10,
        background: "#F8FCFF",
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <strong style={{ color: "#00273D", fontSize: 12 }}>
          Application CV
        </strong>

        <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 10 }}>
          This is the resume snapshot associated with this specific application.
        </p>
      </div>

      <ResumeValue value={applicationResume.resume} />
    </div>
  ) : (
    <div style={styles.responseNotice}>
      No saved CV snapshot was found for this application.
      The candidate may have submitted an older application or one without
      a saved resume.
    </div>
  )
)}

                  {renderProfileSection(                   
                    "Application Details",
                    <div style={styles.applicationDetails}>
                      <div>
                        <span style={styles.factLabel}>Application stage</span>
                        <strong style={styles.factValue}>
                          {formatVerificationStatus(application.stage)}
                        </strong>
                      </div>
                      <div>
                        <span style={styles.factLabel}>Applied on</span>
                        <strong style={styles.factValue}>
                          {formatDate(application.appliedAt)}
                        </strong>
                      </div>
                      <div>
                        <span style={styles.factLabel}>Application ID</span>
                        <strong style={styles.factValue}>
                          {application.applicationId}
                        </strong>
                      </div>
                    </div>
                  )}

                  {renderProfileSection(
                    "Availability",
                    <p style={styles.summaryText}>
                      {candidate.media.preferences?.availability
                        ? formatVerificationStatus(
                            candidate.media.preferences.availability
                          )
                        : "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {selectedDocument && (
        <div style={styles.documentInlineNotice}>
          Selected document:{" "}
          {selectedDocument.name ||
            selectedDocument.fileName ||
            "Candidate document"}
          <button
            type="button"
            style={styles.dismissButton}
            onClick={() => setSelectedDocument(null)}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    maxWidth: 1600,
    margin: "0 auto",
    fontFamily: "Helvetica, Arial, sans-serif",
    color: "#334155",
  },

  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 22,
    marginBottom: 20,
  },

  eyebrow: {
    display: "inline-flex",
    padding: "5px 9px",
    borderRadius: 999,
    background: "#EAF6FD",
    border: "1px solid #B7DCEC",
    color: "#00466D",
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: "0.7px",
  },

  pageTitle: {
    margin: "10px 0 5px",
    color: "#00273D",
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "-0.6px",
  },

  pageSubtitle: {
    maxWidth: 690,
    margin: 0,
    color: "#64748B",
    fontSize: 12,
    lineHeight: 1.6,
  },

  summaryGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 9,
  },

  summaryCard: {
    minWidth: 94,
    padding: "12px 14px",
    borderRadius: 11,
    border: "1px solid #D4D2E6",
    background: "#FFFFFF",
    boxShadow: "0 5px 16px rgba(15,23,42,0.04)",
  },

  workflow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
    padding: "12px 15px",
    border: "1px solid #D4D2E6",
    borderRadius: 12,
    background: "#FFFFFF",
  },

  workflowStep: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#334155",
    fontSize: 11,
  },

  workflowNumber: {
    width: 27,
    height: 27,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "#DDEFF8",
    color: "#00466D",
    fontWeight: 800,
  },

  workflowArrow: {
    color: "#94A3B8",
    fontWeight: 800,
  },

  viewTabs: {
    display: "flex",
    flexWrap: "wrap",
    gap: 5,
    padding: 5,
    marginBottom: 17,
    width: "fit-content",
    maxWidth: "100%",
    border: "1px solid #D4D2E6",
    borderRadius: 11,
    background: "#F1F5F9",
  },

  viewTab: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 12px",
    border: "none",
    borderRadius: 7,
    background: "transparent",
    color: "#64748B",
    fontSize: 10,
    fontWeight: 800,
    cursor: "pointer",
  },

  activeViewTab: {
    background: "#FFFFFF",
    color: "#00466D",
    boxShadow: "0 3px 10px rgba(15,23,42,0.06)",
  },

  tabCount: {
    minWidth: 19,
    padding: "3px 5px",
    borderRadius: 5,
    background: "#EAF6FD",
    color: "#00466D",
    textAlign: "center",
    fontSize: 9,
  },

  workspace: {
    display: "grid",
    gridTemplateColumns: "minmax(290px, 0.85fr) minmax(0, 1.7fr)",
    // Stretch both panels to a common height so each panel can scroll independently.
    alignItems: "stretch",
    gap: 16,
    minWidth: 0,
  },

  leftPanel: {
    minWidth: 0,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    border: "1px solid #D4D2E6",
    borderRadius: 13,
    background: "#FFFFFF",
    boxShadow: "0 6px 20px rgba(15,23,42,0.04)",
  },

  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "12px 13px",
    flexShrink: 0,
    borderBottom: "1px solid #E9E8F3",
    background: "#FFFFFF",
  },

  panelTitle: {
    margin: 0,
    color: "#00273D",
    fontSize: 14,
    fontWeight: 800,
  },

  panelSubtitle: {
    margin: "3px 0 0",
    color: "#64748B",
    fontSize: 10,
    lineHeight: 1.4,
  },

  panelCount: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 26,
    height: 26,
    padding: "0 7px",
    borderRadius: 7,
    background: "#EAF6FD",
    color: "#00466D",
    fontSize: 10,
    fontWeight: 800,
  },

  leftPanelContent: {
    flex: "1 1 auto",
    height: 0,
    maxHeight: "calc(100vh - 300px)",
    minHeight: 300,
    overflowY: "auto",
    overscrollBehavior: "contain",
    padding: 7,
    background: "#F8FCFF",
  },

  groups: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },

  group: {
    overflow: "hidden",
    border: "1px solid #D4D2E6",
    borderRadius: 10,
    background: "#FFFFFF",
  },

  groupHeader: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "8px 8px",
    border: "none",
    background: "#FFFFFF",
    textAlign: "left",
    cursor: "pointer",
  },

  groupIcon: {
    width: 26,
    height: 26,
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    background: "#DDEFF8",
    color: "#00466D",
    fontSize: 10,
    fontWeight: 800,
  },

  groupHeaderText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flex: 1,
    minWidth: 0,
  },

  groupTitle: {
    color: "#00273D",
    fontSize: 11,
    lineHeight: 1.25,
    overflowWrap: "anywhere",
  },

  groupDescription: {
    color: "#94A3B8",
    fontSize: 9,
    lineHeight: 1.25,
  },

  groupCount: {
    padding: "3px 5px",
    borderRadius: 5,
    background: "#FFD784",
    color: "#00466D",
    fontSize: 9,
    fontWeight: 800,
  },

  expandIcon: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: 700,
  },

  groupCandidates: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    padding: "0 5px 5px",
  },

  candidateCard: {
    display: "block",
    width: "100%",
    minWidth: 0,
    padding: 7,
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    background: "#FFFFFF",
    textAlign: "left",
    cursor: "pointer",
    color: "#334155",
    transition: "border-color 0.15s ease, background 0.15s ease",
  },

  candidateCardSelected: {
    border: "1px solid #1E92D2",
    background: "#EAF6FD",
    boxShadow: "inset 3px 0 0 #00466D",
  },

  candidateCardTop: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    minWidth: 0,
  },

  avatar: {
    width: 30,
    height: 30,
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    background: "#00466D",
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: 800,
  },

  candidateIdentity: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },

  nameRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    minWidth: 0,
    lineHeight: 1.25,
  },

  candidateName: {
    color: "#00273D",
    fontSize: 10,
    lineHeight: 1.3,
    overflowWrap: "anywhere",
  },

  candidateRole: {
    color: "#64748B",
    fontSize: 9,
    lineHeight: 1.3,
    overflowWrap: "anywhere",
  },

  verifiedBadge: {
    width: 14,
    height: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "#FFAD01",
    color: "#00273D",
    fontSize: 8,
    fontWeight: 900,
  },

  selectedDot: {
    width: 19,
    height: 19,
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "#00466D",
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: 800,
  },

  unselectedDot: {
    width: 19,
    height: 19,
    flexShrink: 0,
    border: "1px solid #D4D2E6",
    borderRadius: "50%",
  },

  candidateMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 6,
  },

  categoryBadge: {
    display: "inline-flex",
    width: "fit-content",
    padding: "3px 5px",
    borderRadius: 5,
    background: "#EAF6FD",
    color: "#00466D",
    fontSize: 8,
    fontWeight: 800,
  },

  experienceText: {
    color: "#64748B",
    fontSize: 9,
  },

  appliedFor: {
    marginTop: 5,
    color: "#64748B",
    fontSize: 9,
    lineHeight: 1.3,
    overflowWrap: "anywhere",
  },

  skillsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 3,
    marginTop: 5,
  },

  skillChip: {
    padding: "2px 4px",
    border: "1px solid #D4D2E6",
    borderRadius: 4,
    background: "#F8FCFF",
    color: "#64748B",
    fontSize: 8,
    lineHeight: 1.3,
  },

  candidateCardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 6,
    paddingTop: 5,
    borderTop: "1px solid #E9E8F3",
  },

  reviewBadge: {
    color: "#8A6500",
    fontSize: 8,
    fontWeight: 800,
  },

  shortlistedBadge: {
    color: "#00466D",
    fontSize: 8,
    fontWeight: 800,
  },

  offerStageBadge: {
    color: "#16804A",
    fontSize: 8,
    fontWeight: 800,
  },

  interviewStageBadge: {
    color: "#1E92D2",
    fontSize: 8,
    fontWeight: 800,
  },

  rejectedBadge: {
    color: "#A61B3C",
    fontSize: 8,
    fontWeight: 800,
  },

  applicationDate: {
    color: "#94A3B8",
    fontSize: 8,
  },

  updatingText: {
    display: "block",
    marginTop: 5,
    color: "#00466D",
    fontSize: 9,
  },

  rightPanel: {
    minWidth: 0,
    minHeight: 400,
    height: "calc(100vh - 300px)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    border: "1px solid #D4D2E6",
    borderRadius: 13,
    background: "#FFFFFF",
    boxShadow: "0 6px 20px rgba(15,23,42,0.04)",
  },

  profileEmptyState: {
    flex: "1 1 auto",
    minHeight: 400,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 35,
    textAlign: "center",
  },

  emptyProfileIcon: {
    width: 54,
    height: 54,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderRadius: 15,
    background: "#EAF6FD",
    fontSize: 23,
  },

  profileEmptyTitle: {
    margin: "0 0 7px",
    color: "#00273D",
    fontSize: 19,
    fontWeight: 800,
  },

  profileEmptyText: {
    maxWidth: 440,
    margin: 0,
    color: "#64748B",
    fontSize: 12,
    lineHeight: 1.7,
  },

  emptyStageHint: {
    marginTop: 14,
    color: "#94A3B8",
    fontSize: 10,
  },

  profilePanel: {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 auto",
    minWidth: 0,
    minHeight: 0,
    height: "100%",
    overflow: "hidden",
  },

  profileHeader: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
    padding: 18,
    flexShrink: 0,
    borderBottom: "1px solid #E9E8F3",
    background: "#FFFFFF",
  },

  profileHeading: {
    display: "flex",
    alignItems: "center",
    gap: 13,
    flex: "1 1 250px",
    minWidth: 0,
  },

  profileAvatar: {
    width: 65,
    height: 65,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 14,
    background: "#00466D",
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: 800,
  },

  profileAvatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  profileHeadingText: {
    minWidth: 0,
  },

  profileName: {
    margin: "5px 0 3px",
    color: "#00273D",
    fontSize: 21,
    fontWeight: 800,
    overflowWrap: "anywhere",
  },

  profileRole: {
    margin: 0,
    color: "#64748B",
    fontSize: 11,
    overflowWrap: "anywhere",
  },

  profileBadges: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },

  verifiedStatus: {
    padding: "4px 7px",
    borderRadius: 5,
    background: "#E9FFF4",
    color: "#16804A",
    fontSize: 8,
    fontWeight: 800,
  },

  unverifiedStatus: {
    padding: "4px 7px",
    borderRadius: 5,
    background: "#FFF9E6",
    color: "#8A6500",
    fontSize: 8,
    fontWeight: 800,
  },

  profileHeaderActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },

  expandProfileButton: {
    padding: "8px 10px",
    border: "1px solid #B7DCEC",
    borderRadius: 7,
    background: "#EAF6FD",
    color: "#00466D",
    fontSize: 10,
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  compactAction: {
    padding: "8px 9px",
    fontSize: 9,
  },

  shortlistButton: {
    padding: "7px 9px",
    border: "1px solid #B7DCEC",
    borderRadius: 7,
    background: "#EAF6FD",
    color: "#00466D",
    fontSize: 9,
    fontWeight: 800,
    cursor: "pointer",
  },

  removeButton: {
    padding: "7px 9px",
    border: "1px solid #FFD784",
    borderRadius: 7,
    background: "#FFFFFF",
    color: "#00466D",
    fontSize: 9,
    fontWeight: 800,
    cursor: "pointer",
  },

  interviewButton: {
    padding: "7px 9px",
    border: "none",
    borderRadius: 7,
    background: "#00466D",
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: 800,
    cursor: "pointer",
  },

  rejectButton: {
    padding: "7px 9px",
    border: "1px solid #FFB7C5",
    borderRadius: 7,
    background: "#FFF1F4",
    color: "#A61B3C",
    fontSize: 9,
    fontWeight: 800,
    cursor: "pointer",
  },

  offerButton: {
    padding: "7px 9px",
    border: "none",
    borderRadius: 7,
    background: "#FFAD01",
    color: "#00273D",
    fontSize: 9,
    fontWeight: 800,
    cursor: "pointer",
  },

  loadingNotice: {
    margin: "12px 16px 0",
    padding: "9px 11px",
    flexShrink: 0,
    borderRadius: 7,
    background: "#EAF6FD",
    color: "#00466D",
    fontSize: 10,
    fontWeight: 700,
  },

  profileContent: {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 auto",
    minHeight: 0,
    overflowY: "auto",
    overscrollBehavior: "contain",
    gap: 0,
    padding: "16px 18px 22px",
  },

  quickFacts: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))",
    gap: 8,
    marginBottom: 4,
  },

  factCard: {
    minWidth: 0,
    padding: "10px 11px",
    border: "1px solid #D4D2E6",
    borderRadius: 9,
    background: "#F8FCFF",
  },

  factLabel: {
    display: "block",
    marginBottom: 5,
    color: "#94A3B8",
    fontSize: 8,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  factValue: {
    display: "block",
    color: "#334155",
    fontSize: 10,
    lineHeight: 1.45,
    overflowWrap: "anywhere",
  },

  profileSection: {
    marginTop: 20,
    flexShrink: 0,
  },

  profileSectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },

  profileSectionTitle: {
    margin: 0,
    color: "#00273D",
    fontSize: 13,
    fontWeight: 800,
  },

  countBadge: {
    minWidth: 22,
    padding: "4px 6px",
    borderRadius: 6,
    background: "#EAF6FD",
    color: "#00466D",
    textAlign: "center",
    fontSize: 9,
    fontWeight: 800,
  },

  mediaCard: {
    minWidth: 0,
    padding: 11,
    border: "1px solid #D4D2E6",
    borderRadius: 10,
    background: "#FFFFFF",
  },

  reel: {
    display: "block",
    width: "100%",
    maxHeight: 350,
    borderRadius: 8,
    background: "#00273D",
  },

  mediaMeta: {
    marginTop: 7,
    color: "#94A3B8",
    fontSize: 9,
    lineHeight: 1.5,
    overflowWrap: "anywhere",
  },

  photoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 10,
  },

  photoCard: {
    minWidth: 0,
    padding: 10,
    border: "1px solid #D4D2E6",
    borderRadius: 10,
    background: "#FFFFFF",
  },

  photoTitle: {
    margin: "0 0 9px",
    color: "#334155",
    fontSize: 10,
    fontWeight: 800,
  },

  profilePhoto: {
    display: "block",
    width: "100%",
    height: 210,
    objectFit: "cover",
    borderRadius: 8,
    background: "#F1F5F9",
  },

  fullBodyPhoto: {
    display: "block",
    width: "100%",
    height: 260,
    objectFit: "contain",
    borderRadius: 8,
    background: "#F8FCFF",
  },

  mediaPlaceholder: {
    minHeight: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    background: "#F8FCFF",
    color: "#94A3B8",
    fontSize: 10,
    lineHeight: 1.5,
    textAlign: "center",
  },

  summaryText: {
    margin: 0,
    padding: 12,
    borderRadius: 9,
    background: "#F8FCFF",
    color: "#64748B",
    fontSize: 11,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },

  detailSkills: {
    display: "flex",
    flexWrap: "wrap",
    gap: 7,
  },

  detailSkill: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "8px 10px",
    border: "1px solid #D4D2E6",
    borderRadius: 8,
    background: "#F8FCFF",
    color: "#334155",
    fontSize: 10,
  },

  mutedText: {
    margin: 0,
    color: "#94A3B8",
    fontSize: 10,
    lineHeight: 1.6,
  },

  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: 9,
  },

  timelineItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    border: "1px solid #E9E8F3",
    borderRadius: 9,
    background: "#FFFFFF",
  },

  timelineDot: {
    width: 9,
    height: 9,
    flexShrink: 0,
    marginTop: 4,
    borderRadius: "50%",
    background: "#00466D",
    boxShadow: "0 0 0 4px #EAF6FD",
  },

  timelineContent: {
    minWidth: 0,
    flex: 1,
  },

  timelineTitle: {
    display: "block",
    color: "#334155",
    fontSize: 11,
    lineHeight: 1.5,
    overflowWrap: "anywhere",
  },

  timelineMeta: {
    margin: "4px 0 0",
    color: "#64748B",
    fontSize: 9,
    lineHeight: 1.5,
  },

  statusTag: {
    display: "inline-block",
    marginTop: 7,
    padding: "4px 6px",
    borderRadius: 5,
    background: "#FFD784",
    color: "#00466D",
    fontSize: 8,
    fontWeight: 800,
  },

  descriptionText: {
    margin: "8px 0 0",
    color: "#64748B",
    fontSize: 10,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },

  projectGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
    gap: 9,
  },

  projectCard: {
    minWidth: 0,
    padding: 11,
    border: "1px solid #D4D2E6",
    borderRadius: 9,
    background: "#FFFFFF",
  },

  projectHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    color: "#334155",
    fontSize: 10,
    overflowWrap: "anywhere",
  },

  projectStatus: {
    flexShrink: 0,
    padding: "3px 5px",
    borderRadius: 5,
    background: "#EAF6FD",
    color: "#00466D",
    fontSize: 8,
  },

  projectCardParagraph: {
    color: "#64748B",
    fontSize: 10,
    lineHeight: 1.5,
  },

  documentList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  documentCard: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    padding: 10,
    border: "1px solid #E9E8F3",
    borderRadius: 9,
    background: "#F8FCFF",
  },

  documentIcon: {
    width: 33,
    height: 33,
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    background: "#DDEFF8",
    color: "#00466D",
    fontSize: 8,
    fontWeight: 800,
  },

  documentInfo: {
    display: "flex",
    flex: "1 1 130px",
    minWidth: 0,
    flexDirection: "column",
    gap: 4,
    color: "#334155",
    fontSize: 10,
    overflowWrap: "anywhere",
  },

  documentMeta: {
    color: "#94A3B8",
    fontSize: 8,
  },

  documentVerified: {
    width: "fit-content",
    padding: "3px 5px",
    borderRadius: 5,
    background: "#E9FFF4",
    color: "#16804A",
    fontSize: 8,
    fontWeight: 800,
  },

  documentPending: {
    width: "fit-content",
    padding: "3px 5px",
    borderRadius: 5,
    background: "#FFF9E6",
    color: "#8A6500",
    fontSize: 8,
    fontWeight: 800,
  },

  documentLink: {
    display: "inline-block",
    padding: "7px 9px",
    border: "1px solid #B7DCEC",
    borderRadius: 7,
    background: "#FFFFFF",
    color: "#00466D",
    fontSize: 9,
    fontWeight: 800,
    textDecoration: "none",
  },

  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(125px,1fr))",
    gap: 9,
  },

  galleryCard: {
    minWidth: 0,
    overflow: "hidden",
    border: "1px solid #E9E8F3",
    borderRadius: 9,
    background: "#F8FCFF",
  },

  galleryImage: {
    display: "block",
    width: "100%",
    height: 125,
    objectFit: "cover",
  },

  galleryCaption: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: 8,
    color: "#334155",
    fontSize: 9,
    overflowWrap: "anywhere",
  },

  
  responseList: {
    display: "flex",
    flexDirection: "column",
    gap: 9,
  },

  responseCard: {
    padding: 12,
    border: "1px solid #D4D2E6",
    borderRadius: 9,
    background: "#FFFFFF",
  },

  responseNumber: {
    marginBottom: 7,
    color: "#1E92D2",
    fontSize: 9,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },

  responseQuestion: {
    display: "block",
    color: "#00273D",
    fontSize: 11,
    lineHeight: 1.6,
    overflowWrap: "anywhere",
  },

  responseType: {
    display: "inline-block",
    marginTop: 6,
    padding: "3px 6px",
    borderRadius: 5,
    background: "#EAF6FD",
    color: "#00466D",
    fontSize: 8,
    fontWeight: 700,
  },

  responseAnswer: {
    margin: "9px 0 0",
    padding: 10,
    borderRadius: 7,
    background: "#F8FCFF",
    color: "#475569",
    fontSize: 10,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },

  responseNotice: {
    padding: 12,
    border: "1px solid #D4D2E6",
    borderRadius: 8,
    background: "#F8FCFF",
    color: "#64748B",
    fontSize: 10,
    lineHeight: 1.6,
  },

  responseError: {
    padding: 12,
    border: "1px solid #FFB7C5",
    borderRadius: 8,
    background: "#FFF1F4",
  },

  responseErrorText: {
    margin: "0 0 9px",
    color: "#A61B3C",
    fontSize: 10,
    lineHeight: 1.6,
  },

  responseRetryButton: {
    padding: "7px 10px",
    border: "1px solid #B7DCEC",
    borderRadius: 7,
    background: "#FFFFFF",
    color: "#00466D",
    fontSize: 9,
    fontWeight: 800,
    cursor: "pointer",
  },


  applicationDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
    gap: 9,
    padding: 12,
    border: "1px solid #D4D2E6",
    borderRadius: 9,
    background: "#F8FCFF",
  },

  documentInlineNotice: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 12,
    padding: 10,
    border: "1px solid #D4D2E6",
    borderRadius: 8,
    background: "#FFFFFF",
    color: "#64748B",
    fontSize: 10,
  },

  dismissButton: {
    padding: "5px 8px",
    border: "1px solid #D4D2E6",
    borderRadius: 6,
    background: "#FFFFFF",
    color: "#00466D",
    fontSize: 9,
    cursor: "pointer",
  },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: "24px 12px",
    color: "#64748B",
    textAlign: "center",
    fontSize: 11,
  },

  emptyIcon: {
    width: 35,
    height: 35,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background: "#EAF6FD",
    color: "#00466D",
    fontSize: 16,
  },

  loadingState: {
    minHeight: 260,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    border: "1px solid #D4D2E6",
    borderRadius: 13,
    background: "#FFFFFF",
    color: "#64748B",
    fontSize: 11,
  },

  loadingCircle: {
    width: 29,
    height: 29,
    border: "3px solid #DDEFF8",
    borderTopColor: "#00466D",
    borderRadius: "50%",
  },
};