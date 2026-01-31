document.addEventListener("DOMContentLoaded", () => {
    const postContainer = document.querySelector(".post-container");
    const newPostFormContainer = document.querySelector(".post-form");
    const newPostForm = document.getElementById("new-post-form");
    let token = localStorage.getItem('token');

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

    const fetchPosts = async () => {
        if (!token) {
            postContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; background: #1b263b; border-radius: 12px; margin-top: 20px;">
                    <h2>Authentication Required</h2>
                    <p>Please <a href="sign-up.html#signin" style="color: #b4793d; font-weight: bold;">log in</a> to view and join the discussions.</p>
                </div>
            `;
            if (newPostFormContainer) newPostFormContainer.style.display = 'none';
            return;
        }
        const response = await fetch(API_BASE + "/posts", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const posts = await response.json();
        postContainer.innerHTML = "";
        posts.forEach(post => {
            const postElement = document.createElement("div");
            postElement.classList.add("post");
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p>${post.content}</p>
                <button class="like-button" data-id="${post.id}">Like (${post.likes})</button>
                <button class="share-button" data-id="${post.id}">Share</button>
                <div class="comment-section">
                    <h4>Comments</h4>
                    <div class="comments">
                        ${post.comments.map(comment => `<p>${comment}</p>`).join("")}
                    </div>
                    <form class="comment-form" data-id="${post.id}">
                        <input type="text" placeholder="Add a comment" required>
                        <button type="submit">Comment</button>
                    </form>
                </div>
            `;
            postContainer.appendChild(postElement);
        });
    };

    newPostForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("post-title").value;
        const content = document.getElementById("post-content").value;
        await fetch(API_BASE + "/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title, content }),
        });
        fetchPosts();
    });

    postContainer.addEventListener("click", async (e) => {
        if (e.target.classList.contains("like-button")) {
            const postId = e.target.dataset.id;
            await fetch(`${API_BASE}/posts/${postId}/like`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            fetchPosts();
        } else if (e.target.classList.contains("share-button")) {
            const postId = e.target.dataset.id;
            const postUrl = `${window.location.origin}/discussion-board.html#post-${postId}`;
            navigator.clipboard.writeText(postUrl).then(() => {
                alert("Post link copied to clipboard!");
            });
        }
    });

    postContainer.addEventListener("submit", async (e) => {
        if (e.target.classList.contains("comment-form")) {
            e.preventDefault();
            const postId = e.target.dataset.id;
            const comment = e.target.querySelector("input").value;
            await fetch(`${API_BASE}/posts/${postId}/comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ comment }),
            });
            fetchPosts();
        }
    });

    fetchPosts();
});
