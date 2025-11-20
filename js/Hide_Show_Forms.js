
const forms=[
    ".add_article_overlay",
    ".add_author_overlay",
    ".add_publisher_overlay"
];
let frmId=0;
let article_form_layer = document.querySelector(forms[frmId]);

hideForm();

function showForm(fId)
{
    if(fId>=0)
    {
        article_form_layer = document.querySelector(forms[fId]);
        article_form_layer.style.display = "block";
        frmId = fId;
    }
}

function hideForm()
{
    article_form_layer = document.querySelector(forms[frmId]);
    article_form_layer.style.display = "none";
    console.log(frmId);
}

article_form_layer.addEventListener("click", function(event){
    if (event.target===article_form_layer){
        hideForm();
    }
    console.log(event.target);
});
