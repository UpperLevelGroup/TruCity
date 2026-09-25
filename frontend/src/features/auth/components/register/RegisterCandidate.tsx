import { Link } from 'react-router-dom';

import { useRegisterCandidate } from './useRegisterCandidate';
import AuthShell from '../../../../components/ui/AuthShell';

export default function RegisterCandidate() {
  const {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    submitting,
    handleSubmit,
  } = useRegisterCandidate();

  return (
    <AuthShell
      title="WELCOME"
      body={
        <>
          <p>
            Let&apos;s help you upgrade your Monday mornings by
            landing your dream desk.
          </p>

          <p className="mt-6 font-semibold text-brand-primary">
            Where Truth and Authenticity meet.
          </p>
        </>
      }
    >
      <div
        className="
          relative
          w-full
          max-w-[560px]
          overflow-hidden
          rounded-[24px]
          border
          border-brand-border
          bg-white
          p-6
          font-sans
          shadow-[0_18px_45px_rgba(0,39,61,0.08)]

          sm:p-8
          lg:p-9
        "
      >
        {/* =====================================================
            TOP ROW
        ====================================================== */}

        <div
          className="
            relative
            z-10
            mb-6
            flex
            items-center
            justify-between
            gap-4
          "
        >
          {/* Candidate Registration Label */}

          <div
            className="
              inline-flex
              items-center
              justify-center
              rounded-[12px]
              bg-brand-primary
              px-5
              py-2.5
              text-[12px]
              font-medium
              uppercase
              tracking-[0.1em]
              text-white
            "
          >
            Candidate Registration
          </div>

          {/* Desktop Sign In */}

          <Link
            to="/login"
            className="
              hidden
              text-[12px]
              font-medium
              text-brand-textMuted
              no-underline
              transition-colors
              duration-150

              hover:text-brand-primary

              focus-visible:rounded-md
              focus-visible:outline-none
              focus-visible:ring-4
              focus-visible:ring-brand-accent/20

              sm:block
            "
          >
            Already registered?{' '}
            <span className="font-bold text-brand-primary">
              Sign In
            </span>
          </Link>
        </div>

        {/* =====================================================
            TITLE
        ====================================================== */}

        <div
          className="
            relative
            z-10
            mb-7
            text-center

            sm:text-left
          "
        >
          <h1
            className="
              !m-0
              text-[32px]
              font-bold
              leading-[1.1]
              tracking-[-0.025em]
              !text-brand-primary

              sm:text-[36px]
            "
          >
            Create Your Account
          </h1>

          <p
            className="
              mt-2
              text-[14px]
              font-normal
              leading-6
              text-brand-textMuted
            "
          >
            Enter your details below to get started.
          </p>
        </div>

        {/* =====================================================
            FORM
        ====================================================== */}

        <form
          onSubmit={handleSubmit}
          className="
            relative
            z-10
            space-y-4
          "
          noValidate
        >
          {/* First + Last Name */}

          <div
            className="
              grid
              gap-4

              sm:grid-cols-2
            "
          >
            <Field
              id="firstName"
              label="First Name"
              value={firstName}
              onChange={setFirstName}
              placeholder="First Name"
              autoComplete="given-name"
              disabled={submitting}
            />

            <Field
              id="lastName"
              label="Surname"
              value={lastName}
              onChange={setLastName}
              placeholder="Surname"
              autoComplete="family-name"
              disabled={submitting}
            />
          </div>

          {/* Email */}

          <Field
            id="email"
            type="email"
            label="Email Address"
            value={email}
            onChange={setEmail}
            placeholder="name@example.com"
            autoComplete="email"
            disabled={submitting}
          />

          {/* Password */}

          <Field
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Create Password (min. 8 characters)"
            autoComplete="new-password"
            disabled={submitting}
          />

          {/* Confirm Password */}

          <Field
            id="confirmPassword"
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm Password"
            autoComplete="new-password"
            disabled={submitting}
          />

          {/* =================================================
              ERROR — STATUS COLOUR
          ================================================== */}

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="
                rounded-[12px]
                border
                border-brand-crimson/30
                bg-brand-crimson/10
                px-4
                py-3
                text-[14px]
                font-medium
                leading-5
                text-brand-dark
              "
            >
              {error}
            </div>
          )}

          {/* =================================================
              REGISTER BUTTON
              Gradient allowed on button per brand guidelines
          ================================================== */}

          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="
              mx-auto
              mt-3
              flex
              min-h-[52px]
              w-full
              max-w-[240px]
              items-center
              justify-center
              rounded-[15px]
              border-0
              px-6
              text-[14px]
              font-bold
              text-white
              shadow-[0_8px_20px_rgba(0,70,109,0.14)]
              transition-all
              duration-200

              hover:-translate-y-0.5
              hover:shadow-[0_12px_26px_rgba(0,70,109,0.18)]

              focus-visible:outline-none
              focus-visible:ring-4
              focus-visible:ring-brand-accent/25

              active:translate-y-0

              disabled:cursor-not-allowed
              disabled:opacity-60
              disabled:hover:translate-y-0
            "
            style={{
              background:
                'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)',
            }}
          >
            {submitting
              ? 'Creating account...'
              : 'Register Account'}
          </button>
        </form>

        {/* =====================================================
            MOBILE SIGN IN
        ====================================================== */}

        <div
          className="
            relative
            z-10
            mt-6
            border-t
            border-brand-border
            pt-5
            text-center

            sm:hidden
          "
        >
          <p
            className="
              text-[14px]
              font-normal
              text-brand-textMuted
            "
          >
            Already registered?{' '}

            <Link
              to="/login"
              className="
                font-bold
                text-brand-primary
                no-underline
                transition-colors

                hover:text-brand-dark

                focus-visible:rounded-md
                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-accent/20
              "
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}

/* =========================================================
   FIELD
========================================================= */

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  disabled?: boolean;
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
  disabled,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="
          mb-1.5
          block
          text-[12px]
          font-medium
          text-brand-primary
        "
      >
        {label}
      </label>

      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        required
        className="
          min-h-[48px]
          w-full
          rounded-[12px]
          border
          border-brand-border
          bg-white
          px-4
          py-3
          text-[14px]
          font-normal
          text-brand-dark
          outline-none
          transition-all
          duration-150

          placeholder:text-brand-textMuted/60

          hover:border-brand-primary/40

          focus:border-brand-accent
          focus:ring-4
          focus:ring-brand-accent/15

          disabled:cursor-not-allowed
          disabled:bg-brand-surface
          disabled:opacity-60
        "
      />
    </div>
  );
}