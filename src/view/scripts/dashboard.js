
// ================= LOAD PAGE =================
window.onload = async () => {
  await loadUser();
  await loadSidebarSocieties();
  await loadSocieties();
  await loadPayments();
  await loadUserEvents();
  await loadNotifications();
  await renderDate();
};


// ================== FORMAT DATE =========================
function renderDate(){
    const dateEl = document.querySelector('.page-title h3');
    const date = new Date();

    const formatter = new Intl.DateTimeFormat('en-ZA', { 
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    dateEl.textContent = formatter.format(date);
}

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

  if (payments.length === 0) {

        container.innerHTML =
            `<h2>Payment History</h2>
            <p>No payment history</p>`;

        return;
    }

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

function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
}

// =============== LOAD UPCOMING EVENTS =================
async function loadUserEvents() {

    const res = await fetch(
        `http://localhost:3000/api/dashboard/events`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const events = await res.json();

    const container =
        document.querySelector(".calendar-section");

    container.innerHTML =
        `<h2>Upcoming Events</h2>`;

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const upcomingEvents = events.filter(event => {

        const eventDate = new Date(event.date);

        eventDate.setHours(0, 0, 0, 0);

        return eventDate >= today;
    });

    upcomingEvents.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });

    if (upcomingEvents.length === 0) {

        container.innerHTML += `
            <p>No upcoming events</p>
        `;

        return;
    }

    upcomingEvents.forEach(event => {

        const dateObj = new Date(event.date);

        const day =
            dateObj.getDate();

        const month =
            dateObj.toLocaleString(
                "en",
                { month: "short" }
            );

        const isToday =
            dateObj.toDateString() ===
            new Date().toDateString();

        container.innerHTML += `

            <div class="calendar-item">

                <div class="calendar-date">
                    <span class="day">
                        ${day}
                    </span>

                    <span class="month">
                        ${month}
                    </span>
                </div>

                <div class="calendar-info">

                    <h4>
                        ${
                            event.type === 'funeral'
                            ? 'Funeral'
                            : 'Meeting'
                        }
                        - ${event.title}
                    </h4>

                    <p>
                        ${event.society_name}: ${event.location}
                    </p>

                    <small class="event-time">
                        ${event.time}
                        ${
                            isToday
                            ? ' • Today'
                            : ''
                        }
                    </small>

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

async function handleNotificationClick(notificationId, societyId, type) {
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

        if (type === 'welcome') {
            window.location.href = 'browse.html';
            return;
        }

        if (
            type === 'join_request_sent' ||
            type === 'rejected'
        ) {
            loadNotifications();
            return;
        }

        if (type === 'approved' && societyId) {
            localStorage.setItem('society_id', societyId);
            window.location.href = `society.html?id=${societyId}`;
            return;
        }

        if (
            type !== 'join_request_sent' &&
            type !== 'rejected' &&
            societyId
        ) {
            localStorage.setItem('society_id', societyId);
            window.location.href = `society.html?id=${societyId}`;
        }

    } catch (err) {
        console.log(err);
    }
}