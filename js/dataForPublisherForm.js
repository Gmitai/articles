function getFrmId() {
    const frmId = localStorage.getItem('frmId');
    return frmId != null ? frmId : -1;
}

function getRowId() {
    const rowId = localStorage.getItem('rowId');
    return rowId != null ? rowId : -1;
}

function loadCities() {
    return fetch('/loadDt/getCities')
        .then(res => res.json())
        .then(cities => {
            const cityList = document.getElementById("city_List");
            cityList.innerHTML = '';
            cities.forEach(c => {
                const opt = document.createElement("option");
                opt.value = c.id;
                opt.textContent = c.title;
                cityList.appendChild(opt);
            });
        });
}

function loadPublisherData(rowId) {
    if (!rowId) return;

    fetch(`/loadDt/getPublisherById?id=${rowId}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("rowId").value = data.id;
            document.getElementById("publisherName").value = data.title_tj || '';
            document.getElementById("city_List").value = data.cityId || '';
            document.getElementById("address").value = data.address || '';
        })
        .catch(err => console.error("Ошибка при загрузке издателя:", err));
}

function submitPublisherForm() {
    const rowId = document.getElementById("rowId").value;
    const publisherName = document.getElementById("publisherName").value;
    const selCity = document.getElementById("city_List").value;
    const address = document.getElementById("address").value;

    fetch('/updatePublisher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowId, publisherName, selCity, address })
    })
        .then(async res => {
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Не удалось обновить издательство.');
            return result;
        })
        .then(resp => {
            alert(resp.message || "Редакция обновлена!");

            if (typeof window.notifyAdminFormSaved === 'function') {
                window.notifyAdminFormSaved();
            } else {
                window.parent.closeIframe(2);
            }
        })
        .catch(err => {
            console.error(err);
            alert(err.message || 'Не удалось обновить издательство.');
        });
}


function refreshPublisherForm() {
    const rowId = getRowId();
    if (!rowId) return;
    loadCities().then(() => {
        loadPublisherData(rowId);
    });
}


let lastRowId = null;

function checkRowIdChange() {
    const currentRowId = getRowId();
    if (currentRowId && currentRowId !== lastRowId) {
        lastRowId = currentRowId;
        refreshPublisherForm();
    }
}


setInterval(checkRowIdChange, 100);


refreshPublisherForm();
