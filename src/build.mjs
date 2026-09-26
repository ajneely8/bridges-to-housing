/**
 * Static site build for Bridges to Housing.
 *
 * Every page in src/pages/ is a plain HTML fragment with a small JSON
 * front matter block at the top. The build wraps each fragment in the
 * shared document shell (head, header, footer) and writes the finished
 * page to the site root. Run it with:
 *
 *   node src/build.mjs
 *
 * Nothing else is required: no bundler, no framework, no dependencies.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const partials = (name) => readFileSync(join(here, 'partials', name), 'utf8');

const site = {
  name: 'Bridges to Housing',
  url: 'https://www.bridgestohousing.net',
  phone: '530-755-3414',
  phoneHref: 'tel:+15307553414',
  email: 'office@bridgestohousing.org',
  address1: '909 Spiva Avenue',
  address2: 'Yuba City, CA 95991',
  donate: 'https://secure.givelively.org/donate/bridges-to-housing-inc',
  facebook: 'https://www.facebook.com/Bridges-to-Housing-257283497746035/',
};

const nav = [
  ['index.html', 'Home'],
  ['about.html', 'About'],
  ['get-help.html', 'Get Help'],
  ['stories.html', 'Stories'],
  ['volunteer.html', 'Volunteer'],
  ['news.html', 'News'],
  ['contact.html', 'Contact'],
];

const logo = readFileSync(join(root, 'assets/brand/logo.svg'), 'utf8');
const logoLight = readFileSync(join(root, 'assets/brand/logo-light.svg'), 'utf8');
const logoIntro = logo.replace(/bth-/g, 'bthi-');

const shell = partials('shell.html');
const header = partials('header.html');
const footer = partials('footer.html');

function render(template, vars) {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, key) => {
    const value = key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), vars);
    return value == null ? '' : String(value);
  });
}

function navHtml(active) {
  return nav
    .map(([href, label]) => {
      const current = href === active ? ' aria-current="page"' : '';
      return `<li><a href="${href}"${current}>${label}</a></li>`;
    })
    .join('\n          ');
}

const pagesDir = join(here, 'pages');
const files = readdirSync(pagesDir).filter((f) => f.endsWith('.html'));
const built = [];

for (const file of files) {
  const raw = readFileSync(join(pagesDir, file), 'utf8');
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!match) throw new Error(`Missing front matter in ${file}`);
  const meta = JSON.parse(match[1]);
  const body = raw.slice(match[0].length);
  const out = meta.output || file;

  const vars = {
    site,
    meta,
    logo,
    logoLight,
    logoIntro,
    navItems: navHtml(out),
    intro: meta.intro ? partials('intro.html') : '',
    introClass: meta.intro ? ' intro-pending' : '',
    bodyClass: meta.bodyClass || '',
    canonical: `${site.url}/${out === 'index.html' ? '' : out}`,
    ogImage: `${site.url}/assets/brand/og-image.jpg`,
    jsonld: meta.jsonld ? partials('jsonld.html') : '',
  };

  let html = render(shell, { ...vars, header: render(header, vars), footer: render(footer, vars), body: render(body, vars) });
  html = render(html, vars); // second pass for nested placeholders
  writeFileSync(join(root, out), html);
  built.push(out);
}

/* sitemap */
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${built
  .filter((p) => p !== '404.html')
  .map((p) => `  <url><loc>${site.url}/${p === 'index.html' ? '' : p}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n')}
</urlset>
`;
writeFileSync(join(root, 'sitemap.xml'), sitemap);
writeFileSync(join(root, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);

console.log(`Built ${built.length} pages: ${built.join(', ')}`);
