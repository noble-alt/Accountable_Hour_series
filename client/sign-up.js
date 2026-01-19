document.addEventListener('DOMContentLoaded', () => {
    const signupBtn = document.getElementById('signup-btn');
    const signinBtn = document.getElementById('signin-btn');
    const toggleMessage = document.querySelector('.toggle-message');
    const fullnameGroup = document.getElementById('fullname-group');
    const fullnameInput = fullnameGroup.querySelector('input');
    const form = document.getElementById('login-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    const errorMessage = document.getElementById('error-message');

    const showError = (msg) => {
        errorMessage.innerHTML = msg;
        errorMessage.style.display = 'block';
    };

    const hideError = () => {
        errorMessage.style.display = 'none';
        errorMessage.innerHTML = '';
    };

    const updateUI = (mode) => {
        const title = document.querySelector('.login-box h1');
        if (mode === 'signup') {
            title.textContent = 'Create Account';
            signupBtn.classList.add('active');
            signinBtn.classList.remove('active');
            toggleMessage.innerHTML = 'Already have an account? <a href="#signin">Sign in!</a>';
            fullnameGroup.style.display = 'block';
            fullnameInput.required = true;
            submitBtn.textContent = 'Continue';
        } else {
            title.textContent = 'Welcome Back';
            signinBtn.classList.add('active');
            signupBtn.classList.remove('active');
            toggleMessage.innerHTML = 'No Account? <a href="#signup">Sign up!!</a>';
            fullnameGroup.style.display = 'none';
            fullnameInput.required = false;
            submitBtn.textContent = 'Log In';
        }
    };

    signupBtn.addEventListener('click', () => {
        window.location.hash = 'signup';
    });

    signinBtn.addEventListener('click', () => {
        window.location.hash = 'signin';
    });

    window.addEventListener('hashchange', () => {
        const mode = window.location.hash === '#signin' ? 'signin' : 'signup';
        updateUI(mode);
    });

    const API_BASE = 'http://localhost:3000';

    // Server Connectivity Check
    const serverStatus = document.getElementById('server-status');
    if (serverStatus) serverStatus.innerHTML = 'Checking server connection...';

    const checkServerHealth = async () => {
        if (!serverStatus) return;
        try {
            const res = await fetch(API_BASE + '/health');
            if (res.ok) {
                serverStatus.innerHTML = '<span style="color: #6a994e;">● Server Connected</span>';
            } else {
                serverStatus.innerHTML = '<span style="color: #ff4d4d;">● Server Error (' + res.status + ')</span>';
            }
        } catch (err) {
            serverStatus.innerHTML = '<span style="color: #ff4d4d;">● Server Disconnected (Is the server running?)</span>';
        }
    };

    checkServerHealth();
    setInterval(checkServerHealth, 5000);

    // Handle already logged in state
    const checkLoginStatus = () => {
        let token;
        try {
            token = localStorage.getItem('token');
        } catch (e) {
            console.error('localStorage access denied:', e);
        }
        if (token) {
            const loginBox = document.querySelector('.login-box');
            loginBox.innerHTML = `
                <h1>Account</h1>
                <p class="toggle-message" style="color: #6a994e;">● You are currently logged in.</p>
                <div style="margin: 20px 0; text-align: left;">
                    <p><strong>Email:</strong> ${localStorage.getItem('userEmail') || 'User'}</p>
                </div>
                <button id="logout-page-btn" class="continue-btn">Sign Out</button>
                <div class="or-divider"><span>Or</span></div>
                <a href="index.html" style="color: #b4793d; text-decoration: none; font-weight: bold;">Back to Home</a>
            `;

            document.getElementById('logout-page-btn').addEventListener('click', () => {
                localStorage.removeItem('token');
                localStorage.removeItem('userEmail');
                location.reload();
            });
        }
    };

    checkLoginStatus();

    // Initialize UI based on hash
    const initialMode = window.location.hash === '#signin' ? 'signin' : 'signup';
    updateUI(initialMode);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        const isSignUp = window.location.hash !== '#signin';
        const endpoint = API_BASE + (isSignUp ? '/signup' : '/login');

        const data = {};
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.name) {
                data[input.name] = input.value.trim();
            }
        });

        if (isSignUp && !data.fullname) {
            showError('Fullname is required for signup');
            return;
        }

        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                if (result.token) {
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('userEmail', data.email);
                }

                submitBtn.textContent = 'Success!';
                submitBtn.style.backgroundColor = '#6a994e';

                const successMsg = document.createElement('div');
                successMsg.textContent = result.message + ' Redirecting...';
                successMsg.style.color = '#6a994e';
                successMsg.style.marginTop = '10px';
                form.appendChild(successMsg);

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                let msg = result.message || 'An error occurred';
                if (isSignUp && response.status === 409) {
                    msg += '<br><a href="#signin" style="color: #b4793d; text-decoration: underline; font-weight: bold;">Click here to Sign In instead!</a>';
                }
                showError(msg);
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error:', error);
            showError(`<strong>Network Error:</strong> Cannot connect to server. Please ensure the backend is running.`);
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    const socialIcons = document.querySelectorAll('.social-login i');
    socialIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            showError('Social login is not yet implemented. Please use the form.');
        });
    });
});
