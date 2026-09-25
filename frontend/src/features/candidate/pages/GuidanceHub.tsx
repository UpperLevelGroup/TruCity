import {
  useState,
  type ReactNode,
} from 'react';

import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Headphones,
  Heart,
  Info,
  Pause,
  Play,
  Scale,
  Share2,
  ShieldCheck,
  Sparkles,
  Video,
} from 'lucide-react';

/* =========================================================
   TYPES
========================================================= */

type HubTab =
  | 'videos'
  | 'guides'
  | 'audio';

interface GuideItem {
  id: number;
  title: string;
  category: string;
  readingTime: string;
  description: string;

  icon:
    | 'rights'
    | 'safety'
    | 'career'
    | 'cv';
}

interface VideoItem {
  id: number;
  title: string;
  category: string;
  duration: string;
  likes: number;
  description: string;
}

interface AudioItem {
  id: number;
  title: string;
  duration: string;
  speaker: string;
  category: string;
  description: string;
}

type ShareContentType =
  | 'guide'
  | 'video'
  | 'audio';

interface ShareItem {
  id: number;
  type: ShareContentType;
  title: string;
  description: string;
}

/* =========================================================
   GUIDES
========================================================= */

const GUIDES: GuideItem[] = [
  {
    id: 1,
    title:
      'Understanding Basic Employment Rights in South Africa',
    category:
      'Labour Rights',
    readingTime:
      '6 min read',
    description:
      'A practical overview of working hours, leave, salary deductions, notice periods and important workplace protections.',
    icon:
      'rights',
  },

  {
    id: 2,
    title:
      'How to Recognise Recruitment and Workplace Scams',
    category:
      'Safety',
    readingTime:
      '4 min read',
    description:
      'Learn how to identify suspicious job advertisements, payment requests, false recruiters and unsafe requests for personal information.',
    icon:
      'safety',
  },

  {
    id: 3,
    title:
      'Preparing for a Professional Interview',
    category:
      'Career Development',
    readingTime:
      '5 min read',
    description:
      'A practical checklist covering preparation, employer research, professional communication and answering common interview questions.',
    icon:
      'career',
  },

  {
    id: 4,
    title:
      'Building a Clear and Professional CV',
    category:
      'Career Development',
    readingTime:
      '5 min read',
    description:
      'Learn how to structure experience, skills and achievements so employers can understand your professional value quickly.',
    icon:
      'cv',
  },

  {
    id: 5,
    title:
      'Understanding Probation and Fixed-Term Contracts',
    category:
      'Employment Contracts',
    readingTime:
      '7 min read',
    description:
      'Understand what probation means, what should appear in a fixed-term agreement and what both employees and employers should consider.',
    icon:
      'rights',
  },

  {
    id: 6,
    title:
      'Creating a Respectful and Professional Workplace',
    category:
      'Workplace Guidance',
    readingTime:
      '5 min read',
    description:
      'Practical guidance for maintaining professional communication, setting expectations and managing workplace relationships.',
    icon:
      'career',
  },
];

/* =========================================================
   VIDEOS
========================================================= */

const VIDEOS: VideoItem[] = [
  {
    id: 1,
    title:
      '3 things you should never do in an interview',
    category:
      'Interview Tips',
    duration:
      '0:45',
    likes:
      142,
    description:
      'Quick mistakes to avoid before, during and immediately after a professional interview.',
  },

  {
    id: 2,
    title:
      'How to resign professionally without burning bridges',
    category:
      'Workplace Guidance',
    duration:
      '1:15',
    likes:
      89,
    description:
      'A short guide to notice periods, professional communication and maintaining positive working relationships.',
  },

  {
    id: 3,
    title:
      'How to spot a fake job opportunity',
    category:
      'Safety',
    duration:
      '0:58',
    likes:
      210,
    description:
      'Common warning signs that a vacancy, recruiter or interview request may not be legitimate.',
  },

  {
    id: 4,
    title:
      'How to discuss salary expectations professionally',
    category:
      'Career Guidance',
    duration:
      '1:02',
    likes:
      176,
    description:
      'A practical approach to discussing compensation clearly and professionally.',
  },
];

/* =========================================================
   AUDIO
========================================================= */

const AUDIO_ITEMS: AudioItem[] = [
  {
    id: 1,
    title:
      'South African Labour Law: The Basics Everyone Should Know',
    duration:
      '6 min',
    speaker:
      'TruCity Workplace Briefing',
    category:
      'Labour Rights',
    description:
      'A concise overview of contracts, working hours, deductions and important workplace protections.',
  },

  {
    id: 2,
    title:
      'Understanding Probation and Fixed-Term Contracts',
    duration:
      '5 min',
    speaker:
      'TruCity HR Insights',
    category:
      'Employment Contracts',
    description:
      'A practical explanation of probation periods, fixed-term agreements and professional expectations.',
  },

  {
    id: 3,
    title:
      'Professional Communication in the Workplace',
    duration:
      '5 min',
    speaker:
      'TruCity Workplace Series',
    category:
      'Professional Development',
    description:
      'Simple strategies for communicating clearly with colleagues, managers, employees and professional teams.',
  },
];

/* =========================================================
   GUIDE ICON
========================================================= */

function GuideIcon({
  type,
}: {
  type: GuideItem['icon'];
}) {
  const className =
    'h-5 w-5';

  switch (type) {
    case 'rights':
      return (
        <Scale
          className={className}
        />
      );

    case 'safety':
      return (
        <ShieldCheck
          className={className}
        />
      );

    case 'career':
      return (
        <BriefcaseBusiness
          className={className}
        />
      );

    case 'cv':
      return (
        <FileText
          className={className}
        />
      );

    default:
      return (
        <BookOpen
          className={className}
        />
      );
  }
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function GuidanceHub() {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<HubTab>(
      'videos',
    );

  const [
    likedVideos,
    setLikedVideos,
  ] =
    useState<number[]>(
      [],
    );

  const [
    playingAudioId,
    setPlayingAudioId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    sharedItemKey,
    setSharedItemKey,
  ] =
    useState<string | null>(
      null,
    );

  /* =======================================================
     VIDEO LIKES
  ======================================================= */

  const toggleVideoLike = (
    id: number,
  ) => {
    setLikedVideos(
      (current) =>
        current.includes(id)
          ? current.filter(
              (videoId) =>
                videoId !== id,
            )
          : [
              ...current,
              id,
            ],
    );
  };

  /* =======================================================
     SHARE CONTENT
  ======================================================= */

  const handleShare = async (
    item: ShareItem,
  ) => {
    const key =
      `${item.type}-${item.id}`;

    const currentUrl =
      typeof window !==
      'undefined'
        ? window.location.href
        : '';

    const shareText =
      `${item.title}\n\n${item.description}\n\nShared from TruCity Guidance Hub`;

    const markAsShared =
      () => {
        setSharedItemKey(
          key,
        );

        window.setTimeout(
          () =>
            setSharedItemKey(
              null,
            ),
          2200,
        );
      };

    try {
      if (
        typeof navigator !==
          'undefined' &&
        typeof navigator.share ===
          'function'
      ) {
        await navigator.share({
          title:
            item.title,

          text:
            item.description,

          url:
            currentUrl,
        });

        markAsShared();

        return;
      }

      if (
        typeof navigator !==
          'undefined' &&
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(
          `${shareText}${
            currentUrl
              ? `\n\n${currentUrl}`
              : ''
          }`,
        );

        markAsShared();

        return;
      }

      throw new Error(
        'Sharing is not supported by this browser.',
      );
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name ===
          'AbortError'
      ) {
        return;
      }

      console.error(
        'Unable to share content:',
        error,
      );
    }
  };

  return (
    <div
      className="
        relative
        min-h-[100dvh]
        overflow-x-hidden
        bg-transparent
        pb-16
        font-sans
        text-brand-text
      "
    >
      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1180px]
          px-4
          py-8

          sm:px-6
          lg:px-8
        "
      >
        {/* =================================================
            HERO
        ================================================== */}

        <section
          className="
            mb-8
            overflow-hidden
            rounded-[28px]
            border
            border-brand-border
            bg-white/95
            shadow-[0_18px_50px_rgba(0,70,109,0.08)]
            backdrop-blur-sm
          "
        >
          <div
            className="
              grid
              gap-6
              p-6

              sm:p-8

              lg:grid-cols-[1fr_320px]
              lg:items-center
            "
          >
            <div>
              <div
                className="
                  mb-3
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-brand-accent/30
                  bg-brand-accent/10
                  px-3
                  py-1.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-brand-primary
                "
              >
                <Sparkles className="h-3.5 w-3.5" />

                TruCity Resource Centre
              </div>

              <h1
                className="
                  !m-0
                  max-w-[720px]
                  text-[32px]
                  font-bold
                  leading-[1.1]
                  tracking-[-0.035em]
                  !text-brand-primary

                  sm:text-[40px]
                  lg:text-[44px]
                "
              >
                Practical guidance for the world of{' '}

                <span className="text-brand-gold">
                  work.
                </span>
              </h1>

              <p
                className="
                  mt-4
                  max-w-[700px]
                  text-[16px]
                  font-normal
                  leading-7
                  text-brand-textMuted
                "
              >
                Explore practical information on careers,
                workplace rights, employment, professional
                development and safer recruitment practices.
                The Guidance Hub is designed for everyone
                navigating the workplace.
              </p>
            </div>

            <div
              className="
                rounded-[22px]
                border
                border-brand-border
                bg-brand-bg
                p-5
              "
            >
              <div
                className="
                  mb-4
                  flex
                  items-center
                  gap-2
                  text-[14px]
                  font-bold
                  text-brand-primary
                "
              >
                <Info
                  className="
                    h-4
                    w-4
                    text-brand-accent
                  "
                />

                Stay informed
              </div>

              <ul
                className="
                  space-y-3
                  text-[12px]
                  leading-5
                  text-brand-textMuted
                "
              >
                <InfoPoint>
                  Understand important workplace rights and
                  responsibilities.
                </InfoPoint>

                <InfoPoint>
                  Recognise potentially unsafe or fraudulent
                  recruitment practices.
                </InfoPoint>

                <InfoPoint>
                  Build stronger professional communication,
                  career and workplace skills.
                </InfoPoint>
              </ul>
            </div>
          </div>
        </section>

        {/* =================================================
            NAVIGATION
        ================================================== */}

        <div
          className="
            sticky
            top-[104px]
            z-30
            mb-7
            rounded-[20px]
            border
            border-brand-border
            bg-white/95
            p-2
            shadow-[0_12px_34px_rgba(0,70,109,0.08)]
            backdrop-blur-xl
          "
        >
          <div
            className="
              flex
              gap-2
              overflow-x-auto
            "
            role="tablist"
            aria-label="Guidance Hub sections"
          >
            <HubTabButton
              active={
                activeTab ===
                'videos'
              }
              onClick={() =>
                setActiveTab(
                  'videos',
                )
              }
              icon={
                <Video className="h-4 w-4" />
              }
            >
              Quick Videos
            </HubTabButton>

            <HubTabButton
              active={
                activeTab ===
                'guides'
              }
              onClick={() =>
                setActiveTab(
                  'guides',
                )
              }
              icon={
                <BookOpen className="h-4 w-4" />
              }
            >
              Guides
            </HubTabButton>

            <HubTabButton
              active={
                activeTab ===
                'audio'
              }
              onClick={() =>
                setActiveTab(
                  'audio',
                )
              }
              icon={
                <Headphones className="h-4 w-4" />
              }
            >
              Audio Briefings
            </HubTabButton>
          </div>
        </div>

        {/* =================================================
            QUICK VIDEOS
        ================================================== */}

        {activeTab ===
          'videos' && (
          <section>
            <SectionHeading
              eyebrow="Quick Learning"
              title="Short workplace videos"
              description="Short-form guidance covering careers, recruitment, professional communication and workplace situations."
            />

            <div
              className="
                grid
                gap-4
                md:grid-cols-2
              "
            >
              {VIDEOS.map(
                (video) => {
                  const isLiked =
                    likedVideos.includes(
                      video.id,
                    );

                  const isShared =
                    sharedItemKey ===
                    `video-${video.id}`;

                  return (
                    <article
                      key={
                        video.id
                      }
                      className="
                        overflow-hidden
                        rounded-[22px]
                        border
                        border-brand-border
                        bg-white
                        shadow-[0_12px_32px_rgba(0,70,109,0.06)]
                      "
                    >
                      {/* VIDEO PREVIEW */}

                      <div
                        className="
                          relative
                          flex
                          min-h-[180px]
                          items-center
                          justify-center
                          overflow-hidden
                          bg-brand-primary
                        "
                      >
                        <div
                          aria-hidden="true"
                          className="
                            absolute
                            -right-10
                            -top-12
                            h-36
                            w-36
                            rounded-full
                            border-[24px]
                            border-brand-accent/30
                          "
                        />

                        <button
                          type="button"
                          aria-label={`Play ${video.title}`}
                          className="
                            relative
                            z-10
                            grid
                            h-14
                            w-14
                            place-items-center
                            rounded-full
                            border
                            border-white/50
                            bg-white
                            text-brand-primary
                            shadow-[0_10px_24px_rgba(0,39,61,0.18)]
                            transition-all
                            duration-200

                            hover:scale-105
                            hover:text-brand-accent

                            focus-visible:outline-none
                            focus-visible:ring-4
                            focus-visible:ring-brand-accent/30
                          "
                        >
                          <Play
                            className="
                              ml-0.5
                              h-5
                              w-5
                              fill-current
                            "
                          />
                        </button>

                        <span
                          className="
                            absolute
                            bottom-4
                            right-4
                            rounded-full
                            bg-brand-dark/80
                            px-2.5
                            py-1
                            text-[10px]
                            font-bold
                            text-white
                            backdrop-blur-md
                          "
                        >
                          {
                            video.duration
                          }
                        </span>
                      </div>

                      {/* VIDEO DETAILS */}

                      <div className="p-5">
                        <div
                          className="
                            mb-2
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.14em]
                            text-brand-accent
                          "
                        >
                          {
                            video.category
                          }
                        </div>

                        <h3
                          className="
                            !m-0
                            text-[18px]
                            font-bold
                            leading-6
                            !text-brand-primary
                          "
                        >
                          {
                            video.title
                          }
                        </h3>

                        <p
                          className="
                            mt-2
                            text-[14px]
                            font-normal
                            leading-6
                            text-brand-textMuted
                          "
                        >
                          {
                            video.description
                          }
                        </p>

                        <div
                          className="
                            mt-5
                            flex
                            flex-wrap
                            items-center
                            gap-3
                            border-t
                            border-brand-border
                            pt-4
                          "
                        >
                          <button
                            type="button"
                            aria-pressed={
                              isLiked
                            }
                            onClick={() =>
                              toggleVideoLike(
                                video.id,
                              )
                            }
                            className={`
                              inline-flex
                              min-h-[36px]
                              items-center
                              gap-2
                              rounded-[10px]
                              px-2
                              text-[12px]
                              font-bold
                              transition-colors

                              ${
                                isLiked
                                  ? 'text-brand-crimson'
                                  : 'text-brand-textMuted hover:text-brand-primary'
                              }

                              focus-visible:outline-none
                              focus-visible:ring-4
                              focus-visible:ring-brand-accent/15
                            `}
                          >
                            <Heart
                              className={`
                                h-4
                                w-4

                                ${
                                  isLiked
                                    ? 'fill-current'
                                    : ''
                                }
                              `}
                            />

                            {video.likes +
                              (
                                isLiked
                                  ? 1
                                  : 0
                              )}
                          </button>

                          <ShareButton
                            shared={
                              isShared
                            }
                            onClick={() =>
                              handleShare({
                                id:
                                  video.id,

                                type:
                                  'video',

                                title:
                                  video.title,

                                description:
                                  video.description,
                              })
                            }
                          />

                          <span
                            className="
                              ml-auto
                              inline-flex
                              items-center
                              gap-1.5
                              text-[11px]
                              font-semibold
                              text-brand-textMuted
                            "
                          >
                            <Video className="h-3.5 w-3.5" />

                            TruCity Guidance
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          </section>
        )}

        {/* =================================================
            GUIDES
        ================================================== */}

        {activeTab ===
          'guides' && (
          <section>
            <SectionHeading
              eyebrow="Guidance Library"
              title="Useful workplace resources"
              description="Practical information for job seekers, employees, professionals and employers."
            />

            <div
              className="
                grid
                gap-4
                md:grid-cols-2
              "
            >
              {GUIDES.map(
                (guide) => {
                  const isShared =
                    sharedItemKey ===
                    `guide-${guide.id}`;

                  return (
                    <article
                      key={
                        guide.id
                      }
                      className="
                        group
                        rounded-[22px]
                        border
                        border-brand-border
                        bg-white/95
                        p-5
                        shadow-[0_12px_32px_rgba(0,70,109,0.06)]
                        transition-all
                        duration-200

                        hover:-translate-y-0.5
                        hover:border-brand-accent/40
                        hover:shadow-[0_18px_42px_rgba(0,70,109,0.10)]
                      "
                    >
                      <div
                        className="
                          mb-5
                          flex
                          items-start
                          justify-between
                          gap-4
                        "
                      >
                        <div
                          className="
                            grid
                            h-12
                            w-12
                            place-items-center
                            rounded-[15px]
                            bg-brand-accent/10
                            text-brand-primary
                          "
                        >
                          <GuideIcon
                            type={
                              guide.icon
                            }
                          />
                        </div>

                        <span
                          className="
                            rounded-full
                            border
                            border-brand-border
                            bg-brand-bg
                            px-3
                            py-1
                            text-[10px]
                            font-bold
                            text-brand-textMuted
                          "
                        >
                          {
                            guide.readingTime
                          }
                        </span>
                      </div>

                      <div
                        className="
                          mb-2
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-[0.15em]
                          text-brand-accent
                        "
                      >
                        {
                          guide.category
                        }
                      </div>

                      <h3
                        className="
                          !m-0
                          text-[18px]
                          font-bold
                          leading-6
                          !text-brand-primary
                        "
                      >
                        {
                          guide.title
                        }
                      </h3>

                      <p
                        className="
                          mt-2
                          text-[14px]
                          font-normal
                          leading-6
                          text-brand-textMuted
                        "
                      >
                        {
                          guide.description
                        }
                      </p>

                      <div
                        className="
                          mt-5
                          flex
                          flex-wrap
                          items-center
                          gap-3
                        "
                      >
                        <button
                          type="button"
                          className="
                            inline-flex
                            min-h-[36px]
                            items-center
                            gap-2
                            rounded-[10px]
                            px-1
                            text-[12px]
                            font-bold
                            text-brand-primary
                            transition-colors

                            hover:text-brand-accent

                            focus-visible:outline-none
                            focus-visible:ring-4
                            focus-visible:ring-brand-accent/15
                          "
                        >
                          Read guide

                          <ArrowRight
                            className="
                              h-4
                              w-4
                              transition-transform
                              duration-200

                              group-hover:translate-x-0.5
                            "
                          />
                        </button>

                        <ShareButton
                          shared={
                            isShared
                          }
                          onClick={() =>
                            handleShare({
                              id:
                                guide.id,

                              type:
                                'guide',

                              title:
                                guide.title,

                              description:
                                guide.description,
                            })
                          }
                        />
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          </section>
        )}

        {/* =================================================
            AUDIO
        ================================================== */}

        {activeTab ===
          'audio' && (
          <section>
            <SectionHeading
              eyebrow="Audio Briefings"
              title="Listen and learn"
              description="Short professional briefings covering workplace issues, employment and professional development."
            />

            <div className="space-y-4">
              {AUDIO_ITEMS.map(
                (audio) => {
                  const isPlaying =
                    playingAudioId ===
                    audio.id;

                  const isShared =
                    sharedItemKey ===
                    `audio-${audio.id}`;

                  return (
                    <article
                      key={
                        audio.id
                      }
                      className="
                        rounded-[22px]
                        border
                        border-brand-border
                        bg-white/95
                        p-5
                        shadow-[0_12px_32px_rgba(0,70,109,0.06)]

                        sm:p-6
                      "
                    >
                      <div
                        className="
                          flex
                          flex-col
                          gap-5

                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                        "
                      >
                        <div
                          className="
                            flex
                            min-w-0
                            gap-4
                          "
                        >
                          <div
                            className="
                              grid
                              h-12
                              w-12
                              shrink-0
                              place-items-center
                              rounded-[15px]
                              border
                              border-brand-gold/40
                              bg-brand-orange/25
                              text-brand-primary
                            "
                          >
                            <Headphones className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <div
                              className="
                                mb-1.5
                                flex
                                flex-wrap
                                items-center
                                gap-2
                              "
                            >
                              <span
                                className="
                                  text-[10px]
                                  font-bold
                                  uppercase
                                  tracking-[0.14em]
                                  text-brand-primary
                                "
                              >
                                {
                                  audio.category
                                }
                              </span>

                              <span
                                className="
                                  inline-flex
                                  items-center
                                  gap-1
                                  text-[10px]
                                  font-bold
                                  text-brand-textMuted
                                "
                              >
                                <Clock3 className="h-3 w-3" />

                                {
                                  audio.duration
                                }
                              </span>
                            </div>

                            <h3
                              className="
                                !m-0
                                text-[18px]
                                font-bold
                                leading-6
                                !text-brand-primary
                              "
                            >
                              {
                                audio.title
                              }
                            </h3>

                            <p
                              className="
                                mt-1
                                text-[12px]
                                font-semibold
                                text-brand-accent
                              "
                            >
                              {
                                audio.speaker
                              }
                            </p>

                            <p
                              className="
                                mt-2
                                max-w-[700px]
                                text-[14px]
                                font-normal
                                leading-6
                                text-brand-textMuted
                              "
                            >
                              {
                                audio.description
                              }
                            </p>
                          </div>
                        </div>

                        <div
                          className="
                            flex
                            shrink-0
                            flex-wrap
                            items-center
                            gap-2
                          "
                        >
                          <ShareButton
                            shared={
                              isShared
                            }
                            onClick={() =>
                              handleShare({
                                id:
                                  audio.id,

                                type:
                                  'audio',

                                title:
                                  audio.title,

                                description:
                                  audio.description,
                              })
                            }
                          />

                          <button
                            type="button"
                            aria-pressed={
                              isPlaying
                            }
                            onClick={() =>
                              setPlayingAudioId(
                                isPlaying
                                  ? null
                                  : audio.id,
                              )
                            }
                            className={`
                              inline-flex
                              min-h-[44px]
                              shrink-0
                              items-center
                              justify-center
                              gap-2
                              rounded-[13px]
                              border
                              px-4
                              text-[12px]
                              font-bold
                              transition-all
                              duration-200

                              ${
                                isPlaying
                                  ? `
                                    border-brand-gold
                                    bg-brand-orange/25
                                    text-brand-primary
                                  `
                                  : `
                                    border-brand-primary
                                    text-white
                                    shadow-[0_8px_18px_rgba(0,70,109,0.14)]

                                    hover:-translate-y-0.5
                                  `
                              }

                              focus-visible:outline-none
                              focus-visible:ring-4
                              focus-visible:ring-brand-accent/20
                            `}
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
                              <Pause className="h-4 w-4 fill-current" />
                            ) : (
                              <Play className="h-4 w-4 fill-current" />
                            )}

                            {isPlaying
                              ? 'Pause'
                              : 'Listen'}
                          </button>
                        </div>
                      </div>

                      {isPlaying && (
                        <div
                          className="
                            mt-5
                            rounded-[14px]
                            border
                            border-brand-border
                            bg-brand-bg
                            p-4
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              gap-3
                            "
                          >
                            <span
                              className="
                                text-[10px]
                                font-bold
                                text-brand-textMuted
                              "
                            >
                              0:18
                            </span>

                            <div
                              className="
                                h-1.5
                                flex-1
                                overflow-hidden
                                rounded-full
                                bg-brand-border
                              "
                            >
                              <div
                                className="
                                  h-full
                                  w-[22%]
                                  rounded-full
                                  bg-brand-accent
                                "
                              />
                            </div>

                            <span
                              className="
                                text-[10px]
                                font-bold
                                text-brand-textMuted
                              "
                            >
                              {
                                audio.duration
                              }
                            </span>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                },
              )}
            </div>
          </section>
        )}

        {/* =================================================
            DISCLAIMER
        ================================================== */}

        <div
          className="
            mt-10
            flex
            items-start
            gap-3
            rounded-[18px]
            border
            border-brand-border
            bg-white/90
            p-4
            text-[12px]
            leading-5
            text-brand-textMuted
            shadow-[0_8px_24px_rgba(0,70,109,0.04)]
          "
        >
          <ShieldCheck
            className="
              mt-0.5
              h-4
              w-4
              shrink-0
              text-brand-primary
            "
          />

          <p>
            TruCity Guidance Hub provides general career,
            employment and workplace information. Content is
            intended for informational purposes and should not
            replace professional legal, financial or human
            resources advice where specialist assistance is
            required.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INFO POINT
========================================================= */

function InfoPoint({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <li
      className="
        flex
        gap-2
      "
    >
      <CheckCircle2
        className="
          mt-0.5
          h-4
          w-4
          shrink-0
          text-brand-accent
        "
      />

      <span>
        {children}
      </span>
    </li>
  );
}

/* =========================================================
   SHARE BUTTON
========================================================= */

interface ShareButtonProps {
  shared: boolean;
  onClick: () => void;
}

function ShareButton({
  shared,
  onClick,
}: ShareButtonProps) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        inline-flex
        min-h-[36px]
        items-center
        justify-center
        gap-1.5
        rounded-[10px]
        border
        px-3
        text-[12px]
        font-bold
        transition-all
        duration-200

        ${
          shared
            ? `
              border-brand-emerald
              bg-brand-emerald/10
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
        focus-visible:ring-brand-accent/15
      `}
    >
      {shared ? (
        <>
          <Check
            className="
              h-3.5
              w-3.5
              text-brand-emerald
            "
          />

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

/* =========================================================
   TAB BUTTON
========================================================= */

interface HubTabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}

function HubTabButton({
  active,
  onClick,
  icon,
  children,
}: HubTabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={
        active
      }
      onClick={
        onClick
      }
      className={`
        inline-flex
        min-h-[42px]
        shrink-0
        items-center
        justify-center
        gap-2
        rounded-[13px]
        px-4
        py-2.5
        text-[12px]
        font-bold
        transition-all
        duration-200

        ${
          active
            ? `
              text-white
              shadow-[0_7px_18px_rgba(0,70,109,0.15)]
            `
            : `
              text-brand-textMuted

              hover:bg-brand-bg
              hover:text-brand-primary
            `
        }

        focus-visible:outline-none
        focus-visible:ring-4
        focus-visible:ring-brand-accent/20
      `}
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

/* =========================================================
   SECTION HEADING
========================================================= */

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="mb-5">
      <div
        className="
          text-[10px]
          font-bold
          uppercase
          tracking-[0.16em]
          text-brand-accent
        "
      >
        {eyebrow}
      </div>

      <h2
        className="
          !m-0
          mt-1
          text-[24px]
          font-bold
          tracking-[-0.025em]
          !text-brand-primary

          sm:text-[28px]
        "
      >
        {title}
      </h2>

      <p
        className="
          mt-2
          max-w-[680px]
          text-[14px]
          font-normal
          leading-6
          text-brand-textMuted
        "
      >
        {description}
      </p>
    </div>
  );
}