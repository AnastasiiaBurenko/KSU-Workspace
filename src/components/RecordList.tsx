import React from 'react';
import { RecordItem } from '../types';
import { RecordCard } from './RecordCard';

interface RecordListProps {
  records: RecordItem[];
}

export const RecordList: React.FC<RecordListProps> = ({ records }) => {
  if (records.length === 0) {
    return <p className="status-msg">Записів за вашим запитом не знайдено.</p>;
  }

  return (
    <div className="records-grid">
      {records.map((record) => (
        <RecordCard key={record.id} record={record} />
      ))}
    </div>
  );
};