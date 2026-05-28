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

    const currentPage =
        window.location.pathname.split('/').pop();

    const societyPages = [
        'society.html',
        'payments.html',
        'claims.html',
        'events.html'
    ];

    if (societyPages.includes(currentPage)) {
        window.location.href = `${currentPage}?id=${id}`;
    } else {
        window.location.href = `society.html?id=${id}`;
    }
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
// ================= LOAD SIDEBAR SOCIETIES =================
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

        // current page
        const currentPage =
            window.location.pathname
                .split('/')
                .pop();

        // pages that belong to a society
        const societyPages = [
            'society.html',
            'payments.html',
            'claims.html',
            'events.html',
            'members.html',
            'chat.html'
        ];

        // only highlight on society-related pages
        const shouldHighlightSociety =
            societyPages.includes(currentPage);

        const currentSocietyId =
            shouldHighlightSociety
                ? localStorage.getItem('society_id')
                : null;

        societies.forEach(s => {

            const isAdmin =
                s.role === 'admin';

            const isActive =
                Number(currentSocietyId) === Number(s.id);

            const shortenedName =
                s.society_name.length > 25
                    ? s.society_name.substring(0, 25) + '...'
                    : s.society_name;

            container.innerHTML += `
                <div
                    class="nav-item ${isActive ? 'active' : ''}"
                    onclick="openSociety(${s.id}, '${s.role}')"
                >

                    <img
                        src="${isActive ? '../images/networking (3).png' : '../images/networking.png'}"
                        alt=""
                    />

                    <span title="${s.society_name}">
                        ${shortenedName}
                    </span>

                    ${
                        isAdmin
                        ? `
                            <span class="admin-tag">
                                Admin
                            </span>
                        `
                        : ''
                    }

                </div>
            `;
        });

    } catch (err) {

        console.log(err);
    }
}