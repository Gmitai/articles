getType();

async function getType() {
    const response = await fetch("/getType");
    const data = await response.json();
    let types = [];
    data.forEach(type => {
        types.push(`<option value="${type.id}">${type.title}</option>`);
    });
    document.getElementById("articleOrBook").innerHTML =types.join("\n");

}