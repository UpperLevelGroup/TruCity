import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
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

import api from '../../../api/axios';

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
  status: 'verified' | 'pending' | 'none';
  fileName?: string;
  fileSize?: string;
  dataUrl?: string;
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
  dataUrl?: string;
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
   BACKEND PROFILE STORAGE
========================================================= */

const PROFILE_ENDPOINT = '/api/candidate/profile';
const PROFILE_MEDIA_ENDPOINT = '/api/candidate/profile/media';

interface BackendCandidateProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  yearsExperience?: number | null;
  skills?: string[] | null;
}

interface BackendProfileMedia {
  facePhoto?: string | null;
  galleryImages?: GalleryImage[] | null;
  documents?: DocItem[] | null;
  projects?: ProjectItem[] | null;
  reelMeta?: IntroReelMeta | null;
  preferences?: {
    availability?: 'full-time' | 'contract';
  } | null;
}

/* =========================================================
   HELPERS
========================================================= */

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(
        new Error(
          'Unable to read image file.',
        ),
      );
    };

    reader.onerror = () => {
      reject(
        new Error(
          'Unable to read image file.',
        ),
      );
    };

    reader.readAsDataURL(file);
  });
}

function createGalleryId() {
  if (
    typeof crypto !== 'undefined' &&
    'randomUUID' in crypto
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

async function saveProfileMedia(
  patch: Partial<BackendProfileMedia>,
): Promise<void> {
  await api.put(
    PROFILE_MEDIA_ENDPOINT,
    patch,
  );
}

/* =========================================================
   MAIN PROFILE
========================================================= */

export function Profile({
  onLogout: _onLogout,
}: ProfileProps) {
  const [activeTab, setActiveTab] =
    useState<ProfileTab>('profile');

  /* =======================================================
     PROFILE PHOTO
  ======================================================= */

  const [facePhoto, setFacePhoto] =
    useState<string | null>(null);

  const [profileName, setProfileName] =
    useState('Candidate');

  const [profileHeadline, setProfileHeadline] =
    useState('Professional profile');

  const [profileLocation, setProfileLocation] =
    useState('Location not provided');

  const [profileError, setProfileError] =
    useState('');

  /* =======================================================
     GALLERY
  ======================================================= */

  const [galleryImages, setGalleryImages] =
    useState<GalleryImage[]>([]);

  /* =======================================================
     DOCUMENTS
  ======================================================= */

  const [docs, setDocs] = useState<DocItem[]>([]);

  /* =======================================================
     PROJECTS
  ======================================================= */

  const [projects, setProjects] = useState<ProjectItem[]>([]);

  /* =======================================================
     INTRO REEL
  ======================================================= */

  const [reelMeta, setReelMeta] =
    useState<IntroReelMeta | null>(null);

  const [
    reelPreviewUrl,
    setReelPreviewUrl,
  ] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setProfileError('');

        const [profileResponse, mediaResponse] =
          await Promise.all([
            api.get<BackendCandidateProfile>(
              PROFILE_ENDPOINT,
            ),
            api.get<BackendProfileMedia>(
              PROFILE_MEDIA_ENDPOINT,
            ),
          ]);

        if (!mounted) {
          return;
        }

        const profile = profileResponse.data;
        const media = mediaResponse.data;

        setProfileName(
          `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() ||
            'Candidate',
        );
        setProfileHeadline(
          profile.headline?.trim() ||
            'Professional profile',
        );
        setProfileLocation(
          profile.location?.trim() ||
            'Location not provided',
        );

        setFacePhoto(media.facePhoto ?? null);
        setGalleryImages(
          Array.isArray(media.galleryImages)
            ? media.galleryImages
            : [],
        );
        setDocs(
          Array.isArray(media.documents)
            ? media.documents
            : [],
        );
        setProjects(
          Array.isArray(media.projects)
            ? media.projects
            : [],
        );
        setReelMeta(media.reelMeta ?? null);

        if (media.reelMeta?.dataUrl) {
          setReelPreviewUrl(media.reelMeta.dataUrl);
        }

      } catch (error) {
        console.error('Unable to load candidate profile:', error);
        if (mounted) {
          setProfileError(
            'Unable to load your profile from TruCity. Please refresh and try again.',
          );
        }
      } finally {
        if (mounted) {
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (
        reelPreviewUrl &&
        reelPreviewUrl.startsWith('blob:')
      ) {
        URL.revokeObjectURL(reelPreviewUrl);
      }
    };
  }, [reelPreviewUrl]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const uploadedDocuments =
    docs.filter(
      (document) =>
        document.status !== 'none',
    ).length;

  const activeProjectsCount =
    projects.filter(
      (project) =>
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
      badge: `${uploadedDocuments}/${docs.length}`,
    },
    {
      id: 'gallery',
      label: 'Gallery',
      badge:
        galleryImages.length > 0
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
          ? String(projects.length)
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
        min-h-[100dvh]
        overflow-x-hidden
        bg-transparent
        pb-16
        font-sans
        text-brand-text
      "
    >
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
        {profileError && (
          <div className="rounded-[16px] border border-brand-crimson/20 bg-brand-crimson/5 px-4 py-3 text-[12px] font-bold text-brand-crimson">
            {profileError}
          </div>
        )}

        <ProfileHeader
          profileName={profileName}
          profileHeadline={profileHeadline}
          profileLocation={profileLocation}
          facePhoto={facePhoto}
          setFacePhoto={
            setFacePhoto
          }
          reelMeta={reelMeta}
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
            PROFILE NAV
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
          <div className="flex gap-2 overflow-x-auto">
            {sections.map(
              (section) => {
                const isActive =
                  activeTab ===
                  section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        section.id,
                      )
                    }
                    className={`
                      flex
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
                        isActive
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
                      isActive
                        ? {
                            background:
                              'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)',
                          }
                        : undefined
                    }
                  >
                    {section.label}

                    {section.badge && (
                      <span
                        className={`
                          rounded-full
                          px-2
                          py-0.5
                          text-[10px]
                          font-bold

                          ${
                            isActive
                              ? 'bg-white/15 text-white'
                              : 'bg-brand-accent/10 text-brand-primary'
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

        <main className="min-h-[420px]">
          {activeTab ===
            'profile' && (
            <ProfileDetails />
          )}

          {activeTab ===
            'documents' && (
            <DocumentsSection
              docs={docs}
              setDocs={setDocs}
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
  profileName: string;
  profileHeadline: string;
  profileLocation: string;
  facePhoto: string | null;

  setFacePhoto: (
    value: string | null,
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
  profileName,
  profileHeadline,
  profileLocation,
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

  const handleFaceChange =
    async (
      event:
        React.ChangeEvent<HTMLInputElement>,
    ) => {
      const file =
        event.target.files?.[0];

      if (
        !file ||
        !file.type.startsWith(
          'image/',
        )
      ) {
        return;
      }

      try {
        const image =
          await fileToDataUrl(file);

        setFacePhoto(image);
        await saveProfileMedia({
          facePhoto: image,
        });
      } catch (error) {
        console.error(
          'Unable to update profile photo:',
          error,
        );
      }

      event.target.value = '';
    };

  const handleReelChange = async (
    event:
      React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (
      !file ||
      !file.type.startsWith(
        'video/',
      )
    ) {
      return;
    }

    if (reelPreviewUrl) {
      URL.revokeObjectURL(
        reelPreviewUrl,
      );
    }

    const previewUrl =
      URL.createObjectURL(file);

    const dataUrl =
      await fileToDataUrl(file);

    const nextMeta: IntroReelMeta = {
      fileName: file.name,
      fileSize: `${(
        file.size /
        (1024 * 1024)
      ).toFixed(1)} MB`,
      uploadedAt:
        new Date().toISOString(),
      dataUrl,
    };

    setReelPreviewUrl(previewUrl);
    setReelMeta(nextMeta);
    await saveProfileMedia({
      reelMeta: nextMeta,
    });

    event.target.value = '';
  };

  const handleRemoveReel =
    async () => {
      if (reelPreviewUrl) {
        URL.revokeObjectURL(
          reelPreviewUrl,
        );
      }

      setReelPreviewUrl(null);
      setReelMeta(null);
      await api.delete(
        `${PROFILE_MEDIA_ENDPOINT}/reel`,
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
      {/* INTRO REEL */}

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
          ref={reelInputRef}
          type="file"
          accept="video/*"
          onChange={
            handleReelChange
          }
          className="hidden"
        />

        {reelPreviewUrl ? (
          <video
            src={reelPreviewUrl}
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
            <div className="px-6 text-center text-white">
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

              <p className="mt-4 text-[14px] font-bold">
                {reelMeta
                  ? 'Intro reel saved'
                  : 'Add your intro reel'}
              </p>

              <p className="mt-1 text-[12px] text-white/75">
                Your intro reel appears as your profile cover.
              </p>
            </div>
          </div>
        )}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            bg-brand-dark/20
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
              min-h-[40px]
              items-center
              gap-2
              rounded-[12px]
              border
              border-white/70
              bg-white/95
              px-3
              text-[12px]
              font-bold
              text-brand-primary
              shadow-sm
              backdrop-blur-md
              transition
              sm:opacity-0
              sm:group-hover:opacity-100

              focus-visible:outline-none
              focus-visible:ring-4
              focus-visible:ring-brand-accent/25
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
                h-10
                w-10
                place-items-center
                rounded-[12px]
                border
                border-white/70
                bg-white/95
                text-brand-crimson
                shadow-sm
                backdrop-blur-md
                transition
                sm:opacity-0
                sm:group-hover:opacity-100

                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-crimson/20
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
            bg-brand-dark/70
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

      {/* PROFILE IDENTITY */}

      <div className="px-5 pb-6 sm:px-7">
        <div
          className="
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-end
          "
        >
          <div
            className="
              relative
              -mt-14
              shrink-0
            "
          >
            <input
              ref={faceInputRef}
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
                rounded-full
                border-4
                border-white
                bg-brand-bg
                shadow-[0_12px_30px_rgba(0,70,109,0.18)]

                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-accent/25
              "
            >
              {facePhoto ? (
                <img
                  src={facePhoto}
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
                    text-[20px]
                    font-bold
                    text-brand-primary
                  "
                >
                  {profileName
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join('')
                    .toUpperCase() || 'C'}
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
                text-[28px]
                font-bold
                tracking-[-0.025em]
                !text-brand-primary
              "
            >
              {profileName}
            </h1>

            <p
              className="
                mt-1
                text-[14px]
                font-bold
                text-brand-textMuted
              "
            >
              {profileHeadline}
            </p>

            <div
              className="
                mt-2
                flex
                flex-wrap
                items-center
                gap-x-4
                gap-y-1.5
                text-[12px]
                text-brand-textMuted
              "
            >
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {profileLocation}
              </span>

              <span className="flex items-center gap-1.5">
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
  const [editing, setEditing] =
    useState(false);

  const [profileSaving, setProfileSaving] =
    useState(false);

  const [form, setForm] =
    useState<ProfileForm>({
      headline: '',
      email: '',
      phone: '',
      location: '',
      bio: '',
      skills: [],
    });

  useEffect(() => {
    let mounted = true;

    api.get<BackendCandidateProfile>(
      PROFILE_ENDPOINT,
    )
      .then(({ data }) => {
        if (!mounted) return;

        setForm({
          headline: data.headline ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          location: data.location ?? '',
          bio: data.bio ?? '',
          skills: Array.isArray(data.skills)
            ? data.skills
            : [],
        });
      })
      .catch((error) => {
        console.error(
          'Unable to load candidate profile details:',
          error,
        );
      });

    return () => {
      mounted = false;
    };
  }, []);

  const saveProfile = async () => {
    await api.put(
      PROFILE_ENDPOINT,
      {
        headline: form.headline,
        phone: form.phone,
        location: form.location,
        bio: form.bio,
        skills: form.skills,
      },
    );
  };

  const [newSkill, setNewSkill] =
    useState('');

  const handleAddSkill = () => {
    const value =
      newSkill.trim();

    if (
      !value ||
      form.skills.includes(value)
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

  const handleRemoveSkill = (
    skill: string,
  ) => {
    setForm({
      ...form,
      skills:
        form.skills.filter(
          (item) =>
            item !== skill,
        ),
    });
  };

  if (editing) {
    return (
      <form
        onSubmit={async (event) => {
          event.preventDefault();

          try {
            setProfileSaving(true);
            await saveProfile();
            setEditing(false);
          } catch (error) {
            console.error(
              'Unable to save candidate profile:',
              error,
            );
            window.alert(
              'Your profile could not be saved. Please try again.',
            );
          } finally {
            setProfileSaving(false);
          }
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
                text-[20px]
                font-bold
                !text-brand-primary
              "
            >
              Edit profile
            </h2>

            <p className="mt-1 text-[12px] text-brand-textMuted">
              Keep your employment information accurate and up to date.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close profile editor"
            onClick={() =>
              setEditing(false)
            }
            className="
              grid
              h-9
              w-9
              place-items-center
              rounded-[11px]
              border
              border-brand-border
              text-brand-textMuted
              transition
              hover:border-brand-primary
              hover:text-brand-primary

              focus-visible:outline-none
              focus-visible:ring-4
              focus-visible:ring-brand-accent/15
            "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5">
          <FormField
            label="Professional headline"
            value={form.headline}
            onChange={(value) =>
              setForm({
                ...form,
                headline: value,
              })
            }
          />

          <div>
            <label
              className="
                mb-1.5
                block
                text-[12px]
                font-bold
                text-brand-textMuted
              "
            >
              About
            </label>

            <textarea
              value={form.bio}
              onChange={(event) =>
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
                text-[14px]
                leading-6
                text-brand-text
                outline-none
                transition

                focus:border-brand-accent
                focus:ring-4
                focus:ring-brand-accent/10
              "
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Email"
              value={form.email}
              readOnly
              onChange={(value) =>
                setForm({
                  ...form,
                  email: value,
                })
              }
            />

            <FormField
              label="Phone"
              value={form.phone}
              onChange={(value) =>
                setForm({
                  ...form,
                  phone: value,
                })
              }
            />
          </div>

          <FormField
            label="Location"
            value={form.location}
            onChange={(value) =>
              setForm({
                ...form,
                location: value,
              })
            }
          />

          <div>
            <label
              className="
                mb-1.5
                block
                text-[12px]
                font-bold
                text-brand-textMuted
              "
            >
              Skills
            </label>

            <div className="flex gap-2">
              <input
                value={newSkill}
                onChange={(event) =>
                  setNewSkill(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
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
                  min-h-[46px]
                  min-w-0
                  flex-1
                  rounded-[14px]
                  border
                  border-brand-border
                  bg-brand-bg
                  px-4
                  text-[14px]
                  text-brand-text
                  outline-none
                  transition

                  placeholder:text-brand-textMuted/70
                  focus:border-brand-accent
                  focus:ring-4
                  focus:ring-brand-accent/10
                "
              />

              <button
                type="button"
                onClick={
                  handleAddSkill
                }
                className="
                  min-h-[46px]
                  rounded-[14px]
                  border
                  border-brand-primary
                  bg-white
                  px-4
                  text-[12px]
                  font-bold
                  text-brand-primary
                  transition

                  hover:bg-brand-primary
                  hover:text-white

                  focus-visible:outline-none
                  focus-visible:ring-4
                  focus-visible:ring-brand-accent/15
                "
              >
                Add
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {form.skills.map(
                (skill) => (
                  <span
                    key={skill}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-brand-accent/30
                      bg-brand-accent/10
                      px-3
                      py-1.5
                      text-[12px]
                      font-bold
                      text-brand-primary
                    "
                  >
                    {skill}

                    <button
                      type="button"
                      aria-label={`Remove ${skill}`}
                      onClick={() =>
                        handleRemoveSkill(
                          skill,
                        )
                      }
                      className="
                        text-brand-textMuted
                        transition
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
          <PrimaryButton
            type="submit"
            disabled={profileSaving}
          >
            <Save className="h-4 w-4" />
            {profileSaving ? 'Saving...' : 'Save changes'}
          </PrimaryButton>
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
        <section className="rounded-[24px] border border-brand-border bg-white p-5 shadow-[0_14px_34px_rgba(0,70,109,0.06)] sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
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
                setEditing(true)
              }
              className="
                inline-flex
                min-h-[38px]
                items-center
                gap-1.5
                rounded-[12px]
                border
                border-brand-border
                bg-white
                px-3
                text-[12px]
                font-bold
                text-brand-textMuted
                transition

                hover:border-brand-primary
                hover:text-brand-primary

                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-accent/15
              "
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>

          <h3 className="text-[14px] font-bold text-brand-primary">
            {form.headline}
          </h3>

          <p className="mt-3 text-[14px] leading-6 text-brand-textMuted">
            {form.bio}
          </p>
        </section>

        <section className="rounded-[24px] border border-brand-border bg-white p-5 shadow-[0_14px_34px_rgba(0,70,109,0.06)] sm:p-6">
          <SectionTitle
            icon={
              <Code2 className="h-4 w-4" />
            }
          >
            Skills & Competencies
          </SectionTitle>

          <div className="mt-4 flex flex-wrap gap-2">
            {form.skills.map(
              (skill) => (
                <span
                  key={skill}
                  className="
                    rounded-[10px]
                    border
                    border-brand-border
                    bg-brand-bg
                    px-3
                    py-2
                    text-[12px]
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

      <aside className="rounded-[24px] border border-brand-border bg-white p-5 shadow-[0_14px_34px_rgba(0,70,109,0.06)] sm:p-6">
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
            value={form.email}
          />

          <ContactRow
            icon={
              <Phone className="h-4 w-4" />
            }
            label="Phone"
            value={form.phone}
          />

          <ContactRow
            icon={
              <MapPin className="h-4 w-4" />
            }
            label="Location"
            value={form.location}
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
  images: GalleryImage[];

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
    useState<GalleryImage | null>(
      null,
    );

  const categories: {
    value: GalleryImageCategory;
    label: string;
  }[] = [
    {
      value: 'professional',
      label: 'Professional',
    },
    {
      value: 'front',
      label: 'Full Body · Front',
    },
    {
      value: 'side',
      label: 'Full Body · Side',
    },
    {
      value: 'back',
      label: 'Full Body · Back',
    },
    {
      value: 'project',
      label: 'Project',
    },
    {
      value: 'certificate',
      label: 'Certificate',
    },
    {
      value: 'other',
      label: 'Other',
    },
  ];

  const categoryLabel = (
    category:
      GalleryImageCategory,
  ) =>
    categories.find(
      (item) =>
        item.value === category,
    )?.label ?? 'Other';

  const handleUpload =
    async (
      event:
        React.ChangeEvent<HTMLInputElement>,
    ) => {
      const files: File[] =
        Array.from(
          event.target.files ?? [],
        );

      if (!files.length) {
        return;
      }

      const imageFiles =
        files.filter((file) =>
          file.type.startsWith(
            'image/',
          ),
        );

      if (!imageFiles.length) {
        return;
      }

      try {
        const uploaded =
          await Promise.all(
            imageFiles.map(
              async (
                file,
              ): Promise<GalleryImage> => ({
                id:
                  createGalleryId(),
                name: file.name,
                category:
                  selectedCategory,
                image:
                  await fileToDataUrl(file),
                uploadedAt:
                  new Date().toISOString(),
              }),
            ),
          );

        const nextImages = [
          ...uploaded,
          ...images,
        ];

        setImages(nextImages);
        await saveProfileMedia({
          galleryImages: nextImages,
        });
      } catch (error) {
        console.error(
          'Unable to upload gallery images:',
          error,
        );
      }

      event.target.value = '';
    };

  const handleDelete = (
    id: string,
  ) => {
    const nextImages = images.filter(
      (image) => image.id !== id,
    );

    setImages(nextImages);
    void saveProfileMedia({
      galleryImages: nextImages,
    });

    setSelectedImage(
      (current) =>
        current?.id === id
          ? null
          : current,
    );
  };

  const updateCategory = (
    id: string,
    category:
      GalleryImageCategory,
  ) => {
    const nextImages = images.map((image) =>
      image.id === id
        ? {
            ...image,
            category,
          }
        : image,
    );

    setImages(nextImages);
    void saveProfileMedia({
      galleryImages: nextImages,
    });

    setSelectedImage(
      (current) =>
        current?.id === id
          ? {
              ...current,
              category,
            }
          : current,
    );
  };

  const frontCount =
    images.filter(
      (image) =>
        image.category ===
        'front',
    ).length;

  const sideCount =
    images.filter(
      (image) =>
        image.category ===
        'side',
    ).length;

  const backCount =
    images.filter(
      (image) =>
        image.category ===
        'back',
    ).length;

  return (
    <>
      <section className="overflow-hidden rounded-[26px] border border-brand-border bg-white shadow-[0_16px_40px_rgba(0,70,109,0.07)]">
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

            <h2 className="!m-0 mt-1 text-[24px] font-bold !text-brand-primary">
              Gallery
            </h2>

            <p className="mt-2 max-w-[680px] text-[14px] leading-6 text-brand-textMuted">
              Store all professional profile images here, including
              front, side and back full-body images, professional
              photos, project images, certificates and other relevant
              visual media.
            </p>
          </div>

          <span className="shrink-0 rounded-full border border-brand-border bg-brand-bg px-3 py-1.5 text-[10px] font-bold text-brand-primary">
            {images.length}{' '}
            {images.length === 1
              ? 'image'
              : 'images'}
          </span>
        </div>

        {/* BODY PHOTO STATUS */}

        <div className="grid gap-3 border-b border-brand-border bg-brand-bg p-5 sm:grid-cols-3 sm:p-6">
          <BodyViewStatus
            label="Front View"
            complete={
              frontCount > 0
            }
            count={frontCount}
          />

          <BodyViewStatus
            label="Side View"
            complete={
              sideCount > 0
            }
            count={sideCount}
          />

          <BodyViewStatus
            label="Back View"
            complete={
              backCount > 0
            }
            count={backCount}
          />
        </div>

        {/* UPLOAD */}

        <div className="border-b border-brand-border p-5 sm:p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={
              handleUpload
            }
            className="hidden"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <label className="mb-1.5 block text-[12px] font-bold text-brand-primary">
                Image type
              </label>

              <select
                value={
                  selectedCategory
                }
                onChange={(event) =>
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
                  text-[14px]
                  text-brand-text
                  outline-none
                  transition

                  focus:border-brand-accent
                  focus:ring-4
                  focus:ring-brand-accent/10
                "
              >
                {categories.map(
                  (category) => (
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

            <PrimaryButton
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              <Upload className="h-4 w-4" />
              Upload images
            </PrimaryButton>
          </div>

          <p className="mt-3 text-[12px] leading-5 text-brand-textMuted">
            Multiple images can be selected at once. Choose the image
            type first so uploaded images are organised correctly.
          </p>
        </div>

        {/* GRID */}

        <div className="p-5 sm:p-6">
          {images.length === 0 ? (
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

                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-accent/15
              "
            >
              <div className="grid h-16 w-16 place-items-center rounded-[20px] border border-brand-border bg-white text-brand-primary">
                <Image className="h-7 w-7" />
              </div>

              <h3 className="!m-0 mt-5 text-[18px] font-bold !text-brand-primary">
                Build your gallery
              </h3>

              <p className="mt-2 max-w-[470px] text-[14px] leading-6 text-brand-textMuted">
                Upload professional photos, front, side and back
                full-body images, project images, certificates and
                other profile media.
              </p>

              <span
                className="
                  mt-5
                  inline-flex
                  min-h-[44px]
                  items-center
                  gap-2
                  rounded-[13px]
                  px-5
                  text-[12px]
                  font-bold
                  text-white
                "
                style={{
                  background:
                    'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)',
                }}
              >
                <Plus className="h-4 w-4" />
                Add images
              </span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {images.map(
                (image) => (
                  <article
                    key={image.id}
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

                        focus-visible:outline-none
                        focus-visible:ring-4
                        focus-visible:ring-inset
                        focus-visible:ring-brand-accent/30
                      "
                    >
                      <img
                        src={image.image}
                        alt={image.name}
                        className="
                          h-full
                          w-full
                          object-cover
                          transition
                          duration-300
                          group-hover:scale-[1.03]
                        "
                      />

                      <div className="absolute inset-0 bg-brand-dark/0 transition group-hover:bg-brand-dark/15" />
                    </button>

                    <div className="absolute left-2.5 top-2.5">
                      <span className="rounded-full border border-white/60 bg-white/95 px-2.5 py-1 text-[10px] font-bold text-brand-primary shadow-sm backdrop-blur">
                        {categoryLabel(
                          image.category,
                        )}
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
                        bg-white/95
                        text-brand-crimson
                        shadow-sm
                        backdrop-blur
                        transition
                        sm:opacity-0
                        sm:group-hover:opacity-100

                        focus-visible:opacity-100
                        focus-visible:outline-none
                        focus-visible:ring-4
                        focus-visible:ring-brand-crimson/20
                      "
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="p-3">
                      <p className="truncate text-[12px] font-bold text-brand-primary">
                        {image.name}
                      </p>

                      <p className="mt-1 text-[10px] text-brand-textMuted">
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

        <div className="flex items-start gap-3 border-t border-brand-border bg-brand-bg p-4 sm:px-6">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />

          <div>
            <p className="text-[12px] font-bold text-brand-primary">
              Gallery visibility
            </p>

            <p className="mt-1 text-[10px] leading-5 text-brand-textMuted">
              Gallery media forms part of your TruCity profile and may
              be visible to employers when you apply through Express
              Interest.
            </p>
          </div>
        </div>
      </section>

      {/* VIEWER */}

      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image"
          onClick={() =>
            setSelectedImage(null)
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
            onClick={(event) =>
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

                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-white/40
              "
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex max-h-[72vh] items-center justify-center bg-brand-dark">
              <img
                src={
                  selectedImage.image
                }
                alt={
                  selectedImage.name
                }
                className="max-h-[72vh] w-full object-contain"
              />
            </div>

            <div className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="truncate text-[14px] font-bold text-brand-primary">
                    {
                      selectedImage.name
                    }
                  </h3>

                  <p className="mt-1 text-[12px] text-brand-textMuted">
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
                  onChange={(event) =>
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
                    text-[12px]
                    font-bold
                    text-brand-primary
                    outline-none

                    focus:border-brand-accent
                    focus:ring-4
                    focus:ring-brand-accent/10
                  "
                >
                  {categories.map(
                    (category) => (
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
                  min-h-[38px]
                  items-center
                  gap-2
                  rounded-[10px]
                  px-2
                  text-[12px]
                  font-bold
                  text-brand-crimson

                  focus-visible:outline-none
                  focus-visible:ring-4
                  focus-visible:ring-brand-crimson/15
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
            ? 'border-brand-emerald bg-brand-emerald/10'
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
              ? 'bg-brand-emerald/15 text-brand-primary'
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
        <p className="text-[12px] font-bold text-brand-primary">
          {label}
        </p>

        <p className="mt-0.5 text-[10px] text-brand-textMuted">
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
  docs: DocItem[];

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

  const handleFileUpload = async (
    id: number,
    event:
      React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const size = `${(
      file.size /
      (1024 * 1024)
    ).toFixed(2)} MB`;

    const dataUrl =
      await fileToDataUrl(file);

    const nextDocs = docs.map(
      (document) =>
        document.id === id
          ? {
              ...document,
              status: 'pending' as const,
              fileName:
                file.name,
              fileSize: size,
              dataUrl,
            }
          : document,
    );

    setDocs(nextDocs);
    await saveProfileMedia({
      documents: nextDocs,
    });

    event.target.value = '';
  };

  return (
    <div className="max-w-[900px] space-y-5">
      <div>
        <h2 className="!m-0 text-[24px] font-bold !text-brand-primary">
          Documents
        </h2>

        <p className="mt-1 text-[14px] text-brand-textMuted">
          Manage supporting documents associated with your profile.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-[18px] border border-brand-accent/30 bg-brand-accent/10 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-primary" />

        <p className="text-[12px] leading-5 text-brand-textMuted">
          Upload only documents relevant to employment or verification.
          Accepted formats are PDF, PNG and JPEG.
        </p>
      </div>

      <div className="space-y-3">
        {docs.map(
          (document) => (
            <article
              key={document.id}
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
                ref={(element) => {
                  fileInputRefs.current[
                    document.id
                  ] = element;
                }}
                onChange={(event) =>
                  handleFileUpload(
                    document.id,
                    event,
                  )
                }
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
              />

              <div className="flex min-w-0 items-center gap-4">
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
                        ? 'border-brand-emerald bg-brand-emerald/10 text-brand-primary'
                        : document.status ===
                            'pending'
                          ? 'border-brand-warning bg-brand-warning/10 text-brand-dark'
                          : 'border-brand-border bg-brand-bg text-brand-textMuted'
                    }
                  `}
                >
                  <FileText className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-[14px] font-bold text-brand-primary">
                    {document.name}
                  </h3>

                  {document.fileName ? (
                    <p className="mt-1 truncate text-[12px] text-brand-textMuted">
                      {document.fileName}
                      {document.fileSize &&
                        ` · ${document.fileSize}`}
                    </p>
                  ) : (
                    <p className="mt-1 text-[12px] text-brand-textMuted">
                      No document uploaded
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
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
                      min-h-[42px]
                      items-center
                      gap-2
                      rounded-[12px]
                      border
                      border-brand-primary
                      bg-white
                      px-4
                      text-[12px]
                      font-bold
                      text-brand-primary
                      transition

                      hover:bg-brand-primary
                      hover:text-white

                      focus-visible:outline-none
                      focus-visible:ring-4
                      focus-visible:ring-brand-accent/15
                    "
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </button>
                )}

                {document.status ===
                  'pending' && (
                  <>
                    <span className="rounded-full border border-brand-warning bg-brand-warning/10 px-3 py-1.5 text-[10px] font-bold text-brand-dark">
                      Under review
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRefs.current[
                          document.id
                        ]?.click()
                      }
                      className="text-[12px] font-bold text-brand-primary hover:underline"
                    >
                      Replace
                    </button>
                  </>
                )}

                {document.status ===
                  'verified' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-emerald bg-brand-emerald/10 px-3 py-1.5 text-[12px] font-bold text-brand-primary">
                    <FileCheck2 className="h-4 w-4 text-brand-emerald" />
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
  projects: ProjectItem[];

  setProjects:
    React.Dispatch<
      React.SetStateAction<
        ProjectItem[]
      >
    >;

  activeCount: number;
}

function ProjectsSection({
  projects,
  setProjects,
  activeCount,
}: ProjectsSectionProps) {
  const [showForm, setShowForm] =
    useState(false);

  const [newProject, setNewProject] =
    useState({
      name: '',
      tech: '',
      status:
        'Active Development',
      desc: '',
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

    const project: ProjectItem = {
      id: Date.now(),
      ...newProject,
    };

    const nextProjects = [
      project,
      ...projects,
    ];

    setProjects(nextProjects);
    void saveProfileMedia({
      projects: nextProjects,
    });

    setNewProject({
      name: '',
      tech: '',
      status:
        'Active Development',
      desc: '',
    });

    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="!m-0 text-[24px] font-bold !text-brand-primary">
            Portfolio Projects
          </h2>

          <p className="mt-1 text-[14px] text-brand-textMuted">
            Showcase selected work that supports your experience and skills.
          </p>
        </div>

        <PrimaryButton
          onClick={() =>
            setShowForm(true)
          }
        >
          <Plus className="h-4 w-4" />
          Add project
        </PrimaryButton>
      </div>

      {activeCount > 0 && (
        <div className="inline-flex rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1.5 text-[10px] font-bold text-brand-primary">
          {activeCount}{' '}
          active
          {activeCount === 1
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
            border-brand-accent/30
            bg-white
            p-5
            shadow-[0_16px_40px_rgba(0,70,109,0.07)]
          "
        >
          <div className="mb-5 flex items-center justify-between">
            <h3 className="!m-0 text-[16px] font-bold !text-brand-primary">
              Add portfolio project
            </h3>

            <button
              type="button"
              aria-label="Close project form"
              onClick={() =>
                setShowForm(false)
              }
              className="
                grid
                h-8
                w-8
                place-items-center
                rounded-[9px]
                text-brand-textMuted
                hover:bg-brand-bg

                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-accent/15
              "
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Project name"
              value={
                newProject.name
              }
              onChange={(value) =>
                setNewProject({
                  ...newProject,
                  name: value,
                })
              }
            />

            <FormField
              label="Technology / tools"
              value={
                newProject.tech
              }
              onChange={(value) =>
                setNewProject({
                  ...newProject,
                  tech: value,
                })
              }
            />
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-[12px] font-bold text-brand-textMuted">
              Project summary
            </label>

            <textarea
              value={
                newProject.desc
              }
              onChange={(event) =>
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
                text-[14px]
                text-brand-text
                outline-none
                transition

                placeholder:text-brand-textMuted/70
                focus:border-brand-accent
                focus:ring-4
                focus:ring-brand-accent/10
              "
            />
          </div>

          <div className="mt-5 flex justify-end">
            <PrimaryButton type="submit">
              <Save className="h-4 w-4" />
              Save project
            </PrimaryButton>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map(
          (project) => (
            <article
              key={project.id}
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
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-brand-accent/10 text-brand-primary">
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
                        ? 'border-brand-accent/30 bg-brand-accent/10 text-brand-primary'
                        : 'border-brand-emerald bg-brand-emerald/10 text-brand-primary'
                    }
                  `}
                >
                  {project.status}
                </span>
              </div>

              <h3 className="!m-0 text-[16px] font-bold !text-brand-primary">
                {project.name}
              </h3>

              <p className="mt-1 text-[12px] font-bold text-brand-accent">
                {project.tech}
              </p>

              <p className="mt-3 text-[14px] leading-6 text-brand-textMuted">
                {project.desc}
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
  ] = useState<'full-time' | 'contract'>('full-time');

  const [saved, setSaved] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    api.get<BackendProfileMedia>(
      PROFILE_MEDIA_ENDPOINT,
    )
      .then(({ data }) => {
        setAvailability(
          data.preferences?.availability === 'contract'
            ? 'contract'
            : 'full-time',
        );
      })
      .catch((error) => {
        console.error(
          'Unable to load candidate preferences:',
          error,
        );
      });
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveProfileMedia({
        preferences: {
          availability,
        },
      });
      setSaved(true);
      window.setTimeout(
        () => setSaved(false),
        2500,
      );
    } catch (error) {
      console.error(
        'Unable to save candidate preferences:',
        error,
      );
      window.alert(
        'Your preferences could not be saved. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[760px] space-y-5">
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
        <h2 className="!m-0 text-[20px] font-bold !text-brand-primary">
          Opportunity preferences
        </h2>

        <p className="mt-1 text-[14px] text-brand-textMuted">
          Choose the type of work you are currently open to.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
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

      <div className="flex flex-wrap items-center gap-4">
        <PrimaryButton
          onClick={handleSave}
          disabled={saving}
        >
          {saved ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {saved
            ? 'Preferences saved'
            : 'Save preferences'}
        </PrimaryButton>

        {saved && (
          <span
            role="status"
            className="
              inline-flex
              items-center
              gap-2
              text-[12px]
              font-bold
              text-brand-primary
            "
          >
            <CheckCircle2 className="h-4 w-4 text-brand-emerald" />
            Your preferences have been updated.
          </span>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   SHARED PRIMARY BUTTON
========================================================= */

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="
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
        shadow-[0_8px_20px_rgba(0,70,109,0.14)]
        transition-all
        duration-200

        hover:-translate-y-0.5
        hover:shadow-[0_12px_24px_rgba(0,70,109,0.18)]

        disabled:pointer-events-none
        disabled:opacity-45

        focus-visible:outline-none
        focus-visible:ring-4
        focus-visible:ring-brand-accent/20
      "
      style={{
        background:
          'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)',
      }}
    >
      {children}
    </button>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  readOnly?: boolean;
}

function FormField({
  label,
  value,
  onChange,
  readOnly = false,
}: FormFieldProps) {
  return (
    <div>
      <label
        className="
          mb-1.5
          block
          text-[12px]
          font-bold
          text-brand-textMuted
        "
      >
        {label}
      </label>

      <input
        value={value}
        readOnly={readOnly}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="
          min-h-[46px]
          w-full
          rounded-[14px]
          border
          border-brand-border
          bg-brand-bg
          px-4
          text-[14px]
          text-brand-text
          outline-none
          transition

          focus:border-brand-accent
          focus:ring-4
          focus:ring-brand-accent/10
        "
      />
    </div>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SectionTitle({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        text-[14px]
        font-bold
        text-brand-primary
      "
    >
      {icon}
      {children}
    </div>
  );
}

/* =========================================================
   CONTACT ROW
========================================================= */

interface ContactRowProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function ContactRow({
  icon,
  label,
  value,
}: ContactRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="
          grid
          h-9
          w-9
          shrink-0
          place-items-center
          rounded-[11px]
          bg-brand-accent/10
          text-brand-primary
        "
      >
        {icon}
      </div>

      <div className="min-w-0">
        <div
          className="
            text-[10px]
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
            text-[14px]
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

/* =========================================================
   PREFERENCE CARD
========================================================= */

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
      aria-pressed={selected}
      onClick={onClick}
      className={`
        flex
        min-h-[92px]
        items-start
        gap-3
        rounded-[18px]
        border
        p-4
        text-left
        transition-all
        duration-200

        ${
          selected
            ? `
              border-brand-accent
              bg-brand-accent/10
              shadow-[0_8px_22px_rgba(0,70,109,0.06)]
            `
            : `
              border-brand-border
              bg-white
              hover:border-brand-accent/50
              hover:bg-brand-bg
            `
        }

        focus-visible:outline-none
        focus-visible:ring-4
        focus-visible:ring-brand-accent/15
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
            text-[14px]
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
            text-[12px]
            font-normal
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

export default Profile;