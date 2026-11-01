import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>Сторінку не знайдено</h2>
      <p>На жаль, такої сторінки в KSU Workspace не існує.</p>
      <Link to="/" className="btn btn-primary">Повернутися на головну</Link>
    </div>
  );
};