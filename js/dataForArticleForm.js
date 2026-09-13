/**
 *
 * @param {number|string} rowId
 */
function loadArticleData(rowId) {
    if (!rowId) return;

    const rowInput = document.getElementById("rowId");
    if (rowInput) rowInput.value = rowId;

    fetch(`/loadDt/getArticleById?id=${rowId}`)
        .then(res => res.json())

        .then(data => {
            if (!data) return;


            document.getElementById("title").value = data.title_tj || '';
            document.getElementById("pageCount").value = data.pagesCount || '';


            if (data.publishYear) {
                const d = new Date(data.publishYear);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                document.getElementById("yearOfPublish").value = `${year}-${month}-${day}`;
            }


            document.getElementById("PublisherList").value = data.publisherId || '';


            if (data.directionId) {


                setTimeout(() => {

                    const radio = document.querySelector(
                        `.tree-radio[value="${data.directionId}"]`
                    );

                    if (radio) {

                        radio.checked = true;


                        const li = radio.closest("li");

                        if (li) {
                            li.classList.add("selected");
                        }


                        let parent = li.parentElement;

                        while (parent) {

                            if (parent.tagName === "UL") {
                                parent.classList.remove("hidden");
                            }

                            const parentLi = parent.closest("li");

                            if (parentLi) {

                                const toggle = parentLi.querySelector(":scope > .toggle");

                                if (toggle) {
                                    toggle.textContent = "−";
                                    toggle.dataset.state = "open";
                                }
                            }

                            parent = parentLi?.parentElement;
                        }
                    }

                }, 300);
            }

            if (data.authors && window.setSelectedAuthors) {
                setSelectedAuthors(data.authors);
            }

        })
        .catch(err => console.error("Ошибка при загрузке статьи:", err));

}


document.addEventListener("DOMContentLoaded", function () {
    const rowId = JSON.parse(localStorage.getItem('rowId'));
    if (rowId) {
        loadArticleData(rowId);
    }
});