// ================= TOKEN HANDLING =================
const params = new URLSearchParams(window.location.search);
let token = params.get('token');

if (token) {
    localStorage.setItem('token', token);
    window.history.replaceState({}, document.title, "dashboard.html");
} else {
    token = localStorage.getItem('token');
}

if (!token) {
    window.location.href = 'login.html';
}

// ================= LOAD PAGE =================
window.onload = async () => {
  await loadUser();
  await loadSidebarSocieties();
  await loadSocieties();
  await loadPayments();
  await loadUserEvents();
  await loadNotifications();
};

// ================= USER =================
const loadUser = async () => {
    const res = await fetch('http://localhost:3000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
    });

    const [user] = await res.json();

    // Update ALL user name/email occurrences
    document.querySelectorAll('.user-info h3').forEach(el => {
        el.innerText = user.first_name + ' ' + user.last_name;
    });

    document.querySelectorAll('.user-info p').forEach(el => {
        el.innerText = user.email;
    });

    // Update date
    const dateEl = document.querySelector('.page-title h3');
    const date = new Date();

    const formatter = new Intl.DateTimeFormat('en-ZA', { 
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    dateEl.textContent = formatter.format(date);
};

// ================= LOAD SIDEBAR SOCIETIES ========================
const loadSidebarSocieties = async () => {
  const res = await fetch('http://localhost:3000/api/dashboard/societies', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const societies = await res.json();

  const container = document.getElementById('sidebarSocieties');
  container.innerHTML = '';

  societies.forEach(s => {
    const isAdmin = s.role === 'admin';
    
    const item = `
      <div class="nav-item" onclick="openSociety(${s.id}, '${s.role}')">
        <img src="../images/networking.png" alt="" />
        <span>${s.society_name}</span>
        ${isAdmin ? '<span class="admin-tag">Admin</span>' : ''}
      </div>
    `;

    container.innerHTML += item;
  });
};

// ====================== OPEN SOCIETY ON CARD / SIDEBAR ===========================
const openSociety = (id, role) => {

  localStorage.setItem("society_id", id);
  localStorage.setItem("role", role);

  window.location.href = `society.html?id=${id}`;
};

// =================== LOAD SOCIETY CARDS ====================
const loadSocieties = async () => {
  const res = await fetch('http://localhost:3000/api/dashboard/societies', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const societies = await res.json();

  const container = document.querySelector('.society-cards');
  container.innerHTML = '';

  console.log(societies)
  // Update summary count
  document.getElementById('society-count').innerText = societies.length;
  let payments_due = 0;

  societies.forEach(s => {
    const initials = s.society_name
      .split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2);
    
    if (!s.has_paid) {
      payments_due++;
    }

    const card = `
      <div class="society-card" onclick="openSociety(${s.id}, '${s.role}')">
        <div class="society-header">
          <div class="society-avatar">${initials}</div>
          <div class="society-info">
            <h3>${s.society_name}</h3>
            <p>Joined ${s.joined}</p>
          </div>
        </div>

        <div class="society-details">
          <div class="detail-item">
            <h4>Contribution</h4>
            <div class="amount">R${s.monthly_contribution}/pm</div>
          </div>

          <div class="divider"></div>

          <div class="detail-item">
            <h4>This month</h4>
            <div class="status ${s.has_paid ? 'paid' : 'due'}">
              ${s.has_paid ? 'Paid' : 'Due'}
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML += card;
  });

  document.getElementById('payments-due').innerText = payments_due;
};

// ================= LOAD PAYMENT HISTORY SECTION =======================
const loadPayments = async () => {
  const res = await fetch('http://localhost:3000/api/contributions/my-history', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const payments = await res.json();

  const container = document.querySelector('.payment-history');
  
  // Keep title
  container.innerHTML = `<h2>Payment History</h2>`;

  payments.forEach(p => {
    const item = `
      <div class="payment-item">
        <div class="payment-info">
          <h4>${p.society}</h4>
          <p>${p.date}</p>
        </div>
        <div class="payment-amount">R${p.amount}</div>
      </div>
    `;

    container.innerHTML += item;
  });
};

// ================= LOGOUT =================
const logout = () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
};

function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
}

async function loadUserEvents() {

    const res = await fetch(`http://localhost:3000/api/dashboard/events`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const events = await res.json();

    const container = document.querySelector(".calendar-section");
    
    // keep title
    container.innerHTML = `<h2>My Calendar</h2>`;

    if (events.length === 0) {
        container.innerHTML += `<p>No upcoming events</p>`;
        return;
    }

    events.forEach(event => {
        const dateObj = new Date(event.date);

        const day = dateObj.getDate();
        const month = dateObj.toLocaleString("en", { month: "short" });

        container.innerHTML += `
            <div class="calendar-item">
                <div class="calendar-date">
                    <span class="day">${day}</span>
                    <span class="month">${month}</span>
                </div>
                <div class="calendar-info">
                    <h4>${event.title}</h4>
                    <p>${event.society_name}: ${event.location}</p>
                </div>
            </div>
        `;
    });
}

async function loadNotifications() {

    try {

        const res = await fetch(
            'http://localhost:3000/api/notifications',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

       

        const notifications = await res.json();
        console.log(notifications)

        const count = notifications.filter(n => !n.is_read).length;

        document.getElementById('notificationCount').textContent = count;

        // hide badge if no unread notifications
        const badge = document.getElementById('notificationCount');

        if (count === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'flex';
            badge.textContent = count;
        }

        const container =
            document.getElementById('notificationList');

        container.innerHTML = '';

        if (notifications.length === 0) {

            container.innerHTML = `
                <div class="empty-notifications">
                    No notifications
                </div>
            `;

            return;
        }

        notifications.forEach(n => {

        const notificationClass = n.is_read
            ? 'notification-item read'
            : 'notification-item unread';

        container.innerHTML += `

            <div 
                class="${notificationClass}"
                onclick="handleNotificationClick(
                    ${n.notification_id},
                    ${n.society_id || null},
                    '${n.type}'
                )"
            >

                <p>${n.message}</p>

                <div class="notification-time">
                    <p>${n.society_name || 'Umgalelo'}</p>
                    <p>
                        ${new Date(n.created_at)
                            .toLocaleDateString()}
                    </p>
                </div>

                ${
                    !n.is_read
                    ? `
                        <button
                            class="mark-read-btn"
                            onclick="
                                event.stopPropagation();
                                markAsRead(${n.notification_id})
                            "
                        >
                            Mark as read
                        </button>
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

async function markAsRead(notificationId) {

    try {

        const res = await fetch(
            `http://localhost:3000/api/notifications/read/${notificationId}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        console.log(data);

        // reload notifications
        loadNotifications();

    } catch (err) {
        console.log(err);
    }
}

async function handleNotificationClick(
    notificationId,
    societyId,
    type
) {

    try {

        await fetch(
            `http://localhost:3000/api/notifications/read/${notificationId}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        // ================= WELCOME =================
        if (type === 'welcome') {

            window.location.href =
                'browse.html';

            return;
        }

        // ================= JOIN REQUEST SENT =================
        if (type === 'join_request_sent') {

            return;
        }

        // ================= SOCIETY RELATED =================
        if (societyId) {

            localStorage.setItem(
                'society_id',
                societyId
            );

            window.location.href =
                `society.html?id=${societyId}`;
        }

    } catch (err) {

        console.log(err);
    }
}