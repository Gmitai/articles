getCities();

async function getCities() {
    const response = await fetch("/loadDt/getCities");
    const data = await response.json();
    let cities = [];
    data.forEach(city => {
        cities.push(`<option value="${city.id}">${city.title}</option>`);
    });
    document.getElementById("city_List").innerHTML = cities.join("\n");

}