import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { farmerSidebar, farmerBottomNav } from "@/components/layout/nav-config";

export const Route = createFileRoute("/farmer/shipment/$id")({
  head: () => ({
    meta: [{ title: "Shipment Details — AgroVoice" }],
  }),
  component: ShipmentDetailPage,
});

function ShipmentDetailPage() {
  const { id } = Route.useParams();
  return (
    <AppShell
      role="farmer"
      userName="Farmer"
      sidebarItems={farmerSidebar}
      bottomNavItems={farmerBottomNav}
    >
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Shipment
          </p>
          <h1 className="text-2xl font-bold text-foreground">#{id}</h1>
        </div>
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Detail view coming in Phase 2 (info, driver, cost breakdown, status
            timeline).
          </p>
        </div>
      </div>
    </AppShell>
  );
}
