const selectedDiv = document.getElementById('selected-values');
const dropdown = document.getElementById('dropdown');
const authorSearchInput = document.getElementById('authorSearchInput');
const authorToggleBtn = document.getElementById('authorToggleBtn');
const isArticleAuthorPicker = Boolean(authorSearchInput && authorToggleBtn && dropdown);
let selectedAuthors = [];
let manualSelectedAuthors = [];
let authorsCatalog = [];

function normalizeAuthorName(name) {
    return String(name || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function getEnteredAuthorNames() {
    return (authorSearchInput?.value || '').split(',').map(name => name.trim()).filter(Boolean);
}

function findAuthorByName(name) {
    const normalized = normalizeAuthorName(name);
    return authorsCatalog.find(author => normalizeAuthorName(author.fullName) === normalized) ||
        (normalized.split(' ').length === 2
            ? authorsCatalog.find(author => normalizeAuthorName([author.lastName, author.firstName].filter(Boolean).join(' ')) === normalized)
            : undefined);
}

async function loadAuthors() {
    try {
        const response = await fetch('/loadDt/getAuthors');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        authorsCatalog = await response.json();
        if (!dropdown) return;
        dropdown.replaceChildren();

        authorsCatalog.forEach(author => {
            const label = document.createElement('label');
            label.className = 'dropdown-item';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = author.id;
            checkbox.dataset.authorId = author.id;
            label.append(checkbox, document.createTextNode(` ${author.fullName}`));
            dropdown.appendChild(label);
        });

        const suggestions = document.getElementById('authorSuggestions');
        if (suggestions) {
            suggestions.replaceChildren(...authorsCatalog.map(author => {
                const option = document.createElement('option');
                option.value = author.fullName;
                return option;
            }));
        }
        syncTypedAuthors();
    } catch (error) {
        console.error('Не удалось загрузить авторов:', error);
    }
}

function syncTypedAuthors() {
    const typedMatches = getEnteredAuthorNames()
        .map(findAuthorByName)
        .filter(Boolean)
        .map(author => Number(author.id));
    selectedAuthors = [...new Set([...manualSelectedAuthors, ...typedMatches])];

    dropdown.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = selectedAuthors.includes(Number(checkbox.value));
    });

    const names = [...new Set([
        ...selectedAuthors.map(id => authorsCatalog.find(author => Number(author.id) === id)?.fullName).filter(Boolean),
        ...getEnteredAuthorNames().filter(name => !findAuthorByName(name))
    ])];
    if (selectedDiv) selectedDiv.hidden = true;
}

function setSelectedAuthors(authors) {
    const items = Array.isArray(authors) ? authors : [];
    manualSelectedAuthors = [];
    selectedAuthors = items.map(author => Number(author.id)).filter(Number.isFinite);
    if (authorSearchInput) {
        authorSearchInput.value = items
            .map(author => author.fullName || [author.lastName, author.firstName, author.familyName].filter(Boolean).join(' '))
            .filter(Boolean)
            .join(', ');
    }
    syncTypedAuthors();
}

function clearSelectedAuthors() {
    selectedAuthors = [];
    manualSelectedAuthors = [];
    if (authorSearchInput) authorSearchInput.value = '';
    syncTypedAuthors();
}

function updateDropdownFromSelected() {
    syncTypedAuthors();
}

window.setSelectedAuthors = setSelectedAuthors;
window.clearSelectedAuthors = clearSelectedAuthors;
window.updateDropdownFromSelected = updateDropdownFromSelected;

authorSearchInput?.addEventListener('input', syncTypedAuthors);

dropdown?.addEventListener('change', event => {
    const checkbox = event.target.closest('input[type="checkbox"]');
    if (!checkbox) return;

    const author = authorsCatalog.find(item => Number(item.id) === Number(checkbox.value));
    if (author && authorSearchInput) {
        const names = getEnteredAuthorNames()
            .filter(name => Number(findAuthorByName(name)?.id) !== Number(author.id));
        if (checkbox.checked) names.push(author.fullName);
        authorSearchInput.value = [...new Set(names)].join(', ');
    }

    const typedIds = new Set(getEnteredAuthorNames().map(findAuthorByName).filter(Boolean).map(author => Number(author.id)));
    manualSelectedAuthors = [...dropdown.querySelectorAll('input:checked')]
        .map(input => Number(input.value))
        .filter(id => !typedIds.has(id));
    syncTypedAuthors();
});

authorToggleBtn?.addEventListener('click', event => {
    event.stopPropagation();
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', event => {
    if (!dropdown) return;
    if (!event.target.closest('.author-select-container')) dropdown.style.display = 'none';
});

if (isArticleAuthorPicker) document.querySelector('form')?.addEventListener('submit', function() {
    this.querySelectorAll('input[name="authors"]').forEach(input => input.remove());
    selectedAuthors.forEach(id => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'authors';
        input.value = id;
        this.appendChild(input);
    });
});

if (isArticleAuthorPicker) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadAuthors);
    else loadAuthors();
}
