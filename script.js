document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;

        revealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;
            if (elTop < triggerBottom) {
                el.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // Add offset compensation if URL initially has a hash (e.g. loading from another page)
    if (window.location.hash) {
        // Wait briefly for layout render constraints
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) {
                const headerHeight = document.getElementById('main-header').offsetHeight || 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'auto'
                });
            }
        }, 150);
    }

    // 3. Smooth Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Ignore if href is just "#" (might be used for something else)
            if (this.getAttribute('href') === '#') return;

            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                const headerHeight = document.getElementById('main-header').offsetHeight || 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Update active navigation state visually
                document.querySelectorAll('.nav-links a').forEach(link => {
                    if (link.getAttribute('href').startsWith('#') || link.getAttribute('href') === 'index.html') {
                        link.classList.remove('active');
                    }
                });
                this.classList.add('active');
            }
        });
    });

    // 4. Parallax Effect for Hero
    window.addEventListener('scroll', () => {
        const scroll = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.backgroundPositionY = -(scroll * 0.5) + 'px';
        }
    });

    // 5. Form Submission via API Backend
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;

            btn.innerText = 'Sender...';
            btn.disabled = true;

            // Samle data fra formen
            try {
                const name = document.getElementById('contact-name').value;
                const email = document.getElementById('contact-email').value;
                const service = document.getElementById('contact-service').value;
                const message = document.getElementById('contact-message').value;

                // Send POST-forespørsel til backend
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, service, message })
                });

                if (response.ok) {
                    btn.innerText = 'Takk for din melding!';
                    btn.style.backgroundColor = '#2ecc71';
                    btn.style.borderColor = '#2ecc71';
                    contactForm.reset();
                } else {
                    throw new Error('Noe gikk galt på serveren');
                }
            } catch (error) {
                console.error('Feil ved innsending av skjema:', error);
                btn.innerText = 'Feil oppstod. Prøv igjen.';
                btn.style.backgroundColor = '#e74c3c';
                btn.style.borderColor = '#e74c3c';
            } finally {
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.backgroundColor = '';
                    btn.style.borderColor = '';
                    btn.disabled = false;
                }, 3000);
            }
        });
    }

    // 6. Mobile Menu Toggle (Simplified)
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active-mobile');
            mobileToggle.classList.toggle('open');
        });

        // Close mobile menu when a nav link is clicked
        document.querySelectorAll('.nav-links a, .nav-cta a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active-mobile')) {
                    navLinks.classList.remove('active-mobile');
                    mobileToggle.classList.remove('open');
                }
            });
        });
    }

    // 7. Menu Scroll Navigation (Bubbles)
    const tabBtns = document.querySelectorAll('.menu-tab-btn');

    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    // Update active bubble
                    tabBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    // Calculate smooth scroll offset to account for sticky header
                    const headerHeight = document.getElementById('main-header').offsetHeight || 80;
                    const elementPosition = targetSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;

                    // Smooth and fast scroll
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Update active bubble as user scrolls through the page
        window.addEventListener('scroll', () => {
            const headerHeight = document.getElementById('main-header').offsetHeight || 80;
            const scrollPos = window.pageYOffset;
            const sections = document.querySelectorAll('.menu-category-content');
            
            let currentActiveId = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop - headerHeight - 50;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPos >= sectionTop && scrollPos <= sectionBottom) {
                    currentActiveId = section.getAttribute('id');
                }
            });

            if (currentActiveId) {
                tabBtns.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-target') === currentActiveId) {
                        btn.classList.add('active');
                    }
                });
            }
        });
    }
});
