document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('addUserModal');
    const form = document.getElementById('addUserForm');
    const message = document.getElementById('addUserMessage');
    const closeButton = document.getElementById('closeAddUserModal');
    const title = document.getElementById('addUserTitle');
    const passwordInput = document.getElementById('adminUserPassword');
    let editingUserId = null;
    const pendingUserDeletes = new Set();

    function closeModal() {
        modal.hidden = true;
        form.reset();
        message.textContent = '';
        message.className = 'admin-user-message';
        editingUserId = null;
        passwordInput.required = true;
        passwordInput.placeholder = '';
        title.textContent = 'Добавить пользователя';
        form.querySelector('[type="submit"]').textContent = 'Создать пользователя';
    }

    window.editAdminUser = async userId => {
        message.textContent = 'Загружаю данные…';
        modal.hidden = false;
        try {
            const response = await fetch(`/admin-api/users/${encodeURIComponent(userId)}`);
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Не удалось загрузить пользователя');
            }

            const user = result.user;
            editingUserId = user.id;
            form.elements.eMail.value = user.eMail || '';
            form.elements.login.value = user.login || '';
            form.elements.password.value = '';
            form.elements.firstName.value = user.firstName || '';
            form.elements.lastName.value = user.lastName || '';
            form.elements.familyName.value = user.familyName || '';
            form.elements.pseudonym.value = user.pseudonym || '';
            form.elements.role.value = user.role || 'user';
            passwordInput.required = false;
            passwordInput.placeholder = 'Оставьте пустым, чтобы не менять';
            title.textContent = 'Редактировать пользователя';
            form.querySelector('[type="submit"]').textContent = 'Сохранить изменения';
            message.textContent = '';
        } catch (error) {
            message.textContent = error.message;
            message.classList.add('is-error');
        }
    };

    window.deleteAdminUser = async (userId, userName) => {
        const requestKey = String(userId);
        if (pendingUserDeletes.has(requestKey)) return;
        pendingUserDeletes.add(requestKey);
        if (!confirm(`Удалить пользователя «${userName}»? Это действие нельзя отменить.`)) {
            pendingUserDeletes.delete(requestKey);
            return;
        }
        try {
            const response = await fetch(`/admin-api/users/${encodeURIComponent(userId)}`, {
                method: 'DELETE'
            });
            if (response.status === 404) {
                if (typeof loadForKey === 'function') await loadForKey('users');
                return;
            }
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Не удалось удалить пользователя');
            }
            if (typeof loadForKey === 'function') loadForKey('users');
        } catch (error) {
            alert(error.message);
        } finally {
            pendingUserDeletes.delete(requestKey);
        }
    };

    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', event => {
        if (event.target === modal) closeModal();
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const submitButton = form.querySelector('[type="submit"]');
        submitButton.disabled = true;
        message.textContent = 'Создаю пользователя…';
        const wasEditing = Boolean(editingUserId);

        try {
            const payload = Object.fromEntries(new FormData(form).entries());
            const response = await fetch(
                editingUserId
                    ? `/admin-api/users/${encodeURIComponent(editingUserId)}`
                    : '/admin-api/users',
                {
                method: editingUserId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
                }
            );
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Не удалось создать пользователя');
            }

            closeModal();
            if (typeof loadForKey === 'function') loadForKey('users');
            alert(wasEditing ? 'Данные пользователя обновлены' : 'Пользователь добавлен');
        } catch (error) {
            message.textContent = error.message;
            message.classList.add('is-error');
        } finally {
            submitButton.disabled = false;
        }
    });
});
