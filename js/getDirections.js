const el = document.getElementById("directionsList");
if (el) {
    getDirections().then(directions => {
        el.innerHTML = directions;
    });
}

async function getDirections() {
    const response = await fetch("/loadDt/getDirections");
    const data = await response.json();
    let directions = [];
    data.forEach(direction => {
        directions.push(`<option value="${direction.id}">${direction.title_ru}</option>`);
    });
    return directions.join("\n");
}
