import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { registerUser } from '../../../../api/authApi';

import {
  savePendingCandidateRegistration,
} from './candidateRegistrationStorage';

export function useRegisterCandidate() {
  const navigate = useNavigate();

  const [firstName, setFirstName] =
    useState('');

  const [lastName, setLastName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
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

    const cleanFirstName =
      firstName.trim();

    const cleanLastName =
      lastName.trim();

    const cleanEmail =
      email.trim();

    /*
     * =====================================================
     * VALIDATION
     * =====================================================
     */
    if (
      !cleanFirstName ||
      !cleanLastName ||
      !cleanEmail ||
      !password ||
      !confirmPassword
    ) {
      setError(
        'Please complete all required fields.',
      );

      return;
    }

    if (password.length < 8) {
      setError(
        'Password must be at least 8 characters.',
      );

      return;
    }

    if (password !== confirmPassword) {
      setError(
        'Passwords do not match.',
      );

      return;
    }

    setSubmitting(true);

    try {
      /*
       * =====================================================
       * REGISTER USING EXISTING SPRING BOOT AUTH API
       * =====================================================
       *
       * The existing authentication flow is preserved.
       */
      const response = await registerUser({
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        password,
      });

      /*
       * =====================================================
       * SAVE REGISTRATION DETAILS FOR PROFILE SETUP
       * =====================================================
       *
       * Only non-sensitive information is stored.
       *
       * Password is NEVER stored in sessionStorage/localStorage.
       */
      savePendingCandidateRegistration({
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
      });

      /*
       * =====================================================
       * STORE AUTHENTICATION RESPONSE
       * =====================================================
       *
       * If registration returns an access token and role,
       * preserve them so the candidate can continue through
       * the onboarding/profile flow without registering again.
       */
      if (
        response &&
        typeof response === 'object'
      ) {
        const authResponse = response as {
          accessToken?: string | null;
          role?: string | null;
        };

        if (authResponse.accessToken) {
          localStorage.setItem(
            'token',
            authResponse.accessToken,
          );
        }

        if (authResponse.role) {
          localStorage.setItem(
            'role',
            String(authResponse.role)
              .trim()
              .toUpperCase(),
          );
        }
      }

      /*
       * =====================================================
       * RESET ONBOARDING STATUS
       * =====================================================
       *
       * Ensures a newly registered candidate always starts
       * onboarding from the beginning.
       */
      localStorage.removeItem(
        'trucity-candidate-onboarding-complete',
      );

      /*
       * =====================================================
       * CONTINUE TO CANDIDATE ONBOARDING
       * =====================================================
       */
      navigate(
        '/candidate/onboarding',
        {
          replace: true,
        },
      );
    } catch (err: unknown) {
      console.error(
        'CANDIDATE REGISTRATION ERROR:',
        err,
      );

      /*
       * Axios-style error handling.
       *
       * Kept flexible so the existing backend response
       * format does not need to change.
       */
      const errorObject =
        typeof err === 'object' &&
        err !== null
          ? err as {
              response?: {
                data?: {
                  message?: unknown;
                  error?: unknown;
                };
              };
              message?: unknown;
            }
          : null;

      const backendMessage =
        errorObject?.response?.data?.message;

      const backendError =
        errorObject?.response?.data?.error;

      const errorMessage =
        typeof backendMessage === 'string'
          ? backendMessage
          : typeof backendError === 'string'
            ? backendError
            : typeof errorObject?.message === 'string'
              ? errorObject.message
              : 'Unable to create your account. Please try again.';

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return {
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
  };
}
