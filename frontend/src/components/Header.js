import React from 'react';
import { Link } from 'react-router-dom';

// Inline styles for the Header
const headerStyle = {
  backgroundColor: '#1a253c',
  color: '#ffffff',
  padding: '1rem 0',
  textAlign: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const logoStyle = {
  margin: 0,
  fontSize: '1.75rem',
  fontWeight: 'bold',
  color: '#ffffff', // Ensure logo link is white
  textDecoration: 'none',
};

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap', // Allow nav items to wrap on smaller screens
  justifyContent: 'center', // Center nav items if they wrap
};

const navLinkStyle = {
  color: '#ffffff',
  margin: '0 10px', // Adjusted margin for potentially more items
  textDecoration: 'none',
  fontSize: '1rem',
  padding: '0.5rem 0.25rem', // Adjusted padding
  borderBottom: '2px solid transparent',
  transition: 'border-bottom 0.2s ease-in-out',
};

function Header() {
  // Helper for hover effect to avoid repetition
  const applyHover = (e) => e.currentTarget.style.borderBottom = '2px solid #007bff';
  const removeHover = (e) => e.currentTarget.style.borderBottom = '2px solid transparent';

  return (
    <header style={headerStyle}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Link to="/" style={logoStyle}>Football Transfer System</Link>
        <nav style={navStyle}>
          <Link
            to="/"
            style={navLinkStyle}
            onMouseEnter={applyHover}
            onMouseLeave={removeHover}
          >
            Transfers
          </Link>
          <Link
            to="/players"
            style={navLinkStyle}
            onMouseEnter={applyHover}
            onMouseLeave={removeHover}
          >
            Players
          </Link>
          <Link
            to="/clubs"
            style={navLinkStyle}
            onMouseEnter={applyHover}
            onMouseLeave={removeHover}
          >
            Clubs
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
