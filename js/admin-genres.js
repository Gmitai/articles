document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('genreModal');
    const form = document.getElementById('genreForm');
    const message = document.getElementById('genreMessage');
    const title = document.getElementById('genreModalTitle');
    const saveButton = document.getElementById('saveGenreButton');
    let editingGenreId = null;
    const pendingGenreDeletes = new Set();

    function closeModal() {
        modal.hidden = true;
        form.reset();
        message.textContent = '';
        message.className = 'admin-user-message';
        editingGenreId = null;
        title.textContent = 'Добавить жанр';
        saveButton.textContent = 'Добавить жанр';
    }

    document.getElementById('closeGenreModal').addEventListener('click', closeModal);
    modal.addEventListener('click', event => {
        if (event.target === modal) closeModal();
    });

    window.editAdminGenre = async genreId => {
        modal.hidden = false;
        message.textContent = 'Загружаю жанр…';
        try {
            const response = await fetch(`/admin-api/genres/${encodeURIComponent(genreId)}`);
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Не удалось загрузить жанр');
            }
            editingGenreId = result.genre.id;
            form.elements.name.value = result.genre.name || '';
            title.textContent = 'Редактировать жанр';
            saveButton.textContent = 'Сохранить';
            message.textContent = '';
        } catch (error) {
            message.textContent = error.message;
            message.classList.add('is-error');
        }
    };

    window.deleteAdminGenre = async (genreId, genreName) => {
        const requestKey = String(genreId);
        if (pendingGenreDeletes.has(requestKey)) return;
        pendingGenreDeletes.add(requestKey);
        if (!confirm(`Переместить жанр «${genreName}» в корзину? Его можно будет восстановить.`)) {
            pendingGenreDeletes.delete(requestKey);
            return;
        }
        try {
            const response = await fetch(`/admin-api/genres/${encodeURIComponent(genreId)}`, {
                method: 'DELETE'
            });
            if (response.status === 404) {
                if (typeof loadForKey === 'function') await loadForKey('genres');
                return;
            }
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Не удалось удалить жанр');
            }
            if (typeof loadForKey === 'function') loadForKey('genres');
        } catch (error) {
            alert(error.message);
        } finally {
            pendingGenreDeletes.delete(requestKey);
        }
    };

    form.addEventListener('submit', async event => {
        event.preventDefault();
        saveButton.disabled = true;
        message.textContent = 'Сохраняю…';
        try {
            const response = await fetch(
                editingGenreId
                    ? `/admin-api/genres/${encodeURIComponent(editingGenreId)}`
                    : '/admin-api/genres',
                {
                    method: editingGenreId ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: form.elements.name.value.trim() })
                }
            );
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Не удалось сохранить жанр');
            }
            closeModal();
            if (typeof loadForKey === 'function') loadForKey('genres');
        } catch (error) {
            message.textContent = error.message;
            message.classList.add('is-error');
        } finally {
            saveButton.disabled = false;
        }
    });
});
