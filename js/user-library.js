document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const advancedSearchBtn = document.getElementById('advancedSearchBtn');
    const advancedSearch = document.getElementById('advancedSearch');
    const advancedSearchApply = document.getElementById('advancedSearchApply');
    const advancedSearchClear = document.getElementById('advancedSearchClear');
    const authorSearch = document.getElementById('authorSearch');
    const genreSearch = document.getElementById('genreSearch');
    const udcSearch = document.getElementById('udcSearch');
    const content = document.getElementById('content');

    const titleHints = document.getElementById('titleHints');
    const authorHints = document.getElementById('authorHints');
    const genreHints = document.getElementById('genreHints');
    const udcHints = document.getElementById('udcHints');

    const sortSelect = document.getElementById('sortSelect');

    function sortItems(items) {
        const sortType = sortSelect.value;
        const sortedItems = [...items];

        if (sortType === 'year_desc') {
            sortedItems.sort((a, b) => {
                return getYear(b.publishYear) - getYear(a.publishYear);
            });
        }

        if (sortType === 'year_asc') {
            sortedItems.sort((a, b) => {
                return getYear(a.publishYear) - getYear(b.publishYear);
            });
        }

        if (sortType === 'title_asc') {
            sortedItems.sort((a, b) => {
                return (a.title || '').localeCompare(
                    b.title || '',
                    'ru',
                    { sensitivity: 'base' }
                );
            });
        }

        if (sortType === 'title_desc') {
            sortedItems.sort((a, b) => {
                return (b.title || '').localeCompare(
                    a.title || '',
                    'ru',
                    { sensitivity: 'base' }
                );
            });
        }

        return sortedItems;
    }

    function getYear(value) {
        if (!value) return 0;

        const date = new Date(value);

        if (!isNaN(date.getTime())) {
            return date.getFullYear();
        }

        const year = parseInt(value);

        return isNaN(year) ? 0 : year;
    }

    let allItems = [];

    loadCatalog();
    loadHints();

    async function loadCatalog() {
        try {
            content.innerHTML = '<p class="loading-message">Загрузка каталога...</p>';

            const response = await fetch('/userCatalog');

            if (!response.ok) {
                throw new Error('Не удалось загрузить каталог');
            }

            allItems = await response.json();

            renderItems(allItems);

        } catch (error) {
            console.error(error);
            content.innerHTML = `
                <p class="error-message">
                    Не удалось загрузить каталог.
                </p>
            `;
        }
    }

    async function loadHints() {
        try {
            const response = await fetch('/userSearchHints');

            if (!response.ok) {
                throw new Error('Не удалось загрузить подсказки');
            }

            const data = await response.json();

            fillHints(titleHints, data.titles);
            fillHints(authorHints, data.authors);
            fillHints(genreHints, data.genres);
            fillHints(udcHints, data.udc);

        } catch (error) {
            console.error('Ошибка подсказок:', error);
        }
    }

    function fillHints(list, values) {
        if (!list || !Array.isArray(values)) {
            return;
        }

        list.innerHTML = '';

        values.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value;
            list.appendChild(option);
        });
    }

    function renderItems(items) {
        content.innerHTML = '';

        if (!items || items.length === 0) {
            content.innerHTML = '<p class="empty-message">По вашему запросу ничего не найдено.</p>';
            return;
        }

        const sortedItems = sortItems(items);

        const books = sortedItems.filter(item => Number(item.typeOf) === 0);
        const articles = sortedItems.filter(item => Number(item.typeOf) === 1);

        if (books.length > 0) {
            content.appendChild(createSection('📚 Книги', books));
        }

        if (articles.length > 0) {
            content.appendChild(createSection('📄 Статьи', articles));
        }
    }

    function createSection(title, items) {
        const section = document.createElement('section');
        section.className = 'catalog-section';

        const heading = document.createElement('h2');
        heading.className = 'catalog-title';
        heading.textContent = title;

        const grid = document.createElement('div');
        grid.className = 'catalog-grid';

        items.forEach(item => {
            grid.appendChild(createCard(item));
        });

        section.appendChild(heading);
        section.appendChild(grid);

        return section;
    }

    function createCard(item) {
        const card = document.createElement('article');
        card.className = 'book-card';

const favoriteButton = document.createElement('button');
favoriteButton.className = 'favorite-btn';
favoriteButton.type = 'button';
favoriteButton.textContent = '★';
favoriteButton.title = 'Добавить в избранное';

        fetch(`/favorite/${item.id}`)
            .then(response => {
                if (!response.ok) {
                    return null;
                }
                return response.json();
            })
            .then(data => {
                if (data && data.success && data.favorite) {
                    item.favorite = true;
                    favoriteButton.classList.add('active');
                    favoriteButton.title = 'Убрать из избранного';
                }
            })
            .catch(() => {});

if (item.favorite) {
    favoriteButton.classList.add('active');
}

favoriteButton.addEventListener('click', async event => {
    event.stopPropagation();

    try {
        const response = await fetch(`/favorite/${item.id}`, {
            method: 'POST'
        });

        const data = await response.json();

        if (response.status === 401) {
            alert('Чтобы добавить книгу в избранное, войдите в аккаунт');
            return;
        }

        if (!response.ok || !data.success) {
            alert(data.message || 'Не удалось изменить избранное');
            return;
        }

        item.favorite = data.favorite;

        favoriteButton.classList.toggle(
            'active',
            data.favorite
        );

        favoriteButton.title = data.favorite
            ? 'Убрать из избранного'
            : 'Добавить в избранное';

    } catch (error) {
        console.error('Ошибка избранного:', error);
        alert('Не удалось подключиться к серверу');
    }
});

const icon = document.createElement('div');
icon.className = 'book-card-icon';
icon.textContent =
    Number(item.typeOf) === 0 ? '📚' : '📄';

const title = document.createElement('h3');
title.className = 'book-card-title';
title.textContent = item.title || 'Без названия';

const authors = document.createElement('p');
authors.className = 'book-card-info';
authors.innerHTML =
    `<strong>Автор:</strong> ${escapeHtml(item.authors || 'Не указан')}`;

const genre = document.createElement('p');
genre.className = 'book-card-info';
genre.innerHTML =
    `<strong>Жанр:</strong> ${escapeHtml(item.genre || 'Не указан')}`;

const udc = document.createElement('p');
udc.className = 'book-card-info';
udc.innerHTML =
    `<strong>УДК:</strong> ${escapeHtml(item.udc || 'Не указан')}`;

const publisher = document.createElement('p');
publisher.className = 'book-card-info';
publisher.innerHTML =
    `<strong>Издательство:</strong> ${escapeHtml(item.publisher || 'Не указано')}`;

const year = document.createElement('p');
year.className = 'book-card-info';
year.innerHTML =
    `<strong>Год:</strong> ${formatYear(item.publishYear)}`;

const pages = document.createElement('p');
pages.className = 'book-card-info';
pages.innerHTML =
    `<strong>Страниц:</strong> ${item.pagesCount || '—'}`;

const buttons = document.createElement('div');
buttons.className = 'card-buttons';

const readButton = document.createElement('button');
readButton.className = 'read-book-btn';
readButton.type = 'button';
readButton.textContent = '📖 Читать';

const downloadButton = document.createElement('button');
downloadButton.className = 'download-book-btn';
downloadButton.type = 'button';
downloadButton.textContent = '⬇ Скачать';

if (item.filePath) {
    readButton.addEventListener('click', () => {
        window.open(
            `/uploads/${encodeURIComponent(item.filePath)}`,
            '_blank'
        );
    });

    downloadButton.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = `/download/${encodeURIComponent(item.filePath)}`;
        link.download = item.filePath;
        document.body.appendChild(link);
        link.click();
        link.remove();
    });
} else {
    readButton.disabled = true;
    readButton.textContent = 'Файл отсутствует';

    downloadButton.disabled = true;
    downloadButton.textContent = 'Файл отсутствует';
}

buttons.appendChild(readButton);
buttons.appendChild(downloadButton);

card.appendChild(favoriteButton);
card.appendChild(icon);
card.appendChild(title);
card.appendChild(authors);
card.appendChild(genre);
card.appendChild(udc);
card.appendChild(publisher);
card.appendChild(year);
card.appendChild(pages);
card.appendChild(buttons);

return card;


    }


    function formatYear(value) {
        if (!value) {
            return '—';
        }

        const date = new Date(value);

        if (!isNaN(date.getTime())) {
            return date.getFullYear();
        }

        return value;
    }

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value;
        return div.innerHTML;
    }

    async function performSearch() {
        const title = searchInput.value.trim();
        const author = authorSearch.value.trim();
        const genre = genreSearch.value.trim();
        const udc = udcSearch.value.trim();

        if (!title && !author && !genre && !udc) {
            renderItems(allItems);
            return;
        }

        try {
            content.innerHTML = '<p class="loading-message">Поиск...</p>';

            const params = new URLSearchParams();

            if (title) {
                params.set('title', title);
            }

            if (author) {
                params.set('author', author);
            }

            if (genre) {
                params.set('genre', genre);
            }

            if (udc) {
                params.set('udc', udc);
            }

            const response = await fetch(
                `/userSearch?${params.toString()}`
            );

            if (!response.ok) {
                throw new Error('Ошибка поиска');
            }

            const result = await response.json();

            renderItems(result);

        } catch (error) {
            console.error(error);

            content.innerHTML = `
                <p class="error-message">
                    Ошибка при выполнении поиска.
                </p>
            `;
        }
    }

    searchBtn.addEventListener('click', performSearch);

    searchInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            performSearch();
        }
    });

    advancedSearchBtn.addEventListener('click', () => {
        advancedSearch.classList.toggle('open');
    });

    advancedSearchApply.addEventListener('click', performSearch);

    advancedSearchClear.addEventListener('click', () => {
        searchInput.value = '';
        authorSearch.value = '';
        genreSearch.value = '';
        udcSearch.value = '';

        renderItems(allItems);
    });

    sortSelect.addEventListener('change', () => {
        const title = searchInput.value.trim();
        const author = authorSearch.value.trim();
        const genre = genreSearch.value.trim();
        const udc = udcSearch.value.trim();

        if (!title && !author && !genre && !udc) {
            renderItems(allItems);
        } else {
            performSearch();
        }
    });
});

