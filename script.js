document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ПЕРЕМИКАЧ ТЕМИ (з урахуванням localStorage та системних налаштувань) ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        if (savedTheme === 'dark') {
            htmlElement.classList.add('dark');
        } else {
            htmlElement.classList.remove('dark');
        }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        htmlElement.classList.add('dark');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            htmlElement.classList.toggle('dark');
            if (htmlElement.classList.contains('dark')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // --- 2. ЗАВАНТАЖЕННЯ ДАНИХ ЧЕРЕЗ FETCH (3 стани: очікування, помилка, порожньо) ---
    const recordsContainer = document.getElementById('records-container');
    const statusMessage = document.getElementById('status-message');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');

    let allRecords = [];

    async function loadRecords() {
        if (!statusMessage || !recordsContainer) return;

        // Стан 1: Очікування (Loading)
        statusMessage.textContent = 'Завантаження даних...';
        recordsContainer.innerHTML = '';

        try {
            const response =.await ? fetch('data.json') : await fetch('data.json');
            
            // Обов'язкова перевірка властивості ok (статуси 404, 500 тощо)
            if (!response.ok) {
                throw new Error(`Помилка сервера: ${response.status}`);
            }

            allRecords = await response.json();

            // Стан 2: Порожній результат
            if (allRecords.length === 0) {
                statusMessage.textContent = 'Список записів порожній.';
                return;
            }

            statusMessage.textContent = '';
            renderRecords(allRecords);

        } catch (error) {
            // Стан 3: Помилка з можливістю повторити спробу
            console.error('Помилка завантаження даних:', error);
            statusMessage.innerHTML = `
                <span>Не вдалося завантажити дані. Перевірте з'єднання.</span>
                <button id="retry-btn" class="btn btn-light" style="margin-top: 8px; display: block;">Повторити спробу</button>
            `;
            const retryBtn = document.getElementById('retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', loadRecords);
            }
        }
    }

    // Рендеринг карток (без innerHTML із зовнішніми даними — захист від XSS через textContent)
    function renderRecords(records) {
        if (!recordsContainer) return;
        recordsContainer.innerHTML = '';

        records.forEach(record => {
            const article = document.createElement('article');
            article.className = 'card compact-card';
            article.dataset.id = record.id;

            const contentDiv = document.createElement('div');
            contentDiv.className = 'card-content card-content-inner';

            const title = document.createElement('h3');
            title.textContent = record.title;

            const desc = document.createElement('p');
            desc.textContent = record.description;

            contentDiv.appendChild(title);
            contentDiv.appendChild(desc);
            article.appendChild(contentDiv);

            recordsContainer.appendChild(article);
        });
    }

    // --- 3. ФІЛЬТРАЦІЯ ТА ПОШУК ---
    function filterAndSearchRecords() {
        const searchText = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';

        const filtered = allRecords.filter(record => {
            const matchesSearch = record.title.toLowerCase().includes(searchText) || 
                                  record.description.toLowerCase().includes(searchText);
            const matchesCategory = selectedCategory === 'all' || record.category === selectedCategory;
            
            return matchesSearch && matchesCategory;
        });

        if (filtered.length === 0) {
            if (statusMessage) statusMessage.textContent = 'Нічого не знайдено за вашим запитом.';
            if (recordsContainer) recordsContainer.innerHTML = '';
        } else {
            if (statusMessage) statusMessage.textContent = '';
            renderRecords(filtered);
        }
    }

    if (searchInput) searchInput.addEventListener('input', filterAndSearchRecords);
    if (categoryFilter) categoryFilter.addEventListener('change', filterAndSearchRecords);

    // --- 4. ДЕЛЕГУВАННЯ ПОДІЙ НА КАРТКАХ ---
    if (recordsContainer) {
        recordsContainer.addEventListener('click', (event) => {
            const card = event.target.closest('.card');
            if (!card) return;

            const recordId = card.dataset.id;
            const foundRecord = allRecords.find(r => r.id == recordId);
            
            if (foundRecord) {
                openModal(foundRecord, card);
            }
        });
    }

    // --- 5. МОДАЛЬНЕ ВІКНО (фокус, Esc, клік поза вікном) ---
    let lastFocusedElement = null;
    const modal = document.getElementById('record-modal');
    const modalCloseBtn = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');

    function openModal(record, triggerElement) {
        if (!modal) return;
        lastFocusedElement = triggerElement; // Запам'ятовуємо елемент для повернення фокуса

        if (modalTitle) modalTitle.textContent = record.title;
        if (modalDesc) modalDesc.textContent = record.description;

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');

        if (modalCloseBtn) modalCloseBtn.focus();

        document.addEventListener('keydown', handleKeyDown);
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');

        document.removeEventListener('keydown', handleKeyDown);

        // Повертаємо фокус туди, звідки відкрили
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    }

    function handleKeyDown(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }

    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    // Запуск завантаження даних, якщо елемент існує на сторінці
    if (recordsContainer) {
        loadRecords();
    }
});