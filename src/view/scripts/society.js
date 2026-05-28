const society_params = new URLSearchParams(window.location.search);
const societyId = society_params.get("id");
console.log(societyId)

if (!societyId) {
    alert("No society selected");
    window.location.href = "browse.html";
}

// const token = localStorage.getItem('token')

// ================ LOAD SOCIETY PAGE =======================
async function loadSociety() {
    const res = await fetch(`http://localhost:3000/api/societies/society/${societyId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await res.json();

    renderStats(data.total_contributions, data.total_claims, data.months_contributions)
    renderSociety(data.society);
    renderMembers(data.members);
    renderRequests(data.requests);
    //renderClaims(data.claims);
    console.log(data.society)
}

window.onload = async () => {
  await loadSidebarSocieties();
  await loadUser();
  await loadSociety();
  await loadEvents();
  await loadMessages();
};


// ============= RENDER/DISPLAY SOCIETY STATS ================
function renderStats(contributions, claims, this_month) {
    document.getElementById('totalCollected').textContent = `R${contributions.total}`
    document.getElementById('totalClaims').textContent = `${claims.count}`
    document.getElementById('collectedThisMonth').textContent = `R${this_month.total}`
}

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
    console.log(action)
    await fetch(`http://localhost:3000/api/joinRequest/${id}/requests`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({ action })
    });

    loadSociety(); // refresh
}

// ================ RENDER/DISPLAY SOCIETY INFO =====================
function renderSociety(s) {
    const initials = s.society_name
            .split(" ")
            .map(w => w[0])
            .join("")
            .slice(0, 2);
    document.getElementById("societyLogo").textContent = initials;

    document.getElementById("societyName").textContent = s.society_name;
    //document.getElementById("memberCount").textContent = `${s.member_count} members`;
    document.getElementById("monthlyContribution").textContent = `R${s.monthly_contribution}/month`;
    document.getElementById("locationText").innerHTML =
        `<img src="../images/location.png" width="15px"> ${s.city}, ${s.province}`;

    document.getElementById("societyDescription").textContent = s.description;
    document.getElementById("additionalRules").textContent = s.additional_rules;
    
    document.getElementById("detailContribution").textContent = `R${s.monthly_contribution}/month`;
    document.getElementById("coverAmount").textContent = `R${s.cover_amount}`;
    document.getElementById("maxMembers").textContent = s.maximum_members;
    document.getElementById("adminName").textContent = s.first_name + ' ' + s.last_name;

    document.getElementById("minimumAge").textContent = s.minimum_age;
    document.getElementById("waitingPeriod").textContent = s.waiting_period;
    document.getElementById("societyCity").textContent = s.city + ', ' + s.province;

    // ============ FILL PAYMENT CARD ==================
    document.getElementById('society-name').value = s.society_name;
    document.getElementById('societyname').value = s.society_name;
    document.getElementById('amount').value = s.monthly_contribution
    const now = new Date();

    const month = String(now.getMonth() + 1).padStart(2, '0');

    document.getElementById('month').value =
    `${now.getFullYear()}-${month}`;
    document.getElementById('claim_amount').value = s.cover_amount
}


// =========== MAKE PAYMENT / SUBMIT CLAIM =========

const btnPay = document.getElementById('submitPayment')
const btnClaim = document.getElementById('submitClaim')

btnPay.addEventListener('click', async (e) => {
    e.preventDefault();

    const societyId = localStorage.getItem("society_id");

    if (!societyId) {
        alert("No society selected");
        return;
    }

    const data = {
        amount: document.getElementById('amount').value,
        month: document.getElementById('month').value
    }

    const res = await fetch(`http://localhost:3000/api/contributions/contribute/${societyId}`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
        alert(result.message);
        document.getElementById('paymentModal').classList.remove('active');
    }

    if (!res.ok) {
        alert(result.message)
    }

})

btnClaim.addEventListener('click', async (e) => {
    e.preventDefault();

    const societyId = localStorage.getItem("society_id");

    if (!societyId) {
        alert("No society selected");
        return;
    }

    const data = {
        deceased_name: document.getElementById('deceased-name').value,
        relationship: document.getElementById('deceased-relationship').value,
        claim_amount: document.getElementById('claim_amount').value,
        date_of_passing: document.getElementById('date_of_passing').value
    }

    const res = await fetch(`http://localhost:3000/api/claims/claim/${societyId}`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok) {
        alert(result.message);
        document.getElementById('claimModal').classList.remove('active');
    }

    if (!res.ok) {
        alert(result.message)
    }
})

// ================== LOAD AND RENDER EVENTS ===================
async function loadEvents() {
    const res = await fetch(
        `http://localhost:3000/api/events/${localStorage.getItem('society_id')}`,
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

// =============== SOCIETY CHAT ====================

const chatToggle = document.getElementById('chatToggle');
const chatPopup = document.getElementById('chatPopup');
const closeChat = document.getElementById('closeChat');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');

let unreadCount = 0;
let typingTimeout;

const socket = io('http://localhost:3000');

// ========= SOCKET CONNECTION ===============
socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    socket.emit('join_society', societyId);
});

// ============ RESET UNREAD WHEN OPENING CHAT ===========
chatToggle.addEventListener('click', () => {
    chatPopup.classList.toggle('active');

    if (chatPopup.classList.contains('active')) {
        unreadCount = 0;
        localStorage.setItem(`lastRead_${societyId}`, new Date().toISOString());
        updateUnreadBadge();
    }
});

// ============= CLOSE CHAT POPUP
closeChat.addEventListener('click', () => {
    chatPopup.classList.remove('active');
});

// =========== FORMAT DATE
function formatTime(dateValue) {
    return new Date(dateValue).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}

//  =========== RENDER/DISPLAY MESSAGES ===============
function renderMessage(data) {
    const isMine = Number(data.sender_id) === Number(currentUser.user_id);

    // ========== DISPLAY MESSAGE TO LEFT/RIGHT ACCORDING TO OWNER =========
    chatMessages.innerHTML += `
        <div class="message ${isMine ? 'my-message' : 'other-message'}">
            ${!isMine ? `<strong>${data.first_name}</strong>` : ''}
            <p>${data.message_text}</p>
            <small class="message-time">${formatTime(data.created_at)}</small>
        </div>
    `;

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ============ SEND MESSAGE ============
sendMessageBtn.addEventListener('click', () => {
    const message = chatInput.value.trim();

    if (!message) return;

    socket.emit('send_message', {
        societyId,
        senderId: currentUser.user_id,
        sender: currentUser.firstName,
        message
    });

    chatInput.value = '';
});

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendMessageBtn.click();
    }
});

// ==============  PERSON TYPING.... MESSAGE ===========
chatInput.addEventListener('input', () => {
    socket.emit('typing', {
        societyId,
        name: currentUser.firstName
    });
});

// ========== UPDATE UNREAD MESSAGES COUNTER BADGE ======================
function updateUnreadBadge() {
    chatToggle.innerHTML = `
        <img src="../images/chat.png" alt="chat-icon" class="chat-icon" width="30px">

        ${
            unreadCount > 0
            ? `<span class="chat-badge">${unreadCount}</span>`
            : ''
        }
    `;
}

// ============ RECIEVE MESSAGES =================
socket.on('receive_message', (data) => {
    const isMine = Number(data.senderId) === Number(currentUser.user_id);

    renderMessage({
        sender_id: data.senderId,
        first_name: data.sender,
        message_text: data.message,
        created_at: data.createdAt
    });

    /*======== UPATE UNREAD MESSAGES COUNTER IF 
    DOES NOT BELONG TO YOU ==========*/
    if (!isMine && !chatPopup.classList.contains('active')) {
        unreadCount++;
        updateUnreadBadge();
    }
});

// ============ TYING INDICATOR ===========
socket.on('user_typing', (name) => {
    const typingIndicator = document.getElementById('typingIndicator');

    typingIndicator.textContent = `${name} is typing...`;

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
        typingIndicator.textContent = '';
    }, 1500);
});


// ========== LOAD SOCIETY CHAT MESSAGES ===============
async function loadMessages() {
    const response = await fetch(
        `http://localhost:3000/api/messages/${societyId}`
    );

    const messages = await response.json();

    chatMessages.innerHTML = '';

    const lastRead =
        localStorage.getItem(`lastRead_${societyId}`);

    unreadCount = 0;

    messages.forEach((msg) => {
        renderMessage(msg);

        const isMine =
            Number(msg.sender_id) === Number(currentUser.user_id);

        const isUnread = !lastRead || new Date(msg.created_at) > new Date(lastRead);

        if (!isMine && isUnread) {
            unreadCount++;
        }
    });

    updateUnreadBadge();

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

