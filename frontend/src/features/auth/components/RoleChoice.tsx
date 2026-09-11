//import React from "react";
import { useNavigate, Link } from "react-router-dom";
//import { C } from "../../../theme/colours";
import "../../../styles/auth.css";

export default function RoleChoice() {
  const navigate = useNavigate();

  return (
    <main className="auth-page">
      <section className="auth-card auth-role-card">

        <div className="auth-badge">
          GET STARTED
        </div>

        <h1 className="auth-title">
          Join TruCity
        </h1>

        <p className="auth-subtitle">
          Tell us who you're signing up as
        </p>

        <div className="role-options">

          <button
            type="button"
            className="role-option"
            onClick={() => navigate("/register/candidate")}
          >
            <div className="role-icon">
              👤
            </div>

            <div className="role-content">
              <h2>
                I'm a Candidate
              </h2>

              <p>
                Looking for verified job opportunities
              </p>
            </div>

            <span className="role-arrow">
              →
            </span>
          </button>

          <button
            type="button"
            className="role-option"
            onClick={() => navigate("/register/company")}
          >
            <div className="role-icon">
              🏢
            </div>

            <div className="role-content">
              <h2>
                I'm a Company
              </h2>

              <p>
                Hiring verified specialists
              </p>
            </div>

            <span className="role-arrow">
              →
            </span>
          </button>

        </div>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>

      </section>
    </main>
  );
}