// societyCommon.js
// Must load AFTER common.js
// Must load BEFORE society.js / payments.js / claims.js / events.js

const societyId =
    new URLSearchParams(window.location.search).get("id") ||
    localStorage.getItem("society_id");

if (!societyId) {
    alert("No society selected");
    window.location.href = "browse.html";
}

localStorage.setItem("society_id", societyId);

let currentSociety = null;
let currentMembers = [];

// ================= LOAD SOCIETY SHELL =================
async function loadSocietyShell() {
    try {
        const res = await fetch(`${API_BASE}/api/societies/society/${societyId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Could not load society");
            return null;
        }

        currentSociety = data.society;
        currentMembers = data.members || [];

        renderStats(
            data.total_contributions,
            data.total_claims,
            data.months_contributions
        );

        renderSociety(
            data.society,
            data.members,
            data.user
        );

        return data;

    } catch (err) {
        console.log(err);
        alert("Error loading society");
        return null;
    }
}

// ================= RENDER SOCIETY STATS =================
function renderStats(contributions, claims, thisMonth) {
    setText("totalCollected", `R${contributions?.total || 0}`);
    setText("totalClaims", `${claims?.count || 0}`);
    setText("collectedThisMonth", `R${thisMonth?.total || 0}`);
}

// ================= RENDER SOCIETY HEADER =================
function renderSociety(s, members = [], u) {
    if (!s) return;

    const initials = s.society_name
        .split(" ")
        .map(w => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    setText("page-title", s.society_name + ' - ' + document.getElementById('page-title').textContent);
    setText("societyLogo", initials);
    setText("societyName", s.society_name);
    setText("memberCount", `${members.length} members`);
    setText("monthlyContribution", `R${s.monthly_contribution}/month`);

    const locationText = document.getElementById("locationText");

    if (locationText) {
        locationText.innerHTML =
            `<img src="../images/location.png" width="15px"> ${s.city}, ${s.province}`;
    }

    // Optional overview fields
    setText("societyDescription", s.description || "");
    setText("detailContribution", `R${s.monthly_contribution}/month`);
    setText("coverAmount", `R${s.cover_amount}`);
    setText("maxMembers", s.maximum_members);
    setText("adminName", `${s.first_name || ""} ${s.last_name || ""}`.trim());
    setText("waitingPeriod", s.waiting_period);
    setText("societyCity", `${s.city}, ${s.province}`)
    setText("founded", formatDate(s.created_at))

    fillPaymentAndClaimForms(s, u);
}

// ================= FILL PAYMENT / CLAIM MODALS =================
function fillPaymentAndClaimForms(s, u) {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    setInputValue("member", u.first_name + ' ' + u.last_name)
    setInputValue("member-name", u.first_name + ' ' + u.last_name)
    setInputValue("society-name", s.society_name);
    setInputValue("societyname", s.society_name);
    setInputValue("amount", s.monthly_contribution);
    setInputValue("month", `${now.getFullYear()}-${month}`);
    setInputValue("claim_amount", s.cover_amount);
}

// ================= COMMON MODAL SETUP =================
function setupSocietyModals() {
    const paymentModal = document.getElementById("paymentModal");
    const claimModal = document.getElementById("claimModal");

    const payNowBtn = document.getElementById("payNowBtn");
    const submitClaimBtn = document.getElementById("submitClaimBtn");

    const closePaymentModal = document.getElementById("closePaymentModal");
    const closeClaimModal = document.getElementById("closeClaimModal");

    if (payNowBtn && paymentModal) {
        payNowBtn.addEventListener("click", () => {
            paymentModal.classList.add("active");
        });
    }

    if (submitClaimBtn && claimModal) {
        submitClaimBtn.addEventListener("click", () => {
            claimModal.classList.add("active");
        });
    }

    if (closePaymentModal && paymentModal) {
        closePaymentModal.addEventListener("click", () => {
            paymentModal.classList.remove("active");
        });
    }

    if (closeClaimModal && claimModal) {
        closeClaimModal.addEventListener("click", () => {
            claimModal.classList.remove("active");
        });
    }

    if (paymentModal) {
        paymentModal.addEventListener("click", e => {
            if (e.target === paymentModal) {
                paymentModal.classList.remove("active");
            }
        });
    }

    if (claimModal) {
        claimModal.addEventListener("click", e => {
            if (e.target === claimModal) {
                claimModal.classList.remove("active");
            }
        });
    }
}

// ================= PAYFAST PAYMENT =================
function setupPaymentSubmit() {
    const btnPay = document.getElementById("submitPayment");

    if (!btnPay) return;

    btnPay.addEventListener("click", async e => {
        e.preventDefault();

        const selectedSocietyId = localStorage.getItem("society_id");

        if (!selectedSocietyId) {
            alert("No society selected");
            return;
        }

        const data = {
            amount: document.getElementById("amount")?.value,
            month: document.getElementById("month")?.value
        };

        if (!data.amount || !data.month) {
            alert("Please enter amount and month");
            return;
        }

        try {
            const res = await fetch(
                `${API_BASE}/api/contributions/payfast/initiate/${selectedSocietyId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                }
            );

            const result = await res.json();

            if (!res.ok) {
                alert(result.message || "Could not start payment");
                return;
            }

            window.location.href = result.paymentUrl;

        } catch (err) {
            console.log(err);
            alert("Could not start PayFast payment");
        }
    });
}

// ================= SUBMIT CLAIM =================
function setupClaimSubmit() {
    const btnClaim = document.getElementById("submitClaim");

    if (!btnClaim) return;

    btnClaim.addEventListener("click", async e => {
        e.preventDefault();

        const selectedSocietyId = localStorage.getItem("society_id");

        if (!selectedSocietyId) {
            alert("No society selected");
            return;
        }

        const data = {
            deceased_name: document.getElementById("deceased-name")?.value,
            relationship: document.getElementById("deceased-relationship")?.value,
            claim_amount: document.getElementById("claim_amount")?.value,
            date_of_passing: document.getElementById("date_of_passing")?.value
        };

        if (
            !data.deceased_name ||
            !data.relationship ||
            !data.claim_amount ||
            !data.date_of_passing
        ) {
            alert("Please fill in all claim details");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/claims/claim/${selectedSocietyId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.message || "Could not submit claim");
                return;
            }

            alert(result.message);

            const claimModal = document.getElementById("claimModal");
            if (claimModal) claimModal.classList.remove("active");

            if (typeof loadSocietyShell === "function") {
                await loadSocietyShell();
            }

        } catch (err) {
            console.log(err);
            alert("Error submitting claim");
        }
    });
}

// ================= OVERVIEW LINK =================
function setupOverviewLink() {
    const overview = document.getElementById("overview");

    if (!overview) return;

    overview.addEventListener("click", e => {
        e.preventDefault();
        window.location.href = `society.html?id=${societyId}`;
    });
}

// ================= EVENTS MODAL HELPERS =================
function setupEventDetailsModal() {
    const closeBtn = document.getElementById("closeEventDetails");
    const eventModal = document.getElementById("eventDetailsModal");

    if (closeBtn && eventModal) {
        closeBtn.addEventListener("click", () => {
            eventModal.classList.remove("active");
            document.body.style.overflow = "";
        });
    }

    if (eventModal) {
        eventModal.addEventListener("click", e => {
            if (e.target === eventModal) {
                eventModal.classList.remove("active");
                document.body.style.overflow = "";
            }
        });
    }
}

// ================= SOCIETY CHAT =================
let societyChatSocket = null;
let unreadCount = 0;
let typingTimeout = null;

function setupSocietyChat() {
    const chatToggle = document.getElementById("chatToggle");
    const chatPopup = document.getElementById("chatPopup");
    const closeChat = document.getElementById("closeChat");
    const chatInput = document.getElementById("chatInput");
    const sendMessageBtn = document.getElementById("sendMessageBtn");

    if (
        !chatToggle ||
        !chatPopup ||
        !closeChat ||
        !chatInput ||
        !sendMessageBtn
    ) {
        return;
    }

    if (typeof io === "undefined") {
        console.warn("Socket.IO client not loaded");
        return;
    }

    societyChatSocket = io(API_BASE, {
        auth: {
            token
        }
    });

    societyChatSocket.on("connect", () => {
        console.log("Socket connected:", societyChatSocket.id);
        societyChatSocket.emit("join_society", societyId);
    });

    chatToggle.addEventListener("click", () => {
        chatPopup.classList.toggle("active");

        if (chatPopup.classList.contains("active")) {
            unreadCount = 0;
            localStorage.setItem(`lastRead_${societyId}`, new Date().toISOString());
            updateUnreadBadge();
        }
    });

    closeChat.addEventListener("click", () => {
        chatPopup.classList.remove("active");
    });

    sendMessageBtn.addEventListener("click", () => {
        sendChatMessage();
    });

    chatInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            sendChatMessage();
        }
    });

    chatInput.addEventListener("input", () => {
        if (!window.currentUser) return;

        societyChatSocket.emit("typing", {
            societyId,
            name: window.currentUser.first_name || window.currentUser.firstName
        });
    });

    societyChatSocket.on("receive_message", data => {
        const user = window.currentUser;

        const isMine =
            user && Number(data.senderId) === Number(user.user_id);

        renderMessage({
            sender_id: data.senderId,
            first_name: data.sender,
            message_text: data.message,
            created_at: data.createdAt
        });

        const chatPopup = document.getElementById("chatPopup");

        if (!isMine && !chatPopup.classList.contains("active")) {
            unreadCount++;
            updateUnreadBadge();
        }
    });

    societyChatSocket.on("user_typing", name => {
        const typingIndicator = document.getElementById("typingIndicator");

        if (!typingIndicator) return;

        typingIndicator.textContent = `${name} is typing...`;

        clearTimeout(typingTimeout);

        typingTimeout = setTimeout(() => {
            typingIndicator.textContent = "";
        }, 1500);
    });
}

// ================= SEND CHAT MESSAGE =================
function sendChatMessage() {
    const chatInput = document.getElementById("chatInput");

    if (!chatInput || !societyChatSocket) return;

    const message = chatInput.value.trim();

    if (!message) return;

    const user = window.currentUser;

    if (!user) {
        alert("User not loaded yet");
        return;
    }

    societyChatSocket.emit("send_message", {
        societyId,
        senderId: user.user_id,
        sender: user.first_name || user.firstName,
        message
    });

    chatInput.value = "";
}

// ================= LOAD CHAT MESSAGES =================
async function loadMessages() {
    const chatMessages = document.getElementById("chatMessages");

    if (!chatMessages) return;

    try {
        const res = await fetch(`${API_BASE}/api/messages/${societyId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const messages = await res.json();

        chatMessages.innerHTML = "";

        const lastRead = localStorage.getItem(`lastRead_${societyId}`);

        unreadCount = 0;

        messages.forEach(msg => {
            renderMessage(msg);

            const user = window.currentUser;

            const isMine =
                user && Number(msg.sender_id) === Number(user.user_id);

            const isUnread =
                !lastRead ||
                new Date(msg.created_at) > new Date(lastRead);

            if (!isMine && isUnread) {
                unreadCount++;
            }
        });

        updateUnreadBadge();

        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (err) {
        console.log(err);
    }
}

// ================= RENDER CHAT MESSAGE =================
function renderMessage(data) {
    const chatMessages = document.getElementById("chatMessages");

    if (!chatMessages) return;

    const user = window.currentUser;

    const isMine =
        user && Number(data.sender_id) === Number(user.user_id);

    chatMessages.innerHTML += `
        <div class="message ${isMine ? "my-message" : "other-message"}">
            ${!isMine ? `<strong>${data.first_name || ""}</strong>` : ""}
            <p>${escapeHTML(data.message_text)}</p>
            <small class="message-time">${formatTime(data.created_at)}</small>
        </div>
    `;

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ================= CHAT BADGE =================
function updateUnreadBadge() {
    const chatToggle = document.getElementById("chatToggle");

    if (!chatToggle) return;

    chatToggle.innerHTML = `
        <img src="../images/chat.png" alt="chat-icon" class="chat-icon" width="30px">

        ${
            unreadCount > 0
            ? `<span class="chat-badge">${unreadCount}</span>`
            : ""
        }
    `;
}

// ================= INIT COMMON SOCIETY FEATURES =================
async function initSocietyPage(options = {}) {
    await loadUser();
    await loadSidebarSocieties();

    const data = await loadSocietyShell();

    setupSocietyModals();
    setupPaymentSubmit();
    setupClaimSubmit();
    setupOverviewLink();
    setupEventDetailsModal();
    setupSocietyChat();

    if (options.chat !== false) {
        await loadMessages();
    }

    return data;
}

// ================= HELPERS =================
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function setInputValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
}

function formatTime(dateValue) {
    return new Date(dateValue).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);

    return date.toLocaleDateString('en-ZA', {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}