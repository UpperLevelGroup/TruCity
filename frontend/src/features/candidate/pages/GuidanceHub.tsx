
import { useEffect, useState, type ReactNode } from 'react';

import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Headphones,
  Info,
  Pause,
  Play,
  Scale,
  Share2,
  ShieldCheck,
  Sparkles,
  Video,
} from 'lucide-react';

type HubTab = 'videos' | 'guides' | 'audio';
type GuidanceAudience = 'ALL' | 'CANDIDATE' | 'COMPANY';
type ContentType = 'GUIDE' | 'VIDEO' | 'AUDIO';

interface GuidanceItem {
  id: string;
  title: string;
  contentType: ContentType;
  audience: GuidanceAudience;
  category: string;
  description: string | null;
  content: string | null;
  mediaUrl: string | null;
  duration: string | null;
  readingTime: string | null;
  icon: string | null;
  published: boolean;
  featured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface GuidanceHubProps {
  audience?: GuidanceAudience;
}

const API_BASE = (
  import.meta.env.VITE_API_URL || 'http://localhost:8080'
).replace(/\/+$/, '');

const HUB_COPY: Record<
  GuidanceAudience,
  { title: string; subtitle: string; label: string }
> = {
  ALL: {
    title: 'Practical guidance for the world of',
    subtitle:
      'Explore practical information on careers, workplace rights, employment, professional development and safer recruitment practices. The Guidance Hub is designed for everyone navigating the workplace.',
    label: 'Public Resource Centre',
  },
  CANDIDATE: {
    title: 'Build your confidence for the',
    subtitle:
      'Explore guidance on CVs, professional profiles, job applications, interviews, skills and safer job searching.',
    label: 'Candidate Resource Centre',
  },
  COMPANY: {
    title: 'Make better decisions in the',
    subtitle:
      'Explore practical guidance on recruitment, job postings, candidate evaluation, verification and professional hiring.',
    label: 'Company Resource Centre',
  },
};

function displayError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Unable to load guidance right now.';
}

function GuideIcon({ type }: { type: string | null }) {
  const className = 'h-5 w-5';

  switch (type?.toLowerCase()) {
    case 'rights':
    case 'labour':
      return <Scale className={className} />;
    case 'safety':
    case 'verification':
      return <ShieldCheck className={className} />;
    case 'career':
    case 'hiring':
      return <BriefcaseBusiness className={className} />;
    case 'cv':
    case 'profile':
      return <FileText className={className} />;
    default:
      return <BookOpen className={className} />;
  }
}

export default function GuidanceHub({
  audience = 'ALL',
}: GuidanceHubProps) {
  const [activeTab, setActiveTab] = useState<HubTab>('videos');
  const [items, setItems] = useState<GuidanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGuide, setSelectedGuide] =
    useState<GuidanceItem | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [sharedItemKey, setSharedItemKey] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadGuidance() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE}/api/guidance?audience=${audience}`,
          {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(
            response.status === 403
              ? 'Guidance access is blocked by the server security configuration.'
              : `Guidance could not be loaded (HTTP ${response.status}).`,
          );
        }

        const data: GuidanceItem[] = await response.json();

        // Only published items for the requested audience should be returned
        // by the backend. Keep this defensive filter in the UI as well.
        setItems(
          data.filter(
            (item) =>
              item.published === true &&
              item.audience === audience,
          ),
        );
      } catch (loadError) {
        if (loadError instanceof Error && loadError.name === 'AbortError') {
          return;
        }

        setError(displayError(loadError));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadGuidance();

    return () => controller.abort();
  }, [audience]);

  const videos = items.filter((item) => item.contentType === 'VIDEO');
  const guides = items.filter((item) => item.contentType === 'GUIDE');
  const audioItems = items.filter((item) => item.contentType === 'AUDIO');
  const copy = HUB_COPY[audience];

  async function handleShare(item: GuidanceItem) {
    const key = `${item.contentType}-${item.id}`;
    const currentUrl =
      typeof window !== 'undefined' ? window.location.href : '';

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: item.title,
          text: item.description || item.title,
          url: currentUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          `${item.title}\n\n${item.description || ''}\n\n${currentUrl}`,
        );
      } else {
        throw new Error('Sharing is not supported by this browser.');
      }

      setSharedItemKey(key);
      window.setTimeout(() => setSharedItemKey(null), 2200);
    } catch (shareError) {
      if (
        shareError instanceof DOMException &&
        shareError.name === 'AbortError'
      ) {
        return;
      }

      console.error('Unable to share guidance:', shareError);
    }
  }

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-transparent pb-16 font-sans text-brand-text">
      <div className="relative z-10 mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="mb-8 overflow-hidden rounded-[28px] border border-brand-border bg-white/95 shadow-[0_18px_50px_rgba(0,70,109,0.08)] backdrop-blur-sm">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_320px] lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-primary">
                <Sparkles className="h-3.5 w-3.5" />
                TruCity {copy.label}
              </div>

              <h1 className="!m-0 max-w-[720px] text-[32px] font-bold leading-[1.1] tracking-[-0.035em] !text-brand-primary sm:text-[40px] lg:text-[44px]">
                {copy.title}{' '}
                <span className="text-brand-gold">world of work.</span>
              </h1>

              <p className="mt-4 max-w-[700px] text-[16px] leading-7 text-brand-textMuted">
                {copy.subtitle}
              </p>
            </div>

            <div className="rounded-[22px] border border-brand-border bg-brand-bg p-5">
              <div className="mb-4 flex items-center gap-2 text-[14px] font-bold text-brand-primary">
                <Info className="h-4 w-4 text-brand-accent" />
                Stay informed
              </div>

              <ul className="space-y-3 text-[12px] leading-5 text-brand-textMuted">
                <InfoPoint>
                  Understand important workplace rights and responsibilities.
                </InfoPoint>
                <InfoPoint>
                  Recognise potentially unsafe or fraudulent recruitment practices.
                </InfoPoint>
                <InfoPoint>
                  Build stronger professional, career and workplace skills.
                </InfoPoint>
              </ul>
            </div>
          </div>
        </section>

        {/* NAVIGATION */}
        <div className="sticky top-[104px] z-30 mb-7 rounded-[20px] border border-brand-border bg-white/95 p-2 shadow-[0_12px_34px_rgba(0,70,109,0.08)] backdrop-blur-xl">
          <div
            className="flex gap-2 overflow-x-auto"
            role="tablist"
            aria-label="Guidance Hub sections"
          >
            <HubTabButton
              active={activeTab === 'videos'}
              onClick={() => setActiveTab('videos')}
              icon={<Video className="h-4 w-4" />}
            >
              Quick Videos
            </HubTabButton>

            <HubTabButton
              active={activeTab === 'guides'}
              onClick={() => setActiveTab('guides')}
              icon={<BookOpen className="h-4 w-4" />}
            >
              Guides
            </HubTabButton>

            <HubTabButton
              active={activeTab === 'audio'}
              onClick={() => setActiveTab('audio')}
              icon={<Headphones className="h-4 w-4" />}
            >
              Audio Briefings
            </HubTabButton>
          </div>
        </div>

        {loading && (
          <div className="rounded-[22px] border border-brand-border bg-white p-8 text-center text-sm text-brand-textMuted">
            Loading published guidance…
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-[22px] border border-red-200 bg-white p-6 text-sm text-red-700"
          >
            <p className="font-bold">Guidance is temporarily unavailable.</p>
            <p className="mt-2">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-[10px] border border-brand-border px-4 py-2 font-bold text-brand-primary"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {activeTab === 'videos' && (
              <section>
                <SectionHeading
                  eyebrow="Quick Learning"
                  title="Short workplace videos"
                  description="Watch practical guidance covering careers, recruitment and workplace situations."
                />

                {videos.length === 0 ? (
                  <EmptyState message="No videos have been published for this hub yet." />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {videos.map((item) => (
                      <article
                        key={item.id}
                        className="overflow-hidden rounded-[22px] border border-brand-border bg-white shadow-[0_12px_32px_rgba(0,70,109,0.06)]"
                      >
                        <div className="relative flex min-h-[180px] items-center justify-center overflow-hidden bg-brand-primary">
                          {item.mediaUrl ? (
                            <video
                              className="max-h-[360px] w-full bg-black"
                              src={item.mediaUrl}
                              controls
                              preload="metadata"
                              aria-label={item.title}
                            >
                              Your browser does not support video playback.
                            </video>
                          ) : (
                            <>
                              <div
                                aria-hidden="true"
                                className="absolute -right-10 -top-12 h-36 w-36 rounded-full border-[24px] border-brand-accent/30"
                              />
                              <div className="relative z-10 grid h-14 w-14 place-items-center rounded-full border border-white/50 bg-white text-brand-primary">
                                <Play className="ml-0.5 h-5 w-5" />
                              </div>
                              <span className="absolute bottom-4 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
                                Video not yet available
                              </span>
                            </>
                          )}

                          {item.duration && (
                            <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold text-white">
                              {item.duration}
                            </span>
                          )}
                        </div>

                        <div className="p-5">
                          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-accent">
                            {item.category}
                          </div>
                          <h3 className="!m-0 text-[18px] font-bold leading-6 !text-brand-primary">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-[14px] leading-6 text-brand-textMuted">
                            {item.description || 'Explore this TruCity video briefing.'}
                          </p>
                          <div className="mt-5 flex items-center justify-between gap-3 border-t border-brand-border pt-4">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-textMuted">
                              <Video className="h-3.5 w-3.5" />
                              TruCity Guidance
                            </span>
                            <ShareButton
                              shared={sharedItemKey === `VIDEO-${item.id}`}
                              onClick={() => void handleShare(item)}
                            />
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'guides' && (
              <section>
                <SectionHeading
                  eyebrow="Guidance Library"
                  title="Useful workplace resources"
                  description="Read practical information and guidance published by TruCity."
                />

                {guides.length === 0 ? (
                  <EmptyState message="No guides have been published for this hub yet." />
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {guides.map((item) => (
                      <article
                        key={item.id}
                        className="group rounded-[22px] border border-brand-border bg-white/95 p-5 shadow-[0_12px_32px_rgba(0,70,109,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-accent/40 hover:shadow-[0_18px_42px_rgba(0,70,109,0.10)]"
                      >
                        <div className="mb-5 flex items-start justify-between gap-4">
                          <div className="grid h-12 w-12 place-items-center rounded-[15px] bg-brand-accent/10 text-brand-primary">
                            <GuideIcon type={item.icon} />
                          </div>
                          <span className="rounded-full border border-brand-border bg-brand-bg px-3 py-1 text-[10px] font-bold text-brand-textMuted">
                            {item.readingTime || 'Guide'}
                          </span>
                        </div>

                        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-accent">
                          {item.category}
                        </div>
                        <h3 className="!m-0 text-[18px] font-bold leading-6 !text-brand-primary">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-[14px] leading-6 text-brand-textMuted">
                          {item.description || 'Open this guide to read the full content.'}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedGuide(item)}
                            className="inline-flex min-h-[36px] items-center gap-2 rounded-[10px] px-1 text-[12px] font-bold text-brand-primary hover:text-brand-accent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent/15"
                          >
                            Read guide
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </button>
                          <ShareButton
                            shared={sharedItemKey === `GUIDE-${item.id}`}
                            onClick={() => void handleShare(item)}
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === 'audio' && (
              <section>
                <SectionHeading
                  eyebrow="Audio Briefings"
                  title="Listen and learn"
                  description="Listen to published briefings covering workplace issues, employment and professional development."
                />

                {audioItems.length === 0 ? (
                  <EmptyState message="No audio briefings have been published for this hub yet." />
                ) : (
                  <div className="space-y-4">
                    {audioItems.map((item) => {
                      const isPlaying = playingAudioId === item.id;

                      return (
                        <article
                          key={item.id}
                          className="rounded-[22px] border border-brand-border bg-white/95 p-5 shadow-[0_12px_32px_rgba(0,70,109,0.06)] sm:p-6"
                        >
                          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 gap-4">
                              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[15px] border border-brand-gold/40 bg-brand-orange/25 text-brand-primary">
                                <Headphones className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-primary">
                                    {item.category}
                                  </span>
                                  {item.duration && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-textMuted">
                                      <Clock3 className="h-3 w-3" />
                                      {item.duration}
                                    </span>
                                  )}
                                </div>
                                <h3 className="!m-0 text-[18px] font-bold leading-6 !text-brand-primary">
                                  {item.title}
                                </h3>
                                <p className="mt-2 text-[14px] leading-6 text-brand-textMuted">
                                  {item.description || 'Listen to this TruCity audio briefing.'}
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-wrap items-center gap-2">
                              <ShareButton
                                shared={sharedItemKey === `AUDIO-${item.id}`}
                                onClick={() => void handleShare(item)}
                              />
                              {item.mediaUrl && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPlayingAudioId(isPlaying ? null : item.id)
                                  }
                                  aria-pressed={isPlaying}
                                  className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[13px] border px-4 text-[12px] font-bold transition-all ${
                                    isPlaying
                                      ? 'border-brand-gold bg-brand-orange/25 text-brand-primary'
                                      : 'border-brand-primary text-white'
                                  }`}
                                  style={
                                    isPlaying
                                      ? undefined
                                      : {
                                          background:
                                            'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)',
                                        }
                                  }
                                >
                                  {isPlaying ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4 fill-current" />
                                  )}
                                  {isPlaying ? 'Hide player' : 'Listen'}
                                </button>
                              )}
                            </div>
                          </div>

                          {isPlaying && item.mediaUrl && (
                            <div className="mt-5 rounded-[14px] border border-brand-border bg-brand-bg p-4">
                              <audio
                                className="w-full"
                                src={item.mediaUrl}
                                controls
                                autoPlay
                                preload="metadata"
                                onEnded={() => setPlayingAudioId(null)}
                              >
                                Your browser does not support audio playback.
                              </audio>
                            </div>
                          )}

                          {!item.mediaUrl && (
                            <p className="mt-4 text-xs text-brand-textMuted">
                              Audio file not yet available.
                            </p>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {/* DISCLAIMER */}
        <div className="mt-10 flex items-start gap-3 rounded-[18px] border border-brand-border bg-white/90 p-4 text-[12px] leading-5 text-brand-textMuted shadow-[0_8px_24px_rgba(0,70,109,0.04)]">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
          <p>
            TruCity Guidance Hub provides general career, employment and
            workplace information. Content is intended for informational
            purposes and should not replace professional legal, financial or
            human resources advice where specialist assistance is required.
          </p>
        </div>
      </div>

      {/* GUIDE READER */}
      {selectedGuide && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-dark/60 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedGuide(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="guidance-reader-title"
            className="max-h-[85dvh] w-full max-w-[760px] overflow-y-auto rounded-[24px] border border-brand-border bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-accent">
                  {selectedGuide.category}
                </p>
                <h2
                  id="guidance-reader-title"
                  className="mt-2 text-2xl font-bold text-brand-primary"
                >
                  {selectedGuide.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                className="rounded-lg border border-brand-border px-3 py-2 text-sm font-bold text-brand-primary"
              >
                Close
              </button>
            </div>

            {selectedGuide.description && (
              <p className="mb-5 text-sm leading-6 text-brand-textMuted">
                {selectedGuide.description}
              </p>
            )}

            <div className="whitespace-pre-wrap break-words text-sm leading-7 text-brand-text">
              {selectedGuide.content ||
                'The full guide content has not been added yet.'}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function InfoPoint({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
      <span>{children}</span>
    </li>
  );
}

function ShareButton({
  shared,
  onClick,
}: {
  shared: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-[10px] border px-3 text-[12px] font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent/15 ${
        shared
          ? 'border-brand-emerald bg-brand-emerald/10 text-brand-primary'
          : 'border-brand-border bg-white text-brand-textMuted hover:border-brand-accent hover:text-brand-primary'
      }`}
    >
      {shared ? (
        <>
          <Check className="h-3.5 w-3.5 text-brand-emerald" />
          Shared
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" />
          Share
        </>
      )}
    </button>
  );
}

function HubTabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex min-h-[42px] shrink-0 items-center justify-center gap-2 rounded-[13px] px-4 py-2.5 text-[12px] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent/20 ${
        active
          ? 'text-white shadow-[0_7px_18px_rgba(0,70,109,0.15)]'
          : 'text-brand-textMuted hover:bg-brand-bg hover:text-brand-primary'
      }`}
      style={
        active
          ? {
              background:
                'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)',
            }
          : undefined
      }
    >
      {icon}
      {children}
    </button>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-accent">
        {eyebrow}
      </div>
      <h2 className="!m-0 mt-1 text-[24px] font-bold tracking-[-0.025em] !text-brand-primary sm:text-[28px]">
        {title}
      </h2>
      <p className="mt-2 max-w-[680px] text-[14px] leading-6 text-brand-textMuted">
        {description}
      </p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[22px] border border-brand-border bg-white p-8 text-center shadow-[0_12px_32px_rgba(0,70,109,0.04)]">
      <BookOpen className="mx-auto h-8 w-8 text-brand-accent" />
      <p className="mt-3 text-sm font-semibold text-brand-primary">
        Nothing to show yet
      </p>
      <p className="mt-1 text-sm text-brand-textMuted">{message}</p>
    </div>
  );
}
