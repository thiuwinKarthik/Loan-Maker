import React from "react";

const Card = ({ title, value, icon }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-8 rounded-2xl shadow-xl flex flex-col justify-between transform hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-between">
        {icon && <div className="text-3xl text-indigo-600">{icon}</div>}
        <div className="text-right">
          <p className="text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Card;
