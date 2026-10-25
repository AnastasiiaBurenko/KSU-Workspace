import React from 'react';
import { Link } from 'react-router-dom';
import { RecordItem } from '../types';

interface RecordCardProps {
  record: RecordItem;
}

export const RecordCard: React.FC<RecordCardProps> = ({ record }) => {
  return (
    <article className="card compact-card">
      <div className="card-content">
        <h3>{record.title}</h3>
        <p>{record.description}</p>
        <span className="badge">{record.category}</span>
        <div style={{ marginTop: '12px' }}>
          <Link to={`/record/${record.id}`} className="btn btn-primary">
            Детальніше →
          </Link>
        </div>
      </div>
    </article>
  );
};