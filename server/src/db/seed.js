import { db } from './database.js';

const initialRecords = [
  {
    title: 'Веб-програмування',
    description: 'Лабораторна робота онлайн. Викладач: Лемещук О.І.',
    category: 'Курси',
    date: '2026-10-28'
  },
  {
    title: 'Кар’єрні навички',
    description: 'Проходження модулів та тестування на платформі Strum. Викладач: Кобець В.М.',
    category: 'Матеріали',
    date: '2026-10-25'
  },
  {
    title: 'Алгоритми і структури даних',
    description: 'Виконання практичної роботи. Викладач: Львов М.С.',
    category: 'Проєкти',
    date: '2026-10-22'
  }
];

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

export async function runSeed() {
  const row = await getAsync(
    'SELECT COUNT(*) AS count FROM records'
  );

  if (row.count > 0) {
    console.log('База вже містить записи. Seed пропущено.');
    return;
  }

  await runAsync('BEGIN TRANSACTION');

  try {
    for (const item of initialRecords) {
      await runAsync(
        `INSERT INTO records
        (title, description, category, date)
        VALUES (?, ?, ?, ?)`,
        [
          item.title,
          item.description,
          item.category,
          item.date
        ]
      );
    }

    await runAsync('COMMIT');

    console.log('Початкові дані успішно додано.');
  } catch (err) {
    await runAsync('ROLLBACK');
    throw err;
  }
}