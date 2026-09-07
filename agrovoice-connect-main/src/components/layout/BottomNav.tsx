import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export interface BottomNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  primary?: boolean;
}

interface BottomNavProps {
  items: BottomNavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
      <div className="flex items-stretch justify-around px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          if (item.primary) {
            return (
              <Link
                key={item.to}
                to={item.to}
                className="-mt-6 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-brand-gradient text-brand-foreground shadow-lg shadow-brand/30"
              >
                <Icon className="h-6 w-6" />
              </Link>
            );
          }
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex flex-1 flex-col items-center gap-1 rounded-md px-2 py-2 text-[10px] font-medium text-muted-foreground"
              activeProps={{
                className:
                  "flex flex-1 flex-col items-center gap-1 rounded-md px-2 py-2 text-[10px] font-medium text-brand",
              }}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
