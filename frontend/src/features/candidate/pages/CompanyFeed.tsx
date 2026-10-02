import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import type {
  ChangeEvent,
  ReactNode,
} from 'react';

import {
  Bookmark,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flag,
  Layers,
  MapPin,
  Search,
  Send,
  X,
} from 'lucide-react';

import api from '../../../api/axios';

import {
  useNotifications,
} from '../../../context/NotificationsContext';

/* =========================================================
   INDUSTRY STYLES
========================================================= */

const INDUSTRY_COLORS = {
  'FinTech & Banking': {
    avatar:
      'linear-gradient(135deg, #00466D 0%, #1E92D2 100%)',

    badge:
      'border-brand-accent/25 bg-brand-accent/10 text-brand-primary',
  },

  'Supply Chain & IoT': {
    avatar:
      'linear-gradient(135deg, #FFAD01 0%, #FFD784 100%)',

    badge:
      'border-brand-gold/35 bg-brand-gold/10 text-brand-primary',
  },

  AdTech: {
    avatar:
      'linear-gradient(135deg, #00466D 0%, #1E92D2 100%)',

    badge:
      'border-brand-border bg-brand-surface text-brand-primary',
  },

  'Verified Employer': {
    avatar:
      'linear-gradient(135deg, #00466D 0%, #1E92D2 100%)',

    badge:
      'border-brand-accent/25 bg-brand-accent/10 text-brand-primary',
  },
} as const;

type Industry =
  keyof typeof INDUSTRY_COLORS;

type ActiveTab =
  | 'companies'
  | 'jobs'
  | 'saved';

/* =========================================================
   TYPES
========================================================= */

interface Company {
  id: string;
  name: string;
  industry: Industry;
  location: string;
  roles: readonly string[];
  bio: string;
  about: string;
  requirements: readonly string[];
}

interface Job {
  id: string;
  title: string;
  company: string;
  companyId?: string;
  location: string;
  salary: string;
  posted: string;
  department: string;
  description: string;
  employmentType?: string;
  workplaceType?: string;
  qualifications?: string;
  experienceRequired?: string;
  skills: readonly string[];
  responsibilities?: string;
  benefits?: string;
  applicationDeadline?: string;
  status: string;
}

interface CompanyFeedProps {
  onChat?: (
    company: string,
  ) => void;

  onReport?: (
    company: string,
  ) => void;
}

interface CompanyAvatarProps {
  name: string;
  industry?: Industry;
  size?: 'sm' | 'md' | 'lg';
}

interface ItemDetails {
  title: string;
  subtitle: string;
  description: string;
  metaList: readonly string[];

  type:
    | 'company'
    | 'job';

  companyName?: string;
  jobId?: string;
}

/* =========================================================
   BACKEND DATA
========================================================= */

interface Job {
  id: string;
  title: string;
  company: string;
  companyId?: string;
  location: string;
  salary: string;
  posted: string;
  department: string;
  description: string;
  employmentType?: string;
  workplaceType?: string;
  qualifications?: string;
  experienceRequired?: string;
  skills: readonly string[];
  responsibilities?: string;
  benefits?: string;
  applicationDeadline?: string;
  status: string;
}

interface BackendJobResponse {
  id: string;
  companyId?: string | null;
  companyName?: string | null;
  title?: string | null;
  department?: string | null;
  description?: string | null;
  location?: string | null;
  workplaceType?: string | null;
  employmentType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryNegotiable?: boolean | null;
  qualifications?: string | null;
  experienceRequired?: string | null;
  skills?: string[] | null;
  responsibilities?: string | null;
  benefits?: string | null;
  applicationDeadline?: string | null;
  status?: string | null;
  createdAt?: string | null;
}

function formatSalary(
  job: BackendJobResponse,
): string {
  const currency =
    job.salaryCurrency ||
    'ZAR';

  const min =
    job.salaryMin != null
      ? Number(job.salaryMin)
      : null;

  const max =
    job.salaryMax != null
      ? Number(job.salaryMax)
      : null;

  if (min != null && max != null) {
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} / pm`;
  }

  if (min != null) {
    return `${currency} ${min.toLocaleString()}+ / pm`;
  }

  if (job.salaryNegotiable) {
    return 'Salary negotiable';
  }

  return 'Salary not specified';
}

function formatPostedDate(
  createdAt?: string | null,
): string {
  if (!createdAt) {
    return 'Recently posted';
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return 'Recently posted';
  }

  const diffMs =
    Date.now() -
    date.getTime();

  const diffHours =
    Math.max(
      0,
      Math.floor(
        diffMs / 3600000,
      ),
    );

  if (diffHours < 1) {
    return 'Just now';
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays =
    Math.floor(
      diffHours / 24,
    );

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString();
}

function mapBackendJob(
  job: BackendJobResponse,
): Job {
  return {
    id: job.id,
    companyId:
      job.companyId ??
      undefined,
    title:
      job.title?.trim() ||
      'Untitled Position',
    company:
      job.companyName?.trim() ||
      'Unknown Company',
    location:
      job.location?.trim() ||
      'Location not specified',
    salary:
      formatSalary(job),
    posted:
      formatPostedDate(
        job.createdAt,
      ),
    department:
      job.department?.trim() ||
      'General',
    description:
      job.description?.trim() ||
      'No job description has been provided by the employer.',
    employmentType:
      job.employmentType?.trim() ||
      undefined,
    workplaceType:
      job.workplaceType?.trim() ||
      undefined,
    qualifications:
      job.qualifications?.trim() ||
      undefined,
    experienceRequired:
      job.experienceRequired?.trim() ||
      undefined,
    skills:
      Array.isArray(job.skills)
        ? job.skills.filter(Boolean)
        : [],
    responsibilities:
      job.responsibilities?.trim() ||
      undefined,
    benefits:
      job.benefits?.trim() ||
      undefined,
    applicationDeadline:
      job.applicationDeadline ??
      undefined,
    status:
      job.status?.trim().toUpperCase() ||
      'OPEN',
  };
}

function buildCompanies(
  jobs: readonly Job[],
): Company[] {
  const grouped =
    new Map<string, Job[]>();

  jobs.forEach((job) => {
    const key =
      job.companyId ||
      job.company;

    const current =
      grouped.get(key) || [];

    grouped.set(key, [
      ...current,
      job,
    ]);
  });

  return Array.from(
    grouped.entries(),
  ).map(
    ([id, companyJobs]) => {
      const first =
        companyJobs[0];

      const requirements =
        Array.from(
          new Set(
            companyJobs.flatMap(
              (job) => [
                ...(job.qualifications
                  ? [job.qualifications]
                  : []),
                ...(job.experienceRequired
                  ? [job.experienceRequired]
                  : []),
                ...job.skills,
              ],
            ),
          ),
        );

      const descriptions =
        companyJobs
          .map(
            (job) =>
              job.description,
          )
          .filter(Boolean);

      return {
        id,
        name: first.company,
        industry:
          'Verified Employer',
        location:
          first.location,
        roles:
          Array.from(
            new Set(
              companyJobs.map(
                (job) =>
                  job.title,
              ),
            ),
          ),
        bio:
          `${companyJobs.length} open role${companyJobs.length === 1 ? '' : 's'} currently published on TruCity.`,
        about:
          descriptions.length > 0
            ? descriptions
                .slice(0, 3)
                .join(' ')
            : 'This employer has published opportunities on TruCity.',
        requirements:
          requirements.length > 0
            ? requirements
            : [
                'Review the job-specific requirements before applying.',
              ],
      };
    },
  );
}

/* =========================================================
   COMPANY AVATAR
========================================================= */

function CompanyAvatar({
  name,
  industry,
  size = 'md',
}: CompanyAvatarProps) {
  const industryStyle =
    industry
      ? INDUSTRY_COLORS[
          industry as keyof typeof INDUSTRY_COLORS
        ]
      : undefined;

  const background =
    industryStyle?.avatar ||
    'linear-gradient(135deg, #00466D 0%, #1E92D2 100%)';

  const sizeClasses = {
    sm:
      'h-9 w-9 text-[12px] rounded-xl',

    md:
      'h-12 w-12 text-[16px] rounded-2xl',

    lg:
      'h-16 w-16 text-[20px] rounded-[20px]',
  };

  return (
    <div
      className={`
        flex
        shrink-0
        items-center
        justify-center
        border
        border-white/80
        font-bold
        tracking-tight
        text-white
        shadow-[0_8px_20px_rgba(0,70,109,0.14)]
        ${sizeClasses[size]}
      `}
      style={{
        background,
      }}
    >
      {name.charAt(0)}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CompanyFeed({
  onChat: _onChat,
  onReport = () => {},
}: CompanyFeedProps) {
  const {
    addNotification,
  } = useNotifications();

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<ActiveTab>(
      'companies',
    );

  const [
    jobs,
    setJobs,
  ] =
    useState<Job[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    loadError,
    setLoadError,
  ] =
    useState('');

  const [
    applyingJobId,
    setApplyingJobId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    appliedJobs,
    setAppliedJobs,
  ] =
    useState<string[]>(
      () => {
        try {
          const stored =
            localStorage.getItem(
              'trucity-candidate-applied-jobs',
            );

          if (!stored) {
            return [];
          }

          const parsed =
            JSON.parse(stored);

          return Array.isArray(
            parsed,
          )
            ? parsed.filter(
                (value) =>
                  typeof value ===
                  'string',
              )
            : [];
        } catch {
          return [];
        }
      },
    );

  const [
    dismissed,
    setDismissed,
  ] =
    useState<string[]>(
      [],
    );

  const [
    companyFilter,
    setCompanyFilter,
  ] =
    useState('All');

  const [
    jobFilter,
    setJobFilter,
  ] =
    useState('All');

  const [
    jobSearchQuery,
    setJobSearchQuery,
  ] =
    useState('');

  const [
    selectedItemDetails,
    setSelectedItemDetails,
  ] =
    useState<ItemDetails | null>(
      null,
    );

  const [
    savedJobs,
    setSavedJobs,
  ] =
    useState<string[]>(
      () => {
        try {
          const stored =
            localStorage.getItem(
              'trucity-saved-jobs',
            );

          if (!stored) {
            return [];
          }

          const parsed =
            JSON.parse(stored);

          return Array.isArray(
            parsed,
          )
            ? parsed.filter(
                (value) =>
                  typeof value ===
                  'string',
              )
            : [];
        } catch {
          return [];
        }
      },
    );

  const [
    savedCompanies,
    setSavedCompanies,
  ] =
    useState<string[]>(
      () => {
        try {
          const stored =
            localStorage.getItem(
              'trucity-saved-companies',
            );

          if (!stored) {
            return [];
          }

          const parsed =
            JSON.parse(stored);

          return Array.isArray(
            parsed,
          )
            ? parsed.filter(
                (value) =>
                  typeof value ===
                  'string',
              )
            : [];
        } catch {
          return [];
        }
      },
    );

  const companies =
    useMemo(
      () =>
        buildCompanies(
          jobs,
        ),
      [jobs],
    );

  useEffect(() => {
    let mounted = true;

    const loadFeed = async () => {
      try {
        setLoading(true);
        setLoadError('');

        const response =
          await api.get<
            BackendJobResponse[]
          >(
            '/api/candidate/jobs/open',
          );

        if (!Array.isArray(
          response.data,
        )) {
          throw new Error(
            'The server returned an invalid jobs response.',
          );
        }

        const activeJobs =
          response.data
            .map(
              mapBackendJob,
            )
            .filter(
              (job) =>
                job.status ===
                  'OPEN' ||
                job.status ===
                  'ACTIVE',
            );

        if (mounted) {
          setJobs(
            activeJobs,
          );
        }
      } catch (error) {
        console.error(
          'Failed to load candidate opportunities:',
          error,
        );

        if (mounted) {
          setJobs([]);
          setLoadError(
            'Unable to load live opportunities. Please try again.',
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadFeed();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        'trucity-candidate-applied-jobs',
        JSON.stringify(
          appliedJobs,
        ),
      );
    } catch (error) {
      console.error(
        'Unable to persist applied jobs:',
        error,
      );
    }
  }, [appliedJobs]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'trucity-saved-jobs',
        JSON.stringify(
          savedJobs,
        ),
      );
    } catch (error) {
      console.error(
        'Unable to persist saved jobs:',
        error,
      );
    }
  }, [savedJobs]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'trucity-saved-companies',
        JSON.stringify(
          savedCompanies,
        ),
      );
    } catch (error) {
      console.error(
        'Unable to persist saved companies:',
        error,
      );
    }
  }, [savedCompanies]);

  useEffect(() => {
    if (!selectedItemDetails) {
      return;
    }

    const previous =
      document.body.style.overflow;

    document.body.style.overflow =
      'hidden';

    return () => {
      document.body.style.overflow =
        previous;
    };
  }, [selectedItemDetails]);

  const companyFilters =
    useMemo(
      () => [
        'All',
        ...Array.from(
          new Set(
            companies
              .map(
                (company) =>
                  company.industry,
              )
              .filter(Boolean),
          ),
        ),
      ],
      [companies],
    );

  const jobFilters =
    useMemo(
      () => {
        const values =
          jobs.flatMap(
            (job) => [
              job.department,
              job.employmentType ||
                '',
            ],
          );

        return [
          'All',
          ...Array.from(
            new Set(
              values.filter(
                Boolean,
              ),
            ),
          ),
        ];
      },
      [jobs],
    );

  const shownCompanies =
    companies
      .filter(
        (company) =>
          companyFilter ===
            'All' ||
          company.industry
            .toLowerCase()
            .includes(
              companyFilter.toLowerCase(),
            ),
      )
      .filter(
        (company) =>
          !dismissed.includes(
            company.name,
          ),
      );

  const shownJobs =
    jobs
      .filter(
        (job) =>
          !dismissed.includes(
            job.company,
          ),
      )
      .filter(
        (job) =>
          jobFilter ===
            'All' ||
          job.department
            .toLowerCase()
            .includes(
              jobFilter.toLowerCase(),
            ) ||
          Boolean(
            job.employmentType
              ?.toLowerCase()
              .includes(
                jobFilter.toLowerCase(),
              ),
          ),
      )
      .filter(
        (job) => {
          const query =
            jobSearchQuery
              .trim()
              .toLowerCase();

          if (!query) {
            return true;
          }

          return [
            job.title,
            job.company,
            job.location,
            job.department,
            job.description,
            job.employmentType ||
              '',
            job.skills.join(' '),
          ]
            .join(' ')
            .toLowerCase()
            .includes(query);
        },
      );

  const savedJobItems =
    jobs.filter(
      (job) =>
        savedJobs.includes(
          job.id,
        ),
    );

  const savedCompanyItems =
    companies.filter(
      (company) =>
        savedCompanies.includes(
          company.name,
        ),
    );

  const hasSavedItems =
    savedJobs.length > 0 ||
    savedCompanies.length > 0;

  const toggleSaveJob = (
    jobId: string,
  ) => {
    setSavedJobs(
      (current) =>
        current.includes(jobId)
          ? current.filter(
              (id) =>
                id !== jobId,
            )
          : [
              ...current,
              jobId,
            ],
    );
  };

  const toggleSaveCompany = (
    companyName: string,
  ) => {
    setSavedCompanies(
      (current) =>
        current.includes(
          companyName,
        )
          ? current.filter(
              (name) =>
                name !==
                companyName,
            )
          : [
              ...current,
              companyName,
            ],
    );
  };

  const handleExpressInterest =
    async (
      job: Job,
    ) => {
      if (
        appliedJobs.includes(
          job.id,
        ) ||
        applyingJobId
      ) {
        return;
      }

      try {
        setApplyingJobId(
          job.id,
        );

        /*
         * The authenticated candidate is resolved by the
         * backend from the JWT. Only the selected job id is
         * sent by the browser.
         */
        await api.post(
          '/api/candidate/applications',
          {
            jobId: job.id,
          },
        );

        setAppliedJobs(
          (current) =>
            current.includes(
              job.id,
            )
              ? current
              : [
                  ...current,
                  job.id,
                ],
        );

        addNotification({
          id: `application-${job.id}-${Date.now()}`,
          type: 'application',
          title:
            'Application submitted',
          message:
            `Your TruCity profile was submitted to ${job.company} for the ${job.title} position.`,
          time: 'Just now',
          read: false,
          destination:
            '/candidate/feed',
        });
      } catch (error: any) {
        console.error(
          'Failed to submit application:',
          error,
        );

        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Unable to submit your application. Please try again.';

        addNotification({
          id: `application-error-${job.id}-${Date.now()}`,
          type: 'system',
          title:
            'Application not submitted',
          message:
            typeof message ===
            'string'
              ? message
              : 'Unable to submit your application. Please try again.',
          time: 'Just now',
          read: false,
          destination:
            '/candidate/feed',
        });
      } finally {
        setApplyingJobId(
          null,
        );
      }
    };

  const openJobDetails = (
    job: Job,
  ) => {
    const requirements =
      [
        job.experienceRequired,
        job.qualifications,
        ...job.skills,
        job.workplaceType,
        job.employmentType,
        job.benefits,
      ].filter(
        (
          value,
        ): value is string =>
          Boolean(
            value &&
              value.trim(),
          ),
      );

    setSelectedItemDetails({
      title: job.title,
      subtitle:
        `${job.company} · ${job.location}`,
      description:
        job.description,
      metaList:
        requirements.length > 0
          ? requirements
          : [
              'Review the complete job description before applying.',
            ],
      type: 'job',
      companyName:
        job.company,
      jobId: job.id,
    });
  };

  const openCompanyDetails = (
    company: Company,
  ) => {
    setSelectedItemDetails({
      title: company.name,
      subtitle:
        `${company.industry} · ${company.location}`,
      description:
        company.about,
      metaList:
        company.requirements,
      type: 'company',
      companyName:
        company.name,
    });
  };

  const reloadFeed =
    async () => {
      try {
        setLoading(true);
        setLoadError('');

        const response =
          await api.get<
            BackendJobResponse[]
          >(
            '/api/candidate/jobs/open',
          );

        const activeJobs =
          Array.isArray(
            response.data,
          )
            ? response.data
                .map(
                  mapBackendJob,
                )
                .filter(
                  (job) =>
                    job.status ===
                      'OPEN' ||
                    job.status ===
                      'ACTIVE',
                )
            : [];

        setJobs(
          activeJobs,
        );
      } catch (error) {
        console.error(
          'Failed to reload opportunities:',
          error,
        );
        setLoadError(
          'Unable to load live opportunities. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div
      className="
        relative
        min-h-[100dvh]
        overflow-x-hidden
        bg-transparent
        font-sans
        text-brand-text
      "
    >
      <main
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1480px]
          px-4
          py-8
          sm:px-8
          lg:px-10
          lg:py-10
        "
      >
        <section className="mb-8">
          <p
            className="
              mb-2
              text-[12px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-brand-accent
            "
          >
            Discover Opportunities
          </p>

          <h1
            className="
              !m-0
              text-[32px]
              font-bold
              leading-[1.08]
              tracking-[-0.035em]
              !text-brand-primary
              sm:text-[40px]
              lg:text-[48px]
            "
          >
            Find your next{' '}
            <span className="text-brand-gold">
              opportunity.
            </span>
          </h1>

          <p
            className="
              mt-3
              max-w-[680px]
              text-[15px]
              font-normal
              leading-7
              text-brand-textMuted
              sm:text-[16px]
            "
          >
            Browse live opportunities published
            by employers on TruCity and apply
            using your professional profile.
          </p>
        </section>

        <div
          className="
            sticky
            top-[104px]
            z-30
            mb-7
            space-y-3
            rounded-[24px]
            border
            border-brand-border
            bg-white/95
            p-4
            shadow-[0_16px_40px_rgba(0,70,109,0.10)]
            backdrop-blur-xl
          "
        >
          <div
            className="
              flex
              flex-col
              gap-3
              lg:flex-row
              lg:items-center
            "
          >
            <div
              className="
                flex
                overflow-x-auto
                rounded-[14px]
                border
                border-brand-border
                bg-brand-bg
                p-1
              "
            >
              <TabButton
                active={
                  activeTab ===
                  'companies'
                }
                onClick={() =>
                  setActiveTab(
                    'companies',
                  )
                }
                icon={
                  <Building2 className="h-4 w-4" />
                }
              >
                Companies
              </TabButton>

              <TabButton
                active={
                  activeTab ===
                  'jobs'
                }
                onClick={() =>
                  setActiveTab(
                    'jobs',
                  )
                }
                icon={
                  <Briefcase className="h-4 w-4" />
                }
              >
                Open Roles
              </TabButton>

              <TabButton
                active={
                  activeTab ===
                  'saved'
                }
                onClick={() =>
                  setActiveTab(
                    'saved',
                  )
                }
                icon={
                  <Bookmark className="h-4 w-4" />
                }
              >
                Saved
              </TabButton>
            </div>

            {activeTab ===
              'jobs' && (
              <JobSearch
                value={
                  jobSearchQuery
                }
                onChange={
                  setJobSearchQuery
                }
              />
            )}

            {activeTab ===
              'companies' && (
              <div
                className="
                  flex
                  min-h-[46px]
                  flex-1
                  items-center
                  rounded-[14px]
                  border
                  border-brand-border
                  bg-brand-bg
                  px-4
                  text-[12px]
                  font-semibold
                  text-brand-textMuted
                "
              >
                Companies shown here are derived from
                live employer job postings.
              </div>
            )}

            {activeTab ===
              'saved' && (
              <div
                className="
                  flex
                  min-h-[46px]
                  flex-1
                  items-center
                  rounded-[14px]
                  border
                  border-brand-gold/35
                  bg-brand-gold/10
                  px-4
                  text-[12px]
                  font-semibold
                  text-brand-primary
                "
              >
                <Bookmark
                  className="
                    mr-2
                    h-4
                    w-4
                    fill-brand-gold
                    text-brand-gold
                  "
                />
                Your saved companies and roles are
                stored on this device.
              </div>
            )}
          </div>

          {activeTab ===
            'companies' && (
            <FilterRow
              filters={
                companyFilters
              }
              selected={
                companyFilter
              }
              onSelect={
                setCompanyFilter
              }
            />
          )}

          {activeTab ===
            'jobs' && (
            <FilterRow
              filters={
                jobFilters
              }
              selected={
                jobFilter
              }
              onSelect={
                setJobFilter
              }
            />
          )}
        </div>

        {loadError && (
          <div
            className="
              mb-6
              flex
              flex-wrap
              items-center
              justify-between
              gap-3
              rounded-[18px]
              border
              border-brand-crimson/20
              bg-brand-crimson/5
              px-4
              py-3
              text-[13px]
              font-semibold
              text-brand-primary
            "
          >
            <span>
              {loadError}
            </span>

            <button
              type="button"
              onClick={
                reloadFeed
              }
              className="
                rounded-[10px]
                border
                border-brand-border
                bg-white
                px-3
                py-2
                text-[12px]
                font-bold
              "
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div
            className="
              flex
              min-h-[260px]
              items-center
              justify-center
              rounded-[24px]
              border
              border-brand-border
              bg-white/95
              text-[14px]
              font-semibold
              text-brand-textMuted
              shadow-[0_14px_34px_rgba(0,70,109,0.06)]
            "
          >
            Loading live opportunities...
          </div>
        ) : (
          <>
            {activeTab ===
              'companies' && (
              <div className="space-y-4">
                {shownCompanies.length ===
                0 ? (
                  <EmptyState
                    icon="company"
                    title="No companies available"
                    text={
                      jobs.length ===
                      0
                        ? 'No employers have published active opportunities yet.'
                        : 'There are no companies matching your current filter.'
                    }
                  />
                ) : (
                  shownCompanies.map(
                    (
                      company,
                    ) => (
                      <CompanyCard
                        key={
                          company.id
                        }
                        company={
                          company
                        }
                        isSaved={savedCompanies.includes(
                          company.name,
                        )}
                        onToggleSave={() =>
                          toggleSaveCompany(
                            company.name,
                          )
                        }
                        onOpenInfo={() =>
                          openCompanyDetails(
                            company,
                          )
                        }
                        onReport={() =>
                          onReport(
                            company.name,
                          )
                        }
                        onDismiss={() =>
                          setDismissed(
                            (
                              current,
                            ) =>
                              current.includes(
                                company.name,
                              )
                                ? current
                                : [
                                    ...current,
                                    company.name,
                                  ],
                          )
                        }
                      />
                    ),
                  )
                )}
              </div>
            )}

            {activeTab ===
              'jobs' && (
              <div className="space-y-3">
                {shownJobs.length ===
                0 ? (
                  <EmptyState
                    icon="job"
                    title="No matching jobs"
                    text={
                      jobs.length ===
                      0
                        ? 'No active roles have been published yet.'
                        : 'No active roles match your search or current filters.'
                    }
                  />
                ) : (
                  shownJobs.map(
                    (job) => {
                      const company =
                        companies.find(
                          (
                            item,
                          ) =>
                            item.name ===
                            job.company,
                        );

                      return (
                        <JobCard
                          key={
                            job.id
                          }
                          job={
                            job
                          }
                          company={
                            company
                          }
                          isSaved={savedJobs.includes(
                            job.id,
                          )}
                          hasApplied={appliedJobs.includes(
                            job.id,
                          )}
                          isApplying={
                            applyingJobId ===
                            job.id
                          }
                          onToggleSave={() =>
                            toggleSaveJob(
                              job.id,
                            )
                          }
                          onOpenInfo={() =>
                            openJobDetails(
                              job,
                            )
                          }
                          onExpressInterest={() =>
                            handleExpressInterest(
                              job,
                            )
                          }
                        />
                      );
                    },
                  )
                )}
              </div>
            )}

            {activeTab ===
              'saved' && (
              <div className="space-y-6">
                <div
                  className="
                    rounded-[24px]
                    border
                    border-brand-border
                    bg-white/95
                    p-5
                    shadow-[0_14px_34px_rgba(0,70,109,0.06)]
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        grid
                        h-11
                        w-11
                        place-items-center
                        rounded-[14px]
                        border
                        border-brand-gold/35
                        bg-brand-gold/10
                      "
                    >
                      <Bookmark
                        className="
                          h-5
                          w-5
                          fill-brand-gold
                          text-brand-gold
                        "
                      />
                    </div>

                    <div>
                      <h2
                        className="
                          !m-0
                          text-[20px]
                          font-bold
                          !text-brand-primary
                        "
                      >
                        Saved
                      </h2>

                      <p
                        className="
                          mt-1
                          text-[12px]
                          text-brand-textMuted
                        "
                      >
                        Companies and roles you bookmarked
                        for later.
                      </p>
                    </div>
                  </div>
                </div>

                {!hasSavedItems ? (
                  <SavedEmptyState
                    onBrowse={() =>
                      setActiveTab(
                        'companies',
                      )
                    }
                  />
                ) : (
                  <>
                    {savedCompanyItems.length >
                      0 && (
                      <section className="space-y-4">
                        <SavedSectionHeading
                          icon={
                            <Building2 className="h-4 w-4" />
                          }
                          title="Saved Companies"
                        />

                        {savedCompanyItems.map(
                          (
                            company,
                          ) => (
                            <CompanyCard
                              key={
                                company.id
                              }
                              company={
                                company
                              }
                              isSaved
                                    onToggleSave={() =>
                                toggleSaveCompany(
                                  company.name,
                                )
                              }
                              onOpenInfo={() =>
                                openCompanyDetails(
                                  company,
                                )
                              }
                              onReport={() =>
                                onReport(
                                  company.name,
                                )
                              }
                              onDismiss={() =>
                                setDismissed(
                                  (
                                    current,
                                  ) =>
                                    current.includes(
                                      company.name,
                                    )
                                      ? current
                                      : [
                                          ...current,
                                          company.name,
                                        ],
                                )
                              }
                            />
                          ),
                        )}
                      </section>
                    )}

                    {savedJobItems.length >
                      0 && (
                      <section className="space-y-3">
                        <SavedSectionHeading
                          icon={
                            <Briefcase className="h-4 w-4" />
                          }
                          title="Saved Jobs"
                        />

                        {savedJobItems.map(
                          (
                            job,
                          ) => {
                            const company =
                              companies.find(
                                (
                                  item,
                                ) =>
                                  item.name ===
                                  job.company,
                              );

                            return (
                              <JobCard
                                key={
                                  job.id
                                }
                                job={
                                  job
                                }
                                company={
                                  company
                                }
                                isSaved
                                hasApplied={appliedJobs.includes(
                                  job.id,
                                )}
                                isApplying={
                                  applyingJobId ===
                                  job.id
                                }
                                onToggleSave={() =>
                                  toggleSaveJob(
                                    job.id,
                                  )
                                }
                                onOpenInfo={() =>
                                  openJobDetails(
                                    job,
                                  )
                                }
                                onExpressInterest={() =>
                                  handleExpressInterest(
                                    job,
                                  )
                                }
                              />
                            );
                          },
                        )}
                      </section>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {selectedItemDetails && (
        <DetailModal
          details={
            selectedItemDetails
          }
          isApplied={
            selectedItemDetails.type ===
              'job' &&
            selectedItemDetails.jobId !==
              undefined
              ? appliedJobs.includes(
                  selectedItemDetails.jobId,
                )
              : false
          }
          isApplying={
            selectedItemDetails.type ===
              'job' &&
            selectedItemDetails.jobId !==
              undefined
              ? applyingJobId ===
                selectedItemDetails.jobId
              : false
          }
          onClose={() =>
            setSelectedItemDetails(
              null,
            )
          }
          onExpressInterest={(
            jobId,
          ) => {
            const job =
              jobs.find(
                (item) =>
                  item.id ===
                  jobId,
              );

            if (job) {
              void handleExpressInterest(
                job,
              );
            }
          }}
        />
      )}
    </div>
  );
}

/* =========================================================
   TAB BUTTON
========================================================= */

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        flex
        shrink-0
        items-center
        justify-center
        gap-2
        rounded-[10px]
        px-4
        py-2.5
        text-[12px]
        font-bold
        transition-all
        duration-200

        ${
          active
            ? `
              bg-brand-primary
              text-white
              shadow-sm
            `
            : `
              text-brand-textMuted
              hover:bg-white
              hover:text-brand-primary
            `
        }

        focus-visible:outline-none
        focus-visible:ring-4
        focus-visible:ring-brand-accent/20
      `}
    >
      {icon}

      {children}
    </button>
  );
}

/* =========================================================
   FILTER ROW
========================================================= */

interface FilterRowProps {
  filters: string[];
  selected: string;

  onSelect: (
    value: string,
  ) => void;
}

function FilterRow({
  filters,
  selected,
  onSelect,
}: FilterRowProps) {
  return (
    <div
      className="
        flex
        gap-2
        overflow-x-auto
        pb-1
      "
    >
      {filters.map(
        (
          item,
        ) => {
          const active =
            selected ===
            item;

          return (
            <button
              key={
                item
              }
              type="button"
              onClick={() =>
                onSelect(
                  item,
                )
              }
              className={`
                shrink-0
                rounded-full
                border
                px-3.5
                py-1.5
                text-[12px]
                font-bold
                transition-colors
                duration-200

                ${
                  active
                    ? `
                      border-brand-accent
                      bg-brand-accent/10
                      text-brand-primary
                    `
                    : `
                      border-brand-border
                      bg-white
                      text-brand-textMuted

                      hover:border-brand-accent
                      hover:text-brand-primary
                    `
                }

                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-accent/20
              `}
            >
              {item}
            </button>
          );
        },
      )}
    </div>
  );
}

/* =========================================================
   JOB SEARCH
========================================================= */

interface JobSearchProps {
  value: string;

  onChange: (
    value: string,
  ) => void;
}

function JobSearch({
  value,
  onChange,
}: JobSearchProps) {
  return (
    <div
      className="
        relative
        flex
        min-w-[220px]
        flex-1
        items-center
      "
    >
      <Search
        className="
          pointer-events-none
          absolute
          left-4
          h-4
          w-4
          text-brand-textMuted
        "
      />

      <input
        type="text"
        value={
          value
        }
        onChange={(
          event:
            ChangeEvent<HTMLInputElement>,
        ) =>
          onChange(
            event.target.value,
          )
        }
        placeholder="Search roles, locations or departments..."
        className="
          min-h-[46px]
          w-full
          rounded-[14px]
          border
          border-brand-border
          bg-white
          py-3
          pl-11
          pr-10
          text-[14px]
          font-normal
          text-brand-text
          outline-none
          transition-all
          duration-200
          placeholder:text-brand-textMuted/70

          hover:border-brand-accent/60

          focus:border-brand-accent
          focus:ring-4
          focus:ring-brand-accent/10
        "
      />

      {value && (
        <button
          type="button"
          onClick={() =>
            onChange(
              '',
            )
          }
          aria-label="Clear job search"
          className="
            absolute
            right-3
            rounded-lg
            p-1
            text-brand-textMuted
            transition-colors

            hover:bg-brand-bg
            hover:text-brand-primary

            focus-visible:outline-none
            focus-visible:ring-4
            focus-visible:ring-brand-accent/20
          "
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/* =========================================================
   BOOKMARK BUTTON
========================================================= */

interface BookmarkButtonProps {
  saved: boolean;
  onClick: () => void;
  savedLabel: string;
  unsavedLabel: string;
}

function BookmarkButton({
  saved,
  onClick,
  savedLabel,
  unsavedLabel,
}: BookmarkButtonProps) {
  return (
    <button
      type="button"
      onClick={(
        event,
      ) => {
        event.preventDefault();
        event.stopPropagation();

        onClick();
      }}
      title={
        saved
          ? 'Remove bookmark'
          : 'Save'
      }
      aria-label={
        saved
          ? savedLabel
          : unsavedLabel
      }
      className={`
        grid
        h-10
        w-10
        shrink-0
        place-items-center
        rounded-[13px]
        border
        transition-all
        duration-200

        ${
          saved
            ? `
              border-brand-gold
              bg-brand-gold/10
              text-brand-primary
              shadow-[0_6px_16px_rgba(255,173,1,0.12)]
            `
            : `
              border-brand-border
              bg-white
              text-brand-textMuted

              hover:border-brand-gold
              hover:bg-brand-gold/10
              hover:text-brand-primary
            `
        }

        focus-visible:outline-none
        focus-visible:ring-4
        focus-visible:ring-brand-accent/20
      `}
    >
      <Bookmark
        className={`
          h-4
          w-4

          ${
            saved
              ? 'fill-brand-gold text-brand-gold'
              : ''
          }
        `}
      />
    </button>
  );
}

/* =========================================================
   COMPANY CARD
========================================================= */

interface CompanyCardProps {
  company: Company;
  isSaved: boolean;
  onToggleSave: () => void;
  onOpenInfo: () => void;
  onReport: () => void;
  onDismiss: () => void;
}

function CompanyCard({
  company,
  isSaved,
  onToggleSave,
  onOpenInfo,
  onReport,
  onDismiss,
}: CompanyCardProps) {
  const industryStyle =
    INDUSTRY_COLORS[
      company.industry as keyof typeof INDUSTRY_COLORS
    ] || {
      avatar:
        'linear-gradient(135deg, #00466D 0%, #1E92D2 100%)',
      badge:
        'border-brand-border bg-brand-surface text-brand-primary',
    };

  return (
    <article
      className="
        w-full
        overflow-hidden
        rounded-[24px]
        border
        border-brand-border
        bg-white/95
        shadow-[0_16px_40px_rgba(0,70,109,0.08)]
        transition-all
        duration-200

        hover:-translate-y-0.5
        hover:border-brand-accent/40
        hover:shadow-[0_22px_50px_rgba(0,70,109,0.12)]
      "
    >
      <div
        className="
          flex
          items-start
          gap-4
          p-5

          sm:p-6
        "
      >
        <CompanyAvatar
          name={
            company.name
          }
          industry={
            company.industry
          }
        />

        <div
          className="
            min-w-0
            flex-1
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
              gap-3
            "
          >
            <div className="min-w-0">
              <h2
                className="
                  !m-0
                  text-[18px]
                  font-bold
                  tracking-[-0.02em]
                  !text-brand-primary

                  sm:text-[20px]
                "
              >
                {company.name}
              </h2>

              <div
                className="
                  mt-2
                  flex
                  flex-wrap
                  items-center
                  gap-2
                  text-[12px]
                  text-brand-textMuted
                "
              >
                <span
                  className={`
                    rounded-full
                    border
                    px-2.5
                    py-1
                    font-bold
                    ${industryStyle.badge}
                  `}
                >
                  {company.industry}
                </span>

                <span
                  className="
                    flex
                    items-center
                    gap-1
                  "
                >
                  <MapPin className="h-3.5 w-3.5" />

                  {company.location}
                </span>
              </div>
            </div>

            <BookmarkButton
              saved={
                isSaved
              }
              onClick={
                onToggleSave
              }
              savedLabel={`Remove ${company.name} from saved`}
              unsavedLabel={`Save ${company.name}`}
            />
          </div>
        </div>
      </div>

      <div
        className="
          space-y-5
          px-5
          pb-6

          sm:px-6
        "
      >
        <p
          className="
            max-w-[900px]
            text-[14px]
            leading-6
            text-brand-textMuted
          "
        >
          {company.bio}
        </p>

        <div
          className="
            rounded-[18px]
            border
            border-brand-border
            bg-brand-bg
            p-4
          "
        >
          <div
            className="
              mb-3
              flex
              items-center
              gap-2
              text-[10px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-brand-primary
            "
          >
            <Layers className="h-3.5 w-3.5 text-brand-accent" />

            Open Roles
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            {company.roles.map(
              (
                role,
              ) => (
                <span
                  key={
                    role
                  }
                  className="
                    rounded-[10px]
                    border
                    border-brand-border
                    bg-white
                    px-3
                    py-1.5
                    text-[12px]
                    font-bold
                    text-brand-textMuted
                  "
                >
                  {role}
                </span>
              ),
            )}
          </div>
        </div>

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
            border-t
            border-brand-border
            pt-4
          "
        >
          <button
            type="button"
            onClick={
              onOpenInfo
            }
            className="
              flex
              min-h-[42px]
              items-center
              gap-1.5
              rounded-[13px]
              border
              border-brand-border
              bg-white
              px-4
              text-[12px]
              font-bold
              text-brand-textMuted
              transition-colors

              hover:border-brand-primary
              hover:text-brand-primary

              focus-visible:outline-none
              focus-visible:ring-4
              focus-visible:ring-brand-accent/20
            "
          >
            More Info

            <ChevronRight className="h-4 w-4" />
          </button>

          <div
            className="
              ml-auto
              flex
              items-center
              gap-1
            "
          >
            <button
              type="button"
              onClick={
                onReport
              }
              title="Report company"
              aria-label={`Report ${company.name}`}
              className="
                grid
                h-10
                w-10
                place-items-center
                rounded-[12px]
                text-brand-textMuted
                transition-colors

                hover:bg-brand-crimson/10
                hover:text-brand-crimson

                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-crimson/15
              "
            >
              <Flag className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={
                onDismiss
              }
              title="Dismiss company"
              aria-label={`Dismiss ${company.name}`}
              className="
                grid
                h-10
                w-10
                place-items-center
                rounded-[12px]
                text-brand-textMuted
                transition-colors

                hover:bg-brand-bg
                hover:text-brand-primary

                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-accent/20
              "
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   JOB CARD
========================================================= */

interface JobCardProps {
  job: Job;
  company?: Company;
  isSaved: boolean;
  hasApplied: boolean;
  onToggleSave: () => void;
  onOpenInfo: () => void;
  onExpressInterest: () => void;
  isApplying?: boolean;
}

function JobCard({
  job,
  company,
  isSaved,
  hasApplied,
  onToggleSave,
  onOpenInfo,
  onExpressInterest,
  isApplying = false,
}: JobCardProps) {
  return (
    <article
      className="
        flex
        w-full
        flex-col
        justify-between
        gap-4
        rounded-[22px]
        border
        border-brand-border
        bg-white/95
        p-5
        shadow-[0_14px_36px_rgba(0,70,109,0.07)]
        transition-all
        duration-200

        hover:-translate-y-0.5
        hover:border-brand-accent/40
        hover:shadow-[0_20px_45px_rgba(0,70,109,0.11)]

        sm:flex-row
        sm:items-center
      "
    >
      <div
        className="
          flex
          items-start
          gap-4
        "
      >
        <CompanyAvatar
          name={
            job.company
          }
          industry={
            company?.industry
          }
        />

        <div className="space-y-1.5">
          <h3
            className="
              !m-0
              text-[16px]
              font-bold
              tracking-[-0.015em]
              !text-brand-primary

              sm:text-[18px]
            "
          >
            {job.title}
          </h3>

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
              text-[12px]
              text-brand-textMuted
            "
          >
            <span
              className="
                font-bold
                text-brand-text
              "
            >
              {job.company}
            </span>

            <span>•</span>

            <span
              className="
                flex
                items-center
                gap-1
              "
            >
              <MapPin className="h-3.5 w-3.5" />

              {job.location}
            </span>

            <span>•</span>

            <span
              className="
                flex
                items-center
                gap-1
              "
            >
              <Clock className="h-3.5 w-3.5" />

              {job.posted}
            </span>
          </div>

          <span
            className="
              inline-flex
              rounded-full
              border
              border-brand-border
              bg-brand-surface
              px-3
              py-1
              text-[11px]
              font-bold
              text-brand-primary
            "
          >
            {job.salary}
          </span>
        </div>
      </div>

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-2
          self-end

          sm:self-auto
        "
      >
        <button
          type="button"
          onClick={
            onOpenInfo
          }
          className="
            min-h-[40px]
            rounded-[12px]
            border
            border-brand-border
            bg-white
            px-3.5
            text-[12px]
            font-bold
            text-brand-textMuted
            transition-colors

            hover:border-brand-primary
            hover:text-brand-primary

            focus-visible:outline-none
            focus-visible:ring-4
            focus-visible:ring-brand-accent/20
          "
        >
          More Info
        </button>

        <BookmarkButton
          saved={
            isSaved
          }
          onClick={
            onToggleSave
          }
          savedLabel={`Remove ${job.title} from saved`}
          unsavedLabel={`Save ${job.title}`}
        />

        <button
          type="button"
          onClick={
            onExpressInterest
          }
          disabled={
            hasApplied ||
            isApplying
          }
          className={`
            flex
            min-h-[40px]
            items-center
            gap-2
            rounded-[12px]
            px-4
            text-[12px]
            font-bold
            transition-all
            duration-200

            ${
              hasApplied
                ? `
                  cursor-default
                  border
                  border-brand-emerald
                  bg-brand-emerald/10
                  text-brand-primary
                `
                : `
                  text-white
                  shadow-[0_8px_20px_rgba(0,70,109,0.16)]

                  hover:-translate-y-0.5
                `
            }

            focus-visible:outline-none
            focus-visible:ring-4
            focus-visible:ring-brand-accent/20
          `}
          style={
            hasApplied
              ? undefined
              : {
                  background:
                    'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)',
                }
          }
        >
          {hasApplied ? (
            <>
              <CheckCircle2
                className="
                  h-3.5
                  w-3.5
                  text-brand-emerald
                "
              />

              Applied
            </>
          ) : isApplying ? (
            <>
              <Clock className="h-3.5 w-3.5" />

              Submitting...
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />

              Express Interest
            </>
          )}
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   SAVED SECTION HEADING
========================================================= */

interface SavedSectionHeadingProps {
  icon: ReactNode;
  title: string;
}

function SavedSectionHeading({
  icon,
  title,
}: SavedSectionHeadingProps) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
      "
    >
      <div
        className="
          grid
          h-9
          w-9
          place-items-center
          rounded-[12px]
          bg-brand-accent/10
          text-brand-primary
        "
      >
        {icon}
      </div>

      <h3
        className="
          !m-0
          text-[18px]
          font-bold
          !text-brand-primary
        "
      >
        {title}
      </h3>
    </div>
  );
}

/* =========================================================
   DETAILS MODAL
========================================================= */

interface DetailModalProps {
  details: ItemDetails;
  isApplied: boolean;
  isApplying?: boolean;
  onClose: () => void;

  onContact?: (
    company: string,
  ) => void;

  onExpressInterest: (
    jobId: string,
  ) => void;
}

function DetailModal({
  details,
  isApplied,
  onClose,
  isApplying,
  onExpressInterest,
}: DetailModalProps) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-brand-dark/35
        p-4
        backdrop-blur-md
      "
    >
      <div
        className="
          flex
          w-full
          max-w-lg
          flex-col
          overflow-hidden
          rounded-[28px]
          border
          border-brand-border
          bg-white
          shadow-[0_35px_100px_rgba(0,70,109,0.24)]
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-brand-border
            bg-brand-bg
            p-5

            sm:p-6
          "
        >
          <div>
            <h3
              className="
                !m-0
                text-[22px]
                font-bold
                tracking-[-0.025em]
                !text-brand-primary
              "
            >
              {details.title}
            </h3>

            <p
              className="
                mt-1
                text-[12px]
                font-bold
                text-brand-accent
              "
            >
              {details.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="Close details"
            className="
              grid
              h-9
              w-9
              place-items-center
              rounded-[12px]
              border
              border-brand-border
              bg-white
              text-brand-textMuted
              transition-colors

              hover:border-brand-primary
              hover:text-brand-primary

              focus-visible:outline-none
              focus-visible:ring-4
              focus-visible:ring-brand-accent/20
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          className="
            max-h-[60vh]
            space-y-6
            overflow-y-auto
            p-5

            sm:p-6
          "
        >
          <div>
            <h4
              className="
                mb-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.17em]
                text-brand-primary
              "
            >
              Overview
            </h4>

            <p
              className="
                text-[14px]
                leading-6
                text-brand-textMuted
              "
            >
              {details.description}
            </p>
          </div>

          <div>
            <h4
              className="
                mb-3
                text-[10px]
                font-bold
                uppercase
                tracking-[0.17em]
                text-brand-primary
              "
            >
              Key Requirements
            </h4>

            <ul className="space-y-3">
              {details.metaList.map(
                (
                  requirement,
                  index,
                ) => (
                  <li
                    key={`${requirement}-${index}`}
                    className="
                      flex
                      items-start
                      gap-2.5
                      text-[14px]
                      leading-6
                      text-brand-textMuted
                    "
                  >
                    <CheckCircle2
                      className="
                        mt-1
                        h-4
                        w-4
                        shrink-0
                        text-brand-accent
                      "
                    />

                    <span>
                      {requirement}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-3
            border-t
            border-brand-border
            bg-brand-bg
            p-4
          "
        >
          {details.type ===
            'job' &&
            details.jobId !==
              undefined && (
              <button
                type="button"
                onClick={() =>
                  onExpressInterest(
                    details.jobId!,
                  )
                }
                disabled={
                  isApplied ||
                  isApplying
                }
                className={`
                  flex
                  min-h-[42px]
                  items-center
                  gap-2
                  rounded-[12px]
                  px-4
                  text-[12px]
                  font-bold
                  transition-all
                  duration-200

                  ${
                    isApplied
                      ? `
                        cursor-default
                        border
                        border-brand-emerald
                        bg-brand-emerald/10
                        text-brand-primary
                      `
                      : `
                        text-white
                        hover:-translate-y-0.5
                      `
                  }

                  focus-visible:outline-none
                  focus-visible:ring-4
                  focus-visible:ring-brand-accent/20
                `}
                style={
                  isApplied
                    ? undefined
                    : {
                        background:
                          'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)',
                      }
                }
              >
                {isApplied ? (
                  <>
                    <CheckCircle2
                      className="
                        h-3.5
                        w-3.5
                        text-brand-emerald
                      "
                    />

                    Applied
                  </>
                ) : isApplying ? (
                  <>
                    <Clock className="h-3.5 w-3.5" />

                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />

                    Express Interest
                  </>
                )}
              </button>
            )}

          <button
            type="button"
            onClick={
              onClose
            }
            className="
              ml-auto
              min-h-[42px]
              rounded-[12px]
              border
              border-brand-border
              bg-white
              px-4
              text-[12px]
              font-bold
              text-brand-textMuted
              transition-colors

              hover:border-brand-primary
              hover:text-brand-primary

              focus-visible:outline-none
              focus-visible:ring-4
              focus-visible:ring-brand-accent/20
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

interface EmptyStateProps {
  icon:
    | 'company'
    | 'job';

  title: string;
  text: string;
}

function EmptyState({
  icon,
  title,
  text,
}: EmptyStateProps) {
  return (
    <div
      className="
        flex
        w-full
        flex-col
        items-center
        justify-center
        rounded-[24px]
        border
        border-brand-border
        bg-white/95
        p-12
        text-center
        shadow-[0_14px_34px_rgba(0,70,109,0.06)]
      "
    >
      <div
        className="
          mb-4
          grid
          h-14
          w-14
          place-items-center
          rounded-[18px]
          bg-brand-accent/10
          text-brand-primary
        "
      >
        {icon ===
        'company' ? (
          <Building2 className="h-7 w-7" />
        ) : (
          <Briefcase className="h-7 w-7" />
        )}
      </div>

      <h3
        className="
          !m-0
          text-[18px]
          font-bold
          !text-brand-primary
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2
          max-w-[420px]
          text-[14px]
          leading-6
          text-brand-textMuted
        "
      >
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   SAVED EMPTY STATE
========================================================= */

interface SavedEmptyStateProps {
  onBrowse: () => void;
}

function SavedEmptyState({
  onBrowse,
}: SavedEmptyStateProps) {
  return (
    <div
      className="
        flex
        w-full
        flex-col
        items-center
        justify-center
        rounded-[28px]
        border
        border-brand-border
        bg-white/95
        px-6
        py-16
        text-center
        shadow-[0_16px_40px_rgba(0,70,109,0.07)]
      "
    >
      <div
        className="
          grid
          h-16
          w-16
          place-items-center
          rounded-[20px]
          border
          border-brand-gold/35
          bg-brand-gold/10
          text-brand-gold
        "
      >
        <Bookmark className="h-7 w-7" />
      </div>

      <h3
        className="
          !m-0
          mt-5
          text-[22px]
          font-bold
          tracking-[-0.025em]
          !text-brand-primary
        "
      >
        Nothing saved yet
      </h3>

      <p
        className="
          mt-2
          max-w-[460px]
          text-[14px]
          leading-6
          text-brand-textMuted
        "
      >
        Bookmark a company or an open role and it will appear
        here so you can return to it later.
      </p>

      <button
        type="button"
        onClick={
          onBrowse
        }
        className="
          mt-6
          inline-flex
          min-h-[46px]
          items-center
          justify-center
          gap-2
          rounded-[14px]
          px-5
          text-[14px]
          font-bold
          text-white
          shadow-[0_10px_25px_rgba(0,70,109,0.16)]
          transition-all
          duration-200

          hover:-translate-y-0.5

          focus-visible:outline-none
          focus-visible:ring-4
          focus-visible:ring-brand-accent/25
        "
        style={{
          background:
            'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)',
        }}
      >
        <Building2 className="h-4 w-4" />

        Browse Opportunities
      </button>
    </div>
  );
}