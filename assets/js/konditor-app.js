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

  function initDashboard() {
    var grid = document.getElementById('recipe-grid');
    if (!grid) return;

    var token = localStorage.getItem('konditor_token');
    if (!token) { window.location.href = 'login.html'; return; }

    var API     = window.KONDITOR_API || '';
    var headers = { 'Authorization': 'Bearer ' + token };
    var totalEl      = document.getElementById('stat-total-receitas');
    var margemEl     = document.getElementById('stat-margem-media');
    var melhorNomeEl = document.getElementById('stat-melhor-nome');
    var melhorPctEl  = document.getElementById('stat-melhor-margem-pct');

    Promise.all([
      fetch(API + '/dashboard/estatisticas', { headers: headers }).then(function (r) {
        if (r.status === 401) { localStorage.removeItem('konditor_token'); window.location.href = 'login.html'; throw new Error('unauth'); }
        if (!r.ok) throw new Error('stats');
        return r.json();
      }),
      fetch(API + '/dashboard/receitas', { headers: headers }).then(function (r) {
        if (r.status === 401) { localStorage.removeItem('konditor_token'); window.location.href = 'login.html'; throw new Error('unauth'); }
        if (!r.ok) throw new Error('grid');
        return r.json();
      })
    ]).then(function (results) {
      var stats    = results[0];
      var receitas = results[1];

      if (totalEl)      totalEl.textContent      = stats.totalReceitas;
      if (margemEl)     margemEl.textContent     = Number(stats.margemMedia).toFixed(1) + '%';
      if (melhorNomeEl) melhorNomeEl.textContent = stats.melhorMargem ? stats.melhorMargem.nome : '—';
      if (melhorPctEl)  melhorPctEl.textContent  = stats.melhorMargem ? stats.melhorMargem.margem + '% de margem' : '';

      if (!receitas || receitas.length === 0) {
        grid.innerHTML = '<p class="col-span-3 text-center text-on-surface-variant py-16">Nenhuma receita cadastrada ainda. '
          + '<a href="criar-receita.html" class="text-primary font-bold hover:underline">Criar primeira receita</a></p>';
        return;
      }

      /* Build category filter chips from returned data */
      var filterGroup = document.getElementById('filter-chips-group');
      if (filterGroup) {
        var categorias = [];
        receitas.forEach(function (r) {
          if (r.categoria && categorias.indexOf(r.categoria) === -1) categorias.push(r.categoria);
        });
        var INACTIVE_CLS = 'whitespace-nowrap px-5 py-2 rounded-full font-headline font-bold text-sm transition-all duration-200 active:scale-95 bg-surface-container-lowest border border-slate-200 text-on-surface-variant hover:border-primary/40 hover:text-primary hover:bg-primary-container/10';
        /* remove old dynamically added chips (keep 'Todas') */
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
        /* re-init chips after rebuilding */
        initFilterChips();
      }

      grid.innerHTML = receitas.map(buildRecipeCard).join('');

      var activeChip = document.querySelector('[data-filter-chip][aria-pressed="true"]');
      if (activeChip) filterRecipeCards(activeChip.textContent.trim());
    }).catch(function (err) {
      if (err.message === 'unauth') return;
      grid.innerHTML = '<p class="col-span-3 text-center text-on-surface-variant py-16">Erro ao carregar receitas. Tente recarregar a página.</p>';
      if (totalEl)      totalEl.textContent      = '—';
      if (margemEl)     margemEl.textContent     = '—';
      if (melhorNomeEl) melhorNomeEl.textContent = '—';
      if (melhorPctEl)  melhorPctEl.textContent  = '';
    });
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
          localStorage.setItem('konditor_token', data.accessToken);
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

      var accessToken = localStorage.getItem('konditor_token');
      if (!accessToken) {
        alert('Conecte sua conta Google no Passo 1 antes de continuar.');
        return;
      }

      var origHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Criando seu ateliê…</span><span class="material-symbols-outlined">hourglass_top</span>';

      fetch((window.KONDITOR_API || '') + '/onboarding', {
        method: 'POST',
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
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ idToken: idTokenRetry })
                })
                  .then(function (r) { return r.json(); })
                  .then(function (data) {
                    sessionStorage.removeItem('konditor_id_token_temp');
                    localStorage.setItem('konditor_token', data.accessToken);
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: idToken })
          })
            .then(function (r) { return r.json(); })
            .then(function (data) {
              sessionStorage.removeItem('konditor_id_token_temp');
              localStorage.setItem('konditor_token', data.accessToken);
              if (data.usuario) localStorage.setItem('konditor_user', JSON.stringify(data.usuario));
              if (data.workspace) localStorage.setItem('konditor_workspace', JSON.stringify(data.workspace));
              window.location.href = 'receitas.html';
            })
            .catch(function () {
              sessionStorage.removeItem('konditor_id_token_temp');
              localStorage.removeItem('konditor_token');
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
        var token = localStorage.getItem('konditor_token');

        function clearAndRedirect() {
          localStorage.removeItem('konditor_token');
          localStorage.removeItem('konditor_user');
          localStorage.removeItem('konditor_workspace');
          sessionStorage.removeItem('konditor_id_token_temp');
          window.location.href = 'login.html';
        }

        if (!token) { clearAndRedirect(); return; }

        fetch((window.KONDITOR_API || '') + '/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token }
        })
          .then(function () { clearAndRedirect(); })
          .catch(function () { clearAndRedirect(); });
      });
    });
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
    initLogout();
  });
})();
