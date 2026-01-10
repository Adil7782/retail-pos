"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Barcode,
  FileText
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "POS", href: "/pos", icon: ShoppingCart },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Barcode Simulator", href: "/tools/scale-simulator", icon: Barcode },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-screen bg-slate-900 text-white transition-all duration-300 ease-in-out flex flex-col relative border-r border-slate-800",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-slate-800">
        <div className="font-bold text-xl text-blue-500">
          {isCollapsed ? "P" : "POS System"}
        </div>
      </div>

      {/* Toggle Button (Absolute positioned on the border) */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 bg-blue-600 rounded-full p-1 text-white hover:bg-blue-500 transition shadow-lg z-50"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 space-y-2 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-3 py-3 rounded-lg transition-colors group",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white",
                isCollapsed && "justify-center"
              )}
            >
              <item.icon size={22} />
              <span
                className={cn(
                  "whitespace-nowrap transition-all duration-300 overflow-hidden",
                  isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}
              >
                {item.name}
              </span>

              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-50 whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button className={cn(
          "flex items-center gap-4 w-full text-red-400 hover:bg-slate-800 p-2 rounded-lg transition",
          isCollapsed && "justify-center"
        )}>
          <LogOut size={22} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}