import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  Bell,
  BriefcaseBusiness,
  Check,
  FileCheck2,
  LogOut,
  MessageSquare,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  useNotifications,
  type CandidateNotification,
  type NotificationType,
} from "../../../context/NotificationsContext";

export type CandidateNavTab = {
  to: string;
  label: string;
  badgeCount?: number;
};

type CandidateNavBarProps = {
  tabs?: CandidateNavTab[];

  onSignOut?: () =>
    void | Promise<void>;
};

const DEFAULT_TABS: CandidateNavTab[] = [
  {
    to: "/candidate/feed",
    label: "Opportunities",
  },
  {
    to: "/candidate/messages",
    label: "Messages",
  },
  {
    to: "/candidate/hub",
    label: "Guidance Hub",
  },
  {
    to: "/candidate/cv",
    label: "My CV",
  },
  {
    to: "/candidate/profile",
    label: "Profile",
  },
];

export function CandidateNavBar({
  tabs = DEFAULT_TABS,
  onSignOut,
}: CandidateNavBarProps) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      if (onSignOut) {
        await onSignOut();
      }

      /*
       * Clear candidate-specific session state.
       * Do not remove the authentication token here;
       * that remains controlled by the application's
       * authentication flow.
       */
      sessionStorage.removeItem(
        "candidatePlan",
      );

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Unable to sign out:",
        error,
      );
    }
  };

  return (
    <header
      className="
        fixed
        inset-x-0
        top-0
        z-50
        border-b
        border-brand-border
        bg-white/95
        shadow-[0_4px_18px_rgba(0,70,109,0.05)]
        backdrop-blur-xl
      "
    >
      <div
        className="
          mx-auto
          flex
          h-[88px]
          w-full
          max-w-[1480px]
          items-center
          justify-between
          gap-4
          px-5

          sm:px-8
          lg:px-10
        "
      >
        <NavLink
          to="/candidate/feed"
          aria-label="TruCity Opportunities"
          className="
            flex
            shrink-0
            items-center
          "
        >
          <img
            src="/TruCity_Logo_RGB13.png"
            alt="TruCity"
            className="
              h-[64px]
              w-[90px]
              object-contain

              sm:h-[70px]
              sm:w-[100px]
            "
          />
        </NavLink>

        <nav
          className="
            hidden
            h-full
            items-center
            gap-7
            lg:flex
          "
        >
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={
                tab.to ===
                "/candidate/feed"
              }
              className={({ isActive }) =>
                `
                  relative
                  flex
                  h-full
                  items-center
                  text-sm
                  transition-colors

                  ${
                    isActive
                      ? "font-bold text-brand-primary"
                      : "font-semibold text-brand-textMuted hover:text-brand-primary"
                  }
                `
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    {tab.label}

                    {tab.badgeCount !==
                      undefined &&
                      tab.badgeCount > 0 && (
                        <span
                          className="
                            absolute
                            -right-5
                            -top-3
                            grid
                            h-[17px]
                            min-w-[17px]
                            place-items-center
                            rounded-full
                            bg-brand-gold
                            px-1
                            text-[9px]
                            font-bold
                            leading-none
                            text-brand-dark
                          "
                        >
                          {tab.badgeCount >
                          9
                            ? "9+"
                            : tab.badgeCount}
                        </span>
                      )}
                  </span>

                  {isActive && (
                    <span
                      className="
                        absolute
                        bottom-[17px]
                        left-1/2
                        h-[3px]
                        w-8
                        -translate-x-1/2
                        rounded-full
                        bg-brand-gold
                      "
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <nav
          className="
            flex
            min-w-0
            flex-1
            items-center
            justify-end
            gap-1
            overflow-x-auto
            lg:hidden
          "
        >
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={
                tab.to ===
                "/candidate/feed"
              }
              className={({ isActive }) =>
                `
                  relative
                  shrink-0
                  rounded-xl
                  px-3
                  py-2
                  text-[11px]
                  font-bold
                  transition-colors

                  ${
                    isActive
                      ? "bg-brand-surface text-brand-primary"
                      : "text-brand-textMuted hover:bg-brand-bg hover:text-brand-primary"
                  }
                `
              }
            >
              {tab.label}

              {tab.badgeCount !==
                undefined &&
                tab.badgeCount > 0 && (
                  <span
                    className="
                      absolute
                      -right-1
                      -top-1
                      grid
                      h-4
                      min-w-4
                      place-items-center
                      rounded-full
                      bg-brand-gold
                      px-1
                      text-[8px]
                      font-bold
                      text-brand-dark
                    "
                  >
                    {tab.badgeCount >
                    9
                      ? "9+"
                      : tab.badgeCount}
                  </span>
                )}
            </NavLink>
          ))}
        </nav>

        <div
          className="
            flex
            shrink-0
            items-center
            gap-2
          "
        >
          <NotificationsMenu />

          <button
            type="button"
            onClick={handleSignOut}
            className="
              hidden
              min-h-[46px]
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-[14px]
              border
              border-brand-border
              bg-white
              px-4
              text-sm
              font-bold
              text-brand-textMuted
              transition-colors

              hover:border-[#ff4672]
              hover:bg-[#fff5f7]
              hover:text-[#c72e53]

              sm:inline-flex
            "
          >
            <LogOut className="h-4 w-4" />

            <span className="hidden xl:inline">
              Sign Out
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

function NotificationsMenu() {
  const navigate = useNavigate();

  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleOutsideClick = (
      event: MouseEvent,
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [isOpen]);

  const handleNotificationClick = (
    notification: CandidateNotification,
  ) => {
    markAsRead(notification.id);
    setIsOpen(false);

    if (notification.destination) {
      navigate(
        notification.destination,
      );

      return;
    }

    switch (notification.type) {
      case "message":
        navigate(
          "/candidate/messages",
        );
        break;

      case "application":
        navigate(
          "/candidate/feed",
        );
        break;

      case "profile":
      case "verification":
        navigate(
          "/candidate/profile",
        );
        break;

      case "system":
      default:
        navigate(
          "/candidate/notifications",
        );
        break;
    }
  };

  const recentNotifications =
    notifications.slice(0, 5);

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() =>
          setIsOpen(
            (current) => !current,
          )
        }
        className={`
          relative
          grid
          h-[46px]
          w-[46px]
          shrink-0
          place-items-center
          rounded-[14px]
          border
          transition-colors

          ${
            isOpen
              ? "border-brand-primary bg-brand-surface text-brand-primary"
              : "border-brand-border bg-white text-brand-primary hover:border-brand-accent hover:bg-brand-bg"
          }
        `}
      >
        <Bell
          className="h-[19px] w-[19px]"
          strokeWidth={2}
        />

        {unreadCount > 0 && (
          <span
            className="
              absolute
              -right-1.5
              -top-1.5
              grid
              h-[19px]
              min-w-[19px]
              place-items-center
              rounded-full
              border-2
              border-white
              bg-brand-gold
              px-1
              text-[9px]
              font-bold
              leading-none
              text-brand-dark
            "
          >
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="
            fixed
            left-4
            right-4
            top-[80px]
            z-[70]
            overflow-hidden
            rounded-[20px]
            border
            border-brand-border
            bg-white
            shadow-[0_24px_60px_rgba(0,70,109,0.18)]

            sm:absolute
            sm:left-auto
            sm:right-0
            sm:top-[56px]
            sm:w-[390px]
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              border-b
              border-brand-border
              px-5
              py-4
            "
          >
            <div>
              <h2
                className="
                  !m-0
                  text-[17px]
                  font-bold
                  text-brand-dark
                "
              >
                Notifications
              </h2>

              <p
                className="
                  !mb-0
                  mt-1
                  text-xs
                  text-brand-textMuted
                "
              >
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount ===
                      1
                        ? ""
                        : "s"
                    }`
                  : "You are all caught up"}
              </p>
            </div>

            <button
              type="button"
              aria-label="Close notifications"
              onClick={() =>
                setIsOpen(false)
              }
              className="
                grid
                h-9
                w-9
                place-items-center
                rounded-xl
                text-brand-textMuted
                transition-colors
                hover:bg-brand-bg
                hover:text-brand-primary
              "
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {unreadCount > 0 && (
            <div
              className="
                flex
                justify-end
                border-b
                border-brand-border
                bg-brand-bg
                px-5
                py-2.5
              "
            >
              <button
                type="button"
                onClick={
                  markAllAsRead
                }
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  text-xs
                  font-bold
                  text-brand-primary
                  transition-colors
                  hover:text-brand-accent
                "
              >
                <Check className="h-3.5 w-3.5" />

                Mark all as read
              </button>
            </div>
          )}

          <div
            className="
              max-h-[430px]
              overflow-y-auto
            "
          >
            {recentNotifications.length >
            0 ? (
              recentNotifications.map(
                (notification) => (
                  <NotificationItem
                    key={
                      notification.id
                    }
                    notification={
                      notification
                    }
                    onClick={() =>
                      handleNotificationClick(
                        notification,
                      )
                    }
                  />
                ),
              )
            ) : (
              <EmptyNotifications />
            )}
          </div>

          <div
            className="
              border-t
              border-brand-border
              bg-white
              p-3
            "
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);

                navigate(
                  "/candidate/notifications",
                );
              }}
              className="
                flex
                min-h-[42px]
                w-full
                items-center
                justify-center
                rounded-[12px]
                text-sm
                font-bold
                text-brand-primary
                transition-colors
                hover:bg-brand-bg
              "
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type NotificationItemProps = {
  notification: CandidateNotification;
  onClick: () => void;
};

function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative
        flex
        w-full
        gap-3.5
        border-b
        border-brand-border
        px-5
        py-4
        text-left
        transition-colors
        last:border-b-0

        ${
          notification.read
            ? "bg-white hover:bg-brand-bg"
            : "bg-brand-bg hover:bg-[#f1f9fd]"
        }
      `}
    >
      {!notification.read && (
        <span
          className="
            absolute
            left-1.5
            top-1/2
            h-1.5
            w-1.5
            -translate-y-1/2
            rounded-full
            bg-brand-gold
          "
        />
      )}

      <NotificationIcon
        type={notification.type}
      />

      <div className="min-w-0 flex-1">
        <div
          className="
            flex
            items-start
            justify-between
            gap-3
          "
        >
          <p
            className={`
              !m-0
              text-[13px]
              text-brand-dark

              ${
                notification.read
                  ? "font-semibold"
                  : "font-bold"
              }
            `}
          >
            {notification.title}
          </p>

          <span
            className="
              shrink-0
              text-[10px]
              font-medium
              text-brand-textMuted
            "
          >
            {notification.time}
          </span>
        </div>

        <p
          className="
            !mb-0
            mt-1
            line-clamp-2
            text-xs
            leading-5
            text-brand-textMuted
          "
        >
          {notification.message}
        </p>
      </div>
    </button>
  );
}

function NotificationIcon({
  type,
}: {
  type: NotificationType;
}) {
  const iconClass =
    "h-[17px] w-[17px]";

  const wrapperClass =
    `
      grid
      h-9
      w-9
      shrink-0
      place-items-center
      rounded-full
    `;

  switch (type) {
    case "message":
      return (
        <span
          className={`
            ${wrapperClass}
            bg-[#e8f5fc]
            text-brand-accent
          `}
        >
          <MessageSquare
            className={iconClass}
          />
        </span>
      );

    case "profile":
      return (
        <span
          className={`
            ${wrapperClass}
            bg-[#fff6df]
            text-brand-primary
          `}
        >
          <FileCheck2
            className={iconClass}
          />
        </span>
      );

    case "verification":
      return (
        <span
          className={`
            ${wrapperClass}
            bg-[#ebfff5]
            text-[#167a50]
          `}
        >
          <ShieldCheck
            className={iconClass}
          />
        </span>
      );

    case "system":
      return (
        <span
          className={`
            ${wrapperClass}
            bg-brand-surface
            text-brand-primary
          `}
        >
          <Bell
            className={iconClass}
          />
        </span>
      );

    case "application":
    default:
      return (
        <span
          className={`
            ${wrapperClass}
            bg-brand-surface
            text-brand-primary
          `}
        >
          <BriefcaseBusiness
            className={iconClass}
          />
        </span>
      );
  }
}

function EmptyNotifications() {
  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        px-6
        py-10
        text-center
      "
    >
      <div
        className="
          mb-3
          grid
          h-11
          w-11
          place-items-center
          rounded-full
          bg-brand-bg
          text-brand-primary
        "
      >
        <Bell className="h-5 w-5" />
      </div>

      <p
        className="
          !m-0
          text-sm
          font-bold
          text-brand-dark
        "
      >
        No notifications yet
      </p>

      <p
        className="
          !mb-0
          mt-1
          max-w-[260px]
          text-xs
          leading-5
          text-brand-textMuted
        "
      >
        Updates about applications,
        messages and your TruCity
        account will appear here.
      </p>
    </div>
  );
}