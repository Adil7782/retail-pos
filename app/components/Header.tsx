"use client";

import { Maximize, Minimize, Bell, Search } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Listen for fullscreen changes (ESC key press)
  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Search Bar */}
      <div className="relative w-96 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search products, orders..." 
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Fullscreen Button */}
        <button 
          onClick={toggleFullscreen}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>

        {/* Notifications */}
        <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full relative transition">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-700">Cashier One</p>
            <p className="text-xs text-slate-500">ID: #8832</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            C1
          </div>
        </div>
      </div>
    </header>
  );
}