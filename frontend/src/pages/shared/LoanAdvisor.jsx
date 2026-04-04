import React from "react";
import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import RagChatBox from "../../components/rag/RagChatBox";
import { session } from "../../shared/auth/session";

const LoanAdvisor = () => {
  const user = session.getUser();
  const role = user?.role || "USER";
  const title = role === "ROLE_ADMIN" ? "AI Portfolio Advisor" : "AI Loan Advisor";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} />
      <div className="flex-1">
        <Navbar title={title} />
        <div className="container-responsive py-6">
          <RagChatBox />
        </div>
      </div>
    </div>
  );
};

export default LoanAdvisor;
