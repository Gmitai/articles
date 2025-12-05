// Получаем frmId и rowId из localStorage
function getFrmId() {
    let frmId = localStorage.getItem('frmId');
    return frmId != null ? frmId : -1;
}

function getRowId() {
    let rowId = localStorage.getItem('rowId');
    return rowId != null ? rowId : -1;
}

// Загружаем список городов
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

// Загружаем данные автора по ID
function loadAuthorData(rowId) {
    if (!rowId) return;

    fetch(`/getAuthorById?id=${rowId}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("rowId").value = data.id;
            document.getElementById("name").value = data.fullName || '';
            document.getElementById("birthDate").value = data.birthDate || '';
            document.getElementById("phoneNumber").value = data.mobilePhone || '';
            document.getElementById("city_List").value = data.cityId || '';
            document.getElementById("address").value = data.address || '';
        })
        .catch(err => console.error("Ошибка при загрузке автора:", err));
}

// Отправка формы
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
        body: JSON.stringify({ rowId, lastName, firstName, familyName, birthDate, phone, cityId, address })
    })
        .then(res => res.json())
        .then(resp => {
            alert(resp.message || "Автор обновлен!");
            window.parent.closeIframe(1); // закрываем iframe после сохранения
        })
        .catch(err => console.error(err));
}

// Основная функция для обновления данных формы
function refreshAuthorForm() {
    const rowId = getRowId();
    if (!rowId) return;
    loadCities().then(() => {
        loadAuthorData(rowId);
    });
}

refreshAuthorForm(); // сразу при загрузке


