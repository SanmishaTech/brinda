import React from "react";
import AdminDashboard from "./AdminDashboard";
import MemberDashboard from "./MemberDashboard";
import SuperAdminDashboard from "./SuperAdminDashboard";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user || !user.role) return null; // or a fallback/redirect

  if (user.role === "admin") {
    return <AdminDashboard />;
  } else {
    return <MemberDashboard />;
  }
  // Add more roles as needed
};

export default Dashboard;
