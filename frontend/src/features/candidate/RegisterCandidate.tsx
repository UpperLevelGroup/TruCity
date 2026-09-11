import { useState } from "react";
import type { SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../../api/authApi";
import "../../../styles/auth.css";

export default function RegisterCandidate() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (
    event: SyntheticEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();

    /*
     * Basic required-field validation
     */
    if (
      !cleanFirstName ||
      !cleanLastName ||
      !cleanEmail ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in every field.");
      return;
    }

    /*
     * Password length validation
     */
    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    /*
     * Password must contain at least one special character.
     */
    const specialCharacterRegex =
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

    if (!specialCharacterRegex.test(password)) {
      setError(
        "Password must contain at least one special character."
      );
      return;
    }

    /*
     * Password confirmation
     */
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      /*
       * The backend automatically assigns the CANDIDATE role.
       */
      const response = await registerUser({
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        password,
      });

      /*
       * Store authentication information.
       */
      if (response.accessToken) {
        localStorage.setItem(
          "token",
          response.accessToken
        );
      }

      if (response.role) {
        localStorage.setItem(
          "role",
          response.role
        );
      }

      /*
       * Registration succeeded.
       *
       * The backend returns CANDIDATE as the role,
       * so the normal dashboard route can handle
       * the newly registered candidate.
       */
      navigate("/dashboard", {
        replace: true,
      });
    } catch (err: unknown) {
      console.error(
        "Candidate registration failed:",
        err
      );

      let message =
        "Registration failed. Please try again.";

      /*
       * Axios error handling without using `any`.
       */
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        const response = (
          err as {
            response?: {
              data?: unknown;
            };
          }
        ).response;

        const data = response?.data;

        if (typeof data === "string") {
          message = data;
        } else if (
          typeof data === "object" &&
          data !== null &&
          "message" in data &&
          typeof (
            data as { message?: unknown }
          ).message === "string"
        ) {
          message = (
            data as { message: string }
          ).message;
        }
      }

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">

      {/* =====================================================
          LEFT BRAND PANEL
          ===================================================== */}

      <section className="auth-brand">
        <div className="auth-brand-content">

          <Link
            to="/"
            className="auth-logo"
          >
            TruCity
          </Link>

          <span className="auth-brand-badge">
            VERIFIED PROFESSIONALS CONNECTED WITH TRUSTED EMPLOYERS.
          </span>

          <h1>
            Build your career
            <span> with confidence.</span>
          </h1>

          <p>
            Create a professional identity that helps
            trusted employers discover your potential.
          </p>

          <div className="auth-benefits">

            <div className="auth-benefit">
              <span>✓</span>

              <div>
                <strong>
                  Build your profile
                </strong>

                <p>
                  Showcase your skills, qualifications
                  and experience.
                </p>
              </div>
            </div>

            <div className="auth-benefit">
              <span>✓</span>

              <div>
                <strong>
                  Discover opportunities
                </strong>

                <p>
                  Find internships, graduate programmes
                  and career opportunities.
                </p>
              </div>
            </div>

            <div className="auth-benefit">
              <span>✓</span>

              <div>
                <strong>
                  Connect with employers
                </strong>

                <p>
                  Put your potential in front of trusted
                  organisations.
                </p>
              </div>
            </div>

          </div>

          <small className="auth-quote">
            Your next opportunity starts with the
            right connection.
          </small>

        </div>
      </section>


      {/* =====================================================
          FORM PANEL
          ===================================================== */}

      <section className="auth-form-section">
        <div className="auth-card">

          <div className="auth-card-header">

            <span className="auth-eyebrow">
              USER REGISTRATION
            </span>

            <h2>
              Create your account
            </h2>

            <p>
              Enter your details below to get started.
            </p>

          </div>


          <form
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
          >

            {/* =================================================
                NAME
                ================================================= */}

            <div className="auth-name-row">

              <div className="auth-field">

                <label htmlFor="firstName">
                  First Name
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(
                      event.target.value
                    );

                    if (error) {
                      setError("");
                    }
                  }}
                  autoComplete="given-name"
                  disabled={submitting}
                  required
                />

              </div>


              <div className="auth-field">

                <label htmlFor="lastName">
                  Last Name
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(event) => {
                    setLastName(
                      event.target.value
                    );

                    if (error) {
                      setError("");
                    }
                  }}
                  autoComplete="family-name"
                  disabled={submitting}
                  required
                />

              </div>

            </div>


            {/* =================================================
                EMAIL
                ================================================= */}

            <div className="auth-field">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(
                    event.target.value
                  );

                  if (error) {
                    setError("");
                  }
                }}
                autoComplete="email"
                disabled={submitting}
                required
              />

            </div>


            {/* =================================================
                PASSWORD
                ================================================= */}

            <div className="auth-field">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(event) => {
                  setPassword(
                    event.target.value
                  );

                  if (error) {
                    setError("");
                  }
                }}
                autoComplete="new-password"
                disabled={submitting}
                minLength={8}
                required
              />

              <small>
                Minimum 8 characters with at least
                one special character.
              </small>

            </div>


            {/* =================================================
                CONFIRM PASSWORD
                ================================================= */}

            <div className="auth-field">

              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(
                    event.target.value
                  );

                  if (error) {
                    setError("");
                  }
                }}
                autoComplete="new-password"
                disabled={submitting}
                minLength={8}
                required
              />

            </div>


            {/* =================================================
                ERROR
                ================================================= */}

            {error && (
              <div
                className="auth-error"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}


            {/* =================================================
                SUBMIT
                ================================================= */}

            <button
              type="submit"
              disabled={submitting}
              className="auth-submit"
            >
              {submitting
                ? "Creating account..."
                : "Create Account"}
            </button>

          </form>


          {/* =================================================
              LOGIN
              ================================================= */}

          <div className="auth-divider">
            <span />
            <p>Already registered?</p>
            <span />
          </div>

          <p className="auth-switch">
            Already have an account?{" "}

            <Link to="/login">
              Sign in
            </Link>
          </p>


          {/* =================================================
              BACK
              ================================================= */}

          <Link
            to="/"
            className="auth-back"
          >
            ← Back to TruCity
          </Link>

        </div>
      </section>

    </main>
  );
}