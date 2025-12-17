/**
 * Загружает данные статьи по ID и заполняет форму
 * @param {number|string} rowId - ID статьи
 */
function loadArticleData(rowId) {
    if (!rowId) return;

    const rowInput = document.getElementById("rowId");
    if (rowInput) rowInput.value = rowId;

    fetch(`/getArticleById?id=${rowId}`)
        .then(res => res.json())

        .then(data => {
            if (!data) return;

            // Основные поля
            document.getElementById("title").value = data.title_tj || '';
            document.getElementById("pageCount").value = data.pagesCount || '';

            // Дата в формате YYYY-MM-DD для <input type="date">
            if (data.publishYear) {
                const d = new Date(data.publishYear);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                document.getElementById("yearOfPublish").value = `${year}-${month}-${day}`;
            }

            // Направления и издательство
            document.getElementById("directionsList").value = data.directionId || '';
            document.getElementById("PublisherList").value = data.publisherId || '';
            // Авторы в мультиселекте
            if (data.authors && window.setSelectedAuthors) {
                setSelectedAuthors(data.authors); // массив {id, name}
            }

        })
        .catch(err => console.error("Ошибка при загрузке статьи:", err));

}

// При загрузке страницы автоматически загружаем данные статьи
document.addEventListener("DOMContentLoaded", function () {
    const rowId = JSON.parse(localStorage.getItem('rowId'));
    if (rowId) {
        loadArticleData(rowId);
    }
});