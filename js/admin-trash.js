(function () {
    let activeFilter = 'all';
    const labels = {
        catalog: 'Книга / статья',
        author: 'Автор',
        publisher: 'Издательство',
        direction: 'Направление',
        genre: 'Жанр',
        user: 'Пользователь',
        classifier: '\u041a\u043b\u0430\u0441\u0441\u0438\u0444\u0438\u043a\u0430\u0442\u043e\u0440'
    };

    async function loadTrashSection() {
        const content = document.getElementById('main-content');
        content.innerHTML = '<div class="placeholder">Загрузка корзины…</div>';
        try {
            const response = await fetch('/admin-api/trash');
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Не удалось загрузить корзину.');
            const records = result.records || [];
            renderTrash(content, records);
        } catch (error) {
            content.innerHTML = '';
            const errorBox = document.createElement('div');
            errorBox.className = 'error';
            errorBox.textContent = error.message;
            content.appendChild(errorBox);
        }
    }

    function renderTrash(content, records) {
        const bulkActions = document.createElement('div');
        bulkActions.className = 'trash-bulk-actions';
        if (records.length) {
            const restoreAll = document.createElement('button');
            restoreAll.type = 'button';
            restoreAll.className = 'admin-trash-restore-all';
            restoreAll.textContent = 'Восстановить всё';
            restoreAll.addEventListener('click', () => restoreAllRecords(records));

            const clearAll = document.createElement('button');
            clearAll.type = 'button';
            clearAll.className = 'admin-trash-clear-all';
            clearAll.textContent = 'Очистить корзину';
            clearAll.addEventListener('click', clearTrash);
            bulkActions.append(restoreAll, clearAll);
        }

        const filters = [
            ['all', 'Все'],
            ['catalog', 'Книги и статьи'],
            ['author', 'Авторы'],
            ['publisher', 'Издательства'],
            ['direction', 'УДК'],
            ['genre', 'Жанры'],
            ['user', 'Пользователи'],
            ['classifier', '\u041a\u043b\u0430\u0441\u0441\u0438\u0444\u0438\u043a\u0430\u0442\u043e\u0440\u044b']
        ];
        const filterBar = document.createElement('div');
        filterBar.className = 'trash-filters';
        filters.forEach(([key, title]) => {
            const amount = key === 'all' ? records.length : records.filter(item => item.recordType === key).length;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `trash-filter${activeFilter === key ? ' active' : ''}`;
            button.textContent = `${title} (${amount})`;
            button.setAttribute('aria-pressed', String(activeFilter === key));
            button.addEventListener('click', () => {
                activeFilter = key;
                renderTrash(content, records);
            });
            filterBar.appendChild(button);
        });

        const visibleRecords = activeFilter === 'all'
            ? records
            : records.filter(item => item.recordType === activeFilter);
        if (!visibleRecords.length) {
            const empty = document.createElement('div');
            empty.className = 'placeholder trash-empty';
            empty.textContent = records.length ? 'В этом подразделе нет записей.' : 'Корзина пуста.';
            content.replaceChildren(bulkActions, filterBar, empty);
            return;
        }

        const table = document.createElement('table');
        table.className = 'data-table trash-table';
        table.innerHTML = '<thead><tr><th>Раздел</th><th>Название</th><th>Удалено</th><th class="admin-actions-column">Действия</th></tr></thead>';
        const body = document.createElement('tbody');
        visibleRecords.forEach(record => {
                const row = document.createElement('tr');
                const type = document.createElement('td');
                type.textContent = labels[record.recordType] || record.recordType;
                const label = document.createElement('td');
                label.textContent = record.label || `#${record.recordId}`;
                const deletedAt = document.createElement('td');
                const date = new Date(record.deletedAt);
                deletedAt.textContent = Number.isNaN(date.getTime()) ? '' : date.toLocaleString();

                const actionCell = document.createElement('td');
                actionCell.className = 'admin-actions-column trash-actions';
                const actionGroup = document.createElement('div');
                actionGroup.className = 'trash-action-buttons';
                const restoreButton = document.createElement('button');
                restoreButton.type = 'button';
                restoreButton.className = 'admin-trash-restore';
                restoreButton.textContent = 'Восстановить';
                restoreButton.addEventListener('click', () => restoreRecord(record.id));

                const purgeButton = document.createElement('button');
                purgeButton.type = 'button';
                purgeButton.className = 'admin-trash-purge';
                purgeButton.textContent = 'Удалить навсегда';
                purgeButton.addEventListener('click', () => purgeRecord(record.id, record.label));

                actionGroup.append(restoreButton, purgeButton);
                actionCell.appendChild(actionGroup);
                row.append(type, label, deletedAt, actionCell);
                body.appendChild(row);
            });
        table.appendChild(body);
        content.replaceChildren(bulkActions, filterBar, table);
    }

    async function restoreAllRecords(records) {
        if (!confirm(`Восстановить все ${records.length} записей из корзины?`)) return;
        const skipped = [];
        let restored = 0;
        for (const record of records) {
            try {
                const response = await fetch(`/admin-api/trash/${encodeURIComponent(record.id)}/restore`, { method: 'POST' });
                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.message || 'Ошибка восстановления');
                restored += 1;
            } catch (error) {
                skipped.push(`${record.label || `#${record.recordId}`}: ${error.message}`);
            }
        }
        await loadTrashSection();
        if (skipped.length) {
            const details = skipped.slice(0, 5).join('\n');
            const remainder = skipped.length > 5 ? `\nИ ещё записей с ошибками: ${skipped.length - 5}.` : '';
            alert(`Восстановлено: ${restored}. Осталось в корзине: ${skipped.length}.\n${details}${remainder}`);
        }
    }

    async function clearTrash() {
        if (!confirm('Удалить навсегда все записи из корзины? Восстановить их будет нельзя.')) return;
        try {
            const response = await fetch('/admin-api/trash', { method: 'DELETE' });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Не удалось очистить корзину.');
            await loadTrashSection();
        } catch (error) {
            alert(error.message);
        }
    }

    async function restoreRecord(id) {
        try {
            const response = await fetch(`/admin-api/trash/${encodeURIComponent(id)}/restore`, { method: 'POST' });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Не удалось восстановить запись.');
            await loadTrashSection();
        } catch (error) {
            alert(error.message);
        }
    }

    async function purgeRecord(id, label) {
        if (!confirm(`Удалить «${label || id}» навсегда? Это действие нельзя отменить.`)) return;
        try {
            const response = await fetch(`/admin-api/trash/${encodeURIComponent(id)}`, { method: 'DELETE' });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Не удалось удалить запись.');
            await loadTrashSection();
        } catch (error) {
            alert(error.message);
        }
    }

    window.loadTrashSection = loadTrashSection;
})();
