/* =====================================================
   ROUTER.JS — Navigazione SPA via fetch / History API
   ===================================================== */

(function () {
  'use strict';

  // ── Barra di progresso sottile ──────────────────────
  const bar = document.createElement('div');
  bar.id = 'progress-bar';
  document.body.appendChild(bar);

  function progressStart() { bar.style.width = '0%'; bar.classList.add('loading'); bar.style.width = '40%'; }
  function progressDone()  { bar.style.width = '100%'; setTimeout(() => bar.classList.remove('loading'), 300); }

  // ── Parser ──────────────────────────────────────────
  const parser = new DOMParser();

  function extractMain(html) {
    const doc  = parser.parseFromString(html, 'text/html');
    const main = doc.getElementById('page-content');
    const title = doc.querySelector('title')?.textContent || document.title;
    return { main, title };
  }

  // ── Navigazione AJAX ────────────────────────────────
  let isNavigating = false;

  async function navigateTo(url, pushState = true) {
    if (isNavigating) return;
    const current = window.location.href;
    // Stessa pagina: salta
    if (url === current || url === window.location.pathname) return;

    isNavigating = true;
    progressStart();

    const content = document.getElementById('page-content');
    if (!content) { window.location.href = url; return; }

    // Fade out
    content.classList.add('page-exit');

    let html;
    try {
      const res = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      html = await res.text();
    } catch (e) {
      // Fallback: navigazione classica
      window.location.href = url;
      return;
    }

    const { main: newMain, title } = extractMain(html);
    if (!newMain) { window.location.href = url; return; }

    // Attendi fine fade-out
    await new Promise(r => setTimeout(r, 180));

    // Sostituisci contenuto
    content.innerHTML = newMain.innerHTML;
    content.className = newMain.className;
    content.classList.remove('page-exit');
    content.classList.add('page-enter');

    // Aggiorna titolo e URL
    document.title = title;
    if (pushState) history.pushState({ url }, title, url);

    // Scroll in cima
    window.scrollTo({ top: 0, behavior: 'instant' });

    progressDone();

    // Re-inizializza comportamenti di pagina
    if (typeof window.initPage === 'function') window.initPage();

    // Aggiorna active link
    if (typeof window.initNavbarActive === 'function') window.initNavbarActive();

    // Rimuovi classe di entrata dopo animazione
    setTimeout(() => content.classList.remove('page-enter'), 350);

    isNavigating = false;
  }

  // ── Intercetta click ────────────────────────────────
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');

    // Ignora: link esterni, ancore, mailto, tel, nuova tab
    if (!href || href.startsWith('http') || href.startsWith('//') ||
        href.startsWith('#') || href.startsWith('mailto:') ||
        href.startsWith('tel:') || link.hasAttribute('download') ||
        link.target === '_blank') return;

    // Solo pagine HTML dello stesso sito
    const url = new URL(href, window.location.origin + window.location.pathname.replace(/[^/]*$/, ''));
    if (url.origin !== window.location.origin) return;

    e.preventDefault();
    navigateTo(url.href);
  });

  // ── Gestione Avanti/Indietro ─────────────────────────
  window.addEventListener('popstate', function (e) {
    navigateTo(window.location.href, false);
  });

  // ── Stato iniziale nella history ─────────────────────
  history.replaceState({ url: window.location.href }, document.title, window.location.href);

})();
