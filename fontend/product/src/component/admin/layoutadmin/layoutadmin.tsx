import { Outlet } from "react-router-dom";
import Header from "../adminHome/header";
import Sidebar from "../adminHome/sidebar";
import { AdminNotificationProvider } from "../../hook/hook";

export default function AdminLayout() {
  return (
    <AdminNotificationProvider>
      <div className="min-vh-100 bg-light">
        <div className="d-flex min-vh-100">
          <Sidebar />

          <div className="flex-grow-1 d-flex flex-column min-w-0">
            <Header />

            <main className="flex-grow-1 p-3 bg-body-tertiary">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </AdminNotificationProvider>
  );
}