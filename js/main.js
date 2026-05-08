/* =====================================================
   MAIN.JS — Sito Elettricisti
   ===================================================== */

// --- FADE-IN ON SCROLL ---
function initFadeIn() {
  const fadeEls = document.querySelectorAll('.fade-in:not(.visible)');
  if (fadeEls.length === 0) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  fadeEls.forEach(el => observer.observe(el));
}

// --- LIGHTBOX ---
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  const lightboxImg   = lightbox.querySelector('.lightbox-img');
  const lightboxClose = lightbox.querySelector('.lightbox-close');

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-src')
        || item.querySelector('img')?.src
        || null;
      if (!src) return;
      lightboxImg.src = src;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

// --- SMOOTH SCROLL per ancore interne ---
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// --- COUNTER ANIMATO (statistiche hero) ---
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  if (isNaN(target)) return;
  const duration = 1800;
  const step     = Math.ceil(target / (duration / 16));
  let current    = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = current + (el.getAttribute('data-suffix') || '');
  }, 16);
}

function initCounters() {
  const counterEls = document.querySelectorAll('.stat-number[data-target]');
  if (counterEls.length === 0) return;
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counterEls.forEach(el => counterObserver.observe(el));
}

// --- initPage: chiamato anche dal router dopo ogni navigazione AJAX ---
window.initPage = function () {
  initFadeIn();
  initLightbox();
  initSmoothScroll();
  initCounters();
};

// --- Primo caricamento: aspetta che i partial siano pronti ---
document.addEventListener('partialsReady', function () {
  window.initPage();
});
