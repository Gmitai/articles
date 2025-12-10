function getFrmId() {
    const frmId = localStorage.getItem('frmId');
    return frmId != null ? frmId : -1;
}

function getRowId() {
    const rowId = localStorage.getItem('rowId');
    return rowId != null ? rowId : -1;
}

function loadCities() {
    return fetch("/getCities")
        .then(res => res.json())
        .then(cities => {
            const cityList = document.getElementById("city_List");
            cityList.innerHTML = ''; // очищаем перед добавлением
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

    fetch(`/getPublisherById?id=${rowId}`)
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
        .then(res => res.json())
        .then(resp => {
            alert(resp.message || "Редакция обновлена!");
            window.parent.closeIframe(1);
        })
        .catch(err => console.error(err));
}


function refreshPublisherForm() {
    const rowId = getRowId();
    if (!rowId) return;
    loadCities().then(() => {
        loadPublisherData(rowId);
    });
}

// Автоматическое обновление формы при изменении rowId
let lastRowId = null;

function checkRowIdChange() {
    const currentRowId = getRowId();
    if (currentRowId && currentRowId !== lastRowId) {
        lastRowId = currentRowId;
        refreshPublisherForm();
    }
}

// Проверяем каждые 500 мс
setInterval(checkRowIdChange, 100);

// И сразу при загрузке страницы
refreshPublisherForm();
