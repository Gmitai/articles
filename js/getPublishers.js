getPublishers();

async function getPublishers(){
    const response = await fetch("/getPublishers");
    const data = await response.json();
    let publishers = [];
    data.forEach(publisher => {
        publishers.push(`<option value="${publisher.id}">${publisher.title_tj}</option>`);
    });
    document.getElementById("PublisherList").innerHTML =publishers.join("\n");

}