type Activity = {
  icon: string;
  title: string;
  description: string;
  time: string;
};

const activities: Activity[] = [
  {
    icon: "✓",
    title: "New candidate registered",
    description: "A new professional joined TruCity.",
    time: "10 min ago",
  },
  {
    icon: "◆",
    title: "Company registration",
    description: "A new employer account was created.",
    time: "32 min ago",
  },
  {
    icon: "↗",
    title: "New job posted",
    description: "A company published a new opportunity.",
    time: "1 hour ago",
  },
  {
    icon: "◎",
    title: "Profile verification",
    description: "A candidate profile was submitted for verification.",
    time: "2 hours ago",
  },
];

export default function AdminActivityList() {
  return (
    <div className="admin-activity-list">

      {activities.map((activity, index) => (
        <div
          className="admin-activity-item"
          key={index}
        >

          <div className="admin-activity-icon">
            {activity.icon}
          </div>

          <div className="admin-activity-content">

            <strong>
              {activity.title}
            </strong>

            <p>
              {activity.description}
            </p>

          </div>

          <span className="admin-activity-time">
            {activity.time}
          </span>

        </div>
      ))}

    </div>
  );
}