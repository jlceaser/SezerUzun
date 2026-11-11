(function(){
  "use strict";
  var root = document.documentElement;
  root.classList.add('js');

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lerp = function(a,b,n){ return a + (b-a)*n; };
  var clamp = function(v,a,b){ return Math.min(b, Math.max(a,v)); };

  /* ---------- procedural sunset tiles (no external images) -------- */
  var RAMP = [
    ['#FFB273','#FA7930','#B04214','#171C1E'],
    ['#FA7930','#E16523','#661E08','#171C1E'],
    ['#E16523','#B04214','#2E2F37','#171C1E'],
    ['#FFAC6B','#E16523','#765141','#2E2F37'],
    ['#B04214','#661E08','#2E2F37','#171C1E'],
    ['#FA7930','#765141','#2E2F37','#171C1E']
  ];
  function tile(i, w, h){
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var x = c.getContext('2d');
    var p = RAMP[i % RAMP.length];
    var g = x.createLinearGradient(0, h, w, 0);
    g.addColorStop(0, p[3]); g.addColorStop(.42, p[2]);
    g.addColorStop(.74, p[1]); g.addColorStop(1, p[0]);
    x.fillStyle = g; x.fillRect(0,0,w,h);
    /* a soft glow core, like the horizon in the photograph */
    var r = x.createRadialGradient(w*(.2+.12*(i%3)), h*.78, 0, w*.3, h*.78, w*.75);
    r.addColorStop(0, p[0]); r.addColorStop(.3, p[1]); r.addColorStop(1, 'rgba(0,0,0,0)');
    x.globalAlpha = .55; x.fillStyle = r; x.fillRect(0,0,w,h); x.globalAlpha = 1;
    /* horizon band */
    x.fillStyle = p[3]; x.fillRect(0, h*.84, w, h*.16);
    return c.toDataURL('image/png');
  }

  var tiles = [];
  for (var t = 0; t < 6; t++) tiles.push(tile(t, 320, 240));

  var prev = document.getElementById('prev');
  var prevImg = prev ? prev.firstElementChild : null;

  var NET = [
    { n:'GitHub',   u:'https://github.com/jlceaser',
      d:'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' },
    { n:'itch.io',  u:'https://jlceaser.itch.io/',
      d:'M3.13 1.338C2.08 1.96.02 4.328 0 4.95v1.03c0 1.303 1.22 2.45 2.325 2.45 1.33 0 2.436-1.102 2.436-2.41 0 1.308 1.07 2.41 2.4 2.41 1.328 0 2.362-1.102 2.362-2.41 0 1.308 1.137 2.41 2.466 2.41h.024c1.33 0 2.466-1.102 2.466-2.41 0 1.308 1.034 2.41 2.363 2.41 1.33 0 2.4-1.102 2.4-2.41 0 1.308 1.106 2.41 2.435 2.41C22.78 8.43 24 7.282 24 5.98V4.95c-.02-.62-2.082-2.99-3.13-3.612-3.253-.114-5.508-.134-8.87-.133-3.362 0-7.945.053-8.87.133zm6.376 6.477a2.74 2.74 0 0 1-.468.602c-.5.49-1.19.795-1.947.795a2.786 2.786 0 0 1-1.95-.795c-.182-.178-.32-.37-.446-.59-.127.222-.303.412-.486.59a2.788 2.788 0 0 1-1.95.795c-.092 0-.187-.025-.264-.052-.107 1.113-.152 2.176-.168 2.95v.005l-.006 1.167c.02 2.334-.23 7.564 1.03 8.85 1.952.454 5.545.662 9.15.663 3.605 0 7.198-.21 9.15-.664 1.26-1.284 1.01-6.514 1.03-8.848l-.006-1.167v-.004c-.016-.775-.06-1.838-.168-2.95-.077.026-.172.052-.263.052a2.788 2.788 0 0 1-1.95-.795c-.184-.178-.36-.368-.486-.59-.127.22-.265.412-.447.59a2.786 2.786 0 0 1-1.95.794c-.76 0-1.446-.303-1.948-.793a2.74 2.74 0 0 1-.468-.602 2.738 2.738 0 0 1-.463.602 2.787 2.787 0 0 1-1.95.794h-.16a2.787 2.787 0 0 1-1.95-.793 2.738 2.738 0 0 1-.464-.602zm-2.004 2.59v.002c.795.002 1.5 0 2.373.953.687-.072 1.406-.108 2.125-.107.72 0 1.438.035 2.125.107.873-.953 1.578-.95 2.372-.953.376 0 1.876 0 2.92 2.934l1.123 4.028c.832 2.995-.266 3.068-1.636 3.07-2.03-.075-3.156-1.55-3.156-3.025-1.124.184-2.436.276-3.748.277-1.312 0-2.624-.093-3.748-.277 0 1.475-1.125 2.95-3.156 3.026-1.37-.004-2.468-.077-1.636-3.072l1.122-4.027c1.045-2.934 2.545-2.934 2.92-2.934zM12 12.714c-.002.002-2.14 1.964-2.523 2.662l1.4-.056v1.22c0 .056.56.033 1.123.007.562.026 1.124.05 1.124-.008v-1.22l1.4.055C14.138 14.677 12 12.713 12 12.713z' },
    { n:'LinkedIn', u:'https://www.linkedin.com/in/sezeruzun/',
      d:'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
    { n:'X',        u:'https://x.com/jlceaser',
      d:'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z' }
  ];
  var strip = document.getElementById('strip');
  if (strip){
    NET.forEach(function(net, i){
      var a = document.createElement('a');
      a.className = 'net';
      a.href = net.u;
      a.setAttribute('aria-label', net.n);
      if (net.u.charAt(0) !== '#'){ a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      a.style.setProperty('--n', i);
      a.innerHTML = '<span class="sq"><svg viewBox="0 0 24 24" aria-hidden="true">'
                  + '<path d="' + net.d + '"/></svg></span>'
                  + '<span class="nn" lang="en">' + net.n + '</span>';
      strip.appendChild(a);
    });
  }


  /* ---------- grain ---------- */
  (function(){
    if (reduce) return;
    var g = document.getElementById('grain');
    if (!g) return;
    var n = document.createElement('canvas');
    n.width = n.height = 140;
    var x = n.getContext('2d');
    var d = x.createImageData(140,140);
    for (var i = 0; i < d.data.length; i += 4){
      var v = 200 + Math.random()*55;
      d.data[i] = d.data[i+1] = d.data[i+2] = v;
      d.data[i+3] = Math.random()*90;
    }
    x.putImageData(d,0,0);
    g.style.backgroundImage = 'url(' + n.toDataURL() + ')';
  })();

  /* ---------- reveals ---------------------------------------------
     Each piece is watched on its own and gets .in when it reaches the
     viewport; the pieces that arrive in the same frame are staggered
     in reading order. What is already above the viewport when it is
     first seen (a reload mid-page, a jump from the menu) gets .now and
     lands finished. Nothing is ever left half-way: a piece is hidden,
     arriving, or there.                                             */
  var pieces = [].slice.call(document.querySelectorAll(
    '.rv .m, .rv .sf, .rv .wp, .rv .ln, .rv .wk, .rv .gm'));
  var revealIO = null;
  function land(el, d, now){
    if (d) el.style.setProperty('--d', d + 'ms');
    el.classList.add('in');
    if (now) el.classList.add('now');
  }
  function showAll(){
    if (revealIO){ revealIO.disconnect(); revealIO = null; }
    pieces.forEach(function(el){ if (!el.classList.contains('in')) land(el, 0, true); });
  }

  /* The intro must not play behind the loader, so nothing is observed
     until the curtain has lifted — begin() is the single entry point. */
  var begun = false;
  function begin(){
    if (begun) return;
    begun = true;
    if (reduce || !('IntersectionObserver' in window)){ showAll(); return; }
    revealIO = new IntersectionObserver(function(es){
      var arriving = [];
      es.forEach(function(e){
        if (e.isIntersecting) arriving.push(e);
        else if (e.boundingClientRect.bottom <= 0){ land(e.target, 0, true); revealIO.unobserve(e.target); }
      });
      arriving.sort(function(a, b){
        var dy = a.boundingClientRect.top - b.boundingClientRect.top;
        return Math.abs(dy) > 4 ? dy : a.boundingClientRect.left - b.boundingClientRect.left;
      });
      arriving.forEach(function(e, k){
        land(e.target, Math.min(k * 70, 630), false);
        revealIO.unobserve(e.target);
      });
    }, { rootMargin:'0px 0px -6% 0px', threshold:0 });
    pieces.forEach(function(el){ revealIO.observe(el); });
  }
  /* nothing may stay invisible: if the reveal never starts, show it all */
  setTimeout(function(){ if (!begun){ begun = true; showAll(); } }, 6000);

  /* ---------- loader, then the intro plays ---------- */
  (function(){
    var load = document.getElementById('load');
    var num  = document.getElementById('loadNum');
    if (!load){ begin(); return; }

    if (reduce){ load.classList.add('done'); begin(); return; }

    /* the count is for the first arrival; a reload or a return visit in
       the same tab gets a short curtain instead of the whole ceremony */
    var seen = false;
    try { seen = sessionStorage.getItem('cw-seen') === '1'; sessionStorage.setItem('cw-seen', '1'); } catch (e) {}
    var start = null, DUR = seen ? 650 : 1600;
    function step(ts){
      if (start === null) start = ts;
      var p = clamp((ts - start) / DUR, 0, 1);
      var eased = 1 - Math.pow(1 - p, 3.2);
      if (num) num.textContent = Math.round(eased * 100);
      if (p < 1) requestAnimationFrame(step);
      else {
        load.classList.add('done');
        setTimeout(begin, 380);     /* the curtain clears, then the type rises */
      }
    }
    requestAnimationFrame(step);
  })();

  /* ---------- pointer ---------------------------------------------
     There is no drawn cursor: the system pointer is exact and already
     knows a link from a text field. The page only keeps track of where
     it is, for the preview tile, the magnets and the photograph's lean. */
  var mx = window.innerWidth / 2, my = window.innerHeight / 2, px = 0, py = 0;
  var fine = !!(window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches);
  window.addEventListener('pointermove', function(e){
    if (e.pointerType && e.pointerType !== 'mouse') return;
    mx = e.clientX; my = e.clientY;
  }, { passive:true });

  /* the preview tile rides beside the pointer and belongs to one row */
  var prevRow = null, prevW = 0, prevH = 0;
  function prevSpot(){
    var x = mx + 24, y = my + 24;
    if (x + prevW > window.innerWidth - 12) x = mx - prevW - 24;
    if (y + prevH > window.innerHeight - 12) y = my - prevH - 24;
    return { x: Math.max(12, x), y: Math.max(12, y) };
  }
  function showPrev(row){
    if (!prev || !fine || reduce) return;
    var fresh = !prev.classList.contains('on');
    prevRow = row;
    prev.classList.add('on');
    prevW = prev.offsetWidth; prevH = prev.offsetHeight;
    if (fresh){ var sp = prevSpot(); px = sp.x; py = sp.y; }   /* appear in place, not flown in */
  }
  function hidePrev(){
    prevRow = null;
    if (prev) prev.classList.remove('on');
  }
  document.documentElement.addEventListener('mouseleave', hidePrev);
  window.addEventListener('blur', hidePrev);

  /* ---------- the hour in Türkiye, beside the live dot ---------- */
  (function(){
    var el = document.getElementById('clock');
    if (!el || !window.Intl) return;
    var fmt = new Intl.DateTimeFormat('tr-TR', { hour:'2-digit', minute:'2-digit', timeZone:'Europe/Istanbul' });
    function tick(){ el.textContent = fmt.format(new Date()); }
    tick();
    setInterval(tick, 15000);
  })();

  /* ---------- copy an address without leaving the page ---------- */
  document.querySelectorAll('[data-copy]').forEach(function(b){
    var idle = b.textContent, t = null;
    b.addEventListener('click', function(){
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(b.dataset.copy).then(function(){
        b.textContent = 'Kopyalandı'; b.classList.add('done');
        clearTimeout(t);
        t = setTimeout(function(){ b.textContent = idle; b.classList.remove('done'); }, 1800);
      }, function(){});
    });
  });

  /* ---------- manifesto: the sentence lights word by word as it is read ---------- */
  var maniT = document.getElementById('maniT'), maniW = [];
  if (maniT){
    var words = maniT.textContent.trim().split(/\s+/);
    maniT.textContent = '';
    words.forEach(function(w, k){
      var sp = document.createElement('span');
      sp.className = 'w';
      sp.textContent = w;
      maniT.appendChild(sp);
      if (k < words.length - 1) maniT.appendChild(document.createTextNode(' '));
      maniW.push(sp);
    });
    if (reduce) maniW.forEach(function(w){ w.classList.add('lit'); });
  }

  /* ---------- the facts count up once, when they arrive ---------- */
  (function(){
    var nums = [].slice.call(document.querySelectorAll('[data-count]'));
    if (!nums.length || reduce || !('IntersectionObserver' in window)) return;
    nums.forEach(function(n){ n.textContent = n.dataset.from || '0'; });
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, from = +(el.dataset.from || 0), to = +el.dataset.count, t0 = null;
        (function step(ts){
          if (t0 === null) t0 = ts;
          var p = clamp((ts - t0) / 1600, 0, 1), k = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(from + (to - from) * k);
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold:.6 });
    nums.forEach(function(n){ io.observe(n); });
  })();

  /* ---------- nav: solid once past the photo, and it knows where you are ---------- */
  var nav = document.getElementById('nav');
  var spy = [].slice.call(document.querySelectorAll('.nav-links a')).map(function(a){
    return { a: a, el: document.querySelector(a.getAttribute('href')) };
  }).filter(function(x){ return x.el; });

  /* ---------- work row previews ---------- */
  [].slice.call(document.querySelectorAll('.wk')).forEach(function(row){
    row.addEventListener('mouseenter', function(){
      if (reduce || !prevImg) return;
      /* the brand mark rides on the sunset tile where there is one */
      var mark = row.querySelector('.wk-logo');
      var tile = 'url(' + tiles[(+row.dataset.c) % tiles.length] + ') center/cover';
      prevImg.style.background = mark ? 'url(' + mark.src + ') center/40% no-repeat, ' + tile : tile;
      prev.classList.remove('doc');
      showPrev(row);
    });
    row.addEventListener('mouseleave', hidePrev);
  });

  /* ---------- certificate previews ---------- */
  var CERT = {"itu-ai": "assets/img/cert/itu-ai.webp","disticaret": "assets/img/cert/disticaret.webp","kariyer": "assets/img/cert/kariyer.webp","ann": "assets/img/cert/ann.webp","risk": "assets/img/cert/risk.webp","pyonetimi": "assets/img/cert/pyonetimi.webp","algo": "assets/img/cert/algo.webp","siber": "assets/img/cert/siber.webp","bilgiguv": "assets/img/cert/bilgiguv.webp","agtemel": "assets/img/cert/agtemel.webp","ptemel": "assets/img/cert/ptemel.webp","isletim": "assets/img/cert/isletim.webp","agteknoloji": "assets/img/cert/agteknoloji.webp","bilgitek": "assets/img/cert/bilgitek.webp","digiage": "assets/img/cert/digiage.webp"};
  [].slice.call(document.querySelectorAll('.ct')).forEach(function(row){
    row.addEventListener('mouseenter', function(){
      if (reduce || !prevImg) return;
      var img = CERT[row.dataset.cert];
      if (!img) return;
      prevImg.style.background = 'url(' + img + ') center/cover no-repeat';
      prev.style.setProperty('--ar', row.dataset.ar || '1.45');
      prev.classList.add('doc');
      showPrev(row);
    });
    row.addEventListener('mouseleave', hidePrev);
  });

  /* ---------- character split for the display lines ---------- */
  (function(){
    if (reduce) return;
    document.querySelectorAll('.d .m > span').forEach(function(sp){
      var txt = sp.textContent;
      if (!txt || sp.querySelector('.ch')) return;
      var frag = document.createDocumentFragment(), n = 0;
      for (var k = 0; k < txt.length; k++){
        var c = document.createElement('i');
        c.className = 'ch';
        c.textContent = txt[k] === ' ' ? ' ' : txt[k];
        c.style.setProperty('--c', n++);
        frag.appendChild(c);
      }
      sp.textContent = '';
      sp.appendChild(frag);
      sp.parentNode.classList.add('split');
    });
  })();

  /* ---------- inertia scroll -------------------------------------
     The page body keeps the real scrollbar; a fixed wrapper is moved
     by a lerped value. Fixed chrome sits outside the wrapper so it
     is unaffected. A watchdog turns the whole thing off if the host
     turns out not to scroll this document.                        */
  var scroller = document.getElementById('scroller');
  var smoothOn = false, smoothPos = 0, gaveUp = false, sizer = null;
  var smooth = 0, vel = 0, primed = false;

  /* section labels: sticky in a real scroll, carried by hand under inertia */
  var heads = [].slice.call(document.querySelectorAll('.works-head')).map(function(h){
    return { h: h, g: h.parentNode, hh: 0 };
  });
  var pinPx = 88;

  function measure(){
    if (!smoothOn || !scroller) return;
    document.body.style.height = Math.round(scroller.getBoundingClientRect().height) + 'px';
    pinPx = parseFloat(getComputedStyle(root).fontSize) * 5.5;
    heads.forEach(function(o){ o.hh = o.h.offsetHeight; });
  }
  function canSmooth(){
    /* a fixed wrapper fights the mobile address bar, and coarse pointers
       already get native momentum — desktop only. */
    return !!scroller && !reduce && !gaveUp && window.innerWidth > 860 &&
           window.matchMedia('(pointer:fine)').matches;
  }
  function enableSmooth(){
    if (smoothOn) return;
    smoothOn = true;
    smooth = smoothPos = window.scrollY || 0;        /* start where the page is, not at the top */
    root.classList.add('smooth');
    scroller.style.transform = 'translate3d(0,' + (-smooth).toFixed(2) + 'px,0)';
    measure();
    /* the document had no height for a moment, which clamps the scroll to 0 */
    if (smooth > 0) window.scrollTo({ top: smooth, behavior: 'instant' });
    if (!sizer && window.ResizeObserver){ sizer = new ResizeObserver(measure); sizer.observe(scroller); }
  }
  function disableSmooth(){
    if (!smoothOn) return;
    smoothOn = false;
    root.classList.remove('smooth');
    document.body.style.height = '';
    scroller.style.transform = '';
    heads.forEach(function(o){ o.h.style.transform = ''; });
  }
  /* a resize can cross the desktop line in either direction */
  function syncSmooth(){
    if (canSmooth()) enableSmooth(); else disableSmooth();
    measure();
  }
  syncSmooth();
  window.addEventListener('resize', syncSmooth);

  /* watchdog: wheeling down while the document refuses to move means
     the host is scrolling something else — hand control back. */
  var pushes = 0;
  window.addEventListener('wheel', function(e){
    if (!smoothOn || e.deltaY <= 0) return;
    var room = document.documentElement.scrollHeight - window.innerHeight;
    if (room > 4 && (window.scrollY || 0) < 2){ if (++pushes >= 4){ gaveUp = true; disableSmooth(); } }
    else pushes = 0;
  }, { passive:true });

  /* anchors have to be resolved against the wrapper, not the document */
  var veil = document.getElementById('veil'), veilT = null;
  function docTop(el){
    return el.getBoundingClientRect().top + (smoothOn ? smoothPos : (window.scrollY || 0));
  }
  function place(y){                                 /* be there, without travelling */
    window.scrollTo({ top: y, behavior: 'instant' });
    smooth = smoothPos = y;
    if (smoothOn) scroller.style.transform = 'translate3d(0,' + (-y).toFixed(2) + 'px,0)';
  }
  function targetY(el){
    var room = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    var lead = el.id === 'top' || el.id === 'kimlik' ? 0 : (nav ? nav.offsetHeight : 0) + 14;
    return clamp(Math.round(docTop(el) - lead), 0, room);
  }
  function goTo(el){
    if (!el) return;
    var y = targetY(el), from = smoothOn ? smoothPos : (window.scrollY || 0);
    if (reduce){ place(y); return; }
    /* a near target is travelled to; a far one is crossed behind the veil,
       so the page is never dragged past the reader in a blur */
    if (!veil || Math.abs(y - from) < window.innerHeight * 1.6){
      window.scrollTo({ top: y, behavior: smoothOn ? 'auto' : 'smooth' });
      return;
    }
    clearTimeout(veilT);
    veil.classList.add('on');
    veilT = setTimeout(function(){
      place(targetY(el));
      veilT = setTimeout(function(){ veil.classList.remove('on'); }, 90);
    }, 210);
  }
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href');
      var t = id.length > 1 ? document.querySelector(id) : null;
      if (!t) return;
      e.preventDefault(); goTo(t);
      if (window.history && history.replaceState){
        try { history.replaceState(null, '', id === '#top' ? location.pathname + location.search : id); } catch (err) {}
      }
    });
  });
  /* a link that arrives with a hash: the browser cannot find the target
     inside a fixed wrapper, so it is placed by hand once layout is final */
  setTimeout(function(){ primed = true; }, 4000);    /* a load that never settles must not hold inertia back */
  window.addEventListener('load', function(){
    measure();
    /* the browser restores a reload's scroll position around now; two frames
       later the page is where it will be, and inertia may start from there */
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ primed = true; }); });
    if (!smoothOn || location.hash.length < 2) return;
    var t = null;
    try { t = document.querySelector(location.hash); } catch (err) {}
    if (t) place(targetY(t));
  });

  /* ---------- magnetic controls ---------- */
  var mags = [].slice.call(document.querySelectorAll('[data-mag]'));
  var magR = 90;

  /* ---------- scramble the work titles on hover ---------- */
  (function(){
    if (reduce) return;
    var POOL = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ0123456789#/&';
    document.querySelectorAll('.wk-t').forEach(function(el){
      var real = el.textContent, timer = null;
      el.addEventListener('mouseenter', function(){
        var frame = 0;
        clearInterval(timer);
        timer = setInterval(function(){
          var out = '';
          for (var k = 0; k < real.length; k++){
            if (real[k] === ' '){ out += ' '; continue; }
            out += (k < frame / 2.2) ? real[k] : POOL[(Math.random() * POOL.length) | 0];
          }
          el.textContent = out;
          if (frame / 2.2 >= real.length){ clearInterval(timer); el.textContent = real; }
          frame++;
        }, 28);
      });
      el.addEventListener('mouseleave', function(){
        clearInterval(timer); el.textContent = real;
      });
    });
  })();


  /* ---------- embers lifting off the horizon --------------------
     Warm motes seeded along the glow band, drifting up and sideways.
     They are what turns a still photograph into weather.          */
  var motes = (function(){
    var cv = document.getElementById('motes');
    if (!cv || reduce) return null;
    var ctx = cv.getContext('2d');
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var TINT = ['#FC7B34', '#E16523', '#FFAF70', '#B04214', '#FDB68F'];
    var list = [];

    function seed(n){
      list = [];
      for (var i = 0; i < n; i++) list.push(make(true));
    }
    function make(anywhere){
      return {
        x: Math.random() * W,
        y: anywhere ? Math.random() * H : H * (.72 + Math.random() * .28),
        r: .5 + Math.random() * 1.7,
        vy: -(.12 + Math.random() * .42),
        vx: (Math.random() - .5) * .22,
        a: .12 + Math.random() * .42,
        ph: Math.random() * 6.283,
        sp: .012 + Math.random() * .03,
        c: TINT[(Math.random() * TINT.length) | 0]
      };
    }
    function size(){
      var b = cv.getBoundingClientRect();
      if (b.width < 2 || b.height < 2) return;        /* not laid out yet */
      if (Math.abs(b.width - W) < 1 && Math.abs(b.height - H) < 1) return;
      W = b.width; H = b.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed(W < 700 ? 34 : 70);
    }
    size();
    requestAnimationFrame(size);                       /* after first layout */
    if (window.ResizeObserver) new ResizeObserver(size).observe(cv);
    window.addEventListener('resize', size);

    return function draw(t, vel){
      if (W < 2) { size(); return; }
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < list.length; i++){
        var m = list[i];
        m.ph += m.sp;
        m.x += m.vx + Math.sin(m.ph) * .16;
        m.y += m.vy - vel * .012;                /* scrolling stirs them */
        if (m.y < -12 || m.x < -12 || m.x > W + 12) list[i] = make(false);
        ctx.globalAlpha = m.a * (.55 + .45 * Math.sin(m.ph));
        ctx.fillStyle = m.c;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, 6.283);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
  })();

  var parEls = [].slice.call(document.querySelectorAll('[data-par]'));
  var vig = document.getElementById('vig');
  var strip0 = document.getElementById('strip');

  /* ---------- map: the page measured, then drawn as a skyline ----- */
  var mapEl = document.getElementById('map');
  var mapCity = document.getElementById('mapCity');
  var mapSun = document.getElementById('mapSun');
  var blocks = [];

  function buildMap(){
    if (!mapEl || !mapCity) return;
    var parts = [
      { el: document.getElementById('kimlik'),       n:'01', name:'Kimlik' },
      { el: document.getElementById('manifesto'),    n:'02', name:'Kısaca' },
      { el: document.getElementById('sistemler'),    n:'03', name:'Sistemler' },
      { el: document.getElementById('oyunlar'),      n:'04', name:'Oyunlar' },
      { el: document.getElementById('dil'),          n:'05', name:'Dil' },
      { el: document.getElementById('yigin'),        n:'06', name:'Yığın' },
      { el: document.getElementById('sertifikalar'), n:'07', name:'Sertifikalar' },
      { el: document.getElementById('iletisim'),     n:'08', name:'İletişim' }
    ].filter(function(x){ return x.el; });

    var total = document.documentElement.scrollHeight || 1;

    /* density = elements per 1000px of section. It is what makes the
       work index a tower and the manifesto a low slab. */
    parts.forEach(function(x){
      x.h = x.el.offsetHeight;
      x.top = docTop(x.el);
      x.count = x.el.querySelectorAll('*').length;
      x.density = x.count / Math.max(1, x.h / 1000);
    });
    var maxD = Math.max.apply(null, parts.map(function(x){ return x.density; }));

    mapCity.querySelectorAll('.map-b').forEach(function(b){ b.remove(); });
    var legend = document.getElementById('mapLegend');
    if (legend) legend.innerHTML = '';
    blocks = [];

    parts.forEach(function(x, i){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'map-b';
      b.style.flexGrow = String(Math.max(.04, x.h / total));
      b.style.height = (24 + 62 * (x.density / maxD)).toFixed(1) + '%';
      b.style.animationDelay = (i * 85) + 'ms';
      b.setAttribute('aria-label', x.name);

      /* windows: one per ~14 elements, some lit */
      /* the grid follows the building's own proportions; how many of
         the windows are LIT is what carries the section's density */
      var hPct = 24 + 62 * (x.density / maxD);
      var rows = clamp(Math.round(hPct / 8), 3, 10);
      var cols = clamp(Math.round((x.h / total) * 26), 3, 7);
      var lit = .10 + .34 * (x.density / maxD);
      for (var r0 = 0; r0 < rows; r0++){
        for (var c0 = 0; c0 < cols; c0++){
          var k = r0 * cols + c0;
          var on = (((k * 37 + i * 11) % 100) / 100) < lit;
          var win = document.createElement('i');
          win.className = 'map-w' + (on ? ' lit' : '');
          win.style.left = (((c0 + .5) / cols) * 88 + 6) + '%';
          win.style.bottom = (((r0 + .5) / rows) * 90 + 3) + '%';
          b.appendChild(win);
        }
      }

      b.addEventListener('click', function(){
        closeMap();
        goTo(x.el);
      });

      mapCity.insertBefore(b, mapSun);
      blocks.push({ b: b, top: x.top, h: x.h });

      if (legend){
        var sp = document.createElement('span');
        sp.style.flexGrow = String(Math.max(.04, x.h / total));
        sp.innerHTML = '<b>' + x.n + ' ' + x.name + '</b><em>' +
                       Math.round(100 * x.h / total) + '%</em>';
        legend.appendChild(sp);
      }
    });
  }

  function syncMap(){
    if (!mapEl || !mapEl.classList.contains('on')) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var r = max > 0 ? clamp((window.scrollY || 0) / max, 0, 1) : 0;
    if (mapSun) mapSun.style.left = (r * 100) + '%';
    var y = (window.scrollY || 0) + window.innerHeight * .4;
    blocks.forEach(function(o){
      o.b.classList.toggle('here', y >= o.top && y < o.top + o.h);
    });
  }

  function openMap(){
    if (!mapEl) return;
    buildMap();
    mapEl.classList.add('on');
    document.body.style.overflow = 'hidden';
    syncMap();
  }
  function closeMap(){
    if (!mapEl) return;
    mapEl.classList.remove('on');
    document.body.style.overflow = '';
  }

  var mo = document.getElementById('mapOpen'), mc = document.getElementById('mapClose');
  if (mo) mo.addEventListener('click', openMap);
  if (mc) mc.addEventListener('click', closeMap);
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeMap();
    else if ((e.key === 'm' || e.key === 'M') && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)){
      mapEl && mapEl.classList.contains('on') ? closeMap() : openMap();
    }
  });

  /* ---------- one rAF loop: scroll %, parallax, velocity, cursor ---- */
  var prog = document.getElementById('prog');
  var pw = document.getElementById('photoWrap');

  function frame(){
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var y = window.scrollY || doc.scrollTop || 0;

    /* one lerped value is the single source of motion for the page */
    if (!primed) smooth = y;                         /* until the load settles, be exactly where the page is */
    var before = smooth;
    smooth = lerp(smooth, y, .1);
    if (Math.abs(y - smooth) < .12) smooth = y;      /* settle, do not creep */
    vel = smooth - before;
    smoothPos = smooth;

    if (smoothOn && scroller){
      scroller.style.transform = 'translate3d(0,' + (-smooth).toFixed(2) + 'px,0)';
    }

    var r = max > 0 ? clamp(smooth / max, 0, 1) : 0;
    if (prog) prog.style.transform = 'scaleX(' + r + ')';
    root.style.setProperty('--vel', clamp(vel * .09, -5, 5) + 'deg');

    /* the photograph drifts against the scroll and leans toward the pointer */
    if (pw){
      var lean = clamp((mx - window.innerWidth / 2) / window.innerWidth, -.5, .5);
      var zoom = 1 + clamp(Math.abs(vel) * .0016, 0, .035);
      pw.style.transform = 'translate3d(' + (lean * -22).toFixed(2) + 'px,'
        + clamp(smooth * .28, 0, 260).toFixed(2) + 'px,0) scale(' + zoom.toFixed(4) + ')';
    }

    /* magnetic controls pull toward a nearby pointer */
    for (var q = 0; q < mags.length; q++){
      var el = mags[q], bb = el.getBoundingClientRect();
      var dx = mx - (bb.left + bb.width / 2), dy = my - (bb.top + bb.height / 2);
      var dist = Math.sqrt(dx * dx + dy * dy);
      var k = dist < magR ? (1 - dist / magR) * .38 : 0;
      el.style.transform = k ? 'translate(' + (dx * k).toFixed(1) + 'px,' + (dy * k).toFixed(1) + 'px)' : '';
    }

    /* blocks drift at their own rates against the scroll */
    var vh = window.innerHeight;
    for (var q2 = 0; q2 < parEls.length; q2++){
      var pe = parEls[q2], pr = pe.getBoundingClientRect();
      var away = (pr.top + pr.height / 2) - vh / 2;
      pe.style.transform = 'translate3d(0,' + (-away * parseFloat(pe.dataset.par)).toFixed(1) + 'px,0)';
    }

    if (maniW.length && !reduce){
      var mr = maniT.getBoundingClientRect();
      var lit = Math.round(clamp((vh * .8 - mr.top) / (mr.height + vh * .25), 0, 1) * maniW.length);
      for (var w = 0; w < maniW.length; w++) maniW[w].classList.toggle('lit', w < lit);
    }

    if (nav){
      nav.classList.toggle('solid', smooth > vh * .7);
      var here = null;
      for (var s = 0; s < spy.length; s++) if (spy[s].el.getBoundingClientRect().top < vh * .45) here = spy[s].a;
      for (var s2 = 0; s2 < spy.length; s2++) spy[s2].a.classList.toggle('here', spy[s2].a === here);
    }

    if (motes) motes(0, vel);
    if (vig) vig.style.opacity = (.5 + clamp(smooth / vh, 0, 1) * .3).toFixed(3);

    /* the preview keeps close beside the pointer; if the page has moved
       its row out from under the pointer, it lets go */
    if (prev && prevRow){
      var rr = prevRow.getBoundingClientRect();
      if (mx < rr.left || mx > rr.right || my < rr.top || my > rr.bottom) hidePrev();
      else {
        var sp = prevSpot();
        px = lerp(px, sp.x, .24); py = lerp(py, sp.y, .24);
        prev.style.transform = 'translate3d(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px,0) rotate('
          + clamp((sp.x - px) * .03, -3, 3).toFixed(2) + 'deg)';
      }
    }

    /* section labels ride down their section, resting under the nav */
    if (smoothOn){
      for (var hI = 0; hI < heads.length; hI++){
        var ho = heads[hI], gr = ho.g.getBoundingClientRect();
        var off = clamp(pinPx - gr.top, 0, Math.max(0, gr.height - ho.hh));
        ho.h.style.transform = off ? 'translate3d(0,' + off.toFixed(1) + 'px,0)' : '';
      }
    }

    syncMap();

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
