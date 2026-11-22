document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://ksu-workspace-1.onrender.com/api';

    const authForm = document.getElementById('auth-form');
    const recordForm = document.getElementById('record-form');
    if (!authForm || !recordForm) return;

    const authStatus = document.getElementById('auth-status');
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const recordSubmitBtn = recordForm.querySelector('button[type="submit"]');
    const formMessage = document.getElementById('form-message');

    // Токен живе лише в пам'яті сторінки: не в localStorage і не в cookie.
    let token = null;
    let currentUser = null;

    function show(element, visible) {
        element.style.display = visible ? '' : 'none';
    }

    function updateAuthUi() {
        const loggedIn = token !== null;
        show(authForm, !loggedIn);
        show(logoutBtn, loggedIn);
        recordSubmitBtn.disabled = !loggedIn;
        authStatus.textContent = loggedIn
            ? `Ви увійшли як ${currentUser}.`
            : 'Увійдіть або зареєструйтесь, щоб створювати записи.';
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
        const headers = { 'Content-Type': 'application/json' };
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

    authForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        authStatus.textContent = 'Зачекайте, сервер може прокидатися до хвилини...';
        setAuthBusy(true);
        try {
            await login(usernameInput.value.trim(), passwordInput.value);
        } catch (error) {
            authStatus.textContent = errorText(error);
        } finally {
            setAuthBusy(false);
        }
    });

    registerBtn.addEventListener('click', async () => {
        if (!authForm.reportValidity()) return;

        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        authStatus.textContent = 'Зачекайте, сервер може прокидатися до хвилини...';
        setAuthBusy(true);
        try {
            await request('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            await login(username, password);
        } catch (error) {
            authStatus.textContent = errorText(error);
        } finally {
            setAuthBusy(false);
        }
    });

    logoutBtn.addEventListener('click', () => {
        token = null;
        currentUser = null;
        formMessage.textContent = '';
        updateAuthUi();
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
            await request('/records', { method: 'POST', body: JSON.stringify(body) });
            formMessage.textContent = 'Запис створено. Його видно на головній сторінці.';
            recordForm.reset();
        } catch (error) {
            if (error.status === 401) {
                token = null;
                currentUser = null;
                updateAuthUi();
                formMessage.textContent = 'Сесія завершилась. Увійдіть знову.';
            } else {
                formMessage.textContent = errorText(error);
            }
        }
    });

    updateAuthUi();
});