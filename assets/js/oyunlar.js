/* Oyunlar: without a hover, a game window blooms to its own colours while it holds the middle of the screen. */
(function(){
  "use strict";
  if (!('IntersectionObserver' in window)) return;
  if (!window.matchMedia('(hover: none)').matches) return;
  var cards = document.querySelectorAll('.gm');
  if (!cards.length) return;
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ e.target.classList.toggle('lit', e.isIntersecting); });
  }, { rootMargin:'-38% 0px -38% 0px' });
  [].forEach.call(cards, function(c){ io.observe(c); });
})();
