const selectedDiv = document.getElementById('selected-values');
const dropdown = document.getElementById('dropdown');
selectedDiv.required = true;

let selectedAuthors = []; // массив выбранных id авторов

// Загружаем авторов с сервера
function loadAuthors() {
    fetch('/getAuthors')
        .then(res => res.json())
        .then(authors => {
            dropdown.innerHTML = '';
            authors.forEach(author => {
                const label = document.createElement('label');
                label.className = 'dropdown-item';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = author.id;

                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(author.lastName));
                dropdown.appendChild(label);
            });

            updateDropdownFromSelected();
        })
        .catch(err => console.error(err));
}

// Показ выбранных авторов в selectedDiv
function updateSelectedValues() {
    const checked = [...dropdown.querySelectorAll('input:checked')].map(i => i.value);
    selectedAuthors = checked.map(Number);

    selectedDiv.textContent = selectedAuthors.length > 0
        ? [...dropdown.querySelectorAll('input:checked')].map(i => i.nextSibling.textContent).join(', ')
        : 'Муалифро интихоб кунед';
}

// Отмечаем авторов при редактировании
function setSelectedAuthors(authors) {
    selectedAuthors = authors.map(a => a.id);
    updateDropdownFromSelected();
}

// Обновляем чекбоксы из массива selectedAuthors
function updateDropdownFromSelected() {
    [...dropdown.querySelectorAll('input')].forEach(cb => {
        cb.checked = selectedAuthors.includes(Number(cb.value));
    });
    updateSelectedValues();
}

// Открытие/закрытие dropdown по клику на selectedDiv
selectedDiv.addEventListener('click', () => {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

// Обновление выбранных значений при клике на чекбокс
dropdown.addEventListener('change', updateSelectedValues);

// Закрытие dropdown при клике вне
document.addEventListener('click', (e) => {
    if (!e.target.closest('.multiselect-container')) {
        dropdown.style.display = 'none';
    }
});

// При сабмите формы добавляем скрытые поля для выбранных авторов
document.querySelector('form').addEventListener('submit', function(e) {
    // удаляем старые скрытые поля, если есть
    [...this.querySelectorAll('input[name="authors"]')].forEach(i => i.remove());

    selectedAuthors.forEach(id => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'authors';
        input.value = id;
        this.appendChild(input);
    });
});

// Инициализация
document.addEventListener('DOMContentLoaded', loadAuthors);
