import React from "react";

export default function AboutSection() {
  return (
    <section className="py-20 px-4 md:px-12 bg-gray-100">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
        <p className="text-lg text-gray-700 mb-8">
          AetherPro Technologies is building the future of intelligent autonomy — 
          an operating system for AI agents that think, collaborate, and execute with precision.
        </p>

        <div className="grid md:grid-cols-2 gap-8 text-left">
          <div>
            <h3 className="text-xl font-semibold mb-2">Why We Exist</h3>
            <p className="text-gray-600">
              We believe that AI should be modular, explainable, and distributed. 
              That’s why AetherPro runs multiple LLMs and tools in harmony — enabling next-gen workflows that traditional AI can’t touch.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Where We're Headed</h3>
            <p className="text-gray-600">
              From on-device orchestration to biometric-triggered agents, our roadmap spans mobile, desktop, cloud, and edge AI. 
              The goal: an AI-powered OS that works for you, not the other way around.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
