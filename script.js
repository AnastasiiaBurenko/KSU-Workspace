document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ПЕРЕМИКАЧ ТЕМИ ---
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
            localStorage.setItem('theme', htmlElement.classList.contains('dark') ? 'dark' : 'light');
        });
    }

    // --- 2. ЗАВАНТАЖЕННЯ ДАНИХ ТА ТЕГИ-КАТЕГОРІЇ ---
    const recordsContainer = document.getElementById('records-container');
    const statusMessage = document.getElementById('status-message');
    const searchInput = document.getElementById('search-input');
    const categoryTags = document.querySelectorAll('#category-tags .tag');

    let allRecords = [];
    let currentCategory = 'Усі';
    let searchQuery = '';

    async function loadRecords() {
        if (!statusMessage || !recordsContainer) return;

        statusMessage.textContent = 'Завантаження даних...';
        recordsContainer.innerHTML = '';

        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`Помилка сервера: ${response.status}`);
            }

            allRecords = await response.json();

            if (allRecords.length === 0) {
                statusMessage.textContent = 'Список записів порожній.';
                return;
            }

            statusMessage.textContent = '';
            filterAndSearchRecords();

        } catch (error) {
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

    function filterAndSearchRecords() {
        searchQuery = searchInput ? searchInput.value.toLowerCase() : '';

        const filtered = allRecords.filter(record => {
            const matchesSearch = record.title.toLowerCase().includes(searchQuery) || 
                                  record.description.toLowerCase().includes(searchQuery);
            
            const matchesCategory = currentCategory === 'Усі' || 
                (record.category && record.category.toLowerCase().includes(currentCategory.toLowerCase())) ||
                record.title.toLowerCase().includes(currentCategory.toLowerCase());
            
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

    if (categoryTags) {
        categoryTags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.preventDefault();
                categoryTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                currentCategory = tag.getAttribute('data-cat') || tag.textContent.trim();
                filterAndSearchRecords();
            });
        });
    }

    if (searchInput) searchInput.addEventListener('input', filterAndSearchRecords);

    // --- 3. ПОМОДОРО-ТАЙМЕР ---
    let pomoSeconds = 25 * 60;
    let isWorkSession = true; 
    let pomoInterval = null;
    let isPomoRunning = false;

    const pomoTimerDisplay = document.getElementById('pomo-timer');
    const pomoStartBtn = document.getElementById('pomo-start');
    const pomoResetBtn = document.getElementById('pomo-reset');

    function updatePomoDisplay() {
        if (!pomoTimerDisplay) return;
        const m = Math.floor(pomoSeconds / 60);
        const s = pomoSeconds % 60;
        pomoTimerDisplay.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    if (pomoStartBtn) {
        pomoStartBtn.addEventListener('click', () => {
            if (!isPomoRunning) {
                isPomoRunning = true;
                pomoStartBtn.textContent = 'Пауза';
                
                pomoInterval = setInterval(() => {
                    if (pomoSeconds > 0) {
                        pomoSeconds--;
                        updatePomoDisplay();
                    } else {
                        clearInterval(pomoInterval);
                        isPomoRunning = false;
                        
                        if (isWorkSession) {
                            isWorkSession = false;
                            pomoSeconds = 5 * 60;
                            alert('Время вышло! Отличная работа. Начинается перерыв (5 мин).');
                        } else {
                            isWorkSession = true;
                            pomoSeconds = 25 * 60;
                            alert('Перерыв закончился! Возвращаемся к фокусу (25 мин).');
                        }
                        
                        pomoStartBtn.textContent = 'Старт';
                        updatePomoDisplay();
                    }
                }, 1000);
            } else {
                clearInterval(pomoInterval);
                isPomoRunning = false;
                pomoStartBtn.textContent = 'Продовжити';
            }
        });
    }

    if (pomoResetBtn) {
        pomoResetBtn.addEventListener('click', () => {
            clearInterval(pomoInterval);
            isPomoRunning = false;
            isWorkSession = true;
            pomoSeconds = 25 * 60;
            updatePomoDisplay();
            if (pomoStartBtn) pomoStartBtn.textContent = 'Старт';
        });
    }
    updatePomoDisplay();

    // --- 4. МОДАЛЬНЕ ВІКНО ---
    let lastFocusedElement = null;
    const modal = document.getElementById('record-modal');
    const modalCloseBtn = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');

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

    function openModal(record, triggerElement) {
        if (!modal) return;
        lastFocusedElement = triggerElement;

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
        if (lastFocusedElement) lastFocusedElement.focus();
    }

    function handleKeyDown(event) {
        if (event.key === 'Escape') closeModal();
    }

    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    if (recordsContainer) {
        loadRecords();
    }
});