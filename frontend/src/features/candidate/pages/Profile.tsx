import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  Code2,
  FileCheck2,
  FileText,
  Image,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
  Video,
  X,
} from 'lucide-react';

/* =========================================================
   TYPES
========================================================= */

export interface ProfileProps {
  onLogout?: () => void;
}

type ProfileTab =
  | 'profile'
  | 'documents'
  | 'gallery'
  | 'projects'
  | 'preferences';

interface DocItem {
  id: number;
  name: string;

  status:
    | 'verified'
    | 'pending'
    | 'none';

  fileName?: string;
  fileSize?: string;
}

interface ProjectItem {
  id: number;
  name: string;
  tech: string;
  status: string;
  desc: string;
}

interface ProfileForm {
  headline: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  skills: string[];
}

interface IntroReelMeta {
  fileName: string;
  fileSize: string;
  uploadedAt: string;
}

type GalleryImageCategory =
  | 'front'
  | 'side'
  | 'back'
  | 'professional'
  | 'project'
  | 'certificate'
  | 'other';

interface GalleryImage {
  id: string;
  name: string;
  category: GalleryImageCategory;
  image: string;
  uploadedAt: string;
}

/* =========================================================
   STORAGE KEYS
========================================================= */

const FACE_PHOTO_STORAGE_KEY =
  'trucity-profile-face-photo';

const GALLERY_STORAGE_KEY =
  'trucity-profile-gallery';

const INTRO_REEL_META_STORAGE_KEY =
  'trucity-intro-reel-meta';

/* =========================================================
   DEFAULT DATA
========================================================= */

const DEFAULT_DOCS: DocItem[] = [
  {
    id: 1,
    name: 'SA ID Document',
    status: 'none',
  },
  {
    id: 2,
    name: 'Matric Certificate',
    status: 'none',
  },
  {
    id: 3,
    name: 'Police Clearance',
    status: 'none',
  },
  {
    id: 4,
    name: 'Proof of Qualification',
    status: 'none',
  },
];

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 1,
    name: 'TruCity Mobile App',
    tech: 'React Native · TypeScript',
    status: 'Active Development',
    desc:
      'Cross-platform mobile product focused on location-aware opportunities and professional services.',
  },
  {
    id: 2,
    name: 'BLE Sensor Telemetry System',
    tech: 'C++ · ESP32-C3 · Python',
    status: 'Completed',
    desc:
      'Embedded telemetry project transmitting real-time device data over Bluetooth Low Energy.',
  },
  {
    id: 3,
    name: 'Hospital Management System',
    tech: 'Java · PostgreSQL',
    status: 'Completed',
    desc:
      'Relational application for structured patient, appointment and administrative record management.',
  },
];

/* =========================================================
   STORAGE HELPERS
========================================================= */

function getStoredValue(
  key: string,
) {
  try {
    return localStorage.getItem(
      key,
    );
  } catch {
    return null;
  }
}

function imageFileToDataUrl(
  file: File,
) {
  return new Promise<string>(
    (
      resolve,
      reject,
    ) => {
      const reader =
        new FileReader();

      reader.onload =
        () => {
          if (
            typeof reader.result ===
            'string'
          ) {
            resolve(
              reader.result,
            );

            return;
          }

          reject(
            new Error(
              'Unable to read image file.',
            ),
          );
        };

      reader.onerror =
        () => {
          reject(
            new Error(
              'Unable to read image file.',
            ),
          );
        };

      reader.readAsDataURL(
        file,
      );
    },
  );
}

function createGalleryId() {
  if (
    typeof crypto !==
      'undefined' &&
    'randomUUID' in
      crypto
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

/* =========================================================
   MAIN PROFILE
========================================================= */

export function Profile({
  onLogout: _onLogout,
}: ProfileProps) {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<ProfileTab>(
      'profile',
    );

  /* =======================================================
     PROFILE PHOTO
  ======================================================= */

  const [
    facePhoto,
    setFacePhoto,
  ] =
    useState<
      string | null
    >(
      () =>
        getStoredValue(
          FACE_PHOTO_STORAGE_KEY,
        ),
    );

  /* =======================================================
     GALLERY
  ======================================================= */

  const [
    galleryImages,
    setGalleryImages,
  ] =
    useState<
      GalleryImage[]
    >(() => {
      try {
        const stored =
          localStorage.getItem(
            GALLERY_STORAGE_KEY,
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
            item,
          ): item is GalleryImage => {
            if (
              !item ||
              typeof item !==
                'object'
            ) {
              return false;
            }

            const candidate =
              item as Partial<GalleryImage>;

            return (
              typeof candidate.id ===
                'string' &&
              typeof candidate.name ===
                'string' &&
              typeof candidate.image ===
                'string' &&
              typeof candidate.uploadedAt ===
                'string' &&
              typeof candidate.category ===
                'string'
            );
          },
        );
      } catch {
        return [];
      }
    });

  useEffect(
    () => {
      try {
        localStorage.setItem(
          GALLERY_STORAGE_KEY,
          JSON.stringify(
            galleryImages,
          ),
        );
      } catch (
        error
      ) {
        console.error(
          'Unable to persist gallery images:',
          error,
        );
      }
    },
    [
      galleryImages,
    ],
  );

  /* =======================================================
     DOCUMENTS
  ======================================================= */

  const [
    docs,
    setDocs,
  ] =
    useState<DocItem[]>(
      DEFAULT_DOCS,
    );

  /* =======================================================
     PROJECTS
  ======================================================= */

  const [
    projects,
    setProjects,
  ] =
    useState<
      ProjectItem[]
    >(
      DEFAULT_PROJECTS,
    );

  /* =======================================================
     INTRO REEL
  ======================================================= */

  const [
    reelMeta,
    setReelMeta,
  ] =
    useState<
      IntroReelMeta | null
    >(() => {
      try {
        const stored =
          localStorage.getItem(
            INTRO_REEL_META_STORAGE_KEY,
          );

        return stored
          ? JSON.parse(
              stored,
            )
          : null;
      } catch {
        return null;
      }
    });

  const [
    reelPreviewUrl,
    setReelPreviewUrl,
  ] =
    useState<
      string | null
    >(null);

  useEffect(
    () => {
      try {
        if (
          reelMeta
        ) {
          localStorage.setItem(
            INTRO_REEL_META_STORAGE_KEY,
            JSON.stringify(
              reelMeta,
            ),
          );

          return;
        }

        localStorage.removeItem(
          INTRO_REEL_META_STORAGE_KEY,
        );
      } catch (
        error
      ) {
        console.error(
          'Unable to persist intro reel metadata:',
          error,
        );
      }
    },
    [
      reelMeta,
    ],
  );

  useEffect(
    () => {
      return () => {
        if (
          reelPreviewUrl
        ) {
          URL.revokeObjectURL(
            reelPreviewUrl,
          );
        }
      };
    },
    [
      reelPreviewUrl,
    ],
  );

  /* =======================================================
     COUNTS
  ======================================================= */

  const uploadedDocuments =
    docs.filter(
      (
        document,
      ) =>
        document.status !==
        'none',
    ).length;

  const activeProjectsCount =
    projects.filter(
      (
        project,
      ) =>
        project.status ===
        'Active Development',
    ).length;

  const sections: {
    id: ProfileTab;
    label: string;
    badge?: string;
  }[] = [
    {
      id: 'profile',
      label: 'Profile',
    },
    {
      id: 'documents',
      label: 'Documents',
      badge:
        `${uploadedDocuments}/${docs.length}`,
    },
    {
      id: 'gallery',
      label: 'Gallery',
      badge:
        galleryImages.length >
        0
          ? String(
              galleryImages.length,
            )
          : undefined,
    },
    {
      id: 'projects',
      label: 'Projects',
      badge:
        projects.length > 0
          ? String(
              projects.length,
            )
          : undefined,
    },
    {
      id: 'preferences',
      label: 'Preferences',
    },
  ];

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-brand-bg
        pb-16
        text-brand-text
      "
    >
      {/* =====================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            -right-[190px]
            -top-[140px]
            hidden
            h-[430px]
            w-[430px]
            rounded-full
            border-[64px]
            border-brand-gold/55
            lg:block
          "
        />

        <div
          className="
            absolute
            -bottom-[260px]
            -left-[220px]
            hidden
            h-[500px]
            w-[500px]
            rounded-full
            bg-brand-orange/35
            lg:block
          "
        />
      </div>

      {/* =====================================================
          PAGE
      ====================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1180px]
          space-y-6
          px-4
          py-8
          sm:px-6
          lg:px-8
        "
      >
        {/* =================================================
            PROFILE HEADER
        ================================================== */}

        <ProfileHeader
          facePhoto={
            facePhoto
          }
          setFacePhoto={
            setFacePhoto
          }
          reelMeta={
            reelMeta
          }
          setReelMeta={
            setReelMeta
          }
          reelPreviewUrl={
            reelPreviewUrl
          }
          setReelPreviewUrl={
            setReelPreviewUrl
          }
        />

        {/* =================================================
            INTERNAL PROFILE NAV
        ================================================== */}

        <nav
          aria-label="Profile sections"
          className="
            sticky
            top-[104px]
            z-30
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
          >
            {sections.map(
              (
                section,
              ) => {
                const isActive =
                  activeTab ===
                  section.id;

                return (
                  <button
                    key={
                      section.id
                    }
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        section.id,
                      )
                    }
                    className={`
                      flex
                      shrink-0
                      items-center
                      justify-center
                      gap-2
                      rounded-[13px]
                      px-4
                      py-2.5
                      text-xs
                      font-bold
                      transition

                      ${
                        isActive
                          ? 'bg-brand-primary text-white shadow-sm'
                          : 'text-brand-textMuted hover:bg-brand-bg hover:text-brand-primary'
                      }
                    `}
                  >
                    {
                      section.label
                    }

                    {section.badge && (
                      <span
                        className={`
                          rounded-full
                          px-2
                          py-0.5
                          text-[9px]
                          font-bold

                          ${
                            isActive
                              ? 'bg-white/15 text-white'
                              : 'bg-[#eef8fd] text-brand-primary'
                          }
                        `}
                      >
                        {
                          section.badge
                        }
                      </span>
                    )}
                  </button>
                );
              },
            )}
          </div>
        </nav>

        {/* =================================================
            TAB CONTENT
        ================================================== */}

        <main className="min-h-[420px]">
          {activeTab ===
            'profile' && (
            <ProfileDetails />
          )}

          {activeTab ===
            'documents' && (
            <DocumentsSection
              docs={
                docs
              }
              setDocs={
                setDocs
              }
            />
          )}

          {activeTab ===
            'gallery' && (
            <GallerySection
              images={
                galleryImages
              }
              setImages={
                setGalleryImages
              }
            />
          )}

          {activeTab ===
            'projects' && (
            <ProjectsSection
              projects={
                projects
              }
              setProjects={
                setProjects
              }
              activeCount={
                activeProjectsCount
              }
            />
          )}

          {activeTab ===
            'preferences' && (
            <PreferencesSection />
          )}
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE HEADER
========================================================= */

interface ProfileHeaderProps {
  facePhoto:
    string | null;

  setFacePhoto: (
    value:
      string | null,
  ) => void;

  reelMeta:
    IntroReelMeta | null;

  setReelMeta:
    React.Dispatch<
      React.SetStateAction<
        IntroReelMeta | null
      >
    >;

  reelPreviewUrl:
    string | null;

  setReelPreviewUrl:
    React.Dispatch<
      React.SetStateAction<
        string | null
      >
    >;
}

function ProfileHeader({
  facePhoto,
  setFacePhoto,
  reelMeta,
  setReelMeta,
  reelPreviewUrl,
  setReelPreviewUrl,
}: ProfileHeaderProps) {
  const faceInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const reelInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  /* =======================================================
     FACE PHOTO
  ======================================================= */

  const handleFaceChange =
    async (
      event:
        React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          'image/',
        )
      ) {
        return;
      }

      try {
        const image =
          await imageFileToDataUrl(
            file,
          );

        setFacePhoto(
          image,
        );

        localStorage.setItem(
          FACE_PHOTO_STORAGE_KEY,
          image,
        );
      } catch (
        error
      ) {
        console.error(
          'Unable to update profile photo:',
          error,
        );
      }
    };

  /* =======================================================
     INTRO REEL COVER
  ======================================================= */

  const handleReelChange = (
    event:
      React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target
        .files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        'video/',
      )
    ) {
      return;
    }

    if (
      reelPreviewUrl
    ) {
      URL.revokeObjectURL(
        reelPreviewUrl,
      );
    }

    const previewUrl =
      URL.createObjectURL(
        file,
      );

    setReelPreviewUrl(
      previewUrl,
    );

    setReelMeta({
      fileName:
        file.name,

      fileSize:
        `${(
          file.size /
          (1024 * 1024)
        ).toFixed(
          1,
        )} MB`,

      uploadedAt:
        new Date().toISOString(),
    });

    if (
      reelInputRef.current
    ) {
      reelInputRef.current.value =
        '';
    }
  };

  const handleRemoveReel =
    () => {
      if (
        reelPreviewUrl
      ) {
        URL.revokeObjectURL(
          reelPreviewUrl,
        );
      }

      setReelPreviewUrl(
        null,
      );

      setReelMeta(
        null,
      );

      if (
        reelInputRef.current
      ) {
        reelInputRef.current.value =
          '';
      }
    };

  return (
    <section
      className="
        overflow-hidden
        rounded-[28px]
        border
        border-brand-border
        bg-white
        shadow-[0_18px_50px_rgba(0,70,109,0.08)]
      "
    >
      {/* =====================================================
          INTRO REEL BACKGROUND
      ====================================================== */}

      <div
        className="
          group
          relative
          h-[240px]
          overflow-hidden
          bg-brand-dark
          sm:h-[320px]
        "
      >
        <input
          ref={
            reelInputRef
          }
          type="file"
          accept="video/*"
          onChange={
            handleReelChange
          }
          className="hidden"
        />

        {reelPreviewUrl ? (
          <video
            src={
              reelPreviewUrl
            }
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            className="
              h-full
              w-full
              object-cover
              object-center
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              bg-brand-primary
            "
          >
            <div
              className="
                px-6
                text-center
                text-white
              "
            >
              <div
                className="
                  mx-auto
                  grid
                  h-14
                  w-14
                  place-items-center
                  rounded-full
                  border
                  border-white/30
                  bg-white/10
                "
              >
                <Video className="h-6 w-6" />
              </div>

              <p
                className="
                  mt-4
                  text-sm
                  font-bold
                "
              >
                {reelMeta
                  ? 'Intro reel saved'
                  : 'Add your intro reel'}
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-white/75
                "
              >
                Your intro reel appears as your profile cover.
              </p>
            </div>
          </div>
        )}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-brand-dark/75
            via-brand-dark/5
            to-black/10
          "
        />

        <div
          className="
            absolute
            right-4
            top-4
            flex
            gap-2
          "
        >
          <button
            type="button"
            onClick={() =>
              reelInputRef.current?.click()
            }
            className="
              inline-flex
              items-center
              gap-2
              rounded-[12px]
              border
              border-white/70
              bg-white/90
              px-3
              py-2
              text-xs
              font-bold
              text-brand-primary
              shadow-sm
              backdrop-blur-md
              transition
              sm:opacity-0
              sm:group-hover:opacity-100
            "
          >
            <Video className="h-4 w-4" />

            {reelMeta
              ? 'Change reel'
              : 'Upload reel'}
          </button>

          {reelMeta && (
            <button
              type="button"
              onClick={
                handleRemoveReel
              }
              aria-label="Remove intro reel"
              className="
                grid
                h-9
                w-9
                place-items-center
                rounded-[12px]
                border
                border-white/70
                bg-white/90
                text-brand-crimson
                shadow-sm
                backdrop-blur-md
                transition
                sm:opacity-0
                sm:group-hover:opacity-100
              "
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div
          className="
            absolute
            bottom-4
            right-4
            rounded-full
            border
            border-white/30
            bg-brand-dark/60
            px-3
            py-1.5
            text-[10px]
            font-bold
            text-white
            backdrop-blur-md
          "
        >
          Intro Reel
        </div>
      </div>

      {/* =====================================================
          PROFILE IDENTITY
      ====================================================== */}

      <div
        className="
          px-5
          pb-6
          sm:px-7
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-end
          "
        >
          {/* FACE PROFILE PICTURE */}

          <div
            className="
              relative
              -mt-14
              shrink-0
            "
          >
            <input
              ref={
                faceInputRef
              }
              type="file"
              accept="image/*"
              onChange={
                handleFaceChange
              }
              className="hidden"
            />

            <button
              type="button"
              onClick={() =>
                faceInputRef.current?.click()
              }
              aria-label="Change profile picture"
              className="
                group
                relative
                h-28
                w-28
                overflow-hidden
                rounded-[24px]
                border-4
                border-white
                bg-brand-bg
                shadow-[0_12px_30px_rgba(0,70,109,0.18)]
              "
            >
              {facePhoto ? (
                <img
                  src={
                    facePhoto
                  }
                  alt="Profile"
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />
              ) : (
                <div
                  className="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                    text-xl
                    font-bold
                    text-brand-primary
                  "
                >
                  LN
                </div>
              )}

              <div
                className="
                  absolute
                  inset-0
                  flex
                  items-center
                  justify-center
                  bg-brand-primary/70
                  opacity-0
                  transition
                  group-hover:opacity-100
                "
              >
                <Camera className="h-5 w-5 text-white" />
              </div>
            </button>
          </div>

          {/* USER INFORMATION */}

          <div
            className="
              min-w-0
              flex-1
              pb-1
            "
          >
            <h1
              className="
                !m-0
                text-2xl
                font-bold
                tracking-[-0.025em]
                !text-brand-primary
              "
            >
              Luthando
            </h1>

            <p
              className="
                mt-1
                text-sm
                font-bold
                text-brand-textMuted
              "
            >
              Software Engineer · Mobile & Web Development
            </p>

            <div
              className="
                mt-2
                flex
                flex-wrap
                items-center
                gap-x-4
                gap-y-1.5
                text-xs
                text-brand-textMuted
              "
            >
              <span
                className="
                  flex
                  items-center
                  gap-1.5
                "
              >
                <MapPin className="h-3.5 w-3.5" />

                Johannesburg, Gauteng
              </span>

              <span
                className="
                  flex
                  items-center
                  gap-1.5
                "
              >
                <BriefcaseBusiness className="h-3.5 w-3.5" />

                Open to opportunities
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PROFILE DETAILS
========================================================= */

function ProfileDetails() {
  const [
    editing,
    setEditing,
  ] =
    useState(false);

  const [
    form,
    setForm,
  ] =
    useState<ProfileForm>({
      headline:
        'Software Developer · Full-Stack & Embedded Systems',

      email:
        'luthando.dev@gmail.com',

      phone:
        '081 234 5678',

      location:
        'Johannesburg, Gauteng',

      bio:
        'Software development graduate with experience across mobile, web and embedded systems. Skilled in React Native, TypeScript, Node.js, Java and database-driven applications, with a strong interest in building reliable digital products and practical technology solutions.',

      skills: [
        'React Native',
        'TypeScript',
        'Node.js',
        'Java',
        'PostgreSQL',
        'Git',
        'C++ / IoT',
      ],
    });

  const [
    newSkill,
    setNewSkill,
  ] =
    useState('');

  const handleAddSkill =
    () => {
      const value =
        newSkill.trim();

      if (
        !value ||
        form.skills.includes(
          value,
        )
      ) {
        return;
      }

      setForm({
        ...form,

        skills: [
          ...form.skills,
          value,
        ],
      });

      setNewSkill('');
    };

  const handleRemoveSkill =
    (
      skill: string,
    ) => {
      setForm({
        ...form,

        skills:
          form.skills.filter(
            (
              item,
            ) =>
              item !==
              skill,
          ),
      });
    };

  if (
    editing
  ) {
    return (
      <form
        onSubmit={(
          event,
        ) => {
          event.preventDefault();

          setEditing(
            false,
          );
        }}
        className="
          max-w-[820px]
          rounded-[26px]
          border
          border-brand-border
          bg-white
          p-5
          shadow-[0_16px_40px_rgba(0,70,109,0.07)]
          sm:p-6
        "
      >
        <div
          className="
            mb-6
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-brand-border
            pb-4
          "
        >
          <div>
            <h2
              className="
                !m-0
                text-lg
                font-bold
                !text-brand-primary
              "
            >
              Edit profile
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-brand-textMuted
              "
            >
              Keep your employment information accurate and up to date.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setEditing(
                false,
              )
            }
            className="
              grid
              h-9
              w-9
              place-items-center
              rounded-xl
              border
              border-brand-border
              text-brand-textMuted
              transition
              hover:border-brand-primary
              hover:text-brand-primary
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5">
          <FormField
            label="Professional headline"
            value={
              form.headline
            }
            onChange={(
              value,
            ) =>
              setForm({
                ...form,

                headline:
                  value,
              })
            }
          />

          <div>
            <label
              className="
                mb-1.5
                block
                text-xs
                font-bold
                text-brand-textMuted
              "
            >
              About
            </label>

            <textarea
              value={
                form.bio
              }
              onChange={(
                event,
              ) =>
                setForm({
                  ...form,

                  bio:
                    event.target.value,
                })
              }
              className="
                min-h-[130px]
                w-full
                resize-y
                rounded-[14px]
                border
                border-brand-border
                bg-brand-bg
                px-4
                py-3
                text-sm
                leading-6
                text-brand-text
                outline-none
                transition
                focus:border-brand-accent
                focus:ring-4
                focus:ring-[#1e92d2]/10
              "
            />
          </div>

          <div
            className="
              grid
              gap-4
              sm:grid-cols-2
            "
          >
            <FormField
              label="Email"
              value={
                form.email
              }
              onChange={(
                value,
              ) =>
                setForm({
                  ...form,

                  email:
                    value,
                })
              }
            />

            <FormField
              label="Phone"
              value={
                form.phone
              }
              onChange={(
                value,
              ) =>
                setForm({
                  ...form,

                  phone:
                    value,
                })
              }
            />
          </div>

          <FormField
            label="Location"
            value={
              form.location
            }
            onChange={(
              value,
            ) =>
              setForm({
                ...form,

                location:
                  value,
              })
            }
          />

          <div>
            <label
              className="
                mb-1.5
                block
                text-xs
                font-bold
                text-brand-textMuted
              "
            >
              Skills
            </label>

            <div className="flex gap-2">
              <input
                value={
                  newSkill
                }
                onChange={(
                  event,
                ) =>
                  setNewSkill(
                    event.target.value,
                  )
                }
                onKeyDown={(
                  event,
                ) => {
                  if (
                    event.key ===
                    'Enter'
                  ) {
                    event.preventDefault();

                    handleAddSkill();
                  }
                }}
                placeholder="Add a skill"
                className="
                  min-w-0
                  flex-1
                  rounded-[14px]
                  border
                  border-brand-border
                  bg-brand-bg
                  px-4
                  py-3
                  text-sm
                  outline-none
                  transition
                  focus:border-brand-accent
                  focus:ring-4
                  focus:ring-[#1e92d2]/10
                "
              />

              <button
                type="button"
                onClick={
                  handleAddSkill
                }
                className="
                  rounded-[14px]
                  border
                  border-brand-primary
                  bg-white
                  px-4
                  text-xs
                  font-bold
                  text-brand-primary
                  transition
                  hover:bg-brand-primary
                  hover:text-white
                "
              >
                Add
              </button>
            </div>

            <div
              className="
                mt-3
                flex
                flex-wrap
                gap-2
              "
            >
              {form.skills.map(
                (
                  skill,
                ) => (
                  <span
                    key={
                      skill
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-[#b9d9ea]
                      bg-[#eef8fd]
                      px-3
                      py-1.5
                      text-xs
                      font-bold
                      text-brand-primary
                    "
                  >
                    {skill}

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveSkill(
                          skill,
                        )
                      }
                      className="
                        text-brand-textMuted
                        hover:text-brand-crimson
                      "
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        <div
          className="
            mt-6
            flex
            justify-end
            border-t
            border-brand-border
            pt-5
          "
        >
          <button
            type="submit"
            className="
              inline-flex
              min-h-[46px]
              items-center
              justify-center
              gap-2
              rounded-[14px]
              bg-brand-primary
              px-5
              text-sm
              font-bold
              text-white
              transition
              hover:bg-brand-dark
            "
          >
            <Save className="h-4 w-4" />

            Save changes
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      className="
        grid
        gap-6
        lg:grid-cols-[minmax(0,1fr)_330px]
      "
    >
      <div className="space-y-5">
        <section
          className="
            rounded-[24px]
            border
            border-brand-border
            bg-white
            p-5
            shadow-[0_14px_34px_rgba(0,70,109,0.06)]
            sm:p-6
          "
        >
          <div
            className="
              mb-4
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <SectionTitle
              icon={
                <UserRound className="h-4 w-4" />
              }
            >
              About
            </SectionTitle>

            <button
              type="button"
              onClick={() =>
                setEditing(
                  true,
                )
              }
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-xl
                border
                border-brand-border
                bg-white
                px-3
                py-2
                text-xs
                font-bold
                text-brand-textMuted
                transition
                hover:border-brand-primary
                hover:text-brand-primary
              "
            >
              <Pencil className="h-3.5 w-3.5" />

              Edit
            </button>
          </div>

          <h3
            className="
              text-sm
              font-bold
              text-brand-primary
            "
          >
            {
              form.headline
            }
          </h3>

          <p
            className="
              mt-3
              text-sm
              leading-6
              text-brand-textMuted
            "
          >
            {
              form.bio
            }
          </p>
        </section>

        <section
          className="
            rounded-[24px]
            border
            border-brand-border
            bg-white
            p-5
            shadow-[0_14px_34px_rgba(0,70,109,0.06)]
            sm:p-6
          "
        >
          <SectionTitle
            icon={
              <Code2 className="h-4 w-4" />
            }
          >
            Skills & Competencies
          </SectionTitle>

          <div
            className="
              mt-4
              flex
              flex-wrap
              gap-2
            "
          >
            {form.skills.map(
              (
                skill,
              ) => (
                <span
                  key={
                    skill
                  }
                  className="
                    rounded-[10px]
                    border
                    border-brand-border
                    bg-brand-bg
                    px-3
                    py-2
                    text-xs
                    font-bold
                    text-brand-textMuted
                  "
                >
                  {skill}
                </span>
              ),
            )}
          </div>
        </section>
      </div>

      <aside
        className="
          rounded-[24px]
          border
          border-brand-border
          bg-white
          p-5
          shadow-[0_14px_34px_rgba(0,70,109,0.06)]
          sm:p-6
        "
      >
        <SectionTitle
          icon={
            <Mail className="h-4 w-4" />
          }
        >
          Contact Information
        </SectionTitle>

        <div className="mt-5 space-y-5">
          <ContactRow
            icon={
              <Mail className="h-4 w-4" />
            }
            label="Email"
            value={
              form.email
            }
          />

          <ContactRow
            icon={
              <Phone className="h-4 w-4" />
            }
            label="Phone"
            value={
              form.phone
            }
          />

          <ContactRow
            icon={
              <MapPin className="h-4 w-4" />
            }
            label="Location"
            value={
              form.location
            }
          />
        </div>
      </aside>
    </div>
  );
}

/* =========================================================
   GALLERY
========================================================= */

interface GallerySectionProps {
  images:
    GalleryImage[];

  setImages:
    React.Dispatch<
      React.SetStateAction<
        GalleryImage[]
      >
    >;
}

function GallerySection({
  images,
  setImages,
}: GallerySectionProps) {
  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<GalleryImageCategory>(
      'professional',
    );

  const [
    selectedImage,
    setSelectedImage,
  ] =
    useState<
      GalleryImage | null
    >(null);

  const categories: {
    value:
      GalleryImageCategory;

    label:
      string;
  }[] = [
    {
      value:
        'professional',

      label:
        'Professional',
    },
    {
      value:
        'front',

      label:
        'Full Body · Front',
    },
    {
      value:
        'side',

      label:
        'Full Body · Side',
    },
    {
      value:
        'back',

      label:
        'Full Body · Back',
    },
    {
      value:
        'project',

      label:
        'Project',
    },
    {
      value:
        'certificate',

      label:
        'Certificate',
    },
    {
      value:
        'other',

      label:
        'Other',
    },
  ];

  const categoryLabel = (
    category:
      GalleryImageCategory,
  ) =>
    categories.find(
      (
        item,
      ) =>
        item.value ===
        category,
    )?.label ??
    'Other';

  const handleUpload =
    async (
      event:
        React.ChangeEvent<HTMLInputElement>,
    ) => {
      const files =
        Array.from(
          event.target
            .files ??
            [],
        );

      if (
        files.length ===
        0
      ) {
        return;
      }

      const imageFiles =
        files.filter(
          (
            file,
          ) =>
            file.type.startsWith(
              'image/',
            ),
        );

      if (
        imageFiles.length ===
        0
      ) {
        return;
      }

      try {
        const uploaded =
          await Promise.all(
            imageFiles.map(
              async (
                file,
              ): Promise<GalleryImage> => {
                const image =
                  await imageFileToDataUrl(
                    file,
                  );

                return {
                  id:
                    createGalleryId(),

                  name:
                    file.name,

                  category:
                    selectedCategory,

                  image,

                  uploadedAt:
                    new Date().toISOString(),
                };
              },
            ),
          );

        setImages(
          (
            current,
          ) => [
            ...uploaded,
            ...current,
          ],
        );
      } catch (
        error
      ) {
        console.error(
          'Unable to upload gallery images:',
          error,
        );
      }

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          '';
      }
    };

  const handleDelete = (
    id: string,
  ) => {
    setImages(
      (
        current,
      ) =>
        current.filter(
          (
            image,
          ) =>
            image.id !==
            id,
        ),
    );

    setSelectedImage(
      (
        current,
      ) =>
        current?.id ===
        id
          ? null
          : current,
    );
  };

  const updateCategory = (
    id: string,
    category:
      GalleryImageCategory,
  ) => {
    setImages(
      (
        current,
      ) =>
        current.map(
          (
            image,
          ) =>
            image.id ===
            id
              ? {
                  ...image,

                  category,
                }
              : image,
        ),
    );

    setSelectedImage(
      (
        current,
      ) =>
        current?.id ===
        id
          ? {
              ...current,

              category,
            }
          : current,
    );
  };

  const frontCount =
    images.filter(
      (
        image,
      ) =>
        image.category ===
        'front',
    ).length;

  const sideCount =
    images.filter(
      (
        image,
      ) =>
        image.category ===
        'side',
    ).length;

  const backCount =
    images.filter(
      (
        image,
      ) =>
        image.category ===
        'back',
    ).length;

  return (
    <>
      <section
        className="
          overflow-hidden
          rounded-[26px]
          border
          border-brand-border
          bg-white
          shadow-[0_16px_40px_rgba(0,70,109,0.07)]
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            gap-5
            border-b
            border-brand-border
            p-5
            sm:flex-row
            sm:items-end
            sm:justify-between
            sm:p-6
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
              Profile Media
            </p>

            <h2
              className="
                !m-0
                mt-1
                text-xl
                font-bold
                !text-brand-primary
              "
            >
              Gallery
            </h2>

            <p
              className="
                mt-2
                max-w-[680px]
                text-sm
                leading-6
                text-brand-textMuted
              "
            >
              Store all professional profile images here, including
              front, side and back full-body images, professional
              photos, project images, certificates and other relevant
              visual media.
            </p>
          </div>

          <span
            className="
              shrink-0
              rounded-full
              border
              border-brand-border
              bg-brand-bg
              px-3
              py-1.5
              text-[10px]
              font-bold
              text-brand-primary
            "
          >
            {images.length}{' '}

            {images.length ===
            1
              ? 'image'
              : 'images'}
          </span>
        </div>

        {/* BODY PHOTO STATUS */}

        <div
          className="
            grid
            gap-3
            border-b
            border-brand-border
            bg-brand-bg
            p-5
            sm:grid-cols-3
            sm:p-6
          "
        >
          <BodyViewStatus
            label="Front View"
            complete={
              frontCount > 0
            }
            count={
              frontCount
            }
          />

          <BodyViewStatus
            label="Side View"
            complete={
              sideCount > 0
            }
            count={
              sideCount
            }
          />

          <BodyViewStatus
            label="Back View"
            complete={
              backCount > 0
            }
            count={
              backCount
            }
          />
        </div>

        {/* UPLOAD CONTROLS */}

        <div
          className="
            border-b
            border-brand-border
            p-5
            sm:p-6
          "
        >
          <input
            ref={
              fileInputRef
            }
            type="file"
            accept="image/*"
            multiple
            onChange={
              handleUpload
            }
            className="hidden"
          />

          <div
            className="
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-end
            "
          >
            <div
              className="
                min-w-0
                flex-1
              "
            >
              <label
                className="
                  mb-1.5
                  block
                  text-xs
                  font-bold
                  text-brand-primary
                "
              >
                Image type
              </label>

              <select
                value={
                  selectedCategory
                }
                onChange={(
                  event,
                ) =>
                  setSelectedCategory(
                    event.target
                      .value as GalleryImageCategory,
                  )
                }
                className="
                  min-h-[46px]
                  w-full
                  rounded-[14px]
                  border
                  border-brand-border
                  bg-white
                  px-4
                  text-sm
                  text-brand-text
                  outline-none
                  transition
                  focus:border-brand-accent
                  focus:ring-4
                  focus:ring-[#1e92d2]/10
                "
              >
                {categories.map(
                  (
                    category,
                  ) => (
                    <option
                      key={
                        category.value
                      }
                      value={
                        category.value
                      }
                    >
                      {
                        category.label
                      }
                    </option>
                  ),
                )}
              </select>
            </div>

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="
                inline-flex
                min-h-[46px]
                items-center
                justify-center
                gap-2
                rounded-[14px]
                bg-brand-primary
                px-5
                text-sm
                font-bold
                text-white
                shadow-[0_8px_20px_rgba(0,70,109,0.14)]
                transition
                hover:bg-brand-dark
              "
            >
              <Upload className="h-4 w-4" />

              Upload images
            </button>
          </div>

          <p
            className="
              mt-3
              text-xs
              leading-5
              text-brand-textMuted
            "
          >
            Multiple images can be selected at once. Choose the image
            type first so uploaded images are organised correctly.
          </p>
        </div>

        {/* IMAGE GRID */}

        <div className="p-5 sm:p-6">
          {images.length ===
          0 ? (
            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="
                flex
                min-h-[340px]
                w-full
                flex-col
                items-center
                justify-center
                rounded-[22px]
                border
                border-dashed
                border-brand-border
                bg-brand-bg
                px-6
                text-center
                transition
                hover:border-brand-accent
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
                  border-brand-border
                  bg-white
                  text-brand-primary
                "
              >
                <Image className="h-7 w-7" />
              </div>

              <h3
                className="
                  !m-0
                  mt-5
                  text-lg
                  font-bold
                  !text-brand-primary
                "
              >
                Build your gallery
              </h3>

              <p
                className="
                  mt-2
                  max-w-[470px]
                  text-sm
                  leading-6
                  text-brand-textMuted
                "
              >
                Upload professional photos, front, side and back
                full-body images, project images, certificates and
                other profile media.
              </p>

              <span
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-[13px]
                  bg-brand-primary
                  px-5
                  py-3
                  text-xs
                  font-bold
                  text-white
                "
              >
                <Plus className="h-4 w-4" />

                Add images
              </span>
            </button>
          ) : (
            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-3
                lg:grid-cols-4
              "
            >
              {images.map(
                (
                  image,
                ) => (
                  <article
                    key={
                      image.id
                    }
                    className="
                      group
                      relative
                      overflow-hidden
                      rounded-[18px]
                      border
                      border-brand-border
                      bg-brand-bg
                      shadow-sm
                    "
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImage(
                          image,
                        )
                      }
                      className="
                        relative
                        block
                        aspect-[4/5]
                        w-full
                        overflow-hidden
                      "
                    >
                      <img
                        src={
                          image.image
                        }
                        alt={
                          image.name
                        }
                        className="
                          h-full
                          w-full
                          object-cover
                          transition
                          duration-300
                          group-hover:scale-[1.03]
                        "
                      />

                      <div
                        className="
                          absolute
                          inset-0
                          bg-brand-dark/0
                          transition
                          group-hover:bg-brand-dark/15
                        "
                      />
                    </button>

                    <div
                      className="
                        absolute
                        left-2.5
                        top-2.5
                      "
                    >
                      <span
                        className="
                          rounded-full
                          border
                          border-white/60
                          bg-white/90
                          px-2.5
                          py-1
                          text-[9px]
                          font-bold
                          text-brand-primary
                          shadow-sm
                          backdrop-blur
                        "
                      >
                        {
                          categoryLabel(
                            image.category,
                          )
                        }
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          image.id,
                        )
                      }
                      aria-label={`Delete ${image.name}`}
                      className="
                        absolute
                        right-2.5
                        top-2.5
                        grid
                        h-8
                        w-8
                        place-items-center
                        rounded-full
                        border
                        border-white/60
                        bg-white/90
                        text-brand-crimson
                        shadow-sm
                        backdrop-blur
                        transition
                        sm:opacity-0
                        sm:group-hover:opacity-100
                      "
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="p-3">
                      <p
                        className="
                          truncate
                          text-xs
                          font-bold
                          text-brand-primary
                        "
                      >
                        {
                          image.name
                        }
                      </p>

                      <p
                        className="
                          mt-1
                          text-[10px]
                          text-brand-textMuted
                        "
                      >
                        {new Date(
                          image.uploadedAt,
                        ).toLocaleDateString(
                          'en-ZA',
                          {
                            day:
                              '2-digit',

                            month:
                              'short',

                            year:
                              'numeric',
                          },
                        )}
                      </p>
                    </div>
                  </article>
                ),
              )}
            </div>
          )}
        </div>

        {/* VISIBILITY */}

        <div
          className="
            flex
            items-start
            gap-3
            border-t
            border-brand-border
            bg-brand-bg
            p-4
            sm:px-6
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

          <div>
            <p
              className="
                text-xs
                font-bold
                text-brand-primary
              "
            >
              Gallery visibility
            </p>

            <p
              className="
                mt-1
                text-[10px]
                leading-5
                text-brand-textMuted
              "
            >
              Gallery media forms part of your TruCity profile and may
              be visible to employers when you apply through Express
              Interest.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          FULL SIZE VIEWER
      ====================================================== */}

      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image"
          onClick={() =>
            setSelectedImage(
              null,
            )
          }
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-brand-dark/80
            p-4
            backdrop-blur-sm
          "
        >
          <div
            onClick={(
              event,
            ) =>
              event.stopPropagation()
            }
            className="
              relative
              max-h-[92vh]
              w-full
              max-w-[900px]
              overflow-hidden
              rounded-[24px]
              bg-white
              shadow-2xl
            "
          >
            <button
              type="button"
              onClick={() =>
                setSelectedImage(
                  null,
                )
              }
              aria-label="Close image"
              className="
                absolute
                right-3
                top-3
                z-20
                grid
                h-10
                w-10
                place-items-center
                rounded-full
                bg-brand-dark/75
                text-white
                backdrop-blur
              "
            >
              <X className="h-5 w-5" />
            </button>

            <div
              className="
                flex
                max-h-[72vh]
                items-center
                justify-center
                bg-brand-dark
              "
            >
              <img
                src={
                  selectedImage.image
                }
                alt={
                  selectedImage.name
                }
                className="
                  max-h-[72vh]
                  w-full
                  object-contain
                "
              />
            </div>

            <div className="p-5">
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
                <div className="min-w-0">
                  <h3
                    className="
                      truncate
                      text-sm
                      font-bold
                      text-brand-primary
                    "
                  >
                    {
                      selectedImage.name
                    }
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-brand-textMuted
                    "
                  >
                    Uploaded{' '}

                    {new Date(
                      selectedImage.uploadedAt,
                    ).toLocaleDateString(
                      'en-ZA',
                      {
                        day:
                          '2-digit',

                        month:
                          'long',

                        year:
                          'numeric',
                      },
                    )}
                  </p>
                </div>

                <select
                  value={
                    selectedImage.category
                  }
                  onChange={(
                    event,
                  ) =>
                    updateCategory(
                      selectedImage.id,

                      event.target
                        .value as GalleryImageCategory,
                    )
                  }
                  className="
                    min-h-[42px]
                    rounded-[12px]
                    border
                    border-brand-border
                    bg-white
                    px-3
                    text-xs
                    font-bold
                    text-brand-primary
                    outline-none
                    focus:border-brand-accent
                  "
                >
                  {categories.map(
                    (
                      category,
                    ) => (
                      <option
                        key={
                          category.value
                        }
                        value={
                          category.value
                        }
                      >
                        {
                          category.label
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleDelete(
                    selectedImage.id,
                  )
                }
                className="
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  text-xs
                  font-bold
                  text-brand-crimson
                "
              >
                <Trash2 className="h-4 w-4" />

                Remove from gallery
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   BODY VIEW STATUS
========================================================= */

interface BodyViewStatusProps {
  label: string;
  complete: boolean;
  count: number;
}

function BodyViewStatus({
  label,
  complete,
  count,
}: BodyViewStatusProps) {
  return (
    <div
      className={`
        flex
        items-center
        gap-3
        rounded-[16px]
        border
        p-3

        ${
          complete
            ? 'border-brand-emerald bg-[#effff7]'
            : 'border-brand-border bg-white'
        }
      `}
    >
      <div
        className={`
          grid
          h-9
          w-9
          shrink-0
          place-items-center
          rounded-[11px]

          ${
            complete
              ? 'bg-brand-emerald/15 text-[#167a50]'
              : 'bg-brand-bg text-brand-textMuted'
          }
        `}
      >
        {complete ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </div>

      <div>
        <p
          className="
            text-xs
            font-bold
            text-brand-primary
          "
        >
          {label}
        </p>

        <p
          className="
            mt-0.5
            text-[10px]
            text-brand-textMuted
          "
        >
          {complete
            ? `${count} uploaded`
            : 'Not uploaded'}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   DOCUMENTS
========================================================= */

interface DocumentsSectionProps {
  docs:
    DocItem[];

  setDocs:
    React.Dispatch<
      React.SetStateAction<
        DocItem[]
      >
    >;
}

function DocumentsSection({
  docs,
  setDocs,
}: DocumentsSectionProps) {
  const fileInputRefs =
    useRef<
      Record<
        number,
        HTMLInputElement | null
      >
    >({});

  const handleFileUpload = (
    id: number,
    event:
      React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target
        .files?.[0];

    if (!file) {
      return;
    }

    const size =
      `${(
        file.size /
        (1024 * 1024)
      ).toFixed(
        2,
      )} MB`;

    setDocs(
      (
        current,
      ) =>
        current.map(
          (
            document,
          ) =>
            document.id ===
            id
              ? {
                  ...document,

                  status:
                    'pending',

                  fileName:
                    file.name,

                  fileSize:
                    size,
                }
              : document,
        ),
    );
  };

  return (
    <div
      className="
        max-w-[900px]
        space-y-5
      "
    >
      <div>
        <h2
          className="
            !m-0
            text-xl
            font-bold
            !text-brand-primary
          "
        >
          Documents
        </h2>

        <p
          className="
            mt-1
            text-sm
            text-brand-textMuted
          "
        >
          Manage supporting documents associated with your profile.
        </p>
      </div>

      <div
        className="
          flex
          items-start
          gap-3
          rounded-[18px]
          border
          border-[#b9d9ea]
          bg-[#eef8fd]
          p-4
        "
      >
        <ShieldCheck
          className="
            mt-0.5
            h-5
            w-5
            shrink-0
            text-brand-primary
          "
        />

        <p
          className="
            text-xs
            leading-5
            text-brand-textMuted
          "
        >
          Upload only documents relevant to employment or verification.
          Accepted formats are PDF, PNG and JPEG.
        </p>
      </div>

      <div className="space-y-3">
        {docs.map(
          (
            document,
          ) => (
            <article
              key={
                document.id
              }
              className="
                flex
                flex-col
                gap-4
                rounded-[20px]
                border
                border-brand-border
                bg-white
                p-4
                shadow-[0_10px_28px_rgba(0,70,109,0.05)]
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-5
              "
            >
              <input
                type="file"
                ref={(
                  element,
                ) => {
                  fileInputRefs.current[
                    document.id
                  ] =
                    element;
                }}
                onChange={(
                  event,
                ) =>
                  handleFileUpload(
                    document.id,
                    event,
                  )
                }
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
              />

              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-4
                "
              >
                <div
                  className={`
                    grid
                    h-11
                    w-11
                    shrink-0
                    place-items-center
                    rounded-[14px]
                    border

                    ${
                      document.status ===
                      'verified'
                        ? 'border-brand-emerald bg-[#effff7] text-[#167a50]'
                        : document.status ===
                            'pending'
                          ? 'border-brand-warning bg-[#fffbea] text-[#8a6a00]'
                          : 'border-brand-border bg-brand-bg text-brand-textMuted'
                    }
                  `}
                >
                  <FileText className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h3
                    className="
                      truncate
                      text-sm
                      font-bold
                      text-brand-primary
                    "
                  >
                    {
                      document.name
                    }
                  </h3>

                  {document.fileName ? (
                    <p
                      className="
                        mt-1
                        truncate
                        text-xs
                        text-brand-textMuted
                      "
                    >
                      {
                        document.fileName
                      }

                      {document.fileSize &&
                        ` · ${document.fileSize}`}
                    </p>
                  ) : (
                    <p
                      className="
                        mt-1
                        text-xs
                        text-brand-textMuted
                      "
                    >
                      No document uploaded
                    </p>
                  )}
                </div>
              </div>

              <div
                className="
                  flex
                  items-center
                  gap-3
                  self-end
                  sm:self-auto
                "
              >
                {document.status ===
                  'none' && (
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRefs.current[
                        document.id
                      ]?.click()
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-[12px]
                      border
                      border-brand-primary
                      bg-white
                      px-4
                      py-2.5
                      text-xs
                      font-bold
                      text-brand-primary
                      transition
                      hover:bg-brand-primary
                      hover:text-white
                    "
                  >
                    <Upload className="h-4 w-4" />

                    Upload
                  </button>
                )}

                {document.status ===
                  'pending' && (
                  <>
                    <span
                      className="
                        rounded-full
                        border
                        border-brand-warning
                        bg-[#fffbea]
                        px-3
                        py-1.5
                        text-[10px]
                        font-bold
                        text-[#8a6a00]
                      "
                    >
                      Under review
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRefs.current[
                          document.id
                        ]?.click()
                      }
                      className="
                        text-xs
                        font-bold
                        text-brand-primary
                        hover:underline
                      "
                    >
                      Replace
                    </button>
                  </>
                )}

                {document.status ===
                  'verified' && (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      border-brand-emerald
                      bg-[#effff7]
                      px-3
                      py-1.5
                      text-xs
                      font-bold
                      text-[#167a50]
                    "
                  >
                    <FileCheck2 className="h-4 w-4" />

                    Verified
                  </span>
                )}
              </div>
            </article>
          ),
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PROJECTS
========================================================= */

interface ProjectsSectionProps {
  projects:
    ProjectItem[];

  setProjects:
    React.Dispatch<
      React.SetStateAction<
        ProjectItem[]
      >
    >;

  activeCount:
    number;
}

function ProjectsSection({
  projects,
  setProjects,
  activeCount,
}: ProjectsSectionProps) {
  const [
    showForm,
    setShowForm,
  ] =
    useState(false);

  const [
    newProject,
    setNewProject,
  ] =
    useState({
      name:
        '',

      tech:
        '',

      status:
        'Active Development',

      desc:
        '',
    });

  const handleCreateProject = (
    event:
      React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !newProject.name.trim() ||
      !newProject.tech.trim()
    ) {
      return;
    }

    setProjects(
      (
        current,
      ) => [
        {
          id:
            Date.now(),

          ...newProject,
        },

        ...current,
      ],
    );

    setNewProject({
      name:
        '',
      tech:
        '',
      status:
        'Active Development',
      desc:
        '',
    });

    setShowForm(
      false,
    );
  };

  return (
    <div className="space-y-6">
      <div
        className="
          flex
          flex-col
          justify-between
          gap-4
          sm:flex-row
          sm:items-center
        "
      >
        <div>
          <h2
            className="
              !m-0
              text-xl
              font-bold
              !text-brand-primary
            "
          >
            Portfolio Projects
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-brand-textMuted
            "
          >
            Showcase selected work that supports your experience and skills.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowForm(
              true,
            )
          }
          className="
            inline-flex
            min-h-[44px]
            items-center
            justify-center
            gap-2
            rounded-[13px]
            bg-brand-primary
            px-4
            text-xs
            font-bold
            text-white
            transition
            hover:bg-brand-dark
          "
        >
          <Plus className="h-4 w-4" />

          Add project
        </button>
      </div>

      {activeCount >
        0 && (
        <div
          className="
            inline-flex
            rounded-full
            border
            border-[#b9d9ea]
            bg-[#eef8fd]
            px-3
            py-1.5
            text-[10px]
            font-bold
            text-brand-primary
          "
        >
          {activeCount}{' '}

          active

          {activeCount ===
          1
            ? ' project'
            : ' projects'}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={
            handleCreateProject
          }
          className="
            rounded-[24px]
            border
            border-[#b9d9ea]
            bg-white
            p-5
            shadow-[0_16px_40px_rgba(0,70,109,0.07)]
          "
        >
          <div
            className="
              mb-5
              flex
              items-center
              justify-between
            "
          >
            <h3
              className="
                !m-0
                text-base
                font-bold
                !text-brand-primary
              "
            >
              Add portfolio project
            </h3>

            <button
              type="button"
              onClick={() =>
                setShowForm(
                  false,
                )
              }
              className="
                grid
                h-8
                w-8
                place-items-center
                rounded-lg
                text-brand-textMuted
                hover:bg-brand-bg
              "
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            className="
              grid
              gap-4
              sm:grid-cols-2
            "
          >
            <FormField
              label="Project name"
              value={
                newProject.name
              }
              onChange={(
                value,
              ) =>
                setNewProject({
                  ...newProject,

                  name:
                    value,
                })
              }
            />

            <FormField
              label="Technology / tools"
              value={
                newProject.tech
              }
              onChange={(
                value,
              ) =>
                setNewProject({
                  ...newProject,

                  tech:
                    value,
                })
              }
            />
          </div>

          <div className="mt-4">
            <label
              className="
                mb-1.5
                block
                text-xs
                font-bold
                text-brand-textMuted
              "
            >
              Project summary
            </label>

            <textarea
              value={
                newProject.desc
              }
              onChange={(
                event,
              ) =>
                setNewProject({
                  ...newProject,

                  desc:
                    event.target.value,
                })
              }
              placeholder="Describe the project and your contribution."
              className="
                min-h-[100px]
                w-full
                rounded-[14px]
                border
                border-brand-border
                bg-brand-bg
                p-4
                text-sm
                outline-none
                transition
                focus:border-brand-accent
                focus:ring-4
                focus:ring-[#1e92d2]/10
              "
            />
          </div>

          <div
            className="
              mt-5
              flex
              justify-end
            "
          >
            <button
              type="submit"
              className="
                rounded-[13px]
                bg-brand-primary
                px-5
                py-2.5
                text-xs
                font-bold
                text-white
                transition
                hover:bg-brand-dark
              "
            >
              Save project
            </button>
          </div>
        </form>
      )}

      <div
        className="
          grid
          gap-4
          md:grid-cols-2
        "
      >
        {projects.map(
          (
            project,
          ) => (
            <article
              key={
                project.id
              }
              className="
                flex
                h-full
                flex-col
                rounded-[22px]
                border
                border-brand-border
                bg-white
                p-5
                shadow-[0_12px_32px_rgba(0,70,109,0.06)]
              "
            >
              <div
                className="
                  mb-4
                  flex
                  items-start
                  justify-between
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
                    bg-[#eef8fd]
                    text-brand-primary
                  "
                >
                  <Code2 className="h-5 w-5" />
                </div>

                <span
                  className={`
                    rounded-full
                    border
                    px-3
                    py-1
                    text-[10px]
                    font-bold

                    ${
                      project.status ===
                      'Active Development'
                        ? 'border-[#b9d9ea] bg-[#eef8fd] text-brand-primary'
                        : 'border-brand-emerald bg-[#effff7] text-[#167a50]'
                    }
                  `}
                >
                  {
                    project.status
                  }
                </span>
              </div>

              <h3
                className="
                  !m-0
                  text-base
                  font-bold
                  !text-brand-primary
                "
              >
                {
                  project.name
                }
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  font-bold
                  text-brand-accent
                "
              >
                {
                  project.tech
                }
              </p>

              <p
                className="
                  mt-3
                  text-sm
                  leading-6
                  text-brand-textMuted
                "
              >
                {
                  project.desc
                }
              </p>
            </article>
          ),
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PREFERENCES
========================================================= */

function PreferencesSection() {
  const [
    availability,
    setAvailability,
  ] =
    useState(
      'full-time',
    );

  const [
    saved,
    setSaved,
  ] =
    useState(false);

  const handleSave =
    () => {
      setSaved(
        true,
      );

      window.setTimeout(
        () =>
          setSaved(
            false,
          ),
        2500,
      );
    };

  return (
    <div
      className="
        max-w-[760px]
        space-y-5
      "
    >
      <section
        className="
          rounded-[24px]
          border
          border-brand-border
          bg-white
          p-5
          shadow-[0_14px_34px_rgba(0,70,109,0.06)]
          sm:p-6
        "
      >
        <h2
          className="
            !m-0
            text-lg
            font-bold
            !text-brand-primary
          "
        >
          Opportunity preferences
        </h2>

        <p
          className="
            mt-1
            text-sm
            text-brand-textMuted
          "
        >
          Choose the type of work you are currently open to.
        </p>

        <div
          className="
            mt-5
            grid
            gap-3
            sm:grid-cols-2
          "
        >
          <PreferenceCard
            selected={
              availability ===
              'full-time'
            }
            onClick={() =>
              setAvailability(
                'full-time',
              )
            }
            title="Full-time employment"
            description="Permanent employment opportunities."
          />

          <PreferenceCard
            selected={
              availability ===
              'contract'
            }
            onClick={() =>
              setAvailability(
                'contract',
              )
            }
            title="Contract / freelance"
            description="Project-based and fixed-term opportunities."
          />
        </div>
      </section>

      <div
        className="
          flex
          items-center
          gap-4
        "
      >
        <button
          type="button"
          onClick={
            handleSave
          }
          className="
            inline-flex
            min-h-[46px]
            items-center
            gap-2
            rounded-[14px]
            bg-brand-primary
            px-5
            text-sm
            font-bold
            text-white
            transition
            hover:bg-brand-dark
          "
        >
          <Save className="h-4 w-4" />

          Save preferences
        </button>

        {saved && (
          <span
            className="
              inline-flex
              items-center
              gap-1.5
              text-xs
              font-bold
              text-[#167a50]
            "
          >
            <CheckCircle2 className="h-4 w-4" />

            Preferences updated
          </span>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   SHARED COMPONENTS
========================================================= */

interface FormFieldProps {
  label: string;
  value: string;

  onChange: (
    value: string,
  ) => void;
}

function FormField({
  label,
  value,
  onChange,
}: FormFieldProps) {
  return (
    <div>
      <label
        className="
          mb-1.5
          block
          text-xs
          font-bold
          text-brand-textMuted
        "
      >
        {label}
      </label>

      <input
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        className="
          w-full
          rounded-[14px]
          border
          border-brand-border
          bg-brand-bg
          px-4
          py-3
          text-sm
          text-brand-text
          outline-none
          transition
          focus:border-brand-accent
          focus:ring-4
          focus:ring-[#1e92d2]/10
        "
      />
    </div>
  );
}

function SectionTitle({
  icon,
  children,
}: {
  icon:
    React.ReactNode;

  children:
    React.ReactNode;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        text-sm
        font-bold
        text-brand-primary
      "
    >
      {icon}

      {children}
    </div>
  );
}

interface ContactRowProps {
  icon:
    React.ReactNode;

  label: string;
  value: string;
}

function ContactRow({
  icon,
  label,
  value,
}: ContactRowProps) {
  return (
    <div
      className="
        flex
        items-start
        gap-3
      "
    >
      <div
        className="
          grid
          h-9
          w-9
          shrink-0
          place-items-center
          rounded-[11px]
          bg-[#eef8fd]
          text-brand-primary
        "
      >
        {icon}
      </div>

      <div className="min-w-0">
        <div
          className="
            text-[9px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-brand-textMuted
          "
        >
          {label}
        </div>

        <div
          className="
            mt-1
            break-words
            text-sm
            font-bold
            text-brand-text
          "
        >
          {value}
        </div>
      </div>
    </div>
  );
}

interface PreferenceCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
}

function PreferenceCard({
  selected,
  onClick,
  title,
  description,
}: PreferenceCardProps) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        flex
        items-start
        gap-3
        rounded-[18px]
        border-2
        p-4
        text-left
        transition

        ${
          selected
            ? 'border-brand-accent bg-[#eef8fd]'
            : 'border-brand-border bg-brand-bg hover:border-[#b9d9ea]'
        }
      `}
    >
      <span
        className={`
          mt-0.5
          grid
          h-5
          w-5
          shrink-0
          place-items-center
          rounded-full
          border-2

          ${
            selected
              ? 'border-brand-accent'
              : 'border-brand-border'
          }
        `}
      >
        {selected && (
          <span
            className="
              h-2.5
              w-2.5
              rounded-full
              bg-brand-accent
            "
          />
        )}
      </span>

      <span>
        <span
          className="
            block
            text-sm
            font-bold
            text-brand-primary
          "
        >
          {title}
        </span>

        <span
          className="
            mt-1
            block
            text-xs
            leading-5
            text-brand-textMuted
          "
        >
          {description}
        </span>
      </span>
    </button>
  );
}