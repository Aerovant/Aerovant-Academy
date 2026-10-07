/* ==========================================================================
   Aerovant Academy — site script. No dependencies.
   0. Logo fallback   1. Navigation   2. Switchers   3. Prefilled demo links
   4. Demo form (Google Sheet + Web3Forms)   5. Phone dock
   6. Student testimonials (from js/testimonials.js)   7. Pre-launch check
   ========================================================================== */
(function () {
  'use strict';

  /* ---- Settings: the only values you should need to change ---- */
  var CONFIG = {
    // Apps Script web app that writes a row to the Google Sheet (the one the old pop-up form used).
    sheetUrl: 'https://script.google.com/macros/s/AKfycbyeH3Ffs3_jXRCmV9IYzjM8YfzGp_LG8AJ4zOFcnO6YVoRztJX8Xp9QdAVE-jprtoluxA/exec',
    // Web3Forms sends the email. The access key lives in the form's hidden field.
    emailUrl: 'https://api.web3forms.com/submit',
    source: 'Demo form (new site)',
    phone: '+91 90426 47714'
  };

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---- 0. Logo: if a logo file is missing, show the type wordmark instead of a broken image ---- */
  $$('.brand__logo').forEach(function (img) {
    var brand = img.closest('.brand');
    function useWordmark() { if (brand) brand.classList.add('is-fallback'); }
    if (img.complete) { if (!img.naturalWidth) useWordmark(); }
    else img.addEventListener('error', useWordmark);
  });

  /* ---- 1. Navigation ---- */
  var nav = $('#site-nav');
  var menuBtn = $('.menu-btn');
  var drop = $('.nav__drop > button');
  var dropMenu = $('#nav-courses');

  function setMenu(open) {
    if (!nav || !menuBtn) return;
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
  }
  function setDrop(open) {
    if (!drop || !dropMenu) return;
    drop.setAttribute('aria-expanded', String(open));
    dropMenu.hidden = !open;
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
  if (drop) drop.addEventListener('click', function (e) { e.stopPropagation(); setDrop(drop.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('click', function (e) {
    if (dropMenu && !dropMenu.hidden && !e.target.closest('.nav__drop')) setDrop(false);
    if (e.target.closest('#site-nav a')) { setMenu(false); setDrop(false); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (dropMenu && !dropMenu.hidden) { setDrop(false); drop.focus(); }
    else if (nav && nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
  });

  /* ---- 2. Switchers: one answer open at a time ---- */
  function openItem(sw, button) {
    $$('.switch__q', sw).forEach(function (q) {
      var on = q === button;
      q.setAttribute('aria-expanded', String(on));
      var panel = document.getElementById(q.getAttribute('aria-controls'));
      if (panel) panel.classList.toggle('is-open', on);
    });
  }
  $$('[data-switch]').forEach(function (sw) {
    sw.addEventListener('click', function (e) {
      var q = e.target.closest('.switch__q');
      if (!q || !sw.contains(q)) return;
      var wide = window.matchMedia('(min-width: 900px)').matches;
      // On a phone the open item can be closed again; on desktop one pane is always showing.
      if (!wide && q.getAttribute('aria-expanded') === 'true') { openItem(sw, null); return; }
      openItem(sw, q);
    });
  });
  // Header "Courses" menu opens the chosen track in the explorer.
  $$('a[data-track]').forEach(function (a) {
    a.addEventListener('click', function () {
      var item = $('.switch__item[data-track="' + a.getAttribute('data-track') + '"]');
      if (item) openItem(item.parentNode, $('.switch__q', item));
    });
  });

  /* ---- 3. Links that prefill the demo form ---- */
  var form = $('#demo-form');
  var interest = $('#f-interest');
  var topic = $('#f-topic');
  $$('a[data-interest]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (interest) interest.value = a.getAttribute('data-interest');
      if (topic) topic.value = a.getAttribute('data-topic') || '';
      var first = $('#f-name');
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 450);
    });
  });

  /* ---- 4. Demo form ---- */
  var statusBox = $('#form-status');

  function say(kind, text) {
    statusBox.hidden = false;
    statusBox.className = 'form__status ' + (kind === 'ok' ? 'is-ok' : 'is-err');
    statusBox.textContent = text;
  }
  function fieldError(input, text) {
    var id = input.id + '-err';
    var old = document.getElementById(id);
    if (old) old.remove();
    if (!text) { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); return; }
    var p = document.createElement('p');
    p.className = 'field__err'; p.id = id; p.textContent = text;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', id);
    input.parentNode.appendChild(p);
  }
  function validate() {
    var name = $('#f-name'), phone = $('#f-phone'), college = $('#f-college');
    var digits = phone.value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
    var errs = [];
    fieldError(name, name.value.trim() ? '' : 'Enter your name.');
    if (!name.value.trim()) errs.push(name);
    var okPhone = /^[6-9]\d{9}$/.test(digits);
    fieldError(phone, okPhone ? '' : 'Enter a 10-digit mobile number we can call or WhatsApp.');
    if (!okPhone) errs.push(phone);
    fieldError(college, college.value.trim() ? '' : 'Enter your college and year, for example "GCE Bargur, 3rd year".');
    if (!college.value.trim()) errs.push(college);
    if (errs.length) errs[0].focus();
    return errs.length ? null : digits;
  }
  function post(url, body, headers) {
    return fetch(url, { method: 'POST', headers: headers || {}, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); });
  }

  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var digits = validate();
    if (!digits) return;
    var fd = new FormData(form);
    if (fd.get('botcheck')) return; // honeypot

    var btn = $('button[type="submit"]', form);
    var label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Sending…';
    statusBox.hidden = true;

    var mode = fd.get('learning_mode');
    var lead = {
      name: fd.get('name').trim(),
      phone: '+91' + digits,
      college_and_year: fd.get('college_and_year').trim(),
      interested_in: fd.get('interested_in'),
      learning_mode: mode,
      topic: fd.get('topic') || '',
      page: location.href
    };

    // Row for the Google Sheet. The old column names are kept so the existing Apps Script keeps working.
    var sheetRow = {
      full_name: lead.name, phone: lead.phone, whatsapp: lead.phone, email: '',
      mode: mode === 'Online live' ? 'online' : mode === 'Hybrid' ? 'hybrid' : 'offline',
      graduation_year: '',
      course: lead.topic || lead.interested_in,
      message: 'College and year: ' + lead.college_and_year + ' | Interested in: ' + lead.interested_in,
      college_and_year: lead.college_and_year, interested_in: lead.interested_in,
      source: CONFIG.source
    };
    var mail = Object.assign({
      access_key: fd.get('access_key'), subject: fd.get('subject'), from_name: fd.get('from_name')
    }, lead);

    // Both are tried. The lead counts as received if either one confirms, so a Sheet outage no longer loses it.
    Promise.allSettled([
      post(CONFIG.sheetUrl, sheetRow).then(function (r) { if (r.status !== 'success') throw new Error('sheet'); }),
      post(CONFIG.emailUrl, mail, { 'Content-Type': 'application/json', 'Accept': 'application/json' })
        .then(function (r) { if (!r.success) throw new Error('email'); })
    ]).then(function (res) {
      var ok = res.some(function (r) { return r.status === 'fulfilled'; });
      res.forEach(function (r, i) { if (r.status === 'rejected') console.warn('[academy] ' + (i ? 'Email' : 'Sheet') + ' delivery failed'); });
      btn.disabled = false; btn.textContent = label;
      if (ok) {
        form.reset(); if (topic) topic.value = '';
        say('ok', 'Demo class requested. We’ll call you within one working day.');
      } else {
        say('err', 'That didn’t go through. Call or WhatsApp us on ' + CONFIG.phone + ' and we’ll book your class.');
      }
    });
  });

  /* ---- 5. Phone dock steps aside while the form is on screen ---- */
  var dock = $('#dock'), demo = $('#demo-form');
  if (dock && demo && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      dock.classList.toggle('is-away', entries[0].isIntersecting);
    }, { threshold: 0.2 }).observe(demo);
  }

  /* ---- 6. Student testimonials: built from the list in js/testimonials.js ----
     Text is inserted as text, never as HTML. Links are used only if they are http(s) URLs. */
  (function () {
    var section = $('#students');
    if (!section) return;
    var list = (window.ACADEMY_TESTIMONIALS || []).filter(function (t) { return t && t.name && t.quote; });
    if (!list.length) { section.hidden = true; return; }

    function el(tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    }
    function web(u) { return typeof u === 'string' && /^https?:\/\//i.test(u) ? u : ''; }
    function link(label, url) {
      var a = el('a', '', label + ' \u2197');
      a.href = url; a.rel = 'noopener';
      return a;
    }
    function who(t) {
      var cap = el('figcaption', 'voice__who');
      if (t.photo && typeof t.photo === 'string') {
        var img = el('img', 'voice__photo');
        img.src = t.photo; img.alt = ''; img.width = 64; img.height = 64; img.loading = 'lazy';
        cap.appendChild(img);
      }
      var box = el('span');
      var name = el('span', 'voice__name', t.name);
      if (t.sample) { name.appendChild(document.createTextNode(' ')); name.appendChild(el('span', 'tbc voice__sample', 'Sample')); }
      box.appendChild(name);
      var meta = [t.course, t.batch ? t.batch + ' batch' : ''].filter(Boolean).join(', ');
      var course = el('span', 'voice__course', meta);
      if (web(t.linkedin)) { course.appendChild(document.createTextNode(meta ? '. ' : '')); course.appendChild(link('LinkedIn', web(t.linkedin))); }
      box.appendChild(course);
      cap.appendChild(box);
      return cap;
    }
    function voice(t) {
      var fig = el('figure', 'voice');
      var bq = el('blockquote');
      bq.appendChild(el('p', 'voice__quote', t.quote));
      fig.appendChild(bq);
      fig.appendChild(who(t));
      return fig;
    }
    function built(p) {
      var box = el('div', 'built');
      if (p.title) box.appendChild(el('p', 'built__bar', p.title));
      var dl = el('dl', 'spec');
      [['Built', p.summary], ['With', p.stack]].forEach(function (row) {
        if (!row[1]) return;
        dl.appendChild(el('dt', '', row[0])); dl.appendChild(el('dd', '', row[1]));
      });
      if (dl.children.length) box.appendChild(dl);
      var links = el('p', 'built__links');
      if (web(p.github)) links.appendChild(link('GitHub', web(p.github)));
      if (web(p.demo)) links.appendChild(link('Live demo', web(p.demo)));
      if (links.children.length) box.appendChild(links);
      return box.children.length ? box : null;
    }

    var first = list[0];
    var lead = el('div', 'voice voice--lead');
    lead.appendChild(voice(first));
    var sheet = first.project ? built(first.project) : null;
    if (sheet) lead.appendChild(sheet); else lead.classList.add('voice--solo');
    $('#voices-lead').appendChild(lead);

    var more = $('#voices-more');
    list.slice(1).forEach(function (t) { var li = el('li'); li.appendChild(voice(t)); more.appendChild(li); });
    if (list.length < 2) more.hidden = true;

    var note = $('#voices-sample-note');
    if (note) note.hidden = !list.some(function (t) { return t.sample; });
  })();

  /* ---- 7. Pre-launch check: list facts still marked as to be confirmed ---- */
  var open = $$('.tbc').filter(function (el) {
    var w = el.closest('[data-when]'), item = el.closest('[data-status]');
    return !el.closest('[hidden]') && !(w && item && w.getAttribute('data-when') !== item.getAttribute('data-status'));
  });
  if (open.length) console.warn('[academy] ' + open.length + ' facts still to confirm before launch:', open.map(function (el) { return el.textContent; }));
})();
