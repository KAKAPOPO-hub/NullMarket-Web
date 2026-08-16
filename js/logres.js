function sudahLogin() {
    const user = localStorage.getItem('user');
    if (!user) return false;
    try {
        const parsed = JSON.parse(user);
        return parsed !== null && parsed !== undefined;
    } catch {
        return false;
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function toggleDropdown(id) {
    const dropdown = document.getElementById(id);
    dropdown.classList.toggle('hidden');
}

async function login(email, password) {
    try {
        const res = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const json = await res.json();

        if (json.success) {
            localStorage.setItem('user', JSON.stringify(json.data));
            window.location.href = 'home.html';
        } else {
            alert('Email atau password salah');
        }
    } catch (err) {
        alert('Gagal terhubung ke server.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            if (!email || !password) {
                alert('Email dan password harus diisi.');
                return;
            }
            await login(email, password);
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const namaDepan = document.getElementById('nama').value.trim();
            const namaBelakang = document.getElementById('nama-belakang').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const passwordConfirm = document.getElementById('password-confirm').value;

            if (!namaDepan || !namaBelakang || !email || !password || !passwordConfirm) {
                alert('Semua kolom harus diisi.');
                return;
            }
            if (password.length < 6) {
                alert('Password minimal 6 karakter.');
                return;
            }
            if (password !== passwordConfirm) {
                alert('Password dan konfirmasi password tidak sama.');
                return;
            }
            try {
                const nama = `${namaDepan} ${namaBelakang}`;
                const res = await fetch('http://localhost:3000/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nama, email, password })
                });
                const json = await res.json();
                if (json.success) {
                    localStorage.setItem('user', JSON.stringify(json.data));
                    // Redirect ke home page setelah registrasi berhasil
                    setTimeout(() => {
                        window.location.href = './home.html';
                    }, 500);
                } else {
                    alert(json.message || 'Registrasi gagal.');
                }
            } catch (err) {
                alert('Gagal terhubung ke server.');
            }
        });
    }


    const halamanProtected = ['detail.html'];
    const halamanSekarang = window.location.pathname.split('/').pop();
    if (halamanProtected.includes(halamanSekarang) && !sudahLogin()) {
        window.location.href = 'login.html';
        return;
    }


    document.addEventListener('click', (e) => {
        const menus = ['user-menu', 'kategori-menu'];
        menus.forEach(menuId => {
            const menu = document.getElementById(menuId);
            const dropdownId = menuId.replace('menu', 'dropdown');
            const dropdown = document.getElementById(dropdownId);
            if (!menu?.contains(e.target)) {
                dropdown?.classList.add('hidden');
            }
        });
    });
});