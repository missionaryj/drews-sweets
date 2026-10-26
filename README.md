# Drew's Sweets — cookie site (draft)

Static marketing + order site for Drew's home cookie business. No backend.

## Quick start

```bash
python3 -m http.server 5180
# open http://127.0.0.1:5180/
```

## Pages

- `index.html` — hero, flavor gallery, how-to-order, about
- `order.html` — bundle picker (3 for $2 / 5 for $4), flavor counts, delivery-only checkout

## Config

Edit **`content.js`**:

- Bundle prices: `bundles` (temporary — change anytime)
- Flavors, time slots, delivery notes
- Remaining placeholders: city, about blurb, phone/Instagram, delivery area/fee/lead time
- Order email: `contact.email` (currently `drewlyons05@gmail.com`)

Orders open a prefilled mailto with subject **New Drew's Sweets order**. SMS only appears if `contact.phone` is a real number (not a placeholder). Later: swap mailto for Formspree / Google Forms.

## Photos

iPhone originals resized to max 1200px → `img/*.webp` + `.jpg`. `reeses-2` kept but unused.

## Not published

Local git only — no GitHub remote.
