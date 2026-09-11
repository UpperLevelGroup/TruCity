import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  type CurrentUser,
} from "../admin.service";
import TruCityLogo from "./TruCityLogo";

const navigation = [
  {
    label: "MAIN",
    items: [
      {
        label: "Dashboard",
        path: "/admin",
        icon: "⌂",
      },
    ],
  },

  {
    label: "MANAGE",
    items: [
      {
        label: "Users",
        path: "/admin/users",
        icon: "◉",
      },
      {
        label: "Candidates",
        path: "/admin/candidates",
        icon: "♙",
      },
      {
        label: "Employers",
        path: "/admin/employers",
        icon: "▣",
      },
      {
        label: "Jobs",
        path: "/admin/jobs",
        icon: "▤",
      },
      {
        label: "Applications",
        path: "/admin/applications",
        icon: "↗",
      },
    ],
  },

  {
    label: "COMMUNICATION",
    items: [
      {
        label: "Messages",
        path: "/admin/messages",
        icon: "✉",
      },
    ],
  },

  {
    label: "REVIEW",
    items: [
      {
        label: "Verifications",
        path: "/admin/verifications",
        icon: "✓",
      },
      {
        label: "Reports",
        path: "/admin/reports",
        icon: "▥",
      },
    ],
  },

  {
    label: "INSIGHTS",
    items: [
      {
        label: "Analytics",
        path: "/admin/analytics",
        icon: "▦",
      },
    ],
  },

  {
    label: "SYSTEM",
    items: [
      {
        label: "Settings",
        path: "/admin/settings",
        icon: "⚙",
      },
    ],
  },
];

export default function AdminSidebar() {
  const navigate = useNavigate();

  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [userError, setUserError] =
    useState(false);

  /*
   * =====================================================
   * LOAD LOGGED-IN USER
   * =====================================================
   */

  useEffect(() => {
    let mounted = true;

    async function loadCurrentUser() {
      try {
        setLoadingUser(true);
        setUserError(false);

        const currentUser =
          await getCurrentUser();

        if (mounted) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error(
          "Failed to load logged-in user:",
          error
        );

        if (mounted) {
          setUserError(true);
        }
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    }

    void loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * =====================================================
   * USER DISPLAY
   * =====================================================
   */

  const fullName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : "";

  const avatarInitial = fullName
    ? fullName.charAt(0).toUpperCase()
    : "";

  const roleName = user?.roles?.[0] ?? "";

  const formattedRole = roleName
    .replace(/^ROLE_/i, "")
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      (letter) => letter.toUpperCase()
    );

  const displayName = loadingUser
    ? "Loading..."
    : userError
      ? "Unable to load profile"
      : fullName || "Unknown user";

  const displayRole = loadingUser
    ? "Loading..."
    : userError
      ? "Profile unavailable"
      : formattedRole || "No role";

  /*
   * =====================================================
   * SIGN OUT
   * =====================================================
   */

  function handleSignOut() {
    localStorage.removeItem("token");

    navigate("/login", {
      replace: true,
    });
  }

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <aside className="admin-sidebar">

      {/* =================================================
          BRAND
      ================================================= */}

      <div className="admin-brand">
        <TruCityLogo
          width={165}
          className="admin-brand-logo"
        />
      </div>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <nav className="admin-navigation">
        {navigation.map((section) => (
          <div
            className="admin-nav-section"
            key={section.label}
          >
            <div className="admin-nav-label">
              {section.label}
            </div>

            <div className="admin-nav-items">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/admin"}
                  className={({ isActive }) =>
                    `admin-nav-item ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <span className="admin-nav-icon">
                    {item.icon}
                  </span>

                  <span className="admin-nav-text">
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* =================================================
          LOGGED-IN USER
      ================================================= */}

      <div className="admin-sidebar-footer">
        <div className="admin-user-mini">

          {/* AVATAR */}

          <div
            className="admin-avatar"
            aria-label={
              fullName
                ? `${fullName} avatar`
                : "User avatar"
            }
          >
            {avatarInitial}
          </div>

          {/* USER INFORMATION */}

          <div className="admin-user-info">
            <strong>
              {displayName}
            </strong>

            <span>
              {displayRole}
            </span>
          </div>
        </div>

        {/* SIGN OUT */}

        <button
          type="button"
          className="admin-signout"
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
