document.addEventListener('DOMContentLoaded', function() {
    // Particle.js initialization - Elegant flowing lines configuration
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 1500
                    }
                },
                color: {
                    value: ["#8860d0", "#5ab9ea", "#c1c8e4", "#84ceeb", "#5680e9"]
                },
                shape: {
                    type: ["circle", "edge"],
                    stroke: {
                        width: 0,
                        color: "#000000"
                    }
                },
                opacity: {
                    value: 0.2,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 0.3,
                        opacity_min: 0.05,
                        sync: false
                    }
                },
                size: {
                    value: 1.8,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        size_min: 0.3,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 200,
                    color: "#a67ce9",
                    opacity: 0.15,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 0.8,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                    attract: {
                        enable: true,
                        rotateX: 800,
                        rotateY: 800
                    }
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: true,
                        mode: "grab"
                    },
                    onclick: {
                        enable: true,
                        mode: "push"
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.35
                        }
                    },
                    bubble: {
                        distance: 200,
                        size: 3.5,
                        duration: 2,
                        opacity: 0.8,
                        speed: 3
                    },
                    repulse: {
                        distance: 150,
                        duration: 0.4
                    },
                    push: {
                        particles_nb: 3
                    },
                    remove: {
                        particles_nb: 2
                    }
                }
            },
            retina_detect: true
        });
    }

    // Navbar scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }

    // Back to top button
    const backToTop = document.querySelector('.back-to-top');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            backToTop.classList.add('active');
        } else {
            backToTop.classList.remove('active');
        }
    });

    if (backToTop) {
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Smooth scrolling for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                e.preventDefault();
                
                // Close mobile menu if open
                if (nav.classList.contains('active')) {
                    nav.classList.remove('active');
                }
                
                // Scroll to target
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation link update on scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Show more commands button
    const showMoreCommandsBtn = document.getElementById('show-more-commands');
    if (showMoreCommandsBtn) {
        let commandsExpanded = false;
        
        showMoreCommandsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const commandItems = document.querySelectorAll('.command-item');
            
            if (!commandsExpanded) {
                commandItems.forEach(item => {
                    item.style.display = 'block';
                });
                showMoreCommandsBtn.textContent = 'Show Less';
                commandsExpanded = true;
            } else {
                // Hide all items after the first 4 in each category
                const commandLists = document.querySelectorAll('.command-list');
                commandLists.forEach(list => {
                    const items = list.querySelectorAll('.command-item');
                    items.forEach((item, index) => {
                        if (index > 3) {
                            item.style.display = 'none';
                        }
                    });
                });
                
                showMoreCommandsBtn.textContent = 'View All Commands';
                commandsExpanded = false;
            }
        });
    }

    // Animation on scroll
    const animateOnScroll = function() {
        const elementsToAnimate = document.querySelectorAll('.feature-card, .stat-card, .command-category, .pricing-card, .support-card');
        
        elementsToAnimate.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.style.opacity = 1;
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Set initial state for animations
    const elementsToAnimate = document.querySelectorAll('.feature-card, .stat-card, .command-category, .pricing-card, .support-card');
    elementsToAnimate.forEach(element => {
        element.style.opacity = 0;
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    // Run animation on load and scroll
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);

    // Add event listeners to pricing cards for hover effect
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            pricingCards.forEach(c => c.classList.remove('hover'));
            this.classList.add('hover');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('hover');
        });
    });
});