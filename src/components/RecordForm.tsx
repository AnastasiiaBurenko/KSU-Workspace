import React, { useState } from 'react';
import { RecordItem } from '../types';

interface RecordFormProps {
  onSubmit: (newRecord: Omit<RecordItem, 'id'>) => void;
  onClose: () => void;
}

export const RecordForm: React.FC<RecordFormProps> = ({ onSubmit, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Курси');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Заповніть всі обов\'язкові поля!');
      return;
    }
    setError(null);
    onSubmit({ title, description, category });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {error && <div className="error-banner">{error}</div>}
      <div className="form-group">
        <label>Назва курсу / матеріалу:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Введіть назву..."
          className="form-input"
        />
      </div>
      <div className="form-group">
        <label>Опис:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Введіть короткий опис..."
          className="form-textarea"
        />
      </div>
      <div className="form-group">
        <label>Категорія:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="form-select"
        >
          <option value="Курси">Курси</option>
          <option value="Матеріали">Матеріали</option>
          <option value="Проєкти">Проєкти</option>
        </select>
      </div>
      <div className="form-actions">
        <button type="button" onClick={onClose} className="btn btn-secondary">Скасувати</button>
        <button type="submit" className="btn btn-primary">Додати</button>
      </div>
    </form>
  );
};