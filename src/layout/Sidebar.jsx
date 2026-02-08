import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Globe,
  FileText,
  Filter,
  PenTool,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import logo from "../assets/icon.jpeg"; // Ensure this path is correct

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Receive state and toggle function from parent
const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Websites List", path: "/websites", icon: Globe },
    { name: "Raw Posts", path: "/posts/raw-posts", icon: FileText },
    { name: "Original Posts", path: "/posts/original", icon: Filter },
    { name: "Clustered Posts", path: "/posts/clustered", icon: Filter },
    { name: "Summarized Posts", path: "/posts/summarized", icon: PenTool },
    { name: "Re-phrased Posts", path: "/posts/rephrased", icon: PenTool },
    { name: "Final Posts", path: "/posts/final", icon: PenTool },
  ];

  return (
    <aside
      className={cn(
        "h-screen bg-slate-900 text-white flex flex-col transition-all duration-300 border-r border-slate-800 shadow-xl z-50 fixed left-0 top-0",
        isCollapsed ? "w-24" : "w-72",
      )}
    >
      {/* --- HEADER --- */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src={logo}
            alt="Logo"
            className="w-8 h-8 rounded-full min-w-[32px]"
          />
          <span
            className={cn(
              "font-bold tracking-wider text-emerald-400 whitespace-nowrap transition-all duration-300",
              isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto",
            )}
          >
           The World Mirror
          </span>
        </div>

        <button
          onClick={toggleSidebar}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-auto"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group relative",
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white",
              )
            }
          >
            <item.icon size={22} className="min-w-[22px]" />

            <span
              className={cn(
                "whitespace-nowrap overflow-hidden transition-all duration-300 origin-left",
                isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
              )}
            >
              {item.name}
            </span>

            {/* Hover Tooltip (Only visible when collapsed) */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* --- FOOTER --- */}
      <div className="p-3 border-t border-slate-800">
        <button
          className={cn(
            "flex items-center gap-4 px-3 py-3 w-full rounded-lg text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all group relative",
            isCollapsed && "justify-center",
          )}
          onClick={() => console.log("Logging out...")}
        >
          <LogOut size={22} className="min-w-[22px]" />
          <span
            className={cn(
              "whitespace-nowrap overflow-hidden transition-all duration-300",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
            )}
          >
            Logout
          </span>
          {isCollapsed && (
            <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
