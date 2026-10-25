import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { RecordItem } from '../types';

interface RecordDetailsProps {
  records: RecordItem[];
}

export const RecordDetails: React.FC<RecordDetailsProps> = ({ records }) => {
  const { id } = useParams<{ id: string }>();
  const record = records.find((r) => r.id === Number(id));

  if (!record) {
    return (
      <div className="error-container">
        <h2>Запис не знайдено</h2>
        <p>Запитуваний матеріал не існує або був видалений.</p>
        <Link to="/" className="btn btn-primary">← Повернутися до переліку</Link>
      </div>
    );
  }

  return (
    <div className="details-container">
      <Link to="/" className="back-link">← Назад до переліку</Link>
      <article className="details-card">
        <span className="badge">{record.category}</span>
        <h1>{record.title}</h1>
        <p className="details-desc">{record.description}</p>
        <div className="details-meta">
          <small>ID запису: #{record.id}</small>
        </div>
      </article>
    </div>
  );
};
