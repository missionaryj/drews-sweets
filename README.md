# Drew's Sweets — cookie site (draft)

Static marketing + order site. Orders go through **FormSubmit** (no backend on this site).

## Quick start

```bash
python3 -m http.server 5180
# open http://127.0.0.1:5180/
```

## Pages

- `index.html` — hero, flavors, how-to-order, about
- `order.html` — bundle (1/$4, 4/$13, 6/$20, dozen/$45), flavors, delivery (Waverly, IL) or pickup checkout

## FormSubmit

Config in `content.js` → `formSubmit`:

- `endpoint`: FormSubmit alias (active)
- After Drew activates (email from FormSubmit), **replace `endpoint` with the random alias** they provide so the public site does not expose her address
- AJAX: `POST https://formsubmit.co/ajax/<endpoint>` with JSON (`_subject`, `_template: table`, `_captcha: false`, `_honey`, plus order fields)
- On failure, UI offers a mailto fallback to `contact.email`

### Activation

1. Place one real order from a page served over http(s) (not a raw `file://` HTML file), **or** open the activation email FormSubmit sends after the first successful submission.
2. Click **Activate form** / confirm in that email.
3. Optionally swap `formSubmit.endpoint` to FormSubmit’s random string.

## Other config

Remaining placeholders in `content.js`: about, phone/Instagram, delivery area/fee/lead time, time slots. Bundle prices live in `bundles`.

## Not published

Local git only — no GitHub remote.
