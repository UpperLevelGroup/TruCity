import { Outlet } from "react-router-dom";

export default function CompanyLayout() {
  return (
    <div className="company-layout">
      <Outlet />
    </div>
  );
}