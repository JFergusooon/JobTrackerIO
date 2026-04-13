import React from 'react';
import '../css/ModernFooterCSS.css'

export default function ModernFooter() {

  return (
    <footer className="bg-gray-700 border-t-8 border-gray-900">
      {/* Bottom Footer Bar */}
      <div style={{background: '#3b007e', height: '28px'}}>
          {/* Copyright */}
          <div style={{color: 'white'}}>
            © {new Date().getFullYear()} Ferguson Software Solutions LLC - <a href="/terms" className="nav-link">Terms of Service</a>
          </div>
      </div>
    </footer>
  );
}