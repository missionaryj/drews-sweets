(function () {
  const S = window.SITE;
  if (!S) return;

  const $ = (id) => document.getElementById(id);
  const set = (id, text) => { const el = $(id); if (el) el.textContent = text; };
  const unwrap = (v) => (v || "").trim();
  const isPlaceholder = (v) => !v || unwrap(v).startsWith("[");
  const digits = (v) => unwrap(v).replace(/[^\d+]/g, "");
  const phoneConfigured = () => !isPlaceholder(S.contact.phone) && digits(S.contact.phone).replace(/\D/g, "").length >= 7;

  document.title = `Order — ${S.businessName}`;
  set("foot-email", S.contact.email);
  set("foot-phone", S.contact.displayPhone);
  set(
    "delivery-notes",
    [S.delivery.areaNote, S.delivery.feeNote, S.delivery.leadTimeNote].join(" · ")
  );
  set("contact-display", S.contact.email);

  // Hide SMS UI unless a real phone is configured
  document.querySelectorAll("[data-needs-phone]").forEach((el) => {
    el.hidden = !phoneConfigured();
  });

  let bundleId = S.bundles[0].id;
  const counts = Object.fromEntries(S.flavors.map((f) => [f.id, 0]));

  const bundleBox = $("bundle-picks");
  bundleBox.innerHTML = S.bundles
    .map(
      (b, i) => `
    <label class="bundle-option">
      <input type="radio" name="bundle" value="${b.id}" ${i === 0 ? "checked" : ""} />
      <span class="bundle-card">
        <strong>${escapeHtml(b.label)}</strong>
        <span class="price">$${b.price}</span>
        <span class="tiny muted">${escapeHtml(b.display)}</span>
      </span>
    </label>`
    )
    .join("");

  const slot = $("slot-select");
  S.delivery.timeSlots.forEach((t) => {
    const o = document.createElement("option");
    o.value = t;
    o.textContent = t;
    slot.appendChild(o);
  });

  const dateInput = document.querySelector('input[name="date"]');
  const today = new Date();
  dateInput.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const flavorBox = $("flavor-picks");
  flavorBox.innerHTML = S.flavors
    .map(
      (f) => `
    <div class="flavor-row" data-id="${f.id}">
      <div class="flavor-row-info">
        <img src="img/${f.image}.webp" alt="" width="56" height="56" loading="lazy" />
        <span>${escapeHtml(f.name)}</span>
      </div>
      <div class="stepper">
        <button type="button" class="step-btn" data-delta="-1" aria-label="Fewer ${escapeAttr(f.name)}">−</button>
        <input type="number" min="0" max="20" value="0" inputmode="numeric" aria-label="${escapeAttr(f.name)} count" />
        <button type="button" class="step-btn" data-delta="1" aria-label="More ${escapeAttr(f.name)}">+</button>
      </div>
    </div>`
    )
    .join("");

  function currentBundle() {
    return S.bundles.find((b) => b.id === bundleId) || S.bundles[0];
  }
  function totalCount() {
    return Object.values(counts).reduce((a, b) => a + b, 0);
  }
  function selectedLines() {
    return S.flavors.filter((f) => counts[f.id] > 0).map((f) => ({ name: f.name, qty: counts[f.id] }));
  }

  function renderSummary() {
    const b = currentBundle();
    const lines = selectedLines();
    const ul = $("summary-lines");
    const empty = $("summary-empty");
    const progress = $("flavor-progress");
    const err = $("flavor-error");
    const n = totalCount();

    progress.textContent = `(${n} / ${b.qty})`;
    progress.classList.toggle("ok", n === b.qty);
    progress.classList.toggle("bad", n > 0 && n !== b.qty);

    if (!lines.length) {
      ul.innerHTML = "";
      empty.hidden = false;
    } else {
      empty.hidden = true;
      ul.innerHTML =
        `<li><strong>${escapeHtml(b.display)}</strong></li>` +
        lines.map((l) => `<li>${l.qty}× ${escapeHtml(l.name)}</li>`).join("");
    }
    $("summary-total").textContent = `$${b.price}`;
    $("summary-meta").textContent =
      n === b.qty
        ? "Bundle complete — ready to check out."
        : `Add ${Math.max(0, b.qty - n)} more cookie${b.qty - n === 1 ? "" : "s"}.`;
    err.hidden = !(n > 0 && n !== b.qty);
  }

  function setCount(id, value) {
    const b = currentBundle();
    let v = Math.max(0, Math.floor(Number(value) || 0));
    const others = totalCount() - counts[id];
    if (others + v > b.qty) v = Math.max(0, b.qty - others);
    counts[id] = v;
    const row = flavorBox.querySelector(`[data-id="${id}"] input`);
    if (row) row.value = String(v);
    renderSummary();
  }

  bundleBox.addEventListener("change", (e) => {
    const input = e.target.closest('input[name="bundle"]');
    if (!input) return;
    bundleId = input.value;
    const b = currentBundle();
    while (totalCount() > b.qty) {
      for (const f of S.flavors) {
        if (counts[f.id] > 0 && totalCount() > b.qty) setCount(f.id, counts[f.id] - 1);
      }
    }
    renderSummary();
  });

  flavorBox.addEventListener("click", (e) => {
    const btn = e.target.closest(".step-btn");
    if (!btn) return;
    const id = btn.closest(".flavor-row").dataset.id;
    setCount(id, counts[id] + Number(btn.dataset.delta));
  });
  flavorBox.addEventListener("change", (e) => {
    const input = e.target.closest("input[type=number]");
    if (!input) return;
    setCount(input.closest(".flavor-row").dataset.id, input.value);
  });

  const form = $("order-form");
  const confirm = $("confirm");

  function buildMessage(data) {
    const b = currentBundle();
    const lines = selectedLines().map((l) => `  • ${l.qty}× ${l.name}`).join("\n");
    return [
      `New order — ${S.businessName}`,
      ``,
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      ``,
      `Bundle: ${b.display} ($${b.price})`,
      `Flavors:`,
      lines,
      ``,
      `Delivery address:`,
      data.address,
      `Date: ${data.date}`,
      `Time: ${data.slot}`,
      data.notes ? `\nNotes: ${data.notes}` : null,
      ``,
      `Total: $${b.price}`,
    ]
      .filter((l) => l !== null)
      .join("\n");
  }

  /** mailto link — swap for Formspree / Google Forms later */
  function mailtoHref(body) {
    const email = unwrap(S.contact.email);
    const subject = encodeURIComponent(`New ${S.businessName} order`);
    return `mailto:${email}?subject=${subject}&body=${encodeURIComponent(body)}`;
  }

  function smsHref(body) {
    return `sms:${digits(S.contact.phone)}?&body=${encodeURIComponent(body)}`;
  }

  function validate() {
    const fd = new FormData(form);
    const errors = [];
    const b = currentBundle();
    if (totalCount() !== b.qty) {
      errors.push(`Choose exactly ${b.qty} cookies (currently ${totalCount()}).`);
    }
    const name = (fd.get("name") || "").toString().trim();
    const phone = (fd.get("phone") || "").toString().trim();
    const address = (fd.get("address") || "").toString().trim();
    const date = (fd.get("date") || "").toString();
    const slotVal = (fd.get("slot") || "").toString();
    if (!name) errors.push("Name is required.");
    if (!phone || phone.replace(/\D/g, "").length < 7) errors.push("Enter a valid phone number.");
    if (!address || address.length < 5) errors.push("Delivery address is required.");
    if (!date) errors.push("Pick a delivery date.");
    else if (date < dateInput.min) errors.push("Delivery date can't be in the past.");
    if (!slotVal) errors.push("Pick a delivery time slot.");
    return {
      ok: errors.length === 0,
      errors,
      data: {
        name,
        phone,
        address,
        date,
        slot: slotVal,
        notes: (fd.get("notes") || "").toString().trim(),
      },
    };
  }

  function showConfirm(data) {
    const body = buildMessage(data);
    $("confirm-body").textContent = body;

    const emailLink = $("confirm-email");
    emailLink.href = mailtoHref(body);
    emailLink.onclick = null;

    const smsLink = $("confirm-sms");
    if (phoneConfigured()) {
      smsLink.hidden = false;
      smsLink.href = smsHref(body);
      smsLink.onclick = null;
    } else if (smsLink) {
      smsLink.hidden = true;
    }

    form.hidden = true;
    confirm.hidden = false;
    confirm.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const result = validate();
    const errEl = $("form-error");
    if (!result.ok) {
      errEl.hidden = false;
      errEl.textContent = result.errors.join(" ");
      return;
    }
    errEl.hidden = true;
    showConfirm(result.data);
    // Open mail immediately on primary submit
    window.location.href = mailtoHref(buildMessage(result.data));
  });

  $("confirm-edit").addEventListener("click", () => {
    confirm.hidden = true;
    form.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  renderSummary();

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function escapeAttr(s) { return escapeHtml(s); }
})();
