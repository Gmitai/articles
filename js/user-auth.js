document.addEventListener('DOMContentLoaded', () => {
    const registerBtn = document.getElementById('registerBtn');
    const loginBtn = document.getElementById('loginBtn');
    const profileContainer = document.getElementById('profileContainer');
    const profileBtn = document.getElementById('profileBtn');
    const profileImage = document.getElementById('profileImage');
    const profileName = document.getElementById('profileName');
    const menuLogoutBtn = document.getElementById('menuLogoutBtn');
    const menuProfileImage = document.getElementById('menuProfileImage');
    const menuProfileName = document.getElementById('menuProfileName');
    const menuProfileEmail = document.getElementById('menuProfileEmail');
    const registerModal = document.getElementById('registerModal');
    const loginModal = document.getElementById('loginModal');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const registerCity = document.getElementById('registerCity');
    const myProfileBtn = document.getElementById('myProfileBtn');
    const myBooksBtn = document.getElementById('myBooksBtn');
    const settingsBtn = document.getElementById('settingsBtn');


let adminBtn = document.getElementById('adminBtn');

if (!adminBtn && profileContainer) {
    adminBtn = document.createElement('button');
    adminBtn.id = 'adminBtn';
    adminBtn.type = 'button';
    adminBtn.textContent = 'Управление';
    adminBtn.hidden = true;

    adminBtn.style.cursor = 'pointer';

    profileContainer.parentNode.insertBefore(
        adminBtn,
        profileContainer
    );

    adminBtn.addEventListener('click', () => {
        window.location.href = '/admin';
    });
}

if (profileBtn && profileContainer) {
    profileBtn.addEventListener('click', event => {
        event.stopPropagation();
        profileContainer.classList.toggle('open');
    });
}

document.addEventListener('click', event => {
    if (profileContainer && !profileContainer.contains(event.target)) {
        profileContainer.classList.remove('open');
    }
});

if (myProfileBtn) {
    myProfileBtn.addEventListener('click', () => {
        profileContainer.classList.remove('open');
        window.location.href = '/profile.html';
    });
}

    if (myBooksBtn) {
        myBooksBtn.addEventListener('click', () => {
            profileContainer.classList.remove('open');
            window.location.href = '/my-books.html';
        });
    }

if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
        profileContainer.classList.remove('open');
        alert('Настройки профиля будут добавлены следующим шагом.');
    });
}

if (registerBtn) {
    registerBtn.addEventListener('click', () => {
        registerModal.style.display = 'flex';
        loadCities();
    });
}

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });
}

document.querySelectorAll('.close-btn').forEach(button => {
    button.addEventListener('click', () => {
        const modalId = button.dataset.close;
        const modal = document.getElementById(modalId);

        if (modal) {
            modal.style.display = 'none';
        }
    });
});

window.addEventListener('click', event => {
    if (registerModal && event.target === registerModal) {
        registerModal.style.display = 'none';
    }

    if (loginModal && event.target === loginModal) {
        loginModal.style.display = 'none';
    }
});

async function loadCities() {
    if (!registerCity) {
        return;
    }

    try {
        const response = await fetch('/auth/cities');

        if (!response.ok) {
            throw new Error('Не удалось загрузить города');
        }

        const cities = await response.json();

        registerCity.innerHTML = '<option value="">Выберите город</option>';

        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.id;
            option.textContent = city.title;
            registerCity.appendChild(option);
        });

    } catch (error) {
        console.error('Ошибка загрузки городов:', error);
        registerCity.innerHTML = '<option value="">Ошибка загрузки городов</option>';
    }
}

if (registerForm) {
    registerForm.addEventListener('submit', async event => {
        event.preventDefault();

        const formData = new FormData(registerForm);

        try {
            const response = await fetch('/auth/register', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.status === 409) {
                alert(data.message);
                return;
            }

            if (!response.ok || !data.success) {
                alert(data.message || 'Не удалось зарегистрироваться');
                return;
            }

            alert('Регистрация успешно завершена!');

            registerForm.reset();
            registerModal.style.display = 'none';

            await checkUser();

        } catch (error) {
            console.error('Ошибка регистрации:', error);
            alert('Не удалось подключиться к серверу');
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async event => {
        event.preventDefault();

        const login = loginForm.querySelector('[name="login"]').value.trim();
        const password = loginForm.querySelector('[name="password"]').value;

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    login,
                    password
                })
            });

            const data = await response.json();

            if (data.needRegister) {
                const register = confirm(data.message);

                if (register) {
                    loginModal.style.display = 'none';
                    registerModal.style.display = 'flex';

                    loadCities();

                    const registerLogin =
                        registerForm.querySelector('[name="login"]');

                    if (registerLogin) {
                        registerLogin.value = login;
                    }
                }

                return;
            }

            if (!response.ok || !data.success) {
                alert(data.message || 'Неверный логин или пароль');
                return;
            }

            alert('Вы успешно вошли в аккаунт');

            loginForm.reset();
            loginModal.style.display = 'none';

            updateAuthInterface(data.user);

        } catch (error) {
            console.error('Ошибка входа:', error);
            alert('Не удалось подключиться к серверу');
        }
    });
}

if (menuLogoutBtn) {
    menuLogoutBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/auth/logout', {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
                if (profileContainer) {
                    profileContainer.classList.remove('open');
                }

                updateAuthInterface(null);

                alert('Вы вышли из аккаунта');
            }

        } catch (error) {
            console.error('Ошибка выхода:', error);
            alert('Не удалось выполнить выход');
        }
    });
}

async function checkUser() {
    try {
        const response = await fetch('/auth/me');
        const data = await response.json();

        if (data.loggedIn) {
            updateAuthInterface(data.user);
        } else {
            updateAuthInterface(null);
        }

    } catch (error) {
        console.error('Ошибка проверки пользователя:', error);
    }
}

function updateAuthInterface(user) {
    if (user) {
        if (registerBtn) {
            registerBtn.hidden = true;
        }

        if (loginBtn) {
            loginBtn.hidden = true;
        }

        if (profileContainer) {
            profileContainer.hidden = false;
        }

        if (adminBtn) {
            adminBtn.hidden = user.role !== 'admin';
        }

        const displayName =
            user.firstName ||
            user.login ||
            'Пользователь';

        if (profileName) {
            profileName.textContent = displayName;
        }

        let photoUrl = '/icons/default-avatar.png';

        if (user.profilePhoto) {
            photoUrl =
                `/uploads/${encodeURIComponent(user.profilePhoto)}`;
        }

        if (profileImage) {
            profileImage.src = photoUrl;

            profileImage.onerror = () => {
                profileImage.src = '/icons/default-avatar.png';
            };
        }

        if (menuProfileImage) {
            menuProfileImage.src = photoUrl;

            menuProfileImage.onerror = () => {
                menuProfileImage.src = '/icons/default-avatar.png';
            };
        }

        const fullName = [
            user.lastName,
            user.firstName,
            user.familyName
        ].filter(Boolean).join(' ');

        if (menuProfileName) {
            menuProfileName.textContent =
                fullName ||
                user.login ||
                'Пользователь';
        }

        if (menuProfileEmail) {
            menuProfileEmail.textContent =
                user.eMail ||
                'Email не указан';
        }

    } else {
        if (registerBtn) {
            registerBtn.hidden = false;
        }

        if (loginBtn) {
            loginBtn.hidden = false;
        }

        if (profileContainer) {
            profileContainer.hidden = true;
            profileContainer.classList.remove('open');
        }

        if (adminBtn) {
            adminBtn.hidden = true;
        }

        if (profileName) {
            profileName.textContent = 'Профиль';
        }

        if (profileImage) {
            profileImage.src = '/icons/default-avatar.png';
        }

        if (menuProfileImage) {
            menuProfileImage.src = '/icons/default-avatar.png';
        }

        if (menuProfileName) {
            menuProfileName.textContent = 'Пользователь';
        }

        if (menuProfileEmail) {
            menuProfileEmail.textContent = 'Email не указан';
        }
    }
}

checkUser();




});
