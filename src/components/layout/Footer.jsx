// src/components/layout/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border text-muted-foreground py-4 text-center text-sm">
      <div className="container mx-auto px-4">
        © {new Date().getFullYear()} AetherProTech. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;