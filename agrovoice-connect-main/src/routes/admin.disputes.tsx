import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldCheck, Phone, MapPin, Package } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { adminSidebar, adminBottomNav } from "@/components/layout/nav-config";
import toast from "react-hot-toast";

export const Route = createFileRoute("/admin/disputes")({
  head: () => ({ meta: [{ title: "Dispute Supervision — AgroVoice Admin" }] }),
  component: DisputesPage,
});

interface DisputeRecord {
  id: string;
  shipmentId: string;
  farmerName: string;
  driverName: string;
  issue: string;
  amount: number;
  status: "open" | "resolved" | "investigating";
  createdAt: string;
}

const INITIAL_DISPUTES: DisputeRecord[] = [
  {
    id: "DSP-501",
    shipmentId: "SHP-8903",
    farmerName: "Vikram Reddy",
    driverName: "Gurpreet Singh",
    issue: "Pickup delay due to highway fog near Hathras sector",
    amount: 750,
    status: "investigating",
    createdAt: "Today, 11:20 AM",
  },
  {
    id: "DSP-502",
    shipmentId: "SHP-8890",
    farmerName: "Suresh Patel",
    driverName: "Harbhajan Lal",
    issue: "Weight mismatch (Farmer stated 20Q, Scale read 19.2Q)",
    amount: 1800,
    status: "open",
    createdAt: "Yesterday, 4:15 PM",
  },
];

function DisputesPage() {
  const [disputes, setDisputes] = useState<DisputeRecord[]>(INITIAL_DISPUTES);

  const resolveDispute = (id: string) => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "resolved" } : d))
    );
    toast.success(`Dispute ${id} marked as resolved!`);
  };

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
            Dispute Supervision & Resolution
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage conflicts, weight discrepancies, and route delays between Farmers & Drivers.
          </p>
        </div>

        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <span className="font-bold text-foreground text-sm">{d.id}</span>
                  <span className="text-xs text-muted-foreground">&bull; Shipment: {d.shipmentId}</span>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  d.status === "resolved"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : d.status === "investigating"
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-red-500/10 text-red-500"
                }`}>
                  {d.status.toUpperCase()}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div>
                  <span className="text-muted-foreground block">Farmer</span>
                  <p className="font-bold text-foreground">{d.farmerName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block">Assigned Driver</span>
                  <p className="font-bold text-foreground">{d.driverName}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground block">Reported Issue</span>
                  <p className="font-semibold text-foreground bg-muted/30 p-3 rounded-xl border border-border mt-1">
                    {d.issue}
                  </p>
                </div>
              </div>

              {d.status !== "resolved" && (
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => resolveDispute(d.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Resolved
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
