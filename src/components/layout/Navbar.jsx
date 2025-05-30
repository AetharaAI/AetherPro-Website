// Just keep the logo/title maybe, and nothing else:
const Navbar = () => {
return (
  <>
    <a href="/" className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition">
    </a>
    <nav className="flex gap-6 text-sm">
      <a href="/features" className="hover:underline">Features</a>
      <a href="/usecases" className="hover:underline">Use Cases</a>
      <a href="/pricing" className="hover:underline">Pricing</a>
      <a href="/docs" className="hover:underline">Docs</a>
      <a href="/chat" className="hover:underline">Chat</a>
      <a href="/dashboard" className="hover:underline">Dashboard</a>
      <a href="/login" className="hover:underline text-blue-400">Login</a>
    </nav>
  </>
);
};

export default Navbar;