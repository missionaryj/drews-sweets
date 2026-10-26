(function () {
  const S = window.SITE;
  if (!S) return;

  const $ = (id) => document.getElementById(id);
  const set = (id, text) => { const el = $(id); if (el) el.textContent = text; };
  const unwrap = (v) => (v || "").trim();

  document.title = `Order — ${S.businessName}`;
  set("foot-email", S.contact.email);
  set("foot-phone", S.contact.displayPhone);
  set(
    "delivery-notes",
    [S.delivery.areaNote, S.delivery.feeNote, S.delivery.leadTimeNote].join(" · ")
  );

  let bundleId = S.bundles[0].id;
  const counts = Object.fromEntries(S.flavors.map((f) => [f.id, 0]));
  let lastPayload = null;
  let lastSummary = "";

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
  const success = $("success");
  const errorPanel = $("error-panel");
  const submitBtn = $("submit-btn");

  function buildSummaryText(data) {
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
      `Fulfillment: ${data.fulfillment}`,
      data.fulfillment === "Delivery" ? `Delivery address: ${data.address}` : `Pickup location: ${S.delivery.pickupAddress}`,
      `Date: ${data.date}`,
      `Time: ${data.slot}`,
      data.notes ? `\nNotes: ${data.notes}` : null,
      ``,
      `Total: $${b.price}`,
    ]
      .filter((l) => l !== null)
      .join("\n");
  }

  function buildPayload(data) {
    const b = currentBundle();
    const flavorLines = selectedLines();
    const flavorCounts = flavorLines.map((l) => `${l.qty}× ${l.name}`).join(", ");
    const honey = (form.querySelector('input[name="_honey"]')?.value || "").trim();

    // FormSubmit.co AJAX JSON body.
    // _captcha must be "false" for AJAX (no interactive reCAPTCHA in fetch).
    const payload = {
      _subject: S.formSubmit.subject || `New ${S.businessName} order`,
      _template: S.formSubmit.template || "table",
      _captcha: "false",
      _honey: honey,
      name: data.name,
      phone: data.phone,
      fulfillment: data.fulfillment,
      address: data.fulfillment === "Delivery" ? data.address : "(pickup)",
      "pickup location": data.fulfillment === "Pickup" ? S.delivery.pickupAddress : "(delivery)",
      "date": data.date,
      "time slot": data.slot,
      bundle: b.display,
      "flavor counts": flavorCounts,
      total: `$${b.price}`,
      notes: data.notes || "(none)",
      summary: buildSummaryText(data),
    };
    return payload;
  }

  function formSubmitUrl() {
    const endpoint = encodeURIComponent(unwrap(S.formSubmit.endpoint));
    return `https://formsubmit.co/ajax/${endpoint}`;
  }

  function mailtoHref(summary) {
    const email = unwrap(S.contact.email);
    const subject = encodeURIComponent(S.formSubmit.subject || `New ${S.businessName} order`);
    return `mailto:${email}?subject=${subject}&body=${encodeURIComponent(summary)}`;
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
    const fulfillment = (fd.get("fulfillment") || "").toString();
    const street = (fd.get("street") || "").toString().trim();
    const city = (fd.get("city") || "").toString().trim();
    const address = fulfillment === "Delivery" ? `${street}, ${city}` : "";
    const date = (fd.get("date") || "").toString();
    const slotVal = (fd.get("slot") || "").toString();
    if (!name) errors.push("Name is required.");
    if (!phone || phone.replace(/\D/g, "").length < 7) errors.push("Enter a valid phone number.");
    if (fulfillment !== "Delivery" && fulfillment !== "Pickup") errors.push("Choose Delivery or Pickup.");
    if (fulfillment === "Delivery") {
      if (street.length < 3) errors.push("Street address is required for delivery.");
      if (norm(city) !== norm(S.delivery.deliveryArea)) errors.push(`Delivery is only available in ${S.delivery.deliveryArea}. Please choose Pickup.`);
    }
    if (!date) errors.push("Pick a date.");
    else if (date < dateInput.min) errors.push("Date can't be in the past.");
    if (!slotVal) errors.push("Pick a time slot.");
    return {
      ok: errors.length === 0,
      errors,
      data: {
        name,
        phone,
        fulfillment,
        address,
        date,
        slot: slotVal,
        notes: (fd.get("notes") || "").toString().trim(),
      },
    };
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.textContent = on ? "Sending…" : "Place order";
    form.classList.toggle("is-loading", on);
  }

  function showSuccess(summary, data) {
    const reveal = $("pickup-reveal");
    if (data && data.fulfillment === "Pickup") {
      $("pickup-address").textContent = S.delivery.pickupAddress;
      reveal.hidden = false;
    } else {
      reveal.hidden = true;
    }
    form.hidden = true;
    errorPanel.hidden = true;
    success.hidden = false;
    $("success-body").textContent = summary;
    success.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showError(message, summary) {
    form.hidden = true;
    success.hidden = true;
    errorPanel.hidden = false;
    $("error-message").textContent = message;
    $("error-body").textContent = summary;
    $("mailto-fallback").href = mailtoHref(summary);
    errorPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showForm() {
    success.hidden = true;
    errorPanel.hidden = true;
    form.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submitOrder(data) {
    const summary = buildSummaryText(data);
    const payload = buildPayload(data);
    lastPayload = payload;
    lastSummary = summary;

    setLoading(true);
    try {
      const res = await fetch(formSubmitUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      let json = null;
      try {
        json = await res.json();
      } catch (_) {
        json = null;
      }

      // formsubmit.co typically returns { success: "..." } or { message: "..." } / error shapes
      const ok =
        res.ok &&
        json &&
        (json.success || json.ok === true || (typeof json.message === "string" && !json.error));

      if (ok) {
        showSuccess(summary, data);
      } else {
        const msg =
          (json && (json.message || json.error || json.success === false && "Submission failed")) ||
          `Couldn't reach the order service (${res.status}).`;
        showError(String(msg), summary);
      }
    } catch (err) {
      showError(
        "Network error — your order wasn't sent. You can email it instead.",
        summary
      );
    } finally {
      setLoading(false);
    }
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
    submitOrder(result.data);
  });

  $("order-another").addEventListener("click", () => {
    form.reset();
    if (cityInput) cityInput.value = S.delivery.deliveryArea;
    syncFulfillment();
    Object.keys(counts).forEach((id) => setCount(id, 0));
    bundleId = S.bundles[0].id;
    const first = bundleBox.querySelector('input[name="bundle"]');
    if (first) first.checked = true;
    renderSummary();
    showForm();
  });
  $("error-edit").addEventListener("click", showForm);
  $("error-retry").addEventListener("click", () => {
    if (!lastPayload) {
      showForm();
      return;
    }
    // Re-validate from form fields
    const result = validate();
    if (!result.ok) {
      showForm();
      $("form-error").hidden = false;
      $("form-error").textContent = result.errors.join(" ");
      return;
    }
    errorPanel.hidden = true;
    form.hidden = false;
    submitOrder(result.data);
  });

  const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z]/g, "");
  function syncFulfillment() {
    const v = (form.querySelector('input[name="fulfillment"]:checked') || {}).value;
    $("delivery-fields").hidden = v !== "Delivery";
    $("pickup-note").hidden = v !== "Pickup";
  }
  form.querySelectorAll('input[name="fulfillment"]').forEach((r) => r.addEventListener("change", syncFulfillment));
  const cityInput = form.querySelector('input[name="city"]');
  if (cityInput) cityInput.value = S.delivery.deliveryArea;
  set("delivery-area-label", S.delivery.deliveryArea);
  syncFulfillment();

  renderSummary();

  // Expose for tests
  window.__orderTest = {
    buildPayload,
    buildSummaryText,
    formSubmitUrl,
    getLastPayload: () => lastPayload,
  };

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function escapeAttr(s) { return escapeHtml(s); }
})();
