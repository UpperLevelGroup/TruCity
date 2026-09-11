import { Link } from "react-router-dom";

export default function AudienceSection() {
  return (
    <section className="audience">

      <article className="audience-candidate">

        <span>
          FOR CANDIDATES
        </span>

        <h2>
          Turn your potential into opportunity.
        </h2>

        <p>
          Whether you're looking for your first internship,
          graduate programme or next career move, create
          a profile that puts your skills in front of the
          right employers.
        </p>

        <Link to="/register/candidate">
          Create your profile
        </Link>

      </article>


      <article className="audience-employer">

        <span>
          FOR EMPLOYERS
        </span>

        <h2>
          Find the people behind the potential.
        </h2>

        <p>
          Discover emerging professionals and connect
          with candidates whose skills match what your
          organisation needs.
        </p>

        <Link to="/register">
          Find talent
        </Link>

      </article>

    </section>
  );
}