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
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    // Select all links in the navbar
    const navLinks = document.querySelectorAll('.navbar a, .nav-links a, .nav-actions a');

    navLinks.forEach(link => {
        const text = link.textContent.trim().toLowerCase();

        // Target "Log In"
        if (text === 'log in') {
            if (token) {
                link.style.display = 'none'; // Hide Log In if logged in
            } else {
                link.style.display = 'inline-block';
                link.href = 'sign-up.html#signin';
            }
        }

        // Target "Meet Mentors" (or similar button in nav-actions)
        if (text === 'meet mentors') {
            if (token && user && user.fullname) {
                const firstName = user.fullname.split(' ')[0];
                link.textContent = `Hi ${firstName}`;
                // Optionally add logout functionality if clicked?
                // For now, just change text as requested.
                link.addEventListener('click', (e) => {
                    // If the user wants to logout, they can click their name
                    if (confirm('Do you want to log out?')) {
                        e.preventDefault(); // Only prevent navigation if logging out
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = 'index.html';
                    }
                    // Otherwise, proceed to mentor profile (the default behavior)
                });
            }
        }
    });
});
