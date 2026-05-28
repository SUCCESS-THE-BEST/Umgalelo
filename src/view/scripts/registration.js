const form = document.getElementById('registerForm');
const submit = document.getElementById('submit');

submit.addEventListener('click', async (e) => {
    e.preventDefault();

    clearErrors();

    const isValid = validate();

    if (!isValid) return;

    const password = document.getElementById('password').value;
    const confirmPassword =
        document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match');
        return;
    }

    const data = {
        firstName: document.getElementById('firstname').value.trim(),
        lastName: document.getElementById('lastname').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        password
    };

    try {
        const res = await fetch(
            'http://localhost:3000/api/auth/register',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }
        );

        const result = await res.json();

        if (!res.ok) {
            if (result.errors) {
                displayBackendErrors(result.errors);
            } else {
                alert(result.message);
            }

            return;
        }

        alert(result.message);
        window.location.href = 'login.html';

    } catch (error) {
        console.log(error);
        alert('Something went wrong. Please try again.');
    }
});

function validate() {
    let isValid = true;

    document.querySelectorAll('.form-group input')
        .forEach(input => {

            if (input.type === 'checkbox') return;

            if (input.value.trim() === '') {
                showError(input.id, 'Fill in field*');
                isValid = false;
            }
        });

    return isValid;
}

function displayBackendErrors(errors) {
    errors.forEach(error => {
        showError(error.path, error.msg);
    });
}

function showError(field, message) {
    const fieldMap = {
        firstName: 'firstname',
        lastName: 'lastname',
        email: 'email',
        phone: 'phone',
        password: 'password',
        confirmPassword: 'confirmPassword'
    };

    const inputId = fieldMap[field] || field;
    const input = document.getElementById(inputId);

    if (!input) return;

    const errorElement = getErrorElement(inputId);

    input.style.borderColor = 'red';

    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.color = 'red';
    }

    setTimeout(() => {
        input.style.borderColor = 'rgb(214, 214, 214)';

        if (errorElement) {
            errorElement.textContent = '';
        }
    }, 2000);
}

function clearErrors() {
    document.querySelectorAll('.form-group input')
        .forEach(input => {
            input.style.borderColor = 'rgb(214, 214, 214)';

            const errorElement = getErrorElement(input.id);

            if (errorElement) {
                errorElement.textContent = '';
            }
        });
}

function getErrorElement(inputId) {
    const errorMap = {
        firstname: 'firstname-error',
        lastname: 'lastname-error',
        email: 'email-error',
        phone: 'phone-error',
        password: 'password-error',
        confirmPassword: 'confirmpassword-error'
    };

    return document.getElementById(errorMap[inputId]);
}

const googleSignup = document.getElementById('googleSignup');

if (googleSignup) {
    googleSignup.addEventListener('click', () => {
        window.location.href = 'http://localhost:3000/api/auth/google';
    });
}