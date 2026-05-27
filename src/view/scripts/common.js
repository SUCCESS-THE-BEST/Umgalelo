// ================= TOKEN =================
const params = new URLSearchParams(window.location.search);

let token = params.get('token');

if (token) {

    localStorage.setItem('token', token);

    window.history.replaceState(
        {},
        document.title,
        window.location.pathname
    );

} else {

    token = localStorage.getItem('token');
}

if (!token) {
    window.location.href = 'login.html';
}

// ================= LOGOUT =================
function logout() {

    localStorage.removeItem('token');

    window.location.href = 'login.html';
}

// ================= OPEN SOCIETY =================
function openSociety(id, role) {

    localStorage.setItem('society_id', id);

    localStorage.setItem('role', role);

    window.location.href =
        `society.html?id=${id}`;
}

let currentUser = {}
// ================= LOAD USER =================
async function loadUser() {

    try {

        const res = await fetch(
            'http://localhost:3000/api/auth/profile',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const [user] = await res.json();

        currentUser ={
            user_id: user.user_id,
            firstName: user.first_name
        }
        // sidebar/header names
        document.querySelectorAll('.user-info h3')
            .forEach(el => {
                el.innerText =
                    `${user.first_name} ${user.last_name}`;
            });

        document.querySelectorAll('.user-info p')
            .forEach(el => {
                el.innerText = user.email;
            });

        // avatars
        if (user.profile_photo) {
            document.querySelectorAll('.user-avatar')
                .forEach(img => {
                    img.src = img.src = user.profile_photo;
                });
        }

        return user;

    } catch (err) {

        console.log(err);
    }
}

// ================= LOAD SIDEBAR =================
async function loadSidebarSocieties() {

    try {

        const res = await fetch(
            'http://localhost:3000/api/dashboard/societies',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const societies = await res.json();

        const container =
            document.getElementById('sidebarSocieties');

        if (!container) return;

        container.innerHTML = '';

        societies.forEach(s => {

            const isAdmin = s.role === 'admin';

            container.innerHTML += `
                <div
                    class="nav-item"
                    onclick="openSociety(${s.id}, '${s.role}')"
                >

                    <img
                        src="../images/networking.png"
                        alt=""
                    />

                    <span>${s.society_name}</span>

                    ${
                        isAdmin
                        ? `<span class="admin-tag">Admin</span>`
                        : ''
                    }

                </div>
            `;
        });

    } catch (err) {

        console.log(err);
    }
}
