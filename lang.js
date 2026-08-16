/* =========================================================
   GPUAtHome — lang.js
   Switcher FR 🇫🇷 / EN 🇬🇧
   Principe : chaque élément traduit porte un attribut data-en="..."
   contenant la version anglaise. Le JS bascule entre les deux.
   Additif : n'altère aucune structure, aucune classe existante.

   CORRECTIF : l'ancienne insertion ciblait le premier "a.btn.primary"
   du header, devenu .nav-mobile-cta (enfant de #siteNav, pas du header).
   insertBefore levait une NotFoundError qui coupait le script avant
   applyLang() — switcher absent ET traductions inactives.
   ========================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "gah-lang";
  var currentLang = localStorage.getItem(STORAGE_KEY) || "fr";

  /* ── Applique la langue sur tous les éléments data-en ── */
  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    /* Textes */
    document.querySelectorAll("[data-en]").forEach(function (el) {
      if (lang === "en") {
        if (!el.dataset.fr) el.dataset.fr = el.innerHTML;
        el.innerHTML = el.dataset.en;
      } else {
        if (el.dataset.fr) el.innerHTML = el.dataset.fr;
      }
    });

    /* Attributs alt & placeholder */
    document.querySelectorAll("[data-en-alt]").forEach(function (el) {
      if (lang === "en") {
        if (!el.dataset.frAlt) el.dataset.frAlt = el.alt || "";
        el.alt = el.dataset.enAlt;
      } else {
        if (el.dataset.frAlt !== undefined) el.alt = el.dataset.frAlt;
      }
    });

    /* Attributs aria-label */
    document.querySelectorAll("[data-en-aria]").forEach(function (el) {
      if (lang === "en") {
        if (!el.dataset.frAria) el.dataset.frAria = el.getAttribute("aria-label") || "";
        el.setAttribute("aria-label", el.dataset.enAria);
      } else if (el.dataset.frAria !== undefined) {
        el.setAttribute("aria-label", el.dataset.frAria);
      }
    });

    /* Lang HTML */
    document.documentElement.lang = lang === "en" ? "en" : "fr";

    /* Boutons switcher */
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      var on = btn.dataset.lang === lang;
      btn.classList.toggle("lang-btn--active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  /* ── Crée le switcher dans le header ── */
  document.addEventListener("DOMContentLoaded", function () {
    var header = document.querySelector(".header");
    if (!header) return;

    /* Idempotence : jamais deux switchers si le script est chargé 2x */
    if (!header.querySelector(".lang-switcher")) {
      var switcher = document.createElement("div");
      switcher.className = "lang-switcher";
      switcher.setAttribute("role", "group");
      switcher.setAttribute("aria-label", "Changer de langue / Switch language");

      ["fr", "en"].forEach(function (l) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "lang-btn";
        btn.dataset.lang = l;
        btn.textContent = l === "fr" ? "🇫🇷 FR" : "🇬🇧 EN";
        btn.setAttribute("aria-label", l === "fr" ? "Version française" : "English version");
        btn.addEventListener("click", function () { applyLang(l); });
        switcher.appendChild(btn);
      });

      /* Insertion : uniquement avant un enfant DIRECT du header.
         .header-cta d'abord, sinon repli sur le premier enfant direct
         éligible, sinon append en fin de header. */
      var anchor = header.querySelector(".header-cta");
      if (!anchor || anchor.parentNode !== header) {
        anchor = Array.prototype.find.call(
          header.children,
          function (el) { return el.matches("a.btn.primary, .nav-scrim"); }
        );
      }

      if (anchor && anchor.parentNode === header) {
        header.insertBefore(switcher, anchor);
      } else {
        header.appendChild(switcher);
      }
    }

    /* Applique la langue mémorisée au chargement.
       Hors du bloc d'insertion : la traduction doit s'appliquer
       même si le switcher ne peut pas être placé. */
    applyLang(currentLang);
  });
})();
