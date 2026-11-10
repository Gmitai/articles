
function getFrmId() {
    const frmId = localStorage.getItem('frmId');
    return frmId != null ? Number(frmId) : -1;
}

function getRowId() {
    const rowId = localStorage.getItem('rowId');
    return rowId != null ? Number(rowId) : 0;
}

function loadCities() {
    return fetch("/loadDt/getCities")
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

function loadAuthorData(rowId) {
    rowId = Number(rowId);

    if (rowId <= 0) return;

    fetch(`/loadDt/getAuthorById?id=${encodeURIComponent(rowId)}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("rowId").value = data.id || '';
            document.getElementById("name").value = data.fullName || '';
            document.getElementById("birthDate").value = data.birthDate || '';
            document.getElementById("phoneNumber").value = data.mobilePhone || '';
            document.getElementById("city_List").value = data.cityId || '';
            document.getElementById("address").value = data.address || '';
        })
        .catch(err => console.error("Ошибка при загрузке автора:", err));
}

function submitAuthorForm() {
    const rowId = document.getElementById("rowId").value;
    const name = document.getElementById("name").value;
    const birthDate = document.getElementById("birthDate").value;
    const phone = document.getElementById("phoneNumber").value;
    const cityId = document.getElementById("city_List").value;
    const address = document.getElementById("address").value;

    const [lastName, firstName, familyName] = name.split(' ');

    fetch('/updateAuthor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            rowId,
            lastName,
            firstName,
            familyName,
            birthDate,
            phone,
            cityId,
            address
        })
    })
        .then(async res => {
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Не удалось обновить автора.');
            return result;
        })
        .then(resp => {
            alert(resp.message || "Автор обновлен!");

            if (typeof window.notifyAdminFormSaved === 'function') {
                window.notifyAdminFormSaved();
            } else {
                window.parent.closeIframe(1);
            }
        })
        .catch(err => {
            console.error(err);
            alert(err.message || 'Не удалось обновить автора.');
        });
}

function refreshAuthorForm() {
    const rowId = getRowId();

    if (rowId <= 0) return;

    loadCities().then(() => {
        loadAuthorData(rowId);
    });
}

let lastRowId = 0;

function checkRowIdChange() {
    const currentRowId = getRowId();

    if (currentRowId > 0 && currentRowId !== lastRowId) {
        lastRowId = currentRowId;
        refreshAuthorForm();
    }
}

setInterval(checkRowIdChange, 100);

refreshAuthorForm();

