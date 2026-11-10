const publisherSearchInput = document.getElementById('publisherSearchInput');
const publisherToggleBtn = document.getElementById('publisherToggleBtn');
const publisherDropdown = document.getElementById('publisherDropdown');
const publisherIdInput = document.getElementById('PublisherList');
let publishersCatalog = [];
let pendingPublisherId = null;

function normalizePublisherName(name) {
    return String(name || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function selectPublisher(publisher) {
    if (!publisher) return;
    publisherSearchInput.value = publisher.title_tj || '';
    publisherIdInput.value = publisher.id;
    publisherDropdown.querySelectorAll('[role="option"]').forEach(option => {
        option.classList.toggle('selected', Number(option.dataset.id) === Number(publisher.id));
    });
    pendingPublisherId = publisher.id;
}

function setPublisherSelection(id) {
    pendingPublisherId = id || null;
    const publisher = publishersCatalog.find(item => Number(item.id) === Number(id));
    if (publisher) selectPublisher(publisher);
}
window.setPublisherSelection = setPublisherSelection;

function syncPublisherInput() {
    const typedName = normalizePublisherName(publisherSearchInput?.value);
    const matched = publishersCatalog.find(publisher => normalizePublisherName(publisher.title_tj) === typedName);
    if (publisherIdInput) publisherIdInput.value = matched ? matched.id : '';
    pendingPublisherId = matched?.id || null;
    publisherDropdown?.querySelectorAll('[role="option"]').forEach(option => {
        option.classList.toggle('selected', Boolean(matched) && Number(option.dataset.id) === Number(matched.id));
    });
}

async function loadPublishers() {
    try {
        const response = await fetch('/loadDt/getPublishers');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        publishersCatalog = await response.json();

        const suggestions = document.getElementById('publisherSuggestions');
        if (suggestions) {
            suggestions.replaceChildren(...publishersCatalog.map(publisher => {
                const option = document.createElement('option');
                option.value = publisher.title_tj;
                return option;
            }));
        }

        if (publisherDropdown) {
            publisherDropdown.replaceChildren(...publishersCatalog.map(publisher => {
                const option = document.createElement('button');
                option.type = 'button';
                option.className = 'publisher-option';
                option.setAttribute('role', 'option');
                option.dataset.id = publisher.id;
                option.textContent = publisher.title_tj;
                option.addEventListener('click', () => {
                    selectPublisher(publisher);
                    publisherDropdown.classList.add('hidden');
                });
                return option;
            }));
        }

        if (pendingPublisherId) setPublisherSelection(pendingPublisherId);
        else syncPublisherInput();
    } catch (error) {
        console.error('Не удалось загрузить издательства:', error);
    }
}

publisherSearchInput?.addEventListener('input', syncPublisherInput);

publisherToggleBtn?.addEventListener('click', event => {
    event.stopPropagation();
    publisherDropdown.classList.toggle('hidden');
});

document.addEventListener('click', event => {
    if (publisherDropdown && !event.target.closest('.publisher-select-container')) {
        publisherDropdown.classList.add('hidden');
    }
});

if (publisherSearchInput) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadPublishers);
    else loadPublishers();
}
