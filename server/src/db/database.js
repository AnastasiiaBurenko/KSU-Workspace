import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../database.sqlite');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Помилка підключення до SQLite:', err.message);
  } else {
    console.log('Успішно підключено до бази даних SQLite.');
    initDatabase();
  }
});

// Додано export, щоб index.js міг його без проблем імпортувати
export function initDatabase() {
  const query = `
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL CHECK(length(title) > 0),
      description TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('Курси', 'Матеріали', 'Проєкти', 'schedule', 'tasks', 'courses')),
      date TEXT NOT NULL
    )
  `;

  db.run(query, (err) => {
    if (err) {
      console.error('Помилка створення таблиці:', err.message);
    } else {
      console.log('Таблицю "records" успішно створено.');
    }
  });
}