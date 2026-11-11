
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
    const yearSearch = document.getElementById('YearSearch');
    const publisherSearch = document.getElementById('PublisherSearch');
    const content = document.getElementById('content');

    const titleHints = document.getElementById('titleHints');
    const authorHints = document.getElementById('authorHints');
    const genreHints = document.getElementById('genreHints');
    const udcHints = document.getElementById('udcHints');
    const publisherHints = document.getElementById('PublisherHints');
    const sortSelect = document.getElementById('sortSelect');
    const detailsModal = document.getElementById('detailsModal');
    const detailsContent = document.getElementById('detailsContent');

    document.getElementById('closeDetails').addEventListener('click', closeDetails);
    detailsModal.addEventListener('click', event => {
        if (event.target === detailsModal) closeDetails();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !detailsModal.hidden) closeDetails();
    });

    function closeDetails() {
        detailsModal.hidden = true;
        document.body.classList.remove('detail-modal-open');
    }


async function loadYears() {
    if (!yearSearch) {
        return;
    }

    try {
        const response = await fetch('/userSearchYears');

        if (!response.ok) {
            throw new Error('Не удалось загрузить годы');
        }

        const years = await response.json();

        yearSearch.innerHTML = '<option value="">Все годы</option>';

        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSearch.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка загрузки годов:', error);
    }
}



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
    loadYears();

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
        const [hintsResponse, publishersResponse] = await Promise.all([
            fetch('/userSearchHints'),
            fetch('/loadDt/getPublishers')
        ]);

        if (!hintsResponse.ok) {
            throw new Error('Не удалось загрузить подсказки');
        }

        const data = await hintsResponse.json();

        fillHints(titleHints, data.titles);
        fillHints(authorHints, data.authors);
        fillHints(genreHints, data.genres);
        fillHints(udcHints, data.udc);

        if (publishersResponse.ok) {
            const publishers = await publishersResponse.json();

            publisherHints.innerHTML = '';

            publishers.forEach(publisher => {
                if (!publisher.title_tj) {
                    return;
                }

                const option = document.createElement('option');
                option.value = publisher.title_tj;
                publisherHints.appendChild(option);
            });
        }
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

    function fillCustomHints(list, values) {
        if (!list || !Array.isArray(values)) {
            return;
        }

        list.innerHTML = '';

        const uniqueValues = [
            ...new Set(
                values
                    .map(item => item.value)
                    .filter(value => value && value.trim())
            )
        ];

        uniqueValues.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
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
        card.dataset.articleId = String(item.id);
        card.tabIndex = 0;
        card.setAttribute('role', 'group');
        const displayTitle = item.title || item.titleRu || item.titleEn || 'Без названия';
        card.setAttribute('aria-label', `Подробнее: ${displayTitle}`);
        card.addEventListener('click', () => openItemDetails(item.id));
        card.addEventListener('keydown', event => {
            if (event.target === card && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                openItemDetails(item.id);
            }
        });

        const favoriteButton = document.createElement('button');
        favoriteButton.className = 'favorite-btn';
        favoriteButton.type = 'button';
        updateFavoriteButton(favoriteButton, item.favorite);
        favoriteButton.addEventListener('click', event => {
            event.stopPropagation();
            toggleFavorite(item.id, item, favoriteButton);
        });

        const coverWrap = document.createElement('div');
        coverWrap.className = 'book-card-icon';
        if (item.coverPath) {
            const cover = document.createElement('img');
            cover.className = 'book-card-cover';
            cover.src = `/uploads/${encodeURIComponent(item.coverPath)}`;
            cover.alt = '';
            cover.loading = 'lazy';
            coverWrap.appendChild(cover);
        } else {
            coverWrap.textContent = Number(item.typeOf) === 0 ? '📚' : '📄';
        }

        const title = document.createElement('h3');
        title.className = 'book-card-title';
        title.textContent = displayTitle;
        const author = document.createElement('p');
        author.className = 'book-card-info';
        author.textContent = `Автор: ${item.authors || 'не указан'}`;
        const type = document.createElement('p');
        type.className = 'book-card-info book-card-type';
        type.textContent = Number(item.typeOf) === 1 ? 'Статья' : 'Книга';
        const rating = document.createElement('div');
        rating.className = 'book-rating-summary';
        setRatingSummary(rating, item.ratingAverage, item.ratingCount);

        const actions = document.createElement('div');
        actions.className = 'card-buttons';
        actions.addEventListener('click', event => event.stopPropagation());
        actions.appendChild(createFileButtons(item));
        const detailsButton = document.createElement('button');
        detailsButton.type = 'button';
        detailsButton.className = 'details-book-btn';
        detailsButton.textContent = 'Подробнее';
        detailsButton.addEventListener('click', () => openItemDetails(item.id));
        actions.appendChild(detailsButton);

        card.append(favoriteButton, coverWrap, title, author, type, rating, actions);
        return card;
    }

    function updateFavoriteButton(button, favorite) {
        button.classList.toggle('active', Boolean(favorite));
        button.textContent = favorite ? '★' : '☆';
        button.title = favorite ? 'Убрать из избранного' : 'Добавить в избранное';
        button.setAttribute('aria-label', button.title);
    }

    async function toggleFavorite(articleId, item, button) {
        try {
            const response = await fetch(`/favorite/${articleId}`, { method: 'POST' });
            const result = await response.json();
            if (response.status === 401) throw new Error('Войдите в аккаунт, чтобы добавить запись в избранное.');
            if (!response.ok || !result.success) throw new Error(result.message || 'Не удалось изменить избранное.');
            item.favorite = result.favorite;
            updateFavoriteButton(button, result.favorite);
            document.querySelectorAll(`.book-card[data-article-id="${articleId}"] .favorite-btn`)
                .forEach(candidate => updateFavoriteButton(candidate, result.favorite));
        } catch (error) {
            alert(error.message);
        }
    }

    function createFileButtons(item) {
        const actions = document.createElement('div');
        actions.className = 'file-action-buttons';
        const readButton = document.createElement('button');
        readButton.type = 'button';
        readButton.className = 'read-book-btn';
        readButton.textContent = '📖 Читать';
        const downloadButton = document.createElement('button');
        downloadButton.type = 'button';
        downloadButton.className = 'download-book-btn';
        downloadButton.textContent = '⬇ Скачать';
        if (item.filePath) {
            readButton.addEventListener('click', () => {
                window.open(`/uploads/${encodeURIComponent(item.filePath)}`, '_blank', 'noopener');
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
            downloadButton.disabled = true;
            readButton.textContent = 'Файл отсутствует';
            downloadButton.textContent = 'Файл отсутствует';
        }
        actions.append(readButton, downloadButton);
        return actions;
    }

    async function openItemDetails(articleId) {
        detailsModal.hidden = false;
        document.body.classList.add('detail-modal-open');
        detailsContent.textContent = 'Загрузка…';
        try {
            const response = await fetch(`/item/${encodeURIComponent(articleId)}`);
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Не удалось загрузить информацию.');
            renderItemDetails(result.item);
        } catch (error) {
            detailsContent.textContent = error.message;
        }
    }

    let currentItemDetails = null;

    function renderItemDetails(item) {
        currentItemDetails = item;
        detailsContent.replaceChildren();
        const heading = document.createElement('h2');
        heading.id = 'detailTitle';
        heading.textContent = item.title || item.titleRu || item.titleEn || 'Без названия';
        detailsContent.appendChild(heading);

        const layout = document.createElement('div');
        layout.className = `detail-layout${item.coverPath ? '' : ' without-cover'}`;
        if (item.coverPath) {
            const cover = document.createElement('img');
            cover.className = 'detail-cover';
            cover.src = `/uploads/${encodeURIComponent(item.coverPath)}`;
            cover.alt = `Обложка: ${item.title || item.titleRu || item.titleEn || ''}`;
            layout.appendChild(cover);
        }
        const info = document.createElement('div');
        info.className = 'detail-info';
        const fields = [
            ['Тип', Number(item.typeOf) === 1 ? 'Статья' : 'Книга'],
            ['Жанр', item.genre],
            ['УДК', [item.udc, item.direction].filter(Boolean).join(' ')],
            ['Издательство', item.publisher],
            ['Год выпуска', formatYear(item.publishYear)],
            ['Количество страниц', item.pagesCount],
            ['\u0411\u0411\u041a', item.bbk],
            ['ISBN', item.isbn]
        ];
        if (item.createAt) fields.push(['Добавлено', formatDateTime(item.createAt)]);
        fields.forEach(([name, value]) => {
            const line = document.createElement('p');
            line.className = 'detail-field';
            const label = document.createElement('strong');
            label.textContent = `${name}: `;
            line.append(label, value == null || value === '' ? '—' : String(value));
            info.appendChild(line);
        });

        const authorsLine = document.createElement('p');
        authorsLine.className = 'detail-field';
        const authorsLabel = document.createElement('strong');
        authorsLabel.textContent = 'Авторы: ';
        authorsLine.appendChild(authorsLabel);
        if (item.authors?.length) {
            item.authors.forEach((author, index) => {
                if (index) authorsLine.append(', ');
                const authorLink = document.createElement('button');
                authorLink.type = 'button';
                authorLink.className = 'detail-author-link';
                authorLink.textContent = author.fullName;
                authorLink.addEventListener('click', () => openAuthorDetails(author.id));
                authorsLine.appendChild(authorLink);
            });
        } else {
            authorsLine.append('Не указан');
        }
        info.insertBefore(authorsLine, info.firstChild);

        const ratingBlock = document.createElement('section');
        ratingBlock.className = 'detail-rating';
        const ratingTitle = document.createElement('h3');
        ratingTitle.textContent = 'Рейтинг';
        ratingBlock.append(ratingTitle, createRatingWidget('article', item.id, item, updated => {
            Object.assign(item, updated);
            const matchingItem = allItems.find(row => Number(row.id) === Number(item.id));
            if (matchingItem) Object.assign(matchingItem, updated);
            document.querySelectorAll(`.book-card[data-article-id="${item.id}"] .book-rating-summary`)
                .forEach(summary => setRatingSummary(summary, updated.ratingAverage, updated.ratingCount));
        }));
        info.appendChild(ratingBlock);

        const actions = document.createElement('div');
        actions.className = 'detail-actions';
        actions.appendChild(createFileButtons(item));
        const favorite = document.createElement('button');
        favorite.type = 'button';
        favorite.className = 'detail-favorite-button';
        updateFavoriteButton(favorite, item.favorite);
        favorite.addEventListener('click', () => toggleFavorite(item.id, item, favorite));
        actions.appendChild(favorite);
        info.appendChild(actions);
        layout.appendChild(info);
        detailsContent.appendChild(layout);
    }

    async function openAuthorDetails(authorId) {
        detailsContent.textContent = 'Загрузка…';
        try {
            const response = await fetch(`/author/${encodeURIComponent(authorId)}`);
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Не удалось загрузить автора.');
            renderAuthorDetails(result.author);
        } catch (error) {
            detailsContent.textContent = error.message;
        }
    }

    function renderAuthorDetails(author) {
        detailsContent.replaceChildren();
        const back = document.createElement('button');
        back.type = 'button';
        back.className = 'detail-back-button';
        back.textContent = '← К информации о книге / статье';
        back.addEventListener('click', () => {
            if (currentItemDetails) renderItemDetails(currentItemDetails);
        });
        detailsContent.appendChild(back);
        const heading = document.createElement('h2');
        heading.id = 'detailTitle';
        heading.textContent = author.fullName || 'Автор';
        detailsContent.appendChild(heading);
        const info = document.createElement('div');
        info.className = 'detail-info';
        const fields = [
            ['Дата рождения', author.birthDate ? formatDate(author.birthDate) : '—'],
            ['Город', author.city]
        ];
        fields.forEach(([name, value]) => {
            const line = document.createElement('p');
            line.className = 'detail-field';
            const label = document.createElement('strong');
            label.textContent = `${name}: `;
            line.append(label, value == null || value === '' ? '—' : String(value));
            info.appendChild(line);
        });
        const ratingBlock = document.createElement('section');
        ratingBlock.className = 'detail-rating';
        const ratingTitle = document.createElement('h3');
        ratingTitle.textContent = 'Рейтинг автора';
        ratingBlock.append(ratingTitle, createRatingWidget('author', author.id, author));
        info.appendChild(ratingBlock);
        const favorite = document.createElement('button');
        favorite.type = 'button';
        favorite.className = 'detail-favorite-button author-favorite-button';
        favorite.textContent = author.favorite ? '★ Убрать из избранных авторов' : '☆ В избранные авторы';
        favorite.classList.toggle('active', Boolean(author.favorite));
        favorite.addEventListener('click', async () => {
            try {
                const response = await fetch(`/favorite-author/${author.id}`, { method: 'POST' });
                const result = await response.json();
                if (response.status === 401) throw new Error('Войдите в аккаунт, чтобы сохранить автора.');
                if (!response.ok || !result.success) throw new Error(result.message || 'Не удалось изменить избранное.');
                author.favorite = result.favorite;
                favorite.textContent = result.favorite ? '★ Убрать из избранных авторов' : '☆ В избранные авторы';
                favorite.classList.toggle('active', result.favorite);
            } catch (error) {
                alert(error.message);
            }
        });
        info.appendChild(favorite);
        detailsContent.appendChild(info);
    }

    function createRatingWidget(targetType, targetId, initial, onChange = () => {}) {
        const widget = document.createElement('div');
        widget.className = 'rating-widget';
        const summary = document.createElement('span');
        summary.className = 'rating-summary';
        const stars = document.createElement('div');
        stars.className = 'rating-stars';
        let currentRating = Number(initial.myRating) || 0;
        const draw = () => {
            const average = Number(initial.ratingAverage) || 0;
            const count = Number(initial.ratingCount) || 0;
            summary.textContent = count ? `Средняя оценка: ${average.toFixed(1)} (${count})` : 'Пока нет оценок';
            stars.replaceChildren();
            for (let score = 1; score <= 5; score += 1) {
                const star = document.createElement('button');
                star.type = 'button';
                star.className = `rating-star${score <= currentRating ? ' selected' : ''}`;
                star.textContent = score <= currentRating ? '★' : '☆';
                star.setAttribute('aria-label', `Оценить на ${score}`);
                star.title = `Оценить на ${score}`;
                star.addEventListener('click', async () => {
                    try {
                        const response = await fetch(`/rating/${targetType}/${targetId}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ score })
                        });
                        const result = await response.json();
                        if (response.status === 401) throw new Error('Войдите в аккаунт, чтобы поставить оценку.');
                        if (!response.ok || !result.success) throw new Error(result.message || 'Не удалось сохранить оценку.');
                        Object.assign(initial, result);
                        currentRating = Number(result.myRating) || score;
                        onChange(result);
                        draw();
                    } catch (error) {
                        alert(error.message);
                    }
                });
                stars.appendChild(star);
            }
        };
        widget.append(summary, stars);
        draw();
        return widget;
    }

    function setRatingSummary(container, average, count) {
        const value = Number(average) || 0;
        const total = Number(count) || 0;
        container.textContent = total ? `★ ${value.toFixed(1)} · ${total}` : '☆ Пока без оценок';
    }

    function formatDate(value) {
        const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
        return match ? `${match[3]}.${match[2]}.${match[1]}` : String(value);
    }

    function formatDateTime(value) {
        const normalized = String(value).replace(' ', 'T');
        const date = new Date(normalized);
        return Number.isNaN(date.getTime()) ? formatDate(value) : date.toLocaleString();
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
        const year = yearSearch ? yearSearch.value.trim() : '';
        const publisher = publisherSearch ? publisherSearch.value.trim() : '';

        if (!title && !author && !genre && !udc && !year && !publisher) {
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

            if (year) {
                params.set('year', year);
            }

            if (publisher) {
                params.set('publisher', publisher);
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

        if (yearSearch) {
            yearSearch.value = '';
        }

        if (publisherSearch) {
            publisherSearch.value = '';
        }

        renderItems(allItems);
    });

    sortSelect.addEventListener('change', () => {
        const title = searchInput.value.trim();
        const author = authorSearch.value.trim();
        const genre = genreSearch.value.trim();
        const udc = udcSearch.value.trim();
        const year = yearSearch ? yearSearch.value.trim() : '';
        const publisher = publisherSearch ? publisherSearch.value.trim() : '';

        if (!title && !author && !genre && !udc && !year && !publisher) {
            renderItems(allItems);
        } else {
            performSearch();
        }
    });
});

