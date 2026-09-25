import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { SyntheticEvent } from 'react';

import AuthShell from '../../../../components/ui/AuthShell';
import { loginUser } from '../../../../api/authApi';

interface LoginProps {
  onLoginSuccess?: () => void;
}

export default function Login({
  onLoginSuccess,
}: LoginProps) {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (
    event: SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError('');

    if (!email.trim() || !password) {
      setError(
        'Please enter your email and password.',
      );

      return;
    }

    setSubmitting(true);

    try {
      /*
       * Authenticate against the real
       * Spring Boot login endpoint.
       */
      const response = await loginUser({
        email: email.trim(),
        password,
      });

      console.log(
        'LOGIN RESPONSE:',
        response,
      );

      /*
       * The backend must return an access token.
       */
      if (!response?.accessToken) {
        throw new Error(
          'Login succeeded but no access token was returned.',
        );
      }

      /*
       * Normalize the role so values such as
       * employer, Employer and EMPLOYER
       * are handled consistently.
       */
      const role = String(
        response.role ?? '',
      )
        .trim()
        .toUpperCase();

      if (!role) {
        throw new Error(
          'Login succeeded but no user role was returned.',
        );
      }

      /*
       * Store the JWT used by the shared Axios
       * interceptor for authenticated requests.
       */
      localStorage.setItem(
        'token',
        response.accessToken,
      );

      /*
       * Store the user's role for frontend routing.
       */
      localStorage.setItem(
        'role',
        role,
      );

      console.log(
        'AUTHENTICATED ROLE:',
        role,
      );

      /*
       * Notify parent component if supplied.
       */
      onLoginSuccess?.();

      /*
       * Route the user to the correct portal.
       */
      switch (role) {
        case 'ADMIN':
          navigate('/admin', {
            replace: true,
          });
          break;

        case 'EMPLOYER':
          navigate('/company', {
            replace: true,
          });
          break;

        case 'CANDIDATE':
          navigate('/candidate', {
            replace: true,
          });
          break;

        case 'VERIFIER':
          navigate('/dashboard', {
            replace: true,
          });
          break;

        default:
          /*
           * Unknown roles should not silently
           * be treated as another role.
           */
          console.warn(
            'Unknown user role:',
            role,
          );

          setError(
            `Your account has an unsupported role: ${role}.`,
          );

          return;
      }
    } catch (err: any) {
      console.error(
        'LOGIN ERROR:',
        err,
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Invalid email or password.';

      setError(
        typeof message === 'string'
          ? message
          : 'Invalid email or password.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="WELCOME BACK"
      body={
        <>
          <p>
            Your next opportunity is still waiting.
          </p>

          <p className="mt-7 font-semibold text-brand-primary">
            Sign in and keep moving forward.
          </p>
        </>
      }
    >
      <div
        className="
          w-full
          max-w-[520px]
          rounded-[24px]
          border
          border-brand-border
          bg-white
          p-6
          shadow-[0_18px_50px_rgba(0,70,109,0.10)]

          sm:p-8
          lg:p-9
        "
      >
        {/* =================================================
            FORM HEADER
        ================================================== */}

        <div className="mb-8 text-center">
          <p
            className="
              text-[12px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-brand-primary
            "
          >
            TruCity Sign In
          </p>

          <h1
            className="
              !m-0
              mt-3
              text-[30px]
              font-bold
              leading-[1.12]
              tracking-[-0.03em]
              !text-brand-primary

              sm:text-[34px]
            "
          >
            Welcome back
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
            Sign in to your TruCity account
          </p>
        </div>

        {/* =================================================
            LOGIN FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* EMAIL */}

          <div>
            <label
              htmlFor="login-email"
              className="
                mb-2
                block
                text-[12px]
                font-semibold
                text-brand-primary
              "
            >
              Email Address
            </label>

            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="name@example.com"
              disabled={submitting}
              className="
                min-h-[50px]
                w-full
                rounded-[14px]
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
                duration-200

                placeholder:text-brand-textMuted/65

                hover:border-brand-accent/60

                focus:border-brand-accent
                focus:ring-4
                focus:ring-brand-accent/10

                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />
          </div>

          {/* PASSWORD */}

          <div>
            <div
              className="
                mb-2
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <label
                htmlFor="login-password"
                className="
                  text-[12px]
                  font-semibold
                  text-brand-primary
                "
              >
                Password
              </label>

              <Link
                to="/forgot-password"
                className="
                  text-[12px]
                  font-semibold
                  text-brand-accent
                  no-underline
                  transition-colors
                  duration-150

                  hover:text-brand-primary
                  hover:underline

                  focus-visible:rounded-md
                  focus-visible:outline-none
                  focus-visible:ring-4
                  focus-visible:ring-brand-accent/15
                "
              >
                Forgot password?
              </Link>
            </div>

            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              disabled={submitting}
              className="
                min-h-[50px]
                w-full
                rounded-[14px]
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
                duration-200

                hover:border-brand-accent/60

                focus:border-brand-accent
                focus:ring-4
                focus:ring-brand-accent/10

                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />
          </div>

          {/* =================================================
              ERROR
          ================================================== */}

          {error && (
            <div
              role="alert"
              className="
                rounded-[14px]
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-[13px]
                leading-5
                text-red-700
              "
            >
              {error}
            </div>
          )}

          {/* =================================================
              SIGN IN BUTTON
          ================================================== */}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="
                mx-auto
                flex
                min-h-[52px]
                w-full
                max-w-[220px]
                items-center
                justify-center
                rounded-[14px]
                px-6
                text-[14px]
                font-bold
                text-white
                shadow-[0_10px_24px_rgba(0,70,109,0.16)]
                transition-all
                duration-200

                hover:-translate-y-0.5
                hover:shadow-[0_14px_28px_rgba(0,70,109,0.20)]

                active:translate-y-0

                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-accent/25

                disabled:cursor-not-allowed
                disabled:opacity-60
                disabled:hover:translate-y-0
                disabled:hover:shadow-[0_10px_24px_rgba(0,70,109,0.16)]
              "
              style={{
                background:
                  'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)',
              }}
            >
              {submitting
                ? 'Signing in...'
                : 'Sign In'}
            </button>
          </div>
        </form>

        {/* =================================================
            REGISTER LINK
        ================================================== */}

        <div
          className="
            mt-8
            border-t
            border-brand-border
            pt-5
            text-center
            text-[12px]
            font-normal
            text-brand-textMuted
          "
        >
          Don&apos;t have an account?{' '}

          <Link
            to="/register"
            className="
              font-bold
              text-brand-primary
              no-underline
              transition-colors
              duration-150

              hover:text-brand-accent
              hover:underline

              focus-visible:rounded-md
              focus-visible:outline-none
              focus-visible:ring-4
              focus-visible:ring-brand-accent/15
            "
          >
            Register here
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
