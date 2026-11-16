document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('.genre-select-container');
    const input = document.getElementById('genreName');
    const toggle = container?.querySelector('.genre-toggle');
    const dropdown = document.getElementById('genreDropdown');
    if (!container || !input || !toggle || !dropdown) return;

    let genres = [];
    try {
        const response = await fetch('/auth/genres');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        genres = await response.json();
    } catch (error) {
        console.error('Не удалось загрузить жанры:', error);
    }

    const closeDropdown = () => dropdown.classList.add('hidden');
    const renderOptions = () => {
        const query = input.value.trim().toLocaleLowerCase();
        const matches = genres.filter(genre => !query || genre.name.toLocaleLowerCase().includes(query));
        dropdown.replaceChildren();

        for (const genre of matches) {
            const option = document.createElement('button');
            option.type = 'button';
            option.className = 'identifier-option';
            option.setAttribute('role', 'option');
            option.textContent = genre.name;
            option.addEventListener('click', () => {
                input.value = genre.name;
                closeDropdown();
                input.dispatchEvent(new Event('change', { bubbles: true }));
            });
            dropdown.appendChild(option);
        }

        const exactMatch = genres.some(genre => genre.name.toLocaleLowerCase() === query);
        if (query && !exactMatch) {
            const hint = document.createElement('div');
            hint.className = 'identifier-option genre-create-hint';
            hint.textContent = 'Новый жанр будет добавлен при сохранении';
            dropdown.appendChild(hint);
        } else if (!matches.length) {
            const empty = document.createElement('div');
            empty.className = 'identifier-option';
            empty.textContent = 'Список жанров пуст';
            dropdown.appendChild(empty);
        }
    };

    toggle.addEventListener('click', event => {
        event.stopPropagation();
        if (dropdown.classList.contains('hidden')) {
            renderOptions();
            dropdown.classList.remove('hidden');
            input.focus();
        } else {
            closeDropdown();
        }
    });

    input.addEventListener('focus', () => {
        renderOptions();
        dropdown.classList.remove('hidden');
    });
    input.addEventListener('input', renderOptions);
    dropdown.addEventListener('click', event => event.stopPropagation());
    document.addEventListener('click', event => {
        if (!container.contains(event.target)) closeDropdown();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeDropdown();
    });
    container.closest('form')?.addEventListener('reset', closeDropdown);
});
