import React, { useState } from 'react';

interface RecordFormProps {
  onSuccess: () => void; 
  onClose: () => void;
}

export const RecordForm: React.FC<RecordFormProps> = ({ onSuccess, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Курси');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError("Заповніть всі обов'язкові поля");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category: category.trim(),
          date: new Date().toISOString().split('T')[0]
        }),
      });

      if (!response.ok) {
        throw new Error(`Помилка сервера: ${response.status}`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Помилка збереження:", err);
      setError("Не вдалося зберегти запис на сервері.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {error && <div className="error-banner" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
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

      <div className="form-actions" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <button type="button" onClick={onClose} className="btn btn-secondary">
          Скасувати
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Збереження...' : 'Додати'}
        </button>
      </div>
    </form>
  );
};