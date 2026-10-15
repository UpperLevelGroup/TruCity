import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  ArrowRight,
  Award,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronLeft,
  Download,
  FileText,
  GraduationCap,
  Lightbulb,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  UserRound,
  Wrench,
} from 'lucide-react';

type Experience = {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
};

type Education = {
  id: string;
  qualification: string;
  institution: string;
  startDate: string;
  endDate: string;
  details: string;
};

type CVData = {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experiences: Experience[];
  skills: string;
  education: Education[];
};

type StepId =
  | 'personal'
  | 'summary'
  | 'experience'
  | 'skills'
  | 'education';

const STORAGE_KEY = 'trucity-cv-builder-draft-v1';
const TRUCITY_LOGO = '/trucity-logo.png';
const TRUCITY_WATERMARK = '/trucity-city-watermark.png';

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const emptyExperience = (): Experience => ({
  id: createId(),
  title: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  description: '',
});

const emptyEducation = (): Education => ({
  id: createId(),
  qualification: '',
  institution: '',
  startDate: '',
  endDate: '',
  details: '',
});

const createInitialData = (): CVData => ({
  fullName: '',
  professionalTitle: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  experiences: [emptyExperience()],
  skills: '',
  education: [emptyEducation()],
});

const STEPS: {
  id: StepId;
  title: string;
  shortTitle: string;
  description: string;
  icon: typeof UserRound;
}[] = [
  {
    id: 'personal',
    title: 'Personal Details',
    shortTitle: 'Personal',
    description: 'Add the details employers need to contact you.',
    icon: UserRound,
  },
  {
    id: 'summary',
    title: 'Professional Summary',
    shortTitle: 'Summary',
    description:
      'Introduce yourself and the value you bring to an employer.',
    icon: FileText,
  },
  {
    id: 'experience',
    title: 'Professional Experience',
    shortTitle: 'Experience',
    description:
      'Add your employment history, internships or relevant projects.',
    icon: BriefcaseBusiness,
  },
  {
    id: 'skills',
    title: 'Core Skills & Competencies',
    shortTitle: 'Skills',
    description:
      'Highlight the skills that make you a strong candidate.',
    icon: Wrench,
  },
  {
    id: 'education',
    title: 'Education & Qualifications',
    shortTitle: 'Education',
    description:
      'Add qualifications, training and certifications.',
    icon: GraduationCap,
  },
];

/* -------------------------------------------------------------------------- */
/* Reusable form components                                                    */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-semibold text-[#00273D]">
        {label}
        {required && (
          <span className="ml-1 text-rose-500">*</span>
        )}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-[#DCE8EF] bg-white px-3.5 py-3 text-sm text-[#00273D] outline-none transition placeholder:text-slate-400 focus:border-[#1E92D2] focus:ring-4 focus:ring-[#1E92D2]/10"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-semibold text-[#00273D]">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-xl border border-[#DCE8EF] bg-white px-4 py-3.5 text-sm leading-7 text-[#00273D] outline-none transition placeholder:text-slate-400 focus:border-[#1E92D2] focus:ring-4 focus:ring-[#1E92D2]/10"
      />
    </label>
  );
}

function CVSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="cv-resume-section mb-6">
      <h2
        className="mb-3 border-b pb-2 text-sm font-bold uppercase tracking-wider"
        style={{
          color: '#00466D',
          borderColor: '#D8E5ED',
        }}
      >
        {title}
      </h2>

      {children}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Native browser print styles                                                 */
/* -------------------------------------------------------------------------- */

function CVPrintStyles() {
  return (
    <style>{`
      @page {
        size: A4 portrait;
        margin: 0;
      }

      @media print {
        html,
        body {
          width: 210mm !important;
          min-width: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        body.cv-print-mode * {
          visibility: hidden !important;
        }

        body.cv-print-mode .cv-pdf-document,
        body.cv-print-mode .cv-pdf-document * {
          visibility: visible !important;
        }

        body.cv-print-mode .cv-pdf-document {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 210mm !important;
          max-width: none !important;
          min-height: 297mm !important;
          margin: 0 !important;
          padding: 15mm !important;
          box-sizing: border-box !important;
          overflow: visible !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          background: #ffffff !important;
          color: #334155 !important;
          font-family: Helvetica, Arial, sans-serif !important;
          font-size: 10pt !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /*
         * A fixed watermark is repeated by the print renderer on pages
         * where supported. Its opacity keeps the CV text readable.
         */
        body.cv-print-mode .cv-watermark-image {
          position: fixed !important;
          display: block !important;
          visibility: visible !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          max-width: none !important;
          max-height: none !important;
          object-fit: contain !important;
          object-position: center center !important;
          opacity: 0.075 !important;
          z-index: 0 !important;
          pointer-events: none !important;
        }

        body.cv-print-mode .cv-document-content {
          position: relative !important;
          z-index: 1 !important;
        }

        body.cv-print-mode .cv-resume-section,
        body.cv-print-mode .cv-experience-entry,
        body.cv-print-mode .cv-education-entry {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        body.cv-print-mode .cv-resume-logo {
          display: block !important;
          visibility: visible !important;
          max-width: 30% !important;
          object-fit: contain !important;
        }

        body.cv-print-mode button,
        body.cv-print-mode aside {
          display: none !important;
        }

        body.cv-print-mode .cv-pdf-document p,
        body.cv-print-mode .cv-pdf-document h1,
        body.cv-print-mode .cv-pdf-document h2,
        body.cv-print-mode .cv-pdf-document h3,
        body.cv-print-mode .cv-pdf-document span {
          overflow-wrap: anywhere;
        }
      }
    `}</style>
  );
}

/* -------------------------------------------------------------------------- */
/* CV document                                                                 */
/* -------------------------------------------------------------------------- */

function CVDocument({ data }: { data: CVData }) {
  const skills = data.skills
    .split(/[,;\n]/)
    .map((skill) => skill.trim())
    .filter(Boolean);

  const experiences = data.experiences.filter(
    (item) =>
      item.title.trim() ||
      item.company.trim() ||
      item.description.trim(),
  );

  const education = data.education.filter(
    (item) =>
      item.qualification.trim() ||
      item.institution.trim() ||
      item.details.trim(),
  );

  return (
    <div
      className="cv-pdf-document relative mx-auto min-h-[842px] w-full max-w-[794px] overflow-hidden bg-white px-6 py-8 sm:px-12 sm:py-12"
      style={{
        fontFamily: 'Helvetica, Arial, sans-serif',
        boxSizing: 'border-box',
        color: '#334155',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* Watermark sits behind the CV content. */}
      <img
        src={TRUCITY_WATERMARK}
        alt=""
        aria-hidden="true"
        className="cv-watermark-image pointer-events-none absolute inset-0 h-full w-full object-contain"
        style={{
          opacity: 0.075,
          zIndex: 0,
        }}
        onError={(event) => {
          console.error(
            'TruCity watermark failed to load:',
            event.currentTarget.src,
          );
          event.currentTarget.style.display = 'none';
        }}
      />

      <div className="cv-document-content relative" style={{ zIndex: 1 }}>
        <header
          className="mb-8 flex items-start justify-between gap-4 border-b-2 pb-6"
          style={{ borderColor: '#1E92D2' }}
        >
          <div className="min-w-0 flex-1">
            <p
              className="mb-2 text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: '#1E92D2' }}
            >
              Curriculum Vitae
            </p>

            <h1
              className="break-words text-3xl font-bold"
              style={{ color: '#00273D' }}
            >
              {data.fullName.trim() || 'Your Full Name'}
            </h1>

            {data.professionalTitle.trim() && (
              <p
                className="mt-2 text-base font-semibold"
                style={{ color: '#00466D' }}
              >
                {data.professionalTitle}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              {data.email && <span>{data.email}</span>}
              {data.phone && <span>{data.phone}</span>}
              {data.location && <span>{data.location}</span>}
            </div>
          </div>

          <img
            src={TRUCITY_LOGO}
            alt="TruCity"
            className="cv-resume-logo h-auto shrink-0 object-contain"
            style={{
              display: 'block',
              width: '112px',
              maxWidth: '30%',
              maxHeight: '64px',
              objectFit: 'contain',
              objectPosition: 'top right',
            }}
            onError={(event) => {
              console.error(
                'TruCity logo failed to load:',
                event.currentTarget.src,
              );
              event.currentTarget.style.display = 'none';
            }}
          />
        </header>

        {data.summary.trim() && (
          <CVSection title="Professional Summary">
            <p className="whitespace-pre-wrap text-sm leading-7">
              {data.summary.trim()}
            </p>
          </CVSection>
        )}

        {experiences.length > 0 && (
          <CVSection title="Professional Experience">
            <div className="space-y-5">
              {experiences.map((item) => (
                <article
                  key={item.id}
                  className="cv-experience-entry"
                >
                  <h3
                    className="text-sm font-bold"
                    style={{ color: '#00273D' }}
                  >
                    {item.title || 'Position'}
                  </h3>

                  {(item.company || item.location) && (
                    <p className="mt-1 text-sm font-medium">
                      {[item.company, item.location]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}

                  {(item.startDate || item.endDate) && (
                    <p className="mt-1 text-xs text-slate-500">
                      {item.startDate || 'Start date not specified'}
                      {' – '}
                      {item.endDate || 'Present'}
                    </p>
                  )}

                  {item.description.trim() && (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                      {item.description.trim()}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </CVSection>
        )}

        {skills.length > 0 && (
          <CVSection title="Core Skills & Competencies">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-md px-2.5 py-1.5 text-xs"
                  style={{
                    background: '#EEF7FC',
                    color: '#00466D',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </CVSection>
        )}

        {education.length > 0 && (
          <CVSection title="Education & Qualifications">
            <div className="space-y-4">
              {education.map((item) => (
                <article
                  key={item.id}
                  className="cv-education-entry"
                >
                  <h3
                    className="text-sm font-bold"
                    style={{ color: '#00273D' }}
                  >
                    {item.qualification || 'Qualification'}
                  </h3>

                  {item.institution && (
                    <p className="mt-1 text-sm">
                      {item.institution}
                    </p>
                  )}

                  {(item.startDate || item.endDate) && (
                    <p className="mt-1 text-xs text-slate-500">
                      {[item.startDate, item.endDate]
                        .filter(Boolean)
                        .join(' – ')}
                    </p>
                  )}

                  {item.details.trim() && (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                      {item.details.trim()}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </CVSection>
        )}

        <footer
          className="mt-10 border-t pt-4 text-center text-xs"
          style={{
            borderColor: '#E2E8F0',
            color: '#94A3B8',
          }}
        >
          Prepared using TruCity Career Tools
        </footer>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main CV builder                                                             */
/* -------------------------------------------------------------------------- */

export default function CvBuilder() {
  const navigate = useNavigate();
  const cvRef = useRef<HTMLDivElement>(null);
  const printCleanupRef = useRef<(() => void) | null>(null);

  const [data, setData] = useState<CVData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved) as Partial<CVData>;
        const initial = createInitialData();

        return {
          ...initial,
          ...parsed,
          experiences:
            Array.isArray(parsed.experiences) &&
            parsed.experiences.length
              ? parsed.experiences
              : [emptyExperience()],
          education:
            Array.isArray(parsed.education) && parsed.education.length
              ? parsed.education
              : [emptyEducation()],
        };
      }
    } catch {
      // Start with a fresh draft if stored data cannot be read.
    }

    return createInitialData();
  });

  const [step, setStep] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [saveStatus, setSaveStatus] = useState('Draft saved locally');

  const currentStep = STEPS[step];
  const CurrentStepIcon = currentStep.icon;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSaveStatus('Draft saved locally');
    } catch {
      setSaveStatus('Unable to save draft in this browser');
    }
  }, [data]);

  useEffect(() => {
    return () => {
      printCleanupRef.current?.();
    };
  }, []);

  const updateField = <K extends keyof CVData>(
    field: K,
    value: CVData[K],
  ) => {
    setData((previous) => ({ ...previous, [field]: value }));
    setValidationError('');
  };

  const updateExperience = (
    id: string,
    field: keyof Experience,
    value: string,
  ) => {
    setData((previous) => ({
      ...previous,
      experiences: previous.experiences.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
    setValidationError('');
  };

  const updateEducation = (
    id: string,
    field: keyof Education,
    value: string,
  ) => {
    setData((previous) => ({
      ...previous,
      education: previous.education.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
    setValidationError('');
  };

  const validateStep = () => {
    if (step === 0 && !data.fullName.trim()) {
      setValidationError(
        'Please enter your full name before continuing.',
      );
      return false;
    }

    if (step === 1 && !data.summary.trim()) {
      setValidationError(
        'Please add a professional summary. You can edit it later.',
      );
      return false;
    }

    if (step === 2) {
      const hasExperience = data.experiences.some(
        (item) =>
          item.title.trim() ||
          item.company.trim() ||
          item.description.trim(),
      );

      if (!hasExperience) {
        setValidationError(
          'Add a job, internship or relevant project. If you have no experience yet, add a project or volunteer experience.',
        );
        return false;
      }
    }

    if (step === 3 && !data.skills.trim()) {
      setValidationError('Please add at least one skill.');
      return false;
    }

    if (
      step === 4 &&
      !data.education.some(
        (item) =>
          item.qualification.trim() || item.institution.trim(),
      )
    ) {
      setValidationError(
        'Add at least one qualification or training entry. You can enter your current studies.',
      );
      return false;
    }

    setValidationError('');
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (step < STEPS.length - 1) {
      setStep((previous) => previous + 1);
    } else {
      setGenerated(true);
    }
  };

  const handlePrevious = () => {
    setValidationError('');

    if (step > 0) {
      setStep((previous) => previous - 1);
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      'Start a new CV? This will delete your saved draft from this browser.',
    );

    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEY);
    setData(createInitialData());
    setStep(0);
    setGenerated(false);
    setIsDownloading(false);
    setValidationError('');
  };

  const waitForImages = async (
    container: HTMLElement,
  ): Promise<void> => {
    const images = Array.from(
      container.querySelectorAll<HTMLImageElement>('img'),
    );

    await Promise.all(
      images.map(async (image) => {
        if (image.complete) {
          if (image.naturalWidth === 0 && image.getAttribute('src')) {
            console.warn(
              'CV image could not be loaded:',
              image.currentSrc || image.src,
            );
          }
          return;
        }

        await new Promise<void>((resolve) => {
          const finish = () => resolve();

          image.addEventListener('load', finish, { once: true });
          image.addEventListener('error', finish, { once: true });
        });
      }),
    );
  };

  const handleDownloadPDF = async () => {
    if (!cvRef.current || isDownloading) return;

    setIsDownloading(true);

    let printModeEnabled = false;

    const cleanupPrintMode = () => {
      document.body.classList.remove('cv-print-mode');
      window.removeEventListener('afterprint', cleanupPrintMode);

      if (printCleanupRef.current === cleanupPrintMode) {
        printCleanupRef.current = null;
      }

      printModeEnabled = false;
    };

    try {
      await waitForImages(cvRef.current);

      // Save the generated PDF using the native browser print dialog.
      document.body.classList.add('cv-print-mode');
      printModeEnabled = true;
      printCleanupRef.current = cleanupPrintMode;

      // Let the browser apply the print CSS before opening the dialog.
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => resolve());
        });
      });

      window.addEventListener('afterprint', cleanupPrintMode);

      window.print();
    } catch (error) {
      console.error('Unable to prepare the CV for PDF printing:', error);

      window.alert(
        'Your CV could not be prepared for printing. Please try again.',
      );
    } finally {
      if (printModeEnabled) {
        cleanupPrintMode();
      }

      setIsDownloading(false);
    }
  };

  const isStepComplete = (id: StepId) => {
    switch (id) {
      case 'personal':
        return Boolean(data.fullName.trim());

      case 'summary':
        return Boolean(data.summary.trim());

      case 'experience':
        return data.experiences.some(
          (entry) =>
            entry.title.trim() ||
            entry.company.trim() ||
            entry.description.trim(),
        );

      case 'skills':
        return Boolean(data.skills.trim());

      case 'education':
        return data.education.some(
          (entry) =>
            entry.qualification.trim() ||
            entry.institution.trim(),
        );
    }
  };

  const completedSteps = STEPS.filter((item) =>
    isStepComplete(item.id),
  ).length;

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <main
      className="min-h-full bg-[#F5F9FC] px-4 py-5 sm:px-6 sm:py-7 lg:px-8"
      style={{ color: '#00273D' }}
    >
      <CVPrintStyles />

      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition hover:text-[#00466D]"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-[#1E92D2]">
                <FileText size={17} />
                Career tools
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#00273D] sm:text-3xl">
                CV Builder
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Create a professional CV with your real details,
                experience, skills and qualifications.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#DCE8EF] bg-white px-3 py-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF5FC] text-[#1E92D2]">
                <Award size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold">
                  Professional CV
                </p>
                <p className="text-xs text-slate-500">
                  {completedSteps} of {STEPS.length} sections completed
                </p>
              </div>
            </div>
          </div>
        </div>

        {generated ? (
          <div className="space-y-5">
            <section className="rounded-2xl border border-[#DCE8EF] bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-1 shrink-0 text-emerald-600"
                    size={25}
                  />

                  <div>
                    <h2 className="text-lg font-bold">
                      Your CV is ready
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Review your details. You can edit any section or
                      print your CV to PDF.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#00466D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#003650] disabled:opacity-60"
                >
                  <Download size={17} />
                  {isDownloading
                    ? 'Preparing PDF...'
                    : 'Download CV'}
                </button>
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                Your browser will open its print dialog. Choose
                <strong> Save as PDF </strong>
                as the destination.
              </p>
            </section>

            <section className="overflow-hidden rounded-2xl border border-[#DCE8EF] bg-white">
              <div className="border-b border-[#E7EEF3] px-5 py-4 sm:px-8">
                <h2 className="font-semibold">CV preview</h2>
                <p className="mt-1 text-xs text-slate-500">
                  A4 document · TruCity branding · Watermark
                </p>
              </div>

              <div className="overflow-x-auto bg-[#EDF2F6] p-3 sm:p-6">
                <div ref={cvRef}>
                  <CVDocument data={data} />
                </div>
              </div>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  setGenerated(false);
                  setStep(0);
                }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DCE8EF] bg-white px-4 py-3 text-sm font-semibold text-[#00466D] hover:bg-[#F5F9FC]"
              >
                <ChevronLeft size={17} />
                Edit my CV
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#00466D] px-5 py-3 text-sm font-semibold text-white hover:bg-[#003650] disabled:opacity-60"
              >
                <Download size={17} />
                {isDownloading
                  ? 'Preparing PDF...'
                  : 'Download professional CV'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <section className="min-w-0 overflow-hidden rounded-2xl border border-[#DCE8EF] bg-white">
              <div className="border-b border-[#E7EEF3] px-5 py-5 sm:px-7">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Step {step + 1} of {STEPS.length}
                    </p>

                    <h2 className="mt-1 text-lg font-bold">
                      {currentStep.title}
                    </h2>
                  </div>

                  <span className="rounded-full bg-[#EAF5FC] px-3 py-1.5 text-xs font-semibold text-[#00466D]">
                    {Math.round(progress)}% progress
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#E8F0F5]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: '#1E92D2',
                    }}
                  />
                </div>

                <div className="mt-5 grid grid-cols-5 gap-1 sm:gap-2">
                  {STEPS.map((item, index) => {
                    const StepIcon = item.icon;
                    const isCurrent = index === step;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setStep(index);
                          setValidationError('');
                        }}
                        className="flex min-w-0 flex-col items-center gap-2 rounded-xl px-1 py-2 text-center transition hover:bg-[#F5F9FC]"
                      >
                        <span
                          className="flex h-9 w-9 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: isCurrent
                              ? '#00466D'
                              : '#F0F5F8',
                            color: isCurrent
                              ? '#FFFFFF'
                              : '#7890A0',
                          }}
                        >
                          <StepIcon size={17} />
                        </span>

                        <span className="w-full truncate text-[10px] font-semibold sm:text-xs">
                          {item.shortTitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="px-5 py-6 sm:px-7 sm:py-8">
                <div className="mb-6 flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF5FC] text-[#1E92D2]">
                    <CurrentStepIcon size={21} />
                  </div>

                  <div>
                    <h3 className="text-base font-bold sm:text-lg">
                      {currentStep.description}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Your draft is saved in this browser automatically.
                    </p>
                  </div>
                </div>

                {currentStep.id === 'personal' && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Full name"
                      value={data.fullName}
                      onChange={(v) => updateField('fullName', v)}
                      placeholder="e.g. Jane Smith"
                      required
                    />

                    <Field
                      label="Professional title"
                      value={data.professionalTitle}
                      onChange={(v) =>
                        updateField('professionalTitle', v)
                      }
                      placeholder="e.g. Software Developer"
                    />

                    <Field
                      label="Email address"
                      type="email"
                      value={data.email}
                      onChange={(v) => updateField('email', v)}
                      placeholder="you@example.com"
                    />

                    <Field
                      label="Phone number"
                      type="tel"
                      value={data.phone}
                      onChange={(v) => updateField('phone', v)}
                      placeholder="e.g. +27 71 234 5678"
                    />

                    <div className="sm:col-span-2">
                      <Field
                        label="Location"
                        value={data.location}
                        onChange={(v) => updateField('location', v)}
                        placeholder="e.g. Johannesburg, South Africa"
                      />
                    </div>
                  </div>
                )}

                {currentStep.id === 'summary' && (
                  <TextAreaField
                    label="Professional summary"
                    value={data.summary}
                    onChange={(v) => updateField('summary', v)}
                    rows={8}
                    placeholder="Introduce yourself, describe your background, strongest qualities and the value you bring to an employer."
                  />
                )}

                {currentStep.id === 'experience' && (
                  <div className="space-y-5">
                    <p className="text-sm leading-6 text-slate-500">
                      Add multiple roles if needed. If you are new to
                      work, include internships, volunteer work or
                      relevant projects.
                    </p>

                    {data.experiences.map((item, index) => (
                      <div
                        key={item.id}
                        className="space-y-4 rounded-xl border border-[#DCE8EF] p-4 sm:p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="font-semibold">
                            Experience {index + 1}
                          </h4>

                          {data.experiences.length > 1 && (
                            <button
                              type="button"
                              aria-label={`Remove experience ${index + 1}`}
                              onClick={() =>
                                updateField(
                                  'experiences',
                                  data.experiences.filter(
                                    (entry) => entry.id !== item.id,
                                  ),
                                )
                              }
                              className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 size={17} />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field
                            label="Job title or project role"
                            value={item.title}
                            onChange={(v) =>
                              updateExperience(item.id, 'title', v)
                            }
                            placeholder="e.g. Junior Developer"
                          />

                          <Field
                            label="Company or organisation"
                            value={item.company}
                            onChange={(v) =>
                              updateExperience(item.id, 'company', v)
                            }
                            placeholder="Company name"
                          />

                          <Field
                            label="Location"
                            value={item.location}
                            onChange={(v) =>
                              updateExperience(item.id, 'location', v)
                            }
                            placeholder="e.g. Johannesburg"
                          />

                          <Field
                            label="Start date"
                            value={item.startDate}
                            onChange={(v) =>
                              updateExperience(item.id, 'startDate', v)
                            }
                            placeholder="e.g. Jan 2024"
                          />

                          <Field
                            label="End date"
                            value={item.endDate}
                            onChange={(v) =>
                              updateExperience(item.id, 'endDate', v)
                            }
                            placeholder="e.g. Aug 2025 or Present"
                          />
                        </div>

                        <TextAreaField
                          label="Responsibilities and achievements"
                          value={item.description}
                          onChange={(v) =>
                            updateExperience(item.id, 'description', v)
                          }
                          placeholder="Describe your responsibilities, projects, results and achievements."
                          rows={5}
                        />
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        updateField('experiences', [
                          ...data.experiences,
                          emptyExperience(),
                        ])
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8EF] px-4 py-3 text-sm font-semibold text-[#00466D] hover:bg-[#F5F9FC]"
                    >
                      <Plus size={17} />
                      Add another experience
                    </button>
                  </div>
                )}

                {currentStep.id === 'skills' && (
                  <div className="space-y-4">
                    <TextAreaField
                      label="Your skills"
                      value={data.skills}
                      onChange={(v) => updateField('skills', v)}
                      rows={7}
                      placeholder={'Java\nReact\nSQL\nCommunication\nProblem-solving'}
                    />

                    <p className="text-xs leading-5 text-slate-500">
                      Separate skills with commas or put each skill on
                      a new line. They will appear as individual items
                      in your CV.
                    </p>
                  </div>
                )}

                {currentStep.id === 'education' && (
                  <div className="space-y-5">
                    {data.education.map((item, index) => (
                      <div
                        key={item.id}
                        className="space-y-4 rounded-xl border border-[#DCE8EF] p-4 sm:p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="font-semibold">
                            Qualification {index + 1}
                          </h4>

                          {data.education.length > 1 && (
                            <button
                              type="button"
                              aria-label={`Remove qualification ${index + 1}`}
                              onClick={() =>
                                updateField(
                                  'education',
                                  data.education.filter(
                                    (entry) => entry.id !== item.id,
                                  ),
                                )
                              }
                              className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 size={17} />
                            </button>
                          )}
                        </div>

                        <Field
                          label="Qualification or course"
                          value={item.qualification}
                          onChange={(v) =>
                            updateEducation(
                              item.id,
                              'qualification',
                              v,
                            )
                          }
                          placeholder="e.g. Diploma in Information Technology"
                        />

                        <Field
                          label="Institution"
                          value={item.institution}
                          onChange={(v) =>
                            updateEducation(
                              item.id,
                              'institution',
                              v,
                            )
                          }
                          placeholder="College, university or training provider"
                        />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <Field
                            label="Start date"
                            value={item.startDate}
                            onChange={(v) =>
                              updateEducation(
                                item.id,
                                'startDate',
                                v,
                              )
                            }
                            placeholder="e.g. 2023"
                          />

                          <Field
                            label="Completion date"
                            value={item.endDate}
                            onChange={(v) =>
                              updateEducation(
                                item.id,
                                'endDate',
                                v,
                              )
                            }
                            placeholder="e.g. 2025 or In progress"
                          />
                        </div>

                        <TextAreaField
                          label="Additional details (optional)"
                          value={item.details}
                          onChange={(v) =>
                            updateEducation(item.id, 'details', v)
                          }
                          placeholder="Relevant coursework, distinctions, certifications or training."
                          rows={3}
                        />
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        updateField('education', [
                          ...data.education,
                          emptyEducation(),
                        ])
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8EF] px-4 py-3 text-sm font-semibold text-[#00466D] hover:bg-[#F5F9FC]"
                    >
                      <Plus size={17} />
                      Add another qualification
                    </button>
                  </div>
                )}

                {validationError && (
                  <p
                    role="alert"
                    className="mt-4 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm text-rose-700"
                  >
                    {validationError}
                  </p>
                )}

                <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#E7EEF3] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={step === 0}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DCE8EF] bg-white px-4 py-3 text-sm font-semibold text-[#00466D] hover:bg-[#F5F9FC] disabled:opacity-40"
                  >
                    <ChevronLeft size={17} />
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#00466D] px-5 py-3 text-sm font-semibold text-white hover:bg-[#003650]"
                  >
                    {step === STEPS.length - 1
                      ? 'Generate my CV'
                      : 'Save and continue'}

                    {step === STEPS.length - 1 ? (
                      <Sparkles size={17} />
                    ) : (
                      <ArrowRight size={17} />
                    )}
                  </button>
                </div>
              </div>
            </section>

            <aside className="space-y-5">
              <section className="rounded-2xl border border-[#DCE8EF] bg-white p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF5FC] text-[#1E92D2]">
                    <FileText size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold">Your CV sections</h2>
                    <p className="text-xs text-slate-500">
                      {completedSteps} of {STEPS.length} completed
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  {STEPS.map((item, index) => {
                    const StepIcon = item.icon;
                    const complete = isStepComplete(item.id);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setStep(index);
                          setValidationError('');
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-[#F5F9FC]"
                      >
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: complete
                              ? '#E6F6ED'
                              : '#F5F8FA',
                            color: complete
                              ? '#16834A'
                              : '#7890A0',
                          }}
                        >
                          {complete ? (
                            <Check size={17} />
                          ) : (
                            <StepIcon size={17} />
                          )}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">
                            {item.shortTitle}
                          </span>

                          <span className="mt-0.5 block text-xs text-slate-400">
                            {complete
                              ? 'Information added'
                              : 'Not completed'}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-[#DCE8EF] bg-white p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF5DB] text-[#B77900]">
                  <Lightbulb size={20} />
                </div>

                <h2 className="font-bold">Make your CV stand out</h2>

                <ul className="mt-4 space-y-3">
                  {[
                    'Use clear, professional language.',
                    'Focus on achievements, not just duties.',
                    'Include skills relevant to your target role.',
                    'Keep your dates and contact details accurate.',
                  ].map((tip) => (
                    <li
                      key={tip}
                      className="flex items-start gap-2.5"
                    >
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0 text-[#1E92D2]"
                      />

                      <span className="text-sm leading-5 text-slate-600">
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="flex items-start gap-3 rounded-xl border border-[#DCE8EF] bg-[#EEF7FC] p-4">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-[#1E92D2]"
                />

                <div>
                  <p className="text-sm font-semibold text-[#00466D]">
                    {saveStatus}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#315A70]">
                    Your draft stays in this browser on this device.
                    It is not yet saved to your TruCity account.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 hover:bg-white hover:text-[#00466D]"
              >
                <RotateCcw size={16} />
                Start a new CV
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}