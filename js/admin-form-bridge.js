(function () {
    function sendToParent(type) {
        if (window.parent === window) return;
        window.parent.postMessage({ type }, window.location.origin);
    }

    window.notifyAdminFormSaved = function () {
        sendToParent('admin-form-saved');
    };

    document.addEventListener('click', event => {
        const formContainer = document.querySelector('.form-container');
        if (formContainer && !formContainer.contains(event.target)) {
            sendToParent('admin-form-outside-click');
        }
    });
})();
