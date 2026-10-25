import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { RecordItem, LoadingState } from './types';
import { Layout } from './components/Layout';
import { RecordList } from './components/RecordList';
import { Modal } from './components/Modal';
import { RecordForm } from './components/RecordForm';
import { RecordDetails } from './pages/RecordDetails';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingState('loading');

    fetch('/KSU-Workspace/data.json', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Помилка сервера: ${res.status}`);
        return res.json();
      })
      .then((data: RecordItem[]) => {
        setRecords(data);
        setLoadingState('success');
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setErrorMsg(err.message || 'Не вдалося завантажити дані');
          setLoadingState('error');
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || rec.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddRecord = (newRec: Omit<RecordItem, 'id'>) => {
    const created: RecordItem = {
      ...newRec,
      id: Date.now(),
    };
    setRecords((prev) => [created, ...prev]);
  };

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <div>
              <div className="toolbar">
                <input
                  type="text"
                  placeholder="Пошук матеріалу..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-select"
                >
                  <option value="all">Усі категорії</option>
                  <option value="Курси">Курси</option>
                  <option value="Матеріали">Матеріали</option>
                  <option value="Проєкти">Проєкти</option>
                </select>
                <button onClick={() => setIsModalOpen(true)} className="btn btn-success">
                  + Додати запис
                </button>
              </div>

              {loadingState === 'loading' && <p className="status-msg">⏳ Завантаження даних...</p>}
              {loadingState === 'error' && <p className="status-msg error-msg">❌ {errorMsg}</p>}
              {loadingState === 'success' && <RecordList records={filteredRecords} />}

              <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Додати новий матеріал"
              >
                <RecordForm onSubmit={handleAddRecord} onClose={() => setIsModalOpen(false)} />
              </Modal>
            </div>
          }
        />
        <Route path="/record/:id" element={<RecordDetails records={records} />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};