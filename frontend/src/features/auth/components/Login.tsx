import { useState } from 'react';
import type { SyntheticEvent } from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import AuthShell from '../../../components/auth/AuthShell';
import { loginUser } from '../../../api/authApi';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [error, setError] =
    useState('');

  const [submitting, setSubmitting] =
    useState(false);

  const handleSubmit = async (
    event: SyntheticEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError('');

    if (
      !email.trim() ||
      !password
    ) {
      setError(
        'Please enter your email and password.',
      );

      return;
    }

    setSubmitting(true);

    try {
      const response =
        await loginUser({
          email: email.trim(),
          password,
        });

      console.log(
        'LOGIN RESPONSE:',
        response,
      );

      console.log(
        'ACCESS TOKEN:',
        response.accessToken,
      );

      console.log(
        'ROLE:',
        response.role,
      );

      if (!response.accessToken) {
        throw new Error(
          'Login succeeded but no access token was returned.',
        );
      }

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
       * Store authentication information.
       */
      localStorage.setItem(
        'token',
        response.accessToken,
      );

      localStorage.setItem(
        'role',
        role,
      );

      console.log(
        'STORED TOKEN:',
        localStorage.getItem(
          'token',
        ),
      );

      console.log(
        'STORED ROLE:',
        localStorage.getItem(
          'role',
        ),
      );

      /*
       * Redirect based on authenticated role.
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
          console.warn(
            'Unknown user role:',
            role,
          );

          navigate('/dashboard', {
            replace: true,
          });

          break;
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
      title="Welcome back."
      body={
        <>
          Sign in to your TruCity account
          to continue connecting with
          verified opportunities and
          trusted professionals.
        </>
      }
    >
      <div
        className="
          w-full
          max-w-[520px]
          rounded-[20px]
          border
          border-brand-border
          bg-white
          p-6
          shadow-[0_18px_45px_rgba(0,70,109,0.10)]

          sm:p-8

          lg:p-10
        "
      >
        {/* ===============================================
            FORM HEADER
        ================================================ */}

        <div className="mb-7">
          <span
            className="
              inline-flex
              rounded-full
              border
              border-brand-accent/20
              bg-brand-accent/10
              px-3
              py-1
              text-[11px]
              font-bold
              uppercase
              tracking-[0.12em]
              text-brand-primary
            "
          >
            Welcome Back
          </span>

          <h2
            className="
              !m-0
              mt-4
              text-[28px]
              font-bold
              leading-tight
              tracking-[-0.025em]
              text-brand-primary

              sm:text-[32px]
            "
          >
            Login to TruCity
          </h2>

          <p
            className="
              mt-2
              text-[14px]
              leading-6
              text-brand-textMuted
            "
          >
            Sign in to continue to your
            account.
          </p>
        </div>

        {/* ===============================================
            LOGIN FORM
        ================================================ */}

        <form
          onSubmit={handleSubmit}
          className="
            flex
            flex-col
            gap-5
          "
        >
          {/* EMAIL */}

          <div>
            <label
              htmlFor="email"
              className="
                mb-2
                block
                text-[13px]
                font-bold
                text-brand-primary
              "
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              autoComplete="email"
              disabled={submitting}
              className="
                block
                w-full
                rounded-[12px]
                border
                border-brand-border
                bg-brand-bg
                px-4
                py-3.5
                text-[14px]
                text-brand-dark
                outline-none
                transition-all
                duration-200
                placeholder:text-slate-400

                focus:border-brand-accent
                focus:bg-white
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
                htmlFor="password"
                className="
                  text-[13px]
                  font-bold
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
                  text-brand-primary
                  no-underline
                  transition-colors
                  duration-150

                  hover:text-brand-accent
                "
              >
                Forgot password?
              </Link>
            </div>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              autoComplete="current-password"
              disabled={submitting}
              className="
                block
                w-full
                rounded-[12px]
                border
                border-brand-border
                bg-brand-bg
                px-4
                py-3.5
                text-[14px]
                text-brand-dark
                outline-none
                transition-all
                duration-200
                placeholder:text-slate-400

                focus:border-brand-accent
                focus:bg-white
                focus:ring-4
                focus:ring-brand-accent/10

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
                rounded-[12px]
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

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={submitting}
            className="
              mt-1
              inline-flex
              min-h-[48px]
              w-full
              items-center
              justify-center
              rounded-[14px]
              border
              border-brand-primary
              bg-brand-primary
              px-5
              text-[14px]
              font-bold
              text-white
              transition-all
              duration-200

              hover:-translate-y-0.5
              hover:bg-brand-dark
              hover:shadow-[0_10px_24px_rgba(0,70,109,0.16)]

              focus-visible:outline-none
              focus-visible:ring-4
              focus-visible:ring-brand-accent/25

              disabled:cursor-not-allowed
              disabled:opacity-60
              disabled:hover:translate-y-0
              disabled:hover:shadow-none
            "
          >
            {submitting
              ? 'Signing in...'
              : 'Sign In'}
          </button>
        </form>

        {/* ===============================================
            REGISTER
        ================================================ */}

        <div
          className="
            mt-7
            border-t
            border-brand-border
            pt-6
            text-center
          "
        >
          <p
            className="
              !m-0
              text-[13px]
              text-brand-textMuted
            "
          >
            Don't have an account?{' '}

            <Link
              to="/register"
              className="
                font-bold
                text-brand-primary
                no-underline
                transition-colors
                duration-150

                hover:text-brand-accent
              "
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
