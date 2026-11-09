
const forms = {
    0: "#mIframe1",
    1: "#mIframe2",
    2: "#mIframe3",
    4: "#mIframe4"
};
const eforms = {
    0: "#meIframe1",
    1: "#meIframe2",
    2: "#meIframe3",
    4: "#meIframe4"
};
let frmId = 0;
let editMode = false;
function showForm(fId, rowId = 0) {
    fId = Number(fId);
    rowId = Number(rowId);
    let frame;
    if (rowId > 0) {
        frame = document.querySelector(eforms[fId]);
        editMode = true;
        localStorage.setItem("rowId", String(rowId));
    } else {
        frame = document.querySelector(forms[fId]);
        editMode = false;
        localStorage.removeItem("rowId");
    }
    if (!frame) {
        console.error("Форма не найдена:", fId, rowId);
        return;
    }
    frmId = fId;
    localStorage.setItem("frmId", String(fId));
    frame.style.display = "block";
    if (fId === 4 && rowId === 0) {
        frame.contentWindow.postMessage({
            type: "resetDirectionForm"
        }, "*");
    }
}
function closeIframe(fId) {
    fId = Number(fId);
    const editFrame = document.querySelector(eforms[fId]);
    const addFrame = document.querySelector(forms[fId]);
    if (editFrame) {
        editFrame.style.display = "none";
    }
    if (addFrame) {
        addFrame.style.display = "none";
    }
    localStorage.removeItem("rowId");
}

