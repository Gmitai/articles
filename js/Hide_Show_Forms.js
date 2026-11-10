
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
    frame.contentWindow.location.reload();
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

window.addEventListener('message', async event => {
    if (event.origin !== window.location.origin || !event.data?.type) return;

    const iframeEntries = [
        ['mIframe1', 0], ['mIframe2', 1], ['mIframe3', 2], ['mIframe4', 4],
        ['meIframe1', 0], ['meIframe2', 1], ['meIframe3', 2], ['meIframe4', 4]
    ];
    const sourceEntry = iframeEntries.find(([id]) =>
        document.getElementById(id)?.contentWindow === event.source
    );
    if (!sourceEntry) return;

    const [iframeId, formId] = sourceEntry;
    if (event.data.type === 'admin-form-outside-click') {
        closeIframe(formId);
        return;
    }
    if (event.data.type !== 'admin-form-saved') return;

    const active = document.querySelector('.nav button.active');
    if (active && typeof window.loadForKey === 'function') {
        await window.loadForKey(active.dataset.key);
    }
    document.getElementById(iframeId).style.display = 'none';
    localStorage.removeItem('rowId');
});

