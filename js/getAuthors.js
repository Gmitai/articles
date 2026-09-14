getAuthors();

async function getAuthors() {
    try {
        const response = await fetch("/loadDt/getAuthors");

        if (!response.ok) {
            throw new Error(`Ошибка загрузки авторов: ${response.status}`);
        }

        const data = await response.json();

        const authors = [];

        data.forEach(author => {
            authors.push(`
                <label>
                    <input
                        type="checkbox"
                        name="authors"
                        value="${author.id}"
                    >
                    ${author.lastName}
                </label>
            `);
        });

        const dropdown = document.getElementById("dropdown");

        if (dropdown) {
            dropdown.innerHTML = authors.join("\n");
        }

    } catch (error) {
        console.error("Ошибка загрузки авторов:", error);
    }
}