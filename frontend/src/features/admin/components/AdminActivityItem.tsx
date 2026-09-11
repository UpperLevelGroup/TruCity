interface AdminActivityItemProps {
  icon: string;
  title: string;
  description: string;
  time: string;
}

export default function AdminActivityItem({
  icon,
  title,
  description,
  time,
}: AdminActivityItemProps) {
  return (
    <div className="admin-activity-item">

      <div className="admin-activity-icon">
        {icon}
      </div>

      <div className="admin-activity-content">

        <strong>
          {title}
        </strong>

        <p>
          {description}
        </p>

      </div>

      <span className="admin-activity-time">
        {time}
      </span>

    </div>
  );
}