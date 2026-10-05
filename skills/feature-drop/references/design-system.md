# Design system

Everything brand-facing in a drop follows the Lleverage design system
(`lleverage-ai/lleverage-design-system`). Its one source is
`brand.tokens.json`; everything else in it is generated, and so is the copy
this skill carries.

## Two layers, two sources

| Layer | What | Source in this skill |
| --- | --- | --- |
| **Brand** | Clip frame (logo row, captions, footer), title and end cards, the combined video's cover and end, carousel, drop page | `toolkit/design-system/` (the kit) → `toolkit/brand.css` |
| **Product** | The app UI inside each clip's stage | the Lleverage app code (`apps/app/src/styles/globals.css` etc.) → `toolkit/app.css`; see `app-ui.md` |

The design system also generates a product theme (`product/theme.css`), but
it is marked incomplete (several semantic tokens are not decided yet), so the
app UI keeps following the app's own code. Re-check this when the kit version
changes.

## The kit in `toolkit/design-system/`

Copied from `npm run pack` of the design-system repo, never edited by hand:

| File | Use |
| --- | --- |
| `SYSTEM-VERSION.json` | Version and token digest of the copy (v2.3.2, `fb7a42f869b5ce9a` at the time of writing). The contract with the design-system repo. |
| `brand.tokens.json`, `lleverage.css` | The tokens and the generated CSS. Only the `:root` token layer is used, through `brand.css`. |
| `fonts/*.woff2` | Abhaya Libre (display), Public Sans (sans), Roboto Mono (mono), embedded so renders never depend on a font CDN. |
| `logo/` | `logo-full-dark.svg` on paper, `logo-full-light.svg` on midnight, ident and lockups. |
| `backgrounds/midnight-glow.png` | The glow behind dark layouts (title and end cards, carousel cover and close). |
| `figures/` | Isometric figures (light and `on-midnight/`) for covers or dividers when a drop needs one. |

`toolkit/brand.css` is generated from it by `node sync-brand.mjs` (the token
layer plus `@font-face` rules). Never edit it by hand.

## Brand rules applied in a drop

- **Palette**: paper `#F9F7F0` ground, midnight `#141E28` for dark surfaces and
  ink, orange `#EC7523` as the one accent, greys for hairlines and kickers.
  Orange is used sparingly: the second line of a title, the orange bar,
  numerals, the "/" of a section tag.
- **Type**: titles and captions in the display face (Abhaya Libre, weight
  400) with the second line in orange; body in Public Sans; kickers, tags,
  page numbers and footers in Roboto Mono, uppercase, letter-spaced, grey.
- **Dark cover pattern** (title, end, weekly cover and end, carousel cover
  and close): midnight with the glow, a short orange bar, mono kicker, display
  title, muted sans line, full light logo bottom left, mono URL or date bottom
  right.
- **Content pattern** (clip frame, carousel feature pages): paper ground, full
  dark logo top left, mono section tag top right with an orange "/", hairline
  under the header, display headline, mono page number ("3 — 5").
- **Lists** on dark covers follow the agenda layout: orange sans numerals
  (01, 02, 03), the item in sans 600, hairlines between items.
- The reference pages (`reference/Lleverage deck layouts.html`, component
  pages, exemplars) in the design-system pack show these patterns; look at
  them before inventing a new one.

## Updating to a newer kit

```sh
gh repo clone lleverage-ai/lleverage-design-system && cd lleverage-design-system
npm ci && node build/pack-kit.mjs --out ../ds-pack
# copy into the skill's toolkit/design-system/:
#   system/{SYSTEM-VERSION.json,brand.tokens.json,lleverage.css}, system/fonts/*.woff2,
#   assets/logo/*.svg, assets/figures/ (incl. on-midnight/), and assets/backgrounds/midnight-glow.png from the repo
cd <skill>/toolkit && node sync-brand.mjs
```
Then re-render one clip and the carousel, compare against the previous drop,
and commit the kit, `brand.css` and the renders together. At the start of
every drop, compare `toolkit/design-system/SYSTEM-VERSION.json` with the
design-system repo's `kit/SYSTEM-VERSION.json`; if the digest differs, update
first.
