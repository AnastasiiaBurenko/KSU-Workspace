import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

interface LayoutProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ isDarkMode, onToggleTheme }) => {
  return (
    <div className="app-layout">
      <Header isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
      <main className="main-content container">
        <Outlet />
      </main>
      <footer className="footer container">
        <p>© 2026 KSU Workspace. Факультет комп’ютерних наук.</p>
      </footer>
    </div>
  );
};