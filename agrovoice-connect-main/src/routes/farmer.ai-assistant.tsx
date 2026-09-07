import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { farmerSidebar, farmerBottomNav } from "@/components/layout/nav-config";
import { KisanAIHelper } from "@/components/farmer/KisanAIHelper";

export const Route = createFileRoute("/farmer/ai-assistant")({
  head: () => ({
    meta: [{ title: "AgroVoice AI Assistant — Multi-Language Agricultural Intelligence" }],
  }),
  component: FarmerAIAssistantPage,
});

function FarmerAIAssistantPage() {
  return (
    <AppShell
      role="farmer"
      userName="Farmer"
      sidebarItems={farmerSidebar}
      bottomNavItems={farmerBottomNav}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-foreground md:text-4xl">
            AgroVoice AI Assistant 🤖🌾
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Multi-lingual voice intelligence, Mandi price predictions, crop disease scanner, and freight savings calculator.
          </p>
        </div>

        <KisanAIHelper />
      </div>
    </AppShell>
  );
}
