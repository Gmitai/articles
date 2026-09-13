const selectedDiv = document.getElementById('selected-values');
const dropdown = document.getElementById('dropdown');
let selectedAuthors = [];


function loadAuthors() {
    fetch('/loadDt/getAuthors')
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


function updateSelectedValues() {
    const checked = [...dropdown.querySelectorAll('input:checked')].map(i => i.value);
    selectedAuthors = checked.map(Number);

    selectedDiv.textContent = selectedAuthors.length > 0
        ? [...dropdown.querySelectorAll('input:checked')].map(i => i.nextSibling.textContent).join(', ')
        : 'Муалифро интихоб кунед';
}


function setSelectedAuthors(authors) {
    selectedAuthors = authors.map(a => a.id);
    updateDropdownFromSelected();
}


function updateDropdownFromSelected() {
    [...dropdown.querySelectorAll('input')].forEach(cb => {
        cb.checked = selectedAuthors.includes(Number(cb.value));
    });
    updateSelectedValues();
}


if(selectedDiv){
    selectedDiv.addEventListener('click', () => {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });
}


if(dropdown) {

    dropdown.addEventListener('change', updateSelectedValues);


    document.addEventListener('click', (e) => {
        if (!e.target.closest('.multiselect-container')) {
            dropdown.style.display = 'none';
        }
    });
}

const form = document.querySelector('form');
if (form) {
    document.querySelector('form').addEventListener('submit', function (e) {

        [...this.querySelectorAll('input[name="authors"]')].forEach(i => i.remove());

        selectedAuthors.forEach(id => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'authors';
            input.value = id;
            this.appendChild(input);
        });
    })
}


if(dropdown) {
    document.addEventListener('DOMContentLoaded', loadAuthors);
}

