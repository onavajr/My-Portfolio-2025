 
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

    // Form submit handler
    function handleContactSubmit(event) {
        event.preventDefault();
        var form = event.currentTarget;
        var messageEl = qs('#formMessage');

        if (messageEl) {
            messageEl.textContent = 'Thank you for contacting me!';
            // Optional: add a transient aria-live or class for animations
        }

        try {
            form.reset();
        } catch (err) {
            // ignore reset errors
        }
    }

    // Dark mode toggle with persistence
    function toggleDarkMode(save) {
        var el = document.body;
        if (!el) return;
        el.classList.toggle('dark-mode');
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
        } catch (err) {
            // ignore storage errors
        }
    }

    // Init: attach handlers when DOM is ready
    function init() {
        applyStoredTheme();

        var contactForm = qs('#contactForm');
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