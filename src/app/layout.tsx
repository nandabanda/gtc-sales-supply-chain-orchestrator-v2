import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { AgentPanel } from "@/components/AgentPanel";
import { MobileNavStrip } from "@/components/MobileNavStrip";

export const metadata: Metadata = {
  title: "GTC Sales & Supply Chain Orchestrator | Olayan Group",
  description:
    "AI decision cockpit for demand, replenishment, route and execution intelligence — premium enterprise demo for Olayan Group / GTC.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen grid-bg">
          <Sidebar />
          <div className="flex min-h-screen flex-col lg:pl-72">
            <MobileNavStrip />
            <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
              <div className="flex min-w-0 min-h-0 flex-1 flex-col xl:min-w-0">
                <Header />
                <div className="flex-1 px-5 pb-12 pt-2 lg:px-8">{children}</div>
              </div>
              <AgentPanel />
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
