KSU Workspace

Персональний цифровий простір студента ХДУ: розклад, дисципліни, нотатки та завдання в одному місці.

Розгорнуті версії

| Частина | Адреса |
| --- | --- |
| Клієнт (GitHub Pages) | https://anastasiiaburenko.github.io/KSU-Workspace/ |
| Сервер (Render) | https://ksu-workspace-1.onrender.com/api/records |
| База даних | Neon (PostgreSQL) |

Сервер працює на безкоштовному тарифі Render: після 15 хвилин без запитів він «засинає», тому перший запит може тривати до хвилини.

Структура репозиторію

- `index.html`, `courses.html`, `workspace.html`, `style.css`, `script.js`, `workspace.js` — клієнт (статичні сторінки);
- `server/` — REST API на Express: `src/config`, `src/db`, `src/services`, `src/controllers`, `src/routes`, `src/middleware`;
- `docs/` — звіти до лабораторних робіт.

Запуск сервера локально

1. `cd server`
2. `npm install`
3. Створіть файл `.env` за зразком `.env.example` (`Copy-Item .env.example .env`) і заповніть змінні з таблиці нижче.
4. `npm start` — сервер запуститься на http://localhost:5000

Клієнт локально: у корені проєкту `python app.py`, сторінки будуть на http://localhost:8000. Щоб клієнт працював із локальним сервером, змініть початок адреси API у `script.js` і `workspace.js` на `http://localhost:5000/api`, а в `.env` встановіть `CORS_ORIGIN=http://localhost:8000`.

Змінні середовища

Значення не зберігаються в репозиторії. На Render вони задаються в розділі Environment, локально в `server/.env`.

| Змінна | Призначення |
| --- | --- |
| `PORT` | Порт сервера (на Render встановлюється автоматично, локально за замовчуванням 5000) |
| `CORS_ORIGIN` | Адреса клієнта, якій дозволено звертатися до API, наприклад `https://anastasiiaburenko.github.io` (без `/` в кінці) |
| `JWT_SECRET` | Секрет для підпису токенів, довгий випадковий рядок |
| `DATABASE_URL` | Рядок підключення до PostgreSQL (Neon) |

Згенерувати секрет: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

API

| Метод | Адреса | Доступ | Опис |
| --- | --- | --- | --- |
| GET | `/api/records` | усі | Список записів (параметри `page`, `limit` до 100, `category`, `search`) |
| GET | `/api/records/:id` | усі | Один запис |
| POST | `/api/records` | потрібен токен | Створити запис |
| PUT | `/api/records/:id` | потрібен токен | Оновити запис |
| DELETE | `/api/records/:id` | потрібен токен | Видалити запис |
| POST | `/api/auth/register` | усі | Реєстрація |
| POST | `/api/auth/login` | усі | Вхід, повертає токен |

Токен передається в заголовку `Authorization: Bearer <токен>`. Без токена змінювальні запити повертають 401.

Безпека

- Паролі зберігаються як хеші `bcrypt`, відкриті паролі ніде не записуються.
- Токен JWT діє 1 годину; клієнт тримає його лише в пам'яті сторінки, а не в `localStorage`.
- CORS обмежений однією адресою клієнта (`CORS_ORIGIN`).
- Усі SQL-запити параметризовані, параметр `limit` обмежено значенням 100.
- Відповіді з помилками 500 не містять внутрішніх подробиць, вони пишуться лише в лог сервера.
- Файли `.env` та `*.sqlite` додано до `.gitignore`.

Розгортання

Клієнт: GitHub Pages, гілка `main`, корінь репозиторію.
Сервер: Render (Web Service), Root Directory `server`, Build Command `npm install`, Start Command `npm start`.
База даних: Neon (PostgreSQL), рядок підключення в змінній `DATABASE_URL`.