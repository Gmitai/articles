getAuthors();

async function getAuthors(){
    const response = await fetch("/getAuthors");
    const data = await response.json();
    let authors = [];
    data.forEach(author => {
        authors.push(`<option value="${author.id}">${author.lastName}</option>`);
    });
    document.getElementById("authorsList").innerHTML =authors.join("\n");
    console.log(data);
}