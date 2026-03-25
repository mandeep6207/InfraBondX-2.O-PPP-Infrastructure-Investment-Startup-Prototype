import { ReactNode } from "react";
import { LayoutDashboard, LogOut, User, Moon, Sun, Settings, HelpCircle, UserCheck, FolderCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { NotificationDropdown } from "./NotificationDropdown";

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const InfraBondXLogo = () => (
  <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="10" fill="#0c4a6e"/>
    <path d="M14 34V14h4v20h-4Z" fill="#38bdf8"/>
    <path d="M22 34V20h4v14h-4Z" fill="#7dd3fc"/>
    <path d="M30 34V24h4v10h-4Z" fill="#bae6fd"/>
    <path d="M12 14h26v3H12v-3Z" fill="#38bdf8"/>
  </svg>
);

export function AdminLayout({ children, currentPage, onNavigate }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const userInitials = (user?.name || "Admin")
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const menuItems = [
    { id: "admin-dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "verify-issuers", icon: UserCheck, label: "Verify Project Developers" },
    { id: "approve-projects", icon: FolderCheck, label: "Approve Projects" },
    { id: "fraud-monitoring", icon: ShieldAlert, label: "Fraud Tracking Investment" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Top Navigation — Glass effect */}
      <nav className="glass-nav border-b border-border/50 sticky top-0 z-40">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <InfraBondXLogo />
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground tracking-tight">InfraBondX</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 rounded-full">
                Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-accent transition-colors"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
            </button>

            {/* Notifications */}
            <NotificationDropdown role="admin" />

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {userInitials}
            </div>

            <button
              onClick={() => { logout(); onNavigate("landing"); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/70 text-sm text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 hover:scale-[1.02]"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 sidebar-gradient border-r border-border/50 min-h-[calc(100vh-57px)] sticky top-[57px] flex flex-col h-[calc(100vh-57px)]">
          <nav className="p-3 space-y-1 flex-1">
            {menuItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-left animate-slide-in-left",
                  currentPage === item.id
                    ? "bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-md shadow-amber-500/20 dark:from-amber-500 dark:to-orange-600"
                    : "text-muted-foreground hover:bg-white/60 dark:hover:bg-white/5 hover:text-foreground"
                )}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto p-3 border-t border-border/50 bg-background/30">
            <div className="flex items-center gap-2.5 px-2.5 py-2 mb-2 rounded-lg">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {userInitials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight truncate">{user?.name || "Platform"}</p>
                <p className="text-[11px] text-muted-foreground leading-tight truncate">{user?.email || "admin@infrabondx.com"}</p>
              </div>
            </div>

            <div className="space-y-1.5 pb-2 mb-2 border-b border-border/50">
              <button
                onClick={() => onNavigate("profile")}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/70 dark:hover:bg-white/10 transition-all duration-200 hover:scale-[1.01]"
              >
                <User className="w-4 h-4" /> Profile
              </button>
              <button
                onClick={() => onNavigate("settings")}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/70 dark:hover:bg-white/10 transition-all duration-200 hover:scale-[1.01]"
              >
                <Settings className="w-4 h-4" /> Settings
              </button>
              <button
                onClick={() => onNavigate("help")}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/70 dark:hover:bg-white/10 transition-all duration-200 hover:scale-[1.01]"
              >
                <HelpCircle className="w-4 h-4" /> Help & Support
              </button>
            </div>

          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
