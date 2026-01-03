// Page Navigation
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all links and pages
        navLinks.forEach(l => l.classList.remove('active'));
        pages.forEach(p => p.classList.remove('active'));
        
        // Add active class to clicked link
        link.classList.add('active');
        
        // Show corresponding page
        const pageId = link.getAttribute('data-page');
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // Smooth scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
});

// Events Filter
const filterButtons = document.querySelectorAll('.filter-btn');
const eventCards = document.querySelectorAll('.event-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all filter buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Get filter value
        const filterValue = button.getAttribute('data-filter');
        
        // Filter event cards
        eventCards.forEach(card => {
            if (filterValue === 'all') {
                card.style.display = 'flex';
                card.style.animation = 'fadeIn 0.5s ease';
            } else {
                const category = card.getAttribute('data-category');
                if (category === filterValue) {
                    card.style.display = 'flex';
                    card.style.animation = 'fadeIn 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    });
});

// Pricing Toggle (Monthly/Annual)
const pricingToggle = document.getElementById('pricing-toggle');
const monthlyPrices = document.querySelectorAll('.price-amount.monthly');
const annualPrices = document.querySelectorAll('.price-amount.annual');

if (pricingToggle) {
    pricingToggle.addEventListener('change', () => {
        if (pricingToggle.checked) {
            // Show annual prices
            monthlyPrices.forEach(price => price.style.display = 'none');
            annualPrices.forEach(price => price.style.display = 'inline');
        } else {
            // Show monthly prices
            monthlyPrices.forEach(price => price.style.display = 'inline');
            annualPrices.forEach(price => price.style.display = 'none');
        }
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards, event cards, and pricing cards
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .event-card, .pricing-card, .testimonial-card, .faq-item');
    
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
});

// Add parallax effect to hero visual
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroVisual = document.querySelector('.hero-visual');
    
    if (heroVisual && scrolled < window.innerHeight) {
        heroVisual.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});

// Add click handlers for CTA buttons
const ctaButtons = document.querySelectorAll('.cta-btn, .btn-primary, .event-btn, .pricing-btn');

ctaButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        
        // Add ripple styles
        const style = document.createElement('style');
        style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
            }
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        
        if (!document.querySelector('style[data-ripple]')) {
            style.setAttribute('data-ripple', 'true');
            document.head.appendChild(style);
        }
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
        
        // Log action (for demo purposes)
        console.log('Button clicked:', button.textContent.trim());
    });
});

// Add active state to stats on scroll
const statsSection = document.querySelector('.stats-section');
let statsAnimated = false;

const animateStats = () => {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const finalValue = stat.textContent;
        const numericValue = parseFloat(finalValue.replace(/[^0-9.]/g, ''));
        const suffix = finalValue.replace(/[0-9.]/g, '');
        let currentValue = 0;
        const increment = numericValue / 50;
        const duration = 2000;
        const stepTime = duration / 50;
        
        const counter = setInterval(() => {
            currentValue += increment;
            if (currentValue >= numericValue) {
                stat.textContent = finalValue;
                clearInterval(counter);
            } else {
                stat.textContent = Math.floor(currentValue) + suffix;
            }
        }, stepTime);
    });
};

if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                animateStats();
                statsAnimated = true;
            }
        });
    }, { threshold: 0.5 });
    
    statsObserver.observe(statsSection);
}

// Add hover effect to film reel
const filmReel = document.querySelector('.film-reel');

if (filmReel) {
    filmReel.addEventListener('mouseenter', () => {
        filmReel.style.animationPlayState = 'paused';
    });
    
    filmReel.addEventListener('mouseleave', () => {
        filmReel.style.animationPlayState = 'running';
    });
}

// Console welcome message
console.log('%c🎬 Welcome to Cinewave! 🎬', 'font-size: 20px; font-weight: bold; color: #d4af37;');
console.log('%cExperience cinema reimagined', 'font-size: 14px; color: #9a9aaa;');
