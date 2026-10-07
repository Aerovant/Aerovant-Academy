/* ==========================================================================
   Aerovant Academy — authentication adapter.

   This file is the ONLY place that talks to a login backend.
   The login page (js/login.js) calls AcademyAuth.signIn() and knows nothing else.

   STATUS: NOT CONNECTED. signIn() rejects with code "not_connected" until the
   real sign-in call is written here. Nothing in this file invents an endpoint,
   a credential or a session.

   Contract for signIn(credentials):
     credentials = {
       identifier: string,   // email or username, trimmed
       password:   string,
       role:       'student' | 'staff' | 'admin',
       remember:   boolean   // the "Remember me" box. What it means is the backend's decision.
     }
     resolves -> { redirect?: string }   // where to send the user after login
     rejects  -> AcademyAuthError with .code:
       'invalid_credentials'   wrong email/username or password
       'network'               the server could not be reached
       'not_connected'         this adapter has no backend yet
       anything else           shown as a generic failure

   To connect it, replace the body of signIn(). The shape below is an
   illustration only: the URL, payload and response of your backend will differ.

     signIn: function (c) {
       return fetch('YOUR_LOGIN_URL', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         credentials: 'same-origin',
         body: JSON.stringify(c)
       }).then(function (res) {
         if (res.status === 401) throw new AcademyAuthError('invalid_credentials');
         if (!res.ok) throw new AcademyAuthError('unknown');
         return res.json();              // -> { redirect: '...' }
       }, function () { throw new AcademyAuthError('network'); });
     }
   ========================================================================== */
(function (root) {
  'use strict';

  function AcademyAuthError(code, message) {
    this.name = 'AcademyAuthError';
    this.code = code || 'unknown';
    this.message = message || this.code;
  }
  AcademyAuthError.prototype = Object.create(Error.prototype);
  AcademyAuthError.prototype.constructor = AcademyAuthError;

  var AcademyAuth = {
    /* Set to true once signIn() below calls a real backend. */
    connected: false,

    signIn: function (credentials) { // eslint-disable-line no-unused-vars
      return Promise.reject(new AcademyAuthError('not_connected'));
    }
  };

  root.AcademyAuth = AcademyAuth;
  root.AcademyAuthError = AcademyAuthError;
})(window);
