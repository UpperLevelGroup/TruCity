export default function FeatureSection() {
  return (
    <section className="features">

      <div className="section-heading">

        <span>
          WHY TRUCITY
        </span>

        <h2>
          More than a job board.
        </h2>

        <p>
          A professional community designed to help
          people move from potential to opportunity.
        </p>

      </div>


      <div className="feature-grid">

        <Feature
          icon="✓"
          title="Verified professionals"
          text="Build a professional profile that gives employers confidence in your skills and experience."
        />

        <Feature
          icon="↗"
          title="Real opportunities"
          text="Discover internships, graduate programmes and jobs from employers looking for emerging talent."
        />

        <Feature
          icon="◎"
          title="Career connections"
          text="Connect with people and organisations that can help you take your next career step."
        />

      </div>

    </section>
  );
}


function Feature({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <article className="feature-card">

      <div className="feature-icon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </article>
  );
}