import { Outlet } from "react-router-dom";

import AdminSidebar from "../features/admin/components/AdminSidebar";
import AdminTopbar from "../features/admin/components/AdminTopbar";

import logo from "../assets/trucity-logo.png";

import "../styles/admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-main">
        <AdminTopbar />

        <main className="admin-content">
          {/* TruCity watermark */}
          <div
            className="admin-watermark"
            aria-hidden="true"
            style={{
              backgroundImage: `url(${logo})`,
            }}
          />

          <div className="admin-content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}