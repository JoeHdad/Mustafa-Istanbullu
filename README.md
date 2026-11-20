# Uzm. Fizyoterapist Mustafa İSTANBULLU

Website for a physiotherapy and osteopathy practice in Çukurova, Adana.
Live: https://mustafa-istanbullu.vercel.app

Static HTML, CSS and JavaScript with no build step. Turkish, Arabic (right-to-left) and English, light and dark theme, and a booking form that sends the request to WhatsApp.

## Files

| File | What it holds |
|---|---|
| `index.html` | Page structure |
| `style.css` | Colors, layout, light/dark theme |
| `content.js` | All text in the three languages, plus phone, WhatsApp and email (`CONTACT` at the top) |
| `app.js` | Language and theme switching, booking form, scroll fade-ins |
| `img/` | Photos |

## Editing

- Contact details: change `CONTACT` at the top of `content.js`.
- Any text: edit the `tr`, `en` and `ar` blocks in `content.js`. Keep the three languages in step.
- In the hero title, a word wrapped in `*stars*` is shown in the accent color.

## Running locally

```
python -m http.server 4173
```

Then open http://localhost:4173. Add `?lang=ar` or `?lang=en` to the URL to open a specific language.

## Deploying

The site is deployed to Vercel from this folder:

```
npx vercel deploy --prod
```
