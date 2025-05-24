export default function Sidebar() {
  return (
    <div className="w-64 bg-slate-800 text-white h-screen p-4 fixed">
      <h2 className="text-xl font-bold mb-6">AetherPro</h2>
      <ul className="space-y-4">
        <li><a href="/" className="hover:text-blue-400">Home</a></li>
        <li><a href="/chat" className="hover:text-blue-400">Chat</a></li>
        <li><a href="/admin" className="hover:text-blue-400">Admin</a></li>
        <li><a href="/memory" className="hover:text-blue-400">Memory</a></li>
        <li><a href="/settings" className="hover:text-blue-400">Settings</a></li>
      </ul>
    </div>
  );
}