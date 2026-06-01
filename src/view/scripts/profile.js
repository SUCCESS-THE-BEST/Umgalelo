
const updateBtn = document.getElementById('update');
const cancelBtn = document.getElementById('cancel');

let currentProfileUser = null;

const editableSections = {
    personal: ['idNumber', 'gender', 'dob'],
    contact: ['phone'],
    address: ['addressLine1', 'city', 'province', 'postalCode'],
    kin: ['nextOfKinName', 'nextOfKinPhone']
};

window.addEventListener('DOMContentLoaded', async () => {

    startPageLoader();

    renderDate();
    setupSectionButtons();
    setupIdParser();
    setupProfileUploadButton();
    setupCancelButton();

    try {
        await Promise.all([
            loadSidebarSocieties(),
            loadSocieties(),
            loadUserData(),
            loadNotifications()
        ]);
    } catch (err) {
        console.log(err);
    } finally {
        setTimeout(() => {
            finishPageLoader();
        }, 500);
    }
});

// ================= DATE =================
function renderDate() {
    const dateEl = document.getElementById('date');
    if (!dateEl) return;

    const formatter = new Intl.DateTimeFormat('en-ZA', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    dateEl.textContent = formatter.format(new Date());
}

// ================= LOAD USER PROFILE =================
async function loadUserData() {
    try {
        const res = await fetch(`${API_BASE}/api/auth/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const [user] = await res.json();

        currentProfileUser = user;

        // Sidebar user info
        document.getElementById('userName').textContent =
            `${user.first_name} ${user.last_name}`;

        document.getElementById('userEmail').textContent =
            user.email;

        // Header user info
        document.getElementById('profileName').textContent =
            `${user.first_name} ${user.last_name}`;

        document.getElementById('profileEmail').textContent =
            user.email;

        localStorage.setItem('user_id', user.user_id);

        setDisplayField('firstName', user.first_name);
        setDisplayField('lastName', user.last_name);
        setDisplayField('idNumber', user.id_number);
        setDisplayField('gender', user.gender);
        setDisplayField('dob', toInputDate(user.date_of_birth));
        setDisplayField('age', calculateAge(user.date_of_birth));

        setDisplayField('email', user.email);
        setDisplayField('phone', user.phone);

        setDisplayField('addressLine1', user.address_line1);
        setDisplayField('city', user.city);
        setDisplayField('province', user.province);
        setDisplayField('postalCode', user.postal_code);

        setDisplayField('nextOfKinName', user.next_of_kin_name);
        setDisplayField('nextOfKinPhone', user.next_of_kin_phone);

        lockReadOnlyFields();

    } catch (err) {
        console.log(err);
        alert('Error loading profile details');
    }
}

function setDisplayField(inputId, value) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.value = value || '';

    input.classList.add('hidden');
    input.disabled = true;

    let display = document.getElementById(`${inputId}-display`);

    if (!display) {
        display = document.createElement('div');
        display.id = `${inputId}-display`;
        display.className = 'field-display';

        input.parentNode.insertBefore(display, input);
    }

    display.style.display = 'block';
    display.textContent = value || 'Not added yet';

    if (!value) {
        display.classList.add('empty');
    } else {
        display.classList.remove('empty');
    }
}

function lockReadOnlyFields() {
    ['firstName', 'lastName', 'email', 'age'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.disabled = true;
    });

    if (currentProfileUser?.id_number) {
        const idInput = document.getElementById('idNumber');
        if (idInput) idInput.disabled = true;
    }
}

// ================= SECTION EDIT/SAVE =================
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

        if (id === 'idNumber' && currentProfileUser?.id_number) {
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

    const validationError = validateSection(sectionName, data);

    if (validationError) {
        showMessage(message, validationError, 'red');
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/users/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) {
            showMessage(message, result.message || 'Failed to save details', 'red');
            return;
        }

        showMessage(message, `${sectionName} details saved`, 'green');

        button.textContent = 'Edit';
        button.classList.remove('saving');

        await loadUserData();

    } catch (err) {
        console.log(err);
        showMessage(message, 'Something went wrong while saving details', 'red');
    }
}

function buildSectionData(sectionName) {
    if (sectionName === 'personal') {
        return {
            idNumber: getValue('idNumber'),
            gender: getValue('gender'),
            dob: getValue('dob')
        };
    }

    if (sectionName === 'contact') {
        return {
            phone: getValue('phone')
        };
    }

    if (sectionName === 'address') {
        return {
            addressLine1: getValue('addressLine1'),
            city: getValue('city'),
            province: getValue('province'),
            postalCode: getValue('postalCode')
        };
    }

    if (sectionName === 'kin') {
        return {
            nextOfKinName: getValue('nextOfKinName'),
            nextOfKinPhone: getValue('nextOfKinPhone')
        };
    }

    return {};
}

function getValue(id) {
    const el = document.getElementById(id);
    return el && el.value.trim() !== '' ? el.value.trim() : null;
}

function validateSection(sectionName, data) {
    if (sectionName === 'personal') {
        if (data.idNumber && !/^[0-9]{13}$/.test(data.idNumber)) {
            return 'ID number must be 13 digits';
        }
    }

    if (sectionName === 'contact') {
        if (data.phone && !/^[0-9]{10}$/.test(data.phone)) {
            return 'Phone number must be 10 digits';
        }
    }

    if (sectionName === 'address') {
        if (data.postalCode && !/^[0-9]{4}$/.test(data.postalCode)) {
            return 'Postal code must be 4 digits';
        }
    }

    if (sectionName === 'kin') {
        if (data.nextOfKinPhone && !/^[0-9]{10}$/.test(data.nextOfKinPhone)) {
            return 'Next of kin phone must be 10 digits';
        }
    }

    return null;
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

function showMessage(el, text, color) {
    el.textContent = text;
    el.style.color = color;

    setTimeout(() => {
        el.textContent = '';
    }, 2500);
}

// ================= FILE UPLOAD BUTTON =================
function setupProfileUploadButton() {
    if (!updateBtn) return;

    updateBtn.addEventListener('click', async e => {
        e.preventDefault();

        const message = document.getElementById('message');

        const profilePhoto = document.getElementById('profilePhoto')?.files[0];
        const idDocument = document.getElementById('idDocument')?.files[0];
        const bankingProof = document.getElementById('bankingProof')?.files[0];

        const hasFiles = profilePhoto || idDocument || bankingProof;

        if (!hasFiles) {
            message.textContent = 'Choose a file to upload first';
            message.style.color = '#777';
            return;
        }

        const formData = new FormData();

        if (profilePhoto) formData.append('profilePhoto', profilePhoto);
        if (idDocument) formData.append('idDocument', idDocument);
        if (bankingProof) formData.append('bankingProof', bankingProof);

        try {
            const res = await fetch(`${API_BASE}/api/users/upload-documents`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const result = await res.json();

            if (!res.ok) {
                message.textContent = result.message || 'Upload failed';
                message.style.color = 'red';
                return;
            }

            if (result.profilePhoto) {
                document.querySelectorAll('.user-avatar').forEach(img => {
                    img.src = result.profilePhoto.startsWith('http')
                        ? result.profilePhoto
                        : `${API_BASE}${result.profilePhoto}`;
                });
            }

            message.textContent = result.message || 'Files uploaded successfully';
            message.style.color = 'green';

            clearFileInputs();

            await loadUserData();

        } catch (err) {
            console.log(err);

            message.textContent = 'Something went wrong while uploading files';
            message.style.color = 'red';
        }
    });
}

function clearFileInputs() {
    ['profilePhoto', 'idDocument', 'bankingProof'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '';
    });
}

// ================= CANCEL =================
function setupCancelButton() {
    if (!cancelBtn) return;

    cancelBtn.onclick = () => {
        location.reload();
    };
}

// ================= ID NUMBER PARSER =================
function setupIdParser() {
    const idInput = document.getElementById('idNumber');

    if (!idInput) return;

    idInput.addEventListener('input', e => {
        parseIDNumber(e.target.value);
    });
}

function parseIDNumber(id) {
    if (!id || id.length !== 13) return;
    if (!/^[0-9]{13}$/.test(id)) return;

    const yy = id.slice(0, 2);
    const mm = id.slice(2, 4);
    const dd = id.slice(4, 6);
    const genderDigits = Number(id.slice(6, 10));

    const currentYY = new Date().getFullYear() % 100;
    const fullYear = Number(yy) <= currentYY ? `20${yy}` : `19${yy}`;

    const dobString = `${fullYear}-${mm}-${dd}`;
    const dob = new Date(dobString);

    if (isNaN(dob.getTime())) return;

    const gender = genderDigits >= 5000 ? 'Male' : 'Female';

    const genderInput = document.getElementById('gender');
    const dobInput = document.getElementById('dob');
    const ageInput = document.getElementById('age');

    if (genderInput) genderInput.value = gender;
    if (dobInput) dobInput.value = dobString;
    if (ageInput) ageInput.value = calculateAge(dobString);
}

// ================= SOCIETY LIST =================
async function loadSocieties() {
    const res = await fetch(`${API_BASE}/api/dashboard/societies`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const societies = await res.json();

    const container = document.querySelector('.society-list');
    if (!container) return;

    container.innerHTML = '';

    const count = document.getElementById('count');
    if (count) count.innerText = `(${societies.length})`;

    societies.forEach(s => {
        const initials = s.society_name
            .split(' ')
            .map(w => w[0])
            .join('')
            .substring(0, 2);

        const canLeave = s.role !== 'admin';

        container.innerHTML += `
            <div class="society-item-wrapper">
                <div class="society-item" onclick="openSociety(${s.id}, '${s.role}')">
                    <div class="society-avatar">${initials}</div>

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
                            onclick="event.stopPropagation(); leaveSociety(${s.id})"
                        >
                            Leave
                        </button>
                    `
                    : `<span class="admin-badge-label">Admin</span>`
                }
            </div>
        `;
    });
}

// ================ LEAVE SOCIETY =====================
async function leaveSociety(societyId) {
    const confirmLeave = confirm(
        'Are you sure you want to leave this society?'
    );

    if (!confirmLeave) return;

    try {
        const res = await fetch(`${API_BASE}/api/users/leave/${societyId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();

        alert(data.message);

        await loadSocieties();
        await loadSidebarSocieties();

    } catch (err) {
        console.log(err);
        alert('Error leaving society');
    }
}

// ================= HELPERS =================
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

function toInputDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);

    if (isNaN(date.getTime())) return '';

    return date.toISOString().split('T')[0];
}
