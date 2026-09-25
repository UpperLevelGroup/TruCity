import { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';

import {
  NavLink,
  Link,
} from 'react-router-dom';

import {
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  GraduationCap,
  Lightbulb,
  Lock,
  RotateCcw,
  Sparkles,
  UserRound,
  Wrench,
} from 'lucide-react';

/* =========================================================
   TYPES
========================================================= */

type QuestionKey =
  | 'summary'
  | 'lastJob'
  | 'skills'
  | 'education';

type Question = {
  key: QuestionKey;
  q: string;
  ph: string;
  hint: string;
};

type Answers = Record<QuestionKey, string>;

interface PublicNavLinkProps {
  to: string;
  label: string;
  end?: boolean;
}

/* =========================================================
   QUESTIONS
========================================================= */

const QUESTIONS: Question[] = [
  {
    key: 'summary',
    q: 'How would you describe yourself professionally?',
    ph:
      'Example: Full-stack developer with 4 years of experience building scalable web applications for financial services and retail businesses...',
    hint:
      'Write 2–4 sentences summarising your experience, professional strengths and the type of work you specialise in.',
  },
  {
    key: 'lastJob',
    q: 'Tell us about your most recent work experience.',
    ph:
      'Example:\nSenior Full-Stack Developer — Apex Tech Solutions\n2022 – Present\nBuilt customer-facing web applications, improved API performance and worked with cross-functional product teams.',
    hint:
      'Include your job title, employer, approximate dates and a short description of your main responsibilities or achievements.',
  },
  {
    key: 'skills',
    q: 'What are your strongest skills and competencies?',
    ph:
      'Example: TypeScript, React, Node.js, PostgreSQL, REST APIs, Git, Agile delivery, stakeholder communication',
    hint:
      'Include technical, professional, trade or transferable skills that are relevant to the work you want to do.',
  },
  {
    key: 'education',
    q: 'What is your highest relevant qualification?',
    ph:
      'Example:\nDiploma in Information Technology\nBelgium Campus\nCompleted 2024',
    hint:
      'Include your qualification, institution and completion year. You can also include relevant certifications.',
  },
];

const STEP_LABELS = [
  'Profile',
  'Experience',
  'Skills',
  'Education',
];

/* =========================================================
   CV BUILDER
========================================================= */

export default function CVBuilder() {
  const [step, setStep] = useState(0);

  const [answers, setAnswers] =
    useState<Answers>({
      summary: '',
      lastJob: '',
      skills: '',
      education: '',
    });

  const [generated, setGenerated] =
    useState(false);

  const [isDownloading, setIsDownloading] =
    useState(false);

  const cvRef =
    useRef<HTMLDivElement>(null);

  const current = QUESTIONS[step];

  const currentAnswer =
    answers[current.key];

  const progressPercent =
    Math.round(
      ((step + 1) / QUESTIONS.length) * 100,
    );

  /* =========================================================
     INPUT
  ========================================================= */

  const updateAnswer = (
    value: string,
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [current.key]: value,
    }));
  };

  /* =========================================================
     DOWNLOAD CV ONLY
  ========================================================= */

  const handleDownloadPDF = async () => {
    const cvElement =
      cvRef.current;

    if (
      !cvElement ||
      isDownloading
    ) {
      return;
    }

    setIsDownloading(true);

    try {
      const pdfOptions = {
        margin: 0,

        filename:
          'TruCity_Professional_CV.pdf',

        image: {
          type: 'jpeg',
          quality: 1,
        },

        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor:
            '#ffffff',
          windowWidth: 1200,
        },

        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        },

        pagebreak: {
          mode: [
            'css',
            'legacy',
          ],
        },
      } as any;

      await html2pdf()
        .set(pdfOptions)
        .from(cvElement)
        .save();
    } catch (error) {
      console.error(
        'CV PDF generation failed:',
        error,
      );

      window.alert(
        'Your CV could not be downloaded. Please try again.',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleNext = () => {
    if (!currentAnswer.trim()) {
      return;
    }

    if (
      step <
      QUESTIONS.length - 1
    ) {
      setStep(
        (previous) =>
          previous + 1,
      );

      return;
    }

    setGenerated(true);
  };

  const handlePrevious = () => {
    if (step > 0) {
      setStep(
        (previous) =>
          previous - 1,
      );
    }
  };

  const handleReset = () => {
    setStep(0);
    setGenerated(false);
    setIsDownloading(false);
  };

  /* =========================================================
     STEP ICON
  ========================================================= */

  const StepIcon =
    step === 0
      ? UserRound
      : step === 1
        ? BriefcaseBusiness
        : step === 2
          ? Wrench
          : GraduationCap;

  return (
    <div
      className="
        relative
        min-h-screen
        min-h-[100dvh]
        overflow-x-hidden
        bg-transparent
        font-sans
        text-brand-text
      "
    >
      {/* =====================================================
          ROLECHOICE NAVBAR
      ====================================================== */}

      <header
        className="
          fixed
          inset-x-0
          top-0
          z-50
          overflow-visible
          border-b
          border-brand-border
          bg-brand-bg/95
          shadow-[0_4px_18px_rgba(0,70,109,0.04)]
          backdrop-blur-md
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[88px]
            w-full
            max-w-[1480px]
            items-center
            justify-between
            gap-6
            overflow-visible
            px-5
            sm:px-8
            lg:px-10
          "
        >
          {/* LOGO */}

          <Link
            to="/"
            aria-label="TruCity home"
            className="
              relative
              flex
              h-[88px]
              w-[150px]
              shrink-0
              items-center
              overflow-visible
              no-underline
              sm:w-[170px]
              lg:w-[195px]
            "
          >
            <img
              src="/public/trucity-nav-logo.png"
              alt="TruCity"
              draggable={false}
              className="
                absolute
                left-[-22px]
                top-1/2
                block
                h-auto
                w-[145px]
                max-w-none
                -translate-y-1/2
                select-none
                object-contain
                sm:left-[-26px]
                sm:w-[165px]
                lg:left-[-30px]
                lg:w-[190px]
              "
            />
          </Link>

          {/* DESKTOP NAV */}

          <nav
            aria-label="Public navigation"
            className="
              hidden
              items-center
              gap-9
              lg:flex
            "
          >
            <PublicNavLink
              to="/"
              label="Home"
              end
            />

            <PublicNavLink
              to="/guidance"
              label="Guidance Hub"
            />

            <PublicNavLink
              to="/about"
              label="About"
            />

            <PublicNavLink
              to="/contact"
              label="Contact"
            />
          </nav>

          {/* SIGN IN */}

          <Link
            to="/login"
            className="
              inline-flex
              min-h-[46px]
              shrink-0
              items-center
              justify-center
              rounded-[14px]
              border
              border-brand-primary
              bg-brand-bg
              px-5
              text-[14px]
              font-bold
              text-brand-primary
              no-underline
              transition-all
              duration-200

              hover:bg-brand-primary
              hover:text-white

              focus-visible:outline-none
              focus-visible:ring-4
              focus-visible:ring-brand-accent/25

              sm:px-6
            "
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* =====================================================
          BRAND DECORATIONS
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          inset-0
          z-[3]
          overflow-hidden
        "
      >
        {/* TOP-RIGHT ORANGE RING */}

        <div
          className="
            absolute
            -right-[175px]
            top-[-175px]
            hidden
            h-[500px]
            w-[500px]
            rounded-full
            lg:block
          "
          style={{
            background:
              'linear-gradient(135deg, #FFAD01 0%, #FFD784 100%)',
          }}
        >
          <div
            className="
              absolute
              left-1/2
              top-1/2
              h-[70%]
              w-[70%]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-brand-bg
            "
          />
        </div>

        {/* BOTTOM-LEFT BLUE CIRCLE */}

        <div
          className="
            absolute
            -bottom-[260px]
            -left-[210px]
            hidden
            h-[500px]
            w-[500px]
            rounded-full
            lg:block
          "
          style={{
            background:
              'linear-gradient(145deg, #00466D 0%, #00466D 58%, #1E92D2 100%)',
          }}
        />

        {/* GOLD OUTLINE */}

        <div
          className="
            absolute
            -bottom-[305px]
            -left-[255px]
            hidden
            h-[590px]
            w-[590px]
            rounded-full
            border-[3px]
            border-brand-gold
            lg:block
          "
        />
      </div>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main
        className="
          relative
          z-10
          mx-auto
          min-h-[100dvh]
          w-full
          max-w-[1180px]
          bg-transparent
          px-4
          pb-10
          pt-[122px]

          sm:px-8
          sm:pb-12
          sm:pt-[132px]
        "
      >
        {/* =================================================
            HEADER
        ================================================== */}

        <div
          className="
            mb-8
            flex
            flex-col
            justify-between
            gap-5

            md:flex-row
            md:items-end
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
                border-brand-border
                bg-white/90
                px-3.5
                py-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-brand-primary
                shadow-sm
                backdrop-blur-sm
              "
            >
              <Sparkles
                className="
                  h-3.5
                  w-3.5
                  text-brand-gold
                "
              />

              Career Tools
            </div>

            <h1
              className="
                !m-0
                text-[32px]
                font-bold
                tracking-[-0.035em]
                !text-brand-primary

                sm:text-[40px]
                lg:text-[44px]
              "
            >
              Professional{' '}
              <span className="text-brand-gold">
                CV Builder
              </span>
            </h1>

            <p
              className="
                mt-3
                max-w-[650px]
                text-[14px]
                leading-6
                text-brand-textMuted

                sm:text-[15px]
              "
            >
              Create a clean, structured CV that
              presents your professional profile,
              work experience, skills and
              qualifications clearly to employers.
            </p>
          </div>

          {!generated && (
            <div
              className="
                inline-flex
                self-start
                items-center
                gap-2
                rounded-full
                border
                border-brand-gold/35
                bg-brand-gold/10
                px-4
                py-2
                text-[12px]
                font-bold
                text-brand-dark

                md:self-auto
              "
            >
              {progressPercent}% complete
            </div>
          )}
        </div>

        {!generated ? (
          /* =================================================
             BUILDER
          ================================================== */

          <div
            className="
              grid
              gap-6

              lg:grid-cols-[minmax(0,1fr)_310px]
            "
          >
            {/* =================================================
                FORM
            ================================================== */}

            <section
              className="
                rounded-[28px]
                border
                border-brand-border
                bg-white/95
                p-5
                shadow-[0_20px_50px_rgba(0,70,109,0.09)]
                backdrop-blur-xl

                sm:p-7
              "
            >
              {/* PROGRESS */}

              <div className="mb-8">
                <div
                  className="
                    mb-5
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.16em]
                        text-brand-accent
                      "
                    >
                      CV Information
                    </p>

                    <p
                      className="
                        mt-1
                        text-[14px]
                        font-bold
                        text-brand-primary
                      "
                    >
                      Step {step + 1} of{' '}
                      {QUESTIONS.length}
                    </p>
                  </div>

                  <div
                    className="
                      rounded-full
                      border
                      border-brand-accent/30
                      bg-brand-accent/10
                      px-3.5
                      py-1.5
                      text-[12px]
                      font-bold
                      text-brand-primary
                    "
                  >
                    {progressPercent}%
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {QUESTIONS.map(
                    (
                      question,
                      index,
                    ) => {
                      const completed =
                        index < step;

                      const active =
                        index === step;

                      return (
                        <div
                          key={question.key}
                          className="
                            flex
                            flex-1
                            items-center
                            gap-2
                          "
                        >
                          <div
                            className={`
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              text-[12px]
                              font-bold
                              transition-all

                              ${
                                completed
                                  ? `
                                    bg-brand-primary
                                    text-white
                                  `
                                  : active
                                    ? `
                                      border-2
                                      border-brand-accent
                                      bg-brand-accent/10
                                      text-brand-primary
                                    `
                                    : `
                                      border
                                      border-brand-border
                                      bg-brand-surface
                                      text-brand-textMuted
                                    `
                              }
                            `}
                          >
                            {completed ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              index + 1
                            )}
                          </div>

                          <div className="hidden min-[560px]:block">
                            <p
                              className={`
                                text-[10px]
                                font-bold

                                ${
                                  active
                                    ? 'text-brand-primary'
                                    : 'text-brand-textMuted'
                                }
                              `}
                            >
                              {
                                STEP_LABELS[
                                  index
                                ]
                              }
                            </p>
                          </div>

                          {index <
                            QUESTIONS.length -
                              1 && (
                            <div
                              className={`
                                h-px
                                flex-1

                                ${
                                  completed
                                    ? 'bg-brand-accent'
                                    : 'bg-brand-border'
                                }
                              `}
                            />
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              {/* QUESTION */}

              <div className="mb-7">
                <div
                  className="
                    mb-5
                    flex
                    items-start
                    gap-4
                  "
                >
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-[16px]
                      border
                      border-brand-accent/30
                      bg-brand-accent/10
                      text-brand-primary
                    "
                  >
                    <StepIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <p
                      className="
                        mb-1
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.15em]
                        text-brand-accent
                      "
                    >
                      {
                        STEP_LABELS[
                          step
                        ]
                      }
                    </p>

                    <h2
                      className="
                        !m-0
                        text-[20px]
                        font-bold
                        leading-7
                        !text-brand-primary

                        sm:text-[22px]
                      "
                    >
                      {current.q}
                    </h2>
                  </div>
                </div>

                {/* HINT */}

                <div
                  className="
                    mb-4
                    rounded-[14px]
                    border
                    border-brand-border
                    bg-brand-surface
                    px-4
                    py-3
                  "
                >
                  <div className="flex items-start gap-2.5">
                    <Lightbulb
                      className="
                        mt-0.5
                        h-4
                        w-4
                        shrink-0
                        text-brand-gold
                      "
                    />

                    <p
                      className="
                        text-[12px]
                        leading-5
                        text-brand-textMuted
                      "
                    >
                      {current.hint}
                    </p>
                  </div>
                </div>

                <textarea
                  value={currentAnswer}
                  onChange={(event) =>
                    updateAnswer(
                      event.target.value,
                    )
                  }
                  placeholder={current.ph}
                  className="
                    min-h-[190px]
                    w-full
                    resize-none
                    rounded-[18px]
                    border
                    border-brand-border
                    bg-white
                    p-4
                    text-[14px]
                    font-normal
                    leading-6
                    text-brand-dark
                    outline-none
                    transition

                    placeholder:text-brand-textMuted/60

                    focus:border-brand-accent
                    focus:ring-4
                    focus:ring-brand-accent/15
                  "
                />

                <div
                  className="
                    mt-2
                    flex
                    flex-col
                    justify-between
                    gap-1
                    text-[10px]
                    text-brand-textMuted

                    sm:flex-row
                  "
                >
                  <span>
                    Enter accurate, professional
                    information.
                  </span>

                  <span>
                    {currentAnswer.length}{' '}
                    characters
                  </span>
                </div>
              </div>

              {/* ACTIONS */}

              <div
                className="
                  flex
                  flex-col-reverse
                  gap-3
                  border-t
                  border-brand-border
                  pt-5

                  sm:flex-row
                "
              >
                {step > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="
                      inline-flex
                      min-h-[50px]
                      items-center
                      justify-center
                      gap-2
                      rounded-[14px]
                      border
                      border-brand-border
                      bg-white
                      px-5
                      text-[12px]
                      font-bold
                      text-brand-textMuted
                      transition

                      hover:border-brand-primary
                      hover:text-brand-primary

                      focus-visible:outline-none
                      focus-visible:ring-4
                      focus-visible:ring-brand-accent/20
                    "
                  >
                    <ChevronLeft className="h-4 w-4" />

                    Previous
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    !currentAnswer.trim()
                  }
                  className="
                    group
                    flex
                    min-h-[50px]
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-[14px]
                    px-5
                    text-[12px]
                    font-bold
                    text-white
                    shadow-[0_10px_25px_rgba(0,70,109,0.17)]
                    transition-all

                    hover:-translate-y-0.5
                    hover:opacity-95

                    focus-visible:outline-none
                    focus-visible:ring-4
                    focus-visible:ring-brand-accent/25

                    disabled:cursor-not-allowed
                    disabled:opacity-40
                    disabled:shadow-none
                    disabled:hover:translate-y-0
                  "
                  style={{
                    background:
                      currentAnswer.trim()
                        ? 'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)'
                        : '#00466D',
                  }}
                >
                  {step <
                  QUESTIONS.length -
                    1
                    ? 'Continue'
                    : 'Generate CV'}

                  <ChevronRight
                    className="
                      h-4
                      w-4
                      transition-transform
                      group-hover:translate-x-0.5
                    "
                  />
                </button>
              </div>
            </section>

            {/* =================================================
                SIDE PANEL
            ================================================== */}

            <aside className="space-y-4">
              <div
                className="
                  overflow-hidden
                  rounded-[24px]
                  border
                  border-brand-accent/30
                  bg-white/95
                  p-5
                  shadow-[0_12px_30px_rgba(0,70,109,0.07)]
                "
              >
                <div
                  className="
                    mb-4
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-[14px]
                    bg-brand-primary
                    text-white
                  "
                >
                  <FileText className="h-5 w-5" />
                </div>

                <h3
                  className="
                    text-[16px]
                    font-bold
                    text-brand-primary
                  "
                >
                  Professional structure
                </h3>

                <p
                  className="
                    mt-2
                    text-[12px]
                    leading-5
                    text-brand-textMuted
                  "
                >
                  The builder organises your
                  information into a clean CV
                  structure that is easy for
                  employers and recruiters to
                  review.
                </p>
              </div>

              <div
                className="
                  rounded-[24px]
                  border
                  border-brand-border
                  bg-white/95
                  p-5
                  shadow-[0_12px_30px_rgba(0,70,109,0.06)]
                "
              >
                <p
                  className="
                    mb-4
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-brand-primary
                  "
                >
                  CV sections
                </p>

                <div className="space-y-3">
                  {[
                    'Professional profile',
                    'Employment experience',
                    'Skills & competencies',
                    'Education & qualifications',
                    'Professional PDF layout',
                  ].map((item) => (
                    <div
                      key={item}
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >
                      <span
                        className="
                          flex
                          h-5
                          w-5
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-brand-accent/10
                          text-brand-primary
                        "
                      >
                        <Check className="h-3 w-3" />
                      </span>

                      <span
                        className="
                          text-[12px]
                          text-brand-textMuted
                        "
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="
                  rounded-[20px]
                  border
                  border-brand-border
                  bg-brand-surface
                  p-4
                "
              >
                <div className="flex gap-3">
                  <Lock
                    className="
                      mt-0.5
                      h-4
                      w-4
                      shrink-0
                      text-brand-primary
                    "
                  />

                  <div>
                    <p
                      className="
                        text-[12px]
                        font-bold
                        text-brand-primary
                      "
                    >
                      Review before sharing
                    </p>

                    <p
                      className="
                        mt-1
                        text-[10px]
                        leading-5
                        text-brand-textMuted
                      "
                    >
                      Make sure your employment
                      dates, qualifications and
                      experience are accurate
                      before sending your CV.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          /* =================================================
             GENERATED
          ================================================== */

          <div className="space-y-6">
            {/* SUCCESS */}

            <div
              className="
                rounded-[26px]
                border
                border-brand-accent/30
                bg-white/95
                p-5
                shadow-[0_16px_40px_rgba(0,70,109,0.08)]
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-4

                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <div className="flex items-center gap-4">
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-[16px]
                      bg-brand-primary
                      text-white
                    "
                  >
                    <Check className="h-5 w-5" />
                  </div>

                  <div>
                    <p
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.16em]
                        text-brand-accent
                      "
                    >
                      CV Generated
                    </p>

                    <h2
                      className="
                        !m-0
                        mt-1
                        text-[20px]
                        font-bold
                        !text-brand-primary
                      "
                    >
                      Review your document
                    </h2>

                    <p
                      className="
                        mt-1
                        text-[12px]
                        text-brand-textMuted
                      "
                    >
                      Check your information
                      before downloading and
                      sharing.
                    </p>
                  </div>
                </div>

                <div
                  className="
                    self-start
                    rounded-full
                    border
                    border-brand-gold/35
                    bg-brand-gold/10
                    px-3.5
                    py-1.5
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-brand-dark

                    sm:self-auto
                  "
                >
                  Ready to export
                </div>
              </div>
            </div>

            {/* =================================================
                PREVIEW WRAPPER
            ================================================== */}

            <div
              className="
                flex
                justify-center
                overflow-x-auto
                rounded-[28px]
                border
                border-brand-border
                bg-brand-surface
                p-4
                shadow-inner

                sm:p-6
              "
            >
              {/* =================================================
                  ACTUAL CV
                  ONLY THIS ELEMENT IS EXPORTED
              ================================================== */}

              <div
                ref={cvRef}
                style={{
                  width: '210mm',
                  minHeight: '270mm',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  color: '#00273D',
                  padding: '18mm 18mm 16mm',
                  fontFamily:
                    'Helvetica, "Helvetica Neue", Arial, sans-serif',
                }}
              >
                {/* DOCUMENT HEADER */}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '24px',
                    paddingBottom: '18px',
                    borderBottom:
                      '2px solid #00466D',
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid',
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        marginBottom: '8px',
                        color: '#FFAD01',
                        fontSize: '9px',
                        lineHeight: '1',
                        fontWeight: 700,
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Professional Curriculum Vitae
                    </div>

                    <h1
                      style={{
                        margin: 0,
                        color: '#00466D',
                        fontSize: '30px',
                        lineHeight: '1.12',
                        fontWeight: 700,
                        letterSpacing: '-0.5px',
                        fontFamily:
                          'Helvetica, "Helvetica Neue", Arial, sans-serif',
                      }}
                    >
                      Professional Profile
                    </h1>

                    <div
                      style={{
                        marginTop: '8px',
                        color: '#607B89',
                        fontSize: '10px',
                        lineHeight: '1.5',
                        fontWeight: 500,
                      }}
                    >
                      Experience • Skills • Qualifications
                    </div>
                  </div>

                  <div
                    style={{
                      minWidth: '90px',
                      paddingTop: '14px',
                      textAlign: 'right',
                    }}
                  >
                    <div
                      style={{
                        color: '#607B89',
                        fontSize: '8px',
                        lineHeight: '1',
                        fontWeight: 700,
                        letterSpacing: '1.2px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Prepared
                    </div>

                    <div
                      style={{
                        marginTop: '6px',
                        color: '#00273D',
                        fontSize: '9px',
                        lineHeight: '1.4',
                        fontWeight: 500,
                      }}
                    >
                      {new Date().toLocaleDateString(
                        'en-ZA',
                      )}
                    </div>
                  </div>
                </div>

                {/* DOCUMENT CONTENT */}

                <div
                  style={{
                    paddingTop: '26px',
                  }}
                >
                  <PDFCVSection
                    title="Professional Summary"
                    value={answers.summary}
                  />

                  <PDFCVSection
                    title="Professional Experience"
                    value={answers.lastJob}
                  />

                  <PDFCVSection
                    title="Core Skills & Competencies"
                    value={answers.skills}
                  />

                  <PDFCVSection
                    title="Education & Qualifications"
                    value={answers.education}
                  />
                </div>

                {/* DOCUMENT FOOTER */}

                <div
                  style={{
                    marginTop: '34px',
                    paddingTop: '12px',
                    borderTop:
                      '1px solid #D4D2E6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px',
                    fontSize: '8px',
                    lineHeight: '1.4',
                    color: '#607B89',
                    fontWeight: 600,
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid',
                  }}
                >
                  <span>
                    Prepared with TruCity
                  </span>

                  <span>
                    Verify • Connect • Pursue
                  </span>
                </div>
              </div>
            </div>

            {/* ACTIONS */}

            <div
              className="
                grid
                gap-3

                sm:grid-cols-[1fr_auto]
              "
            >
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="
                  flex
                  min-h-[56px]
                  items-center
                  justify-center
                  gap-2
                  rounded-[16px]
                  px-6
                  text-[14px]
                  font-bold
                  text-white
                  shadow-[0_12px_28px_rgba(0,70,109,0.18)]
                  transition

                  hover:-translate-y-0.5
                  hover:opacity-95

                  focus-visible:outline-none
                  focus-visible:ring-4
                  focus-visible:ring-brand-accent/25

                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
                style={{
                  background:
                    'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)',
                }}
              >
                {isDownloading ? (
                  <>
                    <RotateCcw
                      className="
                        h-4
                        w-4
                        animate-spin
                      "
                    />

                    Preparing PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />

                    Download CV
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="
                  flex
                  min-h-[56px]
                  items-center
                  justify-center
                  gap-2
                  rounded-[16px]
                  border
                  border-brand-border
                  bg-white
                  px-6
                  text-[14px]
                  font-bold
                  text-brand-textMuted
                  transition

                  hover:border-brand-primary
                  hover:text-brand-primary

                  focus-visible:outline-none
                  focus-visible:ring-4
                  focus-visible:ring-brand-accent/20
                "
              >
                <ChevronLeft className="h-4 w-4" />

                Edit Information
              </button>
            </div>

            <div
              className="
                rounded-[20px]
                border
                border-brand-border
                bg-white/95
                p-4
              "
            >
              <div className="flex items-start gap-3">
                <Check
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    text-brand-accent
                  "
                />

                <p
                  className="
                    text-[12px]
                    leading-5
                    text-brand-textMuted
                  "
                >
                  Review your dates, job titles,
                  qualifications and experience before
                  sharing the document with employers.
                  You can return and edit the
                  information at any time.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* =========================================================
   ROLECHOICE NAV LINK
========================================================= */

function PublicNavLink({
  to,
  label,
  end = false,
}: PublicNavLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => `
        relative
        text-[14px]
        no-underline
        transition-colors
        duration-150

        ${
          isActive
            ? `
              font-bold
              text-brand-primary

              after:absolute
              after:-bottom-2
              after:left-0
              after:h-[2px]
              after:w-full
              after:rounded-full
              after:bg-brand-gold
            `
            : `
              font-semibold
              text-brand-textMuted
              hover:text-brand-primary
            `
        }

        focus-visible:rounded-md
        focus-visible:outline-none
        focus-visible:ring-4
        focus-visible:ring-brand-accent/20
      `}
    >
      {label}
    </NavLink>
  );
}

/* =========================================================
   PDF CV SECTION
========================================================= */

interface PDFCVSectionProps {
  title: string;
  value: string;
}

function PDFCVSection({
  title,
  value,
}: PDFCVSectionProps) {
  return (
    <section
      style={{
        marginBottom: '26px',
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '9px',
        }}
      >
        <h2
          style={{
            margin: 0,
            flexShrink: 0,
            color: '#00466D',
            fontSize: '10px',
            lineHeight: '1.2',
            fontWeight: 700,
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            fontFamily:
              'Helvetica, "Helvetica Neue", Arial, sans-serif',
          }}
        >
          {title}
        </h2>

        <div
          style={{
            height: '1px',
            flex: 1,
            backgroundColor: '#D4D2E6',
          }}
        />
      </div>

      <p
        style={{
          margin: 0,
          whiteSpace: 'pre-wrap',
          color: '#00273D',
          fontSize: '10.5px',
          lineHeight: '1.65',
          fontWeight: 400,
          fontFamily:
            'Helvetica, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        {value || 'Not specified'}
      </p>
    </section>
  );
}