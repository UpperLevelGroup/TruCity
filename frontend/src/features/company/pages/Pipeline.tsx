import React, {
  useEffect,
  useMemo,
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

function formatDate(value?: string | null): string {
  if (!value) {
    return "Not provided";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

function formatVerificationStatus(
  value?: string | null
): string {
  if (!value) {
    return "Not verified";
  }

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function Pipeline() {
  const [pipeline, setPipeline] =
    useState<CompanyPipelineCandidate[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [updatingApplication, setUpdatingApplication] =
    useState<string | null>(null);

  const [viewingCandidateId, setViewingCandidateId] =
    useState<string | null>(null);

  const [selectedCandidate, setSelectedCandidate] =
    useState<CompanyCandidateDetails | null>(null);

  const [selectedPipelineCandidate, setSelectedPipelineCandidate] =
    useState<CompanyPipelineCandidate | null>(null);

  const [selectedDocument, setSelectedDocument] = useState<
    CompanyCandidateDetails["media"]["documents"][number] | null
  >(null);

  const [expandedGroups, setExpandedGroups] =
    useState<string[]>([]);

  const [activeView, setActiveView] = useState<
    | "applicants"
    | "shortlisted"
    | "interviewing"
    | "offered"
    | "rejected"
  >("applicants");

  useEffect(() => {
    let mounted = true;

    const loadPipeline = async () => {
      try {
        setLoading(true);

        const pipelineData =
          await companyService.getPipeline();

        if (!mounted) {
          return;
        }

        setPipeline(
          Array.isArray(pipelineData)
            ? pipelineData
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load recruitment pipeline:",
          error
        );

        if (mounted) {
          setPipeline([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPipeline();

    return () => {
      mounted = false;
    };
  }, []);

  const applicantCandidates = useMemo(
    () =>
      pipeline.filter(
        (candidate) => candidate.stage === "sourced"
      ),
    [pipeline]
  );

  const shortlistedCandidates = useMemo(
    () =>
      pipeline.filter(
        (candidate) => candidate.stage === "shortlisted"
      ),
    [pipeline]
  );

  const interviewingCandidates = useMemo(
    () =>
      pipeline.filter(
        (candidate) => candidate.stage === "interviewing"
      ),
    [pipeline]
  );

  const offeredCandidates = useMemo(
    () =>
      pipeline.filter(
        (candidate) => candidate.stage === "offered"
      ),
    [pipeline]
  );

  const rejectedCandidates = useMemo(
    () =>
      pipeline.filter(
        (candidate) => candidate.stage === "rejected"
      ),
    [pipeline]
  );

  const activePipelineCount =
    shortlistedCandidates.length +
    interviewingCandidates.length +
    offeredCandidates.length;

  const getJobGroupKey = (
    candidate: CompanyPipelineCandidate
  ): string => {
    const jobTitle = candidate.jobTitle?.trim();

    if (jobTitle) {
      return jobTitle.toLowerCase();
    }

    return `application-${candidate.jobId || candidate.applicationId}`;
  };

  const getJobGroupLabel = (
    candidate: CompanyPipelineCandidate
  ): string =>
    candidate.jobTitle?.trim() || "Job application";

  const groupByJob = (
    candidates: CompanyPipelineCandidate[]
  ): JobGroup[] => {
    const groups = new Map<string, JobGroup>();

    candidates.forEach((candidate) => {
      const key = getJobGroupKey(candidate);
      const label = getJobGroupLabel(candidate);
      const existing = groups.get(key);

      if (existing) {
        existing.candidates.push(candidate);
        return;
      }

      groups.set(key, {
        key,
        label,
        description: `Candidates who applied for ${label}`,
        candidates: [candidate],
      });
    });

    return Array.from(groups.values()).sort((a, b) =>
      a.label.localeCompare(b.label, undefined, {
        sensitivity: "base",
      })
    );
  };

  const applicantGroups = useMemo(
    () => groupByJob(applicantCandidates),
    [applicantCandidates]
  );

  const shortlistedGroups = useMemo(
    () => groupByJob(shortlistedCandidates),
    [shortlistedCandidates]
  );

  const interviewingGroups = useMemo(
    () => groupByJob(interviewingCandidates),
    [interviewingCandidates]
  );

  const offeredGroups = useMemo(
    () => groupByJob(offeredCandidates),
    [offeredCandidates]
  );

  const rejectedGroups = useMemo(
    () => groupByJob(rejectedCandidates),
    [rejectedCandidates]
  );

  useEffect(() => {
    const keys = applicantGroups.map(
      (group) => group.key
    );

    setExpandedGroups((current) => {
      const validCurrent = current.filter((key) =>
        keys.includes(key)
      );

      const newlyAdded = keys.filter(
        (key) => !current.includes(key)
      );

      return [...validCurrent, ...newlyAdded];
    });
  }, [applicantGroups]);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((current) =>
      current.includes(groupKey)
        ? current.filter((key) => key !== groupKey)
        : [...current, groupKey]
    );
  };

  const moveCandidate = async (
    applicationId: string,
    stage: PipelineStage
  ) => {
    try {
      setUpdatingApplication(applicationId);

      const updated =
        await companyService.updatePipelineStage(
          applicationId,
          stage
        );

      const refreshedPipeline = Array.isArray(updated)
        ? updated
        : [];

      setPipeline(refreshedPipeline);

      setSelectedCandidate(null);
      setSelectedPipelineCandidate(null);
      setSelectedDocument(null);
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
      candidate.stage === "shortlisted"
        ? "sourced"
        : "shortlisted";

    await moveCandidate(
      candidate.applicationId,
      nextStage
    );
  };

  const handleInterview = async (
    candidate: CompanyPipelineCandidate
  ) => {
    await moveCandidate(
      candidate.applicationId,
      "interviewing"
    );
  };

  const handleReject = async (
    candidate: CompanyPipelineCandidate
  ) => {
    const confirmed = window.confirm(
      `Reject ${candidate.name} for "${candidate.jobTitle || "this role"}"?`
    );

    if (!confirmed) {
      return;
    }

    await moveCandidate(
      candidate.applicationId,
      "rejected"
    );
  };

  const handleOffer = async (
    candidate: CompanyPipelineCandidate
  ) => {
    const confirmed = window.confirm(
      `Make an offer to ${candidate.name} for "${candidate.jobTitle || "this role"}"?`
    );

    if (!confirmed) {
      return;
    }

    await moveCandidate(
      candidate.applicationId,
      "offered"
    );
  };

  const handleViewCandidate = async (
    candidate: CompanyPipelineCandidate
  ) => {
    setSelectedPipelineCandidate(candidate);
    setViewingCandidateId(candidate.id);
    setSelectedDocument(null);

    /*
     * Lightweight fallback shown immediately while the full
     * candidate profile is being retrieved.
     *
     * IMPORTANT:
     * This object now fully matches CandidateProfileMedia.
     * Explicit empty arrays prevent TypeScript from inferring
     * never[] and the optional media fields are initialized.
     */
    setSelectedCandidate({
      id: candidate.id,
      userId: candidate.userId || "",
      firstName: candidate.firstName || "",
      lastName: candidate.lastName || "",
      name: candidate.name,
      email: candidate.email || null,
      phone: null,
      headline: candidate.role,
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
    });

    try {
      const details = await getCandidateDetails(
        candidate.id
      );

      setSelectedCandidate(details);
    } catch (error) {
      console.error(
        "Failed to load candidate details:",
        error
      );

      window.alert(
        "The candidate's full profile could not be loaded."
      );
    } finally {
      setViewingCandidateId(null);
    }
  };

  const closeCandidateView = () => {
    if (viewingCandidateId || updatingApplication) {
      return;
    }

    setSelectedCandidate(null);
    setSelectedPipelineCandidate(null);
    setSelectedDocument(null);
  };

  const renderStageActions = (
    candidate: CompanyPipelineCandidate,
    insideView = false
  ) => {
    const isUpdating =
      updatingApplication === candidate.applicationId;

    const buttonStyle = insideView
      ? styles.modalActionButton
      : undefined;

    if (candidate.stage === "sourced") {
      return (
        <>
          <button
            type="button"
            disabled={isUpdating}
            style={{
              ...styles.shortlistButton,
              ...(buttonStyle || {}),
              ...(isUpdating ? styles.disabledButton : {}),
            }}
            onClick={() => toggleShortlist(candidate)}
          >
            {isUpdating ? "Updating..." : "Shortlist"}
          </button>

          <button
            type="button"
            disabled={isUpdating}
            style={{
              ...styles.rejectButton,
              ...(buttonStyle || {}),
              ...(isUpdating ? styles.disabledButton : {}),
            }}
            onClick={() => handleReject(candidate)}
          >
            {isUpdating ? "Updating..." : "Reject"}
          </button>
        </>
      );
    }

    if (candidate.stage === "shortlisted") {
      return (
        <>
          <button
            type="button"
            disabled={isUpdating}
            style={{
              ...styles.shortlistButton,
              ...styles.removeShortlistButton,
              ...(buttonStyle || {}),
              ...(isUpdating ? styles.disabledButton : {}),
            }}
            onClick={() => toggleShortlist(candidate)}
          >
            {isUpdating ? "Updating..." : "Remove"}
          </button>

          <button
            type="button"
            disabled={isUpdating}
            style={{
              ...styles.interviewButton,
              ...(buttonStyle || {}),
              ...(isUpdating ? styles.disabledButton : {}),
            }}
            onClick={() => handleInterview(candidate)}
          >
            {isUpdating ? "Moving..." : "Start Interview →"}
          </button>

          <button
            type="button"
            disabled={isUpdating}
            style={{
              ...styles.rejectButton,
              ...(buttonStyle || {}),
              ...(isUpdating ? styles.disabledButton : {}),
            }}
            onClick={() => handleReject(candidate)}
          >
            {isUpdating ? "Updating..." : "Reject"}
          </button>
        </>
      );
    }

    if (candidate.stage === "interviewing") {
      return (
        <>
          <button
            type="button"
            disabled={isUpdating}
            style={{
              ...styles.offerButton,
              ...(buttonStyle || {}),
              ...(isUpdating ? styles.disabledButton : {}),
            }}
            onClick={() => handleOffer(candidate)}
          >
            {isUpdating ? "Making Offer..." : "Make Offer"}
          </button>

          <button
            type="button"
            disabled={isUpdating}
            style={{
              ...styles.rejectButton,
              ...(buttonStyle || {}),
              ...(isUpdating ? styles.disabledButton : {}),
            }}
            onClick={() => handleReject(candidate)}
          >
            {isUpdating ? "Updating..." : "Reject"}
          </button>
        </>
      );
    }

    if (candidate.stage === "offered") {
      return (
        <button
          type="button"
          disabled={isUpdating}
          style={{
            ...styles.rejectButton,
            ...(buttonStyle || {}),
            ...(isUpdating ? styles.disabledButton : {}),
          }}
          onClick={() => handleReject(candidate)}
        >
          {isUpdating ? "Updating..." : "Reject"}
        </button>
      );
    }

    return null;
  };

  const renderCandidateCard = (
    candidate: CompanyPipelineCandidate,
    showActions = true
  ) => {
    const shortlistedCandidate =
      candidate.stage === "shortlisted";

    const isUpdating =
      updatingApplication ===
      candidate.applicationId;

    const isViewing =
      viewingCandidateId === candidate.id;

    return (
      <div
        key={candidate.applicationId}
        style={styles.candidateCard}
      >
        <div style={styles.cardTop}>
          <div style={styles.avatar}>
            {candidate.name
              .charAt(0)
              .toUpperCase()}
          </div>

          <div style={styles.identity}>
            <div style={styles.nameRow}>
              <h3 style={styles.name}>
                {candidate.name}
              </h3>

              {candidate.verified && (
                <span
                  style={styles.verified}
                  title="Verified candidate"
                >
                  ✓
                </span>
              )}
            </div>

            <p style={styles.role}>
              {candidate.role}
            </p>

            {candidate.jobTitle && (
              <p style={styles.appliedJob}>
                Applied for:{" "}
                <strong>
                  {candidate.jobTitle}
                </strong>
              </p>
            )}
          </div>
        </div>

        <div style={styles.details}>
          <span style={styles.category}>
            {candidate.category}
          </span>

          <span style={styles.experience}>
            {candidate.experience}{" "}
            {candidate.experience === 1
              ? "year"
              : "years"}{" "}
            experience
          </span>
        </div>

        <div style={styles.skills}>
          {candidate.skills
            .slice(0, 4)
            .map((skill) => (
              <span
                key={skill}
                style={styles.skill}
              >
                {skill}
              </span>
            ))}
        </div>

        <div style={styles.cardFooter}>
          <div>
            {candidate.stage ===
            "rejected" ? (
              <span style={styles.rejectedBadge}>
                ✕ Rejected
              </span>
            ) : candidate.stage ===
              "offered" ? (
              <span
                style={
                  styles.shortlistedBadge
                }
              >
                ✓ Offer Stage
              </span>
            ) : candidate.stage ===
              "interviewing" ? (
              <span
                style={
                  styles.shortlistedBadge
                }
              >
                ✓ Interviewing
              </span>
            ) : shortlistedCandidate ? (
              <span
                style={
                  styles.shortlistedBadge
                }
              >
                ✓ Shortlisted
              </span>
            ) : (
              <span style={styles.reviewBadge}>
                Needs review
              </span>
            )}
          </div>

          {showActions && (
            <div style={styles.cardActions}>
              <button
                type="button"
                disabled={Boolean(
                  isUpdating ||
                  viewingCandidateId
                )}
                style={{
                  ...styles.viewButton,
                  ...(isViewing
                    ? styles.disabledButton
                    : {}),
                }}
                onClick={() =>
                  handleViewCandidate(candidate)
                }
              >
                {isViewing
                  ? "Loading..."
                  : "View"}
              </button>

              {renderStageActions(candidate)}
            </div>
          )}
        </div>

        {candidate.stage === "sourced" && (
          <div style={styles.cardHint}>
            Review the candidate against the
            requirements of this role, then
            view, shortlist or reject the
            application.
          </div>
        )}

        {candidate.stage === "shortlisted" && (
          <div style={styles.cardHint}>
            This candidate is ready for the
            interview stage. Open View to inspect
            the full candidate profile.
          </div>
        )}

        {candidate.stage === "interviewing" && (
          <div style={styles.cardHint}>
            This candidate is currently being
            assessed. Open View to review their
            qualifications and work history.
          </div>
        )}

        {candidate.stage === "rejected" && (
          <div style={styles.cardHint}>
            This application was rejected and is
            retained here for review.
          </div>
        )}

        <div style={styles.applicationMeta}>
          <span>
            Application:{" "}
            {candidate.applicationId.slice(0, 8)}
            ...
          </span>

          {candidate.appliedAt && (
            <span>
              {formatDate(candidate.appliedAt)}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderGroupList = (
    groups: JobGroup[],
    groupBadge: string,
    collapsible: boolean,
    showActions = true
  ) => {
    if (groups.length === 0) {
      return (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>✓</div>

          <h3>No applications</h3>

          <p>
            There are no applications in this
            stage yet.
          </p>
        </div>
      );
    }

    return (
      <div style={styles.groups}>
        {groups.map((group) => {
          const isExpanded =
            expandedGroups.includes(group.key);

          return (
            <div
              key={group.key}
              style={styles.group}
            >
              {collapsible ? (
                <button
                  type="button"
                  style={styles.groupHeader}
                  onClick={() =>
                    toggleGroup(group.key)
                  }
                >
                  <div
                    style={
                      styles.groupHeaderLeft
                    }
                  >
                    <div style={styles.groupIcon}>
                      {group.label
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <div
                        style={
                          styles.groupTitleRow
                        }
                      >
                        <h3
                          style={
                            styles.groupTitle
                          }
                        >
                          {group.label}
                        </h3>

                        <span
                          style={
                            styles.groupCount
                          }
                        >
                          {group.candidates.length}
                        </span>
                      </div>

                      <p
                        style={
                          styles.groupDescription
                        }
                      >
                        {group.description}
                      </p>
                    </div>
                  </div>

                  <div
                    style={
                      styles.groupHeaderRight
                    }
                  >
                    <span
                      style={
                        groupBadge ===
                        "rejected"
                          ? styles.rejectedGroupBadge
                          : styles.groupShortlistBadge
                      }
                    >
                      {group.candidates.length}{" "}
                      {groupBadge}
                    </span>

                    <span
                      style={{
                        ...styles.expandIcon,
                        transform:
                          isExpanded
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                      }}
                    >
                      ↓
                    </span>
                  </div>
                </button>
              ) : (
                <div
                  style={
                    styles.simpleGroupHeader
                  }
                >
                  <div>
                    <h3
                      style={
                        styles.groupTitle
                      }
                    >
                      {group.label}
                    </h3>

                    <p
                      style={
                        styles.groupDescription
                      }
                    >
                      {group.description}
                    </p>
                  </div>

                  <span
                    style={
                      groupBadge === "rejected"
                        ? styles.rejectedGroupBadge
                        : styles.groupShortlistBadge
                    }
                  >
                    {group.candidates.length}{" "}
                    {groupBadge}
                  </span>
                </div>
              )}

              {(!collapsible || isExpanded) && (
                <div style={styles.groupBody}>
                  {group.candidates.map(
                    (candidate) =>
                      renderCandidateCard(
                        candidate,
                        showActions
                      )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>
            RECRUITMENT MANAGEMENT
          </div>

          <h1 style={styles.title}>
            Recruitment Pipeline
          </h1>

          <p style={styles.subtitle}>
            Review applications by the actual
            role they were submitted for,
            inspect candidate profiles, shortlist
            candidates, interview them, and
            reject applications when needed.
          </p>
        </div>

        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <span style={styles.summaryNumber}>
              {applicantCandidates.length}
            </span>

            <span style={styles.summaryLabel}>
              Applicants
            </span>
          </div>

          <div
            style={{
              ...styles.summaryCard,
              ...styles.summaryCardYellow,
            }}
          >
            <span style={styles.summaryNumber}>
              {shortlistedCandidates.length}
            </span>

            <span style={styles.summaryLabel}>
              Shortlisted
            </span>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryNumber}>
              {activePipelineCount}
            </span>

            <span style={styles.summaryLabel}>
              In Pipeline
            </span>
          </div>
        </div>
      </div>

      <div style={styles.workflow}>
        <div
          style={{
            ...styles.workflowStep,
            ...styles.workflowActive,
          }}
        >
          <span style={styles.workflowNumber}>1</span>

          <div>
            <strong>Review Applicants</strong>
            <span>
              Grouped by the role they applied for
            </span>
          </div>
        </div>

        <span style={styles.workflowArrow}>→</span>

        <div style={styles.workflowStep}>
          <span style={styles.workflowNumber}>2</span>

          <div>
            <strong>Shortlist</strong>
            <span>
              Select candidates to interview
            </span>
          </div>
        </div>

        <span style={styles.workflowArrow}>→</span>

        <div style={styles.workflowStep}>
          <span style={styles.workflowNumber}>3</span>

          <div>
            <strong>Interview</strong>
            <span>
              Assess shortlisted candidates
            </span>
          </div>
        </div>

        <span style={styles.workflowArrow}>→</span>

        <div style={styles.workflowStep}>
          <span style={styles.workflowNumber}>4</span>

          <div>
            <strong>Offer</strong>
            <span>
              Select successful candidates
            </span>
          </div>
        </div>
      </div>

      <div style={styles.viewTabs}>
        <button
          type="button"
          style={{
            ...styles.viewTab,
            ...(activeView === "applicants"
              ? styles.activeViewTab
              : {}),
          }}
          onClick={() =>
            setActiveView("applicants")
          }
        >
          Applicants

          <span style={styles.tabCount}>
            {applicantCandidates.length}
          </span>
        </button>

        <button
          type="button"
          style={{
            ...styles.viewTab,
            ...(activeView === "shortlisted"
              ? styles.activeViewTab
              : {}),
          }}
          onClick={() =>
            setActiveView("shortlisted")
          }
        >
          Shortlist

          <span
            style={{
              ...styles.tabCount,
              ...styles.yellowTabCount,
            }}
          >
            {shortlistedCandidates.length}
          </span>
        </button>

        <button
          type="button"
          style={{
            ...styles.viewTab,
            ...(activeView === "interviewing"
              ? styles.activeViewTab
              : {}),
          }}
          onClick={() =>
            setActiveView("interviewing")
          }
        >
          Interviews

          <span style={styles.tabCount}>
            {interviewingCandidates.length}
          </span>
        </button>

        <button
          type="button"
          style={{
            ...styles.viewTab,
            ...(activeView === "offered"
              ? styles.activeViewTab
              : {}),
          }}
          onClick={() =>
            setActiveView("offered")
          }
        >
          Offers

          <span style={styles.tabCount}>
            {offeredCandidates.length}
          </span>
        </button>

        <button
          type="button"
          style={{
            ...styles.viewTab,
            ...(activeView === "rejected"
              ? styles.activeViewTab
              : {}),
          }}
          onClick={() =>
            setActiveView("rejected")
          }
        >
          Rejects

          <span
            style={{
              ...styles.tabCount,
              ...styles.rejectedTabCount,
            }}
          >
            {rejectedCandidates.length}
          </span>
        </button>
      </div>

      {loading ? (
        <div style={styles.loadingCard}>
          <div style={styles.loadingCircle} />
          <p>Loading applicants...</p>
        </div>
      ) : (
        <>
          {activeView === "applicants" && (
            <div>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>
                    Applicants by job
                  </h2>

                  <p
                    style={
                      styles.sectionDescription
                    }
                  >
                    Each group is created from the
                    actual job the candidate applied for.
                  </p>
                </div>

                <div style={styles.sectionCount}>
                  {applicantGroups.length} groups
                </div>
              </div>

              {renderGroupList(
                applicantGroups,
                "applicants",
                true,
                true
              )}
            </div>
          )}

          {activeView === "shortlisted" && (
            <div>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>
                    Shortlisted Candidates
                  </h2>

                  <p
                    style={
                      styles.sectionDescription
                    }
                  >
                    Open View to inspect the selected
                    candidate's full profile.
                  </p>
                </div>

                <div
                  style={
                    styles.shortlistHeaderBadge
                  }
                >
                  {shortlistedCandidates.length} ready
                </div>
              </div>

              {renderGroupList(
                shortlistedGroups,
                "shortlisted",
                false,
                true
              )}
            </div>
          )}

          {activeView === "interviewing" && (
            <div>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>
                    Candidates in Interview
                  </h2>

                  <p
                    style={
                      styles.sectionDescription
                    }
                  >
                    Review candidate history while
                    assessing interview-stage applications.
                  </p>
                </div>

                <div style={styles.sectionCount}>
                  {interviewingCandidates.length} interviewing
                </div>
              </div>

              {renderGroupList(
                interviewingGroups,
                "interviewing",
                false,
                true
              )}
            </div>
          )}

          {activeView === "offered" && (
            <div>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>
                    Offer Stage
                  </h2>

                  <p
                    style={
                      styles.sectionDescription
                    }
                  >
                    Candidates who have progressed through
                    interviews and are ready for an offer.
                  </p>
                </div>

                <div style={styles.sectionCount}>
                  {offeredCandidates.length} offers
                </div>
              </div>

              {renderGroupList(
                offeredGroups,
                "offers",
                false,
                true
              )}
            </div>
          )}

          {activeView === "rejected" && (
            <div>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>
                    Rejected Candidates
                  </h2>

                  <p
                    style={
                      styles.sectionDescription
                    }
                  >
                    Rejected applications remain available
                    here for review.
                  </p>
                </div>

                <div
                  style={
                    styles.rejectedHeaderBadge
                  }
                >
                  {rejectedCandidates.length} rejected
                </div>
              </div>

              {renderGroupList(
                rejectedGroups,
                "rejected",
                false,
                false
              )}
            </div>
          )}
        </>
      )}

      {selectedCandidate && (
        <div
          style={styles.modalOverlay}
          onClick={closeCandidateView}
        >
          <div
            style={styles.modal}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div style={styles.modalHeader}>
              <div style={styles.modalIdentity}>
                <div style={styles.modalAvatar}>
                  {selectedCandidate.media.facePhoto ? (
                    <img
                      src={
                        selectedCandidate.media.facePhoto
                      }
                      alt={`${selectedCandidate.name} profile`}
                      style={
                        styles.modalAvatarImage
                      }
                    />
                  ) : (
                    selectedCandidate.name
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>

                <div>
                  <div style={styles.modalEyebrow}>
                    CANDIDATE PROFILE
                  </div>

                  <h2 style={styles.modalTitle}>
                    {selectedCandidate.name}
                  </h2>

                  <p style={styles.modalRole}>
                    {selectedCandidate.headline ||
                      "Professional"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                style={styles.modalCloseButton}
                onClick={closeCandidateView}
                disabled={Boolean(
                  viewingCandidateId
                )}
              >
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              {viewingCandidateId && (
                <div style={styles.detailLoading}>
                  Loading full candidate profile…
                </div>
              )}

              {/* =========================================================
                  CANDIDATE MEDIA
                  Order:
                  1. Intro Reel
                  2. Profile Photo
                  3. Full Body Photo
                  ========================================================= */}
              <section
                style={{
                  ...styles.detailSection,
                  marginTop: 0,
                }}
              >
                <div
                  style={
                    styles.detailSectionHeader
                  }
                >
                  <h3
                    style={
                      styles.detailSectionTitle
                    }
                  >
                    Candidate Media
                  </h3>

                  <span
                    style={
                      styles.detailCountBadge
                    }
                  >
                    {selectedCandidate.media.reelMeta
                      ?.dataUrl
                      ? "Reel"
                      : "No reel"}
                  </span>
                </div>

                <div style={styles.mediaCardWide}>
                  <div
                    style={
                      styles.mediaCardHeader
                    }
                  >
                    <div>
                      <span
                        style={
                          styles.mediaCardTitle
                        }
                      >
                        Intro video / reel
                      </span>

                      <span style={styles.mediaMeta}>
                        {selectedCandidate.media
                          .reelMeta?.fileName ||
                          "No intro reel uploaded"}
                      </span>
                    </div>

                    <span
                      style={
                        selectedCandidate.media
                          .reelMeta?.dataUrl
                          ? styles.mediaPresent
                          : styles.mediaMissing
                      }
                    >
                      {selectedCandidate.media
                        .reelMeta?.dataUrl
                        ? "Uploaded"
                        : "Not uploaded"}
                    </span>
                  </div>

                  {selectedCandidate.media.reelMeta
                    ?.dataUrl ? (
                    <video
                      src={
                        selectedCandidate.media.reelMeta
                          .dataUrl
                      }
                      controls
                      playsInline
                      style={styles.reelPreview}
                    />
                  ) : (
                    <div
                      style={
                        styles.mediaPlaceholder
                      }
                    >
                      The candidate has not uploaded an
                      introduction video yet.
                    </div>
                  )}
                </div>

                <div
                  style={{
                    ...styles.mediaOverviewGrid,
                    marginTop: "12px",
                  }}
                >
                  <div style={styles.mediaCard}>
                    <div
                      style={
                        styles.mediaCardHeader
                      }
                    >
                      <span
                        style={
                          styles.mediaCardTitle
                        }
                      >
                        Profile photo
                      </span>

                      <span
                        style={
                          selectedCandidate.media
                            .facePhoto
                            ? styles.mediaPresent
                            : styles.mediaMissing
                        }
                      >
                        {selectedCandidate.media
                          .facePhoto
                          ? "Uploaded"
                          : "Not uploaded"}
                      </span>
                    </div>

                    {selectedCandidate.media
                      .facePhoto ? (
                      <img
                        src={
                          selectedCandidate.media
                            .facePhoto
                        }
                        alt={`${selectedCandidate.name} profile`}
                        style={
                          styles.profilePhotoPreview
                        }
                      />
                    ) : (
                      <div
                        style={
                          styles.mediaPlaceholder
                        }
                      >
                        No profile photo uploaded.
                      </div>
                    )}
                  </div>

                  <div style={styles.mediaCard}>
                    <div
                      style={
                        styles.mediaCardHeader
                      }
                    >
                      <span
                        style={
                          styles.mediaCardTitle
                        }
                      >
                        Full body photo
                      </span>

                      <span
                        style={
                          selectedCandidate.media
                            .fullBodyPhoto
                            ? styles.mediaPresent
                            : styles.mediaMissing
                        }
                      >
                        {selectedCandidate.media
                          .fullBodyPhoto
                          ? "Uploaded"
                          : "Not uploaded"}
                      </span>
                    </div>

                    {selectedCandidate.media
                      .fullBodyPhoto ? (
                      <img
                        src={
                          selectedCandidate.media
                            .fullBodyPhoto
                        }
                        alt={`${selectedCandidate.name} full body`}
                        style={
                          styles.fullBodyPreview
                        }
                      />
                    ) : (
                      <div
                        style={
                          styles.mediaPlaceholder
                        }
                      >
                        No full body photo uploaded.
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <div style={styles.detailGrid}>
                <div style={styles.detailCard}>
                  <span style={styles.detailLabel}>
                    Location
                  </span>

                  <strong style={styles.detailValue}>
                    {selectedCandidate.location ||
                      "Not provided"}
                  </strong>
                </div>

                <div style={styles.detailCard}>
                  <span style={styles.detailLabel}>
                    Email
                  </span>

                  <strong style={styles.detailValue}>
                    {selectedCandidate.email ||
                      "Not provided"}
                  </strong>
                </div>

                <div style={styles.detailCard}>
                  <span style={styles.detailLabel}>
                    Phone
                  </span>

                  <strong style={styles.detailValue}>
                    {selectedCandidate.phone ||
                      "Not provided"}
                  </strong>
                </div>

                <div style={styles.detailCard}>
                  <span style={styles.detailLabel}>
                    Experience
                  </span>

                  <strong style={styles.detailValue}>
                    {selectedCandidate.yearsExperience}{" "}
                    {selectedCandidate.yearsExperience ===
                    1
                      ? "year"
                      : "years"}
                  </strong>
                </div>

                <div style={styles.detailCard}>
                  <span style={styles.detailLabel}>
                    Verification
                  </span>

                  <strong style={styles.detailValue}>
                    {selectedCandidate.verified
                      ? "Verified"
                      : "Not verified"}
                  </strong>
                </div>

                <div style={styles.detailCard}>
                  <span style={styles.detailLabel}>
                    Profile completion
                  </span>

                  <strong style={styles.detailValue}>
                    {selectedCandidate.profileCompletion !=
                    null
                      ? `${selectedCandidate.profileCompletion}%`
                      : "Not available"}
                  </strong>
                </div>
              </div>

              <section style={styles.detailSection}>
                <h3 style={styles.detailSectionTitle}>
                  Professional Summary
                </h3>

                <p style={styles.detailParagraph}>
                  {selectedCandidate.bio ||
                    "No professional summary has been provided."}
                </p>
              </section>

              <section style={styles.detailSection}>
                <h3 style={styles.detailSectionTitle}>
                  Skills
                </h3>

                {selectedCandidate.skills.length >
                0 ? (
                  <div style={styles.detailSkills}>
                    {selectedCandidate.skills.map(
                      (skill) => (
                        <span
                          key={`${skill.name}-${skill.yearsUsed ?? "x"}`}
                          style={
                            styles.detailSkill
                          }
                        >
                          <strong>
                            {skill.name}
                          </strong>

                          {skill.proficiency && (
                            <small>
                              {skill.proficiency}
                            </small>
                          )}

                          {skill.yearsUsed != null && (
                            <small>
                              {skill.yearsUsed}{" "}
                              {skill.yearsUsed === 1
                                ? "year"
                                : "years"}
                            </small>
                          )}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p style={styles.detailMuted}>
                    No skills provided.
                  </p>
                )}
              </section>

              <section style={styles.detailSection}>
                <div
                  style={
                    styles.detailSectionHeader
                  }
                >
                  <h3
                    style={
                      styles.detailSectionTitle
                    }
                  >
                    Qualifications
                  </h3>

                  <span
                    style={
                      styles.detailCountBadge
                    }
                  >
                    {
                      selectedCandidate
                        .qualifications.length
                    }
                  </span>
                </div>

                {selectedCandidate.qualifications
                  .length > 0 ? (
                  <div style={styles.timelineList}>
                    {selectedCandidate.qualifications.map(
                      (qualification) => (
                        <div
                          key={qualification.id}
                          style={
                            styles.timelineItem
                          }
                        >
                          <div
                            style={
                              styles.timelineDot
                            }
                          />

                          <div
                            style={
                              styles.timelineContent
                            }
                          >
                            <strong
                              style={
                                styles.timelineTitle
                              }
                            >
                              {qualification.qualificationName ||
                                "Qualification"}
                            </strong>

                            <div
                              style={
                                styles.timelineMeta
                              }
                            >
                              {qualification.institution ||
                                "Institution not provided"}
                            </div>

                            {qualification.fieldOfStudy && (
                              <div
                                style={
                                  styles.timelineMeta
                                }
                              >
                                Field:{" "}
                                {
                                  qualification.fieldOfStudy
                                }
                              </div>
                            )}

                            {(qualification.startYear ||
                              qualification.completionYear) && (
                              <div
                                style={
                                  styles.timelineMeta
                                }
                              >
                                {qualification.startYear ||
                                  "—"}{" "}
                                –{" "}
                                {qualification.completionYear ||
                                  "Present"}
                              </div>
                            )}

                            {qualification.verificationStatus && (
                              <span
                                style={
                                  styles.timelineStatus
                                }
                              >
                                {formatVerificationStatus(
                                  qualification.verificationStatus
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p style={styles.detailMuted}>
                    No qualifications have been recorded.
                  </p>
                )}
              </section>

              <section style={styles.detailSection}>
                <div
                  style={
                    styles.detailSectionHeader
                  }
                >
                  <h3
                    style={
                      styles.detailSectionTitle
                    }
                  >
                    Work Experience
                  </h3>

                  <span
                    style={
                      styles.detailCountBadge
                    }
                  >
                    {
                      selectedCandidate
                        .experienceHistory.length
                    }
                  </span>
                </div>

                {selectedCandidate.experienceHistory
                  .length > 0 ? (
                  <div style={styles.timelineList}>
                    {selectedCandidate.experienceHistory.map(
                      (experience) => (
                        <div
                          key={experience.id}
                          style={
                            styles.timelineItem
                          }
                        >
                          <div
                            style={
                              styles.timelineDot
                            }
                          />

                          <div
                            style={
                              styles.timelineContent
                            }
                          >
                            <strong
                              style={
                                styles.timelineTitle
                              }
                            >
                              {experience.jobTitle ||
                                "Position"}
                            </strong>

                            <div
                              style={
                                styles.timelineMeta
                              }
                            >
                              {experience.companyName ||
                                "Company not provided"}
                            </div>

                            {(experience.startDate ||
                              experience.endDate) && (
                              <div
                                style={
                                  styles.timelineMeta
                                }
                              >
                                {formatDate(
                                  experience.startDate
                                )}{" "}
                                –{" "}
                                {experience.endDate
                                  ? formatDate(
                                      experience.endDate
                                    )
                                  : "Present"}
                              </div>
                            )}

                            {experience.description && (
                              <p
                                style={
                                  styles.timelineDescription
                                }
                              >
                                {
                                  experience.description
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p style={styles.detailMuted}>
                    No work experience has been recorded.
                  </p>
                )}
              </section>

              <section style={styles.detailSection}>
                <div
                  style={
                    styles.detailSectionHeader
                  }
                >
                  <h3
                    style={
                      styles.detailSectionTitle
                    }
                  >
                    Application
                  </h3>

                  <span
                    style={
                      styles.applicationStageBadge
                    }
                  >
                    {selectedPipelineCandidate?.stage ||
                      "sourced"}
                  </span>
                </div>

                <div
                  style={
                    styles.applicationContext
                  }
                >
                  <div>
                    <span style={styles.detailLabel}>
                      Applied role
                    </span>

                    <strong
                      style={styles.detailValue}
                    >
                      {selectedPipelineCandidate?.jobTitle ||
                        "Job application"}
                    </strong>
                  </div>

                  <div>
                    <span style={styles.detailLabel}>
                      Applied
                    </span>

                    <strong
                      style={styles.detailValue}
                    >
                      {formatDate(
                        selectedPipelineCandidate?.appliedAt
                      )}
                    </strong>
                  </div>

                  <div>
                    <span style={styles.detailLabel}>
                      Application ID
                    </span>

                    <strong
                      style={styles.detailValue}
                    >
                      {selectedPipelineCandidate?.applicationId ||
                        "Not available"}
                    </strong>
                  </div>
                </div>
              </section>

              <section style={styles.detailSection}>
                <div
                  style={
                    styles.detailSectionHeader
                  }
                >
                  <h3
                    style={
                      styles.detailSectionTitle
                    }
                  >
                    Candidate Documents & Gallery
                  </h3>

                  <span
                    style={
                      styles.detailCountBadge
                    }
                  >
                    {
                      selectedCandidate.media
                        .documents.length
                    }{" "}
                    docs
                  </span>
                </div>

                <div style={styles.mediaCardWide}>
                  <div
                    style={
                      styles.mediaCardHeader
                    }
                  >
                    <div>
                      <span
                        style={
                          styles.mediaCardTitle
                        }
                      >
                        Uploaded documents
                      </span>

                      <span style={styles.mediaMeta}>
                        CV, certificates, identification and other
                        candidate documents will appear here as
                        they are uploaded.
                      </span>
                    </div>

                    <span
                      style={
                        styles.detailCountBadge
                      }
                    >
                      {
                        selectedCandidate.media
                          .documents.length
                      }
                    </span>
                  </div>

                  {selectedCandidate.media.documents
                    .length > 0 ? (
                    <div
                      style={
                        styles.documentList
                      }
                    >
                      {selectedCandidate.media.documents.map(
                        (document) => (
                          <div
                            key={document.id}
                            style={
                              styles.documentCard
                            }
                          >
                            <div
                              style={
                                styles.documentIcon
                              }
                            >
                              DOC
                            </div>

                            <div
                              style={
                                styles.documentInfo
                              }
                            >
                              <strong
                                style={
                                  styles.documentName
                                }
                              >
                                {document.name ||
                                  document.fileName ||
                                  "Candidate document"}
                              </strong>

                              <span
                                style={
                                  styles.documentMeta
                                }
                              >
                                {document.fileName ||
                                  "File name not provided"}
                                {document.fileSize
                                  ? ` · ${document.fileSize}`
                                  : ""}
                              </span>

                              <span
                                style={
                                  document.status
                                    ?.toLowerCase() ===
                                  "verified"
                                    ? styles.documentVerified
                                    : styles.documentPending
                                }
                              >
                                {formatVerificationStatus(
                                  document.status
                                )}
                              </span>
                            </div>

                            {document.dataUrl ? (
                              <button
                                type="button"
                                style={
                                  styles.documentViewButton
                                }
                                onClick={() =>
                                  setSelectedDocument(
                                    document
                                  )
                                }
                              >
                                View document
                              </button>
                            ) : (
                              <span
                                style={
                                  styles.detailMuted
                                }
                              >
                                File unavailable
                              </span>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div
                      style={
                        styles.mediaPlaceholder
                      }
                    >
                      No candidate documents have been uploaded
                      yet.
                    </div>
                  )}
                </div>

                <div style={styles.mediaCardWide}>
                  <div
                    style={
                      styles.mediaCardHeader
                    }
                  >
                    <div>
                      <span
                        style={
                          styles.mediaCardTitle
                        }
                      >
                        Profile gallery
                      </span>

                      <span style={styles.mediaMeta}>
                        Professional, front, side, back,
                        project and certificate images.
                      </span>
                    </div>

                    <span
                      style={
                        styles.detailCountBadge
                      }
                    >
                      {
                        selectedCandidate.media
                          .galleryImages.length
                      }
                    </span>
                  </div>

                  {selectedCandidate.media.galleryImages
                    .length > 0 ? (
                    <div
                      style={
                        styles.galleryGrid
                      }
                    >
                      {selectedCandidate.media.galleryImages.map(
                        (image) => (
                          <div
                            key={image.id}
                            style={
                              styles.galleryCard
                            }
                          >
                            <img
                              src={image.image || ""}
                              alt={
                                image.name ||
                                "Candidate gallery image"
                              }
                              style={
                                styles.galleryPreview
                              }
                            />

                            <div
                              style={
                                styles.galleryCaption
                              }
                            >
                              <strong>
                                {image.name ||
                                  "Gallery image"}
                              </strong>

                              <span>
                                {image.category ||
                                  "Uncategorised"}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div
                      style={
                        styles.mediaPlaceholder
                      }
                    >
                      No gallery images have been uploaded yet.
                    </div>
                  )}
                </div>
              </section>

              <section style={styles.detailSection}>
                <div
                  style={
                    styles.detailSectionHeader
                  }
                >
                  <h3
                    style={
                      styles.detailSectionTitle
                    }
                  >
                    Portfolio Projects
                  </h3>

                  <span
                    style={
                      styles.detailCountBadge
                    }
                  >
                    {
                      selectedCandidate.media
                        .projects.length
                    }
                  </span>
                </div>

                {selectedCandidate.media.projects
                  .length > 0 ? (
                  <div style={styles.projectGrid}>
                    {selectedCandidate.media.projects.map(
                      (project) => (
                        <article
                          key={project.id}
                          style={
                            styles.projectCard
                          }
                        >
                          <div
                            style={
                              styles.projectCardTop
                            }
                          >
                            <strong>
                              {project.name ||
                                "Portfolio project"}
                            </strong>

                            <span>
                              {project.status ||
                                "Not specified"}
                            </span>
                          </div>

                          <p>
                            {project.desc ||
                              "No project description provided."}
                          </p>

                          <small>
                            {project.tech ||
                              "Technology not specified"}
                          </small>
                        </article>
                      )
                    )}
                  </div>
                ) : (
                  <p style={styles.detailMuted}>
                    No portfolio projects have been recorded.
                  </p>
                )}
              </section>

              <section style={styles.detailSection}>
                <div
                  style={
                    styles.detailSectionHeader
                  }
                >
                  <h3
                    style={
                      styles.detailSectionTitle
                    }
                  >
                    Availability
                  </h3>
                </div>

                <div
                  style={styles.detailParagraph}
                >
                  {selectedCandidate.media
                    .preferences?.availability
                    ? formatVerificationStatus(
                        selectedCandidate.media
                          .preferences.availability
                      )
                    : "Not provided"}
                </div>
              </section>
            </div>

            <div style={styles.modalActionBar}>
              {selectedPipelineCandidate &&
                renderStageActions(
                  selectedPipelineCandidate,
                  true
                )}
            </div>

            <div style={styles.modalFooter}>
              <div>
                <span
                  style={
                    styles.modalFooterLabel
                  }
                >
                  Candidate ID
                </span>

                <span
                  style={
                    styles.modalFooterValue
                  }
                >
                  {selectedCandidate.id}
                </span>
              </div>

              <button
                type="button"
                style={
                  styles.closePrimaryButton
                }
                onClick={closeCandidateView}
                disabled={Boolean(
                  viewingCandidateId
                )}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDocument && (
        <div
          style={styles.documentOverlay}
          onClick={() =>
            setSelectedDocument(null)
          }
        >
          <div
            style={styles.documentViewer}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              style={
                styles.documentViewerHeader
              }
            >
              <div>
                <span
                  style={styles.modalEyebrow}
                >
                  DOCUMENT VIEWER
                </span>

                <h3
                  style={
                    styles.documentViewerTitle
                  }
                >
                  {selectedDocument.name ||
                    selectedDocument.fileName ||
                    "Candidate document"}
                </h3>
              </div>

              <button
                type="button"
                style={
                  styles.modalCloseButton
                }
                onClick={() =>
                  setSelectedDocument(null)
                }
                aria-label="Close document viewer"
              >
                ×
              </button>
            </div>

            <div
              style={
                styles.documentViewerBody
              }
            >
              {selectedDocument.dataUrl?.startsWith(
                "data:image/"
              ) ? (
                <img
                  src={
                    selectedDocument.dataUrl
                  }
                  alt={
                    selectedDocument.name ||
                    "Candidate document"
                  }
                  style={
                    styles.documentViewerImage
                  }
                />
              ) : (
                <iframe
                  title={
                    selectedDocument.name ||
                    "Candidate document"
                  }
                  src={
                    selectedDocument.dataUrl ||
                    "about:blank"
                  }
                  style={
                    styles.documentViewerFrame
                  }
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    maxWidth: "1400px",
    fontFamily: "Helvetica, Arial, sans-serif",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "30px",
    marginBottom: "22px",
  },

  eyebrow: {
    display: "inline-flex",
    padding: "5px 10px",
    borderRadius: "999px",
    background: "#EAF6FD",
    border: "1px solid #B7DCEC",
    color: "#00466D",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "0.8px",
  },

  title: {
    margin: "12px 0 5px",
    color: "#00273D",
    fontSize: "29px",
    fontWeight: 800,
    letterSpacing: "-0.7px",
  },

  subtitle: {
    margin: 0,
    maxWidth: "700px",
    color: "#64748B",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  summaryGrid: {
    display: "flex",
    gap: "10px",
    flexShrink: 0,
  },

  summaryCard: {
    minWidth: "105px",
    padding: "12px 15px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.90)",
    border: "1px solid rgba(148,163,184,0.20)",
    boxShadow: "0 6px 20px rgba(15,23,42,0.04)",
  },

  summaryCardYellow: {
    background: "#FFF9E6",
    border: "1px solid rgba(250,204,21,0.30)",
  },

  summaryNumber: {
    display: "block",
    color: "#00273D",
    fontSize: "21px",
    fontWeight: 700,
  },

  summaryLabel: {
    display: "block",
    marginTop: "3px",
    color: "#64748B",
    fontSize: "9px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },

  workflow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "22px",
    padding: "13px 16px",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "13px",
    boxShadow: "0 6px 20px rgba(15,23,42,0.035)",
  },

  workflowStep: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "8px",
    borderRadius: "9px",
  },

  workflowActive: {
    background: "#EAF6FD",
  },

  workflowNumber: {
    width: "27px",
    height: "27px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderRadius: "50%",
    background: "#DDEFF8",
    color: "#00466D",
    fontSize: "11px",
    fontWeight: 700,
  },

  workflowArrow: {
    color: "#D4D2E6",
    fontSize: "18px",
    fontWeight: 700,
  },

  viewTabs: {
    display: "flex",
    gap: "5px",
    padding: "5px",
    marginBottom: "20px",
    width: "fit-content",
    maxWidth: "100%",
    background: "rgba(241,245,249,0.80)",
    border: "1px solid #D4D2E6",
    borderRadius: "11px",
  },

  viewTab: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "9px 13px",
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    color: "#64748B",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer",
  },

  activeViewTab: {
    background: "#FFFFFF",
    color: "#00466D",
    boxShadow: "0 3px 10px rgba(15,23,42,0.06)",
  },

  tabCount: {
    minWidth: "19px",
    height: "19px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 5px",
    borderRadius: "6px",
    background: "#EAF6FD",
    color: "#00466D",
    fontSize: "9px",
    fontWeight: 700,
  },

  yellowTabCount: {
    background: "#FFD784",
    color: "#00466D",
  },

  rejectedTabCount: {
    background: "#FFF1F4",
    color: "#A61B3C",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "15px",
  },

  sectionTitle: {
    margin: 0,
    color: "#00273D",
    fontSize: "18px",
    fontWeight: 800,
  },

  sectionDescription: {
    margin: "4px 0 0",
    color: "#64748B",
    fontSize: "11px",
  },

  sectionCount: {
    padding: "6px 10px",
    borderRadius: "7px",
    background: "#EAF6FD",
    color: "#00466D",
    fontSize: "9px",
    fontWeight: 800,
  },

  shortlistHeaderBadge: {
    padding: "7px 11px",
    borderRadius: "8px",
    background: "#FFD784",
    border: "1px solid rgba(250,204,21,0.30)",
    color: "#00466D",
    fontSize: "9px",
    fontWeight: 800,
  },

  rejectedHeaderBadge: {
    padding: "7px 11px",
    borderRadius: "8px",
    background: "#FFF1F4",
    border: "1px solid rgba(239,68,68,0.20)",
    color: "#A61B3C",
    fontSize: "9px",
    fontWeight: 800,
  },

  groups: {
    display: "flex",
    flexDirection: "column",
    gap: "13px",
  },

  group: {
    overflow: "hidden",
    background: "rgba(255,255,255,0.86)",
    border: "1px solid rgba(148,163,184,0.20)",
    borderRadius: "14px",
    boxShadow: "0 7px 24px rgba(15,23,42,0.04)",
  },

  groupHeader: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "15px 17px",
    border: "none",
    background: "#FFFFFF",
    cursor: "pointer",
    textAlign: "left",
  },

  groupHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    minWidth: 0,
  },

  groupIcon: {
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderRadius: "10px",
    background: "#DDEFF8",
    color: "#00466D",
    fontSize: "13px",
    fontWeight: 700,
  },

  groupTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  groupTitle: {
    margin: 0,
    color: "#00273D",
    fontSize: "14px",
    fontWeight: 800,
  },

  groupCount: {
    minWidth: "20px",
    height: "20px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 6px",
    borderRadius: "6px",
    background: "#EAF6FD",
    color: "#00466D",
    fontSize: "9px",
    fontWeight: 700,
  },

  groupDescription: {
    margin: "3px 0 0",
    color: "#94A3B8",
    fontSize: "10px",
  },

  groupHeaderRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },

  groupShortlistBadge: {
    padding: "5px 8px",
    borderRadius: "6px",
    background: "#FFD784",
    color: "#00466D",
    fontSize: "9px",
    fontWeight: 800,
  },

  rejectedGroupBadge: {
    padding: "5px 8px",
    borderRadius: "6px",
    background: "#FFF1F4",
    color: "#A61B3C",
    fontSize: "9px",
    fontWeight: 800,
  },

  expandIcon: {
    display: "inline-flex",
    transition: "transform 0.2s ease",
    color: "#64748B",
    fontSize: "15px",
  },

  simpleGroupHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "15px 17px",
    borderBottom: "1px solid #E9E8F3",
  },

  groupBody: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill,minmax(300px,1fr))",
    gap: "12px",
    padding: "13px",
    background: "rgba(248,250,252,0.55)",
  },

  candidateCard: {
    minWidth: 0,
    padding: "15px",
    background: "rgba(255,255,255,0.97)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "12px",
    boxShadow: "0 5px 18px rgba(15,23,42,0.035)",
  },

  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  avatar: {
    width: "39px",
    height: "39px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderRadius: "10px",
    background: "#00466D",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: 700,
    boxShadow: "0 5px 13px rgba(29,78,216,0.15)",
  },

  identity: {
    minWidth: 0,
  },

  nameRow: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },

  name: {
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "#334155",
    fontSize: "13px",
    fontWeight: 800,
  },

  verified: {
    width: "15px",
    height: "15px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderRadius: "50%",
    background: "#FFAD01",
    color: "#00273D",
    fontSize: "8px",
    fontWeight: 700,
  },

  role: {
    margin: "3px 0 0",
    color: "#64748B",
    fontSize: "10px",
  },

  appliedJob: {
    margin: "4px 0 0",
    color: "#94A3B8",
    fontSize: "9px",
    lineHeight: 1.35,
  },

  details: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    marginTop: "13px",
  },

  category: {
    padding: "4px 7px",
    borderRadius: "6px",
    background: "#EAF6FD",
    color: "#00466D",
    fontSize: "8px",
    fontWeight: 800,
  },

  experience: {
    color: "#64748B",
    fontSize: "9px",
    fontWeight: 600,
  },

  skills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
    marginTop: "11px",
  },

  skill: {
    padding: "4px 6px",
    borderRadius: "5px",
    background: "#F8FCFF",
    border: "1px solid #D4D2E6",
    color: "#64748B",
    fontSize: "8px",
    fontWeight: 600,
  },

  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    marginTop: "13px",
    paddingTop: "11px",
    borderTop: "1px solid #E9E8F3",
  },

  reviewBadge: {
    color: "#94A3B8",
    fontSize: "9px",
    fontWeight: 700,
  },

  shortlistedBadge: {
    color: "#00466D",
    fontSize: "9px",
    fontWeight: 800,
  },

  rejectedBadge: {
    color: "#A61B3C",
    fontSize: "9px",
    fontWeight: 800,
  },

  cardActions: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  viewButton: {
    padding: "7px 9px",
    borderRadius: "7px",
    border: "1px solid #D4D2E6",
    background: "#FFFFFF",
    color: "#334155",
    fontSize: "9px",
    fontWeight: 800,
    cursor: "pointer",
  },

  shortlistButton: {
    padding: "7px 9px",
    borderRadius: "7px",
    border: "1px solid #B7DCEC",
    background: "#EAF6FD",
    color: "#00466D",
    fontSize: "9px",
    fontWeight: 800,
    cursor: "pointer",
  },

  removeShortlistButton: {
    background: "#FFFFFF",
    borderColor: "#FFD784",
    color: "#00466D",
  },

  interviewButton: {
    padding: "7px 10px",
    border: "none",
    borderRadius: "7px",
    background: "#00466D",
    color: "#FFFFFF",
    fontSize: "9px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(29,78,216,0.15)",
  },

  rejectButton: {
    padding: "7px 9px",
    borderRadius: "7px",
    border: "1px solid #FFB7C5",
    background: "#FFF1F4",
    color: "#A61B3C",
    fontSize: "9px",
    fontWeight: 800,
    cursor: "pointer",
  },

  offerButton: {
    padding: "7px 10px",
    border: "none",
    borderRadius: "7px",
    background: "#FFAD01",
    color: "#00273D",
    fontSize: "9px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(255,173,1,0.18)",
  },

  disabledButton: {
    opacity: 0.55,
    cursor: "not-allowed",
  },

  cardHint: {
    marginTop: "10px",
    padding: "7px 9px",
    borderRadius: "6px",
    background: "#F8FCFF",
    color: "#94A3B8",
    fontSize: "8px",
    lineHeight: 1.4,
  },

  applicationMeta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    marginTop: "9px",
    color: "#D4D2E6",
    fontSize: "8px",
  },

  emptyState: {
    minHeight: "270px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "35px",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "14px",
  },

  emptyIcon: {
    width: "45px",
    height: "45px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "10px",
    borderRadius: "50%",
    background: "#DDEFF8",
    color: "#00466D",
    fontSize: "19px",
    fontWeight: 700,
  },

  loadingCard: {
    minHeight: "300px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.78)",
    borderRadius: "15px",
    color: "#64748B",
  },

  loadingCircle: {
    width: "31px",
    height: "31px",
    marginBottom: "10px",
    borderRadius: "50%",
    border: "3px solid #DDEFF8",
    borderTopColor: "#00466D",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "rgba(15,23,42,0.56)",
    backdropFilter: "blur(4px)",
  },

  modal: {
    width: "min(960px,100%)",
    maxHeight: "92vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: "18px",
    background: "#FFFFFF",
    boxShadow: "0 24px 70px rgba(15,23,42,0.20)",
  },

  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    padding: "22px 24px",
    borderBottom: "1px solid #E9E8F3",
    background: "#FFFFFF",
  },

  modalIdentity: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: 0,
  },

  modalAvatar: {
    width: "54px",
    height: "54px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderRadius: "14px",
    background: "#00466D",
    color: "#FFFFFF",
    fontSize: "20px",
    fontWeight: 700,
    overflow: "hidden",
  },

  modalEyebrow: {
    color: "#00466D",
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "1px",
  },

  modalTitle: {
    margin: "4px 0 2px",
    color: "#00273D",
    fontSize: "23px",
    fontWeight: 700,
  },

  modalRole: {
    margin: 0,
    color: "#64748B",
    fontSize: "11px",
  },

  modalCloseButton: {
    width: "34px",
    height: "34px",
    flexShrink: 0,
    border: "1px solid #D4D2E6",
    borderRadius: "9px",
    background: "#FFFFFF",
    color: "#64748B",
    fontSize: "22px",
    lineHeight: 1,
    cursor: "pointer",
  },

  modalBody: {
    overflowY: "auto",
    padding: "22px 24px",
  },

  detailLoading: {
    marginBottom: "12px",
    padding: "9px 11px",
    borderRadius: "8px",
    background: "#EAF6FD",
    color: "#00466D",
    fontSize: "10px",
    fontWeight: 700,
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(180px,1fr))",
    gap: "9px",
  },

  detailCard: {
    padding: "11px 12px",
    border: "1px solid #D4D2E6",
    borderRadius: "10px",
    background: "#F8FCFF",
  },

  detailLabel: {
    display: "block",
    marginBottom: "4px",
    color: "#94A3B8",
    fontSize: "8px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },

  detailValue: {
    display: "block",
    color: "#334155",
    fontSize: "11px",
    lineHeight: 1.35,
    wordBreak: "break-word",
  },

  detailSection: {
    marginTop: "22px",
  },

  detailSectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "10px",
  },

  detailSectionTitle: {
    margin: 0,
    color: "#00273D",
    fontSize: "14px",
    fontWeight: 700,
  },

  detailCountBadge: {
    minWidth: "22px",
    height: "22px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 6px",
    borderRadius: "7px",
    background: "#EAF6FD",
    color: "#00466D",
    fontSize: "9px",
    fontWeight: 700,
  },

  detailParagraph: {
    margin: 0,
    padding: "12px 13px",
    borderRadius: "9px",
    background: "#F8FCFF",
    color: "#64748B",
    fontSize: "11px",
    lineHeight: 1.6,
  },

  detailSkills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
  },

  detailSkill: {
    display: "inline-flex",
    flexDirection: "column",
    gap: "2px",
    padding: "7px 9px",
    borderRadius: "8px",
    background: "#F8FCFF",
    border: "1px solid #D4D2E6",
    color: "#334155",
    fontSize: "9px",
  },

  detailMuted: {
    margin: 0,
    color: "#94A3B8",
    fontSize: "10px",
  },

  timelineList: {
    display: "flex",
    flexDirection: "column",
    gap: "13px",
  },

  timelineItem: {
    display: "flex",
    gap: "10px",
    padding: "12px",
    border: "1px solid #E9E8F3",
    borderRadius: "10px",
    background: "#FFFFFF",
  },

  timelineDot: {
    width: "10px",
    height: "10px",
    flexShrink: 0,
    marginTop: "4px",
    borderRadius: "50%",
    background: "#00466D",
    boxShadow: "0 0 0 4px #EAF6FD",
  },

  timelineContent: {
    minWidth: 0,
  },

  timelineTitle: {
    display: "block",
    color: "#334155",
    fontSize: "11px",
  },

  timelineMeta: {
    marginTop: "3px",
    color: "#64748B",
    fontSize: "9px",
  },

  timelineStatus: {
    display: "inline-flex",
    marginTop: "7px",
    padding: "4px 6px",
    borderRadius: "6px",
    background: "#FFD784",
    color: "#00466D",
    fontSize: "8px",
    fontWeight: 800,
  },

  timelineDescription: {
    margin: "8px 0 0",
    color: "#64748B",
    fontSize: "10px",
    lineHeight: 1.5,
  },

  modalAvatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "14px",
  },

  applicationStageBadge: {
    padding: "5px 8px",
    borderRadius: "7px",
    background: "#EAF6FD",
    color: "#00466D",
    fontSize: "8px",
    fontWeight: 800,
    textTransform: "uppercase",
  },

  applicationContext: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(180px,1fr))",
    gap: "9px",
    padding: "11px 12px",
    border: "1px solid #D4D2E6",
    borderRadius: "10px",
    background: "#F8FCFF",
  },

  mediaOverviewGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(240px,1fr))",
    gap: "12px",
  },

  mediaCard: {
    minWidth: 0,
    padding: "12px",
    border: "1px solid #D4D2E6",
    borderRadius: "11px",
    background: "#FFFFFF",
  },

  mediaCardWide: {
    marginTop: "12px",
    padding: "12px",
    border: "1px solid #D4D2E6",
    borderRadius: "11px",
    background: "#FFFFFF",
  },

  mediaCardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "10px",
  },

  mediaCardTitle: {
    display: "block",
    color: "#334155",
    fontSize: "10px",
    fontWeight: 800,
  },

  mediaMeta: {
    display: "block",
    marginTop: "3px",
    color: "#94A3B8",
    fontSize: "8px",
    lineHeight: 1.4,
  },

  mediaPresent: {
    padding: "4px 6px",
    borderRadius: "6px",
    background: "#E9FFF4",
    color: "#16804A",
    fontSize: "8px",
    fontWeight: 800,
  },

  mediaMissing: {
    padding: "4px 6px",
    borderRadius: "6px",
    background: "#F1F5F9",
    color: "#94A3B8",
    fontSize: "8px",
    fontWeight: 800,
  },

  mediaPlaceholder: {
    minHeight: "100px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "18px",
    borderRadius: "9px",
    background: "#F8FCFF",
    color: "#94A3B8",
    fontSize: "9px",
    textAlign: "center",
  },

  profilePhotoPreview: {
    width: "100%",
    height: "190px",
    objectFit: "cover",
    borderRadius: "9px",
    background: "#F1F5F9",
  },

  fullBodyPreview: {
    width: "100%",
    height: "190px",
    objectFit: "contain",
    borderRadius: "9px",
    background: "#F8FCFF",
  },

  reelPreview: {
    width: "100%",
    maxHeight: "340px",
    borderRadius: "9px",
    background: "#00273D",
  },

  documentList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  documentCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    border: "1px solid #E9E8F3",
    borderRadius: "9px",
    background: "#F8FCFF",
  },

  documentIcon: {
    width: "34px",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderRadius: "8px",
    background: "#DDEFF8",
    color: "#00466D",
    fontSize: "8px",
    fontWeight: 800,
  },

  documentInfo: {
    minWidth: 0,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },

  documentName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: "#334155",
    fontSize: "10px",
  },

  documentMeta: {
    color: "#94A3B8",
    fontSize: "8px",
  },

  documentVerified: {
    width: "fit-content",
    padding: "3px 5px",
    borderRadius: "5px",
    background: "#E9FFF4",
    color: "#16804A",
    fontSize: "7px",
    fontWeight: 800,
  },

  documentPending: {
    width: "fit-content",
    padding: "3px 5px",
    borderRadius: "5px",
    background: "#FFF9E6",
    color: "#8A6500",
    fontSize: "7px",
    fontWeight: 800,
  },

  documentViewButton: {
    padding: "7px 9px",
    border: "1px solid #B7DCEC",
    borderRadius: "7px",
    background: "#FFFFFF",
    color: "#00466D",
    fontSize: "8px",
    fontWeight: 800,
    cursor: "pointer",
  },

  galleryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill,minmax(130px,1fr))",
    gap: "9px",
  },

  galleryCard: {
    overflow: "hidden",
    border: "1px solid #E9E8F3",
    borderRadius: "9px",
    background: "#F8FCFF",
  },

  galleryPreview: {
    width: "100%",
    height: "120px",
    objectFit: "cover",
    display: "block",
  },

  galleryCaption: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    padding: "7px",
  },

  projectGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "9px",
  },

  projectCard: {
    padding: "11px",
    border: "1px solid #E9E8F3",
    borderRadius: "9px",
    background: "#FFFFFF",
  },

  projectCardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
  },

  documentOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "rgba(15,23,42,0.72)",
    backdropFilter: "blur(4px)",
  },

  documentViewer: {
    width: "min(1050px,100%)",
    height: "min(90vh,800px)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: "16px",
    background: "#FFFFFF",
    boxShadow: "0 24px 70px rgba(15,23,42,0.28)",
  },

  documentViewerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    padding: "15px 18px",
    borderBottom: "1px solid #E9E8F3",
  },

  documentViewerTitle: {
    margin: "4px 0 0",
    color: "#00273D",
    fontSize: "16px",
    fontWeight: 800,
  },

  documentViewerBody: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px",
    background: "#F1F5F9",
  },

  documentViewerImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    borderRadius: "8px",
    background: "#FFFFFF",
  },

  documentViewerFrame: {
    width: "100%",
    height: "100%",
    border: "none",
    borderRadius: "8px",
    background: "#FFFFFF",
  },

  modalActionBar: {
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: "8px",
    padding: "14px 24px",
    borderTop: "1px solid #E9E8F3",
    background: "#FFFFFF",
  },

  modalActionButton: {
    minWidth: "105px",
    padding: "9px 12px",
    fontSize: "10px",
  },

  modalFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    padding: "14px 24px",
    borderTop: "1px solid #E9E8F3",
    background: "#F8FCFF",
  },

  modalFooterLabel: {
    display: "block",
    color: "#94A3B8",
    fontSize: "8px",
    fontWeight: 800,
    textTransform: "uppercase",
  },

  modalFooterValue: {
    display: "block",
    marginTop: "2px",
    color: "#64748B",
    fontSize: "9px",
  },

  closePrimaryButton: {
    padding: "9px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#00466D",
    color: "#FFFFFF",
    fontSize: "10px",
    fontWeight: 800,
    cursor: "pointer",
  },
};