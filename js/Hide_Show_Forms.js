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
            article_form_layer.style.display = "block";
            //document.querySelector('.modal-iframe').style.display = "block";
            frmId = fId;
        }
    }
}

function hideForm() {
    forms.forEach(selector => {
        const el = document.querySelector(selector);
        if(el) el.style.display = "none";
    });
}


forms.forEach(selector => {
    //alert("Кнопка внутри iframe нажата!");
    const el = document.querySelector(selector);
    if(el){
        el.addEventListener("click", function(event){
            if(event.target === el){
                hideForm();
            }
        });
    }
})
