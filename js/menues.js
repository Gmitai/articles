const nav = document.getElementById('nav');
const contentEl = document.getElementById('main-content');
const titleEl = document.getElementById('page-title');
const refreshBtn = document.getElementById('refreshBtn');

const TABLES = [
    "articles",
    "books",
    "authors",
    "publishers",
    "directions",
    "genres",
    "users"
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
        directions: 'УДК',
        genres: 'Жанры',
        users: 'Пользователи',
        books: 'Книги'
    };
    return map[key] || key;
}

function onNavClick(e) {
    const btn = e.currentTarget;
    setActive(btn);
    const key = btn.dataset.key;
    titleEl.textContent = humanizeKey(key);
    loadForKey(key);
}

function setActive(btn) {
    document.querySelectorAll('.nav button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

async function loadForKey(key) {
    showLoading();
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

function renderTable(key, rows) {
    contentEl.innerHTML = '';
    if (!Array.isArray(rows) || rows.length === 0) {
        contentEl.innerHTML = `<div class="placeholder">Нет данных для таблицы <strong>${key}</strong>.</div>`;
        return;
    }
    const table = document.createElement('table');
    table.className = 'data-table';
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const cols = Object.keys(rows[0]);
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
    rows.forEach(r => {
        const tr = document.createElement('tr');
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
            editButton.addEventListener('click', () => showForm(getFrmId(), r.id));
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
                if (typeof window.deleteCatalogRecord === 'function') {
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

