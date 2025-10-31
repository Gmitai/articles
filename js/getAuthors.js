getAuthors();

async function getAuthors(){
    const response = await fetch("/getPublishers");
    const data = await response.json();
    let authors = [];
    data.forEach(publisher => {
        publishers.push(`<option value="${publisher.id}">${publisher.title_tj}</option>`);
    });
    document.getElementById("PublisherList").innerHTML =publishers.join("\n");
    console.log(data);
}