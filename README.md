# site-aum-madaba

Concept website for the American University of Madaba (AUM), built by FellowFlow as a showcase. **Not an official AUM website**, not commissioned by AUM, and not indexed by search engines (see `robots.txt` and the `noindex` meta on every page) until AUM gives permission.

Preview: https://labsuncut.github.io/site-aum-madaba/ (GitHub Pages, branch `claude/project-thread-y1lltb`).

## How it is built

Plain HTML, CSS and JavaScript, no framework, no runtime build step. English pages live at the root and Arabic pages under `ar/`, both generated from the same templates:

- `data/strings.json`: every piece of text, in English and Arabic.
- `data/programmes.json`: faculties and programmes with the figures AUM publishes (credit hours, minimum Tawjihi average, fee per credit hour). `null` means AUM does not publish it.
- `tools/build.mjs`: writes the HTML pages from the two data files. Run `node tools/build.mjs` after editing data or templates, then commit the generated pages too, so GitHub Pages needs no build.
- `assets/css/site.css`, `assets/js/site.js` (navigation, reveals, programme finder), `assets/js/intro.js` (the seal intro).

## Rules

- Only facts AUM publishes or Abdullah confirms. No invented numbers, reviews, rankings or quotes.
- Every figure marked "verify" in the research document is checked on aum.edu.jo before AUM sees the site.
- Keep paths relative so the preview works under `/site-aum-madaba/`.
- Test at 375px and 1280px, in English and Arabic, before every push.

Research behind the design: the "AUM website research" document in the FellowFlow project (2026-10-20).
