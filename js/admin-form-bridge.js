(function () {
    function sendToParent(type) {
        if (window.parent === window) return;
        window.parent.postMessage({ type }, window.location.origin);
    }

    window.notifyAdminFormSaved = function () {
        sendToParent('admin-form-saved');
    };

    const formContainer = document.querySelector('.form-container');
    const form = formContainer?.querySelector('form');
    if (formContainer && form && !formContainer.querySelector('.form-minimize-button')) {
        const minimizeButton = document.createElement('button');
        minimizeButton.type = 'button';
        minimizeButton.className = 'form-minimize-button';
        minimizeButton.textContent = '-';
        minimizeButton.title = 'Свернуть форму';
        minimizeButton.setAttribute('aria-label', 'Свернуть форму и вернуться к сайту');
        minimizeButton.addEventListener('click', () => sendToParent('admin-form-minimize'));
        formContainer.appendChild(minimizeButton);
    }

})();
