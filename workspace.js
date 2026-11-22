document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://ksu-workspace-1.onrender.com/api';

    const authForm = document.getElementById('auth-form');
    const recordForm = document.getElementById('record-form');
    if (!authForm || !recordForm) return;

    const authSession = document.getElementById('auth-session');
    const authSessionText = document.getElementById('auth-session-text');
    const authAvatar = document.getElementById('auth-avatar');
    const authStatus = document.getElementById('auth-status');
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const recordSubmitBtn = recordForm.querySelector('button[type="submit"]');
    const formMessage = document.getElementById('form-message');
    const recordsList = document.getElementById('records-list');
    const recordsHint = document.getElementById('records-hint');

    const ICON_DOC = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>';
    const ICON_TRASH = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/><path d="M9 7V4h6v3"/></svg>';

    // Токен живе лише в пам'яті сторінки: не в localStorage і не в cookie.
    let token = null;
    let currentUser = null;
    let records = [];
    let recordsLoaded = false;
    let recordsMessage = '';

    function setStatus(text, state = '') {
        authStatus.textContent = text;
        authStatus.dataset.state = state;
    }

    function errorText(error) {
        return error.status
            ? error.message
            : "Не вдалося зв'язатися із сервером. Спробуйте ще раз.";
    }

    function setAuthBusy(busy) {
        loginBtn.disabled = busy;
        registerBtn.disabled = busy;
    }

    async function request(path, options = {}) {
        const headers = {};
        if (options.body) headers['Content-Type'] = 'application/json';
        if (token) headers.Authorization = `Bearer ${token}`;

        const response = await fetch(`${API_URL}${path}`, { ...options, headers });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const details = data.errors ? Object.values(data.errors).join('; ') : '';
            const error = new Error(details || data.message || `Помилка ${response.status}`);
            error.status = response.status;
            throw error;
        }
        return data;
    }

    function renderRecords() {
        recordsList.textContent = '';
        recordsList.hidden = !recordsLoaded && !recordsMessage;
        if (recordsList.hidden) return;

        if (recordsMessage || records.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'records-empty';
            empty.textContent = recordsMessage || 'Записів поки немає.';
            recordsList.appendChild(empty);
            return;
        }

        records.forEach((record) => {
            const row = document.createElement('li');
            row.className = 'record-row';

            const icon = document.createElement('span');
            icon.className = 'record-icon';
            icon.innerHTML = ICON_DOC;

            const body = document.createElement('div');
            body.className = 'record-body';
            const title = document.createElement('p');
            title.className = 'record-title';
            title.textContent = record.title;
            const desc = document.createElement('p');
            desc.className = 'record-desc';
            desc.textContent = record.description;
            body.append(title, desc);

            const badge = document.createElement('span');
            badge.className = 'record-badge';
            badge.textContent = `${record.category} · ${record.date}`;

            const del = document.createElement('button');
            del.type = 'button';
            del.className = 'record-delete';
            del.innerHTML = ICON_TRASH;
            del.disabled = token === null;
            const label = token === null
                ? 'Увійдіть, щоб видаляти записи'
                : `Видалити запис «${record.title}»`;
            del.setAttribute('aria-label', label);
            del.title = label;
            del.addEventListener('click', () => deleteRecord(record));

            row.append(icon, body, badge, del);
            recordsList.appendChild(row);
        });
    }

    function updateAuthUi() {
        const loggedIn = token !== null;
        authForm.hidden = loggedIn;
        authSession.hidden = !loggedIn;
        recordSubmitBtn.disabled = !loggedIn;

        if (loggedIn) {
            authSessionText.textContent = `Ви увійшли як ${currentUser}`;
            authAvatar.textContent = currentUser.charAt(0).toUpperCase();
        } else {
            setStatus('Увійдіть або створіть акаунт, щоб додавати й видаляти записи.');
        }
        recordsHint.textContent = loggedIn
            ? 'Натисніть на кошик, щоб видалити запис.'
            : 'Увійдіть, щоб видаляти записи.';
        renderRecords();
    }

    function endSession(message) {
        token = null;
        currentUser = null;
        updateAuthUi();
        if (message) {
            setStatus(message, 'error');
            formMessage.textContent = message;
        }
    }

    async function loadRecords() {
        try {
            const data = await request('/records?limit=100');
            records = data.data;
            recordsMessage = '';
        } catch (error) {
            records = [];
            recordsMessage = 'Не вдалося завантажити записи. Оновіть сторінку за хвилину.';
        }
        recordsLoaded = true;
        renderRecords();
    }

    async function deleteRecord(record) {
        if (!window.confirm(`Видалити запис «${record.title}»?`)) return;
        try {
            await request(`/records/${record.id}`, { method: 'DELETE' });
            records = records.filter((item) => item.id !== record.id);
            formMessage.textContent = 'Запис видалено.';
            renderRecords();
        } catch (error) {
            if (error.status === 401) {
                endSession('Сесія завершилась. Увійдіть знову.');
            } else {
                formMessage.textContent = errorText(error);
            }
        }
    }

    async function login(username, password) {
        const data = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        token = data.token;
        currentUser = data.user.username;
        passwordInput.value = '';
        updateAuthUi();
    }

    togglePasswordBtn.addEventListener('click', () => {
        const visible = passwordInput.type === 'text';
        passwordInput.type = visible ? 'password' : 'text';
        togglePasswordBtn.setAttribute('aria-pressed', String(!visible));
        togglePasswordBtn.setAttribute('aria-label', visible ? 'Показати пароль' : 'Сховати пароль');
    });

    authForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setStatus('Зачекайте, сервер може прокидатися до хвилини...');
        setAuthBusy(true);
        try {
            await login(usernameInput.value.trim(), passwordInput.value);
        } catch (error) {
            setStatus(errorText(error), 'error');
        } finally {
            setAuthBusy(false);
        }
    });

    registerBtn.addEventListener('click', async () => {
        if (!authForm.reportValidity()) return;

        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        setStatus('Зачекайте, сервер може прокидатися до хвилини...');
        setAuthBusy(true);
        try {
            await request('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            await login(username, password);
        } catch (error) {
            setStatus(errorText(error), 'error');
        } finally {
            setAuthBusy(false);
        }
    });

    logoutBtn.addEventListener('click', () => {
        formMessage.textContent = '';
        endSession();
    });

    recordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (token === null) {
            formMessage.textContent = 'Спочатку увійдіть.';
            return;
        }

        const body = {
            title: document.getElementById('title').value.trim(),
            description: document.getElementById('notes').value.trim(),
            category: document.getElementById('category').value
        };
        const deadline = document.getElementById('deadline').value;
        if (deadline) body.date = deadline;

        formMessage.textContent = 'Збереження...';
        try {
            const created = await request('/records', { method: 'POST', body: JSON.stringify(body) });
            records = [created, ...records];
            renderRecords();
            formMessage.textContent = 'Запис створено. Його видно нижче і на головній сторінці.';
            recordForm.reset();
        } catch (error) {
            if (error.status === 401) {
                endSession('Сесія завершилась. Увійдіть знову.');
            } else {
                formMessage.textContent = errorText(error);
            }
        }
    });

    updateAuthUi();
    loadRecords();
});