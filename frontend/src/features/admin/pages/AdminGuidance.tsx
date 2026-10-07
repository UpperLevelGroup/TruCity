import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  AlertCircle,
  AudioLines,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit3,
  Eye,
  FileText,
  Filter,
  Image as ImageIcon,
  PlayCircle,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  Users,
  Video,
  X,
} from "lucide-react";

type GuidanceStatus = "PUBLISHED" | "DRAFT";

type GuidanceHub =
  | "PUBLIC"
  | "CANDIDATE"
  | "COMPANY";

type MediaType =
  | "IMAGE"
  | "AUDIO"
  | "VIDEO";

type GuidanceCategory =
  | "Career"
  | "General"
  | "TruCity"
  | "Job Search"
  | "CV & Profile"
  | "Interviews"
  | "Verification"
  | "Workplace"
  | "Skills"
  | "Hiring"
  | "Recruitment"
  | "Job Posting"
  | "Candidate Management";

interface GuidanceMedia {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  size: number;
}

interface GuidanceArticle {
  id: string;
  title: string;
  description: string;
  hub: GuidanceHub;
  category: GuidanceCategory;
  status: GuidanceStatus;
  author: string;
  views: number;
  featured: boolean;
  updatedAt: string;
  readTime: number;
  content: string;
  media: GuidanceMedia[];
}

interface GuidanceForm {
  title: string;
  description: string;
  hub: GuidanceHub;
  category: GuidanceCategory;
  status: GuidanceStatus;
  featured: boolean;
  content: string;
  media: GuidanceMedia[];
}

const HUB_OPTIONS: Array<{
  value: GuidanceHub;
  label: string;
  description: string;
}> = [
  {
    value: "PUBLIC",
    label: "Public Hub",
    description:
      "Guidance available to visitors and users before signing in.",
  },
  {
    value: "CANDIDATE",
    label: "Candidate Hub",
    description:
      "Career, job search and professional development guidance for candidates.",
  },
  {
    value: "COMPANY",
    label: "Company Hub",
    description:
      "Recruitment, hiring and employer guidance for companies.",
  },
];

const CATEGORY_OPTIONS: Record<GuidanceHub, GuidanceCategory[]> = {
  PUBLIC: [
    "Career",
    "General",
    "TruCity",
  ],

  CANDIDATE: [
    "Job Search",
    "CV & Profile",
    "Interviews",
    "Verification",
    "Workplace",
    "Skills",
  ],

  COMPANY: [
    "Hiring",
    "Recruitment",
    "Job Posting",
    "Candidate Management",
    "Verification",
    "Workplace",
    "TruCity",
  ],
};

const INITIAL_GUIDANCE: GuidanceArticle[] = [
  {
    id: "guide-public-001",
    title: "Understanding TruCity",
    description:
      "An introduction to TruCity, verified opportunities and how the platform connects professionals with employers.",
    hub: "PUBLIC",
    category: "TruCity",
    status: "PUBLISHED",
    author: "TruCity Admin",
    views: 1850,
    featured: true,
    updatedAt: "3 Oct 2026",
    readTime: 4,
    content:
      "TruCity connects verified professionals with real opportunities from verified employers.",
    media: [],
  },

  {
    id: "guide-public-002",
    title: "Building a Successful Career",
    description:
      "General career guidance for professionals planning their next career move.",
    hub: "PUBLIC",
    category: "Career",
    status: "PUBLISHED",
    author: "TruCity Admin",
    views: 1248,
    featured: true,
    updatedAt: "2 Oct 2026",
    readTime: 5,
    content:
      "Building a successful career requires continuous learning, professional development and informed decisions.",
    media: [],
  },

  {
    id: "guide-candidate-001",
    title: "How to Build a Strong Professional Profile",
    description:
      "Practical guidance to help candidates create a professional profile that stands out to verified employers.",
    hub: "CANDIDATE",
    category: "CV & Profile",
    status: "PUBLISHED",
    author: "TruCity Admin",
    views: 2148,
    featured: true,
    updatedAt: "2 Oct 2026",
    readTime: 5,
    content:
      "A strong professional profile gives employers a clear understanding of your skills, experience and career goals.",
    media: [],
  },

  {
    id: "guide-candidate-002",
    title: "Understanding TruCity Verification",
    description:
      "Learn how candidate verification works and why verification matters on TruCity.",
    hub: "CANDIDATE",
    category: "Verification",
    status: "PUBLISHED",
    author: "TruCity Admin",
    views: 1936,
    featured: true,
    updatedAt: "29 Sep 2026",
    readTime: 4,
    content:
      "Verification helps create trust between professionals and employers using TruCity.",
    media: [],
  },

  {
    id: "guide-candidate-003",
    title: "How to Find the Right Job Opportunity",
    description:
      "A practical guide for candidates comparing opportunities, requirements, salary information and closing dates.",
    hub: "CANDIDATE",
    category: "Job Search",
    status: "PUBLISHED",
    author: "TruCity Admin",
    views: 1817,
    featured: false,
    updatedAt: "27 Sep 2026",
    readTime: 6,
    content:
      "Candidates should consider job requirements, employer information, compensation, location and closing dates before applying.",
    media: [],
  },

  {
    id: "guide-candidate-004",
    title: "Preparing for Your First Interview",
    description:
      "Tips for researching an employer, preparing answers and presenting yourself professionally.",
    hub: "CANDIDATE",
    category: "Interviews",
    status: "DRAFT",
    author: "TruCity Admin",
    views: 0,
    featured: false,
    updatedAt: "25 Sep 2026",
    readTime: 7,
    content:
      "Prepare by researching the employer, understanding the role and practising clear examples of your experience.",
    media: [],
  },

  {
    id: "guide-company-001",
    title: "How to Create a Better Job Listing",
    description:
      "Guidance for employers on creating clear, accurate and attractive job opportunities for verified professionals.",
    hub: "COMPANY",
    category: "Job Posting",
    status: "PUBLISHED",
    author: "TruCity Admin",
    views: 745,
    featured: true,
    updatedAt: "1 Oct 2026",
    readTime: 5,
    content:
      "A strong job listing clearly explains the role, requirements, compensation, location and closing date.",
    media: [],
  },

  {
    id: "guide-company-002",
    title: "Understanding Employer Verification",
    description:
      "Learn why employer verification matters and how verified companies build trust with candidates.",
    hub: "COMPANY",
    category: "Verification",
    status: "PUBLISHED",
    author: "TruCity Admin",
    views: 632,
    featured: true,
    updatedAt: "28 Sep 2026",
    readTime: 4,
    content:
      "Employer verification helps candidates understand that opportunities originate from legitimate businesses.",
    media: [],
  },

  {
    id: "guide-company-003",
    title: "Building an Effective Recruitment Process",
    description:
      "Practical guidance for companies managing applications and identifying suitable candidates.",
    hub: "COMPANY",
    category: "Recruitment",
    status: "DRAFT",
    author: "TruCity Admin",
    views: 0,
    featured: false,
    updatedAt: "24 Sep 2026",
    readTime: 8,
    content:
      "An effective recruitment process should be structured, consistent and focused on the requirements of the position.",
    media: [],
  },
];

const EMPTY_FORM: GuidanceForm = {
  title: "",
  description: "",
  hub: "CANDIDATE",
  category: "Job Search",
  status: "DRAFT",
  featured: false,
  content: "",
  media: [],
};

export default function AdminGuidance() {
  const [articles, setArticles] =
    useState<GuidanceArticle[]>(INITIAL_GUIDANCE);

  const [selectedHub, setSelectedHub] =
    useState<GuidanceHub | "ALL">("ALL");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"ALL" | GuidanceStatus>("ALL");

  const [categoryFilter, setCategoryFilter] =
    useState<GuidanceCategory | "ALL">("ALL");

  const [showEditor, setShowEditor] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<GuidanceForm>(EMPTY_FORM);

  const [deleteId, setDeleteId] =
    useState<string | null>(null);

  const imageInputRef =
    useRef<HTMLInputElement | null>(null);

  const audioInputRef =
    useRef<HTMLInputElement | null>(null);

  const videoInputRef =
    useRef<HTMLInputElement | null>(null);

  const filteredArticles = useMemo(() => {
    const query =
      searchTerm.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesSearch =
        !query ||
        article.title
          .toLowerCase()
          .includes(query) ||
        article.description
          .toLowerCase()
          .includes(query) ||
        article.category
          .toLowerCase()
          .includes(query);

      const matchesHub =
        selectedHub === "ALL" ||
        article.hub === selectedHub;

      const matchesStatus =
        statusFilter === "ALL" ||
        article.status === statusFilter;

      const matchesCategory =
        categoryFilter === "ALL" ||
        article.category === categoryFilter;

      return (
        matchesSearch &&
        matchesHub &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    articles,
    searchTerm,
    selectedHub,
    statusFilter,
    categoryFilter,
  ]);

  const totalArticles =
    articles.length;

  const publishedArticles =
    articles.filter(
      (article) =>
        article.status === "PUBLISHED",
    ).length;

  const draftArticles =
    articles.filter(
      (article) =>
        article.status === "DRAFT",
    ).length;

  const totalViews =
    articles.reduce(
      (total, article) =>
        total + article.views,
      0,
    );

  const featuredArticles =
    articles.filter(
      (article) => article.featured,
    ).length;

  const publicArticles =
    articles.filter(
      (article) => article.hub === "PUBLIC",
    ).length;

  const candidateArticles =
    articles.filter(
      (article) =>
        article.hub === "CANDIDATE",
    ).length;

  const companyArticles =
    articles.filter(
      (article) =>
        article.hub === "COMPANY",
    ).length;

  const totalImages =
    articles.reduce(
      (total, article) =>
        total +
        article.media.filter(
          (media) =>
            media.type === "IMAGE",
        ).length,
      0,
    );

  const totalAudio =
    articles.reduce(
      (total, article) =>
        total +
        article.media.filter(
          (media) =>
            media.type === "AUDIO",
        ).length,
      0,
    );

  const totalVideo =
    articles.reduce(
      (total, article) =>
        total +
        article.media.filter(
          (media) =>
            media.type === "VIDEO",
        ).length,
      0,
    );

  const openCreateEditor = () => {
    setEditingId(null);

    setForm({
      ...EMPTY_FORM,
      media: [],
    });

    setShowEditor(true);
  };

  const openEditEditor = (
    article: GuidanceArticle,
  ) => {
    setEditingId(article.id);

    setForm({
      title: article.title,
      description: article.description,
      hub: article.hub,
      category: article.category,
      status: article.status,
      featured: article.featured,
      content: article.content,
      media: [...article.media],
    });

    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingId(null);

    setForm({
      ...EMPTY_FORM,
      media: [],
    });
  };

  const handleFormChange = (
    field: keyof GuidanceForm,
    value:
      | string
      | boolean
      | GuidanceHub
      | GuidanceCategory
      | GuidanceStatus,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleHubChange = (
    hub: GuidanceHub,
  ) => {
    const firstCategory =
      CATEGORY_OPTIONS[hub][0];

    setForm((current) => ({
      ...current,
      hub,
      category: firstCategory,
    }));
  };

  const handleSave = () => {
    const title =
      form.title.trim();

    const description =
      form.description.trim();

    const content =
      form.content.trim();

    if (!title || !description) {
      return;
    }

    if (editingId) {
      setArticles((current) =>
        current.map((article) =>
          article.id === editingId
            ? {
                ...article,
                title,
                description,
                hub: form.hub,
                category: form.category,
                status: form.status,
                featured: form.featured,
                content,
                media: form.media,
                updatedAt: "Just now",
              }
            : article,
        ),
      );
    } else {
      const newArticle: GuidanceArticle = {
        id: `guide-${Date.now()}`,
        title,
        description,
        hub: form.hub,
        category: form.category,
        status: form.status,
        author: "TruCity Admin",
        views: 0,
        featured: form.featured,
        updatedAt: "Just now",
        readTime: 5,
        content,
        media: form.media,
      };

      setArticles((current) => [
        newArticle,
        ...current,
      ]);
    }

    closeEditor();
  };

  const togglePublished = (
    id: string,
  ) => {
    setArticles((current) =>
      current.map((article) =>
        article.id === id
          ? {
              ...article,
              status:
                article.status ===
                "PUBLISHED"
                  ? "DRAFT"
                  : "PUBLISHED",
              updatedAt: "Just now",
            }
          : article,
      ),
    );
  };

  const toggleFeatured = (
    id: string,
  ) => {
    setArticles((current) =>
      current.map((article) =>
        article.id === id
          ? {
              ...article,
              featured:
                !article.featured,
              updatedAt: "Just now",
            }
          : article,
      ),
    );
  };

  const confirmDelete = () => {
    if (!deleteId) {
      return;
    }

    setArticles((current) =>
      current.filter(
        (article) =>
          article.id !== deleteId,
      ),
    );

    setDeleteId(null);
  };

  const handleMediaUpload = (
    event: ChangeEvent<HTMLInputElement>,
    type: MediaType,
  ) => {
    const files =
      Array.from(
        event.target.files ?? [],
      );

    if (files.length === 0) {
      return;
    }

    const newMedia =
      files.map((file) => ({
        id: `media-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,
        name: file.name,
        type,
        url: URL.createObjectURL(file),
        size: file.size,
      }));

    setForm((current) => ({
      ...current,
      media: [
        ...current.media,
        ...newMedia,
      ],
    }));

    event.target.value = "";
  };

  const removeMedia = (
    mediaId: string,
  ) => {
    setForm((current) => {
      const media =
        current.media.find(
          (item) =>
            item.id === mediaId,
        );

      if (media?.url.startsWith("blob:")) {
        URL.revokeObjectURL(media.url);
      }

      return {
        ...current,
        media: current.media.filter(
          (item) =>
            item.id !== mediaId,
        ),
      };
    });
  };

  const getHubLabel = (
    hub: GuidanceHub,
  ) => {
    return HUB_OPTIONS.find(
      (item) =>
        item.value === hub,
    )?.label ?? hub;
  };

  const getHubClass = (
    hub: GuidanceHub,
  ) => {
    switch (hub) {
      case "PUBLIC":
        return "bg-slate-100 text-slate-700";

      case "CANDIDATE":
        return "bg-cyan-50 text-cyan-700";

      case "COMPANY":
        return "bg-purple-50 text-purple-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getCategoryClass = (
    category: GuidanceCategory,
  ) => {
    switch (category) {
      case "Verification":
        return "bg-blue-50 text-blue-700";

      case "Job Search":
      case "Hiring":
      case "Job Posting":
        return "bg-amber-50 text-amber-700";

      case "Workplace":
      case "Recruitment":
        return "bg-purple-50 text-purple-700";

      case "Skills":
      case "Candidate Management":
        return "bg-emerald-50 text-emerald-700";

      case "TruCity":
        return "bg-slate-100 text-slate-700";

      default:
        return "bg-cyan-50 text-cyan-700";
    }
  };

  const getMediaIcon = (
    type: MediaType,
  ) => {
    if (type === "IMAGE") {
      return (
        <ImageIcon size={17} />
      );
    }

    if (type === "AUDIO") {
      return (
        <AudioLines size={17} />
      );
    }

    return (
      <Video size={17} />
    );
  };

  const getMediaClass = (
    type: MediaType,
  ) => {
    if (type === "IMAGE") {
      return "bg-blue-50 text-blue-600";
    }

    if (type === "AUDIO") {
      return "bg-purple-50 text-purple-600";
    }

    return "bg-amber-50 text-amber-600";
  };

  return (
    <div className="min-h-full bg-[#F7FAFC] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#1E92D2]">
              <BookOpen size={17} />
              Guidance Management
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#00273D] sm:text-3xl">
              Guidance Hubs
            </h1>

            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              Create, manage and publish guidance content across the Public,
              Candidate and Company hubs.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateEditor}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00466D] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#003854]"
          >
            <Plus size={18} />
            Create Guidance
          </button>
        </div>

        {/* =====================================================
            HUB DIRECTORY
        ===================================================== */}

        <section className="mb-7">
          <div className="mb-3">
            <h2 className="text-base font-bold text-[#00273D]">
              Guidance Directory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a hub to manage the content displayed in that area of
              TruCity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <HubCard
              label="Public Hub"
              description="Content available to the wider TruCity audience."
              count={publicArticles}
              icon={<Users size={21} />}
              active={selectedHub === "PUBLIC"}
              onClick={() =>
                setSelectedHub(
                  selectedHub === "PUBLIC"
                    ? "ALL"
                    : "PUBLIC",
                )
              }
            />

            <HubCard
              label="Candidate Hub"
              description="Career and professional guidance for candidates."
              count={candidateArticles}
              icon={<BookOpen size={21} />}
              active={selectedHub === "CANDIDATE"}
              onClick={() =>
                setSelectedHub(
                  selectedHub === "CANDIDATE"
                    ? "ALL"
                    : "CANDIDATE",
                )
              }
            />

            <HubCard
              label="Company Hub"
              description="Hiring and recruitment guidance for employers."
              count={companyArticles}
              icon={<FileText size={21} />}
              active={selectedHub === "COMPANY"}
              onClick={() =>
                setSelectedHub(
                  selectedHub === "COMPANY"
                    ? "ALL"
                    : "COMPANY",
                )
              }
            />

          </div>
        </section>

        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <SummaryCard
            icon={<FileText size={21} />}
            label="Total Guidance"
            value={totalArticles}
            description="Across all three hubs"
          />

          <SummaryCard
            icon={<CheckCircle2 size={21} />}
            label="Published"
            value={publishedArticles}
            description="Visible to users"
          />

          <SummaryCard
            icon={<Clock3 size={21} />}
            label="Drafts"
            value={draftArticles}
            description="Awaiting publication"
          />

          <SummaryCard
            icon={<Eye size={21} />}
            label="Total Views"
            value={totalViews.toLocaleString()}
            description={`${featuredArticles} featured articles`}
          />

        </div>

        {/* =====================================================
            MEDIA SUMMARY
        ===================================================== */}

        <section className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">

          <MediaSummaryCard
            icon={<ImageIcon size={20} />}
            label="Images"
            value={totalImages}
            description="Guidance images"
          />

          <MediaSummaryCard
            icon={<AudioLines size={20} />}
            label="Audio"
            value={totalAudio}
            description="Audio resources"
          />

          <MediaSummaryCard
            icon={<Video size={20} />}
            label="Video"
            value={totalVideo}
            description="Video resources"
          />

        </section>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Toolbar */}

          <div className="border-b border-slate-200 p-4 sm:p-5">

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

              <div className="relative min-w-0 flex-1 xl:max-w-xl">

                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value,
                    )
                  }
                  placeholder="Search guidance..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#1E92D2] focus:bg-white focus:ring-2 focus:ring-[#1E92D2]/10"
                />

              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                <FilterSelect
                  icon={<Filter size={15} />}
                  value={selectedHub}
                  onChange={(value) =>
                    setSelectedHub(
                      value as GuidanceHub | "ALL",
                    )
                  }
                  options={[
                    {
                      label: "All Hubs",
                      value: "ALL",
                    },
                    ...HUB_OPTIONS.map(
                      (hub) => ({
                        label: hub.label,
                        value: hub.value,
                      }),
                    ),
                  ]}
                />

                <FilterSelect
                  value={statusFilter}
                  onChange={(value) =>
                    setStatusFilter(
                      value as
                        | "ALL"
                        | GuidanceStatus,
                    )
                  }
                  options={[
                    {
                      label: "All Status",
                      value: "ALL",
                    },
                    {
                      label: "Published",
                      value: "PUBLISHED",
                    },
                    {
                      label: "Drafts",
                      value: "DRAFT",
                    },
                  ]}
                />

                <FilterSelect
                  value={categoryFilter}
                  onChange={(value) =>
                    setCategoryFilter(
                      value as
                        | "ALL"
                        | GuidanceCategory,
                    )
                  }
                  options={[
                    {
                      label: "All Categories",
                      value: "ALL",
                    },
                    ...Object.values(
                      CATEGORY_OPTIONS,
                    )
                      .flat()
                      .filter(
                        (
                          category,
                          index,
                          array,
                        ) =>
                          array.indexOf(
                            category,
                          ) === index,
                      )
                      .map(
                        (category) => ({
                          label: category,
                          value: category,
                        }),
                      ),
                  ]}
                />

              </div>

            </div>

          </div>

          {/* ===================================================
              TABLE
          =================================================== */}

          {filteredArticles.length > 0 ? (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1250px]">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50/80">

                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Guidance
                    </th>

                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Hub
                    </th>

                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Category
                    </th>

                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Media
                    </th>

                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Views
                    </th>

                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Updated
                    </th>

                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredArticles.map(
                    (article) => (
                      <tr
                        key={article.id}
                        className="transition hover:bg-slate-50/60"
                      >

                        <td className="px-5 py-4">

                          <div className="flex min-w-[360px] items-start gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00466D]/8 text-[#00466D]">
                              <BookOpen size={18} />
                            </div>

                            <div className="min-w-0">

                              <div className="flex items-center gap-2">

                                <p className="truncate text-sm font-semibold text-[#00273D]">
                                  {article.title}
                                </p>

                                {article.featured && (
                                  <Star
                                    size={14}
                                    className="shrink-0 fill-[#FFAD01] text-[#FFAD01]"
                                  />
                                )}

                              </div>

                              <p className="mt-1 max-w-[500px] truncate text-xs text-slate-500">
                                {article.description}
                              </p>

                              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                                <span>
                                  {article.author}
                                </span>

                                <span>
                                  •
                                </span>

                                <span>
                                  {article.readTime} min
                                  read
                                </span>
                              </div>

                            </div>

                          </div>

                        </td>

                        <td className="px-4 py-4">

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getHubClass(
                              article.hub,
                            )}`}
                          >
                            {getHubLabel(
                              article.hub,
                            )}
                          </span>

                        </td>

                        <td className="px-4 py-4">

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getCategoryClass(
                              article.category,
                            )}`}
                          >
                            {article.category}
                          </span>

                        </td>

                        <td className="px-4 py-4">

                          <button
                            type="button"
                            onClick={() =>
                              togglePublished(
                                article.id,
                              )
                            }
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                              article.status ===
                              "PUBLISHED"
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >

                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                article.status ===
                                "PUBLISHED"
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                              }`}
                            />

                            {article.status ===
                            "PUBLISHED"
                              ? "Published"
                              : "Draft"}

                          </button>

                        </td>

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-2">

                            {article.media.length ===
                            0 ? (
                              <span className="text-xs text-slate-400">
                                No media
                              </span>
                            ) : (
                              <>
                                {(
                                  [
                                    "IMAGE",
                                    "AUDIO",
                                    "VIDEO",
                                  ] as MediaType[]
                                ).map(
                                  (type) => {
                                    const count =
                                      article.media.filter(
                                        (
                                          media,
                                        ) =>
                                          media.type ===
                                          type,
                                      ).length;

                                    if (
                                      count ===
                                      0
                                    ) {
                                      return null;
                                    }

                                    return (
                                      <span
                                        key={
                                          type
                                        }
                                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold ${getMediaClass(
                                          type,
                                        )}`}
                                        title={`${count} ${type.toLowerCase()} file${count === 1 ? "" : "s"}`}
                                      >
                                        {getMediaIcon(
                                          type,
                                        )}
                                        {count}
                                      </span>
                                    );
                                  },
                                )}
                              </>
                            )}

                          </div>

                        </td>

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">

                            <Eye
                              size={15}
                              className="text-slate-400"
                            />

                            {article.views.toLocaleString()}

                          </div>

                        </td>

                        <td className="px-4 py-4">

                          <p className="text-sm text-slate-600">
                            {article.updatedAt}
                          </p>

                        </td>

                        <td className="px-5 py-4">

                          <div className="flex items-center justify-end gap-1.5">

                            <button
                              type="button"
                              title={
                                article.featured
                                  ? "Remove featured status"
                                  : "Mark as featured"
                              }
                              onClick={() =>
                                toggleFeatured(
                                  article.id,
                                )
                              }
                              className={`rounded-lg p-2 transition ${
                                article.featured
                                  ? "bg-amber-50 text-[#FFAD01] hover:bg-amber-100"
                                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              }`}
                            >
                              <Star
                                size={16}
                                className={
                                  article.featured
                                    ? "fill-current"
                                    : ""
                                }
                              />
                            </button>

                            <button
                              type="button"
                              title="Edit guidance"
                              onClick={() =>
                                openEditEditor(
                                  article,
                                )
                              }
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-[#1E92D2]"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              type="button"
                              title="Delete guidance"
                              onClick={() =>
                                setDeleteId(
                                  article.id,
                                )
                              }
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>

                        </td>

                      </tr>
                    ),
                  )}

                </tbody>

              </table>

            </div>
          ) : (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Search size={23} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-[#00273D]">
                No guidance found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your hub, search or filter settings.
              </p>

            </div>
          )}

          {/* Footer */}

          <div className="flex flex-col justify-between gap-2 border-t border-slate-200 bg-slate-50/60 px-5 py-3.5 text-xs text-slate-500 sm:flex-row sm:items-center">

            <span>
              Showing {filteredArticles.length} of{" "}
              {articles.length} guidance articles
            </span>

            <span className="flex items-center gap-1.5">
              <Users size={14} />
              Content is managed by TruCity administrators
            </span>

          </div>

        </div>
      </div>

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00273D]/45 p-4 backdrop-blur-sm">

          <div className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">

              <div>

                <h2 className="text-lg font-bold text-[#00273D]">
                  {editingId
                    ? "Edit Guidance"
                    : "Create Guidance"}
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {editingId
                    ? "Update the guidance, hub and media below."
                    : "Create a new resource for one of the TruCity guidance hubs."}
                </p>

              </div>

              <button
                type="button"
                onClick={closeEditor}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>

            </div>

            <div className="space-y-5 p-5 sm:p-6">

              {/* TITLE */}

              <div>

                <label className="mb-1.5 block text-sm font-semibold text-[#00273D]">
                  Guidance title
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    handleFormChange(
                      "title",
                      event.target.value,
                    )
                  }
                  placeholder="e.g. How to prepare for a job interview"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#1E92D2] focus:ring-2 focus:ring-[#1E92D2]/10"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-1.5 block text-sm font-semibold text-[#00273D]">
                  Short description
                </label>

                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    handleFormChange(
                      "description",
                      event.target.value,
                    )
                  }
                  placeholder="Briefly explain what users will learn..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#1E92D2] focus:ring-2 focus:ring-[#1E92D2]/10"
                />

              </div>

              {/* HUB + CATEGORY */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-1.5 block text-sm font-semibold text-[#00273D]">
                    Guidance Hub
                  </label>

                  <div className="relative">

                    <select
                      value={form.hub}
                      onChange={(event) =>
                        handleHubChange(
                          event.target.value as GuidanceHub,
                        )
                      }
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-[#1E92D2] focus:ring-2 focus:ring-[#1E92D2]/10"
                    >

                      {HUB_OPTIONS.map(
                        (hub) => (
                          <option
                            key={hub.value}
                            value={hub.value}
                          >
                            {hub.label}
                          </option>
                        ),
                      )}

                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                  </div>

                  <p className="mt-1.5 text-xs text-slate-400">
                    {
                      HUB_OPTIONS.find(
                        (hub) =>
                          hub.value ===
                          form.hub,
                      )?.description
                    }
                  </p>

                </div>

                <div>

                  <label className="mb-1.5 block text-sm font-semibold text-[#00273D]">
                    Category
                  </label>

                  <div className="relative">

                    <select
                      value={form.category}
                      onChange={(event) =>
                        handleFormChange(
                          "category",
                          event.target.value as GuidanceCategory,
                        )
                      }
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-[#1E92D2] focus:ring-2 focus:ring-[#1E92D2]/10"
                    >

                      {CATEGORY_OPTIONS[
                        form.hub
                      ].map(
                        (category) => (
                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>
                        ),
                      )}

                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                  </div>

                </div>

              </div>

              {/* STATUS */}

              <div>

                <label className="mb-1.5 block text-sm font-semibold text-[#00273D]">
                  Publication status
                </label>

                <div className="relative">

                  <select
                    value={form.status}
                    onChange={(event) =>
                      handleFormChange(
                        "status",
                        event.target.value as GuidanceStatus,
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-[#1E92D2] focus:ring-2 focus:ring-[#1E92D2]/10"
                  >

                    <option value="DRAFT">
                      Draft
                    </option>

                    <option value="PUBLISHED">
                      Published
                    </option>

                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                </div>

              </div>

              {/* CONTENT */}

              <div>

                <label className="mb-1.5 block text-sm font-semibold text-[#00273D]">
                  Guidance content
                </label>

                <textarea
                  rows={9}
                  value={form.content}
                  onChange={(event) =>
                    handleFormChange(
                      "content",
                      event.target.value,
                    )
                  }
                  placeholder="Write the full guidance content here..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#1E92D2] focus:ring-2 focus:ring-[#1E92D2]/10"
                />

              </div>

              {/* =================================================
                  MEDIA UPLOADS
              ================================================= */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <div>

                    <label className="block text-sm font-semibold text-[#00273D]">
                      Media Resources
                    </label>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Add images, audio or video to this guidance resource.
                    </p>

                  </div>

                  <Upload
                    size={17}
                    className="text-slate-400"
                  />

                </div>

                {/* Hidden inputs */}

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) =>
                    handleMediaUpload(
                      event,
                      "IMAGE",
                    )
                  }
                />

                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  multiple
                  className="hidden"
                  onChange={(event) =>
                    handleMediaUpload(
                      event,
                      "AUDIO",
                    )
                  }
                />

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={(event) =>
                    handleMediaUpload(
                      event,
                      "VIDEO",
                    )
                  }
                />

                {/* Upload buttons */}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                  <button
                    type="button"
                    onClick={() =>
                      imageInputRef.current?.click()
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-blue-200 bg-blue-50/50 px-4 py-4 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <ImageIcon size={18} />
                    Add Images
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      audioInputRef.current?.click()
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-purple-200 bg-purple-50/50 px-4 py-4 text-sm font-semibold text-purple-700 transition hover:border-purple-300 hover:bg-purple-50"
                  >
                    <AudioLines size={18} />
                    Add Audio
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      videoInputRef.current?.click()
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-amber-200 bg-amber-50/50 px-4 py-4 text-sm font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-50"
                  >
                    <Video size={18} />
                    Add Video
                  </button>

                </div>

                {/* Attached media */}

                {form.media.length > 0 && (
                  <div className="mt-4 space-y-2">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Attached Media
                    </p>

                    {form.media.map(
                      (media) => (
                        <div
                          key={media.id}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                        >

                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getMediaClass(
                              media.type,
                            )}`}
                          >
                            {getMediaIcon(
                              media.type,
                            )}
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-semibold text-[#00273D]">
                              {media.name}
                            </p>

                            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">

                              <span>
                                {media.type}
                              </span>

                              <span>
                                •
                              </span>

                              <span>
                                {formatFileSize(
                                  media.size,
                                )}
                              </span>

                            </div>

                          </div>

                          {/* Preview */}

                          {media.type ===
                            "IMAGE" && (
                            <img
                              src={media.url}
                              alt={media.name}
                              className="h-12 w-16 rounded-lg object-cover"
                            />
                          )}

                          {media.type ===
                            "VIDEO" && (
                            <div className="flex h-12 w-16 items-center justify-center overflow-hidden rounded-lg bg-slate-900 text-white">
                              <PlayCircle
                                size={22}
                              />
                            </div>
                          )}

                          {media.type ===
                            "AUDIO" && (
                            <AudioLines
                              size={21}
                              className="text-purple-500"
                            />
                          )}

                          <button
                            type="button"
                            title="Remove media"
                            onClick={() =>
                              removeMedia(
                                media.id,
                              )
                            }
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <X size={16} />
                          </button>

                        </div>
                      ),
                    )}

                  </div>
                )}

              </div>

              {/* FEATURED */}

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) =>
                    handleFormChange(
                      "featured",
                      event.target.checked,
                    )
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#00466D] focus:ring-[#1E92D2]"
                />

                <span>

                  <span className="flex items-center gap-1.5 text-sm font-semibold text-[#00273D]">
                    <Star
                      size={15}
                      className="text-[#FFAD01]"
                    />
                    Feature this guidance
                  </span>

                  <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                    Featured guidance can be highlighted prominently in the
                    selected hub.
                  </span>

                </span>

              </label>

              {/* INFO */}

              <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">

                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  Media is currently managed locally in this admin page.
                  Selected files are available for preview during this session.
                  Backend storage can be connected later without changing the
                  hub structure.
                </span>

              </div>

            </div>

            {/* FOOTER */}

            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">

              <button
                type="button"
                onClick={closeEditor}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={
                  !form.title.trim() ||
                  !form.description.trim()
                }
                className="rounded-xl bg-[#00466D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#003854] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editingId
                  ? "Save Changes"
                  : "Create Guidance"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#00273D]/45 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={21} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-[#00273D]">
              Delete guidance?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This will remove the guidance article and its attached media from
              the local admin list. This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  setDeleteId(null)
                }
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Delete Guidance
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/*
 * =========================================================
 * HUB CARD
 * =========================================================
 */

interface HubCardProps {
  label: string;
  description: string;
  count: number;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

function HubCard({
  label,
  description,
  count,
  icon,
  active,
  onClick,
}: HubCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-2xl border p-5 text-left shadow-sm transition ${
        active
          ? "border-[#1E92D2] bg-[#F8FCFF] ring-2 ring-[#1E92D2]/10"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-4">

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            active
              ? "bg-[#00466D] text-white"
              : "bg-[#00466D]/8 text-[#00466D]"
          }`}
        >
          {icon}
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            active
              ? "bg-[#00466D] text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {count}
        </span>

      </div>

      <h3 className="mt-4 text-base font-bold text-[#00273D]">
        {label}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>

      <div className="mt-3 text-xs font-semibold text-[#1E92D2]">
        {active
          ? "Showing this hub"
          : "Manage hub content"}
      </div>

    </button>
  );
}

/*
 * =========================================================
 * SUMMARY CARD
 * =========================================================
 */

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description: string;
}

function SummaryCard({
  icon,
  label,
  value,
  description,
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-[#00273D]">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>

        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00466D]/8 text-[#00466D]">
          {icon}
        </div>

      </div>

    </div>
  );
}

/*
 * =========================================================
 * MEDIA SUMMARY CARD
 * =========================================================
 */

interface MediaSummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
}

function MediaSummaryCard({
  icon,
  label,
  value,
  description,
}: MediaSummaryCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </div>

      <div>

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 text-xl font-bold text-[#00273D]">
          {value}
        </p>

        <p className="text-xs text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
}

/*
 * =========================================================
 * FILTER SELECT
 * =========================================================
 */

interface FilterSelectProps {
  icon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    label: string;
    value: string;
  }>;
}

function FilterSelect({
  icon,
  value,
  onChange,
  options,
}: FilterSelectProps) {
  return (
    <div className="relative min-w-[155px]">

      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
      )}

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pr-9 text-sm font-medium text-slate-600 outline-none transition focus:border-[#1E92D2] focus:ring-2 focus:ring-[#1E92D2]/10 ${
          icon
            ? "pl-9"
            : "pl-3.5"
        }`}
      >

        {options.map(
          (option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ),
        )}

      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />

    </div>
  );
}

/*
 * =========================================================
 * FILE SIZE
 * =========================================================
 */

function formatFileSize(
  bytes: number,
) {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ];

  const index =
    Math.floor(
      Math.log(bytes) /
        Math.log(1024),
    );

  const safeIndex =
    Math.min(
      index,
      units.length - 1,
    );

  return `${(
    bytes /
    Math.pow(
      1024,
      safeIndex,
    )
  ).toFixed(
    safeIndex === 0 ? 0 : 1,
  )} ${units[safeIndex]}`;
}