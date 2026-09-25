import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Link,
  NavLink,
  useNavigate,
} from 'react-router-dom';

import {
  ArrowRight,
  Camera,
  CheckCircle2,
  RotateCcw,
  Upload,
  User,
  Video,
} from 'lucide-react';

type Mode = 'idle' | 'live' | 'done';

const EXPERIENCE_RANGES = [
  '0–1 yrs',
  '1–3 yrs',
  '3–5 yrs',
  '5–10 yrs',
  '10+ yrs',
];

const JOB_INDUSTRIES = [
  'Software & Web Development',
  'Data Science & Analytics',
  'UI/UX & Product Design',
  'Digital Marketing & Content',
  'Finance & Accounting',
  'Human Resources & Recruitment',
  'Customer Support & Success',
  'Sales & Business Development',
  'Project & Product Management',
  'Engineering & Hardware',
  'Other / General',
];

export default function ProfileSetup() {
  const navigate = useNavigate();

  /* =========================================================
     FACE PHOTO
  ========================================================= */

  const [faceMode, setFaceMode] =
    useState<Mode>('idle');

  const [facePreview, setFacePreview] =
    useState<string | null>(null);

  const faceVideoRef =
    useRef<HTMLVideoElement>(null);

  const faceCanvasRef =
    useRef<HTMLCanvasElement>(null);

  const faceStreamRef =
    useRef<MediaStream | null>(null);

  const faceInputRef =
    useRef<HTMLInputElement>(null);

  /* =========================================================
     FULL BODY PHOTO
  ========================================================= */

  const [photoMode, setPhotoMode] =
    useState<Mode>('idle');

  const [photoPreview, setPhotoPreview] =
    useState<string | null>(null);

  const photoVideoRef =
    useRef<HTMLVideoElement>(null);

  const photoCanvasRef =
    useRef<HTMLCanvasElement>(null);

  const photoStreamRef =
    useRef<MediaStream | null>(null);

  const photoInputRef =
    useRef<HTMLInputElement>(null);

  /* =========================================================
     INTRO REEL
  ========================================================= */

  const [reelMode, setReelMode] =
    useState<Mode>('idle');

  const [reelPreview, setReelPreview] =
    useState<string | null>(null);

  const [secondsLeft, setSecondsLeft] =
    useState(30);

  const reelVideoRef =
    useRef<HTMLVideoElement>(null);

  const reelStreamRef =
    useRef<MediaStream | null>(null);

  const recorderRef =
    useRef<MediaRecorder | null>(null);

  const chunksRef =
    useRef<Blob[]>([]);

  const timerRef =
    useRef<number | null>(null);

  const reelInputRef =
    useRef<HTMLInputElement>(null);

  /* =========================================================
     PROFILE FORM
  ========================================================= */

  const [idNumber, setIdNumber] =
    useState('');

  const [industry, setIndustry] =
    useState('');

  const [experience, setExperience] =
    useState<string | null>(null);

  /* =========================================================
     VALIDATION
  ========================================================= */

  const isIdValid = /^\d{13}$/.test(idNumber);

  const handleIdNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const digitsOnly =
      event.target.value.replace(/\D/g, '');

    setIdNumber(digitsOnly.slice(0, 13));
  };

  /* =========================================================
     CAMERA STREAM ATTACHMENT
  ========================================================= */

  useEffect(() => {
    if (
      faceMode === 'live' &&
      faceVideoRef.current &&
      faceStreamRef.current
    ) {
      faceVideoRef.current.srcObject =
        faceStreamRef.current;

      void faceVideoRef.current
        .play()
        .catch(() => undefined);
    }
  }, [faceMode]);

  useEffect(() => {
    if (
      photoMode === 'live' &&
      photoVideoRef.current &&
      photoStreamRef.current
    ) {
      photoVideoRef.current.srcObject =
        photoStreamRef.current;

      void photoVideoRef.current
        .play()
        .catch(() => undefined);
    }
  }, [photoMode]);

  useEffect(() => {
    if (
      reelMode === 'live' &&
      reelVideoRef.current &&
      reelStreamRef.current
    ) {
      reelVideoRef.current.srcObject =
        reelStreamRef.current;

      void reelVideoRef.current
        .play()
        .catch(() => undefined);
    }
  }, [reelMode]);

  /* =========================================================
     CLEANUP
  ========================================================= */

  useEffect(() => {
    return () => {
      faceStreamRef.current
        ?.getTracks()
        .forEach((track) => track.stop());

      photoStreamRef.current
        ?.getTracks()
        .forEach((track) => track.stop());

      reelStreamRef.current
        ?.getTracks()
        .forEach((track) => track.stop());

      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  /* =========================================================
     FACE PHOTO
  ========================================================= */

  const startFaceCapture = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
        });

      faceStreamRef.current = stream;
      setFaceMode('live');
    } catch {
      alert(
        'Could not access your camera. You can upload a face picture instead.',
      );
    }
  };

  const takeFacePhoto = () => {
    const video = faceVideoRef.current;
    const canvas = faceCanvasRef.current;

    if (!video || !canvas) {
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');

    context?.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    setFacePreview(
      canvas.toDataURL('image/jpeg'),
    );

    faceStreamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    faceStreamRef.current = null;

    setFaceMode('done');
  };

  const retakeFacePhoto = () => {
    faceStreamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    faceStreamRef.current = null;

    setFacePreview(null);
    setFaceMode('idle');
  };

  const handleFaceUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFacePreview(URL.createObjectURL(file));
    setFaceMode('done');
  };

  /* =========================================================
     FULL BODY PHOTO
  ========================================================= */

  const startPhotoCapture = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
        });

      photoStreamRef.current = stream;
      setPhotoMode('live');
    } catch {
      alert(
        'Could not access your camera. You can upload a photo instead.',
      );
    }
  };

  const takePhoto = () => {
    const video = photoVideoRef.current;
    const canvas = photoCanvasRef.current;

    if (!video || !canvas) {
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');

    context?.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    setPhotoPreview(
      canvas.toDataURL('image/jpeg'),
    );

    photoStreamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    photoStreamRef.current = null;

    setPhotoMode('done');
  };

  const retakePhoto = () => {
    photoStreamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    photoStreamRef.current = null;

    setPhotoPreview(null);
    setPhotoMode('idle');
  };

  const handlePhotoUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPhotoPreview(URL.createObjectURL(file));
    setPhotoMode('done');
  };

  /* =========================================================
     INTRO REEL
  ========================================================= */

  const stopReelCapture = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (
      recorderRef.current?.state ===
      'recording'
    ) {
      recorderRef.current.stop();
    }
  };

  const startReelCapture = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

      reelStreamRef.current = stream;
      chunksRef.current = [];

      const recorder =
        new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(
          chunksRef.current,
          {
            type: 'video/webm',
          },
        );

        setReelPreview(
          URL.createObjectURL(blob),
        );

        stream
          .getTracks()
          .forEach((track) => track.stop());

        reelStreamRef.current = null;
        setReelMode('done');
      };

      recorderRef.current = recorder;

      recorder.start();

      setReelMode('live');
      setSecondsLeft(30);

      timerRef.current =
        window.setInterval(() => {
          setSecondsLeft((previous) => {
            if (previous <= 1) {
              stopReelCapture();
              return 0;
            }

            return previous - 1;
          });
        }, 1000);
    } catch {
      alert(
        'Could not access camera/microphone. You can upload a video instead.',
      );
    }
  };

  const retakeReel = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    reelStreamRef.current
      ?.getTracks()
      .forEach((track) => track.stop());

    reelStreamRef.current = null;

    setReelPreview(null);
    setSecondsLeft(30);
    setReelMode('idle');
  };

  const handleReelUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setReelPreview(URL.createObjectURL(file));
    setReelMode('done');
  };

  /* =========================================================
     COMPLETE STATUS
  ========================================================= */

  const isComplete =
    faceMode === 'done' &&
    photoMode === 'done' &&
    isIdValid &&
    Boolean(industry) &&
    Boolean(experience);

  const handleContinue = () => {
    if (!isComplete) {
      return;
    }

    navigate('/candidate/choose-plan');
  };

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
              src="/trucity-nav-logo.png"
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
          FIXED LEFT BRAND AREA
      ====================================================== */}

      <div
        className="
          pointer-events-none
          fixed
          bottom-[58px]
          left-0
          top-[88px]
          z-[3]
          hidden
          w-[43%]
          overflow-hidden

          lg:block
        "
      >
        {/* TWO-TONE GOLD CIRCLE */}

        <div
          className="
            absolute
            -left-[225px]
            top-1/2
            h-[720px]
            w-[720px]
            -translate-y-1/2
            rounded-full

            xl:-left-[185px]
            xl:h-[760px]
            xl:w-[760px]
          "
          style={{
            background:
              'linear-gradient(135deg, #FFAD01 0%, #FFD784 100%)',
          }}
        />

        {/* GOLD OUTLINE */}

        <div
          className="
            absolute
            -left-[270px]
            top-1/2
            h-[810px]
            w-[810px]
            -translate-y-1/2
            rounded-full
            border-[3px]
            border-brand-gold/70
          "
        />

        {/* TWO-TONE BLUE CIRCLE */}

        <div
          className="
            absolute
            right-[4%]
            top-[57%]
            h-[185px]
            w-[185px]
            -translate-y-1/2
            rounded-full
            shadow-[0_20px_50px_rgba(0,70,109,0.18)]
          "
          style={{
            background:
              'linear-gradient(145deg, #00466D 0%, #00466D 58%, #1E92D2 100%)',
          }}
        />
      </div>

      {/* =====================================================
          LEFT TEXT
      ====================================================== */}

      <aside
        className="
          fixed
          bottom-[58px]
          left-0
          top-[88px]
          z-20
          hidden
          w-[43%]

          lg:flex
          lg:items-center
        "
      >
        <div
          className="
            ml-[72px]
            w-[300px]
            text-white

            xl:ml-[110px]
            xl:w-[330px]
          "
        >
          <p
            className="
              mb-4
              text-[10px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-white/80
            "
          >
            Almost There
          </p>

          <h1
            className="
              !m-0
              text-[36px]
              font-bold
              leading-[0.95]
              tracking-[-0.045em]
              !text-white

              xl:text-[42px]
            "
          >
            COMPLETE
            <br />
            YOUR PROFILE
          </h1>

          <div
            className="
              mt-5
              h-[3px]
              w-14
              rounded-full
              bg-white/75
            "
          />

          <p
            className="
              mt-6
              max-w-[275px]
              text-[14px]
              font-medium
              leading-[1.75]
              text-white/95

              xl:max-w-[300px]
            "
          >
            Build a profile employers can trust.
            Add your photos, experience and industry
            so TruCity can connect you with better
            opportunities.
          </p>

          <p
            className="
              mt-7
              max-w-[275px]
              text-[14px]
              font-bold
              leading-6
              text-white

              xl:max-w-[300px]
            "
          >
            Where Truth and Authenticity meet.
          </p>
        </div>
      </aside>

      {/* =====================================================
          RIGHT DECORATIVE SHAPES
      ====================================================== */}

      <div
        className="
          pointer-events-none
          fixed
          inset-0
          z-[3]
          hidden
          overflow-hidden

          lg:block
        "
      >
        {/* ORANGE RING */}

        <div
          className="
            absolute
            -right-[190px]
            top-[-180px]
            h-[520px]
            w-[520px]
            rounded-full
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

        {/* BLUE CIRCLE */}

        <div
          className="
            absolute
            -bottom-[260px]
            -right-[220px]
            h-[560px]
            w-[560px]
            rounded-full
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
            -right-[265px]
            h-[650px]
            w-[650px]
            rounded-full
            border-[3px]
            border-brand-gold
          "
        />
      </div>

      {/* =====================================================
          PROFILE AREA
      ====================================================== */}

      <main
        className="
          relative
          z-10
          min-h-[100dvh]
          bg-transparent
          px-5
          pb-[92px]
          pt-[120px]

          sm:px-8

          lg:ml-[43%]
          lg:min-h-0
          lg:px-10
          lg:pb-[92px]
          lg:pt-[120px]
        "
      >
        <section
          className="
            mx-auto
            flex
            w-full
            max-w-[720px]
            justify-center

            lg:mx-0
            lg:ml-auto

            xl:mr-[6%]
          "
        >
          <div
            className="
              w-full
              max-w-[650px]
              overflow-hidden
              rounded-[28px]
              border
              border-brand-border
              bg-white/95
              p-6
              shadow-[0_20px_55px_rgba(0,70,109,0.10)]
              backdrop-blur-xl

              sm:p-8
            "
          >
            {/* CARD HEADER */}

            <div className="mb-7">
              <p
                className="
                  text-[12px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-brand-primary
                "
              >
                Profile Setup
              </p>

              <h2
                className="
                  !m-0
                  mt-3
                  text-[30px]
                  font-bold
                  tracking-[-0.035em]
                  !text-brand-primary

                  sm:text-[34px]
                "
              >
                Complete Your Profile
              </h2>

              <p
                className="
                  mt-2
                  text-[14px]
                  leading-6
                  text-brand-textMuted
                "
              >
                Add the information below so employers
                can get a complete view of your profile.
              </p>
            </div>

            <div className="space-y-7">
              {/* =================================================
                  ID NUMBER
              ================================================== */}

              <ProfileSection
                title="ID Number"
                required
              >
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={13}
                      value={idNumber}
                      onChange={handleIdNumberChange}
                      placeholder="Enter 13-digit ID Number"
                      autoComplete="off"
                      aria-invalid={
                        idNumber.length > 0 &&
                        !isIdValid
                      }
                      className={`
                        min-h-[50px]
                        w-full
                        rounded-[14px]
                        border
                        bg-white
                        px-4
                        py-3
                        pr-[90px]
                        text-[14px]
                        text-brand-dark
                        outline-none
                        transition

                        placeholder:text-brand-textMuted/60

                        focus:ring-4

                        ${
                          idNumber.length > 0 &&
                          !isIdValid
                            ? `
                              border-brand-warning
                              focus:border-brand-warning
                              focus:ring-brand-warning/20
                            `
                            : isIdValid
                              ? `
                                border-brand-emerald
                                focus:border-brand-emerald
                                focus:ring-brand-emerald/20
                              `
                              : `
                                border-brand-border
                                focus:border-brand-accent
                                focus:ring-brand-accent/15
                              `
                        }
                      `}
                    />

                    <div
                      className={`
                        pointer-events-none
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-[11px]
                        font-bold

                        ${
                          isIdValid
                            ? 'text-brand-emerald'
                            : 'text-brand-textMuted'
                        }
                      `}
                    >
                      {idNumber.length} / 13
                    </div>
                  </div>

                  <div
                    className="
                      mt-2
                      flex
                      min-h-[18px]
                      items-center
                      text-[11px]
                      font-semibold
                    "
                  >
                    {idNumber.length === 0 && (
                      <span className="text-brand-textMuted">
                        Enter your 13-digit ID number.
                      </span>
                    )}

                    {idNumber.length > 0 &&
                      idNumber.length < 13 && (
                        <span className="text-brand-dark">
                          {13 - idNumber.length}{' '}
                          digit
                          {13 - idNumber.length === 1
                            ? ''
                            : 's'}{' '}
                          remaining
                        </span>
                      )}

                    {isIdValid && (
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          text-brand-emerald
                        "
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />

                        13-digit ID number entered
                      </span>
                    )}
                  </div>
                </div>
              </ProfileSection>

              <Divider />

              {/* =================================================
                  FACE PICTURE
              ================================================== */}

              <ProfileSection
                title="Face Picture"
                required
                icon={<User className="h-4 w-4" />}
              >
                {faceMode === 'live' && (
                  <div className="space-y-3">
                    <video
                      ref={faceVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="
                        mx-auto
                        aspect-square
                        w-full
                        max-w-[360px]
                        rounded-[20px]
                        border
                        border-brand-border
                        bg-brand-surface
                        object-cover
                      "
                    />

                    <canvas
                      ref={faceCanvasRef}
                      className="hidden"
                    />

                    <PrimaryButton
                      onClick={takeFacePhoto}
                    >
                      Snap Face Photo
                    </PrimaryButton>
                  </div>
                )}

                {faceMode === 'done' &&
                  facePreview && (
                    <div className="space-y-3">
                      <img
                        src={facePreview}
                        alt="Face preview"
                        className="
                          mx-auto
                          aspect-square
                          w-full
                          max-w-[360px]
                          rounded-[20px]
                          border
                          border-brand-border
                          object-cover
                        "
                      />

                      <CompletedRow
                        text="Face picture ready"
                        onRetake={retakeFacePhoto}
                      />
                    </div>
                  )}

                {faceMode === 'idle' && (
                  <MediaChoice
                    cameraLabel="Use Camera"
                    uploadLabel="Upload Photo"
                    onCamera={startFaceCapture}
                    onUpload={() =>
                      faceInputRef.current?.click()
                    }
                  />
                )}

                <input
                  ref={faceInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFaceUpload}
                  className="hidden"
                />
              </ProfileSection>

              <Divider />

              {/* =================================================
                  FULL BODY PHOTO
              ================================================== */}

              <ProfileSection
                title="360° Full-Body Photo"
                required
                icon={<Camera className="h-4 w-4" />}
              >
                {photoMode === 'live' && (
                  <div className="space-y-3">
                    <video
                      ref={photoVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="
                        mx-auto
                        aspect-[3/4]
                        w-full
                        max-w-[360px]
                        rounded-[20px]
                        border
                        border-brand-border
                        bg-brand-surface
                        object-cover
                      "
                    />

                    <canvas
                      ref={photoCanvasRef}
                      className="hidden"
                    />

                    <PrimaryButton onClick={takePhoto}>
                      Snap Photo
                    </PrimaryButton>
                  </div>
                )}

                {photoMode === 'done' &&
                  photoPreview && (
                    <div className="space-y-3">
                      <img
                        src={photoPreview}
                        alt="Full-body preview"
                        className="
                          mx-auto
                          aspect-[3/4]
                          w-full
                          max-w-[360px]
                          rounded-[20px]
                          border
                          border-brand-border
                          object-cover
                        "
                      />

                      <CompletedRow
                        text="Full-body photo ready"
                        onRetake={retakePhoto}
                      />
                    </div>
                  )}

                {photoMode === 'idle' && (
                  <MediaChoice
                    cameraLabel="Use Camera"
                    uploadLabel="Upload Photo"
                    onCamera={startPhotoCapture}
                    onUpload={() =>
                      photoInputRef.current?.click()
                    }
                  />
                )}

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </ProfileSection>

              <Divider />

              {/* =================================================
                  INTRO REEL
              ================================================== */}

              <ProfileSection
                title="Intro Reel"
                subtitle="Maximum 30 seconds"
                icon={<Video className="h-4 w-4" />}
              >
                {reelMode === 'live' && (
                  <div className="space-y-3">
                    <video
                      ref={reelVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="
                        w-full
                        rounded-[20px]
                        border
                        border-brand-border
                        bg-brand-surface
                      "
                    />

                    <div
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        text-[12px]
                        font-bold
                        text-brand-crimson
                      "
                    >
                      <span
                        className="
                          h-2
                          w-2
                          animate-pulse
                          rounded-full
                          bg-brand-crimson
                        "
                      />

                      Recording — {secondsLeft}s left
                    </div>

                    <button
                      type="button"
                      onClick={stopReelCapture}
                      className="
                        w-full
                        rounded-[14px]
                        bg-brand-crimson
                        px-4
                        py-3
                        text-[14px]
                        font-bold
                        text-white
                        transition

                        hover:opacity-90
                      "
                    >
                      Finish Recording
                    </button>
                  </div>
                )}

                {reelMode === 'done' &&
                  reelPreview && (
                    <div className="space-y-3">
                      <video
                        src={reelPreview}
                        controls
                        className="
                          max-h-[300px]
                          w-full
                          rounded-[20px]
                          border
                          border-brand-border
                          object-cover
                        "
                      />

                      <CompletedRow
                        text="Intro reel added"
                        onRetake={retakeReel}
                      />
                    </div>
                  )}

                {reelMode === 'idle' && (
                  <MediaChoice
                    cameraLabel="Record Video"
                    uploadLabel="Upload Video"
                    onCamera={startReelCapture}
                    onUpload={() =>
                      reelInputRef.current?.click()
                    }
                    video
                  />
                )}

                <input
                  ref={reelInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleReelUpload}
                  className="hidden"
                />
              </ProfileSection>

              <Divider />

              {/* =================================================
                  INDUSTRY
              ================================================== */}

              <ProfileSection
                title="Industry"
                required
              >
                <select
                  value={industry}
                  onChange={(event) =>
                    setIndustry(event.target.value)
                  }
                  className="
                    min-h-[50px]
                    w-full
                    cursor-pointer
                    appearance-none
                    rounded-[14px]
                    border
                    border-brand-border
                    bg-white
                    px-4
                    py-3
                    text-[14px]
                    text-brand-dark
                    outline-none
                    transition

                    focus:border-brand-accent
                    focus:ring-4
                    focus:ring-brand-accent/15
                  "
                >
                  <option value="">
                    Choose your industry...
                  </option>

                  {JOB_INDUSTRIES.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </ProfileSection>

              {/* =================================================
                  EXPERIENCE
              ================================================== */}

              <ProfileSection
                title="Years of Experience"
                required
              >
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_RANGES.map(
                    (range) => {
                      const selected =
                        experience === range;

                      return (
                        <button
                          key={range}
                          type="button"
                          onClick={() =>
                            setExperience(range)
                          }
                          className={`
                            rounded-[12px]
                            border
                            px-4
                            py-2.5
                            text-[12px]
                            font-bold
                            transition-all

                            ${
                              selected
                                ? `
                                  border-brand-accent
                                  bg-brand-accent/10
                                  text-brand-primary
                                  shadow-sm
                                `
                                : `
                                  border-brand-border
                                  bg-white
                                  text-brand-textMuted

                                  hover:border-brand-accent
                                  hover:text-brand-primary
                                `
                            }
                          `}
                        >
                          {range}
                        </button>
                      );
                    },
                  )}
                </div>
              </ProfileSection>

              {/* =================================================
                  CONTINUE
              ================================================== */}

              <button
                type="button"
                disabled={!isComplete}
                onClick={handleContinue}
                className="
                  group
                  mt-3
                  flex
                  min-h-[54px]
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-[14px]
                  px-6
                  text-[14px]
                  font-bold
                  text-white
                  shadow-[0_12px_30px_rgba(0,70,109,0.18)]
                  transition-all

                  hover:-translate-y-0.5
                  hover:opacity-95

                  focus-visible:outline-none
                  focus-visible:ring-4
                  focus-visible:ring-brand-accent/25

                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  disabled:hover:translate-y-0
                "
                style={{
                  background: isComplete
                    ? 'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)'
                    : '#00466D',
                }}
              >
                Continue to Plan Selection

                <ArrowRight
                  className="
                    h-4
                    w-4
                    transition-transform
                    group-hover:translate-x-1
                  "
                />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer
        className="
          fixed
          inset-x-0
          bottom-0
          z-50
          border-t
          border-brand-border/70
          bg-brand-bg/90
          backdrop-blur-md
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[58px]
            max-w-[1480px]
            items-center
            justify-center
            px-6
            text-center
            text-[12px]
            text-brand-textMuted
          "
        >
          © {new Date().getFullYear()}{' '}

          <span
            className="
              ml-1
              font-bold
              text-brand-primary
            "
          >
            UpperLevel Group
          </span>

          <span>
            . All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}

/* =========================================================
   PUBLIC NAV LINK — ROLECHOICE STYLE
========================================================= */

interface PublicNavLinkProps {
  to: string;
  label: string;
  end?: boolean;
}

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
   PROFILE SECTION
========================================================= */

interface ProfileSectionProps {
  title: string;
  subtitle?: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function ProfileSection({
  title,
  subtitle,
  required = false,
  icon,
  children,
}: ProfileSectionProps) {
  return (
    <section className="space-y-4">
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div>
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
            {icon && (
              <span className="text-brand-accent">
                {icon}
              </span>
            )}

            {title}
          </div>

          {subtitle && (
            <p
              className="
                mt-1
                text-[12px]
                text-brand-textMuted
              "
            >
              {subtitle}
            </p>
          )}
        </div>

        <span
          className={`
            shrink-0
            rounded-full
            border
            px-2.5
            py-1
            text-[10px]
            font-bold
            uppercase
            tracking-[0.1em]

            ${
              required
                ? `
                  border-brand-accent/30
                  bg-brand-accent/10
                  text-brand-primary
                `
                : `
                  border-brand-border
                  bg-brand-surface
                  text-brand-textMuted
                `
            }
          `}
        >
          {required
            ? 'Required'
            : 'Optional'}
        </span>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   DIVIDER
========================================================= */

function Divider() {
  return (
    <div
      className="
        h-px
        w-full
        bg-brand-border
      "
    />
  );
}

/* =========================================================
   MEDIA CHOICE
========================================================= */

interface MediaChoiceProps {
  cameraLabel: string;
  uploadLabel: string;
  onCamera: () => void;
  onUpload: () => void;
  video?: boolean;
}

function MediaChoice({
  cameraLabel,
  uploadLabel,
  onCamera,
  onUpload,
  video = false,
}: MediaChoiceProps) {
  const Icon = video ? Video : Camera;

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-3

        sm:grid-cols-2
      "
    >
      <button
        type="button"
        onClick={onCamera}
        className="
          flex
          min-h-[52px]
          items-center
          justify-center
          gap-2
          rounded-[14px]
          border
          border-brand-accent/30
          bg-brand-accent/10
          px-4
          text-[12px]
          font-bold
          text-brand-primary
          transition

          hover:border-brand-accent
          hover:bg-brand-accent/15

          focus-visible:outline-none
          focus-visible:ring-4
          focus-visible:ring-brand-accent/20
        "
      >
        <Icon className="h-4 w-4" />

        {cameraLabel}
      </button>

      <button
        type="button"
        onClick={onUpload}
        className="
          flex
          min-h-[52px]
          items-center
          justify-center
          gap-2
          rounded-[14px]
          border
          border-brand-border
          bg-white
          px-4
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
        <Upload className="h-4 w-4" />

        {uploadLabel}
      </button>
    </div>
  );
}

/* =========================================================
   COMPLETED ROW
========================================================= */

interface CompletedRowProps {
  text: string;
  onRetake: () => void;
}

function CompletedRow({
  text,
  onRetake,
}: CompletedRowProps) {
  return (
    <div
      className="
        flex
        flex-col
        gap-2

        sm:flex-row
      "
    >
      <div
        className="
          flex
          flex-1
          items-center
          justify-center
          gap-2
          rounded-[13px]
          border
          border-brand-emerald/40
          bg-brand-emerald/10
          px-4
          py-2.5
          text-[12px]
          font-bold
          text-brand-dark
        "
      >
        <CheckCircle2
          className="
            h-4
            w-4
            text-brand-emerald
          "
        />

        {text}
      </div>

      <button
        type="button"
        onClick={onRetake}
        className="
          flex
          items-center
          justify-center
          gap-2
          rounded-[13px]
          border
          border-brand-border
          bg-white
          px-4
          py-2.5
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
        <RotateCcw className="h-4 w-4" />

        Retake
      </button>
    </div>
  );
}

/* =========================================================
   PRIMARY BUTTON
========================================================= */

interface PrimaryButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

function PrimaryButton({
  onClick,
  children,
}: PrimaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        mx-auto
        flex
        min-h-[50px]
        w-full
        max-w-[260px]
        items-center
        justify-center
        rounded-[14px]
        px-5
        text-[12px]
        font-bold
        text-white
        shadow-[0_10px_25px_rgba(0,70,109,0.18)]
        transition

        hover:-translate-y-0.5
        hover:opacity-95

        focus-visible:outline-none
        focus-visible:ring-4
        focus-visible:ring-brand-accent/25
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