/*
 * monicle.ai — Web3Forms handler
 * Submits any form posting to api.web3forms.com in the background (AJAX) so the
 * visitor stays on the page, then swaps the form for an inline thank-you message.
 * Progressive enhancement: if JS fails, the form still does a normal POST.
 */
(function () {
  "use strict";

  var ENDPOINT = "https://api.web3forms.com/submit";

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function successHtml(isNewsletter) {
    var title = isNewsletter ? "You're subscribed!" : "Thank you!";
    var body = isNewsletter
      ? "Thanks for signing up — we'll keep you posted."
      : "Your message has been sent. We'll get back to you soon.";
    return (
      '<div class="w3f-result" role="status" aria-live="polite" ' +
      'style="padding:2.5rem 1rem;text-align:center;">' +
      '<div style="font-size:2.75rem;line-height:1;margin-bottom:.5rem;color:#9900FF;">&#10003;</div>' +
      '<div style="font-size:1.4rem;font-weight:700;margin-bottom:.4rem;">' + escapeHtml(title) + "</div>" +
      '<div style="opacity:.8;">' + escapeHtml(body) + "</div>" +
      "</div>"
    );
  }

  function showError(form, btn, originalLabel, message) {
    if (btn) { btn.disabled = false; if (originalLabel != null) btn.innerHTML = originalLabel; }
    var existing = form.querySelector(".w3f-error");
    if (!existing) {
      existing = document.createElement("div");
      existing.className = "w3f-error";
      existing.setAttribute("role", "alert");
      existing.style.cssText = "margin-top:1rem;color:#c0392b;font-size:.95rem;";
      form.appendChild(existing);
    }
    existing.textContent = message || "Something went wrong. Please try again.";
  }

  function handle(form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      var originalLabel = btn ? btn.innerHTML : null;
      if (btn) { btn.disabled = true; btn.innerHTML = "Sending…"; }

      var isNewsletter = !form.querySelector('[name="message"]');

      fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (res) { return res.json().then(function (j) { return { ok: res.ok, json: j }; }); })
        .then(function (r) {
          if (r.json && r.json.success) {
            form.innerHTML = successHtml(isNewsletter);
          } else {
            showError(form, btn, originalLabel, (r.json && r.json.message) || "Submission failed.");
          }
        })
        .catch(function () {
          showError(form, btn, originalLabel, "Network error. Please check your connection and try again.");
        });
    });
  }

  function init() {
    var forms = document.querySelectorAll('form[action*="api.web3forms.com"]');
    for (var i = 0; i < forms.length; i++) handle(forms[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
