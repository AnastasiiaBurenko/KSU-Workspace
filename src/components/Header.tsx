import React from 'react';
import { Link, NavLink } from 'react-router-dom';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDarkMode, onToggleTheme }) => {
  return (
    <header className="site-header">
      <Link to="/" className="logo">
        <div className="logo-mark">KS</div>
        KSU Workspace
      </Link>
      
      <nav>
        <ul className="nav-list">
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
              Головна
            </NavLink>
          </li>
          <li>
            <NavLink to="/courses" className={({ isActive }) => (isActive ? 'active' : '')}>
              Дисципліни
            </NavLink>
          </li>
          <li>
            <NavLink to="/" className="nav-book">
              Мій Workspace
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Кнопка-стикер перемикання теми */}
      <button 
        onClick={onToggleTheme} 
        className="theme-toggle-btn" 
        title="Змінити тему"
        aria-label="Змінити тему"
      >
        <span className="theme-icon">
          {isDarkMode ? '☀️' : '🌙'}
        </span>
      </button>
    </header>
  );
};