const forms = [
    "#mIframe1",
    "#mIframe2",
    "#mIframe3"
];
const eforms = [
    "#meIframe1",
    "#meIframe2",
    "#meIframe3"
];
let frmId = 0;
let article_form_layer = document.querySelector(forms[frmId]);
let earticle_form_layer = document.querySelector(eforms[frmId]);
let editMode = false;

function showForm(fId, rowId=0) {
    if (fId >= 0) {

        if (rowId>0){
            article_form_layer=document.querySelector(eforms[fId]);
            localStorage.setItem('rowId', JSON.stringify(rowId));
            editMode=true;
        }
        else {
            article_form_layer=document.querySelector(forms[fId]);
            editMode=false;
        }
        if(article_form_layer){
            article_form_layer.style.display = "block";
            frmId = fId;

        }
    }
}

function closeIframe(fId)
{
    const frame = editMode? document.querySelector(eforms[fId]): document.querySelector(forms[fId]);
    if (frame) frame.style.display='none';
}

