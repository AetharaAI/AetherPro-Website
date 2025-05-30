import React from "react";

const useCases = [
  {
    title: "Enterprise Automation",
    description:
      "Use AetherPro to coordinate multiple AI agents to handle customer service, internal documentation, and data processing simultaneously.",
  },
  {
    title: "Research Assistant",
    description:
      "Generate, summarize, and organize academic or technical content across multiple sources with agent specialization.",
  },
  {
    title: "Multi-LLM Experimentation",
    description:
      "Compare LLM outputs side-by-side, test different prompt strategies, and benchmark performance in real-time.",
  },
];

export default function UseCasesSection() {
  return (
    <section className="py-20 px-4 md:px-12 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Use Cases</h2>
        <p className="text-lg text-gray-600 mb-10">
          See how users are already applying AetherPro across industries
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <div key={index} className="bg-white shadow p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
              <p className="text-gray-700">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
