import db from './database.js';

const initialRecords = [
  {
    title: 'Веб-програмування',
    description: 'Лабораторна робота онлайн. Викладач: Лемещук О.І.',
    category: 'Курси',
    date: '2026-10-28',
  },
  {
    title: 'Кар’єрні навички',
    description: 'Проходження модулів та тестування на платформі Strum. Викладач: Кобець В.М.',
    category: 'Матеріали',
    date: '2026-10-25',
  },
  {
    title: 'Алгоритми і структури даних',
    description: 'Виконання практичної роботи. Викладач: Львов М.С.',
    category: 'Проєкти',
    date: '2026-10-22',
  },
];

export const runSeed = () => {
  db.get(`SELECT COUNT(*) as count FROM records`, (err, row) => {
    if (err) {
      console.error('Помилка перевірки таблиці:', err.message);
      return;
    }

    if (row.count === 0) {
      const stmt = db.prepare(`INSERT INTO records (title, description, category, date) VALUES (?, ?, ?, ?)`);
      initialRecords.forEach((item) => {
        stmt.run(item.title, item.description, item.category, item.date);
      });
      stmt.finalize();
      console.log('🌱 Початкові дані успішно додано до бази даних.');
    }
  });
};