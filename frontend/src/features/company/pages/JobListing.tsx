import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { companyService } from "../company.service";

import type {
  CompanyJob,
  EmploymentType,
  WorkplaceType,
  CompanyJobRequest,
} from "../company.types";


const DEPARTMENTS = [
  "Engineering",
  "Finance & Accounting",
  "Legal & Risk",
  "Human Resources",
  "Operations",
  "Sales & Marketing",
  "Information Technology",
  "Customer Service",
  "Other",
];

const EMPLOYMENT_TYPES: EmploymentType[] = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Temporary",
];

const WORKPLACE_TYPES: WorkplaceType[] = [
  "On-site",
  "Hybrid",
  "Remote",
];


interface JobFormState {
  title: string;
  department: string;
  description: string;
  location: string;
  workplaceType: WorkplaceType;
  type: EmploymentType;

  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  salaryNegotiable: boolean;

  qualifications: string;
  experienceRequired: string;

  skills: string[];

  responsibilities: string;
  benefits: string;

  openings: string;
  applicationDeadline: string;
}


const EMPTY_FORM: JobFormState = {
  title: "",
  department: "Engineering",
  description: "",
  location: "",
  workplaceType: "On-site",
  type: "Full-time",

  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "ZAR",
  salaryNegotiable: false,

  qualifications: "",
  experienceRequired: "",

  skills: [],

  responsibilities: "",
  benefits: "",

  openings: "1",
  applicationDeadline: "",
};


function createEmptyForm(): JobFormState {
  return {
    ...EMPTY_FORM,
    skills: [],
  };
}


function jobToForm(
  job: CompanyJob
): JobFormState {
  return {
    title:
      job.title || "",

    department:
      job.department || "Engineering",

    description:
      job.description || "",

    location:
      job.location || "",

    workplaceType:
      job.workplaceType || "On-site",

    type:
      job.type || "Full-time",

    salaryMin:
      job.salaryMin != null
        ? String(job.salaryMin)
        : "",

    salaryMax:
      job.salaryMax != null
        ? String(job.salaryMax)
        : "",

    salaryCurrency:
      job.salaryCurrency || "ZAR",

    salaryNegotiable:
      Boolean(
        job.salaryNegotiable
      ),

    qualifications:
      job.qualifications || "",

    experienceRequired:
      job.experienceRequired || "",

    skills:
      Array.isArray(job.skills)
        ? [...job.skills]
        : [],

    responsibilities:
      job.responsibilities || "",

    benefits:
      job.benefits || "",

    openings:
      String(
        job.openings ?? 1
      ),

    applicationDeadline:
      job.applicationDeadline || "",
  };
}


function formatDate(
  value?: string
): string {
  if (!value) {
    return "Not specified";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-ZA",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}


function formatSalary(
  job: CompanyJob
): string {
  if (
    job.salaryNegotiable
  ) {
    return "Salary negotiable";
  }

  if (
    job.salaryMin == null &&
    job.salaryMax == null
  ) {
    return "Salary not specified";
  }

  const currency =
    job.salaryCurrency ||
    "ZAR";

  const formatter =
    new Intl.NumberFormat(
      "en-ZA",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }
    );

  if (
    job.salaryMin != null &&
    job.salaryMax != null
  ) {
    return `${formatter.format(
      job.salaryMin
    )} – ${formatter.format(
      job.salaryMax
    )}`;
  }

  if (
    job.salaryMin != null
  ) {
    return `From ${formatter.format(
      job.salaryMin
    )}`;
  }

  return `Up to ${formatter.format(
    job.salaryMax as number
  )}`;
}


export default function JobListing() {

  const [jobs, setJobs] =
    useState<CompanyJob[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [closingId, setClosingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [formError, setFormError] =
    useState<string | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [editingJob, setEditingJob] =
    useState<CompanyJob | null>(null);

  const [viewingJob, setViewingJob] =
    useState<CompanyJob | null>(null);

  const [form, setForm] =
    useState<JobFormState>(
      createEmptyForm()
    );

  const [skillInput, setSkillInput] =
    useState("");


  const loadJobs = async () => {

    try {
      setLoading(true);
      setError(null);

      const data =
        await companyService.getJobs();

      setJobs(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Failed to load jobs:",
        err
      );

      setError(
        "Unable to load your company job listings."
      );

      setJobs([]);

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    void loadJobs();
  }, []);


  const activeJobs =
    useMemo(
      () =>
        jobs.filter(
          job =>
            job.status ===
            "Active"
        ),
      [jobs]
    );


  const handleOpenCreate =
    () => {

      setEditingJob(null);

      setForm(
        createEmptyForm()
      );

      setSkillInput("");

      setFormError(null);

      setError(null);

      setShowForm(true);
    };


  const handleOpenEdit =
    (job: CompanyJob) => {

      setEditingJob(job);

      setForm(
        jobToForm(job)
      );

      setSkillInput("");

      setFormError(null);

      setError(null);

      setShowForm(true);
    };


  const handleCloseForm =
    () => {

      if (saving) {
        return;
      }

      setShowForm(false);

      setEditingJob(null);

      setForm(
        createEmptyForm()
      );

      setSkillInput("");

      setFormError(null);
    };


  const updateForm = <
    K extends keyof JobFormState
  >(
    key: K,
    value: JobFormState[K]
  ) => {

    setForm(
      current => ({
        ...current,
        [key]: value,
      })
    );
  };


  const addSkill = () => {

    const value =
      skillInput.trim();

    if (!value) {
      return;
    }

    const existing =
      form.skills.some(
        skill =>
          skill.toLowerCase() ===
          value.toLowerCase()
      );

    if (existing) {
      setSkillInput("");
      return;
    }

    setForm(
      current => ({
        ...current,
        skills: [
          ...current.skills,
          value,
        ],
      })
    );

    setSkillInput("");
  };


  const removeSkill = (
    skillToRemove: string
  ) => {

    setForm(
      current => ({
        ...current,
        skills:
          current.skills.filter(
            skill =>
              skill !==
              skillToRemove
          ),
      })
    );
  };


  const handleSkillKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {

    if (
      event.key === "Enter" ||
      event.key === ","
    ) {

      event.preventDefault();

      addSkill();
    }
  };


  const validateForm =
    (): string | null => {

      if (
        !form.title.trim()
      ) {
        return "Please enter a job title.";
      }

      if (
        !form.department.trim()
      ) {
        return "Please select a department.";
      }

      if (
        !form.location.trim()
      ) {
        return "Please enter a job location.";
      }

      if (
        !form.workplaceType
      ) {
        return "Please select a workplace type.";
      }

      if (!form.type) {
        return "Please select an employment type.";
      }

      const min =
        form.salaryMin.trim()
          ? Number(
              form.salaryMin
            )
          : undefined;

      const max =
        form.salaryMax.trim()
          ? Number(
              form.salaryMax
            )
          : undefined;

      if (
        min !== undefined &&
        (!Number.isFinite(min) ||
          min < 0)
      ) {
        return "Please enter a valid minimum salary.";
      }

      if (
        max !== undefined &&
        (!Number.isFinite(max) ||
          max < 0)
      ) {
        return "Please enter a valid maximum salary.";
      }

      if (
        min !== undefined &&
        max !== undefined &&
        min > max
      ) {
        return "Minimum salary cannot be greater than maximum salary.";
      }

      const openings =
        Number(
          form.openings
        );

      if (
        !Number.isInteger(
          openings
        ) ||
        openings < 1
      ) {
        return "Number of openings must be at least 1.";
      }

      return null;
    };


  const buildRequest =
    (): CompanyJobRequest => {

      const min =
        form.salaryMin.trim()
          ? Number(
              form.salaryMin
            )
          : undefined;

      const max =
        form.salaryMax.trim()
          ? Number(
              form.salaryMax
            )
          : undefined;

      return {
        title:
          form.title.trim(),

        department:
          form.department.trim(),

        description:
          form.description.trim(),

        location:
          form.location.trim(),

        workplaceType:
          form.workplaceType,

        type:
          form.type,

        salaryMin:
          min,

        salaryMax:
          max,

        salaryCurrency:
          form.salaryCurrency
            .trim()
            .toUpperCase() ||
          "ZAR",

        salaryNegotiable:
          form.salaryNegotiable,

        qualifications:
          form.qualifications.trim(),

        experienceRequired:
          form.experienceRequired.trim(),

        skills:
          form.skills,

        responsibilities:
          form.responsibilities.trim(),

        benefits:
          form.benefits.trim(),

        openings:
          Number(
            form.openings
          ),

        applicationDeadline:
          form.applicationDeadline ||
          undefined,
      };
    };


  const handleSubmit =
    async (
      event: React.FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();

      const validationError =
        validateForm();

      if (validationError) {
        setFormError(
          validationError
        );
        return;
      }

      try {

        setSaving(true);

        setFormError(null);

        setError(null);

        const request =
          buildRequest();

        if (editingJob) {

          await companyService.updateJob(
            editingJob.id,
            request
          );

        } else {

          await companyService.createJob(
            request
          );
        }

        await loadJobs();

        setShowForm(false);

        setEditingJob(null);

        setForm(
          createEmptyForm()
        );

        setSkillInput("");

      } catch (err) {

        console.error(
          "Failed to save job:",
          err
        );

        setFormError(
          editingJob
            ? "Unable to update the job listing."
            : "Unable to create the job listing."
        );

      } finally {
        setSaving(false);
      }
    };


  const handleViewJob =
    async (
      job: CompanyJob
    ) => {

      try {

        setError(null);

        const latest =
          await companyService.getJob(
            job.id
          );

        setViewingJob(
          latest
        );

      } catch (err) {

        console.error(
          "Failed to load job details:",
          err
        );

        setViewingJob(job);
      }
    };


  const handleCloseJob =
    async (
      job: CompanyJob
    ) => {

      const confirmed =
        window.confirm(
          `Close "${job.title}"?\n\nClosed jobs remain in your company's records and their applications are preserved.`
        );

      if (!confirmed) {
        return;
      }

      try {

        setClosingId(
          job.id
        );

        setError(null);

        await companyService.closeJob(
          job.id
        );

        await loadJobs();

      } catch (err) {

        console.error(
          "Failed to close job:",
          err
        );

        setError(
          `Unable to close "${job.title}".`
        );

      } finally {

        setClosingId(
          null
        );
      }
    };


  const handleDeleteJob =
    async (
      job: CompanyJob
    ) => {

      if (
        job.applicants > 0
      ) {

        const closeInstead =
          window.confirm(
            `"${job.title}" has ${job.applicants} ${
              job.applicants === 1
                ? "application"
                : "applications"
            }.\n\nIt cannot be permanently deleted because application history must be preserved.\n\nWould you like to close the job instead?`
          );

        if (!closeInstead) {
          return;
        }

        await handleCloseJob(
          job
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Are you sure you want to permanently delete "${job.title}"?\n\nThis job has no applications.`
        );

      if (!confirmed) {
        return;
      }

      try {

        setDeletingId(
          job.id
        );

        setError(null);

        await companyService.deleteJob(
          job.id
        );

        await loadJobs();

      } catch (err) {

        console.error(
          "Failed to delete job:",
          err
        );

        setError(
          `Unable to delete "${job.title}".`
        );

      } finally {

        setDeletingId(
          null
        );
      }
    };


  return (
    <div
      className="min-h-screen flex flex-col justify-between overflow-x-hidden"
      style={{
        backgroundColor: "#F8FCFF",
        color: "#00273D",
        fontFamily:
          "Helvetica, Arial, sans-serif",
      }}
    >

      <div
        style={
          styles.container
        }
        className="p-6 lg:p-12 w-full"
      >

        {/* Header */}

        <div
          style={
            styles.topRow
          }
        >

          <div>

            <div
              style={
                styles.brandEyebrow
              }
            >
              TRUCITY
              <span
                style={
                  styles.brandDot
                }
              >
                •
              </span>
              EMPLOYER PORTAL
            </div>

            <h1
              style={
                styles.title
              }
            >
              Job Listings
            </h1>

            <p
              style={
                styles.subtitle
              }
            >
              Create, manage and track your company's hiring posts.
            </p>

          </div>


          <button
            type="button"
            style={
              styles.btnPrimary
            }
            onClick={
              handleOpenCreate
            }
            disabled={
              loading ||
              saving
            }
          >
            + Post New Job
          </button>

        </div>


        {/* Error */}

        {error && (
          <div
            style={
              styles.errorCard
            }
          >

            <div>

              <strong
                style={
                  styles.errorTitle
                }
              >
                Something went wrong
              </strong>

              <p
                style={
                  styles.errorText
                }
              >
                {error}
              </p>

            </div>

            <button
              type="button"
              style={
                styles.retryButton
              }
              onClick={() =>
                void loadJobs()
              }
              disabled={
                loading
              }
            >
              Retry
            </button>

          </div>
        )}


        {/* Form */}

        {showForm && (
          <form
            onSubmit={
              handleSubmit
            }
            style={
              styles.formCard
            }
          >

            <div
              style={
                styles.formHeader
              }
            >

              <div>

                <div
                  style={
                    styles.formEyebrow
                  }
                >
                  {editingJob
                    ? "POSITION MANAGEMENT"
                    : "NEW POSITION"}
                </div>

                <h4
                  style={
                    styles.formTitle
                  }
                >
                  {editingJob
                    ? "Edit Job Listing"
                    : "Create New Job Listing"}
                </h4>

                <p
                  style={
                    styles.formSubtitle
                  }
                >
                  {editingJob
                    ? "Update the position details stored in your company's database."
                    : "Provide candidates with the information they need to understand the position."}
                </p>

              </div>

              <button
                type="button"
                style={
                  styles.closeButton
                }
                onClick={
                  handleCloseForm
                }
                disabled={
                  saving
                }
                aria-label="Close"
              >
                ✕
              </button>

            </div>


            {formError && (
              <div
                style={
                  styles.formError
                }
              >
                {formError}
              </div>
            )}


            {/* Basic Information */}

            <div
              style={
                styles.formSection
              }
            >

              <div
                style={
                  styles.sectionLabel
                }
              >
                Basic information
              </div>

              <div
                style={
                  styles.formGrid
                }
              >

                <Field
                  label="Job title"
                  required
                >
                  <input
                    type="text"
                    value={
                      form.title
                    }
                    onChange={
                      event =>
                        updateForm(
                          "title",
                          event.target.value
                        )
                    }
                    style={
                      styles.input
                    }
                    placeholder="e.g. Senior Software Engineer"
                    disabled={
                      saving
                    }
                  />
                </Field>


                <Field
                  label="Department"
                  required
                >
                  <select
                    value={
                      form.department
                    }
                    onChange={
                      event =>
                        updateForm(
                          "department",
                          event.target.value
                        )
                    }
                    style={
                      styles.input
                    }
                    disabled={
                      saving
                    }
                  >
                    {DEPARTMENTS.map(
                      department => (
                        <option
                          key={
                            department
                          }
                          value={
                            department
                          }
                        >
                          {department}
                        </option>
                      )
                    )}
                  </select>
                </Field>


                <Field
                  label="Location"
                  required
                >
                  <input
                    type="text"
                    value={
                      form.location
                    }
                    onChange={
                      event =>
                        updateForm(
                          "location",
                          event.target.value
                        )
                    }
                    style={
                      styles.input
                    }
                    placeholder="e.g. Johannesburg, Gauteng"
                    disabled={
                      saving
                    }
                  />
                </Field>


                <Field
                  label="Workplace"
                  required
                >
                  <select
                    value={
                      form.workplaceType
                    }
                    onChange={
                      event =>
                        updateForm(
                          "workplaceType",
                          event.target.value as WorkplaceType
                        )
                    }
                    style={
                      styles.input
                    }
                    disabled={
                      saving
                    }
                  >
                    {WORKPLACE_TYPES.map(
                      type => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}
                  </select>
                </Field>


                <Field
                  label="Employment type"
                  required
                >
                  <select
                    value={
                      form.type
                    }
                    onChange={
                      event =>
                        updateForm(
                          "type",
                          event.target.value as EmploymentType
                        )
                    }
                    style={
                      styles.input
                    }
                    disabled={
                      saving
                    }
                  >
                    {EMPLOYMENT_TYPES.map(
                      type => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}
                  </select>
                </Field>


                <Field
                  label="Number of openings"
                  required
                >
                  <input
                    type="number"
                    min="1"
                    value={
                      form.openings
                    }
                    onChange={
                      event =>
                        updateForm(
                          "openings",
                          event.target.value
                        )
                    }
                    style={
                      styles.input
                    }
                    disabled={
                      saving
                    }
                  />
                </Field>

              </div>

            </div>


            {/* Description */}

            <div
              style={
                styles.formSection
              }
            >

              <div
                style={
                  styles.sectionLabel
                }
              >
                Job description
              </div>

              <Field
                label="Description"
              >
                <textarea
                  value={
                    form.description
                  }
                  onChange={
                    event =>
                      updateForm(
                        "description",
                        event.target.value
                      )
                  }
                  style={
                    styles.textarea
                  }
                  placeholder="Describe the position, team and what the successful candidate will be doing."
                  rows={5}
                  disabled={
                    saving
                  }
                />
              </Field>

            </div>


            {/* Salary */}

            <div
              style={
                styles.formSection
              }
            >

              <div
                style={
                  styles.sectionLabel
                }
              >
                Compensation
              </div>

              <div
                style={
                  styles.formGrid
                }
              >

                <Field
                  label="Minimum salary"
                >
                  <input
                    type="number"
                    min="0"
                    value={
                      form.salaryMin
                    }
                    onChange={
                      event =>
                        updateForm(
                          "salaryMin",
                          event.target.value
                        )
                    }
                    style={
                      styles.input
                    }
                    placeholder="e.g. 25000"
                    disabled={
                      saving ||
                      form.salaryNegotiable
                    }
                  />
                </Field>


                <Field
                  label="Maximum salary"
                >
                  <input
                    type="number"
                    min="0"
                    value={
                      form.salaryMax
                    }
                    onChange={
                      event =>
                        updateForm(
                          "salaryMax",
                          event.target.value
                        )
                    }
                    style={
                      styles.input
                    }
                    placeholder="e.g. 45000"
                    disabled={
                      saving ||
                      form.salaryNegotiable
                    }
                  />
                </Field>


                <Field
                  label="Currency"
                >
                  <select
                    value={
                      form.salaryCurrency
                    }
                    onChange={
                      event =>
                        updateForm(
                          "salaryCurrency",
                          event.target.value
                        )
                    }
                    style={
                      styles.input
                    }
                    disabled={
                      saving ||
                      form.salaryNegotiable
                    }
                  >
                    <option value="ZAR">
                      ZAR — South African Rand
                    </option>

                    <option value="USD">
                      USD — US Dollar
                    </option>

                    <option value="EUR">
                      EUR — Euro
                    </option>

                    <option value="GBP">
                      GBP — Pound Sterling
                    </option>
                  </select>
                </Field>


                <label
                  style={
                    styles.checkboxLabel
                  }
                >

                  <input
                    type="checkbox"
                    checked={
                      form.salaryNegotiable
                    }
                    onChange={
                      event =>
                        updateForm(
                          "salaryNegotiable",
                          event.target.checked
                        )
                    }
                    disabled={
                      saving
                    }
                  />

                  <span>
                    Salary is negotiable
                  </span>

                </label>

              </div>

            </div>


            {/* Candidate Requirements */}

            <div
              style={
                styles.formSection
              }
            >

              <div
                style={
                  styles.sectionLabel
                }
              >
                Candidate requirements
              </div>


              <div
                style={
                  styles.formGrid
                }
              >

                <Field
                  label="Experience required"
                >
                  <textarea
                    value={
                      form.experienceRequired
                    }
                    onChange={
                      event =>
                        updateForm(
                          "experienceRequired",
                          event.target.value
                        )
                    }
                    style={
                      styles.textarea
                    }
                    rows={4}
                    placeholder="e.g. 3+ years of professional Java/Spring Boot experience."
                    disabled={
                      saving
                    }
                  />
                </Field>


                <Field
                  label="Qualifications"
                >
                  <textarea
                    value={
                      form.qualifications
                    }
                    onChange={
                      event =>
                        updateForm(
                          "qualifications",
                          event.target.value
                        )
                    }
                    style={
                      styles.textarea
                    }
                    rows={4}
                    placeholder="e.g. BSc Computer Science or equivalent."
                    disabled={
                      saving
                    }
                  />
                </Field>

              </div>


              <Field
                label="Desired skills"
              >

                <div
                  style={
                    styles.skillInputRow
                  }
                >

                  <input
                    type="text"
                    value={
                      skillInput
                    }
                    onChange={
                      event =>
                        setSkillInput(
                          event.target.value
                        )
                    }
                    onKeyDown={
                      handleSkillKeyDown
                    }
                    style={
                      styles.input
                    }
                    placeholder="Type a skill and press Enter"
                    disabled={
                      saving
                    }
                  />

                  <button
                    type="button"
                    onClick={
                      addSkill
                    }
                    style={
                      styles.smallPrimaryButton
                    }
                    disabled={
                      saving ||
                      !skillInput.trim()
                    }
                  >
                    Add
                  </button>

                </div>


                {form.skills.length > 0 && (
                  <div
                    style={
                      styles.skillsContainer
                    }
                  >

                    {form.skills.map(
                      skill => (
                        <span
                          key={
                            skill
                          }
                          style={
                            styles.skillChip
                          }
                        >
                          {skill}

                          <button
                            type="button"
                            onClick={() =>
                              removeSkill(
                                skill
                              )
                            }
                            style={
                              styles.skillRemove
                            }
                            disabled={
                              saving
                            }
                            aria-label={`Remove ${skill}`}
                          >
                            ×
                          </button>
                        </span>
                      )
                    )}

                  </div>
                )}

              </Field>

            </div>


            {/* Responsibilities and benefits */}

            <div
              style={
                styles.formSection
              }
            >

              <div
                style={
                  styles.sectionLabel
                }
              >
                Position details
              </div>

              <div
                style={
                  styles.formGrid
                }
              >

                <Field
                  label="Responsibilities"
                >
                  <textarea
                    value={
                      form.responsibilities
                    }
                    onChange={
                      event =>
                        updateForm(
                          "responsibilities",
                          event.target.value
                        )
                    }
                    style={
                      styles.textarea
                    }
                    rows={5}
                    placeholder="List the main responsibilities of the successful candidate."
                    disabled={
                      saving
                    }
                  />
                </Field>


                <Field
                  label="Benefits"
                >
                  <textarea
                    value={
                      form.benefits
                    }
                    onChange={
                      event =>
                        updateForm(
                          "benefits",
                          event.target.value
                        )
                    }
                    style={
                      styles.textarea
                    }
                    rows={5}
                    placeholder="e.g. Medical aid, pension, remote-work allowance, training."
                    disabled={
                      saving
                    }
                  />
                </Field>

              </div>

            </div>


            {/* Deadline */}

            <div
              style={
                styles.formSection
              }
            >

              <Field
                label="Application deadline"
              >
                <input
                  type="date"
                  value={
                    form.applicationDeadline
                  }
                  onChange={
                    event =>
                      updateForm(
                        "applicationDeadline",
                        event.target.value
                      )
                  }
                  style={
                    styles.input
                  }
                  disabled={
                    saving
                  }
                />
              </Field>

            </div>


            {/* Actions */}

            <div
              style={
                styles.formActions
              }
            >

              <button
                type="submit"
                style={
                  styles.btnPrimary
                }
                disabled={
                  saving
                }
              >
                {saving
                  ? editingJob
                    ? "Saving changes..."
                    : "Publishing..."
                  : editingJob
                    ? "Save Changes"
                    : "Publish Job"}
              </button>


              <button
                type="button"
                style={
                  styles.btnSecondary
                }
                onClick={
                  handleCloseForm
                }
                disabled={
                  saving
                }
              >
                Cancel
              </button>

            </div>

          </form>
        )}


        {/* Job section */}

        <div
          style={
            styles.jobsSection
          }
        >

          <div
            style={
              styles.sectionHeader
            }
          >

            <div>

              <h2
                style={
                  styles.sectionTitle
                }
              >
                Your Job Listings
              </h2>

              <p
                style={
                  styles.sectionDescription
                }
              >
                {activeJobs.length} active{" "}
                {activeJobs.length === 1
                  ? "position"
                  : "positions"}{" "}
                · {jobs.length} total
              </p>

            </div>

            <span
              style={
                styles.sectionHint
              }
            >
              {loading
                ? "Loading listings..."
                : "Live database listings"}
            </span>

          </div>


          <div
            style={
              styles.jobList
            }
          >

            {loading ? (

              <div
                style={
                  styles.emptyState
                }
              >

                <div
                  style={
                    styles.loadingSpinner
                  }
                />

                <h3
                  style={
                    styles.emptyTitle
                  }
                >
                  Loading job listings
                </h3>

                <p
                  style={
                    styles.emptyText
                  }
                >
                  Retrieving your company's jobs from the server.
                </p>

              </div>

            ) : jobs.length === 0 ? (

              <div
                style={
                  styles.emptyState
                }
              >

                <div
                  style={
                    styles.emptyIcon
                  }
                >
                  ＋
                </div>

                <h3
                  style={
                    styles.emptyTitle
                  }
                >
                  No job listings yet
                </h3>

                <p
                  style={
                    styles.emptyText
                  }
                >
                  Create your first position and provide candidates with a complete job description.
                </p>

                <button
                  type="button"
                  style={
                    styles.btnPrimary
                  }
                  onClick={
                    handleOpenCreate
                  }
                >
                  + Post New Job
                </button>

              </div>

            ) : (

              jobs.map(
                job => (

                  <div
                    key={
                      job.id
                    }
                    style={
                      styles.jobCard
                    }
                  >

                    <div
                      style={
                        styles.jobInformation
                      }
                    >

                      <div
                        style={
                          styles.cardTopRow
                        }
                      >

                        <span
                          style={
                            styles.deptBadge
                          }
                        >
                          {job.department}
                        </span>

                        <span
                          style={
                            job.status ===
                            "Active"
                              ? styles.statusBadge
                              : styles.statusClosedBadge
                          }
                        >
                          {job.status}
                        </span>

                      </div>


                      <h3
                        style={
                          styles.jobTitle
                        }
                      >
                        {job.title}
                      </h3>


                      <p
                        style={
                          styles.jobSub
                        }
                      >
                        {job.location}
                        {" • "}
                        {job.workplaceType}
                        {" • "}
                        {job.type}
                      </p>


                      <div
                        style={
                          styles.cardMeta
                        }
                      >

                        <span>
                          💰 {formatSalary(job)}
                        </span>

                        <span>
                          👥 {job.applicants}{" "}
                          {job.applicants === 1
                            ? "applicant"
                            : "applicants"}
                        </span>

                        <span>
                          📌 {job.openings ?? 1}{" "}
                          {job.openings === 1
                            ? "opening"
                            : "openings"}
                        </span>

                      </div>


                      {job.skills.length > 0 && (
                        <div
                          style={
                            styles.cardSkills
                          }
                        >

                          {job.skills
                            .slice(0, 5)
                            .map(
                              skill => (
                                <span
                                  key={
                                    skill
                                  }
                                  style={
                                    styles.cardSkill
                                  }
                                >
                                  {skill}
                                </span>
                              )
                            )}

                          {job.skills.length >
                            5 && (
                            <span
                              style={
                                styles.moreSkills
                              }
                            >
                              +
                              {job.skills.length -
                                5}{" "}
                              more
                            </span>
                          )}

                        </div>
                      )}


                      {job.postedDate && (
                        <p
                          style={
                            styles.postedDate
                          }
                        >
                          Posted{" "}
                          {formatDate(
                            job.postedDate
                          )}
                        </p>
                      )}

                    </div>


                    <div
                      style={
                        styles.jobActions
                      }
                    >

                      <button
                        type="button"
                        onClick={() =>
                          void handleViewJob(
                            job
                          )
                        }
                        style={
                          styles.btnView
                        }
                      >
                        View
                      </button>


                      <button
                        type="button"
                        onClick={() =>
                          handleOpenEdit(
                            job
                          )
                        }
                        style={
                          styles.btnEdit
                        }
                        disabled={
                          saving
                        }
                      >
                        Edit
                      </button>


                      {job.status ===
                        "Active" && (
                        <button
                          type="button"
                          onClick={() =>
                            void handleCloseJob(
                              job
                            )
                          }
                          style={
                            styles.btnClose
                          }
                          disabled={
                            closingId ===
                            job.id
                          }
                        >
                          {closingId ===
                          job.id
                            ? "Closing..."
                            : "Close"}
                        </button>
                      )}


                      <button
                        type="button"
                        onClick={() =>
                          void handleDeleteJob(
                            job
                          )
                        }
                        style={
                          styles.btnDelete
                        }
                        disabled={
                          deletingId ===
                          job.id ||
                          closingId ===
                          job.id
                        }
                      >
                        {deletingId ===
                        job.id
                          ? "Deleting..."
                          : job.applicants > 0
                            ? "Delete / Close"
                            : "Delete"}
                      </button>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </div>


      {/* View modal */}

      {viewingJob && (
        <div
          style={
            styles.overlay
          }
          onMouseDown={event => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setViewingJob(null);
            }

          }}
        >

          <div
            style={
              styles.detailModal
            }
          >

            <div
              style={
                styles.modalHeader
              }
            >

              <div>

                <span
                  style={
                    styles.deptBadge
                  }
                >
                  {viewingJob.department}
                </span>

                <h2
                  style={
                    styles.modalTitle
                  }
                >
                  {viewingJob.title}
                </h2>

                <p
                  style={
                    styles.modalSubtitle
                  }
                >
                  {viewingJob.location}
                  {" • "}
                  {viewingJob.workplaceType}
                  {" • "}
                  {viewingJob.type}
                </p>

              </div>


              <button
                type="button"
                style={
                  styles.closeButton
                }
                onClick={() =>
                  setViewingJob(null)
                }
                aria-label="Close"
              >
                ✕
              </button>

            </div>


            <div
              style={
                styles.detailStatusRow
              }
            >

              <span
                style={
                  viewingJob.status ===
                  "Active"
                    ? styles.statusBadge
                    : styles.statusClosedBadge
                }
              >
                {viewingJob.status}
              </span>

              <span
                style={
                  styles.detailMeta
                }
              >
                {viewingJob.applicants}{" "}
                {viewingJob.applicants ===
                1
                  ? "applicant"
                  : "applicants"}
              </span>

              <span
                style={
                  styles.detailMeta
                }
              >
                {viewingJob.openings ??
                  1}{" "}
                {viewingJob.openings ===
                1
                  ? "opening"
                  : "openings"}
              </span>

            </div>


            <div
              style={
                styles.detailBody
              }
            >

              <DetailSection
                title="Description"
                value={
                  viewingJob.description
                }
              />


              <div
                style={
                  styles.detailGrid
                }
              >

                <DetailItem
                  label="Location"
                  value={
                    viewingJob.location
                  }
                />

                <DetailItem
                  label="Workplace"
                  value={
                    viewingJob.workplaceType
                  }
                />

                <DetailItem
                  label="Employment"
                  value={
                    viewingJob.type
                  }
                />

                <DetailItem
                  label="Salary"
                  value={
                    formatSalary(
                      viewingJob
                    )
                  }
                />

                <DetailItem
                  label="Openings"
                  value={String(
                    viewingJob.openings ??
                      1
                  )}
                />

                <DetailItem
                  label="Application deadline"
                  value={
                    formatDate(
                      viewingJob.applicationDeadline
                    )
                  }
                />

              </div>


              {viewingJob.skills.length >
                0 && (

                <div
                  style={
                    styles.detailSection
                  }
                >

                  <h3
                    style={
                      styles.detailHeading
                    }
                  >
                    Desired skills
                  </h3>

                  <div
                    style={
                      styles.skillsContainer
                    }
                  >

                    {viewingJob.skills.map(
                      skill => (
                        <span
                          key={
                            skill
                          }
                          style={
                            styles.skillChip
                          }
                        >
                          {skill}
                        </span>
                      )
                    )}

                  </div>

                </div>

              )}


              <DetailSection
                title="Qualifications"
                value={
                  viewingJob.qualifications
                }
              />

              <DetailSection
                title="Experience required"
                value={
                  viewingJob.experienceRequired
                }
              />

              <DetailSection
                title="Responsibilities"
                value={
                  viewingJob.responsibilities
                }
              />

              <DetailSection
                title="Benefits"
                value={
                  viewingJob.benefits
                }
              />

            </div>


            <div
              style={
                styles.modalFooter
              }
            >

              <button
                type="button"
                style={
                  styles.btnSecondary
                }
                onClick={() =>
                  setViewingJob(null)
                }
              >
                Close
              </button>


              <button
                type="button"
                style={
                  styles.btnPrimary
                }
                onClick={() => {

                  setViewingJob(null);

                  handleOpenEdit(
                    viewingJob
                  );

                }}
              >
                Edit Job
              </button>

            </div>

          </div>

        </div>
      )}


      {/* Footer */}

      <footer
        style={
          styles.footer
        }
      >

        <div
          style={
            styles.footerText
          }
        >
          ©{" "}
          {new Date().getFullYear()}{" "}
          <span
            style={
              styles.footerBrand
            }
          >
            UpperLevel Group
          </span>
          . All rights reserved.
        </div>

      </footer>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Small form components
|--------------------------------------------------------------------------
*/

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {

  return (
    <label
      style={
        styles.field
      }
    >

      <span
        style={
          styles.fieldLabel
        }
      >
        {label}

        {required && (
          <span
            style={
              styles.required
            }
          >
            {" "}*
          </span>
        )}
      </span>

      {children}

    </label>
  );
}


function DetailSection({
  title,
  value,
}: {
  title: string;
  value?: string;
}) {

  if (
    !value ||
    !value.trim()
  ) {
    return null;
  }

  return (
    <div
      style={
        styles.detailSection
      }
    >

      <h3
        style={
          styles.detailHeading
        }
      >
        {title}
      </h3>

      <p
        style={
          styles.detailText
        }
      >
        {value}
      </p>

    </div>
  );
}


function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (
    <div
      style={
        styles.detailItem
      }
    >

      <span
        style={
          styles.detailItemLabel
        }
      >
        {label}
      </span>

      <strong
        style={
          styles.detailItemValue
        }
      >
        {value}
      </strong>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| TruCity September 2026 Brand Styles
|--------------------------------------------------------------------------
*/

const styles: Record<
  string,
  React.CSSProperties
> = {

  container: {
    maxWidth:
      "100%",
    margin:
      "0 auto",
    width:
      "100%",
  },

  topRow: {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    marginBottom:
      "28px",
    gap:
      "20px",
  },

  brandEyebrow: {
    display:
      "flex",
    alignItems:
      "center",
    gap:
      "7px",
    color:
      "#1E92D2",
    fontSize:
      "11px",
    fontWeight:
      "700",
    letterSpacing:
      "0.12em",
    marginBottom:
      "6px",
  },

  brandDot: {
    color:
      "#FFAD01",
    fontWeight:
      "700",
  },

  title: {
    fontSize:
      "32px",
    fontWeight:
      "700",
    color:
      "#00466D",
    margin:
      0,
    letterSpacing:
      "-0.02em",
  },

  subtitle: {
    fontSize:
      "14px",
    color:
      "#64748B",
    margin:
      "6px 0 0 0",
    fontWeight:
      "400",
  },

  btnPrimary: {
    padding:
      "12px 24px",
    backgroundColor:
      "#00466D",
    color:
      "#FFFFFF",
    border:
      "none",
    borderRadius:
      "10px",
    fontWeight:
      "700",
    fontSize:
      "13px",
    cursor:
      "pointer",
    boxShadow:
      "0 2px 5px rgba(0, 70, 109, 0.16)",
    whiteSpace:
      "nowrap",
  },

  btnSecondary: {
    padding:
      "12px 24px",
    backgroundColor:
      "#FFFFFF",
    color:
      "#00466D",
    border:
      "1px solid #D4D2E6",
    borderRadius:
      "10px",
    fontWeight:
      "700",
    fontSize:
      "13px",
    cursor:
      "pointer",
  },

  btnView: {
    padding:
      "9px 14px",
    backgroundColor:
      "#EAF6FD",
    color:
      "#00466D",
    border:
      "1px solid #B8DFF3",
    borderRadius:
      "8px",
    fontWeight:
      "700",
    fontSize:
      "12px",
    cursor:
      "pointer",
  },

  btnEdit: {
    padding:
      "9px 14px",
    backgroundColor:
      "#FFFFFF",
    color:
      "#00466D",
    border:
      "1px solid #D4D2E6",
    borderRadius:
      "8px",
    fontWeight:
      "700",
    fontSize:
      "12px",
    cursor:
      "pointer",
  },

  btnClose: {
    padding:
      "9px 14px",
    backgroundColor:
      "#FFF8E1",
    color:
      "#00273D",
    border:
      "1px solid #FFD784",
    borderRadius:
      "8px",
    fontWeight:
      "700",
    fontSize:
      "12px",
    cursor:
      "pointer",
  },

  btnDelete: {
    padding:
      "9px 14px",
    backgroundColor:
      "#FFF0F3",
    color:
      "#C92F55",
    border:
      "1px solid #FFB5C7",
    borderRadius:
      "8px",
    fontWeight:
      "700",
    fontSize:
      "12px",
    cursor:
      "pointer",
  },

  formCard: {
    backgroundColor:
      "#FFFFFF",
    borderRadius:
      "16px",
    padding:
      "24px",
    border:
      "1px solid #D4D2E6",
    marginBottom:
      "20px",
    boxShadow:
      "0 4px 14px rgba(0, 39, 61, 0.05)",
  },

  formHeader: {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "flex-start",
    marginBottom:
      "20px",
  },

  formEyebrow: {
    color:
      "#FFAD01",
    fontSize:
      "10px",
    fontWeight:
      "700",
    letterSpacing:
      "0.1em",
    marginBottom:
      "5px",
  },

  formTitle: {
    margin:
      0,
    color:
      "#00466D",
    fontWeight:
      "700",
    fontSize:
      "20px",
  },

  formSubtitle: {
    margin:
      "5px 0 0 0",
    color:
      "#64748B",
    fontSize:
      "13px",
    fontWeight:
      "400",
  },

  closeButton: {
    width:
      "34px",
    height:
      "34px",
    borderRadius:
      "9px",
    border:
      "1px solid #D4D2E6",
    backgroundColor:
      "#FFFFFF",
    color:
      "#64748B",
    cursor:
      "pointer",
    fontSize:
      "13px",
    fontWeight:
      "700",
  },

  formSection: {
    borderTop:
      "1px solid #E9E8F3",
    paddingTop:
      "20px",
    marginTop:
      "20px",
  },

  sectionLabel: {
    color:
      "#00466D",
    fontWeight:
      "700",
    fontSize:
      "14px",
    marginBottom:
      "14px",
  },

  formGrid: {
    display:
      "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap:
      "14px",
  },

  field: {
    display:
      "flex",
    flexDirection:
      "column",
    gap:
      "7px",
    minWidth:
      0,
  },

  fieldLabel: {
    color:
      "#00273D",
    fontSize:
      "13px",
    fontWeight:
      "600",
  },

  required: {
    color:
      "#FF4672",
  },

  input: {
    padding:
      "11px 13px",
    borderRadius:
      "9px",
    border:
      "1px solid #D4D2E6",
    fontSize:
      "14px",
    outline:
      "none",
    color:
      "#00273D",
    backgroundColor:
      "#FFFFFF",
    fontWeight:
      "400",
    minWidth:
      0,
    boxSizing:
      "border-box",
    width:
      "100%",
  },

  textarea: {
    padding:
      "11px 13px",
    borderRadius:
      "9px",
    border:
      "1px solid #D4D2E6",
    fontSize:
      "14px",
    outline:
      "none",
    color:
      "#00273D",
    backgroundColor:
      "#FFFFFF",
    fontWeight:
      "400",
    resize:
      "vertical",
    minWidth:
      0,
    boxSizing:
      "border-box",
    width:
      "100%",
    lineHeight:
      "1.6",
  },

  checkboxLabel: {
    display:
      "flex",
    alignItems:
      "center",
    gap:
      "9px",
    alignSelf:
      "end",
    minHeight:
      "43px",
    color:
      "#00273D",
    fontSize:
      "13px",
    fontWeight:
      "600",
  },

  skillInputRow: {
    display:
      "flex",
    gap:
      "8px",
    alignItems:
      "center",
  },

  smallPrimaryButton: {
    padding:
      "11px 17px",
    backgroundColor:
      "#FFAD01",
    color:
      "#00273D",
    border:
      "none",
    borderRadius:
      "9px",
    fontWeight:
      "700",
    fontSize:
      "12px",
    cursor:
      "pointer",
    flexShrink:
      0,
  },

  skillsContainer: {
    display:
      "flex",
    flexWrap:
      "wrap",
    gap:
      "8px",
    marginTop:
      "10px",
  },

  skillChip: {
    display:
      "inline-flex",
    alignItems:
      "center",
    gap:
      "7px",
    backgroundColor:
      "#EAF6FD",
    color:
      "#00466D",
    border:
      "1px solid #B8DFF3",
    padding:
      "6px 10px",
    borderRadius:
      "999px",
    fontSize:
      "12px",
    fontWeight:
      "600",
  },

  skillRemove: {
    border:
      "none",
    background:
      "transparent",
    color:
      "#00466D",
    cursor:
      "pointer",
    fontWeight:
      "900",
    fontSize:
      "15px",
    padding:
      0,
    lineHeight:
      1,
  },

  formActions: {
    display:
      "flex",
    gap:
      "8px",
    marginTop:
      "24px",
  },

  formError: {
    backgroundColor:
      "#FFF0F3",
    border:
      "1px solid #FFB5C7",
    color:
      "#C92F55",
    borderRadius:
      "9px",
    padding:
      "11px 14px",
    fontSize:
      "13px",
    fontWeight:
      "600",
    marginBottom:
      "16px",
  },

  jobsSection: {
    marginTop:
      "32px",
  },

  sectionHeader: {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    marginBottom:
      "16px",
    gap:
      "16px",
  },

  sectionTitle: {
    fontSize:
      "24px",
    fontWeight:
      "700",
    color:
      "#00466D",
    margin:
      0,
  },

  sectionDescription: {
    margin:
      "5px 0 0 0",
    color:
      "#64748B",
    fontSize:
      "13px",
    fontWeight:
      "400",
  },

  sectionHint: {
    fontSize:
      "12px",
    color:
      "#64748B",
    fontWeight:
      "600",
  },

  jobList: {
    display:
      "flex",
    flexDirection:
      "column",
    gap:
      "12px",
  },

  jobCard: {
    backgroundColor:
      "#FFFFFF",
    borderRadius:
      "14px",
    padding:
      "22px",
    border:
      "1px solid #E9E8F3",
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    gap:
      "24px",
    boxShadow:
      "0 3px 12px rgba(0, 39, 61, 0.04)",
  },

  jobInformation: {
    minWidth:
      0,
    flex:
      1,
  },

  cardTopRow: {
    display:
      "flex",
    alignItems:
      "center",
    gap:
      "8px",
    flexWrap:
      "wrap",
    marginBottom:
      "8px",
  },

  deptBadge: {
    display:
      "inline-block",
    fontSize:
      "11px",
    fontWeight:
      "700",
    color:
      "#00273D",
    backgroundColor:
      "#FFD784",
    padding:
      "5px 10px",
    borderRadius:
      "8px",
    border:
      "1px solid #FFAD01",
  },

  jobTitle: {
    margin:
      0,
    fontSize:
      "20px",
    color:
      "#00466D",
    fontWeight:
      "700",
  },

  jobSub: {
    margin:
      "5px 0 0 0",
    fontSize:
      "14px",
    color:
      "#475569",
    fontWeight:
      "500",
  },

  cardMeta: {
    display:
      "flex",
    flexWrap:
      "wrap",
    gap:
      "14px",
    marginTop:
      "10px",
    color:
      "#64748B",
    fontSize:
      "13px",
    fontWeight:
      "500",
  },

  cardSkills: {
    display:
      "flex",
    flexWrap:
      "wrap",
    gap:
      "6px",
    marginTop:
      "10px",
  },

  cardSkill: {
    backgroundColor:
      "#F4F3FA",
    color:
      "#475569",
    border:
      "1px solid #E9E8F3",
    borderRadius:
      "7px",
    padding:
      "4px 8px",
    fontSize:
      "11px",
    fontWeight:
      "600",
  },

  moreSkills: {
    color:
      "#1E92D2",
    fontSize:
      "11px",
    fontWeight:
      "700",
    padding:
      "4px 5px",
  },

  postedDate: {
    margin:
      "8px 0 0 0",
    fontSize:
      "11px",
    color:
      "#94A3B8",
    fontWeight:
      "500",
  },

  jobActions: {
    display:
      "flex",
    alignItems:
      "center",
    justifyContent:
      "flex-end",
    flexWrap:
      "wrap",
    gap:
      "7px",
    flexShrink:
      0,
    maxWidth:
      "420px",
  },

  statusBadge: {
    color:
      "#087A4B",
    fontWeight:
      "700",
    fontSize:
      "11px",
    backgroundColor:
      "#E5FFF3",
    padding:
      "5px 10px",
    borderRadius:
      "8px",
    border:
      "1px solid #43ED9C",
    whiteSpace:
      "nowrap",
  },

  statusClosedBadge: {
    color:
      "#475569",
    fontWeight:
      "700",
    fontSize:
      "11px",
    backgroundColor:
      "#F4F3FA",
    padding:
      "5px 10px",
    borderRadius:
      "8px",
    border:
      "1px solid #D4D2E6",
    whiteSpace:
      "nowrap",
  },

  emptyState: {
    padding:
      "56px 32px",
    textAlign:
      "center",
    backgroundColor:
      "#FFFFFF",
    border:
      "1px solid #E9E8F3",
    borderRadius:
      "14px",
  },

  emptyIcon: {
    width:
      "48px",
    height:
      "48px",
    margin:
      "0 auto 14px auto",
    display:
      "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    borderRadius:
      "14px",
    backgroundColor:
      "#FFF8E1",
    border:
      "1px solid #FFD784",
    color:
      "#00466D",
    fontSize:
      "24px",
    fontWeight:
      "700",
  },

  loadingSpinner: {
    width:
      "32px",
    height:
      "32px",
    margin:
      "0 auto 18px auto",
    borderRadius:
      "50%",
    border:
      "3px solid #D4D2E6",
    borderTopColor:
      "#00466D",
    animation:
      "spin 0.8s linear infinite",
  },

  emptyTitle: {
    margin:
      "0 0 6px 0",
    color:
      "#00466D",
    fontSize:
      "18px",
    fontWeight:
      "700",
  },

  emptyText: {
    maxWidth:
      "480px",
    margin:
      "0 auto 20px auto",
    color:
      "#64748B",
    fontSize:
      "14px",
    lineHeight:
      "1.6",
    fontWeight:
      "400",
  },

  errorCard: {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    gap:
      "16px",
    padding:
      "14px 18px",
    marginBottom:
      "20px",
    backgroundColor:
      "#FFF0F3",
    border:
      "1px solid #FFB5C7",
    borderRadius:
      "10px",
  },

  errorTitle: {
    display:
      "block",
    color:
      "#C92F55",
    fontSize:
      "13px",
    marginBottom:
      "2px",
  },

  errorText: {
    margin:
      0,
    color:
      "#C92F55",
    fontSize:
      "12px",
  },

  retryButton: {
    padding:
      "8px 14px",
    backgroundColor:
      "#FFFFFF",
    color:
      "#C92F55",
    border:
      "1px solid #FFB5C7",
    borderRadius:
      "8px",
    fontWeight:
      "700",
    fontSize:
      "12px",
    cursor:
      "pointer",
    whiteSpace:
      "nowrap",
  },

  overlay: {
    position:
      "fixed",
    inset:
      0,
    zIndex:
      1000,
    backgroundColor:
      "rgba(0, 39, 61, 0.58)",
    display:
      "flex",
    alignItems:
      "center",
    justifyContent:
      "center",
    padding:
      "24px",
  },

  detailModal: {
    width:
      "min(900px, 100%)",
    maxHeight:
      "90vh",
    overflowY:
      "auto",
    backgroundColor:
      "#FFFFFF",
    borderRadius:
      "16px",
    boxShadow:
      "0 25px 60px rgba(0, 39, 61, 0.22)",
    border:
      "1px solid #D4D2E6",
  },

  modalHeader: {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "flex-start",
    gap:
      "20px",
    padding:
      "26px 28px 20px",
    borderBottom:
      "1px solid #E9E8F3",
  },

  modalTitle: {
    margin:
      "10px 0 0 0",
    color:
      "#00466D",
    fontSize:
      "28px",
    fontWeight:
      "700",
  },

  modalSubtitle: {
    margin:
      "5px 0 0 0",
    color:
      "#64748B",
    fontSize:
      "14px",
    fontWeight:
      "500",
  },

  detailStatusRow: {
    display:
      "flex",
    alignItems:
      "center",
    flexWrap:
      "wrap",
    gap:
      "10px",
    padding:
      "15px 28px",
    backgroundColor:
      "#F8FCFF",
    borderBottom:
      "1px solid #E9E8F3",
  },

  detailMeta: {
    color:
      "#64748B",
    fontSize:
      "12px",
    fontWeight:
      "700",
    padding:
      "5px 9px",
    backgroundColor:
      "#FFFFFF",
    border:
      "1px solid #D4D2E6",
    borderRadius:
      "8px",
  },

  detailBody: {
    padding:
      "26px 28px",
  },

  detailSection: {
    marginBottom:
      "24px",
  },

  detailHeading: {
    margin:
      "0 0 8px 0",
    color:
      "#00466D",
    fontSize:
      "16px",
    fontWeight:
      "700",
  },

  detailText: {
    margin:
      0,
    color:
      "#475569",
    fontSize:
      "14px",
    lineHeight:
      "1.7",
    whiteSpace:
      "pre-line",
  },

  detailGrid: {
    display:
      "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap:
      "12px",
    marginBottom:
      "26px",
  },

  detailItem: {
    padding:
      "14px",
    backgroundColor:
      "#F8FCFF",
    border:
      "1px solid #E9E8F3",
    borderRadius:
      "10px",
  },

  detailItemLabel: {
    display:
      "block",
    color:
      "#64748B",
    fontSize:
      "10px",
    fontWeight:
      "700",
    textTransform:
      "uppercase",
    letterSpacing:
      "0.06em",
    marginBottom:
      "5px",
  },

  detailItemValue: {
    color:
      "#00273D",
    fontSize:
      "13px",
    fontWeight:
      "700",
  },

  modalFooter: {
    display:
      "flex",
    justifyContent:
      "flex-end",
    gap:
      "8px",
    padding:
      "18px 28px",
    borderTop:
      "1px solid #E9E8F3",
    backgroundColor:
      "#F8FCFF",
  },

  footer: {
    borderTop:
      "1px solid #E9E8F3",
    backgroundColor:
      "#FFFFFF",
  },

  footerText: {
    padding:
      "20px 24px",
    textAlign:
      "center",
    color:
      "#64748B",
    fontSize:
      "12px",
  },

  footerBrand: {
    color:
      "#00466D",
    fontWeight:
      "700",
  },
};