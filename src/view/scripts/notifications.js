// ================= NOTIFICATIONS =================
async function loadNotifications() {
    try {
        const res = await fetch(`${API_BASE}/api/notifications`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const notifications = await res.json();

        const unreadCount = notifications.filter(n => !n.is_read).length;

        const badge = document.getElementById('notificationCount');
        const container = document.getElementById('notificationList');

        if (!badge || !container) return;

        if (unreadCount === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'flex';
            badge.textContent = unreadCount;
        }

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
                        <p>${new Date(n.created_at).toLocaleDateString()}</p>
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

// ================= MARK AS READ =================
async function markAsRead(notificationId) {
    try {
        const res = await fetch(
            `${API_BASE}/api/notifications/read/${notificationId}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        await res.json();

        loadNotifications();

    } catch (err) {
        console.log(err);
    }
}

// ================= NOTIFICATION CLICK =================
async function handleNotificationClick(notificationId, societyId, type) {
    try {
        await fetch(
            `${API_BASE}/api/notifications/read/${notificationId}`,
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

        if (type === 'left_society') {
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

        if (societyId) {
            localStorage.setItem('society_id', societyId);
            window.location.href = `society.html?id=${societyId}`;
        }

    } catch (err) {
        console.log(err);
    }
}