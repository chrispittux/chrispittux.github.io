/* Shared password gate for protected case studies.
   One source of truth: markup, logic, and config all live in this file.
   Include on any page that links to a protected study:
     <link rel="stylesheet" href="gate.css">
     <script src="gate.js"></script>
   Each protected page also needs the tiny guard <script> in its <head>
   (redirects direct-URL visitors to index.html#gate=<slug>).
   NOTE: this is a cosmetic gate. The password below is readable in source. */
(function () {
  /* ▼▼▼ CHANGE THIS to your shared password ▼▼▼ */
  var PASSWORD = 'pitt0000';
  /* ▲▲▲ CHANGE THIS to your shared password ▲▲▲ */
  var PROTECTED = ['fund-finance-ratings.html'];
  var UNLOCK_KEY = 'cs_unlocked';
  var EMAIL = 'c.pitt848@gmail.com';
  var LINKEDIN = 'https://www.linkedin.com/in/chris-pitt1/';

  var MODAL_HTML =
    '<div class="pw-modal" id="pwModal" role="dialog" aria-modal="true" aria-labelledby="pwTitle" aria-hidden="true">' +
      '<div class="pw-backdrop" data-pw-close></div>' +
      '<div class="pw-panel">' +
        '<span class="pw-eyebrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Protected case study</span>' +
        '<h2 class="pw-title" id="pwTitle">Enter password to view</h2>' +
        '<p class="pw-desc">This case study includes protected client work. Enter the password to continue.</p>' +
        '<form class="pw-form" id="pwForm" autocomplete="off">' +
          '<div class="pw-input-wrap">' +
            '<input type="password" class="pw-input" id="pwInput" placeholder="Password" aria-label="Password" autocomplete="off" />' +
            '<button type="button" class="pw-toggle" id="pwToggle" aria-label="Show password" aria-pressed="false">' +
              '<svg class="icon-show" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>' +
              '<svg class="icon-hide" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>' +
            '</button>' +
          '</div>' +
          '<button type="submit" class="pw-submit">Unlock</button>' +
        '</form>' +
        '<p class="pw-error" id="pwError" hidden>Incorrect password. Try again.</p>' +
        '<div class="pw-help"><span class="pw-help-q">Don’t have the password?</span><span class="pw-help-links"><button type="button" class="pw-copy" id="pwEmailCopy" title="Click to copy"><span class="pw-copy-text" aria-live="polite">' + EMAIL + '</span></button><span class="pw-help-sep">·</span><a href="' + LINKEDIN + '" target="_blank" rel="noopener">LinkedIn</a></span></div>' +
        '<button type="button" class="pw-cancel" data-pw-close>Cancel</button>' +
      '</div>' +
    '</div>';

  function norm(href) { return (href || '').replace(/^\.\//, '').split('#')[0].split('?')[0]; }
  function isProtected(href) { return PROTECTED.indexOf(norm(href)) > -1; }

  function init() {
    var host = document.createElement('div');
    host.innerHTML = MODAL_HTML;
    var modal = host.firstElementChild;
    document.body.appendChild(modal);

    var form = modal.querySelector('#pwForm');
    var input = modal.querySelector('#pwInput');
    var error = modal.querySelector('#pwError');
    var toggle = modal.querySelector('#pwToggle');
    var pending = null;

    function hidePw() { input.type = 'password'; toggle.classList.remove('on'); toggle.setAttribute('aria-pressed', 'false'); toggle.setAttribute('aria-label', 'Show password'); }
    function openModal(url) { pending = url; error.hidden = true; input.value = ''; hidePw(); modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('pw-open'); document.body.style.overflow = 'hidden'; setTimeout(function () { input.focus(); }, 80); }
    function closeModal() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('pw-open'); document.body.style.overflow = ''; pending = null; }

    toggle.addEventListener('click', function () {
      var reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      toggle.classList.toggle('on', reveal);
      toggle.setAttribute('aria-pressed', String(reveal));
      toggle.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
      input.focus();
    });

    // Click the email to copy it (works with any mail app / webmail).
    var emailBtn = modal.querySelector('#pwEmailCopy');
    if (emailBtn) {
      var emailText = emailBtn.querySelector('.pw-copy-text');
      emailBtn.addEventListener('click', function () {
        try { navigator.clipboard.writeText(EMAIL); } catch (_) {}
        emailBtn.classList.add('copied');
        emailText.textContent = 'Copied to clipboard';
        clearTimeout(emailBtn._t);
        emailBtn._t = setTimeout(function () { emailBtn.classList.remove('copied'); emailText.textContent = EMAIL; }, 1800);
      });
    }

    // Resolve a click to a protected target: a direct link, or a whole card whose link is protected.
    function resolveProtected(el) {
      var a = el.closest ? el.closest('a[href]') : null;
      if (a && isProtected(a.getAttribute('href'))) return norm(a.getAttribute('href'));
      var card = el.closest ? el.closest('.card') : null;
      if (card) { var cl = card.querySelector('a[href]'); if (cl && isProtected(cl.getAttribute('href'))) return norm(cl.getAttribute('href')); }
      return null;
    }
    // Capture phase so we intercept before any page-level card/link navigation handlers.
    document.addEventListener('click', function (e) {
      if (modal.contains(e.target)) return;
      var target = resolveProtected(e.target);
      if (target) { e.preventDefault(); e.stopPropagation(); openModal(target); }
    }, true);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (input.value === PASSWORD) {
        try { sessionStorage.setItem(UNLOCK_KEY, 'yes'); } catch (_) {}
        var url = pending; closeModal(); window.location.href = url;
      } else { error.hidden = false; input.select(); }
    });
    modal.addEventListener('click', function (e) { if (e.target.hasAttribute && e.target.hasAttribute('data-pw-close')) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

    // Arriving via the guard redirect (index.html#gate=<slug>): auto-open the modal for that study.
    try {
      var m = location.hash.match(/gate=([\w-]+)/);
      if (m) {
        var slug = m[1], target = null, i;
        for (i = 0; i < PROTECTED.length; i++) { if (PROTECTED[i].indexOf(slug) > -1) { target = PROTECTED[i]; break; } }
        if (target) {
          var links = document.querySelectorAll('a[href]');
          for (i = 0; i < links.length; i++) { if (isProtected(links[i].getAttribute('href'))) { var c = links[i].closest('.card'); if (c) c.scrollIntoView({ block: 'center' }); break; } }
          openModal(target);
          if (history.replaceState) history.replaceState(null, '', location.pathname);
        }
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
