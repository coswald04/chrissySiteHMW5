# Christine Oswald Portfolio — Eleventy Conversion

This folder is the source-only Eleventy version of the portfolio.

## Commands

```bash
npm install
npm run dev
npm run build
```

The production build is written to `_site/`. Do not commit `_site/` or `node_modules/`.

## Before deploying

1. In `src/_data/site.json`, replace `https://YOUR-SITE.netlify.app` with the real deployed URL.
2. Replace the generic GitHub and LinkedIn URLs in `src/_data/site.json` with your actual social profile URLs.
3. Copy your existing images into `src/assets/images/` using the filenames referenced by the templates:
   - `chrissy1.jpeg`
   - `ucsdFlowers.jpeg`
   - `spoilage-main.PNG`
4. Copy any media you want to keep into `src/assets/media/`:
   - `barrelroll.mp3`
   - `peak.mp4`
   - `supernatural.mp3`
   - `supernatural.wav`

## Rubric mapping

- Base document shell: `src/_includes/layouts/base.njk`
- Shared head: `src/_includes/head.njk`
- Shared header/nav: `src/_includes/header.njk`
- Shared footer: `src/_includes/footer.njk`
- Global site data: `src/_data/site.json`
- Project data: `src/_data/projects.json`
- Data-driven project pages: `src/projects/project.njk`
- Build-time navigation state: `aria-current="page"` in `header.njk`
- 404: `src/404.njk`
- Sitemap: `src/sitemap.njk`
- Netlify build config: `netlify.toml`
- Eleventy config: `eleventy.config.js`
- Build scripts: `package.json`
