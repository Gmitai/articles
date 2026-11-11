const nav = document.getElementById('nav');
const contentEl = document.getElementById('main-content');
const titleEl = document.getElementById('page-title');
const refreshBtn = document.getElementById('refreshBtn');
let activeClassifierTab = 'udc';
window.getActiveClassifierTab = () => activeClassifierTab;
window.setActiveClassifierTab = type => {
    activeClassifierTab = type;
    loadForKey('directions');
};

const TABLES = [
    "articles",
    "books",
    "authors",
    "publishers",
    "directions",
    "genres",
    "users",
    "trash"
];
createNav();

function createNav() {
    TABLES.forEach(key => {
        const btn = document.createElement('button');
        btn.textContent = humanizeKey(key);
        btn.dataset.key = key;
        btn.addEventListener('click', onNavClick);
        nav.appendChild(btn);
    });

    const first = nav.querySelector('button');
    if (first) {
        setActive(first);
        loadForKey(first.dataset.key);
    }
}

function humanizeKey(key) {
    const map = {
        articles: 'Стаьи',
        authors: 'Авторы',
        publishers: 'Издательства',
        directions: '\u041a\u043b\u0430\u0441\u0441\u0438\u0444\u0438\u043a\u0430\u0442\u043e\u0440\u044b',
        genres: 'Жанры',
        users: 'Пользователи',
        books: 'Книги',
        trash: 'Корзина'
    };
    return map[key] || key;
}

function onNavClick(e) {
    const btn = e.currentTarget;
    setActive(btn);
    const key = btn.dataset.key;
    titleEl.textContent = humanizeKey(key);
    document.getElementById('add').hidden = key === 'trash';
    loadForKey(key);
}

function setActive(btn) {
    document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

async function loadForKey(key) {
    showLoading();
    if (key === 'directions' && typeof window.loadClassifierSection === 'function') {
        await window.loadClassifierSection(activeClassifierTab);
        return;
    }
    if (key === 'trash') {
        if (typeof window.loadTrashSection === 'function') {
            await window.loadTrashSection();
        } else {
            showError('Раздел корзины не загрузился. Обновите страницу.');
        }
        return;
    }
    try {

        const res = await fetch(`/${encodeURIComponent(key)}`);
        if (!res.ok) throw new Error(res.statusText || 'Ошибка сети');
        const data = await res.json();
        localStorage.setItem('frmId', JSON.stringify(data[1]));
        renderTable(key, data[0]);


    } catch (err) {
        showError(err);
    }
}

function showLoading() {
    contentEl.innerHTML = '';
    const loaderWrap = document.createElement('div');
    loaderWrap.className = 'placeholder';
    loaderWrap.innerHTML = '<div class="loader" aria-hidden="true"></div><div>Загрузка...</div>';
    contentEl.appendChild(loaderWrap);
}

function showError(err) {
    contentEl.innerHTML = `<div class="error">Ошибка при загрузке: ${err.message || err}</div>`;
}

function renderTable(key, rows, classifierType = null) {
    contentEl.innerHTML = '';
    if (!Array.isArray(rows) || rows.length === 0) {
        contentEl.innerHTML = `<div class="placeholder">Нет данных для таблицы <strong>${key}</strong>.</div>`;
        return;
    }
    const cols = Object.keys(rows[0]).filter(column => column !== 'id');

    const searchToolbar = document.createElement('div');
    searchToolbar.className = 'record-search-toolbar';
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.className = 'record-search-input';
    searchInput.placeholder = `Поиск в разделе «${humanizeKey(key)}»`;
    searchInput.setAttribute('aria-label', searchInput.placeholder);
    const sortField = document.createElement('select');
    sortField.className = 'record-sort-select';
    sortField.setAttribute('aria-label', 'Сортировать по');
    const noSortOption = document.createElement('option');
    noSortOption.value = '';
    noSortOption.textContent = 'Без сортировки';
    sortField.appendChild(noSortOption);
    cols.forEach(column => {
        const option = document.createElement('option');
        option.value = column;
        option.textContent = key === 'genres' && column === 'genreName'
            ? 'По имени'
            : `По полю: ${column}`;
        sortField.appendChild(option);
    });
    const sortOrder = document.createElement('select');
    sortOrder.className = 'record-sort-select';
    sortOrder.setAttribute('aria-label', 'Порядок сортировки');
    sortOrder.add(new Option('По возрастанию', 'asc'));
    sortOrder.add(new Option('По убыванию', 'desc'));
    const searchStatus = document.createElement('span');
    searchStatus.className = 'record-search-status';
    searchStatus.setAttribute('aria-live', 'polite');
    searchToolbar.append(searchInput, sortField, sortOrder, searchStatus);
    contentEl.appendChild(searchToolbar);

    const table = document.createElement('table');
    table.className = 'data-table';
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    cols.forEach(c => {
        const th = document.createElement('th');
        th.textContent = key === 'genres' && c === 'genreName' ? 'Жанр' : c;
        headerRow.appendChild(th);
    });
    if (['articles', 'books', 'authors', 'publishers', 'directions', 'users', 'genres'].includes(key)) {
        const actionsHeader = document.createElement('th');
        actionsHeader.className = 'admin-actions-column';
        actionsHeader.textContent = 'Действия';
        headerRow.appendChild(actionsHeader);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    rows.forEach((r, index) => {
        const tr = document.createElement('tr');
        tr.recordData = r;
        tr.originalIndex = index;
        tr.dataset.searchText = Object.entries(r)
            .map(([column, value]) => `${column} ${value ?? ''}`)
            .join(' ')
            .toLocaleLowerCase();
        cols.forEach(c => {
            const td = document.createElement('td');
            td.textContent = r[c] === null ? '' : r[c];
            tr.appendChild(td);
        });


        const img = document.createElement('img');
        img.src = '/icons/edit-icon.png';
        img.alt = 'Редактировать';
        img.style.width = '32px';
        img.style.height = '32px';

        const img2 = document.createElement('img');
        img2.src = '/icons/load-icon.png';
        img2.alt = 'Загрузить';
        img2.style.width = '32px';
        img2.style.height = '32px';
        let frmId = parseInt(localStorage.getItem('frmId'));
        if (key === 'users' || key === 'genres') {
            const editCell = document.createElement('td');
            editCell.className = 'admin-actions-column';
            const actions = document.createElement('div');
            actions.className = 'admin-user-actions';
            const editButton = document.createElement('button');
            const userEditIcon = document.createElement('img');
            userEditIcon.src = '/icons/edit-icon.png';
            userEditIcon.alt = key === 'users' ? 'Редактировать пользователя' : 'Редактировать жанр';
            userEditIcon.style.width = '32px';
            userEditIcon.style.height = '32px';
            editButton.type = 'button';
            editButton.className = 'admin-user-edit-button';
            editButton.title = key === 'users' ? 'Редактировать пользователя' : 'Редактировать жанр';
            editButton.appendChild(userEditIcon);
            editButton.addEventListener('click', () => {
                if (key === 'users' && typeof window.editAdminUser === 'function') {
                    window.editAdminUser(r.id);
                } else if (key === 'genres' && typeof window.editAdminGenre === 'function') {
                    window.editAdminGenre(r.id);
                }
            });
            actions.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'admin-user-delete-button';
            deleteButton.title = 'Удалить';
            deleteButton.setAttribute('aria-label', 'Удалить');
            const deleteIcon = document.createElement('img');
            deleteIcon.src = '/icons/Delete.png';
            deleteIcon.alt = '';
            deleteIcon.width = 24;
            deleteIcon.height = 24;
            deleteButton.appendChild(deleteIcon);
            deleteButton.addEventListener('click', () => {
                if (key === 'users' && typeof window.deleteAdminUser === 'function') {
                    window.deleteAdminUser(r.id, r['Логин'] || r.id);
                } else if (key === 'genres' && typeof window.deleteAdminGenre === 'function') {
                    window.deleteAdminGenre(r.id, r.genreName || r.id);
                }
            });
            actions.appendChild(deleteButton);
            editCell.appendChild(actions);
            tr.appendChild(editCell);
        } else if (['articles', 'books', 'authors', 'publishers', 'directions'].includes(key)) {
            const actionCell = document.createElement('td');
            actionCell.className = 'admin-actions-column';
            const actions = document.createElement('div');
            actions.className = 'admin-user-actions';

            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.className = 'admin-user-edit-button';
            editButton.title = 'Редактировать';
            editButton.appendChild(img);
            editButton.addEventListener('click', () => {
                if (key === 'directions' && classifierType && classifierType !== 'udc') {
                    window.editClassifier(classifierType, r.id);
                } else {
                    showForm(getFrmId(), r.id);
                }
            });
            actions.appendChild(editButton);

            if ((key === 'articles' || key === 'books') && frmId === 0) {
                const downloadButton = document.createElement('button');
                downloadButton.type = 'button';
                downloadButton.className = 'admin-user-edit-button';
                downloadButton.title = 'Скачать файл';
                downloadButton.appendChild(img2);
                downloadButton.addEventListener('click', () => getFileName(r.id));
                actions.appendChild(downloadButton);
            }

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'admin-user-delete-button';
            deleteButton.title = 'Удалить';
            deleteButton.setAttribute('aria-label', 'Удалить');
            const deleteIcon = document.createElement('img');
            deleteIcon.src = '/icons/Delete.png';
            deleteIcon.alt = '';
            deleteIcon.width = 24;
            deleteIcon.height = 24;
            deleteButton.appendChild(deleteIcon);
            deleteButton.addEventListener('click', () => {
                const labelColumn = cols.find(column => column !== 'id');
                const displayName = labelColumn ? r[labelColumn] : r.id;
                if (key === 'directions' && classifierType && classifierType !== 'udc') {
                    window.deleteClassifier(classifierType, r.id, displayName);
                } else if (typeof window.deleteCatalogRecord === 'function') {
                    window.deleteCatalogRecord(key, r.id, displayName);
                }
            });
            actions.appendChild(deleteButton);

            actionCell.appendChild(actions);
            tr.appendChild(actionCell);
        }

        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    contentEl.appendChild(table);

    const parseSortableDate = value => {
        const text = String(value ?? '').trim();
        let match = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])).getTime();
        match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime();
        return null;
    };

    const updateTableView = () => {
        const query = searchInput.value.trim().toLocaleLowerCase();
        const sortKey = sortField.value;
        const sortDirection = sortOrder.value === 'desc' ? -1 : 1;
        const tableRows = [...tbody.querySelectorAll('tr')];
        tableRows.sort((left, right) => {
            if (!sortKey) return left.originalIndex - right.originalIndex;
            const leftValue = left.recordData[sortKey];
            const rightValue = right.recordData[sortKey];
            const leftEmpty = leftValue == null || String(leftValue).trim() === '';
            const rightEmpty = rightValue == null || String(rightValue).trim() === '';
            if (leftEmpty || rightEmpty) return leftEmpty === rightEmpty ? 0 : (leftEmpty ? 1 : -1);

            const leftDate = parseSortableDate(leftValue);
            const rightDate = parseSortableDate(rightValue);
            if (leftDate !== null && rightDate !== null) return (leftDate - rightDate) * sortDirection;

            const leftText = String(leftValue).trim();
            const rightText = String(rightValue).trim();
            if (/^-?\d+(?:[.,]\d+)?$/.test(leftText) && /^-?\d+(?:[.,]\d+)?$/.test(rightText)) {
                return (Number(leftText.replace(',', '.')) - Number(rightText.replace(',', '.'))) * sortDirection;
            }
            return leftText.localeCompare(rightText, 'ru', { numeric: true, sensitivity: 'base' }) * sortDirection;
        });
        tableRows.forEach(row => tbody.appendChild(row));

        let visibleRows = 0;
        tableRows.forEach(row => {
            const matches = !query || row.dataset.searchText.includes(query);
            row.hidden = !matches;
            if (matches) visibleRows += 1;
        });
        searchStatus.textContent = query
            ? `Найдено: ${visibleRows} из ${rows.length}`
            : `Записей: ${rows.length}`;
    };
    searchInput.addEventListener('input', updateTableView);
    sortField.addEventListener('change', updateTableView);
    sortOrder.addEventListener('change', updateTableView);
    updateTableView();
}

if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        const active = document.querySelector('.nav button.active');
        if (active) {
            loadForKey(active.dataset.key);
        }
    });
}

function refresh() {
    const frmId = parseInt(localStorage.getItem('frmId'));

    const iframeIds = {
        0: 'meIframe1',
        1: 'meIframe2',
        2: 'meIframe3',
        4: 'meIframe4'
    };

    const iframeId = iframeIds[frmId];

    if (!iframeId) {
        return;
    }

    const iframe = document.getElementById(iframeId);

    if (iframe) {
        iframe.contentWindow.location.reload();
    }
}

window.loadForKey = loadForKey;
window.renderTable = renderTable;

