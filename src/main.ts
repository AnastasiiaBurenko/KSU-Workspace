import { RecordItem } from './types';
import { validateRecords } from './src/validator';

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle') as HTMLButtonElement | null;
    const htmlElement = document.documentElement;

    // Тема
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        htmlElement.classList.add('dark');
    } else if (savedTheme === 'light') {
        htmlElement.classList.remove('dark');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            htmlElement.classList.toggle('dark');
            localStorage.setItem('theme', htmlElement.classList.contains('dark') ? 'dark' : 'light');
        });
    }

    const recordsContainer = document.getElementById('records-container') as HTMLElement | null;
    const statusMessage = document.getElementById('status-message') as HTMLElement | null;
    const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
    const categoryFilter = document.getElementById('category-filter') as HTMLSelectElement | null;

    let allRecords: RecordItem[] = [];

    async function loadRecords(): Promise<void> {
        if (!statusMessage || !recordsContainer) return;

        statusMessage.textContent = 'Завантаження даних...';
        recordsContainer.innerHTML = '';

        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`Помилка сервера: ${response.status}`);
            }

            const rawData: unknown = await response.json();
            allRecords = validateRecords(rawData);

            if (allRecords.length === 0) {
                statusMessage.textContent = 'Список записів порожній.';
                return;
            }

            statusMessage.textContent = '';
            renderRecords(allRecords);

        } catch (error) {
            console.error('Помилка завантаження:', error);
            statusMessage.innerHTML = `
                <span>Не вдалося завантажити дані.</span>
                <button id="retry-btn" class="btn btn-light" style="margin-top: 8px;">Повторити спробу</button>
            `;
            const retryBtn = document.getElementById('retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', loadRecords);
            }
        }
    }

    function renderRecords(records: RecordItem[]): void {
        if (!recordsContainer) return;
        recordsContainer.innerHTML = '';

        records.forEach(record => {
            const article = document.createElement('article');
            article.className = 'card compact-card';
            article.dataset.id = record.id.toString();

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

    function filterRecords(): void {
        const searchText = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';

        const filtered = allRecords.filter(record => {
            const matchesSearch = record.title.toLowerCase().includes(searchText) || 
                                  record.description.toLowerCase().includes(searchText);
            const matchesCategory = selectedCategory === 'all' || record.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        renderRecords(filtered);
    }

    if (searchInput) searchInput.addEventListener('input', filterRecords);
    if (categoryFilter) categoryFilter.addEventListener('change', filterRecords);

    if (recordsContainer) {
        loadRecords();
    }
});