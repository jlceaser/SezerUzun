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

  /* ---------- the band: three domains, scroll-driven -------------
     It creeps at rest and takes its speed and direction from the
     reader's own scrolling, so the motion reports something real
     instead of running on a timer.                               */
  var mqIn = document.getElementById('mq');
  var mqX = 0, mqHalf = 0;
  (function(){
    if (!mqIn) return;
    var words = ['Video oyunu', 'Yazılım', 'Çeviri'];
    var run = words.map(function(w){ return '<span class="mq-w">' + w + '</span>'; }).join('');
    mqIn.innerHTML = run + run + run + run;   /* enough copies to cover any width */
    function measure(){ mqHalf = mqIn.scrollWidth / 4; }
    measure();
    if (window.ResizeObserver) new ResizeObserver(measure).observe(mqIn);
    window.addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  })();

  /* ---------- reveals ---------- */
  var sections = [].slice.call(document.querySelectorAll('.rv'));
  var intro = document.getElementById('kimlik');
  function showAll(){ sections.forEach(function(s){ s.classList.add('on'); }); }

  /* The intro must not play behind the loader, so nothing is observed
     until the curtain has lifted — begin() is the single entry point. */
  function begin(){
    if (intro) intro.classList.add('on');
    var rest = sections.filter(function(s){ return s !== intro; });
    if (!('IntersectionObserver' in window)){ showAll(); return; }
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); }
      });
    }, { rootMargin:'0px 0px -12% 0px', threshold:.05 });
    rest.forEach(function(s){ io.observe(s); });
  }
  setTimeout(showAll, 8000);   /* nothing may stay invisible */

  /* ---------- loader, then the intro plays ---------- */
  (function(){
    var load = document.getElementById('load');
    var num  = document.getElementById('loadNum');
    if (!load){ begin(); return; }

    if (reduce){ load.classList.add('done'); begin(); return; }

    var start = null, DUR = 1800;
    function step(ts){
      if (start === null) start = ts;
      var p = clamp((ts - start) / DUR, 0, 1);
      var eased = 1 - Math.pow(1 - p, 3.2);
      if (num) num.textContent = Math.round(eased * 100);
      var bar = document.getElementById('loadBar');
      if (bar) bar.style.width = (eased * 100) + '%';
      if (p < 1) requestAnimationFrame(step);
      else {
        load.classList.add('done');
        setTimeout(begin, 380);     /* the curtain clears, then the type rises */
      }
    }
    requestAnimationFrame(step);
  })();

  /* ---------- cursor ---------- */
  var cur = document.getElementById('cur');
  var ring = document.getElementById('ring');
  var mx = -100, my = -100, cx = -100, cy = -100, px = -100, py = -100;
  if (cur && !reduce){
    window.addEventListener('mousemove', function(e){
      mx = e.clientX; my = e.clientY;
      cur.style.opacity = 1;
      if (ring) ring.style.opacity = 1;
    }, { passive:true });
    document.querySelectorAll('a,button').forEach(function(el){
      el.addEventListener('mouseenter', function(){
        /* the dot is difference-blended: at 64px over a sunset tile it inverts
           to a blue disc and swallows the mark, so the tiles keep the small dot */
        if (!el.classList.contains('net')) cur.classList.add('big');
        if (ring) ring.classList.add('big');
      });
      el.addEventListener('mouseleave', function(){
        cur.classList.remove('big'); if (ring) ring.classList.remove('big');
      });
    });
  }

  /* ---------- work row previews ---------- */
  [].slice.call(document.querySelectorAll('.wk')).forEach(function(row){
    row.addEventListener('mouseenter', function(){
      if (reduce || !prevImg) return;
      /* the brand mark rides on the sunset tile where there is one */
      var mark = row.querySelector('.wk-logo');
      var tile = 'url(' + tiles[(+row.dataset.c) % tiles.length] + ') center/cover';
      prevImg.style.background = mark ? 'url(' + mark.src + ') center/40% no-repeat, ' + tile : tile;
      prev.classList.remove('doc');
      prev.classList.add('on');
    });
    row.addEventListener('mouseleave', function(){
      if (prev) prev.classList.remove('on');
    });
  });




  /* ---------- certificate previews ---------- */
  var CERT = {"kariyer": "assets/img/cert/kariyer.webp","ann": "assets/img/cert/ann.webp","risk": "assets/img/cert/risk.webp","pyonetimi": "assets/img/cert/pyonetimi.webp","algo": "assets/img/cert/algo.webp","siber": "assets/img/cert/siber.webp","bilgiguv": "assets/img/cert/bilgiguv.webp","agtemel": "assets/img/cert/agtemel.webp","ptemel": "assets/img/cert/ptemel.webp","isletim": "assets/img/cert/isletim.webp","agteknoloji": "assets/img/cert/agteknoloji.webp","bilgitek": "assets/img/cert/bilgitek.webp","digiage": "assets/img/cert/digiage.webp"};
  [].slice.call(document.querySelectorAll('.ct')).forEach(function(row){
    row.addEventListener('mouseenter', function(){
      if (reduce || !prevImg) return;
      var img = CERT[row.dataset.cert];
      if (!img) return;
      prevImg.style.background = 'url(' + img + ') center/cover no-repeat';
      prev.style.setProperty('--ar', row.dataset.ar || '1.45');
      prev.classList.add('doc');
      prev.classList.add('on');
    });
    row.addEventListener('mouseleave', function(){
      if (prev) prev.classList.remove('on');
    });
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
  var smoothOn = false, smoothPos = 0;

  function measure(){
    if (!smoothOn || !scroller) return;
    document.body.style.height = Math.round(scroller.getBoundingClientRect().height) + 'px';
  }
  function enableSmooth(){
    /* a fixed wrapper fights the mobile address bar, and coarse pointers
       already get native momentum — desktop only. */
    if (!scroller || reduce) return;
    if (window.innerWidth <= 860) return;
    if (!window.matchMedia('(pointer:fine)').matches) return;
    smoothOn = true;
    root.classList.add('smooth');
    measure();
    if (window.ResizeObserver) new ResizeObserver(measure).observe(scroller);
    window.addEventListener('resize', measure);
  }
  function disableSmooth(){
    if (!smoothOn) return;
    smoothOn = false;
    root.classList.remove('smooth');
    document.body.style.height = '';
    scroller.style.transform = '';
  }
  enableSmooth();

  /* watchdog: wheeling down while the document refuses to move means
     the host is scrolling something else — hand control back. */
  var pushes = 0;
  window.addEventListener('wheel', function(e){
    if (!smoothOn || e.deltaY <= 0) return;
    if ((window.scrollY || 0) < 2){ if (++pushes >= 4) disableSmooth(); }
    else pushes = 0;
  }, { passive:true });

  /* anchors have to be resolved against the wrapper, not the document */
  function goTo(el){
    if (!el) return;
    var y = el.getBoundingClientRect().top + (smoothOn ? smoothPos : (window.scrollY || 0));
    window.scrollTo({ top: Math.max(0, y), behavior: smoothOn ? 'auto' : 'smooth' });
  }
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault(); goTo(t);
    });
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
      { el: document.getElementById('kimlik'),    n:'01', name:'Kimlik' },
      { el: document.querySelector('.stmt'),      n:'—',  name:'Manifesto' },
      { el: document.getElementById('sistemler'), n:'02', name:'Sistemler' },
      { el: document.getElementById('sertifikalar'), n:'03', name:'Sertifikalar' },
      { el: document.getElementById('yol'),       n:'04', name:'Yol' },
      { el: document.getElementById('iletisim'),  n:'04', name:'İletişim' }
    ].filter(function(x){ return x.el; });

    var total = document.documentElement.scrollHeight || 1;

    /* density = elements per 1000px of section. It is what makes the
       work index a tower and the manifesto a low slab. */
    parts.forEach(function(x){
      x.h = x.el.offsetHeight;
      x.top = x.el.getBoundingClientRect().top + (window.scrollY || 0);
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
  var smooth = 0, vel = 0, rx = -100, ry = -100;
  var pw = document.getElementById('photoWrap');

  function frame(){
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var y = window.scrollY || doc.scrollTop || 0;

    /* one lerped value is the single source of motion for the page */
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

    /* three followers at three rates: dot, ring, preview. The spread of
       the lag is what gives the pointer a sense of mass. */
    if (cur){
      cx = lerp(cx, mx, .22); cy = lerp(cy, my, .22);
      cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
    }
    if (ring){
      rx = lerp(rx, mx, .11); ry = lerp(ry, my, .11);
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    }

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

    if (mqIn && mqHalf > 0){
      mqX -= (.28 + vel * .55);             /* a slow drift plus the reader's speed */
      if (mqX <= -mqHalf) mqX += mqHalf;
      if (mqX > 0) mqX -= mqHalf;
      mqIn.style.transform = 'translate3d(' + mqX.toFixed(2) + 'px,0,0)';
    }

    if (motes) motes(0, vel);
    if (vig) vig.style.opacity = (.5 + clamp(smooth / vh, 0, 1) * .3).toFixed(3);

    if (prev){
      px = lerp(px, mx, .085); py = lerp(py, my, .085);
      prev.style.transform = 'translate3d(' + px + 'px,' + py + 'px,0) translate(-50%,-50%) rotate(' + clamp((mx - px) * .05, -9, 9) + 'deg)';
    }

    syncMap();

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
