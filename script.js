// ============================================================
// Portfolio interactivity
// Vanilla JS, no build step. Works on index, data, resume pages.
// Respects prefers-reduced-motion.
// ============================================================

(function () {
  "use strict";

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ----- Footer year -----
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ----- Scroll progress bar -----
  const progressBar = document.querySelector(".scroll-progress");
  if (progressBar) {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.transform = `scaleX(${pct / 100})`;
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  // ----- Smooth scroll for same-page anchors -----
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  });

  // ----- Scroll reveal -----
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach((el) => io.observe(el));
    }
  }

  // ----- Back-to-top button -----
  const toTop = document.querySelector(".to-top");
  if (toTop) {
    const toggleTop = () => {
      if (window.scrollY > 600) toTop.classList.add("is-visible");
      else toTop.classList.remove("is-visible");
    };
    toggleTop();
    window.addEventListener("scroll", toggleTop, { passive: true });
    toTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  }

  // ----- Mouse-reactive hero blob -----
  const blob = document.querySelector(".hero-blob");
  if (blob && !prefersReducedMotion) {
    const hero = blob.closest(".intro") || document.body;
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      blob.style.setProperty("--mx", x + "%");
      blob.style.setProperty("--my", y + "%");
    });
  }

  // ----- Typed role rotator -----
  const typed = document.querySelector("[data-typed]");
  if (typed) {
    const raw = typed.getAttribute("data-typed") || "";
    const roles = raw.split("|").map((s) => s.trim()).filter(Boolean);
    if (prefersReducedMotion || roles.length === 0) {
      typed.textContent = roles[0] || "";
    } else {
      let roleIdx = 0;
      let charIdx = 0;
      let deleting = false;
      const tick = () => {
        const current = roles[roleIdx];
        if (!deleting) {
          charIdx++;
          typed.textContent = current.slice(0, charIdx);
          if (charIdx === current.length) {
            deleting = true;
            setTimeout(tick, 1600);
            return;
          }
          setTimeout(tick, 55);
        } else {
          charIdx--;
          typed.textContent = current.slice(0, charIdx);
          if (charIdx === 0) {
            deleting = false;
            roleIdx = (roleIdx + 1) % roles.length;
            setTimeout(tick, 250);
            return;
          }
          setTimeout(tick, 30);
        }
      };
      setTimeout(tick, 500);
    }
  }

  // ----- Project filter pills -----
  const filterBar = document.querySelector(".filter-bar");
  if (filterBar) {
    const projects = Array.from(document.querySelectorAll(".project"));
    const buttons = Array.from(filterBar.querySelectorAll(".filter-btn"));
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const f = btn.dataset.filter;
        buttons.forEach((b) => {
          const active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-pressed", active ? "true" : "false");
        });
        projects.forEach((p) => {
          const tags = (p.dataset.tags || "").split(/\s+/);
          const show = f === "all" || tags.includes(f);
          p.classList.toggle("is-hidden", !show);
        });
      });
    });
  }

  // ----- Project modal -----
  const modal = document.querySelector(".modal");
  if (modal) {
    const modalTitle = modal.querySelector(".modal-title");
    const modalBody = modal.querySelector(".modal-body");
    const modalMedia = modal.querySelector(".modal-media");
    const modalActions = modal.querySelector(".modal-actions");
    const modalClose = modal.querySelector(".modal-close");
    let lastFocused = null;

    const openModal = (project) => {
      const title = project.querySelector(".project-title")?.textContent || "";
      const desc = project.querySelector(".project-desc")?.textContent || "";
      const tags = project.querySelector(".tags")?.textContent || "";
      const details = project.getAttribute("data-details") || "";
      const img = project.querySelector(".project-media img");
      const links = Array.from(project.querySelectorAll(".actions a"));

      modalTitle.textContent = title;
      modalBody.innerHTML = "";
      const lead = document.createElement("p");
      lead.className = "modal-lead";
      lead.textContent = desc;
      modalBody.appendChild(lead);
      if (details) {
        const p = document.createElement("p");
        p.className = "modal-details";
        p.textContent = details;
        modalBody.appendChild(p);
      }
      if (tags) {
        const t = document.createElement("p");
        t.className = "tags";
        t.textContent = tags;
        modalBody.appendChild(t);
      }

      modalMedia.innerHTML = "";
      if (img) {
        const clone = document.createElement("img");
        clone.src = img.src;
        clone.alt = img.alt || "";
        modalMedia.appendChild(clone);
      }

      modalActions.innerHTML = "";
      links.forEach((a) => {
        const clone = a.cloneNode(true);
        modalActions.appendChild(clone);
      });

      lastFocused = document.activeElement;
      modal.classList.add("is-open");
      modal.removeAttribute("hidden");
      document.body.style.overflow = "hidden";
      modalClose.focus();
    };

    const closeModal = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("hidden", "");
      document.body.style.overflow = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    };

    document.querySelectorAll(".project").forEach((p) => {
      const opener = p.querySelector(".project-open");
      if (!opener) return;
      opener.addEventListener("click", (e) => {
        e.preventDefault();
        openModal(p);
      });
    });

    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.classList.contains("modal-backdrop")) {
        closeModal();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });
  }
})();
