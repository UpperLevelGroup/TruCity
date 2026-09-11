import { useEffect, useState } from "react";

import {
  getCurrentUser,
  type CurrentUser,
} from "../admin.service";

export default function AdminTopbar() {

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState(false);


  useEffect(() => {

    let mounted = true;

    const loadCurrentUser = async () => {

      try {

        setLoadingUser(true);
        setUserError(false);

        const currentUser = await getCurrentUser();

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
    };

    void loadCurrentUser();

    return () => {
      mounted = false;
    };

  }, []);


  /*
   * Display the actual logged-in user's name.
   *
   * No mock administrator name is used.
   */
  const fullName =
    user
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
      : "";


  /*
   * Display the first letter of the actual user's name.
   */
  const avatarInitial =
    fullName
      ? fullName.charAt(0).toUpperCase()
      : "";


  /*
   * Convert the backend role into a readable label.
   *
   * Example:
   * ADMIN       -> Admin
   * SUPER_ADMIN -> Super Admin
   */
  const roleName =
    user?.roles?.[0] ?? "";


  const formattedRole =
    roleName
      .replace(/^ROLE_/i, "")
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (letter) => letter.toUpperCase()
      );


  /*
   * Determine what should be displayed while
   * the logged-in user is being loaded.
   */
  const displayName =
    loadingUser
      ? "Loading..."
      : userError
        ? "Unable to load profile"
        : fullName || "Unknown user";


  const displayRole =
    loadingUser
      ? "Loading..."
      : userError
        ? "Profile unavailable"
        : formattedRole || "No role";


  return (
    <header className="admin-topbar">

      <div className="admin-topbar-left">

        <button
          type="button"
          className="admin-mobile-menu"
          aria-label="Open navigation"
        >
          ☰
        </button>

        <div className="admin-page-heading">

          <span className="admin-topbar-label">
            ADMINISTRATION
          </span>

          <h1>
            Dashboard
          </h1>

        </div>

      </div>


      <div className="admin-topbar-actions">

        <button
          type="button"
          className="admin-icon-button"
          aria-label="Notifications"
        >

          <span className="notification-icon">
            🔔
          </span>

          <span className="notification-dot" />

        </button>


        <div className="admin-divider" />


        <button
          type="button"
          className="admin-topbar-profile"
          aria-label={
            fullName
              ? `${fullName} profile`
              : "User profile"
          }
        >

          <div className="admin-avatar">

            {avatarInitial}

          </div>


          <div className="admin-topbar-user">

            <strong>
              {displayName}
            </strong>

            <span>
              {displayRole}
            </span>

          </div>


          <span className="admin-chevron">
            ▾
          </span>

        </button>

      </div>

    </header>
  );
}
