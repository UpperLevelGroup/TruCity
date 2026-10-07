import { useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit3,
  Eye,
  FileText,
  Filter,
  Plus,
  Search,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";

type GuidanceStatus = "PUBLISHED" | "DRAFT";

type GuidanceCategory =
  | "Career"
  | "Job Search"
  | "Verification"
  | "Workplace"
  | "Skills"
  | "TruCity";

interface GuidanceArticle {
  id: string;
  title: string;
  description: string;
  category: GuidanceCategory;
  status: GuidanceStatus;
  author: string;
  views: number;
  featured: boolean;
  updatedAt: string;
  readTime: number;
}

interface GuidanceForm {
  title: string;
  description: string;
  category: GuidanceCategory;
  status: GuidanceStatus;
  featured: boolean;
  content: string;
}

const INITIAL_GUIDANCE: GuidanceArticle[] = [
  {
    id: "guide-001",
    title: "How to Build a Strong Professional Profile",
    description:
      "Practical guidance to help candidates create a professional profile that stands out to verified employers.",
    category: "Career",
    status: "PUBLISHED",
    author: "TruCity Admin",
    views: 1248,
    featured: true,
    updatedAt: "2 Oct 2026",
    readTime: 5,
  },
  {
    id: "guide-002",
    title: "Understanding TruCity Verification",
    description:
      "Learn how candidate and employer verification works and why verification matters on TruCity.",
    category: "Verification",
    status: "PUBLISHED",
    author: "TruCity Admin",
    views: 936,
    featured: true,
    updatedAt: "29 Sep 2026",
    readTime: 4,
  },
  {
    id: "guide-003",
    title: "How to Find the Right Job Opportunity",
    description:
      "A practical guide for candidates comparing opportunities, requirements, salary information and closing dates.",
    category: "Job Search",
    status: "PUBLISHED",
    author: "TruCity Admin",
    views: 817,
    featured: false,
    updatedAt: "27 Sep 2026",
    readTime: 6,
  },
  {
    id: "guide-004",
    title: "Preparing for Your First Interview",
    description:
      "Tips for researching an employer, preparing answers and presenting yourself professionally.",
    category: "Job Search",
    status: "DRAFT",
    author: "TruCity Admin",
    views: 0,
    featured: false,
    updatedAt: "25 Sep 2026",
    readTime: 7,
  },
  {
    id: "guide-005",
    title: "Workplace Professionalism",
    description:
      "Essential workplace behaviours that help professionals build trust and long-term career relationships.",
    category: "Workplace",
    status: "PUBLISHED",
    author: "TruCity Admin",
    views: 604,
    featured: false,
    updatedAt: "22 Sep 2026",
    readTime: 5,
  },
  {
    id: "guide-006",
    title: "Improving Your Employability Skills",
    description:
      "Understand the skills employers commonly look for and how to demonstrate them effectively.",
    category: "Skills",
    status: "PUBLISHED",
    author: "TruCity Admin",
    views: 489,
    featured: false,
    updatedAt: "18 Sep 2026",
    readTime: 6,
  },
];

const EMPTY_FORM: GuidanceForm = {
  title: "",
  description: "",
  category: "Career",
  status: "DRAFT",
  featured: false,
  content: "",
};

const CATEGORY_OPTIONS: GuidanceCategory[] = [
  "Career",
  "Job Search",
  "Verification",
  "Workplace",
  "Skills",
  "TruCity",
];

export default function AdminGuidance() {
  const [articles, setArticles] =
    useState<GuidanceArticle[]>(INITIAL_GUIDANCE);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | GuidanceStatus>(
    "ALL",
  );
  const [categoryFilter, setCategoryFilter] = useState<
    "ALL" | GuidanceCategory
  >("ALL");

  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GuidanceForm>(EMPTY_FORM);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredArticles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesSearch =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.description.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || article.status === statusFilter;

      const matchesCategory =
        categoryFilter === "ALL" || article.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [articles, searchTerm, statusFilter, categoryFilter]);

  const totalArticles = articles.length;

  const publishedArticles = articles.filter(
    (article) => article.status === "PUBLISHED",
  ).length;

  const draftArticles = articles.filter(
    (article) => article.status === "DRAFT",
  ).length;

  const totalViews = articles.reduce((total, article) => {
    return total + article.views;
  }, 0);

  const featuredArticles = articles.filter(
    (article) => article.featured,
  ).length;

  const openCreateEditor = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowEditor(true);
  };

  const openEditEditor = (article: GuidanceArticle) => {
    setEditingId(article.id);

    setForm({
      title: article.title,
      description: article.description,
      category: article.category,
      status: article.status,
      featured: article.featured,
      content: "",
    });

    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (
    field: keyof GuidanceForm,
    value: string | boolean,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = () => {
    const title = form.title.trim();
    const description = form.description.trim();

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
                category: form.category,
                status: form.status,
                featured: form.featured,
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
        category: form.category,
        status: form.status,
        author: "TruCity Admin",
        views: 0,
        featured: form.featured,
        updatedAt: "Just now",
        readTime: 5,
      };

      setArticles((current) => [newArticle, ...current]);
    }

    closeEditor();
  };

  const togglePublished = (id: string) => {
    setArticles((current) =>
      current.map((article) =>
        article.id === id
          ? {
              ...article,
              status:
                article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
              updatedAt: "Just now",
            }
          : article,
      ),
    );
  };

  const toggleFeatured = (id: string) => {
    setArticles((current) =>
      current.map((article) =>
        article.id === id
          ? {
              ...article,
              featured: !article.featured,
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
      current.filter((article) => article.id !== deleteId),
    );

    setDeleteId(null);
  };

  const getCategoryClass = (category: GuidanceCategory) => {
    switch (category) {
      case "Verification":
        return "bg-blue-50 text-blue-700";
      case "Job Search":
        return "bg-amber-50 text-amber-700";
      case "Workplace":
        return "bg-purple-50 text-purple-700";
      case "Skills":
        return "bg-emerald-50 text-emerald-700";
      case "TruCity":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-cyan-50 text-cyan-700";
    }
  };

  return (
    <div className="min-h-full bg-[#F7FAFC] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#1E92D2]">
              <BookOpen size={17} />
              Guidance Hub
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#00273D] sm:text-3xl">
              Guidance Management
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Create, manage and publish guidance content that helps TruCity
              candidates make better career decisions.
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

        {/* Summary cards */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<FileText size={21} />}
            label="Total Guidance"
            value={totalArticles}
            description="All guidance articles"
          />

          <SummaryCard
            icon={<CheckCircle2 size={21} />}
            label="Published"
            value={publishedArticles}
            description="Visible to candidates"
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

        {/* Main content */}
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
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search guidance..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#1E92D2] focus:bg-white focus:ring-2 focus:ring-[#1E92D2]/10"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <FilterSelect
                  icon={<Filter size={15} />}
                  value={statusFilter}
                  onChange={(value) =>
                    setStatusFilter(value as "ALL" | GuidanceStatus)
                  }
                  options={[
                    { label: "All Status", value: "ALL" },
                    { label: "Published", value: "PUBLISHED" },
                    { label: "Drafts", value: "DRAFT" },
                  ]}
                />

                <FilterSelect
                  value={categoryFilter}
                  onChange={(value) =>
                    setCategoryFilter(value as "ALL" | GuidanceCategory)
                  }
                  options={[
                    { label: "All Categories", value: "ALL" },
                    ...CATEGORY_OPTIONS.map((category) => ({
                      label: category,
                      value: category,
                    })),
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {filteredArticles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Guidance
                    </th>

                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Category
                    </th>

                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
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
                  {filteredArticles.map((article) => (
                    <tr
                      key={article.id}
                      className="transition hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4">
                        <div className="flex min-w-[390px] items-start gap-3">
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

                            <p className="mt-1 max-w-[560px] truncate text-xs text-slate-500">
                              {article.description}
                            </p>

                            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                              <span>{article.author}</span>
                              <span>•</span>
                              <span>{article.readTime} min read</span>
                            </div>
                          </div>
                        </div>
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
                          onClick={() => togglePublished(article.id)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                            article.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              article.status === "PUBLISHED"
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {article.status === "PUBLISHED"
                            ? "Published"
                            : "Draft"}
                        </button>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                          <Eye size={15} className="text-slate-400" />
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
                            onClick={() => toggleFeatured(article.id)}
                            className={`rounded-lg p-2 transition ${
                              article.featured
                                ? "bg-amber-50 text-[#FFAD01] hover:bg-amber-100"
                                : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            }`}
                          >
                            <Star
                              size={16}
                              className={
                                article.featured ? "fill-current" : ""
                              }
                            />
                          </button>

                          <button
                            type="button"
                            title="Edit guidance"
                            onClick={() => openEditEditor(article)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-[#1E92D2]"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            type="button"
                            title="Delete guidance"
                            onClick={() => setDeleteId(article.id)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                Try changing your search or filter settings.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-col justify-between gap-2 border-t border-slate-200 bg-slate-50/60 px-5 py-3.5 text-xs text-slate-500 sm:flex-row sm:items-center">
            <span>
              Showing {filteredArticles.length} of {articles.length} guidance
              articles
            </span>

            <span className="flex items-center gap-1.5">
              <Users size={14} />
              Guidance content is managed by TruCity administrators
            </span>
          </div>
        </div>
      </div>

      {/* Create / Edit modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00273D]/45 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-[#00273D]">
                  {editingId ? "Edit Guidance" : "Create Guidance"}
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {editingId
                    ? "Update the guidance information below."
                    : "Create a new resource for the TruCity Guidance Hub."}
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
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#00273D]">
                  Guidance title
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    handleFormChange("title", event.target.value)
                  }
                  placeholder="e.g. How to prepare for a job interview"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#1E92D2] focus:ring-2 focus:ring-[#1E92D2]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#00273D]">
                  Short description
                </label>

                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    handleFormChange("description", event.target.value)
                  }
                  placeholder="Briefly explain what candidates will learn..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#1E92D2] focus:ring-2 focus:ring-[#1E92D2]/10"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
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
                      {CATEGORY_OPTIONS.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>

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
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#00273D]">
                  Guidance content
                </label>

                <textarea
                  rows={8}
                  value={form.content}
                  onChange={(event) =>
                    handleFormChange("content", event.target.value)
                  }
                  placeholder="Write the full guidance content here..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#1E92D2] focus:ring-2 focus:ring-[#1E92D2]/10"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) =>
                    handleFormChange("featured", event.target.checked)
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#00466D] focus:ring-[#1E92D2]"
                />

                <span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-[#00273D]">
                    <Star size={15} className="text-[#FFAD01]" />
                    Feature this guidance
                  </span>

                  <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                    Featured guidance can be highlighted prominently in the
                    candidate Guidance Hub.
                  </span>
                </span>
              </label>

              <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>
                  Content is currently managed locally in this admin page.
                  Backend persistence can be connected once the guidance API
                  and database structure are added.
                </span>
              </div>
            </div>

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
                disabled={!form.title.trim() || !form.description.trim()}
                className="rounded-xl bg-[#00466D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#003854] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editingId ? "Save Changes" : "Create Guidance"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
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
              This will remove the guidance article from the admin list. This
              action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
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

          <p className="mt-2 text-2xl font-bold text-[#00273D]">{value}</p>

          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00466D]/8 text-[#00466D]">
          {icon}
        </div>
      </div>
    </div>
  );
}

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
    <div className="relative min-w-[160px]">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
      )}

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pr-9 text-sm font-medium text-slate-600 outline-none transition focus:border-[#1E92D2] focus:ring-2 focus:ring-[#1E92D2]/10 ${
          icon ? "pl-9" : "pl-3.5"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}
