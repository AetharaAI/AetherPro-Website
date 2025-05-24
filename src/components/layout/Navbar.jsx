// Just keep the logo/title maybe, and nothing else:
const Navbar = () => {
  return (
    <nav className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <span className="text-xl font-bold text-primary">AetherProTech</span>
      </div>
    </nav>
  );
};

export default Navbar;