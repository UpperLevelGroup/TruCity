import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  NavLink,
  useNavigate,
} from 'react-router-dom';

import {
  Bell,
  BookOpenCheck,
  BriefcaseBusiness,
  Check,
  FileCheck2,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  ShieldCheck,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';

import {
  useNotifications,
  type CandidateNotification,
  type NotificationType,
} from '../../../context/NotificationsContext';

/* =========================================================
   TYPES
========================================================= */

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

/* =========================================================
   DEFAULT NAVIGATION
========================================================= */

const DEFAULT_TABS: CandidateNavTab[] = [
  {
    to: '/candidate/feed',
    label: 'Home',
  },
  {
    to: '/candidate/messages',
    label: 'Messages',
  },
  {
    to: '/candidate/hub',
    label: 'Guidance Hub',
  },
  {
    to: '/candidate/cv',
    label: 'CV',
  },
  {
    to: '/candidate/profile',
    label: 'Profile',
  },
];

/* =========================================================
   NAVIGATION ICONS

   Route-based mapping ensures icons still render when
   CandidateLayout passes its own tabs into CandidateNavBar.
========================================================= */

const NAV_ICONS: Record<string, LucideIcon> = {
  '/candidate/feed': Home,
  '/candidate/messages': MessageSquare,
  '/candidate/hub': BookOpenCheck,
  '/candidate/cv': FileText,
  '/candidate/profile': UserRound,
};

function getNavIcon(
  route: string,
): LucideIcon {
  return (
    NAV_ICONS[route] ??
    BriefcaseBusiness
  );
}

/* =========================================================
   CANDIDATE NAVBAR
========================================================= */

export function CandidateNavBar({
  tabs = DEFAULT_TABS,
  onSignOut,
}: CandidateNavBarProps) {
  const navigate =
    useNavigate();

  const handleSignOut =
    async () => {
      try {
        if (onSignOut) {
          await onSignOut();
        }

        navigate(
          '/login',
          {
            replace: true,
          },
        );
      } catch (error) {
        console.error(
          'Unable to sign out:',
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
        overflow-visible
        border-b
        border-brand-border
        bg-brand-bg/95
        backdrop-blur-md
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
          overflow-visible
          px-5

          sm:px-8
          lg:gap-6
          lg:px-10
        "
      >
        {/* =================================================
            LOGO
        ================================================== */}

        <NavLink
          to="/candidate/feed"
          aria-label="TruCity candidate home"
          className="
            relative
            flex
            h-[88px]
            w-[125px]
            shrink-0
            items-center
            overflow-visible
            no-underline

            sm:w-[150px]
            lg:w-[195px]
          "
        >
          <img
            src="/trucity-nav-logo.png"
            alt="TruCity"
            draggable={false}
            className="
              absolute
              left-[-22px]
              top-1/2
              block
              h-auto
              w-[130px]
              max-w-none
              -translate-y-1/2
              select-none
              object-contain

              sm:left-[-26px]
              sm:w-[155px]

              lg:left-[-30px]
              lg:w-[190px]
            "
          />
        </NavLink>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================== */}

        <nav
          aria-label="Candidate navigation"
          className="
            hidden
            h-full
            items-center
            gap-6

            lg:flex
          "
        >
          {tabs.map(
            (tab) => (
              <CandidateDesktopNavLink
                key={tab.to}
                tab={tab}
              />
            ),
          )}
        </nav>

        {/* =================================================
            MOBILE / TABLET NAVIGATION
        ================================================== */}

        <nav
          aria-label="Candidate navigation"
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
          {tabs.map(
            (tab) => (
              <CandidateMobileNavLink
                key={tab.to}
                tab={tab}
              />
            ),
          )}
        </nav>

        {/* =================================================
            ACCOUNT ACTIONS
        ================================================== */}

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
            onClick={
              handleSignOut
            }
            aria-label="Sign out"
            title="Sign out"
            className="
              hidden
              min-h-[46px]
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-[14px]
              border
              border-brand-primary
              bg-brand-bg
              px-4
              text-[14px]
              font-bold
              text-brand-primary
              transition-all
              duration-200

              hover:bg-brand-primary
              hover:text-white

              focus-visible:outline-none
              focus-visible:ring-4
              focus-visible:ring-brand-accent/25

              sm:inline-flex
            "
          >
            <LogOut
              className="
                h-[18px]
                w-[18px]
                shrink-0
              "
              strokeWidth={2}
            />

            <span className="hidden xl:inline">
              Sign Out
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   DESKTOP NAV LINK
========================================================= */

function CandidateDesktopNavLink({
  tab,
}: {
  tab: CandidateNavTab;
}) {
  const Icon =
    getNavIcon(
      tab.to,
    );

  return (
    <NavLink
      to={tab.to}
      end={
        tab.to ===
        '/candidate/feed'
      }
      className={({
        isActive,
      }) => `
        group
        relative
        flex
        h-full
        items-center
        gap-2
        text-[14px]
        no-underline
        transition-colors
        duration-150

        ${
          isActive
            ? `
              font-bold
              text-brand-primary

              after:absolute
              after:bottom-[20px]
              after:left-0
              after:h-[2px]
              after:w-full
              after:rounded-full
              after:bg-brand-gold
            `
            : `
              font-semibold
              text-brand-textMuted

              hover:text-brand-primary
            `
        }

        focus-visible:rounded-md
        focus-visible:outline-none
        focus-visible:ring-4
        focus-visible:ring-brand-accent/20
      `}
    >
      <span
        className="
          grid
          h-[30px]
          w-[30px]
          shrink-0
          place-items-center
          rounded-[9px]
          bg-brand-accent/10
          text-brand-primary
          transition-all
          duration-150

          group-hover:bg-brand-primary
          group-hover:text-white
        "
      >
        <Icon
          className="
            h-[17px]
            w-[17px]
          "
          strokeWidth={2}
        />
      </span>

      <span>
        {tab.label}
      </span>
    </NavLink>
  );
}

/* =========================================================
   MOBILE NAV LINK
========================================================= */

function CandidateMobileNavLink({
  tab,
}: {
  tab: CandidateNavTab;
}) {
  const Icon =
    getNavIcon(
      tab.to,
    );

  return (
    <NavLink
      to={tab.to}
      end={
        tab.to ===
        '/candidate/feed'
      }
      aria-label={
        tab.label
      }
      title={
        tab.label
      }
      className={({
        isActive,
      }) => `
        group
        relative
        flex
        shrink-0
        items-center
        justify-center
        gap-1.5
        rounded-[12px]
        px-2
        py-2
        no-underline
        transition-all
        duration-150

        ${
          isActive
            ? `
              bg-brand-surface
              text-brand-primary
            `
            : `
              text-brand-textMuted

              hover:bg-brand-bg
              hover:text-brand-primary
            `
        }

        focus-visible:outline-none
        focus-visible:ring-4
        focus-visible:ring-brand-accent/20
      `}
    >
      <Icon
        className="
          h-[19px]
          w-[19px]
          shrink-0
        "
        strokeWidth={2}
      />

      <span
        className="
          hidden
          text-[11px]
          font-bold

          md:inline
        "
      >
        {tab.label}
      </span>
    </NavLink>
  );
}

/* =========================================================
   NOTIFICATIONS MENU
========================================================= */

function NotificationsMenu() {
  const navigate =
    useNavigate();

  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const [
    isOpen,
    setIsOpen,
  ] =
    useState(false);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } =
    useNotifications();

  /* ---------------------------------------------------------
     CLOSE WHEN CLICKING OUTSIDE
  --------------------------------------------------------- */

  useEffect(
    () => {
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
          setIsOpen(
            false,
          );
        }
      };

      const handleEscape = (
        event: KeyboardEvent,
      ) => {
        if (
          event.key ===
          'Escape'
        ) {
          setIsOpen(
            false,
          );
        }
      };

      document.addEventListener(
        'mousedown',
        handleOutsideClick,
      );

      document.addEventListener(
        'keydown',
        handleEscape,
      );

      return () => {
        document.removeEventListener(
          'mousedown',
          handleOutsideClick,
        );

        document.removeEventListener(
          'keydown',
          handleEscape,
        );
      };
    },
    [
      isOpen,
    ],
  );

  /* ---------------------------------------------------------
     OPEN NOTIFICATION
  --------------------------------------------------------- */

  const handleNotificationClick = (
    notification:
      CandidateNotification,
  ) => {
    markAsRead(
      notification.id,
    );

    setIsOpen(
      false,
    );

    if (
      notification.destination
    ) {
      navigate(
        notification.destination,
      );

      return;
    }

    switch (
      notification.type
    ) {
      case 'message':
        navigate(
          '/candidate/messages',
        );
        break;

      case 'application':
        navigate(
          '/candidate/feed',
        );
        break;

      case 'profile':
      case 'verification':
        navigate(
          '/candidate/profile',
        );
        break;

      case 'system':
      default:
        navigate(
          '/candidate/notifications',
        );
        break;
    }
  };

  const recentNotifications =
    notifications.slice(
      0,
      5,
    );

  return (
    <div
      ref={
        containerRef
      }
      className="relative"
    >
      {/* ===================================================
          BELL BUTTON
      ==================================================== */}

      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={
          isOpen
        }
        aria-haspopup="dialog"
        title="Notifications"
        onClick={() =>
          setIsOpen(
            (
              current,
            ) =>
              !current,
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
          transition-all
          duration-200

          ${
            isOpen
              ? `
                border-brand-primary
                bg-brand-primary
                text-white
              `
              : `
                border-brand-primary
                bg-brand-bg
                text-brand-primary

                hover:bg-brand-primary
                hover:text-white
              `
          }

          focus-visible:outline-none
          focus-visible:ring-4
          focus-visible:ring-brand-accent/25
        `}
      >
        <Bell
          className="
            h-[19px]
            w-[19px]
          "
          strokeWidth={2}
        />

        {unreadCount >
          0 && (
          <span
            aria-hidden="true"
            className="
              absolute
              right-[5px]
              top-[5px]
              h-[7px]
              w-[7px]
              rounded-full
              border
              border-brand-bg
              bg-brand-gold
            "
          />
        )}
      </button>

      {/* ===================================================
          DROPDOWN
      ==================================================== */}

      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="
            fixed
            left-4
            right-4
            top-[96px]
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
          {/* HEADER */}

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
                  text-[18px]
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
                  text-[12px]
                  text-brand-textMuted
                "
              >
                {unreadCount >
                0
                  ? 'You have new notifications'
                  : 'You are all caught up'}
              </p>
            </div>

            <button
              type="button"
              aria-label="Close notifications"
              onClick={() =>
                setIsOpen(
                  false,
                )
              }
              className="
                grid
                h-9
                w-9
                place-items-center
                rounded-[12px]
                text-brand-textMuted
                transition-colors

                hover:bg-brand-bg
                hover:text-brand-primary

                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-accent/20
              "
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* MARK ALL */}

          {unreadCount >
            0 && (
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
                  text-[12px]
                  font-bold
                  text-brand-primary
                  transition-colors

                  hover:text-brand-accent

                  focus-visible:rounded-md
                  focus-visible:outline-none
                  focus-visible:ring-4
                  focus-visible:ring-brand-accent/20
                "
              >
                <Check className="h-3.5 w-3.5" />

                Mark all as read
              </button>
            </div>
          )}

          {/* NOTIFICATION LIST */}

          <div
            className="
              max-h-[430px]
              overflow-y-auto
            "
          >
            {recentNotifications.length >
            0 ? (
              recentNotifications.map(
                (
                  notification,
                ) => (
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

          {/* FOOTER */}

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
                setIsOpen(
                  false,
                );

                navigate(
                  '/candidate/notifications',
                );
              }}
              className="
                flex
                min-h-[42px]
                w-full
                items-center
                justify-center
                rounded-[12px]
                text-[14px]
                font-bold
                text-brand-primary
                transition-colors

                hover:bg-brand-bg

                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-accent/20
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

/* =========================================================
   NOTIFICATION ITEM
========================================================= */

type NotificationItemProps = {
  notification:
    CandidateNotification;

  onClick: () => void;
};

function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
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
            ? `
              bg-white
              hover:bg-brand-bg
            `
            : `
              bg-brand-accent/5
              hover:bg-brand-accent/10
            `
        }

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-inset
        focus-visible:ring-brand-accent
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
        type={
          notification.type
        }
      />

      <div
        className="
          min-w-0
          flex-1
        "
      >
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
                  ? 'font-semibold'
                  : 'font-bold'
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
            text-[12px]
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

/* =========================================================
   NOTIFICATION ICON
========================================================= */

function NotificationIcon({
  type,
}: {
  type:
    NotificationType;
}) {
  const iconClass =
    'h-[17px] w-[17px]';

  const wrapperClass = `
    grid
    h-9
    w-9
    shrink-0
    place-items-center
    rounded-full
  `;

  switch (type) {
    case 'message':
      return (
        <span
          className={`
            ${wrapperClass}
            bg-brand-accent/10
            text-brand-accent
          `}
        >
          <MessageSquare
            className={
              iconClass
            }
          />
        </span>
      );

    case 'profile':
      return (
        <span
          className={`
            ${wrapperClass}
            bg-brand-gold/15
            text-brand-primary
          `}
        >
          <FileCheck2
            className={
              iconClass
            }
          />
        </span>
      );

    case 'verification':
      return (
        <span
          className={`
            ${wrapperClass}
            bg-brand-emerald/15
            text-brand-dark
          `}
        >
          <ShieldCheck
            className={`
              ${iconClass}
              text-brand-emerald
            `}
          />
        </span>
      );

    case 'system':
      return (
        <span
          className={`
            ${wrapperClass}
            bg-brand-surface
            text-brand-primary
          `}
        >
          <Bell
            className={
              iconClass
            }
          />
        </span>
      );

    case 'application':
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
            className={
              iconClass
            }
          />
        </span>
      );
  }
}

/* =========================================================
   EMPTY STATE
========================================================= */

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
          text-[14px]
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
          text-[12px]
          leading-5
          text-brand-textMuted
        "
      >
        Updates about applications,
        messages and your TruCity account
        will appear here.
      </p>
    </div>
  );
}