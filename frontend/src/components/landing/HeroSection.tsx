import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="hero">

      <div className="hero-inner">

        <div className="hero-content">

          <span className="hero-badge">
            VERIFIED PROFESSIONALS CONNECTED WITH TRUSTED EMPLOYERS.
          </span>

          <h1>
            Your career starts
            <span>
              {" "}with the right connection.
            </span>
          </h1>

          <p>
            TruCity connects ambitious professionals,
            students and interns with trusted employers
            looking for the next generation of talent.
          </p>

          <div className="hero-actions">

            <Link
              to="/register"
              className="hero-primary"
            >
              Get Started
            </Link>

            <Link
              to="/login"
              className="hero-secondary"
            >
              Sign In
            </Link>

          </div>

          <small>
            Build your profile. Discover opportunities.
            Start your career.
          </small>

        </div>


        <div className="hero-visual">

          <div className="hero-profile-card">

            <div className="avatar">
              TM
            </div>

            <div>
              <strong>
                Thabo Mokoena
              </strong>

              <p>
                Junior Software Developer
              </p>
            </div>

            <span>
              ✓ Verified
            </span>

          </div>


          <div className="hero-connection-card">

            <div className="connection-icon">
              ✓
            </div>

            <div>
              <strong>
                Trusted connection
              </strong>

              <p>
                Candidate matched with employer
              </p>
            </div>

          </div>


          <div className="hero-job-card">

            <small>
              NEW OPPORTUNITY
            </small>

            <strong>
              Graduate Software Engineer
            </strong>

            <p>
              Johannesburg · Full Time
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}