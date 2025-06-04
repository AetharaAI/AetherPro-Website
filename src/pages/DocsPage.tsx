
// pages/DocsPage.tsx - Documentation Page
import React, { useState } from 'react';
import { Search, Book, Code, Terminal, Key, Zap } from 'lucide-react';

const DocsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    {
      id: 'guides',
      title: 'Guides & Examples',
      icon: Terminal,
      items: [
        { title: 'Building Chatbots', href: '#chatbots' },
        { title: 'Document Analysis', href: '#document-analysis' },
        { title: 'Code Generation', href: '#code-generation' },
        { title: 'Multi-Agent Workflows', href: '#multi-agent' },
      ]
    },
    {
      id: 'sdks',
      title: 'SDKs & Libraries',
      icon: Zap,
      items: [
        { title: 'Python SDK', href: '#python-sdk' },
        { title: 'JavaScript SDK', href: '#javascript-sdk' },
        { title: 'REST API', href: '#rest-api' },
        { title: 'CLI Tool', href: '#cli' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl">
            Everything you need to integrate AetherPro into your applications and workflows.
          </p>
          
          {/* Search */}
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
              placeholder="Search documentation..."
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="lg:w-1/4">
            <nav className="space-y-8">
              {sections.map((section) => (
                <div key={section.id}>
                  <div className="flex items-center space-x-2 mb-4">
                    <section.icon className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {section.title}
                    </h3>
                  </div>
                  <ul className="space-y-2 pl-7">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm"
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            <div className="prose dark:prose-invert max-w-none">
              {/* Quick Start Section */}
              <section id="quick-start" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Quick Start</h2>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold mb-4">1. Get your API key</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Sign up for an account and generate your API key from the dashboard.
                  </p>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <code className="text-green-400 text-sm">
                      curl -H "Authorization: Bearer YOUR_API_KEY" \<br/>
                      &nbsp;&nbsp;https://api.aetherpro.com/v1/chat/completions
                    </code>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold mb-4">2. Make your first request</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Send a simple chat completion request to get started.
                  </p>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <pre className="text-green-400 text-sm overflow-x-auto">
{`{
  "messages": [
    {
      "role": "user",
      "content": "Explain quantum computing in simple terms"
    }
  ],
  "agents": ["gpt-4", "claude-3", "gemini-pro"],
  "merge_strategy": "best_response"
}`}
                    </pre>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 text-blue-800 dark:text-blue-300">
                    💡 Pro Tip
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300">
                    Use the "merged" agent to automatically orchestrate responses from multiple models 
                    and get the best possible answer for your query.
                  </p>
                </div>
              </section>

              {/* Authentication Section */}
              <section id="authentication" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Authentication</h2>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  AetherPro uses API keys for authentication. Include your API key in the Authorization header:
                </p>

                <div className="bg-gray-900 rounded-lg p-4 mb-6">
                  <code className="text-green-400 text-sm">
                    Authorization: Bearer aetherpro_sk_...
                  </code>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Security Best Practices</h4>
                  <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
                    <li>• Never expose API keys in client-side code</li>
                    <li>• Rotate keys regularly</li>
                    <li>• Use environment variables for key storage</li>
                    <li>• Monitor API key usage in your dashboard</li>
                  </ul>
                </div>
              </section>

              {/* API Reference */}
              <section id="chat-completions" className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Chat Completions API</h2>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
                  <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">POST /v1/chat/completions</h3>
                  </div>
                  <div className="p-6">
                    <h4 className="font-medium mb-4">Request Body</h4>
                    <div className="bg-gray-900 rounded-lg p-4 mb-4">
                      <pre className="text-green-400 text-sm overflow-x-auto">
{`{
  "messages": [
    {
      "role": "user",
      "content": "Your message here"
    }
  ],
  "agents": ["gpt-4", "claude-3"],
  "merge_strategy": "consensus",
  "temperature": 0.7,
  "max_tokens": 2048
}`}
                      </pre>
                    </div>
                    
                    <h4 className="font-medium mb-4">Parameters</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Parameter</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          <tr>
                            <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">messages</td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">array</td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Array of message objects</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">agents</td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">array</td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">List of AI models to use</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">merge_strategy</td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">string</td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">How to combine responses</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;