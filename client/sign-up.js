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

    const getApiBase = () => {
        if (window.location.protocol === 'file:') {
            return 'http://localhost:3000';
        }
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        if (!window.location.port || window.location.port !== '3000') {
            return `${protocol}//${hostname}:3000`;
        }
        return '';
    };

    const API_BASE = getApiBase();

    // Check for file:// protocol
    if (window.location.protocol === 'file:') {
        showError('<strong>Warning:</strong> You are accessing this page via the <code>file://</code> protocol. Signup and Signin will NOT work. Please run the server and access via <code>http://localhost:3000</code>.');
    }

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
            showError('Browser storage is restricted. Login state might not be saved.');
        }
        if (token) {
            showError('You are currently logged in. To use a different account, please log out.');
            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.textContent = ' Log Out Now';
            logoutLink.style.color = '#b4793d';
            logoutLink.style.fontWeight = 'bold';
            logoutLink.style.textDecoration = 'underline';
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                location.reload();
            });
            errorMessage.appendChild(logoutLink);
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

        console.log(`Form submitted for ${isSignUp ? 'signup' : 'login'} at ${endpoint}`);

        // More robust form data extraction
        const data = {};
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.name) {
                data[input.name] = input.value.trim();
            }
        });

        if (!isSignUp) {
            delete data.fullname;
        } else if (!data.fullname) {
            showError('Fullname is required for signup');
            return;
        }

        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;

        try {
            console.log('Sending data:', { ...data, password: '***' });
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            console.log('Response status:', response.status);

            let result;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                result = await response.json();
            } else {
                result = { message: await response.text() };
            }

            if (response.ok) {
                console.log('Request successful:', result.message);
                if (result.token) {
                    try {
                        localStorage.setItem('token', result.token);
                    } catch (e) {
                        console.error('Failed to save token:', e);
                        showError('Login successful, but failed to save session. Check browser settings.');
                    }
                }

                // Show success message on page instead of alert for better UX
                submitBtn.textContent = 'Success!';
                submitBtn.style.backgroundColor = '#6a994e';

                const successMsg = document.createElement('div');
                successMsg.textContent = (result.message || 'Success!') + ' Redirecting...';
                successMsg.style.color = '#6a994e';
                successMsg.style.marginTop = '10px';
                form.appendChild(successMsg);

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                console.warn('Request failed:', response.status, result.message);
                let msg = result.message || 'An error occurred during ' + (isSignUp ? 'signup' : 'login');
                if (isSignUp && response.status === 409) {
                    msg += '<br><a href="#signin" style="color: #b4793d; text-decoration: underline; font-weight: bold;">Click here to Sign In instead!</a>';
                }
                showError(msg);
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error:', error);
            showError(`<strong>Network Error:</strong> ${error.message}<br>Please ensure the server is running on port 3000 and CORS allows requests from this origin.`);
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
