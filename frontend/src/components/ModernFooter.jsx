import React from 'react';
import '../css/ModernFooterCSS.css'

export default function ModernFooter() {

  return (
    <footer style={{
  position: "fixed",
  bottom: 0,
  left: 0,
  width: "100%",
  zIndex: 1000
}}>
      {/* Bottom Footer Bar */}
      <div style={{background: '#3b007e', height: '28px', marginBottom: '0px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'}}>
          {/* Copyright */}
          <div style={{color: 'white'}}>
            © {new Date().getFullYear()} <a href="https://fergusonsoftwaresolutions.pages.dev/" className="nav-link" target="_blank" rel="noreferrer">Ferguson Software Solutions LLC</a> - <a href="/terms" className="nav-link">Terms of Service</a>
          </div>
      </div>
    </footer>
  );
}