import React from 'react';
import { Link, NavLink } from 'react-router-dom';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDarkMode, onToggleTheme }) => {
  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          🎓 KSU Workspace
        </Link>
        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active-link' : '')}>
            Головна
          </NavLink>
        </nav>
        <button onClick={onToggleTheme} className="btn btn-secondary">
          {isDarkMode ? '☀️ Світла' : '🌙 Темна'}
        </button>
      </div>
    </header>
  );
};