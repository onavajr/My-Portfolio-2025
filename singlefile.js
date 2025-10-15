 
// singlefile.js - safe initialization, form handler, and dark-mode toggle
(function () {
    'use strict';

    // Utility: safe query selector
    function qs(selector) {
        try {
            return document.querySelector(selector);
        } catch (err) {
            return null;
        }
    }

    // Form submit handler — sends to /api/contact (JSON) with graceful fallback
    function handleContactSubmit(event) {
        event.preventDefault();
        var form = event.currentTarget || qs('#contact-form');
        if (!form) return;

        // built-in HTML validation
        if (!form.checkValidity()) {
            try { form.reportValidity(); } catch (err) { /* ignore */ }
            return;
        }

        var statusEl = qs('#form-status');
        var submitBtn = form.querySelector('button[type="submit"]');
        var originalBtnText = submitBtn ? submitBtn.textContent : '';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        }
        if (statusEl) statusEl.textContent = '';

        // Build payload
        var fd = new FormData(form);
        var payload = {};
        fd.forEach(function (value, key) { payload[key] = value; });

        // Try posting to backend; if it fails, fall back to a simulated send
        fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(function (res) {
            if (!res.ok) throw new Error('Network response not ok');
            return res.json().catch(function () { return { ok: true }; });
        }).then(function (data) {
            if (statusEl) statusEl.textContent = 'Thanks — your message was sent.';
            try { form.reset(); } catch (err) { /* ignore */ }
        }).catch(function (err) {
            // Network or server error — show fallback message and simulate send
            if (statusEl) statusEl.textContent = 'Could not reach server; message simulated locally.';
            try { form.reset(); } catch (err2) { /* ignore */ }
        }).finally(function () {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }

    // Dark mode toggle with persistence
    function toggleDarkMode(save) {
        var el = document.body;
        if (!el) return;
        el.classList.toggle('dark-mode');
        // update aria-pressed on toggles
        try {
            var pressed = el.classList.contains('dark-mode');
            document.querySelectorAll('[data-toggle-dark]').forEach(function (btn) {
                btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
            });
        } catch (err) { /* ignore */ }
        if (save) {
            try {
                var isDark = el.classList.contains('dark-mode');
                localStorage.setItem('prefers-dark', isDark ? '1' : '0');
            } catch (err) {
                // localStorage may be unavailable in some contexts
            }
        }
    }

    // Apply stored theme preference on load
    function applyStoredTheme() {
        try {
            var pref = localStorage.getItem('prefers-dark');
            if (pref === '1') document.body.classList.add('dark-mode');
            else if (pref === '0') document.body.classList.remove('dark-mode');
            // reflect the state on toggle buttons
            var pressed = document.body.classList.contains('dark-mode');
            document.querySelectorAll('[data-toggle-dark]').forEach(function (btn) {
                btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
            });
        } catch (err) {
            // ignore storage errors
        }
    }

    // Init: attach handlers when DOM is ready
    function init() {
        applyStoredTheme();

        var contactForm = qs('#contact-form') || qs('#contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', handleContactSubmit, false);
        }

        // Wire up any element with data-toggle-dark attribute to toggle dark mode
        var toggles = document.querySelectorAll('[data-toggle-dark]');
        if (toggles && toggles.length) {
            toggles.forEach(function (btn) {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    toggleDarkMode(true);
                }, false);
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM already ready
        setTimeout(init, 0);
    }

    // Expose a minimal API for other scripts if needed
    window.__portfolio = window.__portfolio || {};
    window.__portfolio.toggleDarkMode = function () { toggleDarkMode(true); };

})();