import React from "react";

export default function DashboardPreviewSection() {
  return (
    <section className="py-20 px-4 md:px-12 bg-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">A Glimpse at AetherPro HQ</h2>
        <p className="text-lg text-gray-600 mb-12">
          Unified multi-agent intelligence in action — see how it works before you sign in.
        </p>

        <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
          <img
            src="/landingpage-preview.png"
            alt="AetherPro Dashboard Preview"
            className="w-full object-cover"
          />
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Actual dashboard powered by live agents — configurable, explainable, and reactive.
        </p>
      </div>
    </section>
  );
}
