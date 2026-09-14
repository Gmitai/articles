function loadArticleData(rowId) {
    if (!rowId) {
        return;
    }

    const rowInput = document.getElementById("rowId");

    if (rowInput) {
        rowInput.value = rowId;
    }

    fetch(`/loadDt/getArticleById?id=${encodeURIComponent(rowId)}`)
        .then(async response => {
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || `Ошибка сервера: ${response.status}`
                );
            }

            return data;
        })
        .then(data => {
            if (!data) {
                return;
            }

            const title = document.getElementById("title");
            const pageCount = document.getElementById("pageCount");
            const yearOfPublish = document.getElementById("yearOfPublish");
            const publisherList = document.getElementById("PublisherList");

            if (title) {
                title.value = data.title_tj || '';
            }

            if (pageCount) {
                pageCount.value = data.pagesCount || '';
            }

            if (yearOfPublish && data.publishYear) {
                const date = new Date(data.publishYear);

                if (!isNaN(date.getTime())) {
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();

                    yearOfPublish.value =
                        `${year}-${month}-${day}`;
                }
            }

            if (publisherList) {
                publisherList.value = data.publisherId || '';
            }

            if (data.directionId) {

                setTimeout(() => {

                    const radio = document.querySelector(
                        `.tree-radio[value="${data.directionId}"]`
                    );

                    if (!radio) {
                        return;
                    }

                    radio.checked = true;

                    const li = radio.closest("li");

                    if (li) {
                        li.classList.add("selected");

                        let parent = li.parentElement;

                        while (parent) {

                            if (parent.tagName === "UL") {
                                parent.classList.remove("hidden");
                            }

                            const parentLi =
                                parent.closest("li");

                            if (parentLi) {

                                const toggle =
                                    parentLi.querySelector(
                                        ":scope > .toggle"
                                    );

                                if (toggle) {
                                    toggle.textContent = "−";
                                    toggle.dataset.state = "open";
                                }
                            }

                            parent =
                                parentLi
                                    ? parentLi.parentElement
                                    : null;
                        }
                    }

                }, 300);
            }

            if (
                data.authors &&
                typeof window.setSelectedAuthors === "function"
            ) {
                window.setSelectedAuthors(data.authors);
            }

        })
        .catch(error => {
            console.error(
                "Ошибка при загрузке статьи:",
                error
            );
        });
}

/*document.addEventListener("DOMContentLoaded", () => {

    const savedRowId =
        localStorage.getItem("rowId");

    if (!savedRowId) {
        return;
    }

    let rowId;

    try {
        rowId = JSON.parse(savedRowId);
    } catch {
        rowId = savedRowId;
    }

    if (rowId) {
        loadArticleData(rowId);
    }

});*/