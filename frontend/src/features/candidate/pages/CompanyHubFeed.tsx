
import { useCallback, useEffect, useState } from 'react';

import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Newspaper,
  RefreshCw,
  Video,
} from 'lucide-react';

import api from '../../../api/axios';

type PublishedContent = {
  id: string;
  companyName: string;
  title: string;
  summary: string | null;
  body: string | null;
  contentType: string;
  category: string | null;
  eventStartsAt: string | null;
  eventEndsAt: string | null;
  eventLocation: string | null;
  mediaUrl: string | null;
  mediaContentType: string | null;
  publishedAt: string | null;
};

function formatDateTime(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatContentType(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function isVideo(item: PublishedContent): boolean {
  return Boolean(item.mediaContentType?.startsWith('video/'));
}

function CompanyHubSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
      aria-label="Loading company updates"
      role="status"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-[#E1EAF0] bg-white"
        >
          <div className="h-48 animate-pulse bg-[#EAF1F5]" />

          <div className="space-y-4 p-5">
            <div className="h-5 w-24 animate-pulse rounded-full bg-[#EAF1F5]" />
            <div className="h-6 w-4/5 animate-pulse rounded bg-[#EAF1F5]" />
            <div className="h-4 w-2/5 animate-pulse rounded bg-[#EAF1F5]" />

            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-[#F0F4F7]" />
              <div className="h-3 w-full animate-pulse rounded bg-[#F0F4F7]" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-[#F0F4F7]" />
            </div>
          </div>
        </div>
      ))}

      <span className="sr-only">Loading company updates…</span>
    </div>
  );
}

function CompanyHubCard({
  item,
}: {
  item: PublishedContent;
}) {
  const video = isVideo(item);
  const publishedDate = formatDate(item.publishedAt);
  const startDateTime = formatDateTime(item.eventStartsAt);
  const endDateTime = formatDateTime(item.eventEndsAt);

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#DCE8EF] bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#B9D8E8] hover:shadow-md">
      {/* Media */}
      {item.mediaUrl && (
        <div className="relative overflow-hidden bg-[#00273D]">
          {video ? (
            <video
              controls
              preload="metadata"
              playsInline
              className="max-h-72 min-h-48 w-full bg-[#00273D] object-contain"
              src={item.mediaUrl}
              aria-label={`Video: ${item.title}`}
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <img
              src={item.mediaUrl}
              alt={item.title}
              loading="lazy"
              className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          )}

          {video && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[#00273D]/85 px-3 py-1.5 text-xs font-semibold text-white">
              <Video size={13} />
              Video
            </span>
          )}
        </div>
      )}

      {/* Card content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF5FC] px-3 py-1.5 text-xs font-bold text-[#00466D]">
            <FileText size={13} />
            {formatContentType(item.contentType)}
          </span>

          {item.category && (
            <span className="rounded-full border border-[#E1EAF0] bg-[#F8FCFF] px-3 py-1.5 text-xs font-medium text-slate-600">
              {item.category}
            </span>
          )}
        </div>

        <h2 className="mt-4 break-words text-lg font-bold leading-7 text-[#00273D] transition group-hover:text-[#00466D]">
          {item.title}
        </h2>

        <div className="mt-3 flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0F6FA] text-[#1E92D2]">
            <Building2 size={16} />
          </span>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#00466D]">
              {item.companyName}
            </p>

            {publishedDate && (
              <p className="mt-0.5 text-xs text-slate-500">
                Published {publishedDate}
              </p>
            )}
          </div>
        </div>

        {item.summary && (
          <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
            {item.summary}
          </p>
        )}

        {item.body && (
          <div className="mt-4 border-t border-[#EAF0F4] pt-4">
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
              {item.body}
            </p>
          </div>
        )}

        {/* Event details */}
        {item.eventStartsAt && (
          <div className="mt-5 rounded-xl border border-[#E1EAF0] bg-[#F8FCFF] p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#1E92D2] shadow-sm">
                <CalendarDays size={18} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-[#00466D]">
                  Event details
                </p>

                {startDateTime ? (
                  <p className="mt-2 flex items-start gap-2 text-sm font-semibold leading-5 text-[#00273D]">
                    <Clock3
                      size={15}
                      className="mt-0.5 shrink-0 text-[#1E92D2]"
                    />
                    <span>{startDateTime}</span>
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">
                    Event date to be confirmed.
                  </p>
                )}

                {endDateTime && (
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Ends {endDateTime}
                  </p>
                )}

                {item.eventLocation && (
                  <p className="mt-2 flex items-start gap-2 text-sm leading-5 text-slate-600">
                    <MapPin
                      size={15}
                      className="mt-0.5 shrink-0 text-[#1E92D2]"
                    />
                    <span className="break-words">{item.eventLocation}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto pt-5">
          <div className="flex items-center gap-2 border-t border-[#EAF0F4] pt-4 text-xs font-medium text-slate-500">
            {video ? (
              <>
                <Video size={15} className="text-[#1E92D2]" />
                <span>Watch company video</span>
              </>
            ) : item.eventStartsAt ? (
              <>
                <CalendarDays size={15} className="text-[#1E92D2]" />
                <span>Company event</span>
              </>
            ) : (
              <>
                <Newspaper size={15} className="text-[#1E92D2]" />
                <span>Company update</span>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CompanyHubFeed() {
  const [items, setItems] = useState<PublishedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCompanyHub = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response =
        await api.get<PublishedContent[]>('/api/candidate/company-hub');

      setItems(
        Array.isArray(response.data) ? response.data : [],
      );
    } catch (error) {
      console.error('Unable to load Company Hub content:', error);

      setError(
        'Company Hub content could not be loaded. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCompanyHub();
  }, [loadCompanyHub]);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 pb-8">
      {/* Page header */}
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00273D] to-[#00466D] p-6 text-white sm:rounded-3xl sm:p-8 lg:p-9">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
            <Building2 size={14} className="text-[#FFD784]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#FFD784]">
              TruCity · Employer Updates
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Company Hub
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
            Discover company stories, industry insights, seminars,
            webinars, training opportunities and videos shared by
            employers.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-white/75 sm:text-sm">
            <span className="inline-flex items-center gap-2">
              <Newspaper size={15} className="text-[#FFD784]" />
              Company news
            </span>

            <span className="inline-flex items-center gap-2">
              <CalendarDays size={15} className="text-[#FFD784]" />
              Events and seminars
            </span>

            <span className="inline-flex items-center gap-2">
              <Video size={15} className="text-[#FFD784]" />
              Videos and media
            </span>
          </div>
        </div>
      </header>

      {/* Section heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1E92D2]">
            Stay informed
          </p>

          <h2 className="mt-1 text-xl font-bold text-[#00273D] sm:text-2xl">
            Latest company updates
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Explore the latest content published by companies on TruCity.
          </p>
        </div>

        {!loading && !error && items.length > 0 && (
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#DCE8EF] bg-white px-3 py-2 text-xs font-semibold text-[#00466D]">
            <CheckCircle2 size={15} className="text-[#1E92D2]" />
            {items.length} {items.length === 1 ? 'update' : 'updates'}
          </span>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600">
              <RefreshCw size={19} />
            </span>

            <div>
              <h2 className="font-semibold text-rose-900">
                Unable to load company updates
              </h2>

              <p className="mt-1 text-sm leading-6 text-rose-800">
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadCompanyHub()}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-800 transition hover:bg-rose-100"
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && <CompanyHubSkeleton />}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#C9DCE7] bg-white px-5 py-12 text-center sm:px-8 sm:py-16">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF5FC] text-[#1E92D2]">
            <Building2 size={30} />
          </div>

          <h2 className="mt-5 text-lg font-bold text-[#00273D] sm:text-xl">
            No published updates yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Company stories, industry news, training sessions and events
            will appear here when employers publish them.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#1E92D2]">
            Check back for new updates
            <ArrowRight size={16} />
          </div>
        </div>
      )}

      {/* Published content */}
      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 items-stretch gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <CompanyHubCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
