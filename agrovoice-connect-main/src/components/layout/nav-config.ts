import {
  Home,
  Mic,
  Package,
  User,
  Truck,
  Route as RouteIcon,
  ClipboardList,
  LayoutDashboard,
  Users,
  AlertTriangle,
  Settings,
  Sparkles,
} from "lucide-react";
import type { NavItem } from "./Sidebar";
import type { BottomNavItem } from "./BottomNav";

export const farmerSidebar: NavItem[] = [
  { to: "/farmer/dashboard", label: "Dashboard", icon: Home },
  { to: "/farmer/new-shipment", label: "Voice Shipment", icon: Mic },
  { to: "/farmer/ai-assistant", label: "Kisan Mitr AI", icon: Sparkles },
];

export const farmerBottomNav: BottomNavItem[] = [
  { to: "/farmer/dashboard", label: "Home", icon: Home },
  { to: "/farmer/new-shipment", label: "Speak", icon: Mic, primary: true },
  { to: "/farmer/ai-assistant", label: "Kisan AI", icon: Sparkles },
  { to: "/farmer/dashboard", label: "Shipments", icon: Package },
];

export const driverSidebar: NavItem[] = [
  { to: "/driver/dashboard", label: "Dashboard & Map", icon: LayoutDashboard },
  { to: "/driver/route-setup", label: "Route Builder", icon: RouteIcon },
];

export const driverBottomNav: BottomNavItem[] = [
  { to: "/driver/dashboard", label: "Map & Home", icon: Home },
  { to: "/driver/route-setup", label: "Routes", icon: RouteIcon, primary: true },
  { to: "/driver/dashboard", label: "Loads", icon: Truck },
];

export const adminSidebar: NavItem[] = [
  { to: "/admin/dashboard", label: "Platform Metrics", icon: LayoutDashboard },
  { to: "/admin/users", label: "User Directory", icon: Users },
  { to: "/admin/disputes", label: "Dispute Hub", icon: AlertTriangle },
];

export const adminBottomNav: BottomNavItem[] = [
  { to: "/admin/dashboard", label: "Metrics", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/disputes", label: "Disputes", icon: AlertTriangle },
];
