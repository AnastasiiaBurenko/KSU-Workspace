import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export const Layout: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`app-wrapper ${isDarkMode ? 'dark-theme' : ''}`}>
      <Header isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
      <main className="container main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <p>© © 2026 KSU Workspace Hub. Всі права захищено.</p>
        </div>
      </footer>
    </div>
  );
};