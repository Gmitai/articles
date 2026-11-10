const directionsById = new Map();
const udcSearchInput = document.getElementById("udcSearchInput");

loadTree();

async function loadTree() {
    try {
        const response = await fetch("/loadDt/getDirections");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const items = await response.json();
        items.forEach(item => directionsById.set(String(item.id), item));

        const suggestions = document.getElementById("udcSuggestions");
        if (suggestions) {
            suggestions.replaceChildren(...items
                .filter(item => item.udc)
                .map(item => {
                    const option = document.createElement("option");
                    option.value = item.udc;
                    option.label = item.title_ru || item.name || "";
                    return option;
                }));
        }

        const tree = document.getElementById("treeUDC");
        tree.replaceChildren(renderTree(buildTree(items)));
    } catch (error) {
        console.error("Не удалось загрузить список УДК:", error);
    }
}

function buildTree(items) {
    const map = {};
    const roots = [];
    items.forEach(item => { map[item.id] = { ...item, children: [] }; });
    items.forEach(item => {
        if (item.parentId == null) roots.push(map[item.id]);
        else map[item.parentId]?.children.push(map[item.id]);
    });
    return roots;
}

function renderTree(nodes) {
    const ul = document.createElement("ul");
    nodes.forEach(node => {
        const li = document.createElement("li");
        const hasChildren = node.children?.length > 0;
        const toggle = document.createElement("span");
        toggle.className = hasChildren ? "toggle" : "toggle-spacer";
        if (hasChildren) {
            toggle.textContent = "+";
            toggle.dataset.state = "closed";
        }
        li.appendChild(toggle);

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "selDirect";
        radio.value = node.id;
        radio.dataset.id = node.id;
        radio.className = "tree-radio";
        li.appendChild(radio);
        li.appendChild(document.createTextNode(` ${node.name}`));

        if (hasChildren) {
            const childUl = renderTree(node.children);
            childUl.classList.add("hidden");
            li.appendChild(childUl);
        }
        ul.appendChild(li);
    });
    return ul;
}

function expandToRadio(radio) {
    let parent = radio.closest("li")?.parentElement;
    while (parent) {
        if (parent.tagName === "UL") parent.classList.remove("hidden");
        const parentLi = parent.closest("li");
        if (!parentLi) break;
        const toggle = parentLi.querySelector(":scope > .toggle");
        if (toggle) {
            toggle.textContent = "−";
            toggle.dataset.state = "open";
        }
        parent = parentLi.parentElement;
    }
}

function selectUdcDirection(id) {
    const radio = document.querySelector(`.tree-radio[value="${CSS.escape(String(id))}"]`);
    if (!radio) return false;
    radio.checked = true;
    document.querySelectorAll(".tree li.selected").forEach(li => li.classList.remove("selected"));
    radio.closest("li")?.classList.add("selected");
    expandToRadio(radio);
    const direction = directionsById.get(String(id));
    if (udcSearchInput && direction?.udc) udcSearchInput.value = direction.udc;
    return true;
}
window.selectUdcDirection = selectUdcDirection;

document.addEventListener("click", event => {
    const toggle = event.target.closest(".toggle");
    if (!toggle) return;
    event.stopPropagation();
    const list = Array.from(toggle.closest("li").children).find(el => el.tagName === "UL");
    if (!list) return;
    const opening = toggle.dataset.state === "closed";
    list.classList.toggle("hidden", !opening);
    toggle.textContent = opening ? "−" : "+";
    toggle.dataset.state = opening ? "open" : "closed";
});

const treeBtn = document.getElementById("treeToggleBtn");
const treeDropdown = document.getElementById("treeDropdown");
treeBtn.addEventListener("click", event => {
    event.stopPropagation();
    treeDropdown.classList.toggle("hidden");
});
document.addEventListener("click", event => {
    if (!treeDropdown.contains(event.target) && !treeBtn.contains(event.target)) {
        treeDropdown.classList.add("hidden");
    }
});

udcSearchInput?.addEventListener("input", () => {
    const code = udcSearchInput.value.trim().toLocaleLowerCase();
    const match = [...directionsById.values()].find(item => String(item.udc || "").trim().toLocaleLowerCase() === code);
    if (match) {
        selectUdcDirection(match.id);
    } else {
        document.querySelectorAll(".tree-radio").forEach(radio => { radio.checked = false; });
        document.querySelectorAll(".tree li.selected").forEach(li => li.classList.remove("selected"));
    }
});

document.addEventListener("change", event => {
    if (!event.target.classList.contains("tree-radio")) return;
    const radio = event.target;
    document.querySelectorAll(".tree li.selected").forEach(li => li.classList.remove("selected"));
    radio.closest("li")?.classList.add("selected");
    const direction = directionsById.get(String(radio.value));
    if (udcSearchInput && direction?.udc) udcSearchInput.value = direction.udc;
});
