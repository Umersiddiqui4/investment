import {
  setIsMobile,
  setSelectedCategory,
  setSidebarCollapsed,
  setSidebarOpen,
} from "@/redux/appSlice";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebaar() {
  const location = useLocation();

  const sidebarOpen = useSelector((state: any) => state.app.sideBarOpen);
  const sidebarCollapsed = useSelector((state: any) => state.app.sidebarCollapsed);
  const isMobile = useSelector((state: any) => state.app.isMobile);
  const selectedCategory = useSelector((state: any) => state.app.selectedCategory);

  const dispatch = useDispatch();

  const toggleSidebar = () => {
    if (isMobile) {
      dispatch(setSidebarOpen(!sidebarOpen));
    } else {
      dispatch(setSidebarCollapsed(!sidebarCollapsed));
    }
  };

  useEffect(() => {
    const checkIfMobile = () => {
      dispatch(setIsMobile(window.innerWidth < 768));
      if (window.innerWidth >= 768) {
        dispatch(setSidebarOpen(false));
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  console.log("selectedCategory", selectedCategory);
  console.log("mobile", isMobile);
  console.log("sidebarOpen", sidebarOpen);
  console.log("sidebarcolapsed", sidebarCollapsed);

  return (
    <div
      className={`${
        isMobile
          ? sidebarOpen
            ? "translate-x-0 fixed inset-y-0 left-0 z-30"
            : "-translate-x-full fixed inset-y-0 left-0 z-30"
          : sidebarCollapsed
          ? "w-20"
          : "w-[220px]"
      } bg-white/80 dark:bg-slate-800/50 backdrop-blur-md border-r border-slate-200 dark:border-slate-700/50 transition-all duration-300 flex flex-col ${
        isMobile ? "w-[280px]" : ""
      }`}
    >
      <div className="px-4 pb-4 pt-4 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
        {(!sidebarCollapsed || isMobile) && (
          <div className="font-bold text-xl bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-500 bg-clip-text text-transparent">
            InvestFuture
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50 md:flex hidden"
        >
          {sidebarCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </Button>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(setSidebarOpen(false))}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
          >
            <X size={18} />
          </Button>
        )}
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        <SidebarNav
          collapsed={sidebarCollapsed && !isMobile}
          isMobile={isMobile}
          activePath={location.pathname}
        />
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = true,
  collapsed = false,
  category,
  nav,
}: any) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  return (
    <div
      className={`flex cursor-pointer items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
        active
          ? "bg-slate-100 dark:bg-gradient-to-r dark:from-cyan-500/20 dark:to-purple-500/20 text-slate-900 dark:text-white"
          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-700/50"
      }`}
      onClick={() => {
        dispatch(setSelectedCategory(category));
        navigate(nav);
      }}
    >
      <div className={`${active ? "text-cyan-600 dark:text-cyan-400" : ""}`}>
        {icon}
      </div>
      {!collapsed && <span className="ml-3 text-sm">{label}</span>}
    </div>
  );
}

// Sidebar Navigation Component
function SidebarNav({ collapsed = false, isMobile = false, activePath }: any) {
  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      ),
    },
    {
      name: "Investors Or Company",
      href: "/investors",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      name: "Installments",
      href: "/installments",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
      ),
    },
    {
      name: "Users",
      href: "/add-customer",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      name: "Settings",
      href: "/setting",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      name: "Profile",
      href: "/profile",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      name: "Sales",
      href: "/sell",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2l1.5 4H20l-1.68 9.39a2 2 0 0 1-2 1.61H8.28a2 2 0 0 1-2-1.61L4 6h16" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      name: "Purchase",
      href: "/customerrequest",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
    },
    {
      name: "Customer Request for App owner only",
      href: "/customer-request",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="space-y-1 px-2">
      {navItems.map((item) => {
        const isActive = activePath === item.href;
        return (
          <NavItem
            key={item.href}
            nav={item.href}
            category={item.name}
            icon={item.icon}
            label={
              isMobile && item.name === "Customer Request for App owner only"
                ? "Customer Request"
                : item.name
            }
            active={isActive}
            collapsed={collapsed}
          />
        );
      })}
    </nav>
  );
}
