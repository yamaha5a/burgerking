import { createContext, useContext, useState, type ReactNode } from "react";

export type AdminNotificationType = "success" | "error" | "info";

export interface AdminNotification {
  id: number;
  type: AdminNotificationType;
  message: string;
}

interface AdminNotificationContextValue {
  notifications: AdminNotification[];
  notify: (type: AdminNotificationType, message: string) => void;
  remove: (id: number) => void;
}

const AdminNotificationContext = createContext<AdminNotificationContextValue | undefined>(
  undefined
);

let counter = 0;

export const AdminNotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  const notify = (type: AdminNotificationType, message: string) => {
    const id = ++counter;
    setNotifications((prev) => [...prev, { id, type, message }]);

    // Tự động ẩn sau 4 giây
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const remove = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <AdminNotificationContext.Provider value={{ notifications, notify, remove }}>
      {children}

      {/* Vùng hiển thị thông báo cho admin */}
      <div
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 1055,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {notifications.map((n) => {
          const variant =
            n.type === "success" ? "success" : n.type === "error" ? "danger" : "info";
          return (
            <div
              key={n.id}
              className={`alert alert-${variant} alert-dismissible fade show shadow-sm`}
              role="alert"
              style={{ minWidth: 260, maxWidth: 360 }}
            >
              {n.message}
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => remove(n.id)}
              />
            </div>
          );
        })}
      </div>
    </AdminNotificationContext.Provider>
  );
};

export const useAdminNotification = () => {
  const ctx = useContext(AdminNotificationContext);
  if (!ctx) {
    throw new Error("useAdminNotification phải dùng bên trong AdminNotificationProvider");
  }
  return ctx;
};

export const NotificationProvider = AdminNotificationProvider;
export const useNotification = useAdminNotification;

