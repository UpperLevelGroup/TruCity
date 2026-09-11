interface AdminStatCardProps {
  label: string;
  value: string | number;
  description: string;
  icon: string;
  trend?: string;
  onClick?: () => void;
}

export default function AdminStatCard({
  label,
  value,
  description,
  icon,
  trend,
  onClick,
}: AdminStatCardProps) {
  const isClickable =
    typeof onClick === "function";

  return (
    <article
      className={`admin-stat-card ${
        isClickable
          ? "admin-stat-card-clickable"
          : ""
      }`}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(event) => {
        if (
          isClickable &&
          (event.key === "Enter" ||
            event.key === " ")
        ) {
          event.preventDefault();
          onClick();
        }
      }}
    >

      <div className="admin-stat-top">

        <div className="admin-stat-icon">
          {icon}
        </div>

        {trend && (
          <span className="admin-stat-trend">
            {trend}
          </span>
        )}

      </div>


      <div className="admin-stat-value">
        {value}
      </div>


      <div className="admin-stat-label">
        {label}
      </div>


      <p className="admin-stat-description">
        {description}
      </p>

    </article>
  );
}