// Freeweights site behaviour. Every page works without this file (the catalog falls back to the
// list, model tabs fall back to stacked sections). It adds: theme, copy buttons, model tabs,
// the catalog search/facets/sort, List/Grid/Deck views (the deck is a slide track), the card
// flip, the /design/cards/ reference toggle, and the phone filter sheet.
(function () {
  var root = document.documentElement;
  var FW = window.FWCards;
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function typing() { var a = document.activeElement; return a && (a.tagName === 'INPUT' || a.tagName === 'SELECT' || a.tagName === 'TEXTAREA'); }

  // Theme
  var tbtn = $('[data-theme-toggle]');
  function themeLabel() { if (tbtn) tbtn.setAttribute('aria-label', 'Theme: ' + (root.getAttribute('data-theme') || 'system') + '. Change theme'); }
  if (tbtn) {
    themeLabel();
    tbtn.addEventListener('click', function () {
      var dark = root.getAttribute('data-theme') === 'dark' || (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
      var next = dark ? 'light' : 'dark'; root.setAttribute('data-theme', next); store('fw-theme', next); themeLabel();
    });
  }

  // Copy buttons (delegated, so cards rendered later work too)
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-copy]'); if (!b) return;
    var src = document.getElementById(b.getAttribute('data-copy'));
    var text = src ? src.textContent.split('\n').map(function (l) { return l.replace(/^\$ /, ''); }).join('\n') : '';
    var done = function () { var o = b.innerHTML; b.textContent = 'Copied'; setTimeout(function () { b.innerHTML = o; }, 1400); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
  });

  // "/" focuses search
  var search = $('[data-search]');
  document.addEventListener('keydown', function (e) { if (e.key === '/' && search && !typing()) { e.preventDefault(); search.focus(); } });

  // Keep the current chip in view on phones
  var cur = $('.chips [aria-current]');
  if (cur && cur.parentNode.scrollWidth > cur.parentNode.clientWidth) cur.parentNode.scrollLeft = cur.offsetLeft - cur.parentNode.offsetLeft - 16;

  // Model page tabs: anchors with role=tab; the hash picks the tab (#files, #use, ...)
  var tabList = $('[data-tabs]');
  if (tabList) {
    var tabs = $$('[role=tab]', tabList);
    var ids = tabs.map(function (t) { return t.getAttribute('aria-controls'); });
    var selectTab = function (id, focus) {
      if (ids.indexOf(id) < 0) id = ids[0];
      tabs.forEach(function (t) { var on = t.getAttribute('aria-controls') === id; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
      ids.forEach(function (x) { var p = document.getElementById(x); if (p) p.hidden = x !== id; });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function (e) { e.preventDefault(); var id = t.getAttribute('aria-controls'); selectTab(id); history.replaceState(null, '', '#' + id); });
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; e.preventDefault();
        var n = (i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length; selectTab(ids[n], true); history.replaceState(null, '', '#' + ids[n]);
      });
    });
    $$('[data-tab-link]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); var id = a.getAttribute('data-tab-link'); selectTab(id); history.replaceState(null, '', '#' + id); tabList.scrollIntoView({ block: 'start' }); }); });
    selectTab(location.hash.slice(1));
    window.addEventListener('hashchange', function () { selectTab(location.hash.slice(1)); });
  }

  // Row data for cards on this page
  var data = {}, list = [];
  try { list = JSON.parse(document.getElementById('fw-rows').textContent); list.forEach(function (r) { data[r.id] = r; }); } catch (e) {}

  // Flip tiles: IDENTITY front, FACTS back. The tile is a button, so Enter, Space and tap flip it.
  document.addEventListener('click', function (e) {
    var f = e.target.closest && e.target.closest('.flip'); if (!f) return;
    var on = f.getAttribute('aria-pressed') !== 'true'; f.setAttribute('aria-pressed', on);
    var n = f.getAttribute('aria-label') || ''; f.setAttribute('aria-label', n.replace(/: show (facts|identity)$/, '') + (on ? ': show identity' : ': show facts'));
  });
  // /design/cards/: reference toggle for the four original styles
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-ref-btn]'); if (!b) return;
    var k = b.getAttribute('data-ref-btn');
    $$('[data-ref-btn]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
    $$('[data-ref]').forEach(function (s) { s.hidden = k !== 'all' && s.getAttribute('data-ref') !== k; });
  });

  // ---------- Catalog ----------
  var cat = $('[data-catalog]');
  if (!cat) return;
  var listEl = $('[data-list]', cat), gridEl = $('[data-grid]', cat), deckEl = $('[data-deck]', cat), stage = $('[data-deck-stage]', cat);
  // A section without model rows (the tools section) has no list/grid/deck: none of the
  // catalog interactions below apply there, so stop instead of wiring missing elements.
  if (!listEl || !gridEl || !deckEl || !stage) { cat = null; return; }
  var rowsEls = {}; $$('.msg', listEl).forEach(function (el) { rowsEls[el.getAttribute('data-id')] = el; });
  var facetForm = $('[data-facets]', cat), qEl = $('[data-q]', cat), sortEl = $('[data-sort]', cat);
  var countEl = $('[data-count]', cat), chipsEl = $('[data-chips]', cat), noMatch = $('[data-nomatch]', cat), fcount = $('[data-fcount]', cat);
  var pv = $('[data-preview]', cat), total = list.length;
  var VIEWS = ['list', 'grid', 'deck'];
  var state = { q: '', sort: 'new', f: {}, view: VIEWS.indexOf(store('fw-view')) >= 0 ? store('fw-view') : 'list', deck: 0, sel: list[0] && list[0].id, card: null };
  var params = new URLSearchParams(location.search);
  if (params.get('q')) state.q = params.get('q');
  if (params.get('sort')) state.sort = params.get('sort');
  if (VIEWS.indexOf(params.get('view')) >= 0) state.view = params.get('view');
  if (params.get('card')) state.card = params.get('card');
  var facetKeys = facetForm ? $$('[data-facet]', facetForm).map(function (f) { return f.getAttribute('data-facet'); }) : [];
  facetKeys.forEach(function (k) { if (params.get(k)) state.f[k] = params.get(k).split(','); });
  // a facet value hidden under "Show more" that is active opens its group
  if (qEl) qEl.value = state.q;
  if (sortEl) { sortEl.value = state.sort; if (sortEl.value !== state.sort) { state.sort = 'new'; sortEl.value = 'new'; } }
  if (facetForm) $$('input[type=checkbox]', facetForm).forEach(function (i) {
    if ((state.f[i.name] || []).indexOf(i.value) >= 0) { i.checked = true; var d = i.closest('details'); if (d) d.open = true; }
  });

  function labelOf(k, v) { var i = facetForm && facetForm.querySelector('input[name="' + k + '"][value="' + (window.CSS && CSS.escape ? CSS.escape(v) : v) + '"]'); var l = i && i.parentNode.querySelector('.ol'); return l ? l.textContent : v; }
  function facetName(k) { var f = facetForm && facetForm.querySelector('[data-facet="' + k + '"] legend'); return f ? f.textContent : k; }
  function kindCount(arr) {
    var c = { model: 0, dataset: 0, tool: 0 }; arr.forEach(function (r) { c[r.kind || 'model'] = (c[r.kind || 'model'] || 0) + 1; });
    var out = [['model', 'model', 'models'], ['dataset', 'dataset', 'datasets'], ['tool', 'tool', 'tools']].filter(function (k) { return c[k[0]]; }).map(function (k) { return c[k[0]] + ' ' + (c[k[0]] === 1 ? k[1] : k[2]); });
    return out.join(' · ') || '0 entries';
  }
  function textOf(r) { return (r.id + ' ' + r.n + ' ' + r.sec + ' ' + (r.kind || '') + ' ' + (r.sum || '') + ' ' + (r.tkind || '') + ' ' + (r.lang || '') + ' ' + (r.task || []).join(' ') + ' ' + (r.fmt || []).join(' ') + ' ' + r.lic + ' ' + r.org + ' ' + (r.lc || '')).toLowerCase(); }
  list.forEach(function (r) { r._t = textOf(r); });
  function matches(r, skip) {
    if (state.q) { var words = state.q.toLowerCase().split(/\s+/).filter(Boolean); for (var w = 0; w < words.length; w++) if (r._t.indexOf(words[w]) < 0) return false; }
    for (var k in state.f) { if (k === skip || !state.f[k].length) continue; var vals = (r.fv && r.fv[k]) || []; if (!state.f[k].some(function (v) { return vals.indexOf(v) >= 0; })) return false; }
    return true;
  }
  var SORTS = {
    'new': function (a, b) { return String(b.added || '').localeCompare(String(a.added || '')) || a.n.localeCompare(b.n); },
    size: function (a, b) { return b.size - a.size; }, small: function (a, b) { return a.size - b.size; },
    params: function (a, b) { return (b.params || 0) - (a.params || 0) || a.n.localeCompare(b.n); },
    name: function (a, b) { return a.n.localeCompare(b.n, 'en', { sensitivity: 'base' }); }
  };
  var vis = list.slice();
  function activeCount() { var n = 0; for (var k in state.f) n += state.f[k].length; return n; }
  function syncUrl() {
    var p = new URLSearchParams();
    if (state.q) p.set('q', state.q); if (state.sort !== 'new') p.set('sort', state.sort);
    for (var k in state.f) if (state.f[k].length) p.set(k, state.f[k].join(','));
    if (state.view !== 'list') p.set('view', state.view);
    if (state.view === 'deck' && state.card) p.set('card', state.card);
    var s = p.toString(); history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
  }
  function chip(label, onclick) { var b = document.createElement('button'); b.type = 'button'; b.className = 'fchip'; b.innerHTML = label + ' <span aria-hidden="true">×</span>'; b.setAttribute('aria-label', 'Remove filter ' + label.replace(/<[^>]+>/g, '')); b.addEventListener('click', onclick); return b; }
  function esc(s) { return FW ? FW.esc(s) : String(s); }

  function render() {
    vis = list.filter(function (r) { return matches(r); }).sort(SORTS[state.sort] || SORTS['new']);
    // facet counts: each facet counts against every other active filter
    if (facetForm) $$('[data-facet]', facetForm).forEach(function (fs) {
      var k = fs.getAttribute('data-facet');
      var base = list.filter(function (r) { return matches(r, k); });
      $$('input', fs).forEach(function (i) {
        var n = base.filter(function (r) { return ((r.fv && r.fv[k]) || []).indexOf(i.value) >= 0; }).length;
        var oc = i.parentNode.querySelector('[data-oc]'); if (oc) oc.textContent = n;
        i.parentNode.classList.toggle('zero', n === 0 && !i.checked);
      });
    });
    countEl.textContent = (vis.length === total ? '' : vis.length + ' of ' + total + ': ') + kindCount(vis);
    if (fcount) fcount.textContent = activeCount() ? ' ' + activeCount() : '';
    // chips
    chipsEl.innerHTML = '';
    if (state.q) chipsEl.appendChild(chip('Search: <b>' + esc(state.q) + '</b>', function () { state.q = ''; qEl.value = ''; update(); }));
    Object.keys(state.f).forEach(function (k) {
      state.f[k].forEach(function (v) {
        chipsEl.appendChild(chip(esc(facetName(k)) + ': <b>' + esc(labelOf(k, v)) + '</b>', function () {
          state.f[k] = state.f[k].filter(function (x) { return x !== v; });
          var i = facetForm.querySelector('input[name="' + k + '"][value="' + (CSS.escape ? CSS.escape(v) : v) + '"]'); if (i) i.checked = false; update();
        }));
      });
    });
    if (state.q || activeCount()) { var c = document.createElement('button'); c.type = 'button'; c.className = 'link fclear'; c.textContent = 'Clear all'; c.addEventListener('click', clearAll); chipsEl.appendChild(c); }
    noMatch.hidden = vis.length !== 0;
    // views
    cat.setAttribute('data-view', state.view);
    $$('[data-view-btn]', cat).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-view-btn') === state.view); });
    if (listEl) listEl.hidden = state.view !== 'list' || !vis.length; if (gridEl) gridEl.hidden = state.view !== 'grid' || !vis.length; if (deckEl) deckEl.hidden = state.view !== 'deck' || !vis.length;
    if (state.view === 'list' && listEl) {
      var shown = {}; vis.forEach(function (r) { var el = rowsEls[r.id]; if (el) { el.hidden = false; listEl.appendChild(el); shown[r.id] = 1; } });
      for (var id in rowsEls) if (!shown[id]) rowsEls[id].hidden = true;
      if (vis.length && !vis.some(function (r) { return r.id === state.sel; })) showPreview(vis[0].id);
    } else if (state.view === 'grid' && FW && gridEl) {
      gridEl.innerHTML = vis.map(function (r) { return FW.tile(r); }).join('');
    } else if (state.view === 'deck') buildDeck();
  }
  // ---------- Deck: a horizontal slide track ----------
  // Beat sheet. Drag/flick/trackpad/touch -> the track scrolls under the finger (native for touch
  // and trackpad, pointer-driven for a mouse) -> on release it glides to the nearest card centre,
  // projecting the flick velocity so a fast flick travels several cards -> 260-420 ms,
  // ease-out cubic-bezier(.16,1,.3,1) -> a new drag or key press interrupts the glide from its
  // current position. Neighbours peek at both edges at 0.94 scale and 0.55 opacity.
  // Reduced motion: no scale, instant jumps; snapping still applies.
  var track = $('[data-deck-track]', cat), slides = [], built = {}, glide = null;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  function slideAt() { // index of the slide nearest the track centre
    if (!slides.length) return 0;
    var c = track.scrollLeft + track.clientWidth / 2, best = 0, bd = Infinity;
    for (var i = 0; i < slides.length; i++) { var s = slides[i], d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - c); if (d < bd) { bd = d; best = i; } }
    return best;
  }
  function targetX(i) { var s = slides[i]; return s ? s.offsetLeft + s.offsetWidth / 2 - track.clientWidth / 2 : 0; }
  function fill(i) { // render cards near the viewport only (current +-3), drop far ones
    for (var j = 0; j < slides.length; j++) {
      var near = Math.abs(j - i) <= 3;
      if (near && !built[j]) { slides[j].innerHTML = FW.combined(vis[j], { open: true }); built[j] = 1; }
      else if (!near && built[j] && Math.abs(j - i) > 6) { slides[j].innerHTML = ''; built[j] = 0; }
    }
  }
  function falloff() {
    if (reduce.matches) { slides.forEach(function (s) { s.style.transform = ''; s.style.opacity = ''; }); return; }
    var c = track.scrollLeft + track.clientWidth / 2;
    for (var j = 0; j < slides.length; j++) {
      if (!built[j]) continue; var s = slides[j];
      var d = Math.min(1, Math.abs(s.offsetLeft + s.offsetWidth / 2 - c) / s.offsetWidth);
      s.style.transform = 'scale(' + (1 - 0.06 * d).toFixed(4) + ')'; s.style.opacity = (1 - 0.45 * d).toFixed(3);
    }
  }
  var urlTimer = null;
  function onPos() {
    var i = slideAt(); fill(i); falloff();
    if (i !== state.deck || !state.card) {
      state.deck = i; state.card = vis[i] && vis[i].id;
      $('[data-deck-count]', cat).textContent = (i + 1) + ' of ' + vis.length;
      deckPrev.disabled = i === 0; deckNext.disabled = i === vis.length - 1;
      slides.forEach(function (s, j) { s.setAttribute('aria-hidden', j !== i); s.inert = j !== i; });
      clearTimeout(urlTimer); urlTimer = setTimeout(syncUrl, 250);
    }
  }
  var ticking = false;
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; onPos(); }); }
  function buildDeck() {
    if (!FW || !vis.length || !track) return;
    stopGlide(); built = {};
    track.innerHTML = vis.map(function (r, i) { return '<div class="slide" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + vis.length + '"></div>'; }).join('');
    slides = $$('.slide', track);
    var want = state.card ? vis.findIndex(function (r) { return r.id === state.card; }) : state.deck;
    state.deck = Math.max(0, Math.min(vis.length - 1, want < 0 ? 0 : want)); state.card = null;
    fill(state.deck);
    track.style.scrollSnapType = 'none'; track.scrollLeft = targetX(state.deck); track.style.scrollSnapType = '';
    onPos();
  }
  function stopGlide() { if (glide) { cancelAnimationFrame(glide); glide = null; track.style.scrollSnapType = ''; } }
  function glideTo(i) {
    stopGlide(); i = Math.max(0, Math.min(vis.length - 1, i)); fill(i);
    var x0 = track.scrollLeft, x1 = targetX(i), dist = x1 - x0;
    if (reduce.matches || Math.abs(dist) < 1) { track.style.scrollSnapType = 'none'; track.scrollLeft = x1; track.style.scrollSnapType = ''; onPos(); return; }
    var dur = Math.min(420, 260 + Math.abs(dist) / track.clientWidth * 80), t0 = null;
    // cubic-bezier(.16,1,.3,1) is close to an exponential ease-out; 1-(1-t)^4 matches it within a frame
    track.style.scrollSnapType = 'none';
    var step = function (t) {
      if (t0 === null) t0 = t; var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      track.scrollLeft = x0 + dist * e;
      if (k < 1) glide = requestAnimationFrame(step); else { glide = null; track.style.scrollSnapType = ''; onPos(); }
    };
    glide = requestAnimationFrame(step);
  }
  function deckMove(d) { if (state.view !== 'deck' || !vis.length) return; glideTo(slideAt() + d); }
  if (track) {
    track.addEventListener('scroll', onScroll, { passive: true });
    // Mouse drag with inertia (touch and trackpads scroll natively with momentum).
    var drag = null;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      stopGlide(); drag = { x: e.clientX, sl: track.scrollLeft, moved: false, v: 0, lx: e.clientX, lt: e.timeStamp, id: e.pointerId };
    });
    track.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 6) { drag.moved = true; track.setPointerCapture(e.pointerId); track.style.scrollSnapType = 'none'; track.classList.add('dragging'); }
      if (!drag.moved) return;
      var dt = Math.max(1, e.timeStamp - drag.lt); drag.v = 0.8 * ((e.clientX - drag.lx) / dt) + 0.2 * drag.v; drag.lx = e.clientX; drag.lt = e.timeStamp;
      track.scrollLeft = drag.sl - dx;
    });
    var endDrag = function (e) {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      var d = drag; drag = null; track.classList.remove('dragging');
      if (!d.moved) return;
      track._justDragged = true; setTimeout(function () { track._justDragged = false; }, 0);
      var v = (e && e.timeStamp - d.lt > 80) ? 0 : Math.max(-3, Math.min(3, d.v)); // a pause before release kills the flick
      var proj = track.scrollLeft - v * 260, w = slides[0] ? slides[0].offsetWidth : track.clientWidth;
      var cur = slideAt(), want = Math.round((proj + track.clientWidth / 2 - (slides[0].offsetLeft + w / 2)) / (w + parseFloat(getComputedStyle(track).columnGap || 0)));
      if (want === cur && Math.abs(v) > 0.35) want = cur + (v < 0 ? 1 : -1); // a short quick flick still moves one card
      glideTo(Math.max(cur - 4, Math.min(cur + 4, want))); // a flick travels at most four cards
    };
    track.addEventListener('pointerup', endDrag); track.addEventListener('pointercancel', endDrag);
    // a drag is not a click on the card's links
    track.addEventListener('click', function (e) { if (track._justDragged) { e.preventDefault(); e.stopPropagation(); } }, true);
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });
    window.addEventListener('resize', function () { if (state.view === 'deck' && slides.length) { track.style.scrollSnapType = 'none'; track.scrollLeft = targetX(state.deck); track.style.scrollSnapType = ''; falloff(); } });
  }
  function update() { state.deck = 0; state.card = null; render(); syncUrl(); }
  function clearAll() { state.q = ''; if (qEl) qEl.value = ''; state.f = {}; if (facetForm) $$('input', facetForm).forEach(function (i) { i.checked = false; }); update(); }

  if (qEl) qEl.addEventListener('input', function () { state.q = qEl.value.trim(); update(); });
  if (sortEl) sortEl.addEventListener('change', function () { state.sort = sortEl.value; update(); });
  if (facetForm) {
    facetForm.addEventListener('change', function (e) {
      var i = e.target; if (!i.name) return;
      var a = state.f[i.name] || []; a = a.filter(function (v) { return v !== i.value; }); if (i.checked) a.push(i.value); state.f[i.name] = a; update();
    });
    facetForm.addEventListener('submit', function (e) { e.preventDefault(); });
  }
  $$('[data-clear]', cat).forEach(function (b) { b.addEventListener('click', clearAll); });
  $$('[data-view-btn]', cat).forEach(function (b) { b.addEventListener('click', function () { state.view = b.getAttribute('data-view-btn'); store('fw-view', state.view); render(); syncUrl(); }); });
  // Pages without a deck (the tools section) have no deck controls; guard every deck hook.
  var deckPrev = $('[data-deck-prev]', cat), deckNext = $('[data-deck-next]', cat);
  if (deckPrev) deckPrev.addEventListener('click', function () { deckMove(-1); });
  if (deckNext) deckNext.addEventListener('click', function () { deckMove(1); });
  document.addEventListener('keydown', function (e) {
    if (typing() || e.metaKey || e.ctrlKey || e.altKey) return;
    if (state.view === 'deck' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); deckMove(e.key === 'ArrowRight' ? 1 : -1); }
    if (state.view === 'list' && (e.key === 'n' || e.key === 'p') && previewVisible() && vis.length) {
      var i = vis.findIndex(function (r) { return r.id === state.sel; });
      var n = e.key === 'n' ? Math.min(vis.length - 1, i + 1) : Math.max(0, i - 1);
      showPreview(vis[n].id); rowsEls[vis[n].id].focus();
    }
    if (e.key === 'Escape' && cat.hasAttribute('data-rail-open')) toggleRail(false);
  });
  // preview pane (desktop list view)
  function previewVisible() { return pv && pv.offsetParent !== null; }
  function showPreview(id) {
    var r = data[id]; if (!r || !pv || !FW) return; state.sel = id;
    for (var k in rowsEls) rowsEls[k].toggleAttribute('data-sel', k === id);
    pv.innerHTML = FW.combined(r, { cls: 'fwk-pv', open: true });
  }
  $$('.msg', listEl).forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (!previewVisible() || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      if (el.hasAttribute('data-sel')) return; // second click opens the page
      e.preventDefault(); showPreview(el.getAttribute('data-id'));
    });
  });

  // phone filter sheet
  function toggleRail(open) {
    if (open === undefined) open = !cat.hasAttribute('data-rail-open');
    cat.toggleAttribute('data-rail-open', open); document.body.classList.toggle('sheet-open', open);
    $$('[data-rail-toggle]', cat).forEach(function (b) { b.setAttribute('aria-expanded', open); });
  }
  $$('[data-rail-toggle]', cat).forEach(function (b) { b.addEventListener('click', function () { toggleRail(); }); });

  render();
})();
