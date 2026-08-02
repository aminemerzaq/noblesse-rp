/* ============================================================
   main.js — NOBLESSE RP Interactive Scripts
   ============================================================ */

/* ---- Navbar scroll behavior ---- */
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
    backToTop.classList.add('visible');
  } else {
    navbar.classList.remove('scrolled');
    backToTop.classList.remove('visible');
  }

  // Active nav link highlighting
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.getAttribute('id');
    }
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

/* ---- Hamburger menu ---- */
const hamburger = document.getElementById('hamburger-btn');
const navLinks  = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

/* ---- Hero Particles ---- */
function createParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    p.style.left   = Math.random() * 100 + '%';
    p.style.bottom = '-5px';
    p.style.width  = (Math.random() * 2 + 1) + 'px';
    p.style.height = p.style.width;
    p.style.animationDuration  = (Math.random() * 8 + 6) + 's';
    p.style.animationDelay     = (Math.random() * 10) + 's';
    p.style.opacity = (Math.random() * 0.5 + 0.1).toString();
    container.appendChild(p);
  }
}
createParticles();

/* ---- Animated stat counters ---- */
function animateCounter(el, target) {
  let current = 0;
  const increment = Math.ceil(target / 60);
  const timer = setInterval(() => {
    current = Math.min(current + increment, target);
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 25);
}

const statNumbers = document.querySelectorAll('.stat-number[data-target]');
let statsAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !statsAnimated) {
      statsAnimated = true;
      statNumbers.forEach(el => {
        animateCounter(el, parseInt(el.dataset.target));
      });
    }
  });
}, { threshold: 0.5 });

const statsBar = document.getElementById('stats-bar');
if (statsBar) statsObserver.observe(statsBar);

/* ---- Scroll reveal animations ---- */
const revealEls = document.querySelectorAll(
  '.about-card, .feature-card, .faction-card, .rule-card, .store-card, ' +
  '.apply-step, .value-chip, .stat-item, .section-header, .about-text, .about-cards, .footer-brand, .footer-links-group'
);

revealEls.forEach((el, i) => {
  el.classList.add('reveal');
  if (i % 4 === 1) el.classList.add('reveal-delay-1');
  if (i % 4 === 2) el.classList.add('reveal-delay-2');
  if (i % 4 === 3) el.classList.add('reveal-delay-3');
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

/* ---- Copy connect code ---- */
function copyConnect() {
  const code = 'cfx.re/join/noblesse';
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('copy-connect-btn');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> COPIED!';
      btn.style.color = '#4ade80';
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.color = '';
      }, 2000);
    }
  });
}
window.copyConnect = copyConnect;

/* ---- Smooth hover effects on faction cards ---- */
document.querySelectorAll('.faction-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.querySelector('.faction-bg').style.transform = 'scale(1.08)';
  });
  card.addEventListener('mouseleave', () => {
    card.querySelector('.faction-bg').style.transform = 'scale(1)';
  });
});
