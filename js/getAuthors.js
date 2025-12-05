getAuthors();

async function getAuthors(){
    const response = await fetch("/getAuthors");
    const data = await response.json();
    let authors = [];
    data.forEach(author => {
        authors.push(`<label><input type="checkbox" name="authors" value="${author.id}" required>${author.lastName}</label>`);
    });
    document.getElementById("dropdown").innerHTML = authors.join("\n");
    document.getElementById("selected-values").value = localStorage.getItem('rowId');
}