const elPublisher = document.getElementById("PublisherList");
if (elPublisher) {
    getPublishers().then((publishers) => {
        elPublisher.innerHTML = publishers;
    });
}


async function getPublishers() {
    const response = await fetch("/loadDt/getPublishers");
    const data = await response.json();
    let publishers = [];
    data.forEach(publisher => {
        publishers.push(`<option value="${publisher.id}">${publisher.title_tj}</option>`);
    });
    return publishers.join("\n");
}