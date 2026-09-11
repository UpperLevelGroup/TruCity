import { useEffect, useMemo, useState } from "react";

import AdminPageHeader from "../components/AdminPageHeader";
import AdminSearch from "../components/AdminSearch";
import AdminTable from "../components/AdminTable";
import AdminStatusBadge from "../components/AdminStatusBadge";

import { getAdminUsers } from "../admin.service";

import type { AdminUser } from "../admin.types";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminUsers();

      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);

      setError("Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  function handleViewUser(user: AdminUser) {
    setSelectedUser(user);
  }

  function closeUserDetails() {
    setSelectedUser(null);
  }

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = users;

    if (query) {
      result = result.filter((user) =>
        [
          user.firstName,
          user.lastName,
          user.email,
          user.role,
          user.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }

    if (showActiveOnly) {
      result = result.filter(
        (user) => user.status?.toUpperCase() === "ACTIVE"
      );
    }

    return result;
  }, [users, search, showActiveOnly]);

  const activeCount = users.filter(
    (user) => user.status?.toUpperCase() === "ACTIVE"
  ).length;

  const candidateCount = users.filter(
    (user) => user.role?.toUpperCase() === "CANDIDATE"
  ).length;

  const employerCount = users.filter(
    (user) => user.role?.toUpperCase() === "EMPLOYER"
  ).length;

  const adminCount = users.filter(
    (user) => user.role?.toUpperCase() === "ADMIN"
  ).length;

  const columns = [
    {
      key: "user",
      label: "User",

      render: (user: AdminUser) => {
        const firstName = user.firstName || "";
        const lastName = user.lastName || "";
        const fullName =
          `${firstName} ${lastName}`.trim() || "Unnamed user";

        const initials =
          `${firstName.charAt(0)}${lastName.charAt(0)}`
            .trim()
            .toUpperCase() || "?";

        return (
          <div className="admin-person">
            <div className="admin-person-avatar">
              {initials}
            </div>

            <div>
              <strong>{fullName}</strong>

              <span>{user.email || "No email available"}</span>
            </div>
          </div>
        );
      },
    },

    {
      key: "role",
      label: "Role",

      render: (user: AdminUser) => (
        <span className="admin-role">
          {formatRole(user.role)}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",

      render: (user: AdminUser) => (
        <AdminStatusBadge
          status={user.status || "UNKNOWN"}
        />
      ),
    },

    {
      key: "createdAt",
      label: "Joined",

      render: (user: AdminUser) => (
        <span>{formatDate(user.createdAt)}</span>
      ),
    },

    {
      key: "actions",
      label: "",

      render: (user: AdminUser) => (
        <button
          type="button"
          className="admin-row-action"
          onClick={() => handleViewUser(user)}
        >
          View
        </button>
      ),
    },
  ];

  const selectedUserName =
    `${selectedUser?.firstName || ""} ${
      selectedUser?.lastName || ""
    }`.trim() || "Unnamed user";

  const selectedUserInitials =
    `${selectedUser?.firstName?.charAt(0) || ""}${
      selectedUser?.lastName?.charAt(0) || ""
    }`
      .trim()
      .toUpperCase() || "?";

  return (
    <main className="admin-page">
      <AdminPageHeader
        eyebrow="PEOPLE"
        title="Users"
        description="Manage registered users, account status and platform roles."
      />

      <section className="admin-list-summary">
        <div>
          <strong>{users.length}</strong>
          <span>Total users</span>
        </div>

        <div>
          <strong>{activeCount}</strong>
          <span>Active users</span>
        </div>

        <div>
          <strong>{candidateCount}</strong>
          <span>Candidates</span>
        </div>

        <div>
          <strong>{employerCount}</strong>
          <span>Employers</span>
        </div>

        <div>
          <strong>{adminCount}</strong>
          <span>Administrators</span>
        </div>
      </section>

      <section className="admin-list-toolbar">
        <AdminSearch
          value={search}
          onChange={setSearch}
          placeholder="Search users..."
        />

        <button
          type="button"
          className={`admin-filter-button ${
            showActiveOnly ? "active" : ""
          }`}
          onClick={() =>
            setShowActiveOnly((current) => !current)
          }
        >
          {showActiveOnly ? "All users" : "Active only"}
        </button>
      </section>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      <section className="admin-table-card">
        <div className="admin-table-header">
          <div>
            <h2>User Directory</h2>

            <p>
              Review registered platform users and their account status.
            </p>
          </div>

          <span className="admin-table-count">
            {filteredUsers.length}{" "}
            {filteredUsers.length === 1 ? "result" : "results"}
          </span>
        </div>

        {loading ? (
          <div className="admin-table-state">
            Loading users...
          </div>
        ) : (
          <AdminTable
            columns={columns}
            data={filteredUsers}
            emptyMessage="No users found. Try changing your search criteria."
          />
        )}
      </section>

      {/* USER DETAILS DRAWER */}

      {selectedUser && (
        <div
          className="admin-drawer-overlay"
          onClick={closeUserDetails}
        >
          <aside
            className="admin-user-drawer"
            onClick={(event) => event.stopPropagation()}
            aria-label="User details"
          >
            <div className="admin-drawer-header">
              <div>
                <span className="admin-drawer-eyebrow">
                  USER DETAILS
                </span>

                <h2>User Profile</h2>

                <p>
                  Review account information and platform access.
                </p>
              </div>

              <button
                type="button"
                className="admin-drawer-close"
                onClick={closeUserDetails}
                aria-label="Close user details"
              >
                ×
              </button>
            </div>

            <div className="admin-drawer-profile">
              <div className="admin-drawer-avatar">
                {selectedUserInitials}
              </div>

              <div className="admin-drawer-profile-info">
                <h3>{selectedUserName}</h3>

                <p>
                  {selectedUser.email || "No email available"}
                </p>

                <div className="admin-drawer-status">
                  <AdminStatusBadge
                    status={
                      selectedUser.status || "UNKNOWN"
                    }
                  />

                  <span className="admin-drawer-role">
                    {formatRole(selectedUser.role)}
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-drawer-section">
              <div className="admin-drawer-section-heading">
                <span>ACCOUNT INFORMATION</span>
              </div>

              <div className="admin-drawer-details">
                <div className="admin-drawer-detail">
                  <span>First name</span>
                  <strong>
                    {selectedUser.firstName || "—"}
                  </strong>
                </div>

                <div className="admin-drawer-detail">
                  <span>Last name</span>
                  <strong>
                    {selectedUser.lastName || "—"}
                  </strong>
                </div>

                <div className="admin-drawer-detail">
                  <span>Email address</span>
                  <strong>
                    {selectedUser.email || "—"}
                  </strong>
                </div>

                <div className="admin-drawer-detail">
                  <span>Role</span>
                  <strong>
                    {formatRole(selectedUser.role)}
                  </strong>
                </div>

                <div className="admin-drawer-detail">
                  <span>Account status</span>

                  <AdminStatusBadge
                    status={
                      selectedUser.status || "UNKNOWN"
                    }
                  />
                </div>

                <div className="admin-drawer-detail">
                  <span>Verified</span>

                  <strong
                    className={
                      selectedUser.verified
                        ? "admin-value-success"
                        : "admin-value-muted"
                    }
                  >
                    {selectedUser.verified ? "Yes" : "No"}
                  </strong>
                </div>

                <div className="admin-drawer-detail">
                  <span>Joined</span>

                  <strong>
                    {formatDate(selectedUser.createdAt)}
                  </strong>
                </div>

                <div className="admin-drawer-detail admin-drawer-detail-id">
                  <span>User ID</span>

                  <strong title={selectedUser.id}>
                    {selectedUser.id || "—"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="admin-drawer-footer">
              <button
                type="button"
                className="admin-drawer-secondary"
                onClick={closeUserDetails}
              >
                Close
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

function formatRole(role?: string) {
  if (!role) {
    return "Unknown";
  }

  return role
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}