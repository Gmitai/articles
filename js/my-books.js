document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.books-tab');
    const panels = document.querySelectorAll('.books-panel');
    const homeBtn = document.getElementById('homeBtn');
    const favoritesContainer = document.getElementById('favoritesContainer');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            tabs.forEach(item => {
                item.classList.remove('active');
            });

            panels.forEach(panel => {
                panel.classList.remove('active');
            });

            tab.classList.add('active');
            document.getElementById(target).classList.add('active');

            if (target === 'favorites') {
                loadFavorites();
            }
        });
    });

    homeBtn.addEventListener('click', () => {
        window.location.href = '/user-index.html';
    });

    loadFavorites();

    async function loadFavorites() {
        try {
            favoritesContainer.innerHTML = '<p>Загрузка...</p>';

            const response = await fetch('/favorites');

            const data = await response.json();

            if (response.status === 401) {
                favoritesContainer.innerHTML = `
                    <div class="empty-books">
                        <div class="empty-books-icon">🔐</div>
                        <h3>Необходимо войти в аккаунт</h3>
                        <p>Войдите в аккаунт, чтобы увидеть избранные книги.</p>
                    </div>
                `;
                return;
            }

            if (!response.ok) {
                throw new Error(data.message || 'Ошибка загрузки избранного');
            }

            if (!Array.isArray(data) || data.length === 0) {
                favoritesContainer.innerHTML = `
                    <div class="empty-books">
                        <div class="empty-books-icon">⭐</div>
                        <h3>Избранное пока пусто</h3>
                        <p>Добавленные в избранное книги появятся здесь.</p>
                    </div>
                `;
                return;
            }

            favoritesContainer.innerHTML = '';

            data.forEach(item => {
                const card = createFavoriteCard(item);
                favoritesContainer.appendChild(card);
            });

        } catch (error) {
            console.error('Ошибка загрузки избранного:', error);

            favoritesContainer.innerHTML = `
                <div class="empty-books">
                    <div class="empty-books-icon">⚠️</div>
                    <h3>Ошибка загрузки</h3>
                    <p>${escapeHtml(error.message)}</p>
                </div>
            `;
        }
    }

    function createFavoriteCard(item) {
        const card = document.createElement('article');
        card.className = 'book-card';

        const favoriteButton = document.createElement('button');
        favoriteButton.className = 'favorite-btn active';
        favoriteButton.type = 'button';
        favoriteButton.textContent = '★';
        favoriteButton.title = 'Убрать из избранного';

        favoriteButton.addEventListener('click', async () => {
            try {
                const response = await fetch(`/favorite/${item.id}`, {
                    method: 'POST'
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    alert(data.message || 'Не удалось изменить избранное');
                    return;
                }

                if (!data.favorite) {
                    card.remove();

                    if (!favoritesContainer.querySelector('.book-card')) {
                        favoritesContainer.innerHTML = `
                            <div class="empty-books">
                                <div class="empty-books-icon">⭐</div>
                                <h3>Избранное пока пусто</h3>
                                <p>Добавленные в избранное книги появятся здесь.</p>
                            </div>
                        `;
                    }
                }

            } catch (error) {
                console.error('Ошибка удаления из избранного:', error);
                alert('Ошибка подключения к серверу');
            }
        });

        const icon = document.createElement('div');
        icon.className = 'book-card-icon';
        icon.textContent = Number(item.typeOf) === 0 ? '📚' : '📄';

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
            downloadButton.disabled = true;
            readButton.textContent = 'Файл отсутствует';
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

    function formatYear(date) {
        if (!date) {
            return '—';
        }

        const year = new Date(date).getFullYear();

        return Number.isNaN(year) ? '—' : year;
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});