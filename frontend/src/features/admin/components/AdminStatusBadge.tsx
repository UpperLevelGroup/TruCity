type AdminStatusBadgeProps = {
  status: string;
};

export default function AdminStatusBadge({
  status,
}: AdminStatusBadgeProps) {
  const normalizedStatus = status.trim().toLowerCase();

  let statusClass = "admin-status-default";

  if (
    normalizedStatus === "active" ||
    normalizedStatus === "verified" ||
    normalizedStatus === "approved"
  ) {
    statusClass = "admin-status-success";
  } else if (
    normalizedStatus === "pending" ||
    normalizedStatus === "review"
  ) {
    statusClass = "admin-status-warning";
  } else if (
    normalizedStatus === "suspended" ||
    normalizedStatus === "rejected" ||
    normalizedStatus === "inactive"
  ) {
    statusClass = "admin-status-danger";
  }

  const displayStatus =
    status.trim().length > 0
      ? status
      : "Unknown";

  return (
    <span
      className={`admin-status-badge ${statusClass}`}
    >
      {displayStatus}
    </span>
  );
}