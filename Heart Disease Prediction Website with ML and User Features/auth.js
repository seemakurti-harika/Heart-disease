// Authentication functionality
class AuthManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('heartcare_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('heartcare_current_user')) || null;
        this.initializeEventListeners();
        this.checkAuthStatus();
    }

    initializeEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginFormElement');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerFormElement');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }

    checkAuthStatus() {
        if (this.currentUser && window.location.pathname.includes('index.html')) {
            // Redirect to dashboard if already logged in
            window.location.href = 'dashboard.html';
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading"></div><span>Signing In...</span>';
        submitBtn.disabled = true;

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            const user = this.users.find(u => u.email === email && u.password === password);
            
            if (user) {
                // Successful login
                this.currentUser = { ...user };
                delete this.currentUser.password; // Don't store password in session
                
                localStorage.setItem('heartcare_current_user', JSON.stringify(this.currentUser));
                
                if (rememberMe) {
                    localStorage.setItem('heartcare_remember', 'true');
                }

                this.showMessage('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                throw new Error('Invalid email or password');
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Validation
        if (!agreeTerms) {
            this.showMessage('Please agree to the terms and conditions', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters long', 'error');
            return;
        }

        if (this.users.find(u => u.email === email)) {
            this.showMessage('Email already exists', 'error');
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading"></div><span>Creating Account...</span>';
        submitBtn.disabled = true;

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const newUser = {
                id: Date.now().toString(),
                firstName,
                lastName,
                email,
                phone,
                password,
                createdAt: new Date().toISOString(),
                lastLogin: null
            };

            this.users.push(newUser);
            localStorage.setItem('heartcare_users', JSON.stringify(this.users));

            this.showMessage('Account created successfully! Please sign in.', 'success');
            
            setTimeout(() => {
                switchToLogin();
                // Pre-fill email in login form
                document.getElementById('loginEmail').value = email;
            }, 1500);

        } catch (error) {
            this.showMessage('Registration failed. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    showMessage(text, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;

        // Insert message at the top of the active form
        const activeForm = document.querySelector('.auth-form.active form');
        if (activeForm) {
            activeForm.insertBefore(message, activeForm.firstChild);
            
            // Show message with animation
            setTimeout(() => {
                message.classList.add('show');
            }, 10);

            // Auto-hide after 5 seconds
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 5000);
        }
    }

    logout() {
        localStorage.removeItem('heartcare_current_user');
        localStorage.removeItem('heartcare_remember');
        window.location.href = 'index.html';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    updateUserProfile(updates) {
        if (this.currentUser) {
            this.currentUser = { ...this.currentUser, ...updates };
            localStorage.setItem('heartcare_current_user', JSON.stringify(this.currentUser));
            
            // Also update in users array
            const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex !== -1) {
                this.users[userIndex] = { ...this.users[userIndex], ...updates };
                localStorage.setItem('heartcare_users', JSON.stringify(this.users));
            }
        }
    }
}

// Form switching functions
function switchToRegister() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.add('active');
    
    // Clear any existing messages
    const messages = document.querySelectorAll('.message');
    messages.forEach(msg => msg.remove());
}

function switchToLogin() {
    document.getElementById('registerForm').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
    
    // Clear any existing messages
    const messages = document.querySelectorAll('.message');
    messages.forEach(msg => msg.remove());
}

// Password visibility toggle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Form validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// Real-time validation
document.addEventListener('DOMContentLoaded', function() {
    // Initialize auth manager
    window.authManager = new AuthManager();
    
    // Add real-time validation
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        input.addEventListener('input', function() {
            // Remove error styling on input
            this.style.borderColor = '';
        });
    });
});

function validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (input.type) {
        case 'email':
            if (value && !validateEmail(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
        case 'tel':
            if (value && !validatePhone(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
            break;
        case 'password':
            if (value && value.length < 6) {
                isValid = false;
                errorMessage = 'Password must be at least 6 characters';
            }
            break;
    }

    if (!isValid) {
        input.style.borderColor = 'var(--error-color)';
        showFieldError(input, errorMessage);
    } else {
        input.style.borderColor = '';
        hideFieldError(input);
    }

    return isValid;
}

function showFieldError(input, message) {
    hideFieldError(input); // Remove existing error
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: var(--error-color);
        font-size: 0.8rem;
        margin-top: 5px;
        margin-left: 45px;
    `;
    
    input.parentNode.appendChild(errorDiv);
}

function hideFieldError(input) {
    const existingError = input.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const activeForm = document.querySelector('.auth-form.active form');
        if (activeForm) {
            const submitBtn = activeForm.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                submitBtn.click();
            }
        }
    }
});

// Auto-focus first input
window.addEventListener('load', function() {
    const firstInput = document.querySelector('.auth-form.active input');
    if (firstInput) {
        firstInput.focus();
    }
});

