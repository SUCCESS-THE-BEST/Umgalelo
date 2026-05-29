// createSociety.js
// common.js must load before this file

if (!token) {
    window.location.href = 'login.html';
}

window.onload = async () => {
    await loadUser();
    await loadSidebarSocieties();

    setupCreateSocietyForm();
    setupCancelButton();
};

// ================= SETUP =================
function setupCreateSocietyForm() {
    const form = document.querySelector('.society-form');
    const createBtn = document.getElementById('create');

    if (!form || !createBtn) return;

    form.addEventListener('submit', createSociety);
    createBtn.addEventListener('click', createSociety);
}

function setupCancelButton() {
    const cancel = document.getElementById('cancel');

    if (!cancel) return;

    cancel.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
}

// ================= CREATE SOCIETY =================
async function createSociety(e) {
    e.preventDefault();

    const message = document.getElementById('message');

    clearErrors();

    const data = getSocietyFormData();

    const errors = validateSocietyForm(data);

    if (errors.length > 0) {
        showFormErrors(errors);
        showMessage('Please fix the highlighted fields', 'red');
        return;
    }

    try {
        setButtonLoading(true);

        const res = await fetch(`${API_BASE}/api/societies/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) {
            showMessage(result.message || 'Could not create society', 'red');
            return;
        }

        showMessage('Society created successfully!', 'green');

        window.scrollTo(0, 0);

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1800);

    } catch (err) {
        console.log(err);
        showMessage('Something went wrong while creating the society', 'red');

    } finally {
        setButtonLoading(false);
    }
}

// ================= FORM DATA =================
function getSocietyFormData() {
    return {
        societyName: getValue('societyName'),
        description: getValue('description'),
        monthlyContribution: getValue('monthlyContribution'),
        coverAmount: getValue('coverAmount'),
        waitingPeriod: getValue('waitingPeriod'),
        additionalRules: getValue('additionalRules'),
        province: getValue('province'),
        city: getValue('city'),
        maximumMembers: getValue('maxMembers'),
        minimumAge: getValue('minAge')
    };
}

function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
}

// ================= VALIDATION =================
function validateSocietyForm(data) {
    const errors = [];

    required(errors, 'societyName', data.societyName, 'Society name is required');
    required(errors, 'description', data.description, 'Description is required');
    required(errors, 'province', data.province, 'Province is required');
    required(errors, 'city', data.city, 'City/Township is required');

    required(errors, 'monthlyContribution', data.monthlyContribution, 'Monthly contribution is required');
    required(errors, 'coverAmount', data.coverAmount, 'Cover amount is required');
    required(errors, 'waitingPeriod', data.waitingPeriod, 'Waiting period is required');

    required(errors, 'maxMembers', data.maximumMembers, 'Maximum members is required');

    numberMin(errors, 'monthlyContribution', data.monthlyContribution, 1, 'Monthly contribution must be greater than 0');
    numberMin(errors, 'coverAmount', data.coverAmount, 1, 'Cover amount must be greater than 0');
    numberMin(errors, 'waitingPeriod', data.waitingPeriod, 0, 'Waiting period cannot be negative');
    numberMin(errors, 'maxMembers', data.maximumMembers, 2, 'Maximum members must be at least 2');

    if (data.minimumAge !== '') {
        numberMin(errors, 'minAge', data.minimumAge, 18, 'Minimum age must be at least 18');
    }

    if (data.societyName.length > 100) {
        errors.push({
            id: 'societyName',
            message: 'Society name is too long'
        });
    }

    return errors;
}

// required validation, for all inputs that are required when creating a society
function required(errors, id, value, message) {
    if (!value) {
        errors.push({ id, message });
    }
}

// number validation, some cant be zero, some cant be a negative number
function numberMin(errors, id, value, min, message) {
    if (value === '') return;

    const number = Number(value);

    if (Number.isNaN(number) || number < min) {
        errors.push({ id, message });
    }
}

// ================= DISPLAY ERRORS =================
function showFormErrors(errors) {
    errors.forEach(error => {
        const input = document.getElementById(error.id);

        if (!input) return;

        input.style.borderColor = 'red';

        const errorEl = getOrCreateErrorElement(input);

        errorEl.textContent = error.message;
        errorEl.style.color = 'red';
    });

    const firstError = document.getElementById(errors[0].id);

    if (firstError) {
        firstError.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

function getOrCreateErrorElement(input) {
    let errorEl = input.parentElement.querySelector('.field-error');

    if (!errorEl) {
        errorEl = document.createElement('small');
        errorEl.className = 'field-error';
        input.parentElement.appendChild(errorEl);
    }

    return errorEl;
}

function clearErrors() {
    document.querySelectorAll('.form-input, .form-textarea').forEach(input => {
        input.style.borderColor = '';
    });

    document.querySelectorAll('.field-error').forEach(error => {
        error.textContent = '';
    });
}

// ================= MESSAGE =================
function showMessage(text, color = 'green') {
    const message = document.getElementById('message');

    if (!message) return;

    message.textContent = text;
    message.style.color = color;

    window.scrollTo(0, 0);
}

// ================= BUTTON STATE =================
function setButtonLoading(isLoading) {
    const create = document.getElementById('create');

    if (!create) return;

    create.disabled = isLoading;
    create.textContent = isLoading
        ? 'Creating...'
        : 'Create Society';
}