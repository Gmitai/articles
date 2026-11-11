document.addEventListener('DOMContentLoaded', async () => {
    const select = document.getElementById('genreId');
    if (!select) return;
    try {
        const response = await fetch('/auth/genres');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const genres = await response.json();
        const selectedGenreId = select.dataset.selectedGenreId || select.value;
        select.replaceChildren(new Option('Без жанра', ''));
        for (const genre of genres) select.add(new Option(genre.name, genre.id));
        if (selectedGenreId) select.value = String(selectedGenreId);
    } catch (error) {
        console.error('Could not load genres:', error);
    }
});
