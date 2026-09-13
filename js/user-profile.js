document.addEventListener('DOMContentLoaded', async () => {
    const defaultAvatar = '/icons/default-avatar.png';
    const profilePhoto = document.getElementById('profilePhoto');
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    const photoInput = document.getElementById('photoInput');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const profileView = document.getElementById('profileView');
    const editProfileForm = document.getElementById('editProfileForm');

    const profileFullName = document.getElementById('profileFullName');
    const profileEmail = document.getElementById('profileEmail');
    const profileLogin = document.getElementById('profileLogin');
    const profileFirstName = document.getElementById('profileFirstName');
    const profileLastName = document.getElementById('profileLastName');
    const profileFamilyName = document.getElementById('profileFamilyName');
    const profileBirthDate = document.getElementById('profileBirthDate');
    const profileMobilePhone = document.getElementById('profileMobilePhone');
    const profileCity = document.getElementById('profileCity');
    const profileAddress = document.getElementById('profileAddress');
    const profilePseudonym = document.getElementById('profilePseudonym');
    const profileEmailField = document.getElementById('profileEmailField');

    const editFirstName = document.getElementById('editFirstName');
    const editLastName = document.getElementById('editLastName');
    const editFamilyName = document.getElementById('editFamilyName');
    const editBirthDate = document.getElementById('editBirthDate');
    const editMobilePhone = document.getElementById('editMobilePhone');
    const editCity = document.getElementById('editCity');
    const editAddress = document.getElementById('editAddress');
    const editPseudonym = document.getElementById('editPseudonym');
    const editEmail = document.getElementById('editEmail');

    let currentUser = null;

    function getValue(value) {
        return value !== null && value !== undefined && value !== ''
            ? value
            : '—';
    }

    function formatDate(date) {
        if (!date) {
            return '—';
        }

        const value = String(date).substring(0, 10);
        const parts = value.split('-');

        if (parts.length !== 3) {
            return value;
        }

        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }

    function setPhoto(photo) {
        if (photo) {
            profilePhoto.src = `/uploads/${encodeURIComponent(photo)}`;
        } else {
            profilePhoto.src = defaultAvatar;
        }
    }

    function showProfile(user) {
        currentUser = user;

        const fullName = [
            user.lastName,
            user.firstName,
            user.familyName
        ].filter(Boolean).join(' ');

        profileFullName.textContent = fullName || user.login || 'Пользователь';
        profileEmail.textContent = getValue(user.eMail);
        profileLogin.textContent = getValue(user.login);
        profileFirstName.textContent = getValue(user.firstName);
        profileLastName.textContent = getValue(user.lastName);
        profileFamilyName.textContent = getValue(user.familyName);
        profileBirthDate.textContent = formatDate(user.birthDate);
        profileMobilePhone.textContent = getValue(user.mobilePhone);
        profileCity.textContent = getValue(user.city);
        profileAddress.textContent = getValue(user.address);
        profilePseudonym.textContent = getValue(user.pseudonym);
        profileEmailField.textContent = getValue(user.eMail);

        setPhoto(user.profilePhoto);
    }

    function fillEditForm(user) {
        editFirstName.value = user.firstName || '';
        editLastName.value = user.lastName || '';
        editFamilyName.value = user.familyName || '';
        editBirthDate.value = user.birthDate
            ? String(user.birthDate).substring(0, 10)
            : '';
        editMobilePhone.value = user.mobilePhone || '';
        editCity.value = user.cityId || '';
        editAddress.value = user.address || '';
        editPseudonym.value = user.pseudonym || '';
        editEmail.value = user.eMail || '';
    }

    async function loadCities() {
        try {
            const response = await fetch('/profile/cities');
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Не удалось загрузить города');
            }

            editCity.innerHTML = '<option value="">Выберите город</option>';

            data.cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.id;
                option.textContent = city.title;
                editCity.appendChild(option);
            });

            if (currentUser && currentUser.cityId) {
                editCity.value = currentUser.cityId;
            }
        } catch (error) {
            console.error('Ошибка загрузки городов:', error);
            editCity.innerHTML = '<option value="">Не удалось загрузить города</option>';
        }
    }

    function openEditMode() {
        fillEditForm(currentUser);
        profileView.hidden = true;
        editProfileForm.hidden = false;
        editProfileBtn.hidden = true;
    }

    function closeEditMode() {
        profileView.hidden = false;
        editProfileForm.hidden = true;
        editProfileBtn.hidden = false;
    }

    profilePhoto.onerror = () => {
        profilePhoto.onerror = null;
        profilePhoto.src = defaultAvatar;
    };

    try {
        const response = await fetch('/profile/me');

        if (response.status === 401) {
            window.location.href = '/';
            return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Не удалось загрузить профиль');
        }

        showProfile(data.user);
        await loadCities();
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        alert('Не удалось загрузить данные профиля');
    }

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            openEditMode();
        });
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            closeEditMode();
        });
    }

    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async event => {
            event.preventDefault();

            const saveButton = editProfileForm.querySelector('.save-button');
            saveButton.disabled = true;
            saveButton.textContent = 'Сохранение...';

            const data = {
                firstName: editFirstName.value.trim(),
                lastName: editLastName.value.trim(),
                familyName: editFamilyName.value.trim(),
                birthDate: editBirthDate.value,
                mobilePhone: editMobilePhone.value.trim(),
                cityId: editCity.value || null,
                address: editAddress.value.trim(),
                pseudonym: editPseudonym.value.trim(),
                eMail: editEmail.value.trim()
            };

            try {
                const response = await fetch('/profile/update', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    alert(result.message || 'Не удалось сохранить изменения');
                    return;
                }

                showProfile(result.user);
                closeEditMode();
                alert('Профиль успешно обновлён');
            } catch (error) {
                console.error('Ошибка сохранения профиля:', error);
                alert('Не удалось подключиться к серверу');
            } finally {
                saveButton.disabled = false;
                saveButton.textContent = 'Сохранить';
            }
        });
    }

    if (changePhotoBtn && photoInput) {
        changePhotoBtn.addEventListener('click', () => {
            photoInput.click();
        });

        photoInput.addEventListener('change', async () => {
            const file = photoInput.files[0];

            if (!file) {
                return;
            }

            if (!file.type.startsWith('image/')) {
                alert('Можно выбрать только изображение');
                photoInput.value = '';
                return;
            }

            const formData = new FormData();
            formData.append('profilePhoto', file);

            changePhotoBtn.disabled = true;
            changePhotoBtn.textContent = 'Загрузка...';

            try {
                const response = await fetch('/profile/photo', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    alert(data.message || 'Не удалось загрузить фото');
                    return;
                }

                showProfile(data.user);

                alert('Фото профиля успешно изменено');
            } catch (error) {
                console.error('Ошибка загрузки фото:', error);
                alert('Не удалось подключиться к серверу');
            } finally {
                changePhotoBtn.disabled = false;
                changePhotoBtn.textContent = 'Изменить фото';
                photoInput.value = '';
            }
        });
    }
});