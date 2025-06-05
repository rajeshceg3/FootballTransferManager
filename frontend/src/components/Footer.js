import React from 'react';

// Inline styles are removed, using .app-footer class from index.css

function Footer() {
  return (
    <footer className="app-footer"> {/* Applied .app-footer class */}
      <div className="container">
        {/* The <p> tag will be styled by .app-footer .container p from index.css */}
        <p>© {new Date().getFullYear()} Football Transfer System. All rights reserved.</p>
        {/* You can add more links or information here if needed */}
      </div>
    </footer>
  );
}

export default Footer;
