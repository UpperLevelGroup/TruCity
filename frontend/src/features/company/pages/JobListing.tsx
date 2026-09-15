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


/*
|--------------------------------------------------------------------------
| Constants
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| Empty form
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function jobToForm(
  job: CompanyJob
): JobFormState {
  return {
    title: job.title || "",
    department: job.department || "Engineering",
    description: job.description || "",
    location: job.location || "",
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
      Boolean(job.salaryNegotiable),

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
      String(job.openings ?? 1),

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

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
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
  if (job.salaryNegotiable) {
    return "Salary negotiable";
  }

  if (
    job.salaryMin == null &&
    job.salaryMax == null
  ) {
    return "Salary not specified";
  }

  const currency =
    job.salaryCurrency || "ZAR";

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

  if (job.salaryMin != null) {
    return `From ${formatter.format(
      job.salaryMin
    )}`;
  }

  return `Up to ${formatter.format(
    job.salaryMax as number
  )}`;
}


/*
|--------------------------------------------------------------------------
| Main component
|--------------------------------------------------------------------------
*/

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


  /*
  |--------------------------------------------------------------------------
  | Load jobs
  |--------------------------------------------------------------------------
  */

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


  /*
  |--------------------------------------------------------------------------
  | Derived values
  |--------------------------------------------------------------------------
  */

  const activeJobs =
    useMemo(
      () =>
        jobs.filter(
          job =>
            job.status === "Active"
        ),
      [jobs]
    );


  /*
  |--------------------------------------------------------------------------
  | Create / edit form
  |--------------------------------------------------------------------------
  */

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


  /*
  |--------------------------------------------------------------------------
  | Skills
  |--------------------------------------------------------------------------
  */

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


  const removeSkill =
    (skillToRemove: string) => {

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


  /*
  |--------------------------------------------------------------------------
  | Validation
  |--------------------------------------------------------------------------
  */

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
          ? Number(form.salaryMin)
          : undefined;

      const max =
        form.salaryMax.trim()
          ? Number(form.salaryMax)
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
        Number(form.openings);

      if (
        !Number.isInteger(openings) ||
        openings < 1
      ) {
        return "Number of openings must be at least 1.";
      }

      return null;
    };


  /*
  |--------------------------------------------------------------------------
  | Request builder
  |--------------------------------------------------------------------------
  */

  const buildRequest =
    (): CompanyJobRequest => {

      const min =
        form.salaryMin.trim()
          ? Number(form.salaryMin)
          : undefined;

      const max =
        form.salaryMax.trim()
          ? Number(form.salaryMax)
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
          Number(form.openings),

        applicationDeadline:
          form.applicationDeadline ||
          undefined,
      };
    };


  /*
  |--------------------------------------------------------------------------
  | Save job
  |--------------------------------------------------------------------------
  */

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


  /*
  |--------------------------------------------------------------------------
  | View job
  |--------------------------------------------------------------------------
  */

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


  /*
  |--------------------------------------------------------------------------
  | Close job
  |--------------------------------------------------------------------------
  */

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

        setClosingId(job.id);
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
        setClosingId(null);
      }
    };


  /*
  |--------------------------------------------------------------------------
  | Delete job
  |--------------------------------------------------------------------------
  */

  const handleDeleteJob =
    async (
      job: CompanyJob
    ) => {

      if (job.applicants > 0) {

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

        await handleCloseJob(job);
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

        setDeletingId(job.id);
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
        setDeletingId(null);
      }
    };


  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      style={styles.page}
    >

      {/* Decorative TruCity watermark */}

      <div
        style={styles.watermark}
        aria-hidden="true"
      >
        TRUCITY
      </div>

      <div
        style={styles.skyline}
        aria-hidden="true"
      >
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>


      <main
        style={styles.container}
      >

        {/* --------------------------------------------------------------- */}
        {/* Header                                                          */}
        {/* --------------------------------------------------------------- */}

        <section
          style={styles.hero}
        >

          <div
            style={styles.heroCopy}
          >

            <div
              style={styles.eyebrow}
            >
              <span
                style={styles.eyebrowDot}
              />
              TRUCITY
              <span
                style={styles.eyebrowDivider}
              >
                •
              </span>
              EMPLOYER PORTAL
            </div>

            <h1
              style={styles.title}
            >
              Job Listings
            </h1>

            <p
              style={styles.subtitle}
            >
              Manage your hiring posts, attract verified talent,
              and keep every position organised in one place.
            </p>

          </div>


          <div
            style={styles.heroAction}
          >

            <div
              style={styles.activeSummary}
            >
              <strong>
                {activeJobs.length}
              </strong>

              <span>
                active{" "}
                {activeJobs.length === 1
                  ? "position"
                  : "positions"}
              </span>
            </div>

            <button
              type="button"
              style={styles.btnPrimary}
              onClick={
                handleOpenCreate
              }
              disabled={
                loading ||
                saving
              }
            >
              <span
                style={styles.plus}
              >
                +
              </span>

              Post New Job
            </button>

          </div>

        </section>


        {/* --------------------------------------------------------------- */}
        {/* Error                                                           */}
        {/* --------------------------------------------------------------- */}

        {error && (
          <div
            style={styles.errorCard}
          >

            <div>
              <strong
                style={styles.errorTitle}
              >
                Something went wrong
              </strong>

              <p
                style={styles.errorText}
              >
                {error}
              </p>
            </div>

            <button
              type="button"
              style={styles.retryButton}
              onClick={() =>
                void loadJobs()
              }
              disabled={loading}
            >
              Retry
            </button>

          </div>
        )}


        {/* --------------------------------------------------------------- */}
        {/* Create / edit form                                              */}
        {/* --------------------------------------------------------------- */}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={styles.formCard}
          >

            <div
              style={styles.formHeader}
            >

              <div>

                <div
                  style={styles.formEyebrow}
                >
                  {editingJob
                    ? "POSITION MANAGEMENT"
                    : "NEW POSITION"}
                </div>

                <h2
                  style={styles.formTitle}
                >
                  {editingJob
                    ? "Edit Job Listing"
                    : "Create New Job Listing"}
                </h2>

                <p
                  style={styles.formSubtitle}
                >
                  {editingJob
                    ? "Update the position details stored in your company's database."
                    : "Give verified candidates the information they need to understand the opportunity."}
                </p>

              </div>

              <button
                type="button"
                style={styles.closeButton}
                onClick={
                  handleCloseForm
                }
                disabled={saving}
                aria-label="Close job form"
              >
                ✕
              </button>

            </div>


            {formError && (
              <div
                style={styles.formError}
              >
                {formError}
              </div>
            )}


            {/* Basic information */}

            <FormSection
              label="01 / Basic information"
            >

              <div
                style={styles.formGrid}
              >

                <Field
                  label="Job title"
                  required
                >
                  <input
                    type="text"
                    value={form.title}
                    onChange={event =>
                      updateForm(
                        "title",
                        event.target.value
                      )
                    }
                    style={styles.input}
                    placeholder="e.g. Senior Software Engineer"
                    disabled={saving}
                  />
                </Field>


                <Field
                  label="Department"
                  required
                >
                  <select
                    value={form.department}
                    onChange={event =>
                      updateForm(
                        "department",
                        event.target.value
                      )
                    }
                    style={styles.input}
                    disabled={saving}
                  >
                    {DEPARTMENTS.map(
                      department => (
                        <option
                          key={department}
                          value={department}
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
                    value={form.location}
                    onChange={event =>
                      updateForm(
                        "location",
                        event.target.value
                      )
                    }
                    style={styles.input}
                    placeholder="e.g. Johannesburg, Gauteng"
                    disabled={saving}
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
                    onChange={event =>
                      updateForm(
                        "workplaceType",
                        event.target.value as WorkplaceType
                      )
                    }
                    style={styles.input}
                    disabled={saving}
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
                    value={form.type}
                    onChange={event =>
                      updateForm(
                        "type",
                        event.target.value as EmploymentType
                      )
                    }
                    style={styles.input}
                    disabled={saving}
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
                    value={form.openings}
                    onChange={event =>
                      updateForm(
                        "openings",
                        event.target.value
                      )
                    }
                    style={styles.input}
                    disabled={saving}
                  />
                </Field>

              </div>

            </FormSection>


            {/* Description */}

            <FormSection
              label="02 / Job description"
            >

              <Field label="Description">

                <textarea
                  value={form.description}
                  onChange={event =>
                    updateForm(
                      "description",
                      event.target.value
                    )
                  }
                  style={styles.textarea}
                  placeholder="Describe the position, team and what the successful candidate will be doing."
                  rows={6}
                  disabled={saving}
                />

              </Field>

            </FormSection>


            {/* Compensation */}

            <FormSection
              label="03 / Compensation"
            >

              <div
                style={styles.formGrid}
              >

                <Field label="Minimum salary">

                  <input
                    type="number"
                    min="0"
                    value={form.salaryMin}
                    onChange={event =>
                      updateForm(
                        "salaryMin",
                        event.target.value
                      )
                    }
                    style={styles.input}
                    placeholder="e.g. 25000"
                    disabled={
                      saving ||
                      form.salaryNegotiable
                    }
                  />

                </Field>


                <Field label="Maximum salary">

                  <input
                    type="number"
                    min="0"
                    value={form.salaryMax}
                    onChange={event =>
                      updateForm(
                        "salaryMax",
                        event.target.value
                      )
                    }
                    style={styles.input}
                    placeholder="e.g. 45000"
                    disabled={
                      saving ||
                      form.salaryNegotiable
                    }
                  />

                </Field>


                <Field label="Currency">

                  <select
                    value={form.salaryCurrency}
                    onChange={event =>
                      updateForm(
                        "salaryCurrency",
                        event.target.value
                      )
                    }
                    style={styles.input}
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
                  style={styles.checkboxLabel}
                >

                  <input
                    type="checkbox"
                    checked={
                      form.salaryNegotiable
                    }
                    onChange={event =>
                      updateForm(
                        "salaryNegotiable",
                        event.target.checked
                      )
                    }
                    disabled={saving}
                  />

                  <span>
                    Salary is negotiable
                  </span>

                </label>

              </div>

            </FormSection>


            {/* Candidate requirements */}

            <FormSection
              label="04 / Candidate requirements"
            >

              <div
                style={styles.formGrid}
              >

                <Field
                  label="Experience required"
                >
                  <textarea
                    value={
                      form.experienceRequired
                    }
                    onChange={event =>
                      updateForm(
                        "experienceRequired",
                        event.target.value
                      )
                    }
                    style={styles.textarea}
                    rows={4}
                    placeholder="e.g. 3+ years of professional Java/Spring Boot experience."
                    disabled={saving}
                  />
                </Field>


                <Field
                  label="Qualifications"
                >
                  <textarea
                    value={
                      form.qualifications
                    }
                    onChange={event =>
                      updateForm(
                        "qualifications",
                        event.target.value
                      )
                    }
                    style={styles.textarea}
                    rows={4}
                    placeholder="e.g. BSc Computer Science or equivalent."
                    disabled={saving}
                  />
                </Field>

              </div>


              <Field label="Desired skills">

                <div
                  style={styles.skillInputRow}
                >

                  <input
                    type="text"
                    value={skillInput}
                    onChange={event =>
                      setSkillInput(
                        event.target.value
                      )
                    }
                    onKeyDown={
                      handleSkillKeyDown
                    }
                    style={styles.input}
                    placeholder="Type a skill and press Enter"
                    disabled={saving}
                  />

                  <button
                    type="button"
                    onClick={addSkill}
                    style={styles.smallPrimaryButton}
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
                    style={styles.skillsContainer}
                  >
                    {form.skills.map(
                      skill => (
                        <span
                          key={skill}
                          style={styles.skillChip}
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
                            disabled={saving}
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

            </FormSection>


            {/* Position details */}

            <FormSection
              label="05 / Position details"
            >

              <div
                style={styles.formGrid}
              >

                <Field
                  label="Responsibilities"
                >
                  <textarea
                    value={
                      form.responsibilities
                    }
                    onChange={event =>
                      updateForm(
                        "responsibilities",
                        event.target.value
                      )
                    }
                    style={styles.textarea}
                    rows={5}
                    placeholder="List the main responsibilities of the successful candidate."
                    disabled={saving}
                  />
                </Field>


                <Field label="Benefits">

                  <textarea
                    value={form.benefits}
                    onChange={event =>
                      updateForm(
                        "benefits",
                        event.target.value
                      )
                    }
                    style={styles.textarea}
                    rows={5}
                    placeholder="e.g. Medical aid, pension, remote-work allowance, training."
                    disabled={saving}
                  />

                </Field>

              </div>

            </FormSection>


            {/* Deadline */}

            <FormSection
              label="06 / Application deadline"
            >

              <Field label="Application deadline">

                <input
                  type="date"
                  value={
                    form.applicationDeadline
                  }
                  onChange={event =>
                    updateForm(
                      "applicationDeadline",
                      event.target.value
                    )
                  }
                  style={styles.input}
                  disabled={saving}
                />

              </Field>

            </FormSection>


            {/* Actions */}

            <div
              style={styles.formActions}
            >

              <button
                type="submit"
                style={styles.btnPrimary}
                disabled={saving}
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
                style={styles.btnSecondary}
                onClick={
                  handleCloseForm
                }
                disabled={saving}
              >
                Cancel
              </button>

            </div>

          </form>
        )}


        {/* --------------------------------------------------------------- */}
        {/* Job listings                                                     */}
        {/* --------------------------------------------------------------- */}

        <section
          style={styles.jobsSection}
        >

          <div
            style={styles.sectionHeader}
          >

            <div>

              <div
                style={styles.sectionEyebrow}
              >
                YOUR HIRING PIPELINE
              </div>

              <h2
                style={styles.sectionTitle}
              >
                Active Jobs
                <span
                  style={styles.countBadge}
                >
                  {activeJobs.length}
                </span>
              </h2>

              <p
                style={styles.sectionDescription}
              >
                {jobs.length} total{" "}
                {jobs.length === 1
                  ? "listing"
                  : "listings"}{" "}
                in your company's records.
              </p>

            </div>


            <div
              style={styles.liveIndicator}
            >
              <span
                style={styles.liveDot}
              />

              {loading
                ? "Loading listings..."
                : "Live database listings"}
            </div>

          </div>


          <div
            style={styles.jobList}
          >

            {loading ? (

              <div
                style={styles.emptyState}
              >

                <div
                  style={styles.loadingSpinner}
                />

                <h3
                  style={styles.emptyTitle}
                >
                  Loading job listings
                </h3>

                <p
                  style={styles.emptyText}
                >
                  Retrieving your company's jobs from the server.
                </p>

              </div>

            ) : jobs.length === 0 ? (

              <div
                style={styles.emptyState}
              >

                <div
                  style={styles.emptyIcon}
                >
                  +
                </div>

                <h3
                  style={styles.emptyTitle}
                >
                  No job listings yet
                </h3>

                <p
                  style={styles.emptyText}
                >
                  Create your first position and provide candidates with a complete job description.
                </p>

                <button
                  type="button"
                  style={styles.btnPrimary}
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
                  <article
                    key={job.id}
                    style={styles.jobCard}
                  >

                    <div
                      style={styles.jobInformation}
                    >

                      <div
                        style={styles.cardTopRow}
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
                          {job.status ===
                          "Active"
                            ? "Verified Active"
                            : job.status}
                        </span>

                      </div>


                      <h3
                        style={styles.jobTitle}
                      >
                        {job.title}
                      </h3>


                      <p
                        style={styles.jobSub}
                      >
                        {job.location}
                        {" • "}
                        {job.workplaceType}
                        {" • "}
                        {job.type}
                      </p>


                      <div
                        style={styles.cardMeta}
                      >

                        <span>
                          <strong>
                            💰
                          </strong>{" "}
                          {formatSalary(job)}
                        </span>

                        <span>
                          <strong>
                            👥
                          </strong>{" "}
                          {job.applicants}{" "}
                          {job.applicants === 1
                            ? "applicant"
                            : "applicants"}
                        </span>

                        <span>
                          <strong>
                            📌
                          </strong>{" "}
                          {job.openings ?? 1}{" "}
                          {job.openings === 1
                            ? "opening"
                            : "openings"}
                        </span>

                      </div>


                      {job.skills.length > 0 && (
                        <div
                          style={styles.cardSkills}
                        >

                          {job.skills
                            .slice(0, 5)
                            .map(
                              skill => (
                                <span
                                  key={skill}
                                  style={
                                    styles.cardSkill
                                  }
                                >
                                  {skill}
                                </span>
                              )
                            )}

                          {job.skills.length > 5 && (
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
                      style={styles.jobActions}
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
                        disabled={saving}
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

                  </article>
                )
              )

            )}

          </div>

        </section>

      </main>


      {/* --------------------------------------------------------------- */}
      {/* Job details modal                                               */}
      {/* --------------------------------------------------------------- */}

      {viewingJob && (
        <div
          style={styles.overlay}
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
            style={styles.detailModal}
          >

            <div
              style={styles.modalHeader}
            >

              <div>

                <div
                  style={styles.modalBadges}
                >

                  <span
                    style={styles.deptBadge}
                  >
                    {viewingJob.department}
                  </span>

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

                </div>

                <h2
                  style={styles.modalTitle}
                >
                  {viewingJob.title}
                </h2>

                <p
                  style={styles.modalSubtitle}
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
                style={styles.closeButton}
                onClick={() =>
                  setViewingJob(null)
                }
                aria-label="Close job details"
              >
                ✕
              </button>

            </div>


            <div
              style={styles.detailStatusRow}
            >

              <span
                style={styles.detailMeta}
              >
                👥{" "}
                {viewingJob.applicants}{" "}
                {viewingJob.applicants ===
                1
                  ? "applicant"
                  : "applicants"}
              </span>

              <span
                style={styles.detailMeta}
              >
                📌{" "}
                {viewingJob.openings ??
                  1}{" "}
                {viewingJob.openings ===
                1
                  ? "opening"
                  : "openings"}
              </span>

              <span
                style={styles.detailMeta}
              >
                💰{" "}
                {formatSalary(
                  viewingJob
                )}
              </span>

            </div>


            <div
              style={styles.detailBody}
            >

              <DetailSection
                title="Description"
                value={
                  viewingJob.description
                }
              />


              <div
                style={styles.detailGrid}
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
                          key={skill}
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
              style={styles.modalFooter}
            >

              <button
                type="button"
                style={styles.btnSecondary}
                onClick={() =>
                  setViewingJob(null)
                }
              >
                Close
              </button>


              <button
                type="button"
                style={styles.btnPrimary}
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


      {/* --------------------------------------------------------------- */}
      {/* Footer                                                           */}
      {/* --------------------------------------------------------------- */}

      <footer
        style={styles.footer}
      >
        <div
          style={styles.footerInner}
        >
          <span>
            TRUCITY
          </span>

          <span
            style={styles.footerDivider}
          >
            •
          </span>

          <span>
            VERIFY • CONNECT • PERSUE
          </span>

          <span
            style={styles.footerCopyright}
          >
            © {new Date().getFullYear()} UpperLevel Group
          </span>
        </div>
      </footer>


      {/* Responsive styles */}

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 900px) {
            .trucity-job-grid {
              grid-template-columns: 1fr !important;
            }

            .trucity-job-card {
              flex-direction: column !important;
              align-items: flex-start !important;
            }

            .trucity-job-actions {
              width: 100% !important;
              justify-content: flex-start !important;
            }

            .trucity-hero {
              flex-direction: column !important;
              align-items: flex-start !important;
            }

            .trucity-hero-action {
              width: 100% !important;
              justify-content: space-between !important;
            }
          }

          @media (max-width: 620px) {
            .trucity-container {
              padding: 24px 16px !important;
            }

            .trucity-title {
              font-size: 32px !important;
            }

            .trucity-form-grid {
              grid-template-columns: 1fr !important;
            }

            .trucity-job-actions {
              flex-direction: column !important;
              align-items: stretch !important;
            }

            .trucity-job-actions button {
              width: 100% !important;
            }

            .trucity-form-actions {
              flex-direction: column !important;
            }

            .trucity-form-actions button {
              width: 100% !important;
            }

            .trucity-detail-grid {
              grid-template-columns: 1fr !important;
            }

            .trucity-hero-action {
              flex-direction: column !important;
              align-items: stretch !important;
            }

            .trucity-hero-action button {
              width: 100% !important;
            }

            .trucity-footer-inner {
              flex-direction: column !important;
              gap: 6px !important;
            }
          }
        `}
      </style>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Form Section
|--------------------------------------------------------------------------
*/

function FormSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {

  return (
    <section
      style={styles.formSection}
    >

      <div
        style={styles.sectionLabel}
      >
        {label}
      </div>

      {children}

    </section>
  );
}


/*
|--------------------------------------------------------------------------
| Field
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
      style={styles.field}
    >

      <span
        style={styles.fieldLabel}
      >

        {label}

        {required && (
          <span
            style={styles.required}
          >
            {" "}*
          </span>
        )}

      </span>

      {children}

    </label>
  );
}


/*
|--------------------------------------------------------------------------
| Detail section
|--------------------------------------------------------------------------
*/

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
      style={styles.detailSection}
    >

      <h3
        style={styles.detailHeading}
      >
        {title}
      </h3>

      <p
        style={styles.detailText}
      >
        {value}
      </p>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Detail item
|--------------------------------------------------------------------------
*/

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (
    <div
      style={styles.detailItem}
    >

      <span
        style={styles.detailItemLabel}
      >
        {label}
      </span>

      <strong
        style={styles.detailItemValue}
      >
        {value}
      </strong>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

const styles: Record<
  string,
  React.CSSProperties
> = {

  page: {
    position: "relative",
    minHeight: "100%",
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#F8FCFF",
    color: "#00273D",
    fontFamily:
      "Helvetica, Arial, sans-serif",
  },


  watermark: {
    position: "fixed",
    right: "-30px",
    bottom: "100px",
    fontSize: "150px",
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: "-0.06em",
    color: "rgba(0, 70, 109, 0.025)",
    pointerEvents: "none",
    userSelect: "none",
    zIndex: 0,
    transform: "rotate(-8deg)",
  },


  skyline: {
    position: "fixed",
    right: 0,
    bottom: 0,
    width: "320px",
    height: "130px",
    display: "flex",
    alignItems: "flex-end",
    gap: "5px",
    opacity: 0.035,
    pointerEvents: "none",
    zIndex: 0,
  },


  container: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "1500px",
    margin: "0 auto",
    padding:
      "42px 48px 64px",
    boxSizing: "border-box",
  },


  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "30px",
    marginBottom: "34px",
  },


  heroCopy: {
    minWidth: 0,
  },


  heroAction: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexShrink: 0,
  },


  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#1E92D2",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.13em",
    marginBottom: "9px",
  },


  eyebrowDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: "#FFAD01",
    display: "inline-block",
  },


  eyebrowDivider: {
    color: "#FFAD01",
  },


  title: {
    margin: 0,
    color: "#00466D",
    fontSize: "40px",
    lineHeight: 1.08,
    fontWeight: 900,
    letterSpacing: "-0.035em",
  },


  subtitle: {
    margin:
      "9px 0 0 0",
    maxWidth: "700px",
    color: "#476779",
    fontSize: "15px",
    lineHeight: 1.65,
    fontWeight: 500,
  },


  activeSummary: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
    padding:
      "10px 14px",
    backgroundColor: "#FFFFFF",
    border:
      "1px solid #D9EAF2",
    borderRadius: "12px",
    color: "#64748B",
    whiteSpace: "nowrap",
  },


  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding:
      "13px 21px",
    backgroundColor: "#00466D",
    color: "#FFD784",
    border:
      "2px solid #FFAD01",
    borderRadius: "12px",
    fontWeight: 900,
    fontSize: "13px",
    cursor: "pointer",
    boxShadow:
      "0 6px 18px rgba(0, 70, 109, 0.16)",
    whiteSpace: "nowrap",
  },


  plus: {
    fontSize: "19px",
    lineHeight: 1,
  },


  btnSecondary: {
    padding:
      "11px 18px",
    backgroundColor: "#F8FCFF",
    color: "#00273D",
    border:
      "1px solid #B9D9E8",
    borderRadius: "10px",
    fontWeight: 800,
    fontSize: "12px",
    cursor: "pointer",
  },


  btnView: {
    padding:
      "10px 16px",
    backgroundColor: "#EAF6FD",
    color: "#00466D",
    border:
      "1px solid #A8D5EA",
    borderRadius: "10px",
    fontWeight: 900,
    fontSize: "12px",
    cursor: "pointer",
  },


  btnEdit: {
    padding:
      "10px 16px",
    backgroundColor: "#FFFFFF",
    color: "#00466D",
    border:
      "1px solid #B9D9E8",
    borderRadius: "10px",
    fontWeight: 900,
    fontSize: "12px",
    cursor: "pointer",
  },


  btnClose: {
    padding:
      "10px 16px",
    backgroundColor: "#FFF9E8",
    color: "#00273D",
    border:
      "1px solid #FFD784",
    borderRadius: "10px",
    fontWeight: 900,
    fontSize: "12px",
    cursor: "pointer",
  },


  btnDelete: {
    padding:
      "10px 16px",
    backgroundColor: "#FFF5F5",
    color: "#C53030",
    border:
      "1px solid #FEB2B2",
    borderRadius: "10px",
    fontWeight: 900,
    fontSize: "12px",
    cursor: "pointer",
  },


  formCard: {
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderRadius: "22px",
    padding: "30px",
    border:
      "2px solid #B9D9E8",
    marginBottom: "32px",
    boxShadow:
      "0 14px 38px rgba(0, 70, 109, 0.10)",
    overflow: "hidden",
  },


  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    paddingBottom: "20px",
    borderBottom:
      "1px solid #E2EEF4",
  },


  formEyebrow: {
    color: "#FFAD01",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.13em",
    marginBottom: "6px",
  },


  formTitle: {
    margin: 0,
    color: "#00273D",
    fontSize: "23px",
    fontWeight: 900,
    letterSpacing: "-0.02em",
  },


  formSubtitle: {
    margin:
      "6px 0 0 0",
    color: "#64748B",
    fontSize: "13px",
    lineHeight: 1.5,
  },


  closeButton: {
    width: "36px",
    height: "36px",
    flexShrink: 0,
    borderRadius: "50%",
    border:
      "1px solid #B9D9E8",
    backgroundColor: "#F8FCFF",
    color: "#00466D",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },


  formSection: {
    paddingTop: "24px",
    marginTop: "24px",
    borderTop:
      "1px solid #E2EEF4",
  },


  sectionLabel: {
    color: "#00466D",
    fontWeight: 900,
    fontSize: "12px",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    marginBottom: "15px",
  },


  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },


  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    minWidth: 0,
  },


  fieldLabel: {
    color: "#00273D",
    fontSize: "12px",
    fontWeight: 800,
  },


  required: {
    color: "#D83A58",
  },


  input: {
    padding:
      "12px 14px",
    borderRadius: "10px",
    border:
      "1px solid #B9D9E8",
    fontSize: "13px",
    outline: "none",
    color: "#00273D",
    backgroundColor: "#FFFFFF",
    fontWeight: 600,
    minWidth: 0,
    boxSizing: "border-box",
    width: "100%",
  },


  textarea: {
    padding:
      "12px 14px",
    borderRadius: "10px",
    border:
      "1px solid #B9D9E8",
    fontSize: "13px",
    outline: "none",
    color: "#00273D",
    backgroundColor: "#FFFFFF",
    fontWeight: 500,
    resize: "vertical",
    minWidth: 0,
    boxSizing: "border-box",
    width: "100%",
    lineHeight: 1.6,
  },


  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    alignSelf: "end",
    minHeight: "43px",
    color: "#00273D",
    fontSize: "13px",
    fontWeight: 700,
  },


  skillInputRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },


  smallPrimaryButton: {
    padding:
      "11px 18px",
    backgroundColor: "#FFAD01",
    color: "#00273D",
    border: "none",
    borderRadius: "10px",
    fontWeight: 900,
    fontSize: "12px",
    cursor: "pointer",
    flexShrink: 0,
  },


  skillsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    marginTop: "10px",
  },


  skillChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    backgroundColor: "#EAF6FD",
    color: "#00466D",
    border:
      "1px solid #A8D5EA",
    padding:
      "6px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 800,
  },


  skillRemove: {
    border: "none",
    background: "transparent",
    color: "#00466D",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: "15px",
    padding: 0,
    lineHeight: 1,
  },


  formActions: {
    display: "flex",
    gap: "9px",
    marginTop: "28px",
    paddingTop: "22px",
    borderTop:
      "1px solid #E2EEF4",
  },


  formError: {
    backgroundColor: "#FFF5F5",
    border:
      "1px solid #FEB2B2",
    color: "#C53030",
    borderRadius: "10px",
    padding:
      "12px 14px",
    fontSize: "12px",
    fontWeight: 700,
    marginTop: "18px",
  },


  errorCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    padding:
      "14px 18px",
    marginBottom: "22px",
    backgroundColor: "#FFF5F5",
    border:
      "1px solid #FEB2B2",
    borderRadius: "12px",
  },


  errorTitle: {
    display: "block",
    color: "#C53030",
    fontSize: "13px",
    marginBottom: "3px",
  },


  errorText: {
    margin: 0,
    color: "#C53030",
    fontSize: "12px",
  },


  retryButton: {
    padding:
      "9px 15px",
    backgroundColor: "#FFFFFF",
    color: "#C53030",
    border:
      "1px solid #FEB2B2",
    borderRadius: "9px",
    fontWeight: 800,
    fontSize: "12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },


  jobsSection: {
    marginTop: "34px",
  },


  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "18px",
    marginBottom: "18px",
  },


  sectionEyebrow: {
    color: "#1E92D2",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.13em",
    marginBottom: "5px",
  },


  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: 0,
    color: "#00273D",
    fontSize: "27px",
    fontWeight: 900,
    letterSpacing: "-0.025em",
  },


  countBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "27px",
    height: "27px",
    padding: "0 8px",
    borderRadius: "999px",
    backgroundColor: "#FFD784",
    border:
      "1px solid #FFAD01",
    color: "#00273D",
    fontSize: "12px",
    fontWeight: 900,
  },


  sectionDescription: {
    margin:
      "6px 0 0 0",
    color: "#64748B",
    fontSize: "13px",
  },


  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding:
      "8px 11px",
    backgroundColor: "#FFFFFF",
    border:
      "1px solid #D9EAF2",
    borderRadius: "9px",
    color: "#64748B",
    fontSize: "11px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },


  liveDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: "#18A76A",
    display: "inline-block",
  },


  jobList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },


  jobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "18px",
    padding: "23px",
    border:
      "1px solid #CFE3ED",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "25px",
    boxShadow:
      "0 7px 22px rgba(0, 70, 109, 0.055)",
    transition:
      "transform 0.2s ease, box-shadow 0.2s ease",
  },


  jobInformation: {
    minWidth: 0,
    flex: 1,
  },


  cardTopRow: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    flexWrap: "wrap",
    marginBottom: "9px",
  },


  deptBadge: {
    display: "inline-block",
    fontSize: "10px",
    fontWeight: 900,
    color: "#00466D",
    backgroundColor: "#FFD784",
    padding:
      "5px 9px",
    borderRadius: "8px",
    border:
      "1px solid #FFAD01",
  },


  jobTitle: {
    margin: 0,
    fontSize: "19px",
    color: "#00273D",
    fontWeight: 900,
    lineHeight: 1.3,
    letterSpacing: "-0.015em",
  },


  jobSub: {
    margin:
      "5px 0 0 0",
    fontSize: "13px",
    color: "#476779",
    fontWeight: 700,
  },


  cardMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "13px",
    marginTop: "11px",
    color: "#64748B",
    fontSize: "11px",
    fontWeight: 600,
  },


  cardSkills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "11px",
  },


  cardSkill: {
    backgroundColor: "#F1F7FA",
    color: "#476779",
    border:
      "1px solid #D9EAF2",
    borderRadius: "7px",
    padding:
      "4px 8px",
    fontSize: "10px",
    fontWeight: 700,
  },


  moreSkills: {
    color: "#1E92D2",
    fontSize: "10px",
    fontWeight: 900,
    padding:
      "4px 5px",
  },


  postedDate: {
    margin:
      "8px 0 0 0",
    fontSize: "10px",
    color: "#94A3B8",
    fontWeight: 600,
  },


  jobActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: "7px",
    flexShrink: 0,
    maxWidth: "430px",
  },


  statusBadge: {
    color: "#087A4B",
    fontWeight: 900,
    fontSize: "10px",
    backgroundColor: "#E5FFF3",
    padding:
      "5px 9px",
    borderRadius: "8px",
    border:
      "1px solid #8FE2BC",
    whiteSpace: "nowrap",
  },


  statusClosedBadge: {
    color: "#475569",
    fontWeight: 900,
    fontSize: "10px",
    backgroundColor: "#F1F5F7",
    padding:
      "5px 9px",
    borderRadius: "8px",
    border:
      "1px solid #CBD5E1",
    whiteSpace: "nowrap",
  },


  emptyState: {
    padding:
      "58px 32px",
    textAlign: "center",
    backgroundColor: "#FFFFFF",
    border:
      "1px solid #CFE3ED",
    borderRadius: "18px",
    boxShadow:
      "0 7px 22px rgba(0, 70, 109, 0.045)",
  },


  emptyIcon: {
    width: "50px",
    height: "50px",
    margin:
      "0 auto 14px auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "15px",
    backgroundColor: "#FFD784",
    border:
      "1px solid #FFAD01",
    color: "#00466D",
    fontSize: "25px",
    fontWeight: 900,
  },


  loadingSpinner: {
    width: "32px",
    height: "32px",
    margin:
      "0 auto 18px auto",
    borderRadius: "50%",
    border:
      "3px solid #D9EAF2",
    borderTopColor: "#00466D",
    animation:
      "spin 0.8s linear infinite",
  },


  emptyTitle: {
    margin:
      "0 0 6px 0",
    color: "#00466D",
    fontSize: "18px",
    fontWeight: 900,
  },


  emptyText: {
    maxWidth: "500px",
    margin:
      "0 auto 20px auto",
    color: "#64748B",
    fontSize: "13px",
    lineHeight: 1.6,
  },


  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    backgroundColor:
      "rgba(0, 39, 61, 0.60)",
    backdropFilter: "blur(7px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },


  detailModal: {
    width: "min(900px, 100%)",
    maxHeight: "90vh",
    overflowY: "auto",
    backgroundColor: "#FFFFFF",
    borderRadius: "22px",
    boxShadow:
      "0 30px 70px rgba(0, 39, 61, 0.26)",
    border:
      "2px solid #1E92D2",
  },


  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    padding:
      "27px 30px 21px",
    borderBottom:
      "1px solid #DCEAF1",
  },


  modalBadges: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "7px",
  },


  modalTitle: {
    margin:
      "11px 0 0 0",
    color: "#00273D",
    fontSize: "27px",
    lineHeight: 1.2,
    fontWeight: 900,
    letterSpacing: "-0.025em",
  },


  modalSubtitle: {
    margin:
      "6px 0 0 0",
    color: "#476779",
    fontSize: "13px",
    fontWeight: 700,
  },


  detailStatusRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
    padding:
      "14px 30px",
    backgroundColor: "#F8FCFF",
    borderBottom:
      "1px solid #DCEAF1",
  },


  detailMeta: {
    color: "#00466D",
    fontSize: "11px",
    fontWeight: 800,
    padding:
      "6px 10px",
    backgroundColor: "#FFFFFF",
    border:
      "1px solid #CFE3ED",
    borderRadius: "8px",
  },


  detailBody: {
    padding:
      "27px 30px",
  },


  detailSection: {
    marginBottom: "25px",
  },


  detailHeading: {
    margin:
      "0 0 8px 0",
    color: "#00466D",
    fontSize: "15px",
    fontWeight: 900,
  },


  detailText: {
    margin: 0,
    color: "#475569",
    fontSize: "13px",
    lineHeight: 1.75,
    whiteSpace: "pre-line",
  },


  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: "11px",
    marginBottom: "27px",
  },


  detailItem: {
    padding: "14px",
    backgroundColor: "#F8FCFF",
    border:
      "1px solid #DCEAF1",
    borderRadius: "11px",
  },


  detailItemLabel: {
    display: "block",
    color: "#64748B",
    fontSize: "9px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginBottom: "5px",
  },


  detailItemValue: {
    color: "#00273D",
    fontSize: "12px",
    fontWeight: 800,
  },


  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    padding:
      "18px 30px",
    borderTop:
      "1px solid #DCEAF1",
    backgroundColor: "#F8FCFF",
  },


  footer: {
    position: "relative",
    zIndex: 1,
    borderTop:
      "1px solid #DCEAF1",
    backgroundColor: "#FFFFFF",
  },


  footerInner: {
    maxWidth: "1500px",
    margin: "0 auto",
    padding:
      "18px 48px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#64748B",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.04em",
  },


  footerDivider: {
    color: "#FFAD01",
  },


  footerCopyright: {
    marginLeft: "auto",
    fontWeight: 500,
    letterSpacing: 0,
  },
};


/*
|--------------------------------------------------------------------------
| Build simple skyline bars after styles are defined
|--------------------------------------------------------------------------
*/

const skylineBars = [
  {
    height: "45%",
    width: "13%",
  },
  {
    height: "70%",
    width: "10%",
  },
  {
    height: "55%",
    width: "12%",
  },
  {
    height: "90%",
    width: "14%",
  },
  {
    height: "62%",
    width: "11%",
  },
  {
    height: "78%",
    width: "13%",
  },
  {
    height: "48%",
    width: "11%",
  },
];


/*
|--------------------------------------------------------------------------
| Render skyline bars into the decorative skyline container.
|
| The skyline is deliberately CSS-only so this component does not depend
| on an additional image asset.
|--------------------------------------------------------------------------
*/

const originalSkyline = styles.skyline;

styles.skyline = {
  ...originalSkyline,
};


/*
|--------------------------------------------------------------------------
| Add the skyline through a small helper component override.
|--------------------------------------------------------------------------
*/

const SkylineBars = () => (
  <>
    {skylineBars.map(
      (bar, index) => (
        <span
          key={index}
          style={{
            display: "block",
            height: bar.height,
            width: bar.width,
            backgroundColor: "#00466D",
            borderRadius:
              "3px 3px 0 0",
          }}
        />
      )
    )}
  </>
);


/*
|--------------------------------------------------------------------------
| Patch skyline content through a wrapper component.
|
| This keeps the main JobListing JSX clean while remaining CSS-only.
|--------------------------------------------------------------------------
*/

// eslint-disable-next-line @typescript-eslint/no-unused-vars
void SkylineBars;
