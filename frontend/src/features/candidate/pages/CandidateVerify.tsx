import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react';

import {
  ArrowLeft,
  CheckCircle2,
  LockKeyhole,
  MailCheck,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';

import {
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';

/* =========================================================
   TYPES
========================================================= */

type CandidateVerifyLocationState = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

/* =========================================================
   PUBLIC NAV LINK
========================================================= */

type PublicNavLinkProps = {
  to: string;
  label: string;
  end?: boolean;
};

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
        flex
        h-full
        items-center
        text-sm
        no-underline
        transition-colors

        ${
          isActive
            ? 'font-bold text-brand-primary'
            : 'font-semibold text-brand-textMuted hover:text-brand-primary'
        }
      `}
    >
      {({ isActive }) => (
        <>
          {label}

          {isActive && (
            <span
              aria-hidden="true"
              className="
                absolute
                bottom-[17px]
                left-1/2
                h-[3px]
                w-8
                -translate-x-1/2
                rounded-full
                bg-brand-gold
              "
            />
          )}
        </>
      )}
    </NavLink>
  );
}

/* =========================================================
   CANDIDATE VERIFY
========================================================= */

export default function CandidateVerify() {
  const location = useLocation();
  const navigate = useNavigate();

  const state =
    location.state as CandidateVerifyLocationState | null;

  const email =
    state?.email
      ?.trim()
      .toLowerCase() ?? '';

  const firstName =
    state?.firstName?.trim() ?? '';

  const [code, setCode] =
    useState('');

  const [error, setError] =
    useState('');

  const [submitting, setSubmitting] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  /* =======================================================
     VERIFY
  ======================================================= */

  const handleVerify = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError('');

    const cleanCode =
      code.trim();

    /*
     * TEMPORARY DEVELOPMENT VERIFICATION
     *
     * Any six-digit number is accepted.
     * Replace this with Supabase OTP verification later.
     */

    if (!/^\d{6}$/.test(cleanCode)) {
      setError(
        'Enter a valid 6-digit verification code.',
      );

      return;
    }

    setSubmitting(true);

    try {
      await new Promise<void>(
        (resolve) => {
          window.setTimeout(
            resolve,
            500,
          );
        },
      );

      navigate(
        '/candidate/profile-setup',
        {
          replace: true,

          state: {
            firstName:
              state?.firstName,

            lastName:
              state?.lastName,

            email,
          },
        },
      );
    } catch (err: unknown) {
      console.error(
        'Candidate verification failed:',
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : 'We could not complete verification. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     CODE INPUT
  ======================================================= */

  const handleCodeChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    const numericCode =
      event.target.value
        .replace(/\D/g, '')
        .slice(0, 6);

    setCode(
      numericCode,
    );

    if (error) {
      setError('');
    }
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
          DECORATIVE BRAND SHAPES
      ====================================================== */}

      {/* GOLD RING */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          -right-[260px]
          -top-[170px]
          z-[3]
          hidden
          h-[600px]
          w-[600px]
          rounded-full
          border-[72px]
          border-brand-gold/80
          lg:block
        "
      />

      {/* BLUE CIRCLE */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          -bottom-[210px]
          -left-[180px]
          z-[3]
          hidden
          h-[440px]
          w-[440px]
          rounded-full
          bg-brand-accent/15
          lg:block
        "
      />

      {/* =====================================================
          PUBLIC NAVBAR
      ====================================================== */}

      <header
        className="
          relative
          z-50
          border-b
          border-brand-border
          bg-white/95
          shadow-[0_4px_18px_rgba(0,70,109,0.05)]
          backdrop-blur-xl
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
            gap-5
            px-5
            sm:px-8
            lg:px-10
          "
        >
          {/* =================================================
              LOGO + TAGLINE
          ================================================== */}

          <NavLink
            to="/"
            aria-label="TruCity home"
            className="
              flex
              shrink-0
              items-center
              gap-3
              no-underline
            "
          >
            <img
              src="/trucity-logo.png"
              alt="TruCity"
              draggable={false}
              className="
                h-[64px]
                w-[90px]
                select-none
                object-contain
                sm:h-[70px]
                sm:w-[100px]
              "
            />

            <span
              className="
                hidden
                whitespace-nowrap
                text-[7px]
                font-bold
                uppercase
                tracking-[0.22em]
                text-brand-primary
                md:block
              "
            >
              Verify • Connect • Pursue
            </span>
          </NavLink>

          {/* =================================================
              DESKTOP NAV
          ================================================== */}

          <nav
            aria-label="Public navigation"
            className="
              hidden
              h-full
              items-center
              gap-8
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

          {/* =================================================
              ACTIONS
          ================================================== */}

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <NavLink
              to="/login"
              className="
                hidden
                min-h-[46px]
                shrink-0
                items-center
                justify-center
                rounded-[14px]
                border
                border-brand-primary
                bg-white/95
                px-5
                text-sm
                font-bold
                text-brand-primary
                no-underline
                shadow-sm
                backdrop-blur-sm
                transition-all

                hover:bg-brand-primary
                hover:text-white

                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-accent/25

                sm:inline-flex
              "
            >
              Sign In
            </NavLink>

            {/* MOBILE MENU */}

            <button
              type="button"
              aria-label={
                mobileMenuOpen
                  ? 'Close navigation'
                  : 'Open navigation'
              }
              aria-expanded={mobileMenuOpen}
              onClick={() =>
                setMobileMenuOpen(
                  (current) =>
                    !current,
                )
              }
              className="
                grid
                h-11
                w-11
                place-items-center
                rounded-[13px]
                border
                border-brand-border
                bg-white/95
                text-brand-primary
                shadow-sm
                backdrop-blur-sm
                transition

                hover:bg-brand-surface

                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-accent/25

                lg:hidden
              "
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* =================================================
            MOBILE MENU PANEL
        ================================================== */}

        {mobileMenuOpen && (
          <div
            className="
              border-t
              border-brand-border
              bg-white/95
              px-5
              py-4
              shadow-lg
              backdrop-blur-xl
              lg:hidden
            "
          >
            <nav
              className="
                mx-auto
                grid
                max-w-[1480px]
                gap-1
              "
            >
              {[
                {
                  label: 'Home',
                  to: '/',
                },
                {
                  label: 'Guidance Hub',
                  to: '/guidance',
                },
                {
                  label: 'About',
                  to: '/about',
                },
                {
                  label: 'Contact',
                  to: '/contact',
                },
              ].map(
                (item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() =>
                      setMobileMenuOpen(
                        false,
                      )
                    }
                    className={({ isActive }) => `
                      rounded-[12px]
                      px-4
                      py-3
                      text-sm
                      font-bold
                      no-underline
                      transition

                      ${
                        isActive
                          ? 'bg-brand-accent/10 text-brand-primary'
                          : 'text-brand-textMuted hover:bg-brand-surface hover:text-brand-primary'
                      }
                    `}
                  >
                    {item.label}
                  </NavLink>
                ),
              )}

              <NavLink
                to="/login"
                onClick={() =>
                  setMobileMenuOpen(
                    false,
                  )
                }
                className="
                  mt-2
                  flex
                  min-h-[44px]
                  items-center
                  justify-center
                  rounded-[12px]
                  bg-brand-primary
                  px-4
                  text-sm
                  font-bold
                  text-white
                  no-underline
                  sm:hidden
                "
              >
                Sign In
              </NavLink>
            </nav>
          </div>
        )}
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main
        className="
          relative
          z-10
          mx-auto
          grid
          min-h-[calc(100dvh-88px)]
          w-full
          max-w-[1280px]
          items-center
          gap-10
          bg-transparent
          px-5
          py-10
          sm:px-8
          lg:grid-cols-[minmax(0,0.9fr)_minmax(440px,0.75fr)]
          lg:px-10
          lg:py-14
        "
      >
        {/* =================================================
            LEFT SIDE
        ================================================== */}

        <section
          className="
            hidden
            max-w-[550px]
            lg:block
          "
        >
          <div
            className="
              mb-5
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
            <ShieldCheck className="h-3.5 w-3.5" />

            Account security
          </div>

          <h1
            className="
              !m-0
              text-[48px]
              font-bold
              leading-[1.03]
              tracking-[-0.045em]
              !text-brand-primary
              xl:text-[58px]
            "
          >
            Verify your
            <br />

            <span className="text-brand-gold">
              email address.
            </span>
          </h1>

          <p
            className="
              mt-5
              max-w-[500px]
              text-base
              leading-7
              text-brand-textMuted
            "
          >
            Verification helps protect your account and ensures
            important opportunity and account notifications reach
            the correct email address.
          </p>

          <div
            className="
              mt-8
              space-y-4
            "
          >
            <SecurityPoint>
              Confirms the email associated with your account.
            </SecurityPoint>

            <SecurityPoint>
              Helps keep your TruCity profile secure.
            </SecurityPoint>

            <SecurityPoint>
              Allows you to continue to your profile setup.
            </SecurityPoint>
          </div>

          <div
            className="
              mt-10
              inline-flex
              items-center
              gap-2
              text-[10px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-brand-primary
            "
          >
            Verify • Connect • Pursue
          </div>
        </section>

        {/* =================================================
            VERIFICATION CARD
        ================================================== */}

        <section
          className="
            mx-auto
            w-full
            max-w-[500px]
          "
        >
          <div
            className="
              overflow-hidden
              rounded-[28px]
              border
              border-brand-border
              bg-white/95
              shadow-[0_24px_65px_rgba(0,70,109,0.13)]
              backdrop-blur-sm
            "
          >
            {/* CARD TOP */}

            <div
              className="
                border-b
                border-brand-border
                px-6
                pb-6
                pt-7
                text-center
                sm:px-8
                sm:pt-8
              "
            >
              <div
                className="
                  mx-auto
                  grid
                  h-14
                  w-14
                  place-items-center
                  rounded-[18px]
                  bg-brand-accent/10
                  text-brand-primary
                "
              >
                <MailCheck className="h-7 w-7" />
              </div>

              <p
                className="
                  mt-5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-brand-accent
                "
              >
                Email Verification
              </p>

              <h2
                className="
                  !m-0
                  mt-2
                  text-2xl
                  font-bold
                  tracking-[-0.025em]
                  !text-brand-primary
                  sm:text-3xl
                "
              >
                Check your email
              </h2>

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-[390px]
                  text-sm
                  leading-6
                  text-brand-textMuted
                "
              >
                {firstName
                  ? `${firstName}, enter the 6-digit verification code sent to`
                  : 'Enter the 6-digit verification code sent to'}

                {email ? (
                  <span
                    className="
                      mt-1
                      block
                      break-all
                      font-bold
                      text-brand-primary
                    "
                  >
                    {email}
                  </span>
                ) : (
                  <span
                    className="
                      mt-1
                      block
                      font-bold
                      text-brand-primary
                    "
                  >
                    your registered email address
                  </span>
                )}
              </p>
            </div>

            {/* =================================================
                FORM
            ================================================== */}

            <div
              className="
                px-6
                py-6
                sm:px-8
                sm:py-7
              "
            >
              {/* TEMP DEVELOPMENT MESSAGE */}

              <div
                className="
                  mb-6
                  flex
                  items-start
                  gap-3
                  rounded-[15px]
                  border
                  border-brand-warning/60
                  bg-brand-warning/15
                  px-4
                  py-3
                "
              >
                <LockKeyhole
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    text-brand-dark
                  "
                />

                <div>
                  <p
                    className="
                      text-xs
                      font-bold
                      text-brand-dark
                    "
                  >
                    Development verification
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[11px]
                      leading-5
                      text-brand-textMuted
                    "
                  >
                    Email delivery is temporarily disabled. Any
                    6-digit number can be used while this flow is
                    being tested.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleVerify}
                noValidate
                className="space-y-5"
              >
                <div>
                  <div
                    className="
                      mb-2
                      flex
                      items-center
                      justify-between
                      gap-3
                    "
                  >
                    <label
                      htmlFor="verificationCode"
                      className="
                        text-sm
                        font-bold
                        text-brand-primary
                      "
                    >
                      Verification code
                    </label>

                    <span
                      className="
                        text-[10px]
                        font-bold
                        text-brand-textMuted
                      "
                    >
                      6 digits
                    </span>
                  </div>

                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={handleCodeChange}
                    placeholder="000000"
                    disabled={submitting}
                    autoFocus
                    className="
                      h-[62px]
                      w-full
                      rounded-[15px]
                      border
                      border-brand-border
                      bg-white/90
                      px-4
                      text-center
                      font-mono
                      text-2xl
                      font-bold
                      tracking-[0.35em]
                      text-brand-dark
                      outline-none
                      transition
                      placeholder:text-brand-textMuted/40

                      focus:border-brand-accent
                      focus:bg-white
                      focus:ring-4
                      focus:ring-brand-accent/15

                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  />
                </div>

                {/* ERROR */}

                {error && (
                  <div
                    role="alert"
                    className="
                      rounded-[14px]
                      border
                      border-brand-crimson/30
                      bg-brand-crimson/10
                      px-4
                      py-3
                      text-xs
                      font-semibold
                      text-brand-crimson
                    "
                  >
                    {error}
                  </div>
                )}

                {/* CONTINUE */}

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    code.length !== 6
                  }
                  className="
                    flex
                    min-h-[50px]
                    w-full
                    items-center
                    justify-center
                    rounded-[14px]
                    bg-brand-primary
                    px-5
                    text-sm
                    font-bold
                    text-white
                    shadow-[0_12px_25px_rgba(0,70,109,0.18)]
                    transition-all

                    hover:bg-brand-dark

                    focus-visible:outline-none
                    focus-visible:ring-4
                    focus-visible:ring-brand-accent/25

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    disabled:hover:bg-brand-primary
                  "
                >
                  {submitting
                    ? 'Verifying...'
                    : 'Verify & Continue'}
                </button>
              </form>

              {/* =================================================
                  CARD FOOTER
              ================================================== */}

              <div
                className="
                  mt-6
                  border-t
                  border-brand-border
                  pt-5
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      '/register/candidate',
                    )
                  }
                  className="
                    mx-auto
                    flex
                    items-center
                    gap-2
                    text-xs
                    font-bold
                    text-brand-textMuted
                    transition

                    hover:text-brand-primary

                    focus-visible:outline-none
                    focus-visible:ring-4
                    focus-visible:ring-brand-accent/20
                  "
                >
                  <ArrowLeft className="h-3.5 w-3.5" />

                  Back to registration
                </button>
              </div>
            </div>
          </div>

          {/* SECURITY NOTE */}

          <div
            className="
              mt-5
              flex
              items-start
              justify-center
              gap-2
              px-4
              text-center
              text-[10px]
              leading-5
              text-brand-textMuted
            "
          >
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />

            Verification codes should never be shared with another person.
          </div>
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   SECURITY POINT
========================================================= */

function SecurityPoint({
  children,
}: {
  children: ReactNode;
}) {
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
          mt-0.5
          grid
          h-6
          w-6
          shrink-0
          place-items-center
          rounded-full
          bg-brand-accent/10
          text-brand-primary
        "
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
      </div>

      <p
        className="
          text-sm
          leading-6
          text-brand-textMuted
        "
      >
        {children}
      </p>
    </div>
  );
}