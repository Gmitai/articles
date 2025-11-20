const form_layer = document.querySelector(".form_overlay");

showForm();
hideForm();

function showForm()
{
    form_layer.style.display = "block";
}

function hideForm()
{
    form_layer.style.display = "none";
}

form_layer.addEventListener("click", function(event){
    if (event.target===form_layer){
        hideForm();
    }
});
