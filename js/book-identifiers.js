document.addEventListener('DOMContentLoaded', async () => {
    let suggestions = { bbk: [], isbn: [] };
    try {
        const response = await fetch('/loadDt/getArticleIdentifierSuggestions');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        suggestions = await response.json();
    } catch (error) {
        console.error('Could not load BBK/ISBN suggestions:', error);
    }

    const closeLists = except => {
        document.querySelectorAll('.identifier-dropdown').forEach(list => {
            if (list !== except) list.classList.add('hidden');
        });
    };

    document.querySelectorAll('.identifier-select-container').forEach(container => {
        const input = container.querySelector('input[name="bbk"], input[name="isbn"]');
        const toggle = container.querySelector('.identifier-toggle');
        const dropdown = container.querySelector('.identifier-dropdown');
        if (!input || !toggle || !dropdown) return;
        const field = input.name;

        const renderOptions = () => {
            const query = input.value.trim().toLocaleLowerCase();
            const values = suggestions[field] || [];
            const matches = values.filter(value => !query || value.toLocaleLowerCase().includes(query));
            dropdown.replaceChildren();
            if (!matches.length) {
                const empty = document.createElement('div');
                empty.className = 'identifier-option';
                empty.textContent = values.length ? 'Нет совпадений' : 'Сохранённых значений пока нет';
                dropdown.appendChild(empty);
                return;
            }
            for (const value of matches) {
                const option = document.createElement('button');
                option.type = 'button';
                option.className = 'identifier-option';
                option.setAttribute('role', 'option');
                option.textContent = value;
                option.addEventListener('click', () => {
                    input.value = value;
                    dropdown.classList.add('hidden');
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                });
                dropdown.appendChild(option);
            }
        };

        toggle.addEventListener('click', event => {
            event.stopPropagation();
            const opening = dropdown.classList.contains('hidden');
            closeLists(dropdown);
            if (opening) {
                renderOptions();
                dropdown.classList.remove('hidden');
            } else {
                dropdown.classList.add('hidden');
            }
        });
        input.addEventListener('input', () => {
            if (!dropdown.classList.contains('hidden')) renderOptions();
        });
        dropdown.addEventListener('click', event => event.stopPropagation());
    });

    document.addEventListener('click', event => {
        if (!event.target.closest('.identifier-select-container')) closeLists();
    });
});
