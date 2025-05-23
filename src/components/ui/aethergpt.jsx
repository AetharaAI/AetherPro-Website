// AetherGPT UI Starter Template (React + Tailwind) // Console-style interface inspired by OpenAI & Google AI Studio

import { useState } from 'react';

export default function AetherConsole() { const [messages, setMessages] = useState([]); const [input, setInput] = useState(''); const [loading, setLoading] = useState(false);

async function handleSubmit(e) { e.preventDefault(); const userMessage = { role: 'user', content: input }; setMessages((prev) => [...prev, userMessage]); setLoading(true);

const res = await fetch('http://localhost:8000/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: input }),
});
const data = await res.json();
const aiMessage = { role: 'assistant', content: data.response };
setMessages((prev) => [...prev, aiMessage]);
setInput('');
setLoading(false);

}

return ( <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 font-mono"> <div className="max-w-4xl mx-auto space-y-4"> <h1 className="text-xl font-bold text-blue-400">AetherGPT Console</h1> <div className="bg-zinc-900 p-4 rounded-lg h-[60vh] overflow-y-auto space-y-2 border border-zinc-700"> {messages.map((msg, i) => ( <div key={i} className={msg.role === 'user' ? 'text-green-400' : 'text-cyan-300'}> <strong>{msg.role === 'user' ? 'You' : 'AetherGPT'}:</strong> {msg.content} </div> ))} {loading && <div className="text-yellow-400">Thinking...</div>} </div> <form onSubmit={handleSubmit} className="flex gap-2"> <input className="flex-1 p-2 rounded bg-zinc-800 border border-zinc-600 text-white" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a command or question..." /> <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white">Send</button> </form> </div> </div> ); }