
const forms = {
    0: "#mIframe1",
    1: "#mIframe2",
    2: "#mIframe3",
    4: "#mIframe4"
};
const eforms = {
    0: "#meIframe1",
    1: "#meIframe2",
    2: "#meIframe3",
    4: "#meIframe4"
};
let frmId = 0;
let editMode = false;

function getMinimizedFormsDock() {
    let dock = document.getElementById('minimizedFormsDock');
    if (!dock) {
        dock = document.createElement('div');
        dock.id = 'minimizedFormsDock';
        dock.className = 'minimized-forms-dock';
        dock.setAttribute('role', 'toolbar');
        dock.setAttribute('aria-label', 'Свернутые формы');
        document.body.appendChild(dock);
    }
    return dock;
}

function removeMinimizedModal(modalId) {
    const dock = document.getElementById('minimizedFormsDock');
    dock?.querySelector(`[data-minimized-modal="${modalId}"]`)?.remove();
    if (dock && dock.children.length === 0) dock.remove();
    updateAddButtonState();
}

window.minimizeAdminModal = (modalId, label) => {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const dock = getMinimizedFormsDock();
    if (!dock.querySelector(`[data-minimized-modal="${modalId}"]`)) {
        const restoreButton = document.createElement('button');
        restoreButton.type = 'button';
        restoreButton.className = 'minimized-form-restore';
        restoreButton.dataset.minimizedModal = modalId;
        restoreButton.textContent = `Развернуть: ${label || 'Форма'}`;
        restoreButton.addEventListener('click', () => {
            modal.hidden = false;
            removeMinimizedModal(modalId);
        });
        dock.appendChild(restoreButton);
    }
    modal.hidden = true;
    updateAddButtonState();
};

function hasMinimizedForms() {
    return Boolean(document.querySelector('#minimizedFormsDock .minimized-form-restore'));
}

function updateAddButtonState() {
    const minimized = hasMinimizedForms();
    const addButton = document.getElementById('add');
    if (addButton) {
        addButton.disabled = minimized;
        addButton.setAttribute('aria-disabled', String(minimized));
        addButton.title = minimized ? 'Сначала разверните или закройте свернутую форму' : '';
    }

    document.querySelectorAll('.admin-record-edit-button').forEach(button => {
        if (!button.dataset.enabledTitle) button.dataset.enabledTitle = button.title || 'Редактировать';
        button.disabled = minimized;
        button.setAttribute('aria-disabled', String(minimized));
        button.title = minimized ? 'Сначала разверните свернутую форму' : button.dataset.enabledTitle;
    });
}

window.updateMinimizedActionButtons = updateAddButtonState;
window.hasMinimizedForms = hasMinimizedForms;

function removeMinimizedForm(iframeId) {
    const dock = document.getElementById('minimizedFormsDock');
    dock?.querySelector(`[data-minimized-frame="${iframeId}"]`)?.remove();
    if (dock && dock.children.length === 0) dock.remove();
    updateAddButtonState();
}

function minimizeForm(iframeId, frame) {
    const dock = getMinimizedFormsDock();

    if (!dock.querySelector(`[data-minimized-frame="${iframeId}"]`)) {
        const title = frame.contentDocument?.querySelector('.form-container h2')?.textContent?.trim() || 'Форма';
        const restoreButton = document.createElement('button');
        restoreButton.type = 'button';
        restoreButton.className = 'minimized-form-restore';
        restoreButton.dataset.minimizedFrame = iframeId;
        restoreButton.textContent = `Развернуть: ${title}`;
        restoreButton.addEventListener('click', () => {
            frame.style.display = 'block';
            removeMinimizedForm(iframeId);
        });
        dock.appendChild(restoreButton);
    }
    frame.style.display = 'none';
    updateAddButtonState();
}

function showForm(fId, rowId = 0) {
    if (hasMinimizedForms()) return;
    fId = Number(fId);
    rowId = Number(rowId);
    let frame;
    if (rowId > 0) {
        frame = document.querySelector(eforms[fId]);
        editMode = true;
        localStorage.setItem("rowId", String(rowId));
    } else {
        frame = document.querySelector(forms[fId]);
        editMode = false;
        localStorage.removeItem("rowId");
    }
    if (!frame) {
        console.error("Форма не найдена:", fId, rowId);
        return;
    }
    frmId = fId;
    removeMinimizedForm(frame.id);
    localStorage.setItem("frmId", String(fId));
    frame.style.display = "block";
    frame.contentWindow.location.reload();
}
function closeIframe(fId, iframeId) {
    // Use the calling iframe when available: frmId is shared by every iframe
    // through localStorage and can point at a different form.
    const sourceFrame = iframeId ? document.getElementById(iframeId) : null;
    const normalizedFormId = Number(fId);
    const framesToClose = sourceFrame
        ? [sourceFrame]
        : [document.querySelector(eforms[normalizedFormId]), document.querySelector(forms[normalizedFormId])];
    framesToClose.filter(Boolean).forEach(frame => {
        frame.style.display = "none";
        removeMinimizedForm(frame.id);
    });
    localStorage.removeItem("rowId");
}
window.closeIframe = closeIframe;

window.addEventListener('message', async event => {
    if (event.origin !== window.location.origin || !event.data?.type) return;

    const iframeEntries = [
        ['mIframe1', 0], ['mIframe2', 1], ['mIframe3', 2], ['mIframe4', 4],
        ['meIframe1', 0], ['meIframe2', 1], ['meIframe3', 2], ['meIframe4', 4]
    ];
    const sourceEntry = iframeEntries.find(([id]) =>
        document.getElementById(id)?.contentWindow === event.source
    );
    if (!sourceEntry) return;

    const [iframeId, formId] = sourceEntry;
    const frame = document.getElementById(iframeId);
    if (event.data.type === 'admin-form-minimize') {
        minimizeForm(iframeId, frame);
        return;
    }
    if (event.data.type !== 'admin-form-saved') return;

    const active = document.querySelector('.nav button.active');
    if (active && typeof window.loadForKey === 'function') {
        await window.loadForKey(active.dataset.key);
    }
    frame.style.display = 'none';
    removeMinimizedForm(iframeId);
    localStorage.removeItem('rowId');
});

