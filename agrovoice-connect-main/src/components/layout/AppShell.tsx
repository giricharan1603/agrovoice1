import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Sidebar, type NavItem } from "./Sidebar";
import { BottomNav, type BottomNavItem } from "./BottomNav";

interface AppShellProps {
  children: ReactNode;
  role: "farmer" | "driver" | "admin";
  userName?: string;
  sidebarItems: NavItem[];
  bottomNavItems: BottomNavItem[];
}

export function AppShell({
  children,
  role,
  userName,
  sidebarItems,
  bottomNavItems,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar role={role} userName={userName} />
      <div className="flex">
        <Sidebar items={sidebarItems} />
        <main className="flex-1 min-h-[calc(100vh-4rem)] pb-24 md:pb-8 px-4 md:px-8 py-6 md:pl-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
      <BottomNav items={bottomNavItems} />
    </div>
  );
}
