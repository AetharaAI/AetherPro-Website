// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui button

const LandingPage = () => {
  return (
    <div className="text-center">
      <header className="py-12 md:py-20">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          AetherProTech
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground">
          Intelligent Parallel AI Architecture for Complex Problem Solving
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link to="/chat">Start Chatting</Link>
          </Button>
        </div>
      </header>

      <section id="overview" className="py-12 md:py-16">
        <h2 className="text-3xl font-semibold">Overview</h2>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          AetherPro is an advanced asynchronous, event-driven AI kernel orchestrating multiple specialized LLM agents. 
          It leverages persistent memory and AI-powered synthesis to deliver comprehensive and nuanced responses.
        </p>
        {/* Add more content */}
      </section>

      <section id="features" className="py-12 md:py-16 bg-secondary/30"> {/* Example subtle background */}
        <h2 className="text-3xl font-semibold">Features</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Feature Cards - Example */}
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-medium">Multi-Agent Orchestration</h3>
            <p className="mt-2 text-sm text-muted-foreground">Coordinates 7+ LLMs for parallel processing.</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-medium">Persistent Contextual Memory</h3>
            <p className="mt-2 text-sm text-muted-foreground">Utilizes ChromaDB for long and short-term memory.</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-medium">AI-Powered Synthesis</h3>
            <p className="mt-2 text-sm text-muted-foreground">Merges individual agent responses into a cohesive output.</p>
          </div>
        </div>
      </section>

      <section id="cli-screenshots" className="py-12 md:py-16">
        <h2 className="text-3xl font-semibold">See it in Action (CLI)</h2>
        <p className="mt-4 text-muted-foreground">Powerful backend, now with an intuitive web interface.</p>
        {/* Add screenshots of your CLI if you have them */}
        <div className="mt-6 p-4 bg-slate-800 text-slate-200 rounded-md max-w-2xl mx-auto text-left text-sm font-mono">
          <pre><code>
            PresenceOS&gt; ask "Tell me about AetherPro..."
            <br />
            🤖 PresenceOS: Request sent... Waiting for merged response...
            <br />
            ✅ Merged Response: ...
          </code></pre>
        </div>
      </section>
      
      {/* Add API Info and Contact sections later */}
    </div>
  );
};

export default LandingPage;