
function getRowId() {
    const rowId = localStorage.getItem('rowId');
    return rowId != null ? Number(rowId) : 0;
}
function getFrmId() {
    const frmId = localStorage.getItem('frmId');
    return frmId != null ? Number(frmId) : -1;
}
async function loadDirections() {
    try {
        const response = await fetch('/loadDt/getDirections');
        if (!response.ok) {
            throw new Error('Ошибка загрузки классификаторов');
        }
        const directions = await response.json();
        const select = document.getElementById('parentId');
        if (!select) return;
        select.innerHTML = '<option value="">Нет</option>';
        directions.forEach(direction => {
            const option = document.createElement('option');
            option.value = direction.id;
            option.textContent = direction.name || '';
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка загрузки классификаторов:', error);
    }
}
async function loadDirectionData(rowId) {
    rowId = Number(rowId);
    if (rowId <= 0) return;
    try {
        const response = await fetch(`/loadDt/getDirectionById?id=${encodeURIComponent(rowId)}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Ошибка загрузки классификатора');
        }
        document.getElementById('rowId').value = data.id || '';
        document.getElementById('title').value = data.title_ru || '';
        document.getElementById('udc').value = data.udc || '';
        document.getElementById('parentId').value = data.parentId != null ? data.parentId : '';
        document.getElementById('formTitle').textContent = 'Редактирование классификатора';
        document.getElementById('submitBtn').textContent = 'Сохранить';
    } catch (error) {
        console.error('Ошибка загрузки классификатора:', error);
    }
}
async function resetDirectionForm() {
    const rowInput = document.getElementById('rowId');
    const titleInput = document.getElementById('title');
    const udcInput = document.getElementById('udc');
    const parentSelect = document.getElementById('parentId');
    const formTitle = document.getElementById('formTitle');
    const submitBtn = document.getElementById('submitBtn');
    if (rowInput) rowInput.value = '';
    if (titleInput) titleInput.value = '';
    if (udcInput) udcInput.value = '';
    if (parentSelect) parentSelect.value = '';
    if (formTitle) formTitle.textContent = 'Добавление классификатора';
    if (submitBtn) submitBtn.textContent = 'Добавить';
    await loadDirections();
}
window.addEventListener('message', event => {
    if (event.data && event.data.type === 'resetDirectionForm') {
        resetDirectionForm();
    }
});
async function refreshDirectionForm() {
    const rowId = getRowId();
    if (rowId <= 0) {
        await resetDirectionForm();
        return;
    }
    await loadDirections();
    await loadDirectionData(rowId);
}
let lastRowId = -1;
async function checkRowIdChange() {
    const currentRowId = getRowId();
    if (currentRowId !== lastRowId) {
        lastRowId = currentRowId;
        await refreshDirectionForm();
    }
}
setInterval(checkRowIdChange, 100);
refreshDirectionForm();
async function submitDirectionForm() {
    const rowId = document.getElementById('rowId').value;
    const title = document.getElementById('title').value.trim();
    const udc = document.getElementById('udc').value.trim();
    const parentId = document.getElementById('parentId').value;
    const isEdit = Number(rowId) > 0;
    try {
        const response = await fetch(isEdit ? '/updateDirection' : '/addDirection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rowId,
                title,
                udc,
                parentId: parentId || null
            })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || data.error || 'Ошибка сохранения');
        }
        alert(data.message);
        if (typeof window.notifyAdminFormSaved === 'function') {
            window.notifyAdminFormSaved();
        } else {
            window.parent.closeIframe(4);
        }
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert(error.message);
    }
}
