/* Bridges to Housing, Inc. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Logo entrance (home page only, once per browser session)
     ------------------------------------------------------------------ */
  var intro = doc.getElementById('intro');
  if (intro) {
    var skip = root.classList.contains('intro-skip') || reduceMotion;
    if (skip) {
      intro.parentNode.removeChild(intro);
      root.classList.remove('intro-pending');
    } else {
      try { sessionStorage.setItem('bth-intro', '1'); } catch (e) { /* private mode */ }
      var finish = function () {
        if (intro.classList.contains('is-done')) { return; }
        intro.classList.add('is-done');
        root.classList.remove('intro-pending');
        window.setTimeout(function () {
          if (intro.parentNode) { intro.parentNode.removeChild(intro); }
        }, 700);
      };
      window.setTimeout(finish, 2100);
      intro.addEventListener('click', finish);
    }
  } else {
    root.classList.remove('intro-pending');
  }

  /* ------------------------------------------------------------------
     Header: compact on scroll
     ------------------------------------------------------------------ */
  var header = doc.querySelector('.site-header');
  if (header) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) { return; }
      ticking = true;
      window.requestAnimationFrame(function () {
        header.classList.toggle('is-scrolled', window.scrollY > 24);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------ */
  var toggle = doc.querySelector('.nav-toggle');
  var nav = doc.getElementById('site-nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('is-open', open);
      doc.body.classList.toggle('nav-open', open);
      toggle.querySelector('.label').textContent = open ? 'Close' : 'Menu';
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 1001px)').addEventListener('change', function (e) {
      if (e.matches) { setOpen(false); }
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveals
     ------------------------------------------------------------------ */
  var revealEls = doc.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ------------------------------------------------------------------
     Contact form
     Submits to Web3Forms when an access key is configured.
     Without a key it opens the visitor's email app with the message
     pre-filled, so the form always works.
     ------------------------------------------------------------------ */
  var form = doc.getElementById('contact-form');
  if (form) {
    var status = doc.getElementById('form-status');
    var accessKey = form.getAttribute('data-access-key') || '';
    var toEmail = form.getAttribute('data-to') || 'office@bridgestohousing.org';
    var submitBtn = form.querySelector('[type="submit"]');

    var show = function (kind, message) {
      status.className = 'form-status ' + kind;
      status.textContent = message;
      status.focus();
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (form.querySelector('[name="website"]').value) { return; } /* honeypot */

      var data = new FormData(form);
      var name = data.get('name') || '';
      var email = data.get('email') || '';
      var subject = data.get('subject') || 'Website inquiry';
      var message = data.get('message') || '';

      if (!accessKey) {
        var body = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message;
        window.location.href = 'mailto:' + toEmail +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(body);
        show('ok', 'Your email app should open with your message ready to send. If it does not, email us at ' + toEmail + '.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      var payload = {
        access_key: accessKey,
        subject: 'Bridges to Housing website: ' + subject,
        from_name: 'Bridges to Housing website',
        name: name,
        email: email,
        message: message,
        botcheck: ''
      };
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json(); }).then(function (json) {
        if (json.success) {
          form.reset();
          show('ok', 'Thank you. Your message has been received and we will get back to you soon.');
        } else {
          throw new Error(json.message || 'Unable to send');
        }
      }).catch(function () {
        show('err', 'Sorry, the message could not be sent. Please call 530-755-3414 or email ' + toEmail + '.');
      }).finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';
      });
    });
  }

  /* ------------------------------------------------------------------
     Current year in footer
     ------------------------------------------------------------------ */
  var year = doc.getElementById('year');
  if (year) { year.textContent = String(new Date().getFullYear()); }
})();
