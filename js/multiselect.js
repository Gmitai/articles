const selectedDiv = document.getElementById('selected-values');
const dropdown = document.getElementById('dropdown');

selectedDiv.addEventListener('click', () => {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

// Обновление выбранных значений
dropdown.addEventListener('change', () => {
    const checked = [...dropdown.querySelectorAll('input:checked')].map(i => i.value);

    selectedDiv.textContent = checked.length > 0
        ? checked.join(', ')
        : 'Выберите...';
});

// Закрытие при клике вне
document.addEventListener('click', (e) => {
    if (!e.target.closest('.multiselect-container')) {
        dropdown.style.display = 'none';
    }
});
