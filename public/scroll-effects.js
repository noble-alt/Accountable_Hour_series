document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // Global refresh to handle dynamic content
    window.addEventListener('load', () => {
        ScrollTrigger.refresh();
    });

    // --- HOME PAGE (index.html) ---
    if (document.querySelector('.hero-video')) {
        // 1. Hero Zoom
        gsap.to(".hero", {
            scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: "bottom top",
                scrub: true
            },
            backgroundSize: "120%",
            ease: "none"
        });

        // 2. Offers Staggered
        gsap.from(".offer-card", {
            scrollTrigger: {
                trigger: ".offers",
                start: "top 80%",
                end: "top 20%",
                scrub: 1
            },
            x: 200,
            opacity: 0,
            stagger: 0.3,
            ease: "power2.out"
        });

        // 3. Mentors Bounce
        gsap.from(".mentor", {
            scrollTrigger: {
                trigger: ".mentors",
                start: "top 75%",
            },
            scale: 0,
            opacity: 0,
            stagger: 0.2,
            duration: 1.2,
            ease: "back.out(1.7)"
        });

        // 4. Story/Stats Slide
        gsap.from(".story p, .stats-wrapper", {
            scrollTrigger: { trigger: ".story", start: "top 80%" },
            y: 50,
            opacity: 0,
            duration: 1,
            stagger: 0.3
        });

        // 5. Events reveal
        gsap.from(".event-item", {
            scrollTrigger: {
                trigger: ".events-list-section",
                start: "top 70%"
            },
            x: -100,
            opacity: 0,
            stagger: 0.3,
            duration: 1
        });
    }

    // --- ABOUT US PAGE (about-us.html) ---
    if (document.querySelector('.bento-grid')) {
        // 1. Hero Slide-in from Sides
        gsap.from(".hero-text", {
            x: -200,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        });
        gsap.from(".hero-img", {
            x: 200,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        });

        // 2. Stats Pop
        gsap.from(".stat-card", {
            scrollTrigger: {
                trigger: ".stats-container",
                start: "top 80%"
            },
            scale: 0.5,
            opacity: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "back.out(1.7)"
        });

        // 3. Bento grid
        gsap.from(".v-card", {
            scrollTrigger: {
                trigger: ".values-section",
                start: "top 70%"
            },
            y: 50,
            opacity: 0,
            stagger: 0.15,
            duration: 0.8
        });

        // 4. Content Rows Individual Side Slide
        gsap.utils.toArray(".content-row").forEach((row) => {
            const isReverse = row.classList.contains('reverse');
            gsap.from(row.querySelector('.text-block'), {
                scrollTrigger: {
                    trigger: row,
                    start: "top 80%"
                },
                x: isReverse ? 200 : -200,
                opacity: 0,
                duration: 1.2,
                ease: "power2.out"
            });
            gsap.from(row.querySelector('.img-block'), {
                scrollTrigger: {
                    trigger: row,
                    start: "top 80%"
                },
                x: isReverse ? -200 : 200,
                opacity: 0,
                duration: 1.2,
                ease: "power2.out"
            });
        });

        // 5. Team zoom
        gsap.from(".team-card", {
            scrollTrigger: {
                trigger: ".team-section",
                start: "top 70%"
            },
            scale: 0.8,
            opacity: 0,
            stagger: 0.2,
            duration: 0.8
        });
    }

    // --- SERVICES PAGE (service.html) ---
    if (document.querySelector('.services-container')) {
        // 1. Hero Text from Sides
        gsap.from(".hero h1", {
            x: -200,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        });
        gsap.from(".hero p", {
            x: 200,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        });

        // 2. Service rows Individual Side Slide
        gsap.utils.toArray(".service-row").forEach((row) => {
            const isReverse = row.classList.contains('reverse');
            gsap.from(row.querySelector('.text-content'), {
                scrollTrigger: {
                    trigger: row,
                    start: "top 80%"
                },
                x: isReverse ? 200 : -200,
                opacity: 0,
                duration: 1.2,
                ease: "power2.out"
            });
            gsap.from(row.querySelector('.image-content'), {
                scrollTrigger: {
                    trigger: row,
                    start: "top 80%"
                },
                x: isReverse ? -200 : 200,
                opacity: 0,
                duration: 1.2,
                ease: "power2.out"
            });
        });

        // 3. Ticker Slide
        if (document.querySelector('.ticker')) {
            gsap.from(".ticker", {
                scrollTrigger: {
                    trigger: ".ticker",
                    start: "top 90%"
                },
                x: -50,
                opacity: 0,
                duration: 1
            });
        }

        // 4. Bottom CTA
        gsap.from(".bottom-cta", {
            scrollTrigger: {
                trigger: ".bottom-cta",
                start: "top 90%"
            },
            opacity: 0,
            scale: 0.9,
            duration: 1
        });
    }

    // --- EVENTS PAGE (event.html) ---
    if (document.querySelector('.content-grid')) {
        // 1. Hero
        gsap.from(".hero h1, .hero p", {
            y: 30,
            opacity: 0,
            duration: 1,
            stagger: 0.2
        });

        // 2. Featured
        gsap.from(".featured-card", {
            opacity: 0,
            y: 50,
            duration: 1
        });

        // 3. List cards
        gsap.from(".list-card", {
            scrollTrigger: {
                trigger: ".event-list",
                start: "top 80%"
            },
            opacity: 0,
            x: -50,
            stagger: 0.2,
            duration: 0.8
        });

        // 4. Calendar
        gsap.from(".calendar-card", {
            scrollTrigger: {
                trigger: ".calendar-sidebar",
                start: "top 80%"
            },
            opacity: 0,
            x: 50,
            duration: 0.8
        });
    }

    // --- GALLERY PAGE (gallery.html) ---
    if (document.querySelector('.masonry-grid')) {
        // 1. Masonry
        gsap.from(".grid-item", {
            scale: 0.5,
            opacity: 0,
            stagger: 0.1,
            duration: 1,
            ease: "power2.out"
        });

        // 2. Special moments
        gsap.from(".moment-box", {
            scrollTrigger: {
                trigger: ".special-moments",
                start: "top 70%"
            },
            scale: 0.8,
            opacity: 0,
            stagger: 0.1,
            duration: 0.8
        });

        // 3. Controls
        gsap.from(".page-controls", {
            scrollTrigger: {
                trigger: ".page-controls",
                start: "top 95%"
            },
            y: 20,
            opacity: 0,
            duration: 1
        });
    }

    // --- CONTACT US PAGE (contact-us.html) ---
    if (document.querySelector('.contact-container')) {
        // 1. Hero
        gsap.from(".header-center h1, .header-center p", {
            y: -30,
            opacity: 0,
            duration: 1,
            stagger: 0.2
        });

        // 2. Form Slide left
        gsap.from(".contact-form-box", {
            x: -100,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        });
        // 3. Info Slide right
        gsap.from(".contact-info-box", {
            x: 100,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        });

        // 4. FAQ Staggered
        gsap.from(".faq-item", {
            scrollTrigger: {
                trigger: ".faq-section",
                start: "top 80%"
            },
            y: 20,
            opacity: 0,
            stagger: 0.2,
            duration: 0.8
        });
    }

    // --- MENTOR PAGE (mentor-page.html) ---
    if (document.querySelector('.mentor-feed')) {
        // 1. Sidebar
        gsap.from(".sidebar", {
            x: -50,
            opacity: 0,
            duration: 0.8
        });
        // 2. Cards
        gsap.from(".mentor-card", {
            y: 50,
            opacity: 0,
            stagger: 0.2,
            duration: 0.8
        });
        // 3. Filter cards slide
        gsap.from(".filter-card", {
            opacity: 0,
            x: -20,
            stagger: 0.3,
            duration: 1
        });
    }

    // --- MENTOR PROFILE PAGE (mentor-profile.html) ---
    if (document.querySelector('.profile-header')) {
        // 1. Header
        gsap.from(".profile-header", {
            y: 50,
            opacity: 0,
            duration: 1
        });
        // 2. Pricing
        gsap.from(".pricing-card", {
            x: 50,
            opacity: 0,
            duration: 1,
            delay: 0.5
        });
        // 3. About/Skills/Similar
        gsap.from(".profile-about, .skills-section, .similar-mentors", {
            scrollTrigger: {
                trigger: ".profile-about",
                start: "top 80%"
            },
            y: 30,
            opacity: 0,
            stagger: 0.2,
            duration: 0.8
        });
    }

    // --- SIGN UP / SIGN IN PAGE (sign-up.html) ---
    if (document.querySelector('.login-box')) {
        // 1. Box
        gsap.from(".login-box", {
            y: 100,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
        // 2. Back home
        gsap.from(".back-home", {
            x: -20,
            opacity: 0,
            duration: 1,
            delay: 0.5
        });
        // 3. Social login staggered
        gsap.from(".social-login i", {
            y: 20,
            opacity: 0,
            stagger: 0.2,
            duration: 0.8,
            delay: 0.8
        });
    }

    // --- ADMIN PAGE (admin.html) ---
    if (document.querySelector('#admin-login')) {
        // 1. Login
        gsap.from("#admin-login", {
            scale: 0.9,
            opacity: 0,
            duration: 0.8
        });
        // 2. Dashboard content (if visible)
        if (document.querySelector('#admin-dashboard')) {
            gsap.from("#stats p, #user-management h2", {
                scrollTrigger: {
                    trigger: "#admin-dashboard",
                    start: "top 80%"
                },
                y: 20,
                opacity: 0,
                stagger: 0.2,
                duration: 0.8
            });
        }
    }

    // --- DISCUSSION BOARD (discussion-board.html) ---
    if (document.querySelector('.post-container')) {
        // 1. Title
        gsap.from("h1", {
            y: -20,
            opacity: 0,
            duration: 0.8
        });
        // 2. Post form
        gsap.from(".post-form", {
            scrollTrigger: {
                trigger: ".post-form",
                start: "top 90%"
            },
            y: 30,
            opacity: 0,
            duration: 0.8
        });
        // 3. Header nav items
        gsap.from(".navbar nav a", {
            opacity: 0,
            y: -10,
            stagger: 0.1,
            duration: 0.5
        });
    }
});
