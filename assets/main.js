// SM NexStudio site — shared behaviour for both designs
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-nav-menu]');
  if (toggle && menu) {
    var setOpen = function (open) {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!menu.classList.contains('is-open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('click', function (e) { if (!menu.contains(e.target) && !toggle.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 860) setOpen(false); });
  }

  // Nav border once the page scrolls
  var nav = document.querySelector('[data-nav]');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Policy table of contents: highlight the section being read, close the mobile list after a jump
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('[data-toc] a'));
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tocLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
        var a = byId[en.target.id];
        if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }
  // The contents list is a fixed sidebar on wide screens and a collapsible panel on narrow ones
  var wide = window.matchMedia('(min-width: 960px)');
  document.querySelectorAll('[data-toc-details]').forEach(function (d) {
    var sync = function () { d.open = wide.matches; };
    sync();
    if (wide.addEventListener) wide.addEventListener('change', sync);
    d.querySelector('summary').addEventListener('click', function (e) { if (wide.matches) e.preventDefault(); });
    d.addEventListener('click', function (e) { if (e.target.closest('a') && !wide.matches) d.open = false; });
  });

  // Panelglass balloon: flips between the raw line and its translation
  document.querySelectorAll('[data-balloon]').forEach(function (b) {
    var lines = JSON.parse(b.getAttribute('data-balloon'));
    var text = b.querySelector('[data-balloon-text]');
    var tag = b.querySelector('[data-balloon-tag]');
    var i = 0;
    var show = function () {
      var l = lines[i % lines.length];
      text.textContent = l[0];
      text.lang = l[1];
      if (tag) tag.textContent = l[2];
      b.classList.toggle('is-src', l[1] === 'ja');
      i++;
    };
    show();
    if (!reduce) setInterval(show, 2200);
    else b.addEventListener('click', show);
  });

  // Memora postcard: steps through the occasions it reminds you of
  document.querySelectorAll('[data-postcard]').forEach(function (c) {
    var cards = JSON.parse(c.getAttribute('data-postcard'));
    var fields = ['when', 'msg', 'stamp', 'tag'].map(function (k) { return c.querySelector('[data-postcard-' + k + ']'); });
    var i = 0;
    var show = function () {
      var card = cards[i % cards.length];
      fields.forEach(function (el, n) { if (el) el.textContent = card[n]; });
      i++;
    };
    show();
    if (!reduce) setInterval(show, 3200);
    else c.addEventListener('click', show);
  });

  // Screenshot strips: arrow buttons page through the phones; each arrow hides at its end
  document.querySelectorAll('[data-shots]').forEach(function (w) {
    var list = w.querySelector('[data-shots-list]');
    var prev = w.querySelector('[data-shots-prev]');
    var next = w.querySelector('[data-shots-next]');
    var step = function () { var li = list.querySelector('li'); return li ? (li.getBoundingClientRect().width + parseFloat(getComputedStyle(list).columnGap || 0)) : list.clientWidth; };
    var items = list.querySelectorAll('li');
    var sync = function () {
      if (!items.length) return;
      var box = list.getBoundingClientRect();
      prev.disabled = items[0].getBoundingClientRect().left >= box.left - 2;
      next.disabled = items[items.length - 1].getBoundingClientRect().right <= box.right + 2;
    };
    var go = function (dir) {
      list.scrollBy({ left: dir * Math.max(step(), Math.floor(list.clientWidth / step()) * step()), behavior: reduce ? 'auto' : 'smooth' });
      setTimeout(sync, reduce ? 50 : 500);
    };
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    list.addEventListener('scroll', sync, { passive: true });
    list.addEventListener('scrollend', sync);
    window.addEventListener('resize', sync);
    sync();
  });

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
