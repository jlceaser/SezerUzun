/* DİL — EN→TR alignment. Ribbons are drawn from the real boxes of the words, so they follow
   the type wherever it lands; the pairs cycle on their own and stop for a reader. */
(function(){
  "use strict";
  var stage = document.querySelector('[data-dil]');
  if (!stage) return;

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DUR = 7000;                      /* ms each pair stays */
  var FLAME = '#B04214', SUN = '#FC7B34', PEACH = '#FFAF70';
  var box = stage.querySelector('.dil-pairs');
  var pairs = [].slice.call(stage.querySelectorAll('.dil-pair'));
  var goes = [].slice.call(stage.querySelectorAll('.dil-go'));
  var pauseBtn = stage.querySelector('.dil-pause');
  var nowEl = stage.querySelector('.dil-now');
  var live = stage.querySelector('[data-dil-live]');
  stage.classList.add('dil-js');

  function keys(el){ var s = el && el.getAttribute('data-l'); return s ? s.split(' ') : []; }
  function anchors(el){ var s = el.getAttribute('data-a'); return s ? s.split(' ') : []; }
  function meets(a, b){ for (var i = 0; i < a.length; i++) if (b.indexOf(a[i]) >= 0) return true; return false; }
  function pad(n){ return (n < 10 ? '0' : '') + n; }

  /* ---------- fit: every pair shares one size, set so the widest line fits ---------- */
  function fit(){
    var w = box.clientWidth;
    if (w < 50) return;
    var maxTr = Math.min(72, Math.max(19, w * .052));
    var maxEn = Math.min(30, Math.max(14, w * .024));
    var tr = maxTr, en = maxEn;
    stage.style.setProperty('--dil-en', en + 'px');
    for (var pass = 0; pass < 4; pass++){
      stage.style.setProperty('--dil-tr', tr.toFixed(2) + 'px');
      var widest = 0;
      pairs.forEach(function(p){ widest = Math.max(widest, p.querySelector('.dil-tr').scrollWidth); });
      if (widest <= w * .96) break;
      tr *= (w * .955) / widest;     /* the glosses do not scale with it, so solve in a few steps */
    }
    var wideEn = 0;
    pairs.forEach(function(p){ wideEn = Math.max(wideEn, p.querySelector('.dil-en').scrollWidth); });
    if (wideEn > w * .96) en *= (w * .955) / wideEn;
    stage.style.setProperty('--dil-en', Math.min(en, tr * .62).toFixed(2) + 'px');
  }

  /* ---------- geometry: ticks under English words, over Turkish morphemes, ribbons between ---------- */
  function rectIn(el, origin){
    var parts = el.classList.contains('dil-tw') ? el.querySelectorAll('.dil-m') : [el];
    var l = Infinity, r = -Infinity, t = Infinity, b = -Infinity;
    for (var i = 0; i < parts.length; i++){
      var q = parts[i].getBoundingClientRect();
      l = Math.min(l, q.left); r = Math.max(r, q.right); t = Math.min(t, q.top); b = Math.max(b, q.bottom);
    }
    return { l:l - origin.left, r:r - origin.left, t:t - origin.top, b:b - origin.top };
  }

  function build(pair){
    var svg = pair.querySelector('.dil-rib');
    var o = pair.getBoundingClientRect();
    var en = [].slice.call(pair.querySelectorAll('.dil-en [data-a]'));
    var tr = [].slice.call(pair.querySelectorAll('.dil-tr [data-a]'));
    var enFs = parseFloat(getComputedStyle(pair.querySelector('.dil-en')).fontSize);
    var trFs = parseFloat(getComputedStyle(pair.querySelector('.dil-tr')).fontSize);
    var E = en.map(function(el){ return { el:el, r:rectIn(el, o), k:anchors(el), out:[] }; });
    var T = tr.map(function(el){ return { el:el, r:rectIn(el, o), k:anchors(el), in:[] }; });
    if (!E.length || !T.length) return;

    /* every tick on a line sits at the same height, whatever the glyphs do */
    var yE = Math.max.apply(null, E.map(function(e){ return e.r.b; })) + enFs * .12;
    var yT = Math.min.apply(null, T.map(function(t){ return t.r.t; })) + trFs * .02;

    var links = [];
    E.forEach(function(e, ei){
      e.k.forEach(function(k){
        T.forEach(function(t){
          if (t.k.indexOf(k) >= 0){ var L = { e:e, t:t, k:k, ei:ei }; links.push(L); e.out.push(L); t.in.push(L); }
        });
      });
    });

    /* several ribbons leaving one word fan out along its tick, ordered by where they land,
       so they never cross at the root */
    function spread(list, side, key){
      list.sort(function(a, b){ return key(a) - key(b); });
      list.forEach(function(L, i){ L[side] = (i + 1) / (list.length + 1); });
    }
    E.forEach(function(e){ spread(e.out, 'fe', function(L){ return (L.t.r.l + L.t.r.r) / 2; }); });
    T.forEach(function(t){ spread(t.in, 'ft', function(L){ return (L.e.r.l + L.e.r.r) / 2; }); });

    function inset(r, fs){ var m = Math.min(fs * .11, (r.r - r.l) * .2); return { l:r.l + m, r:r.r - m }; }
    var gap = yT - yE, svgParts = [];
    var gid = 'dilg' + pair.getAttribute('data-n');
    svgParts.push('<defs><linearGradient id="' + gid + '" gradientUnits="userSpaceOnUse" x1="0" y1="' + yE.toFixed(1) +
      '" x2="0" y2="' + yT.toFixed(1) + '"><stop offset="0" stop-color="' + FLAME + '"/><stop offset=".5" stop-color="' + SUN +
      '"/><stop offset="1" stop-color="' + PEACH + '"/></linearGradient></defs>');

    /* timing: ribbons leave in reading order; a morpheme inks in as its ribbon lands */
    var START = .5, STEP = .12, DRAW = 1.05;
    links.sort(function(a, b){ return a.ei - b.ei || a.fe - b.fe; });
    links.forEach(function(L, i){ L.d = START + i * STEP; });
    var lastLand = START + Math.max(0, links.length - 1) * STEP + DRAW * .7;

    E.forEach(function(e, i){
      var x = inset(e.r, enFs);
      var d = START - .2 + i * .04;
      e.el.style.setProperty('--d', (d - .25).toFixed(2) + 's');
      svgParts.push('<line class="dil-tk" data-l="' + keys(e.el).join(' ') + '" style="--d:' + d.toFixed(2) + 's" x1="' +
        x.l.toFixed(1) + '" x2="' + x.r.toFixed(1) + '" y1="' + yE.toFixed(1) + '" y2="' + yE.toFixed(1) + '"/>');
    });
    T.forEach(function(t){
      var x = inset(t.r, trFs);
      var d = Math.min.apply(null, t.in.map(function(L){ return L.d; }).concat([lastLand])) + DRAW * .62;
      t.land = d;
      svgParts.push('<line class="dil-tk" data-l="' + keys(t.el).join(' ') + '" style="--d:' + (d - .1).toFixed(2) + 's" x1="' +
        x.l.toFixed(1) + '" x2="' + x.r.toFixed(1) + '" y1="' + yT.toFixed(1) + '" y2="' + yT.toFixed(1) + '"/>');
    });
    links.forEach(function(L){
      var a = inset(L.e.r, enFs), b = inset(L.t.r, trFs);
      var x1 = a.l + (a.r - a.l) * L.fe, x2 = b.l + (b.r - b.l) * L.ft;
      var c = gap * .62;
      svgParts.push('<path class="dil-rb" pathLength="1" data-l="' + L.k + '" stroke="url(#' + gid + ')" style="--d:' +
        L.d.toFixed(2) + 's" d="M' + x1.toFixed(1) + ' ' + yE.toFixed(1) + 'C' + x1.toFixed(1) + ' ' + (yE + c).toFixed(1) +
        ' ' + x2.toFixed(1) + ' ' + (yT - c).toFixed(1) + ' ' + x2.toFixed(1) + ' ' + yT.toFixed(1) + '"/>');
    });

    /* morphemes: linked ones when their ribbon lands, the rest (no English source) last */
    var tail = lastLand + DRAW * .5;
    pair.querySelectorAll('.dil-m').forEach(function(m){
      var host = m.hasAttribute('data-a') ? m : (m.parentNode.hasAttribute('data-a') ? m.parentNode : null);
      var hit = host && T.filter(function(t){ return t.el === host; })[0];
      m.style.setProperty('--d', (hit ? hit.land : tail).toFixed(2) + 's');
    });
    pair.querySelectorAll('.dil-tr .dil-p').forEach(function(p){ p.style.setProperty('--d', tail.toFixed(2) + 's'); });
    pair.querySelectorAll('.dil-en .dil-p, .dil-w0').forEach(function(p){ p.style.setProperty('--d', (START + .1).toFixed(2) + 's'); });
    pair.querySelectorAll('.dil-sg').forEach(function(g){ g.style.setProperty('--d', (tail + .25).toFixed(2) + 's'); });
    pair.querySelectorAll('.dil-gl').forEach(function(g){ g.style.setProperty('--d', (tail + .45).toFixed(2) + 's'); });
    pair.querySelector('.dil-note').style.setProperty('--d', (tail + .8).toFixed(2) + 's');

    svg.setAttribute('width', Math.ceil(o.width));
    svg.setAttribute('height', Math.ceil(o.height));
    svg.setAttribute('viewBox', '0 0 ' + Math.ceil(o.width) + ' ' + Math.ceil(o.height));
    svg.innerHTML = svgParts.join('');
  }

  function layout(){
    fit();
    pairs.forEach(function(p){
      var on = p.classList.contains('is-on');
      if (on) p.classList.add('now');
      build(p);
      if (on){ void p.offsetWidth; p.classList.remove('now'); }
    });
    if (hlKeys) light(hlKeys);
  }

  /* ---------- showing a pair ---------- */
  var cur = -1, elapsed = 0, swapT = null;
  function plain(p){ return p.textContent.replace(/\s+/g, ' ').trim(); }
  function show(n, announce){
    n = (n + pairs.length) % pairs.length;
    var prev = pairs[cur];
    clearHl();
    clearTimeout(swapT);
    if (prev && prev !== pairs[n]) prev.classList.remove('is-on');
    cur = n; elapsed = 0;
    pairs.forEach(function(p, i){
      p.querySelectorAll('.dil-en [data-l], .dil-tr .dil-m').forEach(function(el){ el.tabIndex = i === n ? 0 : -1; });
      p.setAttribute('aria-hidden', i === n ? 'false' : 'true');
    });
    goes.forEach(function(b, i){ b.setAttribute('aria-pressed', i === n ? 'true' : 'false'); });
    if (nowEl) nowEl.textContent = pad(n + 1);
    var next = pairs[n];
    swapT = setTimeout(function(){ next.classList.add('is-on'); }, prev && prev !== next ? 380 : 0);
    if (announce && live){
      live.textContent = plain(next.querySelector('.dil-en')) + ' — Türkçesi: ' +
        [].map.call(next.querySelectorAll('.dil-tw'), plain).join(' ');
    }
    progress();
  }

  function progress(){
    goes.forEach(function(b, i){
      var p = reduce ? (i === cur ? 1 : 0) : (i < cur ? 1 : i === cur ? Math.min(1, elapsed / DUR) : 0);
      b.style.setProperty('--p', p.toFixed(4));
    });
  }

  /* ---------- highlight ---------- */
  var hlKeys = null, pinned = false;
  function light(k){
    hlKeys = k;
    var p = pairs[cur];
    if (!p) return;
    stage.classList.add('is-hl');
    p.querySelectorAll('[data-l]').forEach(function(el){ el.classList.toggle('lit', meets(keys(el), k)); });
  }
  function clearHl(){
    hlKeys = null; pinned = false;
    stage.classList.remove('is-hl');
    stage.querySelectorAll('.lit').forEach(function(el){ el.classList.remove('lit'); });
  }
  function target(e){
    var el = e.target.closest && e.target.closest('[data-l]');
    if (!el || !pairs[cur] || !pairs[cur].contains(el)) return null;
    return el.classList.contains('dil-tw') ? null : el;
  }

  var hover = false, focus = false, manual = false, inView = false;
  box.addEventListener('pointerover', function(e){
    if (e.pointerType === 'touch' || pinned) return;
    var el = target(e);
    if (el) light(keys(el)); else if (hlKeys) clearHl();
  });
  stage.addEventListener('pointerenter', function(e){ if (e.pointerType !== 'touch') hover = true; });
  stage.addEventListener('pointerleave', function(e){
    if (e.pointerType === 'touch') return;
    hover = false; if (!pinned) clearHl();
  });
  /* touch has no hover: a tap pins the highlight, a tap elsewhere lets it go */
  box.addEventListener('click', function(e){
    var el = target(e);
    if (!el){ if (pinned) clearHl(); return; }
    var k = keys(el);
    if (pinned && hlKeys && hlKeys.join() === k.join()){ clearHl(); return; }
    light(k); pinned = true;
  });
  stage.addEventListener('focusin', function(e){
    focus = true;
    var el = target(e);
    if (el) light(keys(el));
  });
  stage.addEventListener('focusout', function(e){
    if (!stage.contains(e.relatedTarget)){ focus = false; }
    if (!pinned) clearHl();
  });

  goes.forEach(function(b){
    b.addEventListener('click', function(){ show(+b.getAttribute('data-go'), true); });
  });
  if (pauseBtn){
    if (reduce) pauseBtn.hidden = true;
    pauseBtn.addEventListener('click', function(){
      manual = !manual;
      pauseBtn.setAttribute('aria-pressed', manual ? 'true' : 'false');
      pauseBtn.setAttribute('aria-label', manual ? 'Döngüyü sürdür' : 'Döngüyü durdur');
    });
  }
  stage.addEventListener('keydown', function(e){
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft'){
      if (!e.target.closest('.dil-nav')) return;
      e.preventDefault();
      show(cur + (e.key === 'ArrowRight' ? 1 : -1), true);
      goes[cur].focus();
    } else if (e.key === 'Escape' && hlKeys){ clearHl(); }
  });

  /* ---------- clock: runs only while the stage is on screen and nobody is reading ---------- */
  function running(){ return !reduce && inView && !hover && !focus && !pinned && !manual && !document.hidden; }
  var last = 0;
  function tick(t){
    var dt = last ? Math.min(t - last, 100) : 0;
    last = t;
    if (running() && pairs[cur] && pairs[cur].classList.contains('is-on')){
      elapsed += dt;
      if (elapsed >= DUR) show(cur + 1, false);
      progress();
    }
    requestAnimationFrame(tick);
  }

  var started = false;
  function start(){
    if (started) return;
    started = true;
    layout();
    setTimeout(function(){ show(0, false); }, reduce ? 0 : 450);
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(es){
      es.forEach(function(e){ inView = e.isIntersecting; if (inView) start(); });
    }, { threshold:.3 }).observe(stage);
  } else { inView = true; start(); }

  /* fonts change every width, so the ribbons wait for them; a resize redraws in place */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ if (started) layout(); });
  var rz = null, lastW = box.clientWidth;
  function onResize(){
    if (Math.abs(box.clientWidth - lastW) < 1) return;
    lastW = box.clientWidth;
    cancelAnimationFrame(rz);
    rz = requestAnimationFrame(function(){ if (started) layout(); });
  }
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(box);
  else window.addEventListener('resize', onResize);
})();
