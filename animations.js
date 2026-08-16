/* =========================================================
   GPUAtHome — animations.js
   Fichier additif : n'altère ni le texte, ni les liens,
   ni les images, ni la structure du contenu existant.
   Ajoute uniquement des classes CSS et des animations légères.

   Révision « Le relevé » :
   - le tracé du bâtiment G1 remplace le Ken Burns (code mort :
     .hero-plan n'existe pas dans index.html) ;
   - la pastille pulsante sur l'emoji 🔵 est supprimée, l'emoji
     ayant été remplacé par un statut graphique ;
   - PRINCIPE : l'animation n'ordonne jamais l'information. Tout
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
       2) Tracé du bâtiment G1 dans le hero
          Le SVG est écrit visible dans le HTML. On n'ajoute la
          classe qui pose les stroke-dashoffset qu'au tout dernier
          moment : si ce script ne s'exécute pas, le tracé est
          simplement déjà achevé.
       --------------------------------------------------------- */
    var g1 = document.querySelector(".hero-g1");
    if (g1 && g1.querySelector("#g1-sol")) {
      window.requestAnimationFrame(function () {
        g1.classList.add("hero-anim");
      });
    }

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
