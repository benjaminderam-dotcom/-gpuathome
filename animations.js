/* =========================================================
   GPUAtHome — animations.js  (v3)
   Fichier additif : n'altère ni le texte, ni les liens,
   ni les images, ni la structure du contenu existant.
   Ajoute uniquement des classes CSS et des animations légères.

   Révision v3 — 2026-08-31 :
   - SUPPRESSION du lancement automatique du tracé .hero-g1 au
     chargement. Ce bloc entrait en concurrence avec le script
     inline d'index.html, qui retirait puis réajoutait .hero-anim
     au défilement. Ce double déclenchement passait sur Chrome
     mais restait fragile sur Safari/iOS (reflow forcé + reprise
     d'animation SVG déjà démarrée). Le tracé est désormais piloté
     par un unique IntersectionObserver, dans index.html.
   - Le reste du fichier est inchangé.

   PRINCIPE : l'animation n'ordonne jamais l'information. Tout
   est écrit dans le HTML à l'état final visible ; le JS ne fait
   qu'ajouter du mouvement. Sans JS, en erreur, ou en
   prefers-reduced-motion, la page est complète et correcte.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) return;

  document.addEventListener("DOMContentLoaded", function () {

    /* ---------------------------------------------------------
       1) Étapes de roadmap (.process) — inchangé
       --------------------------------------------------------- */
    var processBlocks = document.querySelectorAll(".process");

    if ("IntersectionObserver" in window && processBlocks.length) {
      processBlocks.forEach(function (proc) {
        proc.querySelectorAll(":scope > div").forEach(function (step) {
          step.classList.add("reveal-init", "reveal-step");
        });

        var processObserver = new IntersectionObserver(
          function (entries, observer) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return;
              entry.target.querySelectorAll(":scope > div").forEach(function (child, i) {
                setTimeout(function () { child.classList.add("is-visible"); }, i * 160);
              });
              observer.unobserve(entry.target);
            });
          },
          { threshold: 0.25, rootMargin: "0px 0px -40px 0px" }
        );

        processObserver.observe(proc);
      });
    }

    /* ---------------------------------------------------------
       2) Tracé du bâtiment G1 — RETIRÉ EN v3.
          Le déclenchement unique est assuré par le script inline
          d'index.html (IntersectionObserver + filet de sécurité).
          Ne pas réintroduire ici : deux déclencheurs concurrents
          font échouer le tracé sur Safari/iOS.
       --------------------------------------------------------- */

    /* ---------------------------------------------------------
       3) Apparition au scroll — « Le relevé »
          Classes dédiées : .reveal-init est neutralisée en
          !important par le bloc de sécurité inline d'index.html.
       --------------------------------------------------------- */
    if ("IntersectionObserver" in window) {
      var targets = document.querySelectorAll(
        ".section > h2, .section-intro, .econ-callout, .needs-table-wrap, .stats"
      );

      var revealObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.remove("releve-pending");
            entry.target.classList.add("releve-in");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
      );

      targets.forEach(function (el) {
        el.classList.add("releve-pending");
        revealObserver.observe(el);
        /* Filet de sécurité : si l'observateur ne se déclenche
           jamais (Safari/iOS), l'élément redevient visible. */
        setTimeout(function () {
          if (el.classList.contains("releve-pending")) {
            el.classList.remove("releve-pending");
            el.classList.add("releve-in");
          }
        }, 2500);
      });
    }
  });
})();
