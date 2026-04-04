import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import RagChatBox from "../rag/RagChatBox";

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-96 max-w-[calc(100vw-3rem)] rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-scale-in origin-bottom-right">
          <div className="bg-gradient-to-r from-primary-800 to-primary-950 p-4 flex justify-between items-center text-white">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MessageCircle size={20} />
              AI Assistant
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-primary-100 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-0 max-h-[60vh] overflow-y-auto bg-gray-50/50">
            <RagChatBox compact />
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-300"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default FloatingChatbot;
