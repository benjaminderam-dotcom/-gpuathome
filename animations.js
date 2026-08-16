/* =========================================================
   GPUAtHome — animations.js
   Fichier additif : n'altère ni le texte, ni les liens,
   ni les images, ni la structure du contenu existant.
   Ajoute uniquement des classes CSS et des animations légères.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) return; // on ne touche à rien si l'utilisateur préfère moins d'animation

  document.addEventListener("DOMContentLoaded", function () {
    /* ---------------------------------------------------------
       1) Apparition au scroll (sections, cartes, encarts)
       --------------------------------------------------------- */
    var revealTargets = document.querySelectorAll(
      "main > section, .card, .photo-note"
    );

    if ("IntersectionObserver" in window && revealTargets.length) {
      revealTargets.forEach(function (el) {
        el.classList.add("reveal-init");
      });

      var revealObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );

      revealTargets.forEach(function (el) {
        revealObserver.observe(el);
      });
    }

    /* ---------------------------------------------------------
       1bis) Apparition progressive des étapes de roadmap (.process)
          Chaque étape numérotée apparaît l'une après l'autre,
          sans toucher au texte ni à l'ordre des étapes.
       --------------------------------------------------------- */
    var processBlocks = document.querySelectorAll(".process");

    if ("IntersectionObserver" in window && processBlocks.length) {
      processBlocks.forEach(function (proc) {
        var steps = proc.querySelectorAll(":scope > div");
        steps.forEach(function (step) {
          step.classList.add("reveal-init", "reveal-step");
        });

        var processObserver = new IntersectionObserver(
          function (entries, observer) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                var children = entry.target.querySelectorAll(":scope > div");
                children.forEach(function (child, i) {
                  setTimeout(function () {
                    child.classList.add("is-visible");
                  }, i * 160);
                });
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.25, rootMargin: "0px 0px -40px 0px" }
        );

        processObserver.observe(proc);
      });
    }

    /* ---------------------------------------------------------
       2) Compteurs numériques désactivés
       Les valeurs documentaires restent toujours affichées telles quelles.
       Leur reveal visuel est assuré sans modifier leur contenu textuel.
       --------------------------------------------------------- */

    /* ---------------------------------------------------------
       3) Pastille pulsante discrète sur "🔵 En cours d'étude..."
          On enveloppe uniquement l'émoji existant dans un <span>,
          sans modifier le texte affiché.
       --------------------------------------------------------- */
    document.querySelectorAll("h3").forEach(function (h3) {
      if (h3.textContent.trim().indexOf("🔵") === 0 && !h3.querySelector(".pulse-dot")) {
        h3.innerHTML = h3.innerHTML.replace(
          "🔵",
          '<span class="pulse-dot">🔵</span>'
        );
      }
    });

    /* ---------------------------------------------------------
       4) Léger zoom (Ken Burns) sur l'image du hero
       --------------------------------------------------------- */
    var heroPlan = document.querySelector(".hero-plan");
    if (heroPlan) {
      window.requestAnimationFrame(function () {
        setTimeout(function () {
          heroPlan.classList.add("kenburns");
        }, 300);
      });
    }
  });
})();
