import React from "react";
import { LogOut } from "lucide-react";

const Navbar = ({ title }) => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/"; // redirect to login page
  };

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg p-4 md:p-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between relative">
        
        {/* Title */}
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-xl md:text-3xl lg:text-4xl font-bold text-white tracking-wide truncate">
          {title}
        </h1>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="ml-auto flex items-center gap-1 md:gap-2 bg-red-600 hover:bg-red-700 text-white px-2 py-1 md:px-4 md:py-2 rounded-xl font-medium text-sm md:text-base transition"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
