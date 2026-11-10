
function getRowId() {
    const rowId = localStorage.getItem('rowId');
    return rowId != null ? Number(rowId) : 0;
}
function getFrmId() {
    const frmId = localStorage.getItem('frmId');
    return frmId != null ? Number(frmId) : -1;
}
function loadArticleData(rowId) {
    rowId = Number(rowId);
    if (rowId <= 0) return;
    const rowInput = document.getElementById("rowId");
    if (rowInput) rowInput.value = rowId;
    fetch(`/loadDt/getArticleById?id=${encodeURIComponent(rowId)}`)
        .then(async response => {
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Ошибка сервера: ${response.status}`);
            return data;
        })
        .then(data => {
            if (!data) return;
            const title = document.getElementById("title");
            const pageCount = document.getElementById("pageCount");
            const yearOfPublish = document.getElementById("yearOfPublish");
            const publisherList = document.getElementById("PublisherList");
            if (title) title.value = data.title_tj || '';
            if (pageCount) pageCount.value = data.pagesCount || '';
            if (yearOfPublish && data.publishYear) {
                const date = new Date(data.publishYear);
                if (!isNaN(date.getTime())) {
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    yearOfPublish.value = `${year}-${month}-${day}`;
                }
            }
            if (typeof window.setPublisherSelection === "function") {
                window.setPublisherSelection(data.publisherId);
            } else if (publisherList) {
                publisherList.value = data.publisherId || '';
            }
            if (data.directionId) {
                setTimeout(() => {
                    if (typeof window.selectUdcDirection === "function" && window.selectUdcDirection(data.directionId)) return;
                    const radio = document.querySelector(`.tree-radio[value="${data.directionId}"]`);
                    if (!radio) return;
                    radio.checked = true;
                    const li = radio.closest("li");
                    if (li) {
                        li.classList.add("selected");
                        let parent = li.parentElement;
                        while (parent) {
                            if (parent.tagName === "UL") parent.classList.remove("hidden");
                            const parentLi = parent.closest("li");
                            if (parentLi) {
                                const toggle = parentLi.querySelector(":scope > .toggle");
                                if (toggle) {
                                    toggle.textContent = "−";
                                    toggle.dataset.state = "open";
                                }
                            }
                            parent = parentLi ? parentLi.parentElement : null;
                        }
                    }
                    const directionInput = document.getElementById("udcSearchInput");
                    if (directionInput) directionInput.value = radio.closest("li")?.textContent.trim().split(/\s+/)[0] || "";
                }, 300);
            }
            if (data.authors && typeof window.setSelectedAuthors === "function") {
                window.setSelectedAuthors(data.authors);
            }
        })
        .catch(error => console.error("Ошибка при загрузке статьи:", error));
}
let lastRowId = 0;
function checkRowIdChange() {
    const currentRowId = getRowId();
    if (currentRowId > 0 && currentRowId !== lastRowId) {
        lastRowId = currentRowId;
        loadArticleData(currentRowId);
    }
}
setInterval(checkRowIdChange, 100);
const initialRowId = getRowId();
if (initialRowId > 0) {
    lastRowId = initialRowId;
    loadArticleData(initialRowId);
}
document.getElementById("editForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    try {
        const formData = new FormData(this);
        formData.set("udcCode", (document.getElementById("udcSearchInput")?.value || "").trim());
        const selectedBookFile = document.getElementById("fileUpload")?.files?.[0];
        if (selectedBookFile && !/\.pdf$/i.test(selectedBookFile.name) &&
            !window.confirm('Файл не в PDF. Конвертировать его в PDF? Нажмите «Отмена», чтобы сохранить исходный файл без конвертации.')) {
            formData.set("keepOriginal", "true");
        }
        const response = await fetch("/updateArticle", {
            method: "POST",
            body: formData
        });
        const text = await response.text();
        if (!response.ok) {
            throw new Error(text || "Ошибка обновления статьи");
        }
        alert(text || "Статья успешно обновлена!");
        if (typeof window.notifyAdminFormSaved === "function") {
            window.notifyAdminFormSaved();
        }
    } catch (error) {
        console.error("Ошибка обновления статьи:", error);
        alert(error.message);
    }
});

