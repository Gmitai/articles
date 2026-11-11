(function () {
    async function loadFavoriteAuthors() {
        const container = document.getElementById('favoriteAuthorsContainer');
        if (!container) return;
        container.textContent = 'Загрузка…';
        try {
            const response = await fetch('/favorite-authors');
            const result = await response.json();
            if (response.status === 401) {
                container.textContent = 'Войдите в аккаунт, чтобы видеть избранных авторов.';
                return;
            }
            if (!response.ok || !result.success) throw new Error(result.message || 'Не удалось загрузить авторов.');
            container.replaceChildren();
            if (!result.authors.length) {
                container.textContent = 'Пока нет избранных авторов.';
                return;
            }
            result.authors.forEach(author => {
                const card = document.createElement('article');
                card.className = 'book-card author-favorite-card';
                const title = document.createElement('h3');
                title.className = 'book-card-title';
                title.textContent = author.fullName || 'Автор';
                const birthDate = document.createElement('p');
                birthDate.className = 'book-card-info';
                birthDate.textContent = author.birthDate
                    ? `Дата рождения: ${new Date(author.birthDate).toLocaleDateString()}`
                    : 'Дата рождения не указана';
                const rating = document.createElement('p');
                rating.className = 'book-rating-summary';
                const average = Number(author.ratingAverage) || 0;
                const count = Number(author.ratingCount) || 0;
                rating.textContent = count ? `★ ${average.toFixed(1)} · ${count}` : '☆ Пока без оценок';
                const remove = document.createElement('button');
                remove.type = 'button';
                remove.className = 'author-favorite-remove';
                remove.textContent = 'Убрать из избранных';
                remove.addEventListener('click', async () => {
                    try {
                        const update = await fetch(`/favorite-author/${author.id}`, { method: 'POST' });
                        const data = await update.json();
                        if (!update.ok || !data.success) throw new Error(data.message || 'Не удалось изменить избранное.');
                        card.remove();
                        if (!container.querySelector('.author-favorite-card')) {
                            container.textContent = 'Пока нет избранных авторов.';
                        }
                    } catch (error) {
                        alert(error.message);
                    }
                });
                card.append(title, birthDate, rating, remove);
                container.appendChild(card);
            });
        } catch (error) {
            container.textContent = error.message;
        }
    }

    window.loadFavoriteAuthors = loadFavoriteAuthors;
})();
