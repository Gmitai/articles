const forms = [
    "#mIframe1",
    "#mIframe2",
    "#mIframe3",

];
const eforms = [
    "#meIframe1",
    "#meIframe2",
    "#meIframe3",
    "#meIframe4",
    "#meIframe5"
];
let frmId = 0;

let editMode = false;

function showForm(fId, rowId = 0) {
    let articleFormLayer;
    if (rowId > 0) {
        articleFormLayer = document.querySelector(eforms[fId]);
        localStorage.setItem('rowId', JSON.stringify(rowId));
        editMode = true;
    } else {
        articleFormLayer = document.querySelector(forms[fId]);
        editMode = false;
    }

    if (articleFormLayer) {
        articleFormLayer.style.display = "block";
        frmId = fId;

        if (editMode) {
            // Пытаемся дождаться готовности DOM iframe
            const tryLoad = () => {
                const iframeDoc = articleFormLayer.contentDocument || articleFormLayer.contentWindow.document;
                if (iframeDoc.readyState === "complete") {
                    // Вызываем функцию внутри iframe
                    if (articleFormLayer.contentWindow.loadArticleData) {
                        articleFormLayer.contentWindow.loadArticleData(rowId);
                    }
                } else {
                    setTimeout(tryLoad, 50); // пробуем через 50ms
                }
            };
            tryLoad();
        }
    }
}

function closeIframe(fId)
{
    const frame = editMode? document.querySelector(eforms[fId]): document.querySelector(forms[fId]);
    if (frame) frame.style.display='none';
}