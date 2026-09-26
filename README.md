# Bridges to Housing website

A complete redesign of [bridgestohousing.net](https://www.bridgestohousing.net) as a fast, static, fully coded website. No framework, no build dependencies, nothing to install on the server: upload the folder and it works.

## What is in this folder

| Path | Purpose |
| --- | --- |
| `index.html`, `about.html`, `get-help.html`, `stories.html`, `donate.html`, `volunteer.html`, `news.html`, `soups-on.html`, `contact.html`, `credits.html`, `404.html` | The finished, deployable pages |
| `assets/css/styles.css` | The single stylesheet |
| `assets/js/main.js` | Logo entrance, mobile navigation, scroll reveals, contact form |
| `assets/brand/` | Vector logo (`logo.svg`, `logo-light.svg`), favicon, PNG fallbacks, social share image |
| `assets/img/` | Every photo from the original site, optimised (JPEG + WebP) |
| `assets/docs/` | The organisation's printed brochure (PDF) |
| `src/` | Page templates and the build script (see below) |
| `sitemap.xml`, `robots.txt` | Search engine files |

## Editing pages

The pages in the site root are generated from `src/pages/*.html`, which are wrapped in the shared header and footer from `src/partials/`. To change content:

1. Edit the page in `src/pages/` (or a partial in `src/partials/` for the header, footer or global contact details).
2. Run `node src/build.mjs` from this folder.
3. Upload the regenerated files.

Global details such as the phone number, email address, street address, donation link and Facebook URL live at the top of `src/build.mjs` and are inserted into every page.

If you would rather not use the build step, you can edit the root HTML files directly; they are plain HTML.

## The logo

The logo on the old site was a low-resolution screenshot. `assets/brand/logo.svg` was recovered from the vector artwork in the organisation's own printed brochure, so it is the exact logo, including the original colour gradients, at unlimited resolution. `logo-light.svg` is the same mark with white lettering for use on dark backgrounds. Do not redraw or recolour it.

## Contact form

The form on `contact.html` works in two modes:

- **Out of the box** it opens the visitor's email app with the message addressed to `office@bridgestohousing.org`.
- **With a free [Web3Forms](https://web3forms.com) access key** it sends the message directly to the inbox. Create a key for `office@bridgestohousing.org`, then paste it into the `data-access-key=""` attribute on the `<form>` in `src/pages/contact.html` and rebuild.

## Deploying

Upload the contents of this folder (everything except `src/`, which is optional) to any static host: Netlify, Cloudflare Pages, GitHub Pages, or the existing hosting account's web root. Set `404.html` as the custom not-found page if the host supports it.

For clean URLs without `.html` (for example `/about`), enable "pretty URLs" on the host. Netlify and Cloudflare Pages do this automatically.

## Before going live

- Confirm the office hours, phone number, board list and partner list are still current.
- Add the Web3Forms key so form messages arrive by email.
- Point the `bridgestohousing.net` domain at the new host.
