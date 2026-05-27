// let token = localStorage.getItem('token')
const societyId = localStorage.getItem('society_id');

window.onload = async () => {
    await loadUser();
    await loadSidebarSocieties();
    await loadSociety();
    await loadEvents();
    await loadMessages();
};

const eventModal = document.getElementById("eventDetailsModal");
const closeBtn = document.getElementById("closeEventDetails");

document.querySelectorAll(".event-card").forEach(card => {
    card.addEventListener("click", async () => {
        
        const eventId = card.dataset.eventId;

        const res = await fetch(`http://localhost:3000/api/events/single/${eventId}`);
        const event = await res.json();
        console.log(event)
        document.getElementById("eventTitle").innerText = event.title;
        document.getElementById("eventMember").innerText = event.member || "-";
        document.getElementById("eventDateTime").innerText =
            `${event.date} · ${event.time}`;
        document.getElementById("eventLocation").innerText = event.location;
        document.getElementById("eventNotes").innerText = event.notes || "-";

        eventModal.classList.add("active");
        document.body.style.overflow = 'hidden';
    });
});

closeBtn.addEventListener("click", () => {
    eventModal.classList.remove("active");
});

const form = document.getElementById("eventForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const data = {
        societyId: localStorage.getItem('society_id'),
        type: "meeting", // later connect to toggle
        title: formData.get("title"),
        date: formData.get("date"),
        time: formData.get("time"),
        location: formData.get("location"),
        member: formData.get("member"),
        notes: formData.get("notes")
    };

    const res = await fetch("http://localhost:3000/api/events/create", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
         },
        
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert("Event added");
        location.reload();
    }
});

async function loadEvents() {
    const res = await fetch(`http://localhost:3000/api/events/${localStorage.getItem('society_id')}`,{
        headers: { 
            Authorization: `Bearer ${token}`
         }
    }); // societyId
    const events = await res.json();
    console.log(events)

    const container = document.querySelector(".events-list");
    container.innerHTML = "";

    if (events.length === 0) {
        container.innerHTML = "<p>No upcoming events</p>";
        return;
    }

    events.forEach(event => {
        container.innerHTML += `
        <div class="event-card" 
             data-event-id="${event.id}" 
             data-event-type="${event.type}">
            <div class="event-date">
                <div class="date-badge">
                    <span class="day">${new Date(event.date).getDate()}</span>
                    <span class="month">${new Date(event.date).toLocaleString('en', { month: 'short' }).toUpperCase()}</span>
                </div>
            </div>
            <div class="event-details">
                <h3>${event.title}</h3>
                <p>${event.time} · ${event.location}</p>
            </div>
        </div>`;
    });
}


//load society
async function loadSociety() {
    const res = await fetch(`http://localhost:3000/api/societies/society/${localStorage.getItem('society_id')}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await res.json();
    console.log(data)

    renderStats(data.total_contributions, data.total_claims, data.months_contributions)
    renderSociety(data.society, data.members);
}

function renderStats(contributions, claims, this_month) {
    document.getElementById('totalCollected').textContent = `R${contributions.total}`
    document.getElementById('totalClaims').textContent = `${claims.count}`
    document.getElementById('collectedThisMonth').textContent = `R${this_month.total}`
}

function renderSociety(s, m) {

    const initials = s.society_name
            .split(" ")
            .map(w => w[0])
            .join("")
            .slice(0, 2);
    document.getElementById("societyLogo").textContent = initials;
    
    document.getElementById("societyName").textContent = s.society_name;
    document.getElementById("memberCount").textContent = `${m.length} members`;
    document.getElementById("monthlyContribution").textContent = `R${s.monthly_contribution}/month`;
    document.getElementById("locationText").innerHTML =
        `<img src="../images/location.png" width="15px"> ${s.city}, ${s.province}`;


    // ========== RENDER PAYMENT CARD ==============
    document.getElementById('society-name').value = s.society_name;
    document.getElementById('societyname').value = s.society_name;
    document.getElementById('amount').value = s.monthly_contribution
    document.getElementById('month').value = `${new Date().getFullYear()}-0${new Date().getMonth()}`
    document.getElementById('claim_amount').value = s.cover_amount
}

// ========= OVERVIEW ============
// document.getElementById('overview').addEventListener('click', (e) => {
//     e.preventDefault()
//   window.location.href = `society.html?id=${localStorage.getItem("society_id")}`;
// })

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