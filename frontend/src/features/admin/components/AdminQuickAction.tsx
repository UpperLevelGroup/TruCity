import { Link } from "react-router-dom";

type AdminQuickActionProps = {
  icon: string;
  title: string;
  description: string;
  to: string;
};

export default function AdminQuickAction({
  icon,
  title,
  description,
  to,
}: AdminQuickActionProps) {
  return (
    <Link
      to={to}
      className="admin-quick-action"
    >

      <div className="admin-quick-icon">
        {icon}
      </div>

      <div className="admin-quick-content">

        <strong>
          {title}
        </strong>

        <p>
          {description}
        </p>

      </div>

      <span className="admin-quick-arrow">
        →
      </span>

    </Link>
  );
}