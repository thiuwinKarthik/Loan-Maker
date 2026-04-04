import React from "react";
import Sidebar from "./Sidebar";
import FloatingChatbot from "./FloatingChatbot";

const DashboardWrapper = ({ user, children }) => {
  return (
    <div className="flex">
      <Sidebar role={user.role} />
      <main className="flex-1 min-h-screen bg-transparent relative">
        <div className="container-responsive py-6">{children}</div>
      </main>
      <FloatingChatbot />
    </div>
  );
};

export default DashboardWrapper;
