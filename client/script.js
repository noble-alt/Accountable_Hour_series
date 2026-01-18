document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle Logic (if applicable)
    const themeToggle = document.getElementById('theme-toggle');
    const lightIcon = document.getElementById('theme-icon-light');
    const darkIcon = document.getElementById('theme-icon-dark');

    const applyTheme = (theme) => {
        if (!lightIcon || !darkIcon) return;
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            lightIcon.style.display = 'none';
            darkIcon.style.display = 'block';
        } else {
            document.body.classList.remove('dark-mode');
            lightIcon.style.display = 'block';
            darkIcon.style.display = 'none';
        }
    };

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDarkMode = document.body.classList.contains('dark-mode');
            const newTheme = isDarkMode ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }

    // Login/Logout Toggle Logic
    const token = localStorage.getItem('token');
    // Select all links in the navbar
    const navLinks = document.querySelectorAll('.navbar a, .nav-links a, .nav-actions a');

    navLinks.forEach(link => {
        const text = link.textContent.trim().toLowerCase();
        // Specifically target "Log In" or "Log Out" links
        if (text === 'log in' || text === 'log out') {
            if (token) {
                link.textContent = 'Log Out';
                link.href = '#';
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('token');
                    window.location.href = 'index.html';
                });
            } else {
                link.textContent = 'Log In';
                link.href = 'sign-up.html#signin';
            }
        }
    });

    if (token) {
        // Update Hero/Action buttons to redirect to Discussion Board if they point to signup
        const actionButtons = document.querySelectorAll('.hero a, .hero-text a, .join-section a, .join-card a, .btn-solid');
        actionButtons.forEach(btn => {
            const link = btn.tagName === 'A' ? btn : btn.querySelector('a');
            if (link && (link.getAttribute('href') === 'sign-up.html' || link.getAttribute('href') === 'sign-up.html#signup')) {
                link.textContent = 'Join Discussion';
                link.href = 'discussion-board.html';
            }
        });
    }
});
