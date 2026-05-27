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