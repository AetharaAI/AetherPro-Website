// This is the starting point for the new AetherPro website layout.
// We'll scaffold in place using the existing file structure.

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import FeaturesSection from "./FeaturesSection";
import UseCasesSection from "./UseCasesSection";
import DashboardPreviewSection from "./CashboardPreviewSection";
import AboutSection from "./AboutSection";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <nav className="w-full flex justify-between items-center p-4 border-b border-slate-800">
        <div className="text-xl font-bold tracking-wide">AetherPro</div>
        <div className="space-x-4">
          <Link to="#features" className="hover:underline">Features</Link>
          <Link to="#usecases" className="hover:underline">Use Cases</Link>
          <Link to="#pricing" className="hover:underline">Pricing</Link>
          <a href="#docs" className="hover:underline">Docs</a>
        </div>
      </nav>

      <section className="text-center mt-24 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Multi-Agent AI Systems Built for Real-World Orchestration
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-6">
          AetherPro helps you coordinate intelligent agents, models, and services to achieve powerful outcomes.
        </p>
        <Link to="/signup"><Button className="text-lg px-6 py-3">Get Started →</Button></Link>
        <FeaturesSection />
        <UseCasesSection />
        <DashboardPreviewSection />
        <AboutSection />
      </section>
    </main>
  );
}
