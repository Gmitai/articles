loadTree();

async function loadTree() {
    const response = await fetch("/loadDt/getDirections");
    const items = await response.json();

    const treeData = buildTree(items);

    const el = document.getElementById("treeUDC");

    el.innerHTML = "";
    el.appendChild(renderTree(treeData));
}

function buildTree(items) {
    const map = {};
    const roots = [];

    items.forEach(item => {
        map[item.id] = {
            ...item,
            children: []
        };
    });

    items.forEach(item => {
        if (item.parentId == null) {
            roots.push(map[item.id]);
        } else {
            map[item.parentId]?.children.push(map[item.id]);
        }
    });

    return roots;
}

function renderTree(nodes) {
    const ul = document.createElement("ul");

    nodes.forEach(node => {
        const li = document.createElement("li");

        const hasChildren = node.children && node.children.length > 0;


        if (hasChildren) {
            const toggle = document.createElement("span");
            toggle.className = "toggle";
            toggle.textContent = "+";
            toggle.dataset.state = "closed";
            li.appendChild(toggle);
        } else {
            const spacer = document.createElement("span");
            spacer.className = "toggle-spacer";
            li.appendChild(spacer);
        }


        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "selDirect";
        radio.value = node.id;
        radio.className = "tree-radio";

        li.appendChild(radio);


        const text = document.createTextNode(` ${node.name}`);
        li.appendChild(text);


        if (hasChildren) {
            const childUl = renderTree(node.children);
            childUl.classList.add("hidden");
            li.appendChild(childUl);
        }

        ul.appendChild(li);
    });

    return ul;
}


document.addEventListener("click", function (e) {
    const toggle = e.target.closest(".toggle");
    if (!toggle) return;

    e.stopPropagation();

    const li = toggle.closest("li");

    const childUl = Array.from(li.children)
        .find(el => el.tagName === "UL");

    if (!childUl) return;

    const isClosed = toggle.dataset.state === "closed";

    if (isClosed) {
        childUl.classList.remove("hidden");
        toggle.textContent = "−";
        toggle.dataset.state = "open";
    } else {
        childUl.classList.add("hidden");
        toggle.textContent = "+";
        toggle.dataset.state = "closed";
    }
});


function getSelectedId() {
    const selected = document.querySelector(".tree-radio:checked");
    return selected ? selected.dataset.id : null;
}


const treeBtn = document.getElementById("treeToggleBtn");
const treeDropdown = document.getElementById("treeDropdown");

treeBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    treeDropdown.classList.toggle("hidden");
});

document.addEventListener("click", function (e) {
    if (!treeDropdown.contains(e.target) && !treeBtn.contains(e.target)) {
        treeDropdown.classList.add("hidden");
    }
});

document.addEventListener("change", function (e) {
    if (!e.target.classList.contains("tree-radio")) return;


    console.log("Selected ID:", e.target.dataset.id);


    document.querySelectorAll("li").forEach(li => {
        li.classList.remove("selected");
    });

    const li = e.target.closest("li");
    if (li) li.classList.add("selected");
});