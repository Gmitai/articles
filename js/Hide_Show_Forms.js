const article_form_layer = document.querySelector(".add_article_overlay");

showForm();
hideForm();

function showForm()
{
    article_form_layer.style.display = "block";
}

function hideForm()
{
    article_form_layer.style.display = "none";
}

article_form_layer.addEventListener("click", function(event){
    if (event.target===article_form_layer){
        hideForm();
    }
});
