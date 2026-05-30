window.onload = async () => {

    const data = await initSocietyPage();

    renderMembers(data.members);
    renderRequests(data.requests);

    await loadEvents();
    await loadMessages();

};

// ================= RENDER/DISPLAY SOCIETY MEMBERS =====================
function renderMembers(members) {

    document.getElementById('membersCount').textContent = `Members (${members.length})`
    document.getElementById("memberCount").textContent = `${members.length} members`;

    const container = document.getElementById("membersList");

    container.innerHTML = members.map(m => `
        <div class="member-item">
            <div class="member-avatar">
                ${m.first_name[0]}${m.last_name[0]}
            </div>

            <div class="member-info">
                <p class="member-name">${m.first_name} ${m.last_name}</p>
                <p class="member-since">
                    Member since ${new Date(m.joined_at).toLocaleDateString()}
                </p>
            </div>

            ${m.role === 'admin' ? `<span class="member-badge">Admin</span>` : ''}
        </div>
    `).join("");

}

// ================ RENDER/DISPLAY JOIN REQUESTS ================
function renderRequests(requests) {

    document.getElementById('joinRequestsCount')
        .textContent = `Join Requests (${requests.length})`;

    const container =
        document.getElementById("requestsList");

    const role = localStorage.getItem("role");

    if (requests.length === 0) {

        container.innerHTML =
            "<p>No active requests</p>";

        return;
    }

    container.innerHTML = requests.map(r => `

        <div class="member-item">

            <div class="member-avatar">
                ${r.first_name[0]}${r.last_name[0]}
            </div>

            <div class="member-info">
                <p class="member-name">
                    ${r.first_name} ${r.last_name}
                </p>

                <p class="member-since">
                    Requested
                    ${new Date(r.requested_at)
                        .toLocaleDateString()}
                </p>
            </div>

            ${
                role === 'admin'
                ? `
                    <div class="request-actions">

                        <button
                            onclick="handleRequest(${r.request_id}, 'approve')"
                            class="btn btn-primary btn-sm"
                        >
                            Approve
                        </button>

                        <button
                            onclick="handleRequest(${r.request_id}, 'reject')"
                            class="btn btn-outline btn-sm"
                        >
                            Reject
                        </button>

                    </div>
                `
                : ''
            }

        </div>

    `).join("");
}

// ============= ACCEPT/REJECT JOIN REQUEST(ADMIN ONLY) ====================
async function handleRequest(id, action) {

    await fetch(`${API_BASE}/api/joinRequest/${id}/requests`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ action })
    });

    alert(`Join request ${action === 'approve'? 'approved' : 'rejected'}`);
    location.reload()
}

// // ================== LOAD AND RENDER EVENTS ===================
async function loadEvents() {
    const res = await fetch(
        `${API_BASE}/api/events/${localStorage.getItem('society_id')}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const events = await res.json();

    const container = document.querySelector(".events-list");
    container.innerHTML = "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);

        return eventDate >= today;
    });

    document.getElementById('eventsCount').textContent =
        `Upcoming Events (${upcomingEvents.length})`;

    if (upcomingEvents.length === 0) {
        container.innerHTML = "<p>No upcoming events</p>";
        return;
    }

    upcomingEvents.forEach(event => {
        container.innerHTML += `
            <div class="event-card" 
                 data-event-id="${event.id}" 
                 data-event-type="${event.type}">

                <div class="event-date">
                    <div class="date-badge">
                        <span class="day">
                            ${new Date(event.date).getDate()}
                        </span>

                        <span class="month">
                            ${new Date(event.date)
                                .toLocaleString('en', { month: 'short' })
                                .toUpperCase()}
                        </span>
                    </div>
                </div>

                <div class="event-details">
                    <h3>
                        ${event.type === 'funeral' ? 'Funeral' : 'Meeting'} - ${event.title}
                    </h3>

                    <p>${event.time} · ${event.location}</p>
                </div>
            </div>
        `;
    });
}
