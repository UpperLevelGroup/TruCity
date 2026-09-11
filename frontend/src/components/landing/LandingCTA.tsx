import { Link } from "react-router-dom";

export default function LandingCTA() {
  return (
    <section className="landing-cta">

      <div>

        <h2>
          Your next opportunity could start here.
        </h2>

        <p>
          Join TruCity and start building your
          professional future.
        </p>

        <Link to="/register">
          Join TruCity
        </Link>

      </div>

    </section>
  );
}