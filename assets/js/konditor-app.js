/**
 * Konditor — Application JavaScript
 * Handles: mobile sidebar, filter chips toggle, range input live feedback.
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     Mobile Sidebar (app pages)
  ───────────────────────────────────────────── */
  function initSidebar() {
    var sidebar  = document.getElementById('app-sidebar');
    var overlay  = document.getElementById('sidebar-overlay');
    var openBtn  = document.getElementById('sidebar-open-btn');
    var closeBtn = document.getElementById('sidebar-close-btn');

    if (!sidebar) return;

    function openSidebar() {
      sidebar.classList.remove('-translate-x-full');
      overlay.removeAttribute('hidden');
      overlay.classList.remove('opacity-0', 'pointer-events-none');
      overlay.classList.add('opacity-100');
      document.body.classList.add('overflow-hidden');
      if (closeBtn) closeBtn.focus();
    }

    function closeSidebar() {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.remove('opacity-100');
      overlay.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(function () { overlay.setAttribute('hidden', ''); }, 300);
      document.body.classList.remove('overflow-hidden');
      if (openBtn) openBtn.focus();
    }

    if (openBtn)  openBtn.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (overlay)  overlay.addEventListener('click', closeSidebar);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !sidebar.classList.contains('-translate-x-full')) {
        closeSidebar();
      }
    });
  }

  /* ─────────────────────────────────────────────
     Mobile Top Navigation (public pages)
  ───────────────────────────────────────────── */
  function initMobileNav() {
    var navToggle = document.getElementById('nav-mobile-toggle');
    var navMenu   = document.getElementById('nav-mobile-menu');

    if (!navToggle || !navMenu) return;

    navToggle.addEventListener('click', function () {
      var isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navMenu.classList.toggle('hidden', isExpanded);
      navToggle.setAttribute('aria-expanded', String(!isExpanded));
    });
  }

  /* ─────────────────────────────────────────────
     Range inputs — live value display
  ───────────────────────────────────────────── */
  function initRangeInputs() {
    document.querySelectorAll('input[type="range"][data-output]').forEach(function (input) {
      var output = document.getElementById(input.dataset.output);
      if (!output) return;

      function sync() {
        output.textContent = input.value + '%';
        var pct = ((input.value - input.min) / (input.max - input.min)) * 100;
        input.style.backgroundImage =
          'linear-gradient(to right, #bd0050 ' + pct + '%, #e6e8ec ' + pct + '%)';
      }

      input.addEventListener('input', sync);
      sync(); // initialise on load
    });
  }

  /* ─────────────────────────────────────────────
     Filter chip groups — single-select toggle
  ───────────────────────────────────────────── */
  function initFilterChips() {
    document.querySelectorAll('[data-filter-group]').forEach(function (group) {
      var chips = group.querySelectorAll('[data-filter-chip]');

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (c) {
            c.classList.remove('bg-primary', 'text-on-primary', 'shadow-lg');
            c.classList.add('bg-surface-container', 'text-on-surface-variant');
            c.setAttribute('aria-pressed', 'false');
          });
          chip.classList.remove('bg-surface-container', 'text-on-surface-variant');
          chip.classList.add('bg-primary', 'text-on-primary', 'shadow-lg');
          chip.setAttribute('aria-pressed', 'true');
        });
      });
    });
  }

  /* ─────────────────────────────────────────────
     Billing toggle (planos.html)
  ───────────────────────────────────────────── */
  function initBillingToggle() {
    var monthlyBtn = document.getElementById('billing-monthly');
    var annualBtn  = document.getElementById('billing-annual');
    if (!monthlyBtn || !annualBtn) return;

    var activeClasses   = ['berry-gradient', 'text-on-primary', 'shadow-md'];
    var inactiveClasses = ['text-on-surface-variant'];

    function applyClasses(el, add, remove) {
      add.forEach(function (c) { el.classList.add(c); });
      remove.forEach(function (c) { el.classList.remove(c); });
    }

    function setMode(isAnnual) {
      if (isAnnual) {
        applyClasses(annualBtn,  activeClasses,   inactiveClasses);
        applyClasses(monthlyBtn, inactiveClasses, activeClasses);
        annualBtn.setAttribute('aria-pressed', 'true');
        monthlyBtn.setAttribute('aria-pressed', 'false');
      } else {
        applyClasses(monthlyBtn, activeClasses,   inactiveClasses);
        applyClasses(annualBtn,  inactiveClasses, activeClasses);
        monthlyBtn.setAttribute('aria-pressed', 'true');
        annualBtn.setAttribute('aria-pressed', 'false');
      }
      document.querySelectorAll('.pricing-price').forEach(function (el) {
        el.textContent = isAnnual ? el.dataset.annual : el.dataset.monthly;
      });
    }

    monthlyBtn.addEventListener('click', function () { setMode(false); });
    annualBtn.addEventListener('click',  function () { setMode(true); });
    setMode(true); // default: annual
  }

  /* ─────────────────────────────────────────────
     Terms sidebar — scroll-spy active state
  ───────────────────────────────────────────── */
  function initTermsScrollSpy() {
    var navLinks = document.querySelectorAll('.terms-nav-link');
    if (!navLinks.length) return;

    var sections = [];
    navLinks.forEach(function (link) {
      var target = document.querySelector(link.getAttribute('href'));
      if (target) sections.push(target);
    });

    var activeAdd    = ['text-primary', 'bg-primary-container/20', 'font-bold', 'border-l-4', 'border-primary'];
    var inactiveAdd  = ['text-on-surface-variant'];
    var inactiveRemove = ['text-primary', 'bg-primary-container/20', 'font-bold', 'border-l-4', 'border-primary'];

    function setActive(id) {
      navLinks.forEach(function (link) {
        var isActive = link.getAttribute('href') === '#' + id;
        if (isActive) {
          activeAdd.forEach(function (c) { link.classList.add(c); });
          inactiveAdd.forEach(function (c) { link.classList.remove(c); });
        } else {
          inactiveAdd.forEach(function (c) { link.classList.add(c); });
          inactiveRemove.forEach(function (c) { link.classList.remove(c); });
        }
      });
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { setActive(entry.target.id); }
        });
      }, { rootMargin: '-10% 0px -70% 0px', threshold: 0 });

      sections.forEach(function (s) { observer.observe(s); });
    }

    if (sections.length) setActive(sections[0].id); // initial state
  }

  /* ─────────────────────────────────────────────
     Init
  ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initSidebar();
    initMobileNav();
    initRangeInputs();
    initFilterChips();
    initBillingToggle();
    initTermsScrollSpy();
  });
})();
