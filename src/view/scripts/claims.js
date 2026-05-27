// let token = localStorage.getItem('token')
const societyId = localStorage.getItem('society_id')

window.onload = async () => {
    await loadUser();
    await loadSidebarSocieties();
    await loadSociety();
    // await loadClaimsSummary();
    //await loadClaims();
    await loadMessages();
};


let allClaims = [];
//load society
async function loadSociety() {
    const res = await fetch(`http://localhost:3000/api/societies/society/${localStorage.getItem('society_id')}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await res.json();

    renderStats(data.total_contributions, data.total_claims, data.months_contributions)
    renderSociety(data.society, data.members);
    allClaims = data.claims;
    renderClaims(allClaims);
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


    //payment card
    document.getElementById('society-name').value = s.society_name;
    document.getElementById('societyname').value = s.society_name;
    document.getElementById('amount').value = s.monthly_contribution
    document.getElementById('month').value = `${new Date().getFullYear()}-0${new Date().getMonth()}`
    document.getElementById('claim_amount').value = s.cover_amount
}


function renderClaims(claims) {
    const container = document.getElementById("claimsContainer");

    container.innerHTML = "";

    if (claims.length === 0) {

        const card = document.createElement("section");
        card.className = "card claim-card";

        card.innerHTML = "<p>No claims record</p>";

        container.appendChild(card)
        return;
    }

    claims.forEach(c => {
        const card = document.createElement("section");
        card.className = "card claim-card";

        card.innerHTML = `
            <div class="claim-header">
                <div class="claim-title-section">
                    <h3 class="claim-name">${c.first_name + ' ' + c.last_name}</h3>
                    <p class="claim-date">Submitted ${new Date(c.claim_date).toLocaleDateString()}</p>
                </div>
                <span class="claim-status status-${c.status}">
                    ${c.status}
                </span>
            </div>

            <div class="claim-details-grid">
                <div class="detail-box">
                    <p class="detail-label">Relationship</p>
                    <p class="detail-value">${c.relationship}</p>
                </div>
                <div class="detail-box">
                    <p class="detail-label">Amount</p>
                    <p class="detail-value">R${c.claim_amount}</p>
                </div>
                <div class="detail-box">
                    <p class="detail-label">Date of Passing</p>
                    <p class="detail-value">${c.date_of_death}</p>
                </div>
            </div>

            ${c.status === 'pending' ? renderClaimActions(c) : ''}
        `;

        container.appendChild(card);
    });

    loadClaimsSummary();

}

function renderClaimActions(c) {

    const userRole = localStorage.getItem("role");

    const currentUserId =
        Number(localStorage.getItem("user_id"));

    let buttons = '';

    // ================= ADMIN BUTTONS =================
    if (
        c.status === "pending" &&
        userRole === "admin"
    ) {

        buttons += `
            <button
                class="btn btn-primary btn-sm"
                onclick="handleClaim(${c.claim_id}, 'approved')"
            >
                Approve
            </button>

            <button
                class="btn btn-outline btn-sm"
                onclick="handleClaim(${c.claim_id}, 'rejected')"
            >
                Reject
            </button>
        `;
    }

    // ================= MEMBER CANCEL =================
    if (
        c.status === "pending" &&
        c.user_id === currentUserId
    ) {

        buttons += `
            <button
                class="btn btn-outline btn-sm"
                onclick="cancelClaim(${c.claim_id})"
            >
                Cancel Claim
            </button>
        `;
    }

    return buttons
        ? `<div class="claim-actions">${buttons}</div>`
        : '';
}

// ==================== APPROVE/REJECT CLAIM ======================
async function handleClaim(claimId, action) {
  if (!confirm(`Are you sure you want to ${action} this claim?`)) return;

  try {
    const res = await fetch(`http://localhost:3000/api/claims/handle/${claimId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ 
        status: action,
        society_id: localStorage.getItem('society_id')
       })
    });

    const data = await res.json();

    alert(data.message);

    // reload claims after update
    loadClaims();

  } catch (err) {
    console.error(err);
    alert("Error processing claim");
  }
}

document.getElementById('overview').addEventListener('click', (e) => {
    e.preventDefault()
  window.location.href = `society.html?id=${localStorage.getItem("society_id")}`;
})

// ====================== CANCEL CLAIM ========================
async function cancelClaim(claimId) {

    const confirmed = confirm(
        'Cancel this claim?'
    );

    if (!confirmed) return;

    try {

        const res = await fetch(
            `http://localhost:3000/api/claims/${claimId}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        alert(data.message);

        loadSociety();

    } catch (err) {

        console.log(err);

        alert('Error cancelling claim');
    }
}

// ========================= CLAIMS SUMMARY ==============================
async function loadClaimsSummary() {

    const societyId = localStorage.getItem("society_id");

    const res = await fetch(`http://localhost:3000/api/claims/summary/${societyId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await res.json();

}   

// =================== RENDER/DISPLAY CLAIMS SUMMARY ========================
function renderClaimsSummary(data) {

    const container = document.getElementById("claimsContainer");

    container.innerHTML = "";

    const summary = document.createElement('section');

    summary.classList.add('card');
    summary.classList.add('summary-card');

    summary.innerHTML = `
        <h3 class="summary-title">Claims Summary</h3>

        <div class="summary-divider"></div>

        <div class="summary-grid">

            <div class="summary-row">
                <span class="summary-label">Total claims paid</span>
                <span class="summary-value">
                    ${data.total_paid}
                </span>
            </div>

            <div class="summary-row">
                <span class="summary-label">Total amount paid out</span>
                <span class="summary-value">
                    R${Number(data.total_amount).toLocaleString()}
                </span>
            </div>

            <div class="summary-row">
                <span class="summary-label">Pending Review</span>
                <span class="summary-value">
                    ${data.pending}
                </span>
            </div>

            <div class="summary-row">
                <span class="summary-label">Society Wallet</span>
                <span class="summary-value">
                    R${Number(data.wallet_balance).toLocaleString()}
                </span>
            </div>

        </div>
    `;

    container.appendChild(summary);
}


// ============ FILTER CLAIMS =======================
const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.dataset.filter;

        if (filter === "all") {
            renderClaims(allClaims);
            return;
        }

        const filtered = allClaims.filter(
            c => c.status === filter
        );

        renderClaims(filtered);
    });

});

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