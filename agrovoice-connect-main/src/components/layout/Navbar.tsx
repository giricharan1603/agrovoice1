import { Link, useNavigate } from "@tanstack/react-router";
import { Leaf, LogOut, Globe, Sparkles, UserCheck, ShieldCheck, Truck, ChevronDown, Database, Flame } from "lucide-react";
import { useAuth, UserRole } from "@/lib/auth-context";

interface NavbarProps {
  role: UserRole;
  userName?: string;
}

const roleBadges: Record<UserRole, { label: string; bg: string; icon: any }> = {
  farmer: { label: "Farmer Portal", bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", icon: Leaf },
  driver: { label: "Driver Hub", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", icon: Truck },
  admin: { label: "Admin Console", bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20", icon: ShieldCheck },
};

export function Navbar({ role }: NavbarProps) {
  const { user, loginAs, logout } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    loginAs(newRole);
    if (newRole === "farmer") navigate({ to: "/farmer/dashboard" });
    else if (newRole === "driver") navigate({ to: "/driver/dashboard" });
    else if (newRole === "admin") navigate({ to: "/admin/dashboard" });
  };

  const badge = roleBadges[role] || roleBadges.farmer;
  const BadgeIcon = badge.icon;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur shadow-xs">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Brand Logo & Current Role */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient shadow-md shadow-brand/20">
              <Leaf className="h-5 w-5 text-brand-foreground" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-black tracking-tight text-foreground">
                AgroVoice
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">
                Load Sharing & Voice AI
              </span>
            </div>
          </Link>

          <div className={`hidden sm:flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${badge.bg}`}>
            <BadgeIcon className="h-3.5 w-3.5" />
            {badge.label}
          </div>

          {/* Firebase Firestore Status Pill */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
            <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
            Firebase Firestore Synced
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Quick AgroVoice AI button for farmers */}
          {role === "farmer" && (
            <Link
              to="/farmer/ai-assistant"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-muted px-3.5 py-1.5 text-xs font-bold text-brand hover:bg-brand/20 transition-all shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 animate-bounce" />
              <span className="hidden sm:inline">AgroVoice AI Assistant</span>
              <span className="sm:hidden">AI</span>
            </Link>
          )}

          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <select
              value={role}
              onChange={handleRoleChange}
              className="appearance-none rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted cursor-pointer pr-7 focus:outline-none focus:ring-2 focus:ring-brand/40"
              aria-label="Switch active role"
            >
              <option value="farmer">🧑‍🌾 Farmer View</option>
              <option value="driver">🚛 Driver View</option>
              <option value="admin">🛡️ Admin View</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          </div>

          {/* User Profile Pill */}
          {user && (
            <div className="hidden md:flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-1.5 border border-border">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-brand-foreground">
                {user.name.charAt(0)}
              </div>
              <span className="text-xs font-bold text-foreground">
                {user.name}
              </span>
            </div>
          )}

          {/* Sign Out */}
          <Link
            to="/login"
            onClick={() => logout()}
            className="inline-flex items-center justify-center rounded-xl p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
