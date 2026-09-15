import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';

import { useEffect, useState } from 'react';

interface CandidateOnboardingProps {
  onComplete: () => void;
}

type OnboardingStep = {
  title: string;
  description: string;
  icon: typeof Sparkles;
  accent: 'blue' | 'gold';
  points: string[];
};

const onboardingSteps: OnboardingStep[] = [
  {
    title: 'Welcome to TruCity',
    description:
      'TruCity helps you build a trusted professional profile, discover opportunities, and connect with employers.',
    icon: Sparkles,
    accent: 'gold',
    points: [
      'Build a credible professional presence',
      'Discover relevant employment opportunities',
      'Connect with employers through one platform',
    ],
  },
  {
    title: 'Complete your profile',
    description:
      'Your profile helps employers understand who you are, your experience, and the kind of opportunities you are looking for.',
    icon: UserRound,
    accent: 'blue',
    points: [
      'Add your professional details',
      'Upload your face and full-body profile photos',
      'Keep your experience and industry information up to date',
    ],
  },
  {
    title: 'Explore opportunities',
    description:
      'Browse open roles, review companies, filter opportunities, and save positions that interest you.',
    icon: BriefcaseBusiness,
    accent: 'gold',
    points: [
      'Browse available jobs',
      'Filter roles by relevant criteria',
      'Save opportunities to review later',
    ],
  },
  {
    title: 'Apply and communicate',
    description:
      'When you find the right opportunity, TruCity keeps your application activity and employer conversations organised.',
    icon: MessageSquareText,
    accent: 'blue',
    points: [
      'Apply directly from an opportunity',
      'Continue employer conversations in Messages',
      'Keep application communication in one place',
    ],
  },
  {
    title: 'Build your CV',
    description:
      'Use the CV section to prepare a professional CV that presents your experience, education, and skills clearly.',
    icon: FileText,
    accent: 'gold',
    points: [
      'Create your professional summary',
      'Add experience, skills, and education',
      'Download your completed CV when ready',
    ],
  },
  {
    title: 'You are ready to get started',
    description:
      'Explore TruCity at your own pace and use the Hub whenever you need guidance about work, recruitment, or professional development.',
    icon: ShieldCheck,
    accent: 'blue',
    points: [
      'Use the Hub for practical workplace guidance',
      'Keep your profile and CV updated',
      'Return regularly to discover new opportunities',
    ],
  },
];

export default function CandidateOnboarding({
  onComplete,
}: CandidateOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = onboardingSteps[currentStep];
  const Icon = step.icon;

  const isFirstStep = currentStep === 0;
  const isLastStep =
    currentStep === onboardingSteps.length - 1;

  useEffect(() => {
    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, []);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      return;
    }

    setCurrentStep((previous) => previous + 1);
  };

  const handleBack = () => {
    if (isFirstStep) {
      return;
    }

    setCurrentStep((previous) => previous - 1);
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-[#062f44]/45
        px-4
        py-6
        backdrop-blur-[4px]
      "
    >
      <div
        className="
          relative
          w-full
          max-w-[650px]
          overflow-hidden
          rounded-[30px]
          border
          border-[#dce8ef]
          bg-white
          shadow-[0_32px_90px_rgba(7,89,133,0.28)]
        "
      >
        {/* =================================================
            TOP ACCENT
        ================================================== */}

        <div
          className="h-1.5 w-full"
          style={{
            background:
              'linear-gradient(90deg, #075985 0%, #0ea5e9 56%, #f5a900 100%)',
          }}
        />

        {/* =================================================
            CLOSE / SKIP
        ================================================== */}

        <button
          type="button"
          onClick={onComplete}
          aria-label="Skip onboarding"
          className="
            absolute
            right-5
            top-5
            z-20
            grid
            h-10
            w-10
            place-items-center
            rounded-full
            border
            border-[#dce8ef]
            bg-white
            text-[#607b89]
            transition
            hover:border-[#075985]
            hover:text-[#075985]
          "
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-6 pb-7 pt-8 sm:px-9 sm:pb-9">
          {/* =================================================
              STEP INDICATOR
          ================================================== */}

          <div className="mb-7 flex items-center justify-between gap-4 pr-12">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0ea5e9]">
                Getting started
              </p>

              <p className="mt-1 text-xs font-semibold text-[#607b89]">
                Step {currentStep + 1} of{' '}
                {onboardingSteps.length}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {onboardingSteps.map((_, index) => (
                <span
                  key={index}
                  className={`
                    h-2.5
                    rounded-full
                    transition-all
                    ${
                      index === currentStep
                        ? 'w-7 bg-[#f5a900]'
                        : index < currentStep
                          ? 'w-2.5 bg-[#075985]'
                          : 'w-2.5 bg-[#dce8ef]'
                    }
                  `}
                />
              ))}
            </div>
          </div>

          {/* =================================================
              ICON
          ================================================== */}

          <div
            className={`
              mb-6
              grid
              h-16
              w-16
              place-items-center
              rounded-[20px]
              ${
                step.accent === 'gold'
                  ? 'bg-[#fff4d5] text-[#d99000]'
                  : 'bg-[#e8f7fd] text-[#075985]'
              }
            `}
          >
            <Icon className="h-8 w-8" />
          </div>

          {/* =================================================
              CONTENT
          ================================================== */}

          <h2
            className="
              !m-0
              text-[28px]
              font-black
              leading-tight
              tracking-[-0.035em]
              !text-[#075985]
              sm:text-[34px]
            "
          >
            {step.title}
          </h2>

          <p className="mt-3 max-w-[560px] text-sm leading-6 text-[#4f7181] sm:text-[15px]">
            {step.description}
          </p>

          {/* =================================================
              POINTS
          ================================================== */}

          <div className="mt-6 space-y-3">
            {step.points.map((point) => (
              <div
                key={point}
                className="
                  flex
                  items-start
                  gap-3
                  rounded-[14px]
                  border
                  border-[#e2edf2]
                  bg-[#f9fcfd]
                  px-4
                  py-3
                "
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0ea5e9]" />

                <span className="text-sm font-semibold leading-5 text-[#315e73]">
                  {point}
                </span>
              </div>
            ))}
          </div>

          {/* =================================================
              TAGLINE
          ================================================== */}

          <div className="mt-7 text-center text-[9px] font-black uppercase tracking-[0.25em] text-[#075985]">
            Verify • Connect • Pursue
          </div>

          {/* =================================================
              ACTIONS
          ================================================== */}

          <div className="mt-7 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-[#e3edf2] pt-6 sm:flex-row sm:items-center">
            <div>
              {!isFirstStep ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="
                    inline-flex
                    min-h-[46px]
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-[13px]
                    border
                    border-[#cfdde4]
                    bg-white
                    px-5
                    text-sm
                    font-bold
                    text-[#315e73]
                    transition
                    hover:border-[#075985]
                    hover:text-[#075985]
                    sm:w-auto
                  "
                >
                  <ArrowLeft className="h-4 w-4" />

                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onComplete}
                  className="
                    min-h-[46px]
                    w-full
                    px-3
                    text-sm
                    font-semibold
                    text-[#607b89]
                    transition
                    hover:text-[#075985]
                    sm:w-auto
                  "
                >
                  Skip for now
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="
                inline-flex
                min-h-[48px]
                w-full
                items-center
                justify-center
                gap-2
                rounded-[14px]
                px-6
                text-sm
                font-black
                text-white
                shadow-[0_12px_25px_rgba(7,89,133,0.18)]
                transition-transform
                hover:-translate-y-0.5
                sm:w-auto
              "
              style={{
                background:
                  'linear-gradient(90deg, #075985, #0ea5e9)',
              }}
            >
              {isLastStep
                ? 'Start Exploring'
                : 'Next'}

              {!isLastStep && (
                <ArrowRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}