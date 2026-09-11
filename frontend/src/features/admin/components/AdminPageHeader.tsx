import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function AdminPageHeader({
  eyebrow = "ADMINISTRATION",
  title,
  description,
  action,
}: AdminPageHeaderProps) {
  return (
    <header className="admin-page-header">

      <div className="admin-page-header-content">

        <span className="admin-page-eyebrow">
          {eyebrow}
        </span>

        <h1>
          {title}
        </h1>

        {description && (
          <p>
            {description}
          </p>
        )}

      </div>

      {action && (
        <div className="admin-page-header-action">
          {action}
        </div>
      )}

    </header>
  );
}
