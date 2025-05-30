// === STEP 1: FEATURES SECTION AS COMPONENT ===

// File: src/components/pages/FeaturesSection.jsx
import React from "react";

export default function FeaturesSection() {
  return (
    <section className="bg-white py-16 px-6 md:px-12 lg:px-24">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">
        Key Features
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {[
          {
            title: "Multi-Agent Orchestration",
            desc: "Coordinate multiple LLMs with intelligent routing for fast, reliable responses tailored to task complexity."
          },
          {
            title: "Customizable Agents",
            desc: "Spin up custom agents using different LLMs, priming methods, and runtime behaviors—no hard coding required."
          },
          {
            title: "Unified API & Frontend",
            desc: "Use AetherPro’s React-Vite interface or connect your own systems via a structured FastAPI backend."
          },
          {
            title: "Real-Time Logging",
            desc: "Capture per-agent responses, token usage, and merge logic in structured JSON logs for debugging and training."
          },
          {
            title: "Memory & Context Management",
            desc: "Store, query, and visualize conversations and agent memory with integrated Redis and ChromaDB support."
          },
          {
            title: "Containerized Agents",
            desc: "Deploy agents in Docker/K8s environments or run them locally with systemd/asyncio for advanced orchestration."
          },
        ].map((feature, i) => (
          <div
            key={i}
            className="p-6 rounded-lg shadow-md bg-gray-50 hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-indigo-600 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-700">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
