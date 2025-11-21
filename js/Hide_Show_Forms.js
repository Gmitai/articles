const forms = [
    "#mIframe1",
    "#mIframe2",
    "#mIframe3"
];
let frmId = 0;
let article_form_layer = document.querySelector(forms[frmId]);

function showForm(fId) {
    if (fId >= 0) {

        article_form_layer = document.querySelector(forms[fId]);
        if(article_form_layer){
            console.log(article_form_layer);
            article_form_layer.style.display = "block";
            frmId = fId;
        }
    }
}

function closeIframe(fId)
{
    const frame = document.querySelector(forms[fId]);
    if (frame) frame.style.display='none';
}

