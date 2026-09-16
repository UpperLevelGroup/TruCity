import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type NotificationType =
  | "message"
  | "application"
  | "profile"
  | "verification"
  | "system";

export type CandidateNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  destination?: string;
};

type NotificationsContextValue = {
  notifications: CandidateNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: CandidateNotification,) => void;
  deleteNotification: (id: string) => void;
  clearReadNotifications: () => void;
};

const NotificationsContext =
  createContext<NotificationsContextValue | undefined>(
    undefined,
  );

const INITIAL_NOTIFICATIONS: CandidateNotification[] = [
  {
    id: "candidate-notification-1",
    type: "system",
    title: "Welcome to TruCity",
    message:
      "Your candidate account is ready. Complete your profile to get started.",
    time: "Just now",
    read: false,
    destination: "/candidate/profile",
  },
];

type NotificationsProviderProps = {
  children: ReactNode;
};

export function NotificationsProvider({
  children,
}: NotificationsProviderProps) {
  const [notifications, setNotifications] =
    useState<CandidateNotification[]>(
      INITIAL_NOTIFICATIONS,
    );

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !notification.read,
      ).length,
    [notifications],
  );

  const markAsRead = (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  };
   
  const deleteNotification = (id: string) => {
    setNotifications((current) =>
      current.filter(
        (notification) => notification.id !== id,
      ),
    );
  };

  const clearReadNotifications = () => {
    setNotifications((current) =>
      current.filter(
        (notification) => !notification.read,
      ),
    );
  };

  const addNotification = (
    notification: CandidateNotification,
  ) => {
    setNotifications((current) => [
      notification,
      ...current,
    ]);
  };

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification,
      deleteNotification,
      clearReadNotifications,
    }),
    [
     notifications, 
     unreadCount,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(
    NotificationsContext,
  );

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationsProvider.",
    );
  }

  return context;
}
