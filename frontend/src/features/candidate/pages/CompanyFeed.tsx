import {
  useEffect,
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
  MessageSquare,
  Search,
  Send,
  X,
} from 'lucide-react';

import {
  useNavigate,
} from 'react-router-dom';

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
  name: string;
  industry: Industry;
  location: string;
  roles: readonly string[];
  bio: string;
  about: string;
  requirements: readonly string[];
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  posted: string;
  department: string;
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
  jobId?: number;
}

/* =========================================================
   DATA
========================================================= */

const COMPANIES:
  readonly Company[] = [
    {
      name:
        'Apex Tech Solutions',

      industry:
        'FinTech & Banking',

      location:
        'Sandton, GP',

      roles: [
        'Senior Java Engineer',
        'React Native Dev',
        'DevOps Lead',
      ],

      bio:
        'Leading digital payments provider expanding software engineering teams across Gauteng.',

      about:
        'Apex Tech Solutions is a premier financial technology institution driving innovation in digital banking infrastructure across South Africa. We cultivate a collaborative, high-performance engineering culture focusing on scalable, secure microservices and modern mobile experiences.',

      requirements: [
        'Minimum 3+ years of professional software development experience.',
        'Strong proficiency in modern object-oriented programming or reactive frameworks.',
        "Bachelor's degree in Computer Science, Information Technology, or equivalent practical experience.",
        'Demonstrated track record of delivering production-ready features in agile environments.',
      ],
    },

    {
      name:
        'Vanguard Logistics Hub',

      industry:
        'Supply Chain & IoT',

      location:
        'Midrand, GP',

      roles: [
        'QA Automation Lead',
        'C# Backend Dev',
      ],

      bio:
        'National enterprise modernising warehousing and automated delivery networks.',

      about:
        'Vanguard Logistics Hub operates at the intersection of supply chain automation and IoT technology. We build robust backend systems and real-time tracking engines that power automated distribution networks nationwide.',

      requirements: [
        'Proven background in backend system architecture or quality engineering frameworks.',
        'Familiarity with cloud platforms and containerised microservices.',
        'Strong analytical problem-solving skills and attention to system performance optimisation.',
      ],
    },

    {
      name:
        'Innovate Digital Corp',

      industry:
        'AdTech',

      location:
        'Cape Town, WC',

      roles: [
        'Frontend Engineer',
        'Data Analyst',
      ],

      bio:
        "Building performance marketing infrastructure for Africa's fastest-growing brands.",

      about:
        'Innovate Digital Corp specialises in high-throughput advertising technology and data analytics pipelines. Our engineering teams build responsive user interfaces and robust data pipelines that process millions of daily user interactions.',

      requirements: [
        'Solid expertise in modern JavaScript/TypeScript frameworks and state management.',
        'Experience working with data visualisation tools, RESTful APIs, or GraphQL endpoints.',
        'Passion for clean code, responsive design principles, and rigorous code reviews.',
      ],
    },
  ];

const JOBS:
  readonly Job[] = [
    {
      id: 1,
      title: 'Senior Java Engineer',
      company: 'Apex Tech Solutions',
      location: 'Sandton, GP',
      salary: 'R85,000 - R110,000 / pm',
      posted: '2d ago',
      department: 'Engineering',
    },

    {
      id: 2,
      title: 'React Native Dev',
      company: 'Apex Tech Solutions',
      location: 'Sandton, GP',
      salary: 'R60,000 - R80,000 / pm',
      posted: '1d ago',
      department: 'Mobile Engineering',
    },

    {
      id: 3,
      title: 'DevOps Lead',
      company: 'Apex Tech Solutions',
      location: 'Sandton, GP',
      salary: 'R90,000 - R120,000 / pm',
      posted: '3d ago',
      department: 'Infrastructure',
    },

    {
      id: 4,
      title: 'QA Automation Lead',
      company: 'Vanguard Logistics Hub',
      location: 'Midrand, GP',
      salary: 'R65,000 - R85,000 / pm',
      posted: '5h ago',
      department: 'Quality Assurance',
    },

    {
      id: 5,
      title: 'C# Backend Dev',
      company: 'Vanguard Logistics Hub',
      location: 'Midrand, GP',
      salary: 'R70,000 - R90,000 / pm',
      posted: '4d ago',
      department: 'Backend Engineering',
    },

    {
      id: 6,
      title: 'Frontend Engineer',
      company: 'Innovate Digital Corp',
      location: 'Cape Town, WC',
      salary: 'R55,000 - R75,000 / pm',
      posted: 'Just now',
      department: 'Frontend Engineering',
    },

    {
      id: 7,
      title: 'Data Analyst',
      company: 'Innovate Digital Corp',
      location: 'Cape Town, WC',
      salary: 'R45,000 - R65,000 / pm',
      posted: '1w ago',
      department: 'Data Intelligence',
    },
  ];

/* =========================================================
   COMPANY AVATAR
========================================================= */

function CompanyAvatar({
  name,
  industry,
  size = 'md',
}: CompanyAvatarProps) {
  const background =
    industry
      ? INDUSTRY_COLORS[
          industry
        ].avatar
      : 'linear-gradient(135deg, #00466D 0%, #1E92D2 100%)';

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
  onChat = () => {},
  onReport = () => {},
}: CompanyFeedProps) {
  const navigate =
    useNavigate();

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
    appliedJobs,
    setAppliedJobs,
  ] =
    useState<number[]>(
      () => {
        try {
          const stored =
            localStorage.getItem(
              'trucity-candidate-applied-jobs',
            );

          if (!stored) {
            return [];
          }

          const parsed:
            unknown =
            JSON.parse(
              stored,
            );

          if (
            !Array.isArray(
              parsed,
            )
          ) {
            return [];
          }

          return parsed.filter(
            (
              value,
            ): value is number =>
              typeof value ===
                'number' &&
              JOBS.some(
                (
                  job,
                ) =>
                  job.id ===
                  value,
              ),
          );
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
    useState(
      'All',
    );

  const [
    jobFilter,
    setJobFilter,
  ] =
    useState(
      'All',
    );

  const [
    jobSearchQuery,
    setJobSearchQuery,
  ] =
    useState(
      '',
    );

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
    useState<number[]>(
      () => {
        try {
          const stored =
            localStorage.getItem(
              'trucity-saved-jobs',
            );

          if (!stored) {
            return [];
          }

          const parsed:
            unknown =
            JSON.parse(
              stored,
            );

          if (
            !Array.isArray(
              parsed,
            )
          ) {
            return [];
          }

          return parsed.filter(
            (
              value,
            ): value is number =>
              typeof value ===
                'number' &&
              JOBS.some(
                (
                  job,
                ) =>
                  job.id ===
                  value,
              ),
          );
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

          const parsed:
            unknown =
            JSON.parse(
              stored,
            );

          if (
            !Array.isArray(
              parsed,
            )
          ) {
            return [];
          }

          return parsed.filter(
            (
              value,
            ): value is string =>
              typeof value ===
                'string' &&
              COMPANIES.some(
                (
                  company,
                ) =>
                  company.name ===
                  value,
              ),
          );
        } catch {
          return [];
        }
      },
    );

  /* =========================================================
     PERSISTENCE
  ========================================================= */

  useEffect(
    () => {
      try {
        localStorage.setItem(
          'trucity-candidate-applied-jobs',
          JSON.stringify(
            appliedJobs,
          ),
        );
      } catch (
        error
      ) {
        console.error(
          'Unable to persist applied jobs:',
          error,
        );
      }
    },
    [
      appliedJobs,
    ],
  );

  useEffect(
    () => {
      try {
        localStorage.setItem(
          'trucity-saved-jobs',
          JSON.stringify(
            savedJobs,
          ),
        );
      } catch (
        error
      ) {
        console.error(
          'Unable to persist saved jobs:',
          error,
        );
      }
    },
    [
      savedJobs,
    ],
  );

  useEffect(
    () => {
      try {
        localStorage.setItem(
          'trucity-saved-companies',
          JSON.stringify(
            savedCompanies,
          ),
        );
      } catch (
        error
      ) {
        console.error(
          'Unable to persist saved companies:',
          error,
        );
      }
    },
    [
      savedCompanies,
    ],
  );

  /* =========================================================
     MODAL SCROLL LOCK
  ========================================================= */

  useEffect(
    () => {
      if (
        !selectedItemDetails
      ) {
        return;
      }

      const previous =
        document.body
          .style
          .overflow;

      document.body
        .style
        .overflow =
        'hidden';

      return () => {
        document.body
          .style
          .overflow =
          previous;
      };
    },
    [
      selectedItemDetails,
    ],
  );

  /* =========================================================
     FILTERS
  ========================================================= */

  const companyFilters = [
    'All',
    'FinTech',
    'Supply Chain',
    'AdTech',
  ];

  const jobFilters = [
    'All',
    'Engineer',
    'Dev',
    'DevOps',
    'QA Automation',
    'Data Analyst',
  ];

  const shownCompanies =
    COMPANIES
      .filter(
        (
          company,
        ) =>
          companyFilter ===
            'All' ||
          company.industry.includes(
            companyFilter,
          ),
      )
      .filter(
        (
          company,
        ) =>
          !dismissed.includes(
            company.name,
          ),
      );

  const shownJobs =
    JOBS
      .filter(
        (
          job,
        ) =>
          !dismissed.includes(
            job.company,
          ),
      )
      .filter(
        (
          job,
        ) =>
          jobFilter ===
            'All' ||
          job.title
            .toLowerCase()
            .includes(
              jobFilter.toLowerCase(),
            ),
      )
      .filter(
        (
          job,
        ) => {
          const query =
            jobSearchQuery
              .trim()
              .toLowerCase();

          if (!query) {
            return true;
          }

          return (
            job.title
              .toLowerCase()
              .includes(
                query,
              ) ||
            job.location
              .toLowerCase()
              .includes(
                query,
              ) ||
            job.department
              .toLowerCase()
              .includes(
                query,
              )
          );
        },
      );

  const savedJobItems =
    JOBS.filter(
      (
        job,
      ) =>
        savedJobs.includes(
          job.id,
        ),
    );

  const savedCompanyItems =
    COMPANIES.filter(
      (
        company,
      ) =>
        savedCompanies.includes(
          company.name,
        ),
    );

  const hasSavedItems =
    savedJobs.length > 0 ||
    savedCompanies.length > 0;

  /* =========================================================
     SAVE ACTIONS
  ========================================================= */

  const toggleSaveJob = (
    jobId: number,
  ) => {
    setSavedJobs(
      (
        current,
      ) => {
        const alreadySaved =
          current.includes(
            jobId,
          );

        return alreadySaved
          ? current.filter(
              (
                id,
              ) =>
                id !==
                jobId,
            )
          : [
              ...current,
              jobId,
            ];
      },
    );
  };

  const toggleSaveCompany = (
    companyName: string,
  ) => {
    setSavedCompanies(
      (
        current,
      ) => {
        const alreadySaved =
          current.includes(
            companyName,
          );

        return alreadySaved
          ? current.filter(
              (
                name,
              ) =>
                name !==
                companyName,
            )
          : [
              ...current,
              companyName,
            ];
      },
    );
  };

  /* =========================================================
     EXPRESS INTEREST
  ========================================================= */

  const handleExpressInterest = (
    job: Job,
  ) => {
    if (
      appliedJobs.includes(
        job.id,
      )
    ) {
      return;
    }

    setAppliedJobs(
      (
        current,
      ) => [
        ...current,
        job.id,
      ],
    );

    addNotification({
      id: `application-${job.id}-${Date.now()}`,
      
      type: 'application',

      title:'Application submitted',

      message:`Your TruCity profile was submitted to ${job.company} for the ${job.title} position.`,

      time:'Just now',

      read:false,

      destination:'/candidate/feed',
    });
  };

  /* =========================================================
     CONTACT COMPANY
  ========================================================= */

  const handleContactCompany = (
    companyName: string,
  ) => {
    onChat(
      companyName,
    );

    navigate(
      '/candidate/messages',
      {
        state: {
          source:
            'company-contact',

          company:
            companyName,

          allowCvAttachment:
            true,
        },
      },
    );
  };

  /* =========================================================
     DETAILS
  ========================================================= */

  const openJobDetails = (
    job: Job,
  ) => {
    setSelectedItemDetails(
      {
        title:
          job.title,

        subtitle:
          `${job.company} · ${job.location}`,

        description:
          `We are looking for a dedicated ${job.title} to join our high-performing team in ${job.department}. You will play a key role in building high-impact systems, collaborating cross-functionally, and driving professional standards.`,

        metaList: [
          'Professional experience matching the core role requirements.',
          'Strong understanding of modern systems, integrations and professional workflows.',
          'Strong communication skills and a collaborative team mindset.',
          `Competitive compensation package: ${job.salary}.`,
        ],

        type:
          'job',

        companyName:
          job.company,

        jobId:
          job.id,
      },
    );
  };

  const openCompanyDetails = (
    company: Company,
  ) => {
    setSelectedItemDetails(
      {
        title:
          company.name,

        subtitle:
          `${company.industry} · ${company.location}`,

        description:
          company.about,

        metaList:
          company.requirements,

        type:
          'company',

        companyName:
          company.name,
      },
    );
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
        {/* =================================================
            PAGE HEADER
        ================================================== */}

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
            Browse verified employers and apply to open roles
            using your TruCity professional profile.
          </p>
        </section>

        {/* =================================================
            CONTROLS
        ================================================== */}

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
                Browse verified companies currently hiring on TruCity.
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

                Your bookmarked companies and jobs are stored here.
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

        {/* =================================================
            COMPANIES
        ================================================== */}

        {activeTab ===
          'companies' && (
          <div className="space-y-4">
            {shownCompanies.length ===
            0 ? (
              <EmptyState
                icon="company"
                title="No companies available"
                text="There are no companies in this category right now."
              />
            ) : (
              shownCompanies.map(
                (
                  company,
                ) => (
                  <CompanyCard
                    key={
                      company.name
                    }
                    company={
                      company
                    }
                    isSaved={savedCompanies.includes(
                      company.name,
                    )}
                    onMessage={() =>
                      handleContactCompany(
                        company.name,
                      )
                    }
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

        {/* =================================================
            JOBS
        ================================================== */}

        {activeTab ===
          'jobs' && (
          <div className="space-y-3">
            {shownJobs.length ===
            0 ? (
              <EmptyState
                icon="job"
                title="No matching jobs"
                text="No active roles match your search or current filters."
              />
            ) : (
              shownJobs.map(
                (
                  job,
                ) => {
                  const company =
                    COMPANIES.find(
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

        {/* =================================================
            SAVED
        ================================================== */}

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
                    Companies and roles you bookmarked for later.
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
                            company.name
                          }
                          company={
                            company
                          }
                          isSaved
                          onMessage={() =>
                            handleContactCompany(
                              company.name,
                            )
                          }
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
                          COMPANIES.find(
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
      </main>

      {/* =====================================================
          DETAILS MODAL
      ====================================================== */}

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
          onClose={() =>
            setSelectedItemDetails(
              null,
            )
          }
          onContact={(
            companyName,
          ) => {
            setSelectedItemDetails(
              null,
            );

            handleContactCompany(
              companyName,
            );
          }}
          onExpressInterest={(
            jobId,
          ) => {
            const job =
              JOBS.find(
                (
                  item,
                ) =>
                  item.id ===
                  jobId,
              );

            if (!job) {
              return;
            }

            handleExpressInterest(
              job,
            );
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
  onMessage: () => void;
  onToggleSave: () => void;
  onOpenInfo: () => void;
  onReport: () => void;
  onDismiss: () => void;
}

function CompanyCard({
  company,
  isSaved,
  onMessage,
  onToggleSave,
  onOpenInfo,
  onReport,
  onDismiss,
}: CompanyCardProps) {
  const industryStyle =
    INDUSTRY_COLORS[
      company.industry
    ];

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
          <PrimaryActionButton
            onClick={
              onMessage
            }
            icon={
              <MessageSquare className="h-4 w-4" />
            }
          >
            Message Company
          </PrimaryActionButton>

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
}

function JobCard({
  job,
  company,
  isSaved,
  hasApplied,
  onToggleSave,
  onOpenInfo,
  onExpressInterest,
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
            hasApplied
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
   PRIMARY ACTION
========================================================= */

interface PrimaryActionButtonProps {
  onClick: () => void;
  icon?: ReactNode;
  children: ReactNode;
}

function PrimaryActionButton({
  onClick,
  icon,
  children,
}: PrimaryActionButtonProps) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="
        flex
        min-h-[42px]
        items-center
        justify-center
        gap-2
        rounded-[13px]
        px-4
        text-[12px]
        font-bold
        text-white
        shadow-[0_8px_20px_rgba(0,70,109,0.16)]
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
      {icon}

      {children}
    </button>
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
  onClose: () => void;

  onContact: (
    company: string,
  ) => void;

  onExpressInterest: (
    jobId: number,
  ) => void;
}

function DetailModal({
  details,
  isApplied,
  onClose,
  onContact,
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
                  isApplied
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
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />

                    Express Interest
                  </>
                )}
              </button>
            )}

          {details.type ===
            'company' &&
            details.companyName && (
              <PrimaryActionButton
                onClick={() =>
                  onContact(
                    details.companyName!,
                  )
                }
                icon={
                  <MessageSquare className="h-3.5 w-3.5" />
                }
              >
                Message Company
              </PrimaryActionButton>
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