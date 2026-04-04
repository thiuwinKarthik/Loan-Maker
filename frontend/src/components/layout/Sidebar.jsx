import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import FloatingChatbot from "./FloatingChatbot";
import {
  LogOut,
  Menu,
  Users,
  Home,
  FileText,
  CreditCard,
  BarChart2,
  BadgePercent,
  Database,
  UserCheck,
  Bot,
} from "lucide-react";

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Open sidebar via custom event (optional)
  useEffect(() => {
    const handler = () => setMobileOpen(true);
    document.addEventListener("open-sidebar", handler);
    return () => document.removeEventListener("open-sidebar", handler);
  }, []);

  // Dispatch sidebar open/close events
  useEffect(() => {
    const evt = new Event(mobileOpen ? "sidebar-opened" : "sidebar-closed");
    document.dispatchEvent(evt);
  }, [mobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Links for user/admin
  const userLinks = [
    { name: "Dashboard", to: "/dashboard", icon: <Home size={18} /> },
    { name: "Apply Loan", to: "/apply-loan", icon: <CreditCard size={18} /> },
    { name: "Loan History", to: "/loan-history", icon: <FileText size={18} /> },
    { name: "Profile", to: "/profile", icon: <Users size={18} /> },
    { name: "Offers", to: "/offers", icon: <BadgePercent size={18} /> },
    { name: "Assets", to: "/assets", icon: <Database size={18} /> },
    { name: "Loan Advisor", to: "/advisor", icon: <Bot size={18} /> },
  ];

  const adminLinks = [
    { name: "Dashboard", to: "/admin", icon: <Home size={18} /> },
    { name: "Users", to: "/admin/users", icon: <Users size={18} /> },
    { name: "Loans", to: "/admin/loans", icon: <CreditCard size={18} /> },
    { name: "Reports", to: "/admin/reports", icon: <BarChart2 size={18} /> },
    { name: "Admins", to: "/admin/add", icon: <UserCheck size={18} /> },
    { name: "AI Advisor", to: "/admin/advisor", icon: <Bot size={18} /> },
  ];

  const links = role === "ROLE_ADMIN" ? adminLinks : userLinks;

  return (
    <>
      {/* Mobile Toggle Button */}
      {!mobileOpen && (
        <button
          className="fixed left-4 top-4 z-[100] rounded-lg bg-gray-900/90 p-2 text-white shadow-lg backdrop-blur md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      )}

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed md:relative h-screen bg-gradient-to-b from-[#0b1d30] to-[#06101c] text-white flex flex-col border-r border-primary-800/50 shadow-2xl transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 z-[100]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-primary-800/50">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-yellow-600 flex items-center justify-center shadow-lg">
                <span className="font-bold text-[#06101c] text-xl leading-none">L</span>
              </div>
              <h1 className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Loan Maker</h1>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-accent to-yellow-600 flex items-center justify-center shadow-lg">
              <span className="font-bold text-[#06101c] text-xl leading-none">L</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            {/* Collapse button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 hover:bg-primary-800 text-gray-400 hover:text-white rounded hidden md:block transition-colors"
              aria-label="Toggle collapse"
            >
              <Menu size={20} />
            </button>
            {/* Close button on mobile */}
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 hover:bg-primary-800 text-gray-400 hover:text-white rounded md:hidden"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 mt-6 overflow-auto px-3 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                  ? 'bg-gradient-to-r from-primary-800 to-primary-800/40 text-white shadow-md border border-primary-700/50' 
                  : 'text-gray-400 hover:bg-primary-800/30 hover:text-white hover:border-primary-800/30 border border-transparent'
                }`}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? link.name : undefined}
              >
                <div className={`${isActive ? 'text-accent' : 'text-gray-400 group-hover:text-accent'} transition-colors`}>
                  {link.icon}
                </div>
                {!collapsed && <span className="font-medium text-sm tracking-wide">{link.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-primary-800/50">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-center gap-2'} py-3 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-gray-400 font-semibold transition-all duration-200 border border-transparent hover:border-red-500/20`}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut size={18} />
            {!collapsed && "Secure Logout"}
          </button>
        </div>
      </div>
      <FloatingChatbot />
    </>
  );
};

export default Sidebar;
