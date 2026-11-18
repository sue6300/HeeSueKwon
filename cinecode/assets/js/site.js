(function () {
  var root = document.documentElement;
  var STORE = 'cc-lang';

  function syncPressed(lang) {
    var btns = document.querySelectorAll('[data-lang]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-pressed', btns[i].getAttribute('data-lang') === lang ? 'true' : 'false');
    }
  }

  function setLang(lang) {
    root.className = 'lang-' + lang;
    root.setAttribute('lang', lang);
    try { localStorage.setItem(STORE, lang); } catch (e) {}
    syncPressed(lang);
  }

  document.addEventListener('click', function (e) {
    var langBtn = e.target.closest ? e.target.closest('[data-lang]') : null;
    if (langBtn) {
      e.preventDefault();
      setLang(langBtn.getAttribute('data-lang'));
      return;
    }
    var toggle = e.target.closest ? e.target.closest('.menu-toggle') : null;
    if (toggle) {
      var nav = document.getElementById('site-nav');
      if (!nav) return;
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
  });

  // reflect stored / detected language on load
  var current = root.className.indexOf('lang-en') > -1 ? 'en' : 'ko';
  syncPressed(current);
  root.setAttribute('lang', current);

  // close the mobile menu after choosing a page
  var nav = document.getElementById('site-nav');
  if (nav) {
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && window.innerWidth <= 760) {
        nav.classList.remove('open');
        var t = document.querySelector('.menu-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
