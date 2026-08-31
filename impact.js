/* =========================================================
   GPUAtHome — impact.js (v4)
   Fichier additif : aucun script existant n'est modifié.

   v2 — Le count-up numérique est supprimé. Motif : l'animation
   réécrivait temporairement le textContent des chiffres de preuve
   (108 kVA affiché « 55kVA » en cours de comptage) et pouvait
   rester figée sur une valeur intermédiaire si iOS suspendait
   requestAnimationFrame (capture d'écran, changement d'app,
   économie d'énergie). Sur un site dont la doctrine est
   « chiffres vérifiables uniquement », le DOM ne doit jamais
   afficher une valeur fausse, même une fraction de seconde.

   Remplacement : un simple reveal (fondu + translation) via la
   Web Animations API. Le texte n'est JAMAIS modifié : quoi qu'il
   arrive (animation interrompue, onglet en arrière-plan, échec),
   la valeur affichée est toujours la valeur réelle du HTML.
   Aucune interférence possible avec lang.js.
   Désactivé si prefers-reduced-motion.

   v3 — Ajout des deux cotations du hero (137,31 m² et 530 m²)
   à la liste des cibles. Elles portent bien la classe .metric mais
   n'étaient couvertes par aucun sélecteur : les premiers chiffres
   vus par le visiteur étaient les seuls à n'avoir aucun traitement.

   v4 — Le cadre thermique possède son propre IntersectionObserver.
   Motif : le reveal générique force .is-visible sur tous les éléments
   après 1,8 s pour sécuriser Safari, ce qui lançait l'effet thermique
   plusieurs écrans avant que l'utilisateur n'atteigne le graphique.
   Le halo/sweep démarre maintenant à ~35 % d'intersection réelle.

   v5 — La campagne thermique compte désormais DEUX figures : la vue
   d'ensemble sur 58 journées et le détail horaire de l'épisode d'août.
   querySelector() ne renvoyait que la première : la seconde image ne
   recevait jamais .proof-active et restait sans halo. Le second bloc
   traite maintenant toutes les .thermal-figure.proof-frame, chacune
   activée et désobservée individuellement — disconnect() coupait
   l'observation des autres figures dès la première activation.
   Le premier bloc (reveal des métriques) est strictement inchangé.
   ========================================================= */
(function () {
  'use strict';

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  if (typeof Element.prototype.animate !== 'function') return; // pas de WAAPI : on ne fait rien

  var SELECTORS = [
    '.hero-cotation .cot strong.metric',
    '.stats strong.metric',
    '.qf-hero-card-stat strong.metric',
    '.thermal-headline-stat strong',
    '.thermal-headline-split-row strong',
    '.thermal-stat strong'
  ].join(', ');

  var targets = document.querySelectorAll(SELECTORS);
  if (!targets.length) return;

  function reveal(el) {
    /* Animation purement visuelle (opacity/transform). L'état final
       est l'état naturel de l'élément : si l'animation est annulée
       ou suspendue, rien de faux n'est affiché. */
    el.animate(
      [
        { opacity: 0.15, transform: 'translateY(8px) scale(0.985)' },
        { opacity: 1, transform: 'none' }
      ],
      { duration: 450, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    );
  }

  var seen = new WeakSet();
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting || seen.has(entry.target)) return;
      seen.add(entry.target);
      observer.unobserve(entry.target);
      reveal(entry.target);
    });
  }, { threshold: 0.4 });

  targets.forEach(function (el) {
    observer.observe(el);
  });
})();


/* ── Déclenchement dédié du cadre thermique ─────────────────────── */
(function () {
  'use strict';

  var frames = document.querySelectorAll('.thermal-figure.proof-frame');
  if (!frames.length) return;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function activate(frame) {
    if (frame.classList.contains('proof-active')) return;
    frame.classList.add('proof-active');
  }

  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(frames, activate);
    return;
  }

  var proofObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      /* Le seuil de 0,35 suppose que la figure tient dans le viewport.
         Sur iPhone, un graphique plus haut que l'ecran ne l'atteint
         jamais : on accepte alors une intersection plus faible. */
      if (entry.intersectionRatio < 0.35 &&
          entry.boundingClientRect.height <= window.innerHeight) return;
      activate(entry.target);
      proofObserver.unobserve(entry.target);
    });
  }, {
    threshold: [0.15, 0.35],
    rootMargin: '0px 0px -8% 0px'
  });

  Array.prototype.forEach.call(frames, function (frame) {
    proofObserver.observe(frame);
  });
})();
