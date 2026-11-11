document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('classifierModal');
    const form = document.getElementById('classifierForm');
    const message = document.getElementById('classifierMessage');
    const title = document.getElementById('classifierModalTitle');
    const codeLabel = document.getElementById('classifierCodeLabel');
    const saveButton = document.getElementById('saveClassifierButton');
    const labels = {
        udc: '\u0423\u0414\u041a',
        bbk: '\u0411\u0411\u041a',
        isbn: 'ISBN'
    };
    let editing = null;

    function closeModal() {
        modal.hidden = true;
        form.reset();
        message.textContent = '';
        message.className = 'admin-user-message';
        editing = null;
    }

    document.getElementById('closeClassifierModal').addEventListener('click', closeModal);
    modal.addEventListener('click', event => {
        if (event.target === modal) closeModal();
    });

    window.loadClassifierSection = async type => {
        const content = document.getElementById('main-content');
        const tabTitles = {
            udc: '\u0423\u0414\u041a',
            bbk: '\u0411\u0411\u041a',
            isbn: 'ISBN'
        };
        let rows;
        try {
            if (type === 'udc') {
                const response = await fetch('/directions');
                if (!response.ok) throw new Error(response.statusText);
                const result = await response.json();
                localStorage.setItem('frmId', JSON.stringify(result[1]));
                rows = result[0];
            } else {
                const response = await fetch(`/admin-api/classifiers/${encodeURIComponent(type)}`);
                const result = await response.json();
                if (!response.ok || !result.success) throw new Error(result.message || 'Could not load classifier.');
                rows = (result.records || []).map(record => ({
                    id: record.id,
                    [type === 'bbk' ? '\u041a\u043e\u0434 \u0411\u0411\u041a' : 'ISBN']: record.code,
                    '\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435': record.title
                }));
            }
            window.renderTable('directions', rows, type);
            const tabs = document.createElement('div');
            tabs.className = 'classifier-tabs';
            for (const tabType of ['udc', 'bbk', 'isbn']) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = `classifier-tab${tabType === type ? ' active' : ''}`;
                button.textContent = tabTitles[tabType];
                button.setAttribute('aria-pressed', String(tabType === type));
                button.addEventListener('click', () => window.setActiveClassifierTab(tabType));
                tabs.appendChild(button);
            }
            content.prepend(tabs);
        } catch (error) {
            content.innerHTML = '';
            const errorBox = document.createElement('div');
            errorBox.className = 'error';
            errorBox.textContent = error.message;
            content.appendChild(errorBox);
        }
    };

    window.openClassifierForm = type => {
        if (!labels[type] || type === 'udc') return;
        editing = { type, id: null };
        form.reset();
        message.textContent = '';
        codeLabel.firstChild.textContent = `${labels[type]} \u043a\u043e\u0434`;
        title.textContent = `\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c: ${labels[type]}`;
        saveButton.textContent = '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c';
        modal.hidden = false;
    };

    window.editClassifier = async (type, id) => {
        editing = { type, id };
        form.reset();
        modal.hidden = false;
        message.textContent = '\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430...';
        try {
            const response = await fetch(`/admin-api/classifiers/${encodeURIComponent(type)}/${encodeURIComponent(id)}`);
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Could not load classifier entry.');
            form.elements.code.value = result.record.code || '';
            form.elements.title.value = result.record.title || '';
            codeLabel.firstChild.textContent = `${labels[type]} \u043a\u043e\u0434`;
            title.textContent = `\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c: ${labels[type]}`;
            saveButton.textContent = '\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c';
            message.textContent = '';
        } catch (error) {
            message.textContent = error.message;
            message.classList.add('is-error');
        }
    };

    window.deleteClassifier = async (type, id, label) => {
        if (!confirm(`\u041f\u0435\u0440\u0435\u043c\u0435\u0441\u0442\u0438\u0442\u044c \u00ab${label}\u00bb \u0432 \u043a\u043e\u0440\u0437\u0438\u043d\u0443?`)) return;
        try {
            const response = await fetch(`/admin-api/classifiers/${encodeURIComponent(type)}/${encodeURIComponent(id)}`, { method: 'DELETE' });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Could not delete classifier entry.');
            await window.loadForKey('directions');
        } catch (error) {
            alert(error.message);
        }
    };

    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!editing) return;
        saveButton.disabled = true;
        message.textContent = '\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0435...';
        try {
            const method = editing.id ? 'PUT' : 'POST';
            const endpoint = `/admin-api/classifiers/${encodeURIComponent(editing.type)}${editing.id ? `/${encodeURIComponent(editing.id)}` : ''}`;
            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: form.elements.code.value.trim(), title: form.elements.title.value.trim() })
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || 'Could not save classifier entry.');
            closeModal();
            await window.loadForKey('directions');
        } catch (error) {
            message.textContent = error.message;
            message.classList.add('is-error');
        } finally {
            saveButton.disabled = false;
        }
    });
});
