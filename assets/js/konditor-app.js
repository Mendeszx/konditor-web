/**
 * Konditor — Application JavaScript
 * Handles: mobile sidebar, filter chips toggle, range input live feedback.
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     Token Management — in-memory access token + HttpOnly refresh cookie
  ───────────────────────────────────────────── */
  var _accessToken   = null;
  var _refreshTimer  = null;
  var _pendingRefresh = null;   // serializes concurrent renovarToken() calls
  var _SESSION_KEY   = 'konditor_at';

  /* Decode JWT exp claim without a library (no signature verification needed here) */
  function tokenExpiresInSeconds(token) {
    try {
      var payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return payload.exp ? payload.exp - Math.floor(Date.now() / 1000) : -1;
    } catch (e) { return -1; }
  }

  function isTokenExpired(token) {
    return tokenExpiresInSeconds(token) <= 5; // treat tokens with ≤5 s left as expired
  }

  function getAccessToken() {
    if (_accessToken) {
      if (isTokenExpired(_accessToken)) { setAccessToken(null); return null; }
      return _accessToken;
    }
    /* Restore from sessionStorage after same-tab navigation */
    try {
      var stored = sessionStorage.getItem(_SESSION_KEY) || null;
      if (stored && isTokenExpired(stored)) { sessionStorage.removeItem(_SESSION_KEY); stored = null; }
      _accessToken = stored;
    } catch (e) {}
    return _accessToken;
  }

  function setAccessToken(t) {
    _accessToken = t;
    try {
      if (t) { sessionStorage.setItem(_SESSION_KEY, t); }
      else    { sessionStorage.removeItem(_SESSION_KEY); }
    } catch (e) {}
  }

  function scheduleRefresh(expiresInSeconds) {
    clearTimeout(_refreshTimer);
    var delay = Math.max(10000, (expiresInSeconds - 60) * 1000);
    _refreshTimer = setTimeout(renovarToken, delay);
  }

  function renovarToken() {
    /* Return the in-flight promise if one already exists — prevents duplicate requests */
    if (_pendingRefresh) return _pendingRefresh;

    _pendingRefresh = fetch((window.KONDITOR_API || '') + '/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    })
      .then(function (r) {
        if (!r.ok) {
          clearTimeout(_refreshTimer);
          setAccessToken(null);
          localStorage.removeItem('konditor_user');
          localStorage.removeItem('konditor_workspace');
          window.location.href = 'login.html';
          return null;
        }
        return r.json();
      })
      .then(function (data) {
        if (!data) return null;
        setAccessToken(data.accessToken);
        if (data.expiresIn) scheduleRefresh(data.expiresIn);
        return data.accessToken;
      })
      .catch(function () {
        window.location.href = 'login.html';
        return null;
      })
      .finally(function () { _pendingRefresh = null; });

    return _pendingRefresh;
  }

  /* Ensures a valid token exists — checks expiry, then uses refresh cookie */
  function initSession() {
    var tok = getAccessToken(); // returns null if expired
    if (tok) {
      /* Token is valid — (re-)schedule proactive refresh if not already armed */
      if (!_refreshTimer) {
        var secsLeft = tokenExpiresInSeconds(tok);
        if (secsLeft > 0) scheduleRefresh(secsLeft);
      }
      return Promise.resolve(tok);
    }
    return renovarToken();
  }

  /* Drop-in fetch replacement: adds Bearer token + credentials, auto-retries on 401 */
  function apiFetch(url, options) {
    options = options || {};
    var tok  = getAccessToken();
    var hdrs = Object.assign({}, options.headers || {});
    if (tok) hdrs['Authorization'] = 'Bearer ' + tok;
    return fetch(url, Object.assign({}, options, { credentials: 'include', headers: hdrs }))
      .then(function (res) {
        if (res.status !== 401) return res;
        /* Token rejected — refresh once, then retry */
        setAccessToken(null); // clear stale token before refreshing
        return renovarToken().then(function (newTok) {
          if (!newTok) return res; // renovarToken already redirected
          var retryHdrs = Object.assign({}, options.headers || {}, { 'Authorization': 'Bearer ' + newTok });
          return fetch(url, Object.assign({}, options, { credentials: 'include', headers: retryHdrs }));
        });
      });
  }

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
    var ACTIVE   = ['bg-primary', 'text-on-primary', 'shadow-md', 'shadow-primary/20'];
    var INACTIVE = ['bg-surface-container-lowest', 'border', 'border-slate-200', 'text-on-surface-variant'];

    document.querySelectorAll('[data-filter-group]').forEach(function (group) {
      var chips = group.querySelectorAll('[data-filter-chip]');

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (c) {
            ACTIVE.forEach(function (cls) { c.classList.remove(cls); });
            INACTIVE.forEach(function (cls) { c.classList.add(cls); });
            c.setAttribute('aria-pressed', 'false');
          });
          INACTIVE.forEach(function (cls) { chip.classList.remove(cls); });
          ACTIVE.forEach(function (cls) { chip.classList.add(cls); });
          chip.setAttribute('aria-pressed', 'true');
          filterRecipeCards(chip.textContent.trim());
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

  /* ─────────────────────────────────────────────     Sidebar — injeção dinâmica do menu lateral
     (única fonte de verdade para o HTML do aside)
  ─────────────────────────────────────────────── */
  function initSidebarHtml() {
    var aside = document.getElementById('app-sidebar');
    if (!aside) return;

    /* Mapeamentos de página → link ativo */
    var PAGE_ACTIVE_MAP = {
      'criar-receita.html': 'receitas.html'
    };
    var filename   = window.location.pathname.split('/').pop() || 'receitas.html';
    var activePage = PAGE_ACTIVE_MAP[filename] || filename;

    var NAV = [
      { href: 'receitas.html',     icon: 'menu_book',  label: 'Receitas' },
      { href: 'ingredientes.html', icon: 'liquor',     label: 'Ingredientes' },
      { href: 'custos.html',       icon: 'payments',   label: 'Custos' },
      { href: 'precos.html',       icon: 'sell',       label: 'Precificação' },
      { href: 'desempenho.html',   icon: 'storefront', label: 'Desempenho' },
      { href: 'lucro.html',        icon: 'monitoring', label: 'Visão de Lucro' }
    ];

    var INACTIVE = 'flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary-container/10 transition-all font-headline text-sm hover:translate-x-1 duration-200';
    var ACTIVE   = 'flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-primary bg-primary-container/20 border-r-4 border-primary font-headline text-sm';

    var navHtml = NAV.map(function (item) {
      var isActive = item.href === activePage;
      return (isActive
        ? '<a aria-current="page" class="' + ACTIVE   + '" href="' + item.href + '">'
        : '<a class="'                      + INACTIVE + '" href="' + item.href + '">')
        + '<span class="material-symbols-outlined">' + item.icon + '</span> ' + item.label
        + '</a>';
    }).join('');

    /* nome do usuário a partir do localStorage */
    var userName = 'Usuário';
    try {
      var u = JSON.parse(localStorage.getItem('konditor_user') || 'null');
      if (u && u.nome) userName = u.nome;
    } catch (e) {}
    var initial = userName.charAt(0).toUpperCase();

    aside.innerHTML =
      '<div class="mb-8 flex items-center gap-3 relative">'
      + '<div class="w-10 h-10 rounded-xl berry-gradient flex items-center justify-center text-white shadow-lg">'
      + '<span class="material-symbols-outlined" aria-hidden="true" style="font-variation-settings:\'FILL\' 1;">bakery_dining</span>'
      + '</div>'
      + '<div>'
      + '<p class="text-xl font-extrabold text-primary font-headline tracking-tight">Konditor</p>'
      + '<p class="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">Artisanal Intelligence</p>'
      + '</div>'
      + '<button id="sidebar-close-btn" class="lg:hidden absolute right-0 top-0 w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors" aria-label="Fechar menu">'
      + '<span class="material-symbols-outlined text-xl">close</span>'
      + '</button>'
      + '</div>'
      + '<nav class="flex-1 flex flex-col gap-1">' + navHtml + '</nav>'
      + '<div class="mt-auto pt-4 border-t border-outline-variant flex flex-col gap-1">'
      + '<a class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:translate-x-1 transition-all text-sm" href="#">'
      + '<span class="material-symbols-outlined">help</span> Ajuda'
      + '</a>'
      + '<button type="button" data-logout class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:translate-x-1 transition-all text-sm w-full text-left">'
      + '<span class="material-symbols-outlined">logout</span> Sair'
      + '</button>'
      + '<div class="mt-3 p-4 rounded-2xl bg-surface-container">'
      + '<div class="flex items-center gap-3">'
      + '<div class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container">' + escHtml(initial) + '</div>'
      + '<div>'
      + '<p class="text-xs font-bold text-on-surface">' + escHtml(userName) + '</p>'
      + '<p class="text-[10px] text-on-surface-variant">Minha Conta</p>'
      + '</div>'
      + '</div>'
      + '</div>'
      + '</div>';
  }

  /* ─────────────────────────────────────────────     Dashboard — receitas.html
     GET /dashboard/estatisticas  → stats
     GET /dashboard/receitas      → recipe grid
  ───────────────────────────────────────────── */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function filterRecipeCards(categoria) {
    var grid = document.getElementById('recipe-grid');
    if (!grid) return;
    grid.querySelectorAll('[data-categoria]').forEach(function (card) {
      card.style.display = (categoria === 'Todas' || card.dataset.categoria === categoria) ? '' : 'none';
    });
  }

  function buildRecipeCard(r) {
    var isLow       = r.margemStatus === 'baixa';
    var borderCls   = isLow ? 'border-error/15 hover:border-error/30 hover:shadow-error/10' : 'border-slate-100 hover:border-primary/15 hover:shadow-primary/8';
    var catBadge    = isLow
      ? '<span class="bg-error/10 text-error px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">' + escHtml(r.categoria) + '</span>'
      : '<span class="bg-primary-container/30 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">' + escHtml(r.categoria) + '</span>';
    var margemBadge = isLow
      ? '<span class="bg-error/10 text-error px-3 py-1 rounded-full text-[10px] font-bold">' + r.margem + '% margem</span>'
      : '<span class="bg-secondary/15 text-secondary px-3 py-1 rounded-full text-[10px] font-bold">' + r.margem + '% margem</span>';
    var sepCls      = isLow ? 'border-error/10' : 'border-slate-100';
    var priceCls    = isLow ? 'text-error' : 'text-primary';
    var linkCls     = isLow ? 'text-error' : 'text-primary';
    var linkLabel   = isLow ? 'Revisar' : 'Analisar';
    var custo = r.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    var preco = r.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return '<div class="group bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border hover:-translate-y-0.5 ' + borderCls + '" data-categoria="' + escHtml(r.categoria) + '">'
      + '<div class="p-6 flex flex-col gap-4 h-full">'
      + '<div class="flex items-center justify-between">' + catBadge + margemBadge + '</div>'
      + '<div class="flex-1"><h3 class="text-lg font-headline font-bold text-on-surface">' + escHtml(r.nome) + '</h3>'
      + '<p class="text-xs text-on-surface-variant font-medium mt-1">' + r.quantidade + ' ' + escHtml(r.unidade) + ' • Custo: ' + custo + '</p></div>'
      + '<div class="flex justify-between items-center pt-3 border-t ' + sepCls + '">'
      + '<span class="text-2xl font-headline font-extrabold ' + priceCls + '">' + preco + ' <span class="text-sm font-semibold text-on-surface-variant">/unid.</span></span>'
      + '<a href="' + escHtml(r.linkAnalise) + '" class="flex items-center gap-1 ' + linkCls + ' text-sm font-bold hover:gap-2 transition-all duration-200">'
      + linkLabel + ' <span class="material-symbols-outlined text-sm">arrow_forward</span></a>'
      + '</div></div></div>';
  }

  function buildDraftCard(r) {
    var editLink = 'criar-receita.html' + (r.id ? '?id=' + encodeURIComponent(r.id) : '');
    var nome     = r.nome ? escHtml(r.nome) : 'Sem nome';
    var catHtml  = r.categoria
      ? '<span class="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">' + escHtml(r.categoria) + '</span>'
      : '<span></span>';
    var tsRaw  = r.atualizadoEm || r.criadoEm;
    var dataHtml = tsRaw
      ? '<p class="text-xs text-on-surface-variant font-medium mt-1">Editado em ' + new Date(tsRaw).toLocaleDateString('pt-BR') + '</p>'
      : '';
    return '<div class="group bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-amber-200 hover:border-amber-300 hover:-translate-y-0.5">'
      + '<div class="p-6 flex flex-col gap-4 h-full">'
      + '<div class="flex items-center justify-between">'
      + catHtml
      + '<span class="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">'
      + '<span class="material-symbols-outlined" style="font-size:0.85rem">edit_note</span> Rascunho</span>'
      + '</div>'
      + '<div class="flex-1"><h3 class="text-lg font-headline font-bold text-on-surface">' + nome + '</h3>' + dataHtml + '</div>'
      + '<div class="flex justify-between items-center pt-3 border-t border-amber-100">'
      + '<span class="text-xs text-amber-700 font-semibold">N\u00e3o publicado</span>'
      + '<a href="' + editLink + '" class="flex items-center gap-1 text-amber-700 text-sm font-bold hover:gap-2 transition-all duration-200">'
      + 'Continuar <span class="material-symbols-outlined text-sm">arrow_forward</span></a>'
      + '</div></div></div>';
  }

  function initDashboard() {
    var grid = document.getElementById('recipe-grid');
    if (!grid) return;

    var API          = window.KONDITOR_API || '';
    var totalEl      = document.getElementById('stat-total-receitas');
    var margemEl     = document.getElementById('stat-margem-media');
    var melhorNomeEl = document.getElementById('stat-melhor-nome');
    var melhorPctEl  = document.getElementById('stat-melhor-margem-pct');
    var filterGroup  = document.getElementById('filter-chips-group');
    var btnRascunhos = document.getElementById('btn-ver-rascunhos');

    var modoRascunhos  = false;
    var publishedCache = null; // [stats, receitas] — avoids refetch on toggle back

    var INACTIVE_CLS = 'whitespace-nowrap px-5 py-2 rounded-full font-headline font-bold text-sm transition-all duration-200 active:scale-95 bg-surface-container-lowest border border-slate-200 text-on-surface-variant hover:border-primary/40 hover:text-primary hover:bg-primary-container/10';

    /* ── Render published recipes ── */
    function renderPublicadas(stats, receitas) {
      if (filterGroup) filterGroup.classList.remove('hidden');

      if (totalEl)      totalEl.textContent      = stats.totalReceitas;
      if (margemEl)     margemEl.textContent     = Number(stats.margemMedia).toFixed(1) + '%';
      if (melhorNomeEl) melhorNomeEl.textContent = stats.melhorMargem ? stats.melhorMargem.nome : '\u2014';
      if (melhorPctEl)  melhorPctEl.textContent  = stats.melhorMargem ? stats.melhorMargem.margem + '% de margem' : '';

      if (!receitas || receitas.length === 0) {
        grid.innerHTML = '<p class="col-span-3 text-center text-on-surface-variant py-16">Nenhuma receita publicada ainda. '
          + '<a href="criar-receita.html" class="text-primary font-bold hover:underline">Criar primeira receita</a></p>';
        return;
      }

      /* Build category filter chips */
      if (filterGroup) {
        var categorias = [];
        receitas.forEach(function (r) {
          if (r.categoria && categorias.indexOf(r.categoria) === -1) categorias.push(r.categoria);
        });
        filterGroup.querySelectorAll('[data-dynamic-chip]').forEach(function (el) { el.remove(); });
        categorias.forEach(function (cat) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.setAttribute('data-filter-chip', '');
          btn.setAttribute('data-dynamic-chip', '');
          btn.setAttribute('aria-pressed', 'false');
          btn.className = INACTIVE_CLS;
          btn.textContent = cat;
          filterGroup.appendChild(btn);
        });
        initFilterChips();
      }

      grid.innerHTML = receitas.map(buildRecipeCard).join('');
      var activeChip = document.querySelector('[data-filter-chip][aria-pressed="true"]');
      if (activeChip) filterRecipeCards(activeChip.textContent.trim());
    }

    /* ── Render drafts ── */
    function renderRascunhos(rascunhos) {
      if (filterGroup) filterGroup.classList.add('hidden');

      if (!rascunhos || rascunhos.length === 0) {
        grid.innerHTML = '<p class="col-span-3 text-center text-on-surface-variant py-16">'
          + 'Nenhum rascunho salvo. <a href="criar-receita.html" class="text-primary font-bold hover:underline">Criar nova receita</a></p>';
        return;
      }
      grid.innerHTML = rascunhos.map(buildDraftCard).join('');
    }

    /* ── Rascunhos toggle ── */
    if (btnRascunhos) {
      btnRascunhos.addEventListener('click', function () {
        modoRascunhos = !modoRascunhos;
        if (modoRascunhos) {
          btnRascunhos.classList.add('bg-amber-100', 'text-amber-700', 'border-amber-300');
          btnRascunhos.classList.remove('bg-surface-container-highest', 'text-on-surface', 'border-transparent');
          grid.innerHTML = '<div class="col-span-3 flex justify-center py-12">'
            + '<span class="material-symbols-outlined text-outline-variant" style="animation:spin .9s linear infinite">progress_activity</span></div>';
          apiFetch(API + '/dashboard/receitas?status=rascunho')
            .then(function (r) { return r.ok ? r.json() : []; })
            .then(function (data) { renderRascunhos(data); })
            .catch(function () { renderRascunhos([]); });
        } else {
          btnRascunhos.classList.remove('bg-amber-100', 'text-amber-700', 'border-amber-300');
          btnRascunhos.classList.add('bg-surface-container-highest', 'text-on-surface', 'border-transparent');
          if (publishedCache) renderPublicadas(publishedCache[0], publishedCache[1]);
        }
      });
    }

    initSession().then(function (tok) {
      if (!tok) return;

      Promise.all([
        apiFetch(API + '/dashboard/estatisticas').then(function (r) {
          if (!r.ok) throw new Error('stats');
          return r.json();
        }),
        apiFetch(API + '/dashboard/receitas').then(function (r) {
          if (!r.ok) throw new Error('grid');
          return r.json();
        })
      ]).then(function (results) {
        publishedCache = results;
        renderPublicadas(results[0], results[1]);
      }).catch(function () {
        grid.innerHTML = '<p class="col-span-3 text-center text-on-surface-variant py-16">Erro ao carregar receitas. Tente recarregar a p\u00e1gina.</p>';
        if (totalEl)      totalEl.textContent      = '\u2014';
        if (margemEl)     margemEl.textContent     = '\u2014';
        if (melhorNomeEl) melhorNomeEl.textContent = '\u2014';
        if (melhorPctEl)  melhorPctEl.textContent  = '';
      });
    }); // initSession
  }

  /* ─────────────────────────────────────────────
     Google Sign-In — OIDC implicit popup → id_token → POST /auth/google
     Opens a popup to Google OAuth (response_type=id_token).
     auth-callback.html reads the fragment and postMessages id_token back.
     No FedCM, no GIS library required for the auth step.
  ───────────────────────────────────────────── */
  function initGoogleAuth() {
    var CLIENT_ID    = '1045651153478-4379bpb4fepqg0gvlg4goktic09vl883.apps.googleusercontent.com';
    var CALLBACK_URI = window.location.origin + '/auth-callback.html';
    var btns = document.querySelectorAll('[data-google-signin]');
    if (!btns.length) return;

    var lastClickedBtn = null;
    var popupTimer    = null;

    /* Listen for the id_token posted back from auth-callback.html */
    window.addEventListener('message', function (e) {
      if (e.origin !== window.location.origin) return;
      if (!e.data) return;

      clearInterval(popupTimer);
      var btn = lastClickedBtn || btns[0];

      if (e.data.konditor_error) {
        setLoading(btn, false);
        showAuthError(btn, 'Login cancelado ou recusado pelo Google. Tente novamente.');
        return;
      }

      if (e.data.konditor_idToken) {
        sessionStorage.setItem('konditor_id_token_temp', e.data.konditor_idToken);
        setLoading(btn, true);
        postAuthGoogle(e.data.konditor_idToken, btn);
      }
    });

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        lastClickedBtn = btn;
        setLoading(btn, true);

        var nonce  = Math.random().toString(36).slice(2) + Date.now().toString(36);
        var params = new URLSearchParams({
          client_id:     CLIENT_ID,
          redirect_uri:  CALLBACK_URI,
          response_type: 'id_token',
          scope:         'openid email profile',
          nonce:         nonce
        });

        var w = 500, h = 600;
        var left = Math.max(0, (screen.width  - w) / 2);
        var top  = Math.max(0, (screen.height - h) / 2);
        var popup = window.open(
          'https://accounts.google.com/o/oauth2/v2/auth?' + params.toString(),
          'konditor-google-signin',
          'width=' + w + ',height=' + h + ',left=' + left + ',top=' + top + ',scrollbars=yes'
        );

        if (!popup || popup.closed) {
          setLoading(btn, false);
          showAuthError(btn, 'Popup bloqueado pelo navegador. Permita popups para este site e tente novamente.');
          return;
        }

        /* Detect popup closed without completing */
        clearInterval(popupTimer);
        popupTimer = setInterval(function () {
          if (popup.closed) {
            clearInterval(popupTimer);
            setLoading(btn, false);
          }
        }, 600);
      });
    });

    function postAuthGoogle(idToken, triggerBtn) {
      var isOnboard = triggerBtn && triggerBtn.dataset.googleSignin === 'onboard';

      fetch((window.KONDITOR_API || '') + '/auth/google', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: idToken })
      })
        .then(function (r) {
          return r.json().then(function (d) { return { ok: r.ok, data: d }; });
        })
        .then(function (res) {
          if (!res.ok) {
            setLoading(triggerBtn, false);
            showAuthError(triggerBtn, (res.data && res.data.detail) || 'Erro ao autenticar. Tente novamente.');
            return;
          }

          var data = res.data;
          setAccessToken(data.accessToken);
          if (data.expiresIn) scheduleRefresh(data.expiresIn);
          localStorage.setItem('konditor_user', JSON.stringify(data.usuario));

          if (data.workspace) {
            localStorage.setItem('konditor_workspace', JSON.stringify(data.workspace));
            sessionStorage.removeItem('konditor_id_token_temp');
            window.location.href = 'receitas.html';
          } else {
            localStorage.removeItem('konditor_workspace');
            if (isOnboard) {
              setLoading(triggerBtn, false);
              triggerBtn.disabled = true;
              triggerBtn.classList.add('cursor-default', 'opacity-80');
              triggerBtn.innerHTML =
                '<span class="material-symbols-outlined" style="color:#006f1d;font-variation-settings:\'FILL\' 1;">check_circle</span>' +
                '<span>Conectado como <strong>' + data.usuario.nome + '</strong></span>';
              var submitBtn = document.getElementById('onboarding-submit-btn');
              if (submitBtn) submitBtn.removeAttribute('disabled');
            } else {
              window.location.href = 'onboarding.html';
            }
          }
        })
        .catch(function () {
          setLoading(triggerBtn, false);
          showAuthError(triggerBtn, 'Falha de conexão. Verifique sua internet e tente novamente.');
        });
    }

    function setLoading(btn, loading) {
      if (!btn) return;
      if (loading) {
        if (!btn.dataset.origHtml) btn.dataset.origHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:1.1rem;animation:spin .9s linear infinite;">progress_activity</span><span>Aguarde…</span>';
      } else {
        btn.disabled = false;
        if (btn.dataset.origHtml) { btn.innerHTML = btn.dataset.origHtml; delete btn.dataset.origHtml; }
      }
    }

    function showAuthError(btn, msg) {
      var section = btn && btn.closest('section,div.glass-card');
      var errEl = section ? section.querySelector('[data-auth-error]') : document.querySelector('[data-auth-error]');
      if (errEl) { errEl.textContent = msg; errEl.classList.remove('hidden'); }
    }
  }

  /* ─────────────────────────────────────────────
     Onboarding — POST /onboarding → re-auth → app
  ───────────────────────────────────────────── */
  function initOnboarding() {
    var submitBtn = document.getElementById('onboarding-submit-btn');
    var nameInput = document.getElementById('workspace-name-input');
    if (!submitBtn || !nameInput) return;

    /* Se já há workspace salvo, usuário não deveria estar aqui */
    if (localStorage.getItem('konditor_workspace')) {
      window.location.href = 'receitas.html';
      return;
    }

    nameInput.addEventListener('input', function () {
      var errEl = document.getElementById('onboarding-name-error');
      if (errEl && nameInput.value.trim().length >= 2) errEl.classList.add('hidden');
    });

    submitBtn.addEventListener('click', function () {
      var nome = nameInput.value.trim();
      var errEl = document.getElementById('onboarding-name-error');

      if (nome.length === 0) {
        if (errEl) { errEl.textContent = 'O nome do ateliê é obrigatório.'; errEl.classList.remove('hidden'); }
        nameInput.focus(); return;
      }
      if (nome.length < 2) {
        if (errEl) { errEl.textContent = 'O nome deve ter pelo menos 2 caracteres.'; errEl.classList.remove('hidden'); }
        nameInput.focus(); return;
      }
      if (nome.length > 100) {
        if (errEl) { errEl.textContent = 'O nome deve ter no máximo 100 caracteres.'; errEl.classList.remove('hidden'); }
        nameInput.focus(); return;
      }
      if (errEl) errEl.classList.add('hidden');

      var accessToken = getAccessToken();
      if (!accessToken) {
        alert('Conecte sua conta Google no Passo 1 antes de continuar.');
        return;
      }

      var origHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Criando seu ateliê…</span><span class="material-symbols-outlined">hourglass_top</span>';

      fetch((window.KONDITOR_API || '') + '/onboarding', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        },
        body: JSON.stringify({ nomeWorkspace: nome, moeda: 'BRL' })
      })
        .then(function (r) {
          return r.json().then(function (d) { return { ok: r.ok, status: r.status, data: d }; });
        })
        .then(function (res) {
          if (!res.ok) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origHtml;
            var errEl2 = document.getElementById('onboarding-name-error');
            var msg;
            if (res.data && res.data.fieldErrors && res.data.fieldErrors.nomeWorkspace) {
              msg = res.data.fieldErrors.nomeWorkspace;
            } else if (res.status === 422) {
              /* Workspace já existe — token completo, ir direto para o app */
              var idTokenRetry = sessionStorage.getItem('konditor_id_token_temp');
              if (idTokenRetry) {
                fetch((window.KONDITOR_API || '') + '/auth/google', {
                  method: 'POST',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ idToken: idTokenRetry })
                })
                  .then(function (r) { return r.json(); })
                  .then(function (data) {
                    sessionStorage.removeItem('konditor_id_token_temp');
                    setAccessToken(data.accessToken);
                    if (data.expiresIn) scheduleRefresh(data.expiresIn);
                    if (data.usuario) localStorage.setItem('konditor_user', JSON.stringify(data.usuario));
                    if (data.workspace) localStorage.setItem('konditor_workspace', JSON.stringify(data.workspace));
                    window.location.href = 'receitas.html';
                  })
                  .catch(function () { window.location.href = 'login.html'; });
              } else {
                window.location.href = 'login.html';
              }
              return;
            } else if (res.status === 401) {
              localStorage.removeItem('konditor_token');
              window.location.href = 'login.html';
              return;
            } else {
              msg = (res.data && res.data.detail) || 'Erro ao criar o ateliê. Tente novamente.';
            }
            if (errEl2) { errEl2.textContent = msg; errEl2.classList.remove('hidden'); }
            else alert(msg);
            return;
          }

          /* Onboarding criado — re-auth com idToken para obter token com workspace */
          var idToken = sessionStorage.getItem('konditor_id_token_temp');
          if (!idToken) {
            /* Token expirou — vai para login buscar um novo */
            localStorage.removeItem('konditor_token');
            window.location.href = 'login.html';
            return;
          }

          fetch((window.KONDITOR_API || '') + '/auth/google', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: idToken })
          })
            .then(function (r) { return r.json(); })
            .then(function (data) {
              sessionStorage.removeItem('konditor_id_token_temp');
              setAccessToken(data.accessToken);
              if (data.expiresIn) scheduleRefresh(data.expiresIn);
              if (data.usuario) localStorage.setItem('konditor_user', JSON.stringify(data.usuario));
              if (data.workspace) localStorage.setItem('konditor_workspace', JSON.stringify(data.workspace));
              window.location.href = 'receitas.html';
            })
            .catch(function () {
              sessionStorage.removeItem('konditor_id_token_temp');
              window.location.href = 'login.html';
            });
        })
        .catch(function () {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origHtml;
          alert('Falha de conexão. Verifique sua internet e tente novamente.');
        });
    });
  }

  /* ─────────────────────────────────────────────
     Logout — POST /auth/logout → limpa token → login
  ───────────────────────────────────────────── */
  function initLogout() {
    document.querySelectorAll('[data-logout]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var token = getAccessToken();

        function clearAndRedirect() {
          setAccessToken(null);
          clearTimeout(_refreshTimer);
          localStorage.removeItem('konditor_user');
          localStorage.removeItem('konditor_workspace');
          sessionStorage.removeItem('konditor_id_token_temp');
          window.location.href = 'login.html';
        }

        if (!token) { clearAndRedirect(); return; }

        fetch((window.KONDITOR_API || '') + '/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Authorization': 'Bearer ' + token }
        })
          .then(function () { clearAndRedirect(); })
          .catch(function () { clearAndRedirect(); });
      });
    });
  }

  /* ─────────────────────────────────────────────
     Criar Receita — criar-receita.html
  ───────────────────────────────────────────── */
  function initCriarReceita() {
    var container = document.getElementById('ingredientes-container');
    if (!container) return;

    var API = window.KONDITOR_API || '';
    initSession().then(function (tok) { if (!tok) window.location.href = 'login.html'; });

    /* ── State ── */
    var state = {
      receitaId: null,
      ingredientes: [],   // { ingredienteId, unidadeId, nome, unidadeSimbolo, quantidade }
      precoSugerido: null,
      calcTimer: null,
      searchTimer: null,
      custosFixosTipo: 'percentual'  // 'percentual' | 'fixo'
    };

    /* ── DOM refs ── */
    var btnSalvar       = document.getElementById('btn-salvar-rascunho');
    var btnPublicar     = document.getElementById('btn-publicar');
    var btnAplicar      = document.getElementById('btn-aplicar-preco');
    var nomInput        = document.getElementById('input-nome');
    var rendInput       = document.getElementById('input-rendimento');
    var tempoInput      = document.getElementById('input-tempo');
    var notasInput      = document.getElementById('input-notas');
    var elCustoIngr     = document.getElementById('val-custo-ingredientes');
    var elMaoObra       = document.getElementById('val-mao-de-obra');
    var elCustFixos     = document.getElementById('val-custos-fixos');
    var elCustTotal     = document.getElementById('val-custo-total');
    var elPrecoSug      = document.getElementById('val-preco-sugerido');
    var elMargem        = document.getElementById('val-margem');
    var elPrecoFinal    = document.getElementById('input-preco-final');
    var inpValorHora    = document.getElementById('input-valor-hora');
    var inpCustFixos    = document.getElementById('input-custos-fixos');
    var inpMargemLucro  = document.getElementById('input-margem');
    var searchInput     = document.getElementById('ingrediente-search-input');
    var searchDropdown  = document.getElementById('ingrediente-search-dropdown');
    var emptyHint       = document.getElementById('ingredientes-empty-hint');
    var pctMaoDisplay   = document.getElementById('val-pct-mao-obra-display');
    var pctFixDisplay   = document.getElementById('val-pct-custos-fixos-display');
    var btnCustosPct    = document.getElementById('btn-custos-pct');
    var btnCustosFixo   = document.getElementById('btn-custos-fixo');
    var custosFixosUnit = document.getElementById('custos-fixos-unit');

    /* ── Helpers ── */
    function fmtBRL(val) {
      return Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    function pctVal(el, def) {
      var v = el ? parseFloat(el.value) : NaN;
      return isNaN(v) || v < 0 ? def : v;
    }

    /* ── Toast ── */
    function showToast(msg, tipo) {
      var toast = document.getElementById('criar-toast');
      var icon  = document.getElementById('criar-toast-icon');
      var msgEl = document.getElementById('criar-toast-msg');
      if (!toast) return;
      toast.className = 'fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-headline font-bold text-sm '
        + (tipo === 'erro' ? 'bg-error text-white' : 'bg-secondary text-white');
      if (icon) icon.textContent = tipo === 'erro' ? 'error' : 'check_circle';
      if (msgEl) msgEl.textContent = msg;
      clearTimeout(toast._t);
      toast._t = setTimeout(function () { toast.className = 'hidden'; }, 4000);
    }

    /* ── Button loading ── */
    function setLoading(btn, loading) {
      if (!btn) return;
      if (loading) {
        btn.dataset.origText = btn.textContent.trim();
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:1rem;animation:spin .9s linear infinite;vertical-align:middle;">progress_activity</span> Aguarde\u2026';
      } else {
        btn.disabled = false;
        btn.textContent = btn.dataset.origText || btn.textContent;
      }
    }

    /* ── Tooltips ── */
    var tooltipBox = document.getElementById('tooltip-box');
    document.querySelectorAll('.tooltip-trigger').forEach(function (el) {
      el.addEventListener('mouseenter', function (e) {
        if (!tooltipBox) return;
        tooltipBox.textContent = el.dataset.tooltip || '';
        tooltipBox.classList.remove('hidden');
        var r = el.getBoundingClientRect();
        var top = r.top + window.scrollY - tooltipBox.offsetHeight - 8;
        var left = Math.min(r.left + window.scrollX, window.innerWidth - tooltipBox.offsetWidth - 16);
        tooltipBox.style.top  = Math.max(8, top) + 'px';
        tooltipBox.style.left = Math.max(8, left) + 'px';
      });
      el.addEventListener('mouseleave', function () {
        if (tooltipBox) tooltipBox.classList.add('hidden');
      });
    });

    /* ── Render ingredient list ── */
    function renderIngredientes() {
      container.innerHTML = '';
      if (!state.ingredientes.length) {
        if (emptyHint) emptyHint.classList.remove('hidden');
        return;
      }
      if (emptyHint) emptyHint.classList.add('hidden');

      state.ingredientes.forEach(function (ing, idx) {
        var row = document.createElement('div');
        row.className = 'ingredient-row flex items-center gap-3 mb-3 group transition-all';
        row.dataset.index = String(idx);

        row.innerHTML =
          '<div class="flex-grow grid grid-cols-12 gap-3 p-3 rounded-2xl bg-surface-container-low group-hover:bg-white group-hover:shadow-md transition-all border-l-4 border-primary">'
          + '<div class="col-span-5 flex items-center">'
          + '<span class="font-medium text-sm text-on-surface truncate" title="' + escHtml(ing.nome) + '">' + escHtml(ing.nome) + '</span>'
          + '</div>'
          + '<div class="col-span-3 flex items-center justify-end">'
          + '<input type="number" min="0.001" step="any" class="ingredient-qty-input w-full bg-white/70 border-2 border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/20 rounded-xl text-right font-bold py-1.5 px-3 text-sm transition-all shadow-sm" value="' + escHtml(String(ing.quantidade || '')) + '" placeholder="Qtd." />'
          + '</div>'
          + '<div class="col-span-4 flex items-center">'
          + '<span class="ml-2 text-sm font-bold text-outline uppercase">' + escHtml(ing.unidadeSimbolo) + '</span>'
          + '</div>'
          + '</div>'
          + '<button type="button" aria-label="Remover ingrediente" class="remove-row-btn w-9 h-9 flex items-center justify-center rounded-full text-outline-variant hover:text-error hover:bg-error/10 transition-all shrink-0">'
          + '<span class="material-symbols-outlined text-base">delete</span>'
          + '</button>';

        container.appendChild(row);

        var qtyInput  = row.querySelector('.ingredient-qty-input');
        var removeBtn = row.querySelector('.remove-row-btn');

        qtyInput.addEventListener('input', function () {
          state.ingredientes[idx].quantidade = qtyInput.value;
          scheduleCalculo();
        });

        removeBtn.addEventListener('click', function () {
          state.ingredientes.splice(idx, 1);
          renderIngredientes();
          scheduleCalculo();
        });
      });
    }

    /* ── Search bar ── */
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        var q = searchInput.value.trim();
        clearTimeout(state.searchTimer);
        if (q.length < 2) { if (searchDropdown) searchDropdown.classList.add('hidden'); return; }
        state.searchTimer = setTimeout(function () {
          apiFetch(API + '/ingredientes?query=' + encodeURIComponent(q))
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
              if (!searchDropdown) return;
              if (!data || !data.length) { searchDropdown.classList.add('hidden'); return; }
              searchDropdown.innerHTML = data.map(function (item) {
                var alreadyAdded = state.ingredientes.some(function (i) { return i.ingredienteId === item.id; });
                return '<button type="button" class="w-full text-left px-4 py-3 hover:bg-primary-container/10 transition-colors flex items-center justify-between gap-3 border-b border-outline-variant/10 last:border-0'
                  + (alreadyAdded ? ' opacity-50 pointer-events-none' : '') + '"'
                  + ' data-id="' + escHtml(item.id) + '"'
                  + ' data-unidade-id="' + escHtml(item.unidadeId) + '"'
                  + ' data-unidade="' + escHtml(item.unidadeSimbolo) + '"'
                  + ' data-nome="' + escHtml(item.nome) + '">'
                  + '<span class="font-medium text-sm">' + escHtml(item.nome)
                  + (item.marca ? ' <span class="text-[10px] text-outline-variant">' + escHtml(item.marca) + '</span>' : '')
                  + '</span>'
                  + '<span class="text-[10px] font-bold uppercase bg-surface-container text-outline rounded-full px-2 py-0.5 shrink-0">' + escHtml(item.unidadeSimbolo) + '</span>'
                  + '</button>';
              }).join('');
              searchDropdown.classList.remove('hidden');
            })
            .catch(function () {});
        }, 300);
      });

      searchInput.addEventListener('blur', function () {
        setTimeout(function () { if (searchDropdown) searchDropdown.classList.add('hidden'); }, 200);
      });

      if (searchDropdown) {
        searchDropdown.addEventListener('mousedown', function (e) {
          e.preventDefault();
          var btn = e.target.closest('button[data-id]');
          if (!btn) return;
          state.ingredientes.push({
            ingredienteId:  btn.dataset.id,
            unidadeId:      btn.dataset.unidadeId,
            nome:           btn.dataset.nome,
            unidadeSimbolo: btn.dataset.unidade,
            quantidade:     ''
          });
          renderIngredientes();
          searchDropdown.classList.add('hidden');
          searchInput.value = '';
          /* Focus the qty field of the just-added row */
          var rows = container.querySelectorAll('.ingredient-row');
          var last = rows[rows.length - 1];
          if (last) { var qi = last.querySelector('.ingredient-qty-input'); if (qi) { qi.focus(); qi.select(); } }
          scheduleCalculo();
        });
      }
    }

    /* ── Watch parameter inputs for recalc ── */
    /* Custos fixos tipo toggle */
    function setCustosFixosTipo(tipo) {
      state.custosFixosTipo = tipo;
      var isPct = tipo === 'percentual';
      var ACTIVE   = ['bg-primary', 'text-on-primary'];
      var INACTIVE = ['bg-transparent', 'text-outline-variant'];
      if (btnCustosPct) {
        (isPct ? ACTIVE : INACTIVE).forEach(function (c) { btnCustosPct.classList.add(c); });
        (isPct ? INACTIVE : ACTIVE).forEach(function (c) { btnCustosPct.classList.remove(c); });
      }
      if (btnCustosFixo) {
        (!isPct ? ACTIVE : INACTIVE).forEach(function (c) { btnCustosFixo.classList.add(c); });
        (!isPct ? INACTIVE : ACTIVE).forEach(function (c) { btnCustosFixo.classList.remove(c); });
      }
      if (custosFixosUnit) custosFixosUnit.textContent = isPct ? '%' : 'R$';
      /* Update inpCustFixos step hint */
      if (inpCustFixos) inpCustFixos.step = isPct ? '1' : '0.01';
      /* Update badge */
      if (pctFixDisplay && inpCustFixos) {
        pctFixDisplay.textContent = isPct
          ? (parseFloat(inpCustFixos.value) || 0) + '%'
          : 'R$' + (parseFloat(inpCustFixos.value) || 0).toFixed(2);
      }
      scheduleCalculo();
    }
    if (btnCustosPct)  btnCustosPct.addEventListener('click',  function () { setCustosFixosTipo('percentual'); });
    if (btnCustosFixo) btnCustosFixo.addEventListener('click', function () { setCustosFixosTipo('fixo'); });

    [inpValorHora, inpCustFixos, inpMargemLucro, rendInput, tempoInput].forEach(function (el) {
      if (el) el.addEventListener('input', function () {
        /* Update display badges */
        if (inpValorHora && pctMaoDisplay) pctMaoDisplay.textContent = 'R$' + (parseFloat(inpValorHora.value) || 0).toFixed(2) + '/h';
        if (inpCustFixos && pctFixDisplay) {
          pctFixDisplay.textContent = state.custosFixosTipo === 'percentual'
            ? (parseFloat(inpCustFixos.value) || 0) + '%'
            : 'R$' + (parseFloat(inpCustFixos.value) || 0).toFixed(2);
        }
        scheduleCalculo();
      });
    });

    /* ── Debounced calculation ── */
    function scheduleCalculo() {
      clearTimeout(state.calcTimer);
      state.calcTimer = setTimeout(calcularCustos, 400);
    }

    function calcularCustos() {
      var validos = state.ingredientes.filter(function (ing) {
        return ing.ingredienteId && ing.unidadeId && ing.quantidade && Number(ing.quantidade) > 0;
      });
      if (!validos.length) return;

      var rendQtd      = parseFloat(rendInput ? rendInput.value : '') || 1;
      var valorHora    = parseFloat(inpValorHora ? inpValorHora.value : '') || 0;
      var custFixosVal = parseFloat(inpCustFixos ? inpCustFixos.value : '') || 0;
      var margem       = pctVal(inpMargemLucro, 30);
      var tempoMin     = parseTempoMinutos();

      apiFetch(API + '/receitas/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredientes: validos.map(function (ing) {
            return { ingredienteId: ing.ingredienteId, quantidade: Number(ing.quantidade), unidadeId: ing.unidadeId };
          }),
          rendimentoQuantidade:  rendQtd,
          maoDeObraValorHora:    valorHora,
          tempoPreparoMinutos:   tempoMin,
          custosFixosValor:      custFixosVal,
          custosFixosTipo:       state.custosFixosTipo,
          margemDesejada:        margem
        })
      })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) { if (data) atualizarPainel(data); })
        .catch(function () {});
    }

    function atualizarPainel(data) {
      state.precoSugerido = data.precoSugeridoPorUnidade;
      if (elCustoIngr) elCustoIngr.textContent = fmtBRL(data.custoIngredientes);
      if (elMaoObra)   elMaoObra.textContent   = fmtBRL(data.custoMaoDeObra);
      if (elCustFixos) elCustFixos.textContent = fmtBRL(data.custosFixos);
      if (elCustTotal) elCustTotal.textContent = fmtBRL(data.custoTotal);
      if (elPrecoSug)  elPrecoSug.textContent  = fmtBRL(data.precoSugeridoPorUnidade);
      var margem = Math.round(data.margemUtilizada || data.margem || 0);
      if (elMargem) elMargem.textContent = margem + '%';
      /* Mão de obra badge: show effective valor/hora */
      if (pctMaoDisplay && inpValorHora) pctMaoDisplay.textContent = 'R$' + (parseFloat(inpValorHora.value) || 0).toFixed(2) + '/h';
      /* Custos fixos badge: show % or R$ depending on tipo */
      if (pctFixDisplay && inpCustFixos) {
        pctFixDisplay.textContent = state.custosFixosTipo === 'percentual'
          ? (parseFloat(inpCustFixos.value) || 0) + '%'
          : 'R$' + (parseFloat(inpCustFixos.value) || 0).toFixed(2);
      }
      var bar = document.getElementById('margem-bar');
      if (bar) bar.style.width = Math.min(100, margem) + '%';
    }

    /* ── Apply suggested price ── */
    if (btnAplicar) {
      btnAplicar.addEventListener('click', function () {
        if (state.precoSugerido !== null && elPrecoFinal) {
          elPrecoFinal.value = Number(state.precoSugerido).toFixed(2);
        }
      });
    }

    /* ── Build payload ── */
    function parseTempoMinutos() {
      if (!tempoInput || !tempoInput.value.trim()) return 0;
      var str = tempoInput.value.trim();
      var hM = str.match(/(\d+)\s*h/);
      var mM = str.match(/(\d+)\s*min/);
      if (hM || mM) return (hM ? parseInt(hM[1]) * 60 : 0) + (mM ? parseInt(mM[1]) : 0);
      return parseInt(str) || 0;
    }

    function buildPayload(status) {
      var rendQtd      = parseFloat(rendInput ? rendInput.value : '') || 1;
      var valorHora    = parseFloat(inpValorHora ? inpValorHora.value : '') || 0;
      var custFixosVal = parseFloat(inpCustFixos ? inpCustFixos.value : '') || 0;
      var margem       = pctVal(inpMargemLucro, 30);
      var precoFin     = elPrecoFinal ? parseFloat(elPrecoFinal.value) : NaN;
      return {
        nome:                 nomInput ? nomInput.value.trim() : '',
        rendimentoQuantidade: rendQtd,
        tempoPreparoMinutos:  parseTempoMinutos(),
        ingredientes: state.ingredientes
          .filter(function (ing) { return ing.ingredienteId && ing.unidadeId && ing.quantidade; })
          .map(function (ing) {
            return { ingredienteId: ing.ingredienteId, quantidade: Number(ing.quantidade), unidadeId: ing.unidadeId };
          }),
        notas:                notasInput ? notasInput.value.trim() : '',
        precoFinal:           isNaN(precoFin) || precoFin <= 0 ? 0 : precoFin,
        maoDeObraValorHora:   valorHora,
        custosFixosValor:     custFixosVal,
        custosFixosTipo:      state.custosFixosTipo,
        margemDesejada:       margem,
        status:               status
      };
    }

    function validarForm() {
      var nome = nomInput ? nomInput.value.trim() : '';
      if (!nome) {
        showToast('O nome da receita \u00e9 obrigat\u00f3rio.', 'erro');
        if (nomInput) nomInput.focus();
        return false;
      }
      if (!state.ingredientes.length) {
        showToast('Adicione pelo menos um ingrediente.', 'erro');
        if (searchInput) searchInput.focus();
        return false;
      }
      var semQtd = state.ingredientes.some(function (i) { return !i.quantidade || Number(i.quantidade) <= 0; });
      if (semQtd) {
        showToast('Preencha a quantidade de todos os ingredientes.', 'erro');
        return false;
      }
      return true;
    }

    /* ── Salvar Rascunho ── */
    if (btnSalvar) {
      btnSalvar.addEventListener('click', function () {
        if (!validarForm()) return;
        setLoading(btnSalvar, true);
        var payload = buildPayload('rascunho');
        var req = state.receitaId
          ? apiFetch(API + '/receitas/' + state.receitaId, { method: 'PUT',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          : apiFetch(API + '/receitas',                    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        req
          .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, status: r.status, data: d }; }); })
          .then(function (res) {
            setLoading(btnSalvar, false);
            if (!res.ok) { showToast((res.data && res.data.detail) || 'Erro ao salvar.', 'erro'); return; }
            state.receitaId = res.data.id;
            showToast('Rascunho salvo!', 'sucesso');
          })
          .catch(function () { setLoading(btnSalvar, false); showToast('Falha de conex\u00e3o.', 'erro'); });
      });
    }

    /* ── Publicar ── */
    if (btnPublicar) {
      btnPublicar.addEventListener('click', function () {
        if (!validarForm()) return;
        setLoading(btnPublicar, true);
        var req = state.receitaId
          ? apiFetch(API + '/receitas/' + state.receitaId + '/publicar', { method: 'POST' })
          : apiFetch(API + '/receitas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildPayload('publicada')) });
        req
          .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, status: r.status, data: d }; }); })
          .then(function (res) {
            setLoading(btnPublicar, false);
            if (!res.ok) { showToast((res.data && res.data.detail) || 'Erro ao publicar.', 'erro'); return; }
            showToast('Receita publicada!', 'sucesso');
            setTimeout(function () { window.location.href = 'receitas.html'; }, 1500);
          })
          .catch(function () { setLoading(btnPublicar, false); showToast('Falha de conex\u00e3o.', 'erro'); });
      });
    }

    /* ── Initial render ── */
    renderIngredientes();
  }

  /* ─────────────────────────────────────────────
     Init
  ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initSidebarHtml();
    initSidebar();
    initMobileNav();
    initRangeInputs();
    initFilterChips();
    initBillingToggle();
    initTermsScrollSpy();
    initGoogleAuth();
    initOnboarding();
    initDashboard();
    initCriarReceita();
    initLogout();
  });
})();
