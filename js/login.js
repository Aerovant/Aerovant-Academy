/* ==========================================================================
   Aerovant Academy — login page UI.
   Validation, error states, show/hide password, the "Forgot password?" panel.
   No network code here: signing in is delegated to AcademyAuth (js/auth.js).
   Nothing is written to cookies, localStorage or the URL by this file.
   ========================================================================== */
(function () {
  'use strict';

  var form = document.getElementById('login-form');
  if (!form) return;

  var CONTACT = '+91 90426 47714';
  var MESSAGES = {
    invalid_credentials: 'Those details don’t match an account. Check your email or username and your password, then try again.',
    network: 'We couldn’t reach the server. Check your connection and try again.',
    fallback: 'Login isn’t available right now. WhatsApp or call us on ' + CONTACT + ' if you need to get in.'
  };

  var idField = document.getElementById('l-id');
  var pwField = document.getElementById('l-pw');
  var statusBox = document.getElementById('login-status');
  var submit = form.querySelector('button[type="submit"]');
  var submitLabel = submit.textContent;

  /* ---- Field errors ---- */
  function fieldError(input, text) {
    var id = input.id + '-err';
    var old = document.getElementById(id);
    if (old) old.remove();
    if (!text) { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); return; }
    var p = document.createElement('p');
    p.className = 'field__err'; p.id = id; p.textContent = text;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', id);
    input.closest('.field').appendChild(p);
  }
  function say(kind, text) {
    statusBox.hidden = !text;
    statusBox.className = 'form__status ' + (kind === 'ok' ? 'is-ok' : 'is-err');
    statusBox.textContent = text || '';
  }
  function validate() {
    var id = idField.value.trim();
    var bad = [];
    var idMsg = '';
    if (!id) idMsg = 'Enter your email or username.';
    else if (id.indexOf('@') !== -1 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id)) idMsg = 'That email address looks incomplete.';
    fieldError(idField, idMsg);
    if (idMsg) bad.push(idField);

    var pwMsg = pwField.value ? '' : 'Enter your password.';
    fieldError(pwField, pwMsg);
    if (pwMsg) bad.push(pwField);

    if (bad.length) bad[0].focus();
    return !bad.length;
  }
  [idField, pwField].forEach(function (input) {
    input.addEventListener('input', function () { if (input.hasAttribute('aria-invalid')) fieldError(input, ''); });
  });

  /* ---- Show / hide password ---- */
  var toggle = document.getElementById('l-pw-toggle');
  if (toggle) toggle.addEventListener('click', function () {
    var show = pwField.type === 'password';
    pwField.type = show ? 'text' : 'password';
    toggle.textContent = show ? 'Hide' : 'Show';
    toggle.setAttribute('aria-pressed', String(show));
  });

  /* ---- Forgot password panel ---- */
  var forgot = document.getElementById('l-forgot');
  var reset = document.getElementById('l-reset');
  if (forgot && reset) forgot.addEventListener('click', function () {
    var open = forgot.getAttribute('aria-expanded') !== 'true';
    forgot.setAttribute('aria-expanded', String(open));
    reset.hidden = !open;
  });

  /* ---- Submit ---- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    say('', '');
    if (!validate()) return;

    var auth = window.AcademyAuth;
    var role = form.elements.role ? form.elements.role.value : 'student';
    var credentials = {
      identifier: idField.value.trim(),
      password: pwField.value,
      role: role,
      remember: !!(form.elements.remember && form.elements.remember.checked)
    };

    submit.disabled = true; submit.textContent = 'Logging in…';
    pwField.type = 'password';
    if (toggle) { toggle.textContent = 'Show'; toggle.setAttribute('aria-pressed', 'false'); }

    var attempt = auth && typeof auth.signIn === 'function'
      ? auth.signIn(credentials)
      : Promise.reject({ code: 'not_connected' });

    Promise.resolve(attempt).then(function (result) {
      say('ok', 'Logged in.');
      if (result && typeof result.redirect === 'string' && result.redirect) window.location.assign(result.redirect);
      else { submit.disabled = false; submit.textContent = submitLabel; }
    }).catch(function (err) {
      var code = err && err.code;
      submit.disabled = false; submit.textContent = submitLabel;
      if (code === 'not_connected') console.warn('[academy] Login is not connected to a backend. Write the sign-in call in js/auth.js (see HANDOFF.md).');
      say('err', MESSAGES[code] || MESSAGES.fallback);
      if (code === 'invalid_credentials') { pwField.value = ''; pwField.focus(); }
    });
  });
})();
