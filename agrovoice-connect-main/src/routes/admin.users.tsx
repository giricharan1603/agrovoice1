import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Search, CheckCircle, ShieldAlert, Truck, Leaf, Filter } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { adminSidebar, adminBottomNav } from "@/components/layout/nav-config";
import toast from "react-hot-toast";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "User Directory — AgroVoice Admin" }] }),
  component: UsersPage,
});

interface UserRecord {
  id: string;
  name: string;
  phone: string;
  role: "farmer" | "driver";
  location: string;
  verified: boolean;
  tripsCount: number;
}

const INITIAL_USERS: UserRecord[] = [
  { id: "U-101", name: "Ramesh Sharma", phone: "+91 98765 43210", role: "farmer", location: "Aligarh, UP", verified: true, tripsCount: 14 },
  { id: "U-102", name: "Gurpreet Singh", phone: "+91 98123 45678", role: "driver", location: "Agra, UP", verified: true, tripsCount: 38 },
  { id: "U-103", name: "Suresh Patel", phone: "+91 97654 32109", role: "farmer", location: "Khurja, UP", verified: true, tripsCount: 9 },
  { id: "U-104", name: "Harbhajan Lal", phone: "+91 97111 22233", role: "driver", location: "Bulandshahr, UP", verified: false, tripsCount: 5 },
  { id: "U-105", name: "Vikram Reddy", phone: "+91 96543 21098", role: "farmer", location: "Guntur, AP", verified: true, tripsCount: 22 },
];

function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "farmer" | "driver">("all");

  const toggleVerify = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const next = !u.verified;
          toast.success(`${u.name} verification status updated to ${next ? "Verified" : "Pending"}`);
          return { ...u, verified: next };
        }
        return u;
      })
    );
  };

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search) || u.location.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <AppShell
      role="admin"
      userName="Admin"
      sidebarItems={adminSidebar}
      bottomNavItems={adminBottomNav}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            User Directory Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search, verify, and supervise registered Farmers and Transport Drivers.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or village location..."
              className="w-full rounded-2xl border border-input bg-card pl-10 pr-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setRoleFilter("all")}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                roleFilter === "all" ? "bg-sky-600 text-white" : "bg-card border border-border text-muted-foreground"
              }`}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter("farmer")}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                roleFilter === "farmer" ? "bg-emerald-600 text-white" : "bg-card border border-border text-muted-foreground"
              }`}
            >
              Farmers
            </button>
            <button
              onClick={() => setRoleFilter("driver")}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                roleFilter === "driver" ? "bg-amber-600 text-white" : "bg-card border border-border text-muted-foreground"
              }`}
            >
              Drivers
            </button>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Phone / Contact</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Completed Trips</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-bold text-foreground flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold text-xs ${
                        u.role === "farmer" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                      }`}>
                        {u.name.charAt(0)}
                      </div>
                      {u.name}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        u.role === "farmer" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                      }`}>
                        {u.role === "farmer" ? <Leaf className="h-3 w-3" /> : <Truck className="h-3 w-3" />}
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-mono font-semibold text-muted-foreground">{u.phone}</td>
                    <td className="p-4 text-xs font-semibold text-foreground">{u.location}</td>
                    <td className="p-4 text-xs font-bold text-foreground">{u.tripsCount} Loads</td>
                    <td className="p-4">
                      {u.verified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <CheckCircle className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                          <ShieldAlert className="h-3.5 w-3.5" /> Pending KYC
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleVerify(u.id)}
                        className="rounded-xl border border-border bg-muted/40 px-3 py-1 text-xs font-bold hover:bg-muted"
                      >
                        {u.verified ? "Revoke" : "Approve KYC"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
