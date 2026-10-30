/* Yığın: the keycap toolbox. A press (hover, click, tap or Enter/Space) travels the cap down, lights it and types
   what the tool is for. While nobody touches it and it is on screen, it plays itself one key at a time. */
(function(){
  "use strict";
  var kb = document.querySelector('.kb');
  if (!kb) return;
  var keys = [].slice.call(kb.querySelectorAll('.key'));
  var nameEl = kb.querySelector('.kb-name'), noteEl = kb.querySelector('.kb-note');
  var idxEl = kb.querySelector('.kb-i'), live = kb.querySelector('.kb-live');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var typing = null, hitTimers = [], upTimers = [], demo = null, next = 0, touched = false, visible = false;

  function type(name, note){
    clearInterval(typing);
    if (reduce){ nameEl.textContent = name; noteEl.textContent = note; return; }
    var all = name + '\u0000' + note, n = 0;   // NUL marks the seam between the two spans
    nameEl.textContent = ''; noteEl.textContent = '';
    typing = setInterval(function(){
      n = Math.min(all.length, n + 2);
      var cut = all.slice(0, n).split('\u0000');
      nameEl.textContent = cut[0];
      noteEl.textContent = cut.length > 1 ? cut[1] : '';
      if (n >= all.length) clearInterval(typing);
    }, 22);
  }

  function press(i, hold){
    var k = keys[i];
    if (!k) return;
    clearTimeout(hitTimers[i]); clearTimeout(upTimers[i]);
    k.classList.add('down', 'hit');
    if (!hold) upTimers[i] = setTimeout(function(){ k.classList.remove('down'); }, reduce ? 0 : 150);
    hitTimers[i] = setTimeout(function(){ k.classList.remove('hit'); }, 260);
    type(k.dataset.name, k.dataset.note);
    if (live && touched) live.textContent = k.dataset.name + ': ' + k.dataset.note;   // whole line, once, for screen readers
    idxEl.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
    next = (i + 1) % keys.length;
  }
  function release(i){ if (keys[i]) keys[i].classList.remove('down'); }

  /* the demo stops for good once a person plays */
  function stopDemo(){ touched = true; clearInterval(demo); demo = null; }
  function syncDemo(){
    var want = visible && !touched && !reduce;
    if (want && !demo){ demo = setInterval(function(){ press(next); }, 2600); setTimeout(function(){ if (demo) press(next); }, 900); }
    if (!want && demo){ clearInterval(demo); demo = null; }
  }
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(es){ visible = es[0].isIntersecting; syncDemo(); }, { threshold:.5 }).observe(kb);
  }

  keys.forEach(function(k, i){
    k.addEventListener('pointerenter', function(e){ if (e.pointerType === 'mouse'){ stopDemo(); press(i); } });
    k.addEventListener('pointerdown', function(){ stopDemo(); press(i, true); });
    k.addEventListener('pointerup', function(){ release(i); });
    k.addEventListener('pointerleave', function(){ release(i); });
    k.addEventListener('click', function(e){ if (e.detail === 0){ stopDemo(); press(i); } });   // keyboard-made clicks
    k.addEventListener('keydown', function(e){
      var to = null;
      if (e.key === 'ArrowRight') to = (i + 1) % keys.length;
      else if (e.key === 'ArrowLeft') to = (i - 1 + keys.length) % keys.length;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = keys.length - 1;
      else if ((e.key === ' ' || e.key === 'Enter') && !e.repeat){ stopDemo(); press(i, true); }
      if (to !== null){
        e.preventDefault();
        k.tabIndex = -1; keys[to].tabIndex = 0; keys[to].focus();
      }
    });
    k.addEventListener('keyup', function(e){ if (e.key === ' ' || e.key === 'Enter') release(i); });
    k.addEventListener('focus', stopDemo);
  });
})();
