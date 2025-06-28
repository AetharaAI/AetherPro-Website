
// pages/HomePage.tsx - Landing Page
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Globe, Code, Users, BarChart } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              The Future of AI Orchestration
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Harness multiple AI models simultaneously. Get unified, intelligent responses 
              that combine the best of OpenAI, Anthropic, Google, and more with the worlds first AI Operating System.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/docs"
                className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose AetherPro?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Stop choosing between AI providers. Get the best of all worlds with our intelligent orchestration platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <Zap className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Multi-Model Intelligence
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Automatically route queries to the best AI model for each task. Get superior results by leveraging multiple providers.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <Shield className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Enterprise Security
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                SOC 2 compliant infrastructure with end-to-end encryption. Your data never leaves our secure environment.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <Code className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Developer-First API
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                RESTful APIs, WebSocket support, and comprehensive SDKs. Integrate in minutes, not weeks.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <Globe className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Global Infrastructure
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Low-latency responses worldwide with our distributed edge network. 99.9% uptime SLA.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <Users className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Team Collaboration
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Share workspaces, manage team access, and collaborate on AI projects seamlessly.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <BarChart className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Advanced Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track usage, monitor performance, and optimize costs with detailed insights and reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your AI Workflow?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of developers and companies already using AetherPro to build better AI applications.
          </p>
          <Link
            to="/signup"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center text-lg"
          >
            Start Building Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
