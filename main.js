(function () {
  const S = window.SITE;
  if (!S) return;
  const $ = (id) => document.getElementById(id);
  const set = (id, text) => { const el = $(id); if (el) el.textContent = text; };

  document.title = `${S.businessName} — Handcrafted Cookies`;
  set("hero-tag", S.tagline);
  set("hero-loc", S.location);
  set("hero-bundles", S.bundles.map((b) => b.display).join(" · "));
  set("step-area", S.delivery.areaNote);
  set("step-lead", S.delivery.leadTimeNote);
  set("about-text", S.about);
  set("about-loc", S.location);
  set("foot-tag", S.tagline);
  set("foot-email", S.contact.email);
  set("foot-phone", S.contact.displayPhone);
  set("foot-ig", S.contact.instagram);

  const grid = $("flavor-grid");
  if (grid) {
    grid.innerHTML = S.flavors
      .map(
        (f) => `
      <article class="card">
        <button type="button" class="card-media" data-full="img/${f.image}.jpg" aria-label="Enlarge ${escapeAttr(f.name)}">
          <picture>
            <source srcset="img/${f.image}.webp" type="image/webp" />
            <img src="img/${f.image}.jpg" alt="${escapeAttr(f.alt)}" width="900" height="1200" loading="lazy" />
          </picture>
        </button>
        <div class="card-body">
          <h3>${escapeHtml(f.name)}</h3>
          <p>${escapeHtml(f.blurb)}</p>
        </div>
      </article>`
      )
      .join("");
  }

  const lb = $("lightbox");
  const lbImg = $("lightbox-img");
  const openLb = (src, alt) => {
    lbImg.src = src;
    lbImg.alt = alt || "";
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  };
  const closeLb = () => {
    lb.hidden = true;
    lbImg.removeAttribute("src");
    document.body.style.overflow = "";
  };
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-full], .about-photo");
    if (!btn) return;
    if (btn.classList.contains("about-photo")) {
      const img = btn.querySelector("img");
      if (img) openLb(img.currentSrc || img.src, img.alt);
      return;
    }
    const img = btn.querySelector("img");
    openLb(btn.dataset.full, img ? img.alt : "");
  });
  lb.querySelector(".lightbox-close").addEventListener("click", closeLb);
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) closeLb(); });

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function escapeAttr(s) { return escapeHtml(s); }
})();
