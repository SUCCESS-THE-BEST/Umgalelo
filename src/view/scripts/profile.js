// const token = localStorage.getItem('token');

const update = document.getElementById('update');
const cancel = document.getElementById('cancel');

window.onload = async () => {
    await loadUser();
    await loadSidebarSocieties();
    await loadNotifications();
    await loadSocieties();
    await loadUserData();
    await renderDate();
};

// ============== RENDER DATE ================
function renderDate(){
    const dateEl = document.getElementById('date');
    const date = new Date();

    const formatter = new Intl.DateTimeFormat('en-ZA', { 
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    dateEl.textContent = formatter.format(date);
}


// ============= LOAD USER DATA ========================
let currentProfileUser = null;

const editableSections = {
    personal: ['idNumber', 'gender', 'dob'],
    contact: ['phone'],
    address: ['addressLine1', 'city', 'province', 'postalCode'],
    kin: ['nextOfKinName', 'nextOfKinPhone']
};

const loadUserData = async () => {
    const res = await fetch('http://localhost:3000/api/auth/profile', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const [user] = await res.json();
    currentProfileUser = user;

    setDisplayField('firstName', user.first_name);
    setDisplayField('lastName', user.last_name);
    setDisplayField('idNumber', user.id_number);
    setDisplayField('gender', user.gender);
    setDisplayField('dob', formatDate(user.date_of_birth));
    setDisplayField('age', calculateAge(user.date_of_birth));

    setDisplayField('email', user.email);
    setDisplayField('phone', user.phone);

    setDisplayField('addressLine1', user.address_line1);
    setDisplayField('city', user.city);
    setDisplayField('province', user.province);
    setDisplayField('postalCode', user.postal_code);

    setDisplayField('nextOfKinName', user.next_of_kin_name);
    setDisplayField('nextOfKinPhone', user.next_of_kin_phone);

    setupSectionButtons();
};

function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);

    return date.toLocaleDateString('en-ZA');
}

function setDisplayField(inputId, value) {
    const input = document.getElementById(inputId);

    if (!input) return;

    input.value = value || '';
    input.classList.add('hidden');

    let display = document.getElementById(`${inputId}-display`);

    if (!display) {
        display = document.createElement('div');
        display.id = `${inputId}-display`;
        display.className = 'field-display';

        input.parentNode.insertBefore(display, input);
    }

    display.textContent = value || 'Not added yet';

    if (!value) {
        display.classList.add('empty');
    } else {
        display.classList.remove('empty');
    }

    input.disabled = true;
}

function lockAllSections() {
    document.querySelectorAll('.form-section').forEach(section => {
        const inputs = section.querySelectorAll('input, select');

        inputs.forEach(input => {
            if (input.type !== 'file') {
                input.disabled = true;

                if (input.value) {
                    input.classList.add('locked');
                }
            }
        });
    });
}

function setupSectionButtons() {
    document.querySelectorAll('.section-edit-btn').forEach(button => {
        button.onclick = async () => {
            const section = button.closest('.form-section');
            const sectionName = section.dataset.section;

            if (!sectionName) return;

            if (button.textContent.trim() === 'Edit') {
                enableSection(sectionName, button);
            } else {
                await saveSection(sectionName, button);
            }
        };
    });
}

function enableSection(sectionName, button) {
    const fields = editableSections[sectionName];

    fields.forEach(id => {
        const input = document.getElementById(id);
        const display = document.getElementById(`${id}-display`);

        if (!input) return;

        if (id === 'idNumber' && currentProfileUser.id_number) {
            return;
        }

        if (id === 'age') {
            return;
        }

        input.classList.remove('hidden');
        input.disabled = false;

        if (display) {
            display.style.display = 'none';
        }
    });

    button.textContent = 'Save';
    button.classList.add('saving');
}

async function saveSection(sectionName, button) {
    const message = getSectionMessage(button);

    const data = buildSectionData(sectionName);

    try {
        const res = await fetch('http://localhost:3000/api/users/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) {
            message.textContent = result.message;
            message.style.color = 'red';
            return;
        }

        message.textContent = `${sectionName} details saved`;
        message.style.color = 'green';

        button.textContent = 'Edit';
        button.classList.remove('saving');

        await loadUserData();

    } catch (error) {
        console.log(error);
        message.textContent = 'Failed to save details';
        message.style.color = 'red';
    }
}

function buildSectionData(sectionName) {
    if (sectionName === 'personal') {
        return {
            idNumber: document.getElementById('idNumber').value || undefined,
            gender: document.getElementById('gender').value || undefined,
            dob: document.getElementById('dob').value || undefined
        };
    }

    if (sectionName === 'contact') {
        return {
            phone: document.getElementById('phone').value || undefined
        };
    }

    if (sectionName === 'address') {
        return {
            addressLine1: document.getElementById('addressLine1').value || undefined,
            city: document.getElementById('city').value || undefined,
            province: document.getElementById('province').value || undefined,
            postalCode: document.getElementById('postalCode').value || undefined
        };
    }

    if (sectionName === 'kin') {
        return {
            nextOfKinName: document.getElementById('nextOfKinName').value || undefined,
            nextOfKinPhone: document.getElementById('nextOfKinPhone').value || undefined
        };
    }

    return {};
}

function getSectionMessage(button) {
    const section = button.closest('.form-section');

    let message = section.querySelector('.section-message');

    if (!message) {
        message = document.createElement('p');
        message.className = 'section-message';
        section.appendChild(message);
    }

    return message;
}

update.addEventListener('click', async (e) => {
    e.preventDefault();

    const message = document.getElementById('message');

    try {
        // ================= UPDATE TEXT PROFILE DETAILS =================

        const data = {
            idNumber: document.getElementById('idNumber').value || null,
            gender: document.getElementById('gender').value || null,
            dob: document.getElementById('dob').value || null,
            phone: document.getElementById('phone').value || null,

            addressLine1: document.getElementById('addressLine1').value,
            city: document.getElementById('city').value,
            province: document.getElementById('province').value,
            postalCode: document.getElementById('postalCode').value,
            nextOfKinName: document.getElementById('nextOfKinName').value,
            nextOfKinPhone: document.getElementById('nextOfKinPhone').value
        };

        const res = await fetch('http://localhost:3000/api/users/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) {
            message.textContent = result.message;
            message.style.color = 'red';
            return;
        }

        // ================= UPLOAD FILES =================

        const formData = new FormData();

        const profilePhoto = document.getElementById('profilePhoto').files[0];
        const idDocument = document.getElementById('idDocument').files[0];
        const bankingProof = document.getElementById('bankingProof').files[0];

        if (profilePhoto) {
            formData.append('profilePhoto', profilePhoto);
        }

        if (idDocument) {
            formData.append('idDocument', idDocument);
        }

        if (bankingProof) {
            formData.append('bankingProof', bankingProof);
        }

        const hasFiles =
            profilePhoto || idDocument || bankingProof;

        if (hasFiles) {
            const uploadRes = await fetch(
                'http://localhost:3000/api/users/upload-documents',
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );

            const uploadResult = await uploadRes.json();

            if (!uploadRes.ok) {
                message.textContent = uploadResult.message;
                message.style.color = 'red';
                return;
            }

            if (uploadResult.profilePhoto) {
                document.querySelectorAll('.user-avatar').forEach(img => {
                    if (uploadResult.profilePhoto) {

                        document.querySelectorAll('.user-avatar')
                            .forEach(img => {

                                img.src = img.src = uploadResult.profilePhoto;
                            });
                    }
                });
            }

            message.textContent = uploadResult.message;
            message.style.color = 'green';
            return;
        }

        // ================= SUCCESS MESSAGE =================

        message.textContent = result.message;
        message.style.color = 'green';

    } catch (error) {
        console.log(error);

        message.textContent = 'Something went wrong while updating profile';
        message.style.color = 'red';
    }
});

function calculateAge(dob) {
    if (!dob) return '';

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    return age;
}

cancel.onclick = () => {
  window.scrollTo(0, 0)
};


// const loadUser = async () => {
//     const res = await fetch('http://localhost:3000/api/auth/profile', {
//         headers: {
//         Authorization: `Bearer ${token}`
//         }
//     });

//     const [user] = await res.json();
//     console.log(user)
//     document.getElementById('userName').innerText = user.first_name + ' ' + user.last_name;
//     document.getElementById('userEmail').innerText = user.email;

//     document.getElementById('profileName').innerText = user.first_name + ' ' + user.last_name;
//     document.getElementById('profileEmail').innerText = user.email;
    
//     const date = new Date()
//     document.getElementById('date').textContent = `${formatter.format(date)}`

//     if (user.profile_photo) {
//     document.querySelectorAll('.user-avatar').forEach(img => {
//         img.src = `http://localhost:3000${user.profile_photo}`;
//     });
// }
    
// };

const formatter = new Intl.DateTimeFormat('en-ZA', { 
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
});

// const loadSidebarSocieties = async () => {
//     const res = await fetch('http://localhost:3000/api/dashboard/societies', {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//     });

//     const societies = await res.json();

//     const container = document.getElementById('sidebarSocieties');
//     container.innerHTML = '';

//     societies.forEach(s => {
//       const isAdmin = s.role === 'admin';

//       const item = `
//         <div class="nav-item" onclick="openSociety(${s.id}, '${s.role}')">
//           <img src="../images/networking.png" alt="" />
//           <span>${s.society_name}</span>
//           ${isAdmin ? '<span class="admin-tag">Admin</span>' : ''}
//         </div>
//       `;

//       container.innerHTML += item;
//     });
// };

// const openSociety = (id, role) => {

//   localStorage.setItem("society_id", id);
//   localStorage.setItem("role", role);

//   window.location.href = `society.html?id=${id}`;
// };

//parse id number
function parseIDNumber(id) {
    if (!id || id.length !== 13) {
        return;
    }

    const yy = id.slice(0, 2);
    const mm = id.slice(2, 4);
    const dd = id.slice(4, 6);
    const genderDigits = parseInt(id.slice(6, 10));

    const currentYY = new Date().getFullYear() % 100;
    const year = parseInt(yy) <= currentYY ? `20${yy}` : `19${yy}`;

    const month = parseInt(mm);
    const day = parseInt(dd);

    if (month < 1 || month > 12) return;
    if (day < 1 || day > 31) return;

    const dob = new Date(`${year}-${mm}-${dd}`);
    if (isNaN(dob.getTime())) return;

    const gender = genderDigits >= 5000 ? 'Male' : 'Female';

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dob.getDate())
    ) {
        age--;
    }

    document.getElementById('gender').value = gender;
    document.getElementById('dob').value = dob.toISOString().split('T')[0];
    document.getElementById('age').value = age;

    ['gender', 'dob', 'age'].forEach(id => {
        document.getElementById(id).disabled = true;
        document.getElementById(id).style.background = 'none';
        document.getElementById(id).style.border = 'none';
    });
}

// =============== NOTIFICATIONS ==================
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

// =================== MARK AS READ ====================
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

// =================== LOAD SOCIETY CARDS ====================
const loadSocieties = async () => {

  const res = await fetch(
    'http://localhost:3000/api/dashboard/societies',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const societies = await res.json();

  const container =
    document.querySelector('.society-list');

  container.innerHTML = '';

  document.getElementById('count').innerText =
    `(${societies.length})`;

  societies.forEach(s => {

    const initials = s.society_name
      .split(' ')
      .map(w => w[0])
      .join('')
      .substring(0, 2);

    const canLeave = s.role !== 'admin';

    const card = `
      <div class="society-item-wrapper">

        <div 
          class="society-item"
          onclick="openSociety(${s.id}, '${s.role}')"
        >
          <div class="society-avatar">
            ${initials}
          </div>

          <div class="society-info">
            <h3>${s.society_name}</h3>
            <p>Joined ${s.joined}</p>
          </div>
        </div>

        ${
          canLeave
          ? `
            <button
              class="leave-btn"
              onclick="event.stopPropagation();
              leaveSociety(${s.id})"
            >
              Leave
            </button>
          `
          : `
            <span class="admin-badge-label">
              Admin
            </span>
          `
        }

      </div>
    `;

    container.innerHTML += card;
  });
};

// ============ LEAVE SOCIETY ================
async function leaveSociety(societyId) {

    const confirmLeave = confirm(
        'Are you sure you want to leave this society?'
    );

    if (!confirmLeave) return;

    try {

        const res = await fetch(
            `http://localhost:3000/api/memberships/leave/${societyId}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await res.json();

        alert(data.message);

        loadSocieties();
        loadSidebarSocieties();

    } catch (err) {

        console.log(err);
        alert('Error leaving society');
    }
}
