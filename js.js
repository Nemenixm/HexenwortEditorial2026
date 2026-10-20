/**
 * Hexenwort Editorial — Interacciones de la web
 * Navegación, animaciones, carrusel, portapapeles y avisos legales.
 */
(() => {
  "use strict";

  /** Selecciona elementos y devuelve un array. */
  const selectAll = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];

  /** Controla el menú móvil y mantiene sincronizados sus atributos ARIA. */
  function initMobileMenu() {
    const nav = document.querySelector("#menu-principal");
    const button = document.querySelector(".menu-button");

    if (!nav || !button) return;

    const setOpen = (isOpen) => {
      nav.classList.toggle("active", isOpen);
      button.setAttribute("aria-expanded", String(isOpen));
      button.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    };

    button.addEventListener("click", () => {
      setOpen(!nav.classList.contains("active"));
    });

    selectAll("a", nav).forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });
  }

  /** Marca en el menú la sección que se está leyendo. */
  function initActiveNavigation() {
    const sections = selectAll("main .sec");
    const links = selectAll("#menu-principal a");

    if (!sections.length || !links.length) return;

    const update = () => {
      let currentId = sections[0].id;

      sections.forEach((section) => {
        if (window.scrollY >= section.offsetTop - 120) {
          currentId = section.id;
        }
      });

      links.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${currentId}`;
        link.classList.toggle("active", isActive);

        if (isActive) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /** Muestra progresivamente las tarjetas al entrar en pantalla. */
  function initScrollReveal() {
    const elements = selectAll(".rv");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08 },
    );

    elements.forEach((element) => observer.observe(element));
  }

  /**
   * La imagen reemplaza el marco decorativo solo cuando carga correctamente.
   * La portada puede añadirse al sitio sin tocar el HTML ni el JavaScript.
   */
  function initBookCovers() {
    selectAll(".cover-frame").forEach((frame) => {
      const image = frame.querySelector("img");
      if (!image) return;

      const showCover = () => {
        frame.classList.add("is-loaded");
        frame.querySelector(".cover-placeholder")?.setAttribute("aria-hidden", "true");
      };

      const showPlaceholder = () => {
        frame.classList.remove("is-loaded");
        frame.querySelector(".cover-placeholder")?.removeAttribute("aria-hidden");
      };

      image.addEventListener("load", showCover);
      image.addEventListener("error", showPlaceholder);

      // Cubre el caso de portadas cargadas desde la caché del navegador.
      if (image.complete) {
        if (image.naturalWidth > 0) showCover();
        else showPlaceholder();
      }
    });
  }

  /** Navega las seis portadas con botones y teclas de dirección. */
  function initCarousels() {
    selectAll(".car").forEach((carousel) => {
      const slides = selectAll(".slide", carousel);
      const previous = carousel.querySelector(".prev");
      const next = carousel.querySelector(".next");
      const status = carousel.querySelector(".carousel-status");
      if (!slides.length || !previous || !next) return;

      let activeIndex = 0;
      const render = () => {
        slides.forEach((slide, index) => {
          slide.style.transform = `translateX(-${activeIndex * 100}%)`;
          slide.setAttribute("aria-hidden", String(index !== activeIndex));
        });
        if (status) status.textContent = `${activeIndex + 1} de ${slides.length}`;
      };
      const goTo = (step) => {
        activeIndex = (activeIndex + step + slides.length) % slides.length;
        render();
      };

      previous.addEventListener("click", () => goTo(-1));
      next.addEventListener("click", () => goTo(1));
      carousel.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") { event.preventDefault(); goTo(-1); }
        if (event.key === "ArrowRight") { event.preventDefault(); goTo(1); }
      });
      render();
    });
  }

  /**
   * Desplegable exclusivo de ISBN.
   * Las demás tarjetas de servicios muestran siempre el texto íntegro.
   */
  function initServiceReadMore() {
    const section = document.getElementById("servicios");
    const card = section?.querySelector(".service-card.isbn-card");
    const description = card?.querySelector(".service-description");
    if (!section || !card || !description) return;

    description.id = "descripcion-isbn";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "service-toggle";
    button.textContent = "Leer más";
    button.setAttribute("aria-controls", description.id);
    button.setAttribute("aria-expanded", "false");
    description.insertAdjacentElement("afterend", button);

    // Se aplica el recorte solo después de insertar el botón.
    // Si falla JavaScript, la información permanece a la vista.
    section.classList.add("services-enhanced");

    button.addEventListener("click", () => {
      const expanded = card.classList.toggle("is-expanded");
      button.textContent = expanded ? "Leer menos" : "Leer más";
      button.setAttribute("aria-expanded", String(expanded));
    });
  }

  /** Copia el correo y ofrece confirmación accesible al usuario. */
  function initCopyEmail() {
    const button = document.querySelector("#copy");
    const toast = document.querySelector("#toast");

    if (!button || !toast) return;

    let toastTimeout;
    const showMessage = (message) => {
      toast.textContent = message;
      toast.classList.add("show");
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => toast.classList.remove("show"), 2200);
    };

    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText("hexenworteditorial@gmail.com");
        showMessage("Correo copiado al portapapeles");
      } catch {
        showMessage("No se pudo copiar. Selecciona el correo manualmente.");
      }
    });
  }

  /** Gestiona la apertura y el cierre de los diálogos legales. */
  function initLegalDialogs() {
    selectAll("[data-open]").forEach((button) => {
      button.addEventListener("click", () => {
        const dialog = document.getElementById(button.dataset.open);
        if (dialog && typeof dialog.showModal === "function") {
          dialog.showModal();
        }
      });
    });

    selectAll("dialog").forEach((dialog) => {
      const close = dialog.querySelector(".close");
      close?.addEventListener("click", () => dialog.close());

      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
      });
    });
  }

  /** Crea pequeños destellos únicamente si el usuario permite animación. */
  function initMagicTrail() {
    const hasPointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!hasPointer || reducedMotion) return;

    let lastSparkle = 0;

    document.addEventListener("mousemove", (event) => {
      const now = Date.now();
      if (now - lastSparkle < 40) return;

      lastSparkle = now;

      const sparkle = document.createElement("div");
      sparkle.className = "magic-trail";
      sparkle.style.left = `${event.clientX}px`;
      sparkle.style.top = `${event.clientY}px`;

      document.body.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 600);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initActiveNavigation();
    initScrollReveal();
    initServiceReadMore();
    initBookCovers();
    initCarousels();
    initCopyEmail();
    initLegalDialogs();
    initMagicTrail();
  });
})();
