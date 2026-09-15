import {
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  Bell,
  BriefcaseBusiness,
  Check,
  CheckCheck,
  ChevronRight,
  FileCheck2,
  MessageSquare,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

import {
  useNotifications,
  type CandidateNotification,
  type NotificationType,
} from '../../../context/NotificationsContext';

/* =========================================================
   TYPES
========================================================= */

type NotificationFilter =
  | 'all'
  | 'unread';

/* =========================================================
   COMPONENT
========================================================= */

export default function Notifications() {
  const navigate = useNavigate();

  /* =======================================================
     SHARED NOTIFICATION STATE
  ======================================================= */

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
  } = useNotifications();

  /* =======================================================
     PAGE-ONLY STATE
  ======================================================= */

  const [
    filter,
    setFilter,
  ] = useState<NotificationFilter>(
    'all',
  );

  /* =======================================================
     COUNTS
  ======================================================= */

  const readCount =
    notifications.length -
    unreadCount;

  /* =======================================================
     FILTERING
  ======================================================= */

  const visibleNotifications =
    useMemo(() => {
      if (filter === 'unread') {
        return notifications.filter(
          (notification) =>
            !notification.read,
        );
      }

      return notifications;
    }, [
      filter,
      notifications,
    ]);

  /* =======================================================
     OPEN NOTIFICATION
  ======================================================= */

  const openNotification = (
    notification: CandidateNotification,
  ) => {
    markAsRead(
      notification.id,
    );

    if (
      notification.destination
    ) {
      navigate(
        notification.destination,
      );

      return;
    }

    /*
     * Fallback routing in case an older notification
     * does not contain a destination.
     */
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
        break;
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="w-full">
      <div
        className="
          mx-auto
          w-full
          max-w-[1180px]
        "
      >
        {/* =================================================
            PAGE HEADER
        ================================================== */}

        <section
          className="
            mb-7
            flex
            flex-col
            justify-between
            gap-5
            sm:flex-row
            sm:items-end
          "
        >
          <div>
            <div
              className="
                mb-3
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-brand-border
                bg-white
                px-3.5
                py-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-brand-primary
              "
            >
              <Bell className="h-3.5 w-3.5" />

              Account activity
            </div>

            <h1
              className="
                !m-0
                text-[32px]
                font-bold
                tracking-[-0.025em]
                text-brand-dark
                sm:text-[38px]
              "
            >
              Notifications
            </h1>

            <p
              className="
                !mb-0
                mt-2
                max-w-[620px]
                text-sm
                leading-6
                text-brand-textMuted
                sm:text-base
              "
            >
              Stay informed about your
              applications, messages,
              profile and TruCity account.
            </p>
          </div>

          {/* ===============================================
              HEADER ACTIONS
          ================================================ */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
            {readCount > 0 && (
              <button
                type="button"
                onClick={
                  clearReadNotifications
                }
                className="
                  inline-flex
                  min-h-[42px]
                  items-center
                  justify-center
                  gap-2
                  rounded-[12px]
                  border
                  border-brand-border
                  bg-white
                  px-4
                  text-xs
                  font-bold
                  text-brand-textMuted
                  transition-colors

                  hover:border-[#ff4672]
                  hover:bg-[#fff5f7]
                  hover:text-[#c72e53]
                "
              >
                <Trash2 className="h-3.5 w-3.5" />

                Clear read
              </button>
            )}

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={
                  markAllAsRead
                }
                className="
                  trucity-button
                  trucity-button-primary
                  min-h-[42px]
                  gap-2
                  px-4
                  text-xs
                "
              >
                <CheckCheck className="h-4 w-4" />

                Mark all as read
              </button>
            )}
          </div>
        </section>

        {/* =================================================
            SUMMARY
        ================================================== */}

        <section
          className="
            mb-6
            grid
            grid-cols-2
            gap-3
            sm:max-w-[430px]
          "
        >
          <SummaryCard
            label="Total"
            value={
              notifications.length
            }
          />

          <SummaryCard
            label="Unread"
            value={
              unreadCount
            }
            highlighted={
              unreadCount > 0
            }
          />
        </section>

        {/* =================================================
            MAIN CARD
        ================================================== */}

        <section
          className="
            overflow-hidden
            rounded-[22px]
            border
            border-brand-border
            bg-white
            shadow-[0_18px_45px_rgba(0,70,109,0.07)]
          "
        >
          {/* ===============================================
              FILTER BAR
          ================================================ */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              border-b
              border-brand-border
              px-4
              py-3
              sm:px-6
            "
          >
            <div
              className="
                flex
                items-center
                gap-1
                rounded-[12px]
                bg-brand-bg
                p-1
              "
            >
              <FilterButton
                active={
                  filter === 'all'
                }
                onClick={() =>
                  setFilter('all')
                }
              >
                All

                <CountBadge
                  value={
                    notifications.length
                  }
                />
              </FilterButton>

              <FilterButton
                active={
                  filter ===
                  'unread'
                }
                onClick={() =>
                  setFilter(
                    'unread',
                  )
                }
              >
                Unread

                <CountBadge
                  value={
                    unreadCount
                  }
                />
              </FilterButton>
            </div>

            <span
              className="
                hidden
                text-xs
                font-medium
                text-brand-textMuted
                sm:block
              "
            >
              {
                visibleNotifications.length
              }{' '}
              notification
              {visibleNotifications.length ===
              1
                ? ''
                : 's'}
            </span>
          </div>

          {/* ===============================================
              NOTIFICATION LIST
          ================================================ */}

          {visibleNotifications.length >
          0 ? (
            <div>
              {visibleNotifications.map(
                (
                  notification,
                ) => (
                  <NotificationRow
                    key={
                      notification.id
                    }
                    notification={
                      notification
                    }
                    onOpen={() =>
                      openNotification(
                        notification,
                      )
                    }
                    onMarkRead={() =>
                      markAsRead(
                        notification.id,
                      )
                    }
                    onDelete={() =>
                      deleteNotification(
                        notification.id,
                      )
                    }
                  />
                ),
              )}
            </div>
          ) : (
            <EmptyState
              filter={
                filter
              }
              onShowAll={() =>
                setFilter(
                  'all',
                )
              }
            />
          )}
        </section>

        {/* =================================================
            FOOTNOTE
        ================================================== */}

        <p
          className="
            !mb-0
            mt-5
            text-center
            text-xs
            leading-5
            text-brand-textMuted
          "
        >
          Important account and security
          notifications may remain visible
          even after they have been read.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   NOTIFICATION ROW
========================================================= */

interface NotificationRowProps {
  notification: CandidateNotification;

  onOpen: () => void;

  onMarkRead: () => void;

  onDelete: () => void;
}

function NotificationRow({
  notification,
  onOpen,
  onMarkRead,
  onDelete,
}: NotificationRowProps) {
  return (
    <div
      className={`
        group
        relative
        flex
        gap-4
        border-b
        border-brand-border
        px-4
        py-5
        transition-colors
        last:border-b-0
        sm:px-6

        ${
          notification.read
            ? 'bg-white hover:bg-brand-bg'
            : 'bg-brand-bg hover:bg-[#f2f9fd]'
        }
      `}
    >
      {/* ===================================================
          UNREAD MARKER
      ==================================================== */}

      {!notification.read && (
        <span
          className="
            absolute
            left-1.5
            top-1/2
            h-2
            w-2
            -translate-y-1/2
            rounded-full
            bg-brand-gold
          "
        />
      )}

      {/* ===================================================
          ICON
      ==================================================== */}

      <NotificationIcon
        type={
          notification.type
        }
      />

      {/* ===================================================
          CONTENT
      ==================================================== */}

      <button
        type="button"
        onClick={onOpen}
        className="
          min-w-0
          flex-1
          text-left
        "
      >
        <div
          className="
            flex
            flex-col
            gap-1
            sm:flex-row
            sm:items-start
            sm:justify-between
            sm:gap-4
          "
        >
          <h2
            className={`
              !m-0
              text-[14px]
              text-brand-dark
              sm:text-[15px]

              ${
                notification.read
                  ? 'font-semibold'
                  : 'font-bold'
              }
            `}
          >
            {
              notification.title
            }
          </h2>

          <span
            className="
              shrink-0
              text-[11px]
              font-medium
              text-brand-textMuted
            "
          >
            {
              notification.time
            }
          </span>
        </div>

        <p
          className="
            !mb-0
            mt-1.5
            max-w-[760px]
            text-[13px]
            leading-5
            text-brand-textMuted
          "
        >
          {
            notification.message
          }
        </p>

        {notification.destination && (
          <span
            className="
              mt-3
              inline-flex
              items-center
              gap-1
              text-xs
              font-bold
              text-brand-primary
            "
          >
            View details

            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        )}
      </button>

      {/* ===================================================
          ACTIONS
      ==================================================== */}

      <div
        className="
          flex
          shrink-0
          items-start
          gap-1
        "
      >
        {!notification.read && (
          <button
            type="button"
            onClick={
              onMarkRead
            }
            aria-label={`Mark ${notification.title} as read`}
            title="Mark as read"
            className="
              grid
              h-9
              w-9
              place-items-center
              rounded-[10px]
              text-brand-textMuted
              transition-colors

              hover:bg-brand-surface
              hover:text-brand-primary
            "
          >
            <Check className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={
            onDelete
          }
          aria-label={`Delete ${notification.title}`}
          title="Delete notification"
          className="
            grid
            h-9
            w-9
            place-items-center
            rounded-[10px]
            text-brand-textMuted
            transition-colors

            hover:bg-[#fff5f7]
            hover:text-[#c72e53]
          "
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   NOTIFICATION ICON
========================================================= */

function NotificationIcon({
  type,
}: {
  type: NotificationType;
}) {
  const baseClass =
    `
      grid
      h-10
      w-10
      shrink-0
      place-items-center
      rounded-full
    `;

  switch (type) {
    case 'message':
      return (
        <span
          className={`
            ${baseClass}
            bg-[#e8f5fc]
            text-brand-accent
          `}
        >
          <MessageSquare className="h-[18px] w-[18px]" />
        </span>
      );

    case 'profile':
      return (
        <span
          className={`
            ${baseClass}
            bg-[#fff6df]
            text-brand-primary
          `}
        >
          <FileCheck2 className="h-[18px] w-[18px]" />
        </span>
      );

    case 'verification':
      return (
        <span
          className={`
            ${baseClass}
            bg-[#ebfff5]
            text-[#167a50]
          `}
        >
          <ShieldCheck className="h-[18px] w-[18px]" />
        </span>
      );

    case 'system':
      return (
        <span
          className={`
            ${baseClass}
            bg-brand-surface
            text-brand-primary
          `}
        >
          <Bell className="h-[18px] w-[18px]" />
        </span>
      );

    case 'application':
    default:
      return (
        <span
          className={`
            ${baseClass}
            bg-brand-surface
            text-brand-primary
          `}
        >
          <BriefcaseBusiness className="h-[18px] w-[18px]" />
        </span>
      );
  }
}

/* =========================================================
   SUMMARY CARD
========================================================= */

interface SummaryCardProps {
  label: string;

  value: number;

  highlighted?: boolean;
}

function SummaryCard({
  label,
  value,
  highlighted = false,
}: SummaryCardProps) {
  return (
    <div
      className={`
        rounded-[16px]
        border
        px-4
        py-3.5

        ${
          highlighted
            ? 'border-brand-gold bg-[#fffaf0]'
            : 'border-brand-border bg-white'
        }
      `}
    >
      <p
        className="
          !mb-0
          text-[10px]
          font-bold
          uppercase
          tracking-[0.12em]
          text-brand-textMuted
        "
      >
        {label}
      </p>

      <p
        className="
          !mb-0
          mt-1
          text-2xl
          font-bold
          text-brand-dark
        "
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   FILTER BUTTON
========================================================= */

interface FilterButtonProps {
  active: boolean;

  onClick: () => void;

  children: ReactNode;
}

function FilterButton({
  active,
  onClick,
  children,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`
        inline-flex
        min-h-[36px]
        items-center
        gap-2
        rounded-[9px]
        px-3
        text-xs
        font-bold
        transition-colors

        ${
          active
            ? 'bg-white text-brand-primary shadow-sm'
            : 'text-brand-textMuted hover:text-brand-primary'
        }
      `}
    >
      {children}
    </button>
  );
}

/* =========================================================
   COUNT BADGE
========================================================= */

function CountBadge({
  value,
}: {
  value: number;
}) {
  return (
    <span
      className="
        grid
        min-w-[20px]
        place-items-center
        rounded-full
        bg-brand-surface
        px-1.5
        py-0.5
        text-[9px]
        font-bold
        text-brand-primary
      "
    >
      {value > 99
        ? '99+'
        : value}
    </span>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

interface EmptyStateProps {
  filter: NotificationFilter;

  onShowAll: () => void;
}

function EmptyState({
  filter,
  onShowAll,
}: EmptyStateProps) {
  return (
    <div
      className="
        flex
        min-h-[330px]
        flex-col
        items-center
        justify-center
        px-6
        py-12
        text-center
      "
    >
      <div
        className="
          mb-4
          grid
          h-14
          w-14
          place-items-center
          rounded-full
          border
          border-brand-border
          bg-brand-bg
          text-brand-primary
        "
      >
        {filter ===
        'unread' ? (
          <CheckCheck className="h-6 w-6" />
        ) : (
          <Bell className="h-6 w-6" />
        )}
      </div>

      <h2
        className="
          !m-0
          text-lg
          font-bold
          text-brand-dark
        "
      >
        {filter ===
        'unread'
          ? 'You are all caught up'
          : 'No notifications yet'}
      </h2>

      <p
        className="
          !mb-0
          mt-2
          max-w-[390px]
          text-sm
          leading-6
          text-brand-textMuted
        "
      >
        {filter ===
        'unread'
          ? 'You have no unread notifications at the moment.'
          : 'Updates about applications, messages and your account will appear here.'}
      </p>

      {filter ===
        'unread' && (
        <button
          type="button"
          onClick={
            onShowAll
          }
          className="
            mt-5
            inline-flex
            min-h-[40px]
            items-center
            justify-center
            rounded-[12px]
            border
            border-brand-primary
            bg-white
            px-4
            text-xs
            font-bold
            text-brand-primary
            transition-colors

            hover:bg-brand-bg
          "
        >
          View all notifications
        </button>
      )}
    </div>
  );
}