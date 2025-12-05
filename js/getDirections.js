getDirections();

async function getDirections() {
    const response = await fetch("/getDirections");
    const data = await response.json();
    let directions = [];
    data.forEach(direction => {
        directions.push(`<option value="${direction.id}">${direction.title_ru}</option>`);
    });
    document.getElementById("directionsList").innerHTML =directions.join("\n");

}