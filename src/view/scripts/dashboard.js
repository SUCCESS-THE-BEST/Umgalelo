
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
  const res = await fetch(`${API_BASE}/api/dashboard/societies`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const societies = await res.json();

  const container = document.querySelector('.society-cards');
  container.innerHTML = '';

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
  const res = await fetch(`${API_BASE}/api/contributions/my-history`, {
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

// =============== LOAD UPCOMING EVENTS =================
async function loadUserEvents() {

    const res = await fetch(
        `${API_BASE}/api/dashboard/events`,
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