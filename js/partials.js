/* =====================================================
   PARTIALS.JS — Caricamento navbar e footer condivisi
   ===================================================== */

async function loadPartial(placeholderId, url) {
  const el = document.getElementById(placeholderId);
  if (!el) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const html = await res.text();
    el.outerHTML = html;
  } catch (e) {
    console.warn('Partial non caricato:', url, e);
  }
}

function initNavbar() {
  initNavbarActive();

  // Hamburger menu
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }
}

// Esposta globalmente per essere richiamata dal router dopo navigazione AJAX
window.initNavbarActive = function () {
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === currentFile || (currentFile === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
};

(async function () {
  // Tutte le pagine HTML sono nella stessa cartella, i partial sono sempre in partials/
  await loadPartial('navbar-placeholder', 'partials/navbar.html');
  initNavbar();
  await loadPartial('footer-placeholder', 'partials/footer.html');

  // Segnala alle altre funzioni che i partial sono pronti
  document.dispatchEvent(new Event('partialsReady'));
})();
