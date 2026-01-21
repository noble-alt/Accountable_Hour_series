document.addEventListener("DOMContentLoaded", () => {
    const adminLoginForm = document.getElementById("admin-login-form");
    const adminLogin = document.getElementById("admin-login");
    const adminDashboard = document.getElementById("admin-dashboard");
    const totalUsers = document.getElementById("total-users");
    const totalPosts = document.getElementById("total-posts");
    const usersTableBody = document.getElementById("users-table-body");

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

    let token = null;

    adminLoginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("admin-username").value;
        const password = document.getElementById("admin-password").value;

        const response = await fetch(API_BASE + "/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            token = data.token;
            localStorage.setItem('token', token);
            adminLogin.style.display = "none";
            adminDashboard.style.display = "block";
            fetchStats();
            fetchUsers();
        } else {
            alert("Invalid credentials");
        }
    });

    const fetchStats = async () => {
        if (!token) {
            token = localStorage.getItem('token');
        }
        if (!token) {
            console.error('No token found');
            return;
        }

        const postsResponse = await fetch(API_BASE + "/posts", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const posts = await postsResponse.json();
        totalPosts.textContent = posts.length;
    };

    const fetchUsers = async () => {
        if (!token) {
            token = localStorage.getItem('token');
        }
        if (!token) {
            console.error('No token found');
            return;
        }

        const usersResponse = await fetch(API_BASE + "/users", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const users = await usersResponse.json();
        totalUsers.textContent = users.length;

        usersTableBody.innerHTML = "";
        users.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.fullname}</td>
                <td>${user.email}</td>
                <td><button class="delete-button" data-email="${user.email}">Delete</button></td>
            `;
            usersTableBody.appendChild(row);
        });
    };

    usersTableBody.addEventListener("click", async (e) => {
        if (e.target.classList.contains("delete-button")) {
            const email = e.target.dataset.email;
            if (confirm(`Are you sure you want to delete the user with email ${email}?`)) {
                await fetch(`${API_BASE}/users/${email}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                fetchUsers();
            }
        }
    });
});
