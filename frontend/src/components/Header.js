import React from 'react';
import { Link, NavLink } from 'react-router-dom';

function Header() {
  return (
    <header className="app-header">
      <div className="container">
        <Link to="/" className="app-header-logo">Football Transfer System</Link>
        <nav className="app-header-nav">
          {/* Using NavLink for automatic active class styling */}
          <NavLink
            to="/"
            className={({ isActive }) => isActive ? "app-header-nav-link active" : "app-header-nav-link"}
            end // Use 'end' for the home/transfers link to prevent it from being active for child routes
          >
            Transfers
          </NavLink>
          <NavLink
            to="/players"
            className={({ isActive }) => isActive ? "app-header-nav-link active" : "app-header-nav-link"}
          >
            Players
          </NavLink>
          <NavLink
            to="/clubs"
            className={({ isActive }) => isActive ? "app-header-nav-link active" : "app-header-nav-link"}
          >
            Clubs
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;
