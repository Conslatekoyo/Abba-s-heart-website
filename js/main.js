/* ============================================================
   ABBA'S HEART MINISTRIES - MAIN JAVASCRIPT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ===================== PRELOADER =====================
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }, 1500);
    });
    setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }, 4000);

    // ===================== NAVBAR SCROLL =====================
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');

    function handleScroll() {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        if (scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===================== MOBILE MENU =====================
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
    });

    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // ===================== ACTIVE NAV LINK =====================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function setActiveNav() {
        const scrollY = window.scrollY + 150;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollY >= top && scrollY < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    window.addEventListener('scroll', setActiveNav);

    // ===================== HERO PARTICLES =====================
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.left = Math.random() * 100 + '%';
            particle.style.width = Math.random() * 4 + 2 + 'px';
            particle.style.height = particle.style.width;
            particle.style.animationDuration = Math.random() * 15 + 10 + 's';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            particlesContainer.appendChild(particle);
        }
    }

    // ===================== SCROLL ANIMATIONS (AOS Alternative) =====================
    const animatedElements = document.querySelectorAll('[data-aos]');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-aos-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));

    // ===================== COUNTER ANIMATION =====================
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const countTo = parseInt(target.getAttribute('data-count'));
                const duration = 2000;
                const start = performance.now();

                function updateCounter(currentTime) {
                    const elapsed = currentTime - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const current = Math.floor(easeOut * countTo);
                    target.textContent = current.toLocaleString();
                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        target.textContent = countTo.toLocaleString();
                    }
                }
                requestAnimationFrame(updateCounter);
                counterObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(num => counterObserver.observe(num));

    // ===================== DONATION AMOUNT BUTTONS =====================
    const amountBtns = document.querySelectorAll('.amount-btn');
    const customAmountInput = document.getElementById('custom-amount-input');

    amountBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            amountBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (customAmountInput) {
                customAmountInput.value = '';
            }
        });
    });

    if (customAmountInput) {
        customAmountInput.addEventListener('input', () => {
            amountBtns.forEach(b => b.classList.remove('active'));
        });
    }

    // ===================== PAYPAL INTEGRATION =====================
    function getSelectedAmount() {
        const activeBtn = document.querySelector('.amount-btn.active');
        const customAmount = customAmountInput ? parseFloat(customAmountInput.value) : 0;
        if (customAmount > 0) return customAmount;
        if (activeBtn) return parseFloat(activeBtn.getAttribute('data-amount'));
        return 50;
    }

    if (typeof paypal !== 'undefined' && document.getElementById('paypal-button-container')) {
        paypal.Buttons({
            style: {
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'donate',
                height: 50
            },
            createOrder: function(data, actions) {
                const amount = getSelectedAmount();
                return actions.order.create({
                    purchase_units: [{
                        description: 'Donation to Abba\'s Heart Ministries',
                        amount: {
                            value: amount.toFixed(2),
                            currency_code: 'USD'
                        }
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    const name = details.payer.name.given_name;
                    showNotification(
                        'Thank you, ' + name + '! Your donation has been received. God bless you!',
                        'success'
                    );
                });
            },
            onError: function(err) {
                showNotification(
                    'There was an issue processing your donation. Please try again.',
                    'error'
                );
                console.error('PayPal Error:', err);
            }
        }).render('#paypal-button-container');
    } else {
        const paypalContainer = document.getElementById('paypal-button-container');
        if (paypalContainer) {
            paypalContainer.innerHTML = `
                <a href="https://www.paypal.com/donate/?hosted_button_id=YOUR_BUTTON_ID"
                   target="_blank" rel="noopener"
                   style="display:block;text-align:center;padding:15px 30px;background:#FFC439;
                          color:#111;border-radius:8px;font-weight:600;font-size:1rem;
                          text-decoration:none;transition:all 0.3s ease;">
                    <i class="fab fa-paypal" style="margin-right:8px;"></i> Donate with PayPal
                </a>
                <p style="text-align:center;font-size:0.8rem;color:#999;margin-top:10px;">
                    To enable live PayPal payments, replace YOUR_PAYPAL_CLIENT_ID in the script tag.
                </p>
            `;
        }
    }

    // ===================== NOTIFICATION SYSTEM =====================
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 100px; right: 30px; z-index: 10000;
            padding: 20px 30px; border-radius: 12px; max-width: 400px;
            font-family: 'Inter', sans-serif; font-size: 0.95rem;
            animation: slideInRight 0.4s ease;
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        `;

        if (type === 'success') {
            notification.style.background = '#10B981';
            notification.style.color = '#fff';
        } else if (type === 'error') {
            notification.style.background = '#EF4444';
            notification.style.color = '#fff';
        } else {
            notification.style.background = '#fff';
            notification.style.color = '#333';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            notification.style.transition = 'all 0.4s ease';
            setTimeout(() => notification.remove(), 400);
        }, 5000);
    }

    // ===================== FORM SUBMISSION HANDLING =====================
    const forms = document.querySelectorAll('form[action*="formsubmit"]');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 5000);
        });
    });

    // ===================== SMOOTH SCROLL FOR ANCHOR LINKS =====================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const navHeight = navbar.offsetHeight;
                const targetPosition = targetEl.offsetTop - navHeight - 10;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // ===================== SLIDE IN RIGHT ANIMATION =====================
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

});
