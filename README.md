# oud — Salla store scripts

Standalone JS/CSS snippets loaded via jsDelivr CDN into Salla custom-code fields.

**This repo is the deploy target.** The dev workspace lives elsewhere on the author's machine
(`~/Desktop/Personal/salla`), which has a `components/*.html` folder of dev previews and an
`oud/` subfolder that is a checkout of *this* repo. If you're an agent/session working from that
dev workspace, this file is your source of truth for how to ship anything from there into
production. If you're working directly inside this repo, the same rules apply — just skip the
"copy from `components/`" steps.

---

## Accounts: this repo uses a second GitHub identity ("uvmu"), not the user's main account

Pushes/releases against `github.com/uvmu/oud` must be done as the **uvmu** GitHub account, which
is kept isolated from the user's main `gh` login via a separate `GH_CONFIG_DIR`. There is a shell
alias for this:

```bash
alias ghp='GH_CONFIG_DIR="$HOME/.config/gh-uvmu" gh'
```

- Use `ghp` (not plain `gh`) for anything GitHub-API-shaped: `ghp release create`, `ghp release list`,
  `ghp api ...`, `ghp auth status`, etc.
- Plain `git push` / `git pull` against `origin` work as normal once this repo is cloned, because
  `origin` is already set to `https://github.com/uvmu/oud.git` and credentials are already wired up
  — you don't need `ghp` for `git` commands, only for `gh` (GitHub API/CLI) commands.
- If `ghp` is not defined in your shell (e.g. a fresh agent session with no interactive shell
  history), it won't resolve as a command. Either ask the user to confirm the alias, or run the
  equivalent explicitly: `GH_CONFIG_DIR="$HOME/.config/gh-uvmu" gh <command>`.
- Never run release/publish commands with plain `gh` — that would attempt to use the user's main
  GitHub identity against a repo it doesn't own.

---

## Script URLs

Every file in this repo is instantly available at:

```
https://cdn.jsdelivr.net/gh/uvmu/oud@<tag>/<file>
```

**Latest of a specific script (by release tag):**

| Script | Tag | URL |
|--------|-----|-----|
| cross-sell.js | `cross-sell-v1.1.0` | `https://cdn.jsdelivr.net/gh/uvmu/oud@cross-sell-v1.1.0/cross-sell.js` |
| float-cluster.js | `float-v1.0.0` | `https://cdn.jsdelivr.net/gh/uvmu/oud@float-v1.0.0/float-cluster.js` |
| upsell-tiers.js | `upsell-v1.0.0` | `https://cdn.jsdelivr.net/gh/uvmu/oud@upsell-v1.0.0/upsell-tiers.js` |
| product-page-refinement.js | `refinement-v1.0.0` | `https://cdn.jsdelivr.net/gh/uvmu/oud@refinement-v1.0.0/product-page-refinement.js` |
| hamtaro.js | `hamtaro-v1.0.0` | `https://cdn.jsdelivr.net/gh/uvmu/oud@hamtaro-v1.0.0/hamtaro.js` |
| hm-landing3.js | `hm-landing3-v1.0.0` | `https://cdn.jsdelivr.net/gh/uvmu/oud@hm-landing3-v1.0.0/hm-landing3.js` |

> Tip: replace the tag with `@main` for always-latest (not for production — no cache busting).
>
> To see the full current list of tags/releases at any time: `ghp release list` (or `git tag`
> for raw tag names without titles/notes).

---

## How to ship a change to an EXISTING script

### 1. Edit the JS file

Only edit `.js` (or `.css`) files in this repo's root — `components/*.html` in the dev workspace
are previews only and are never deployed as-is.

### 2. Bump the version comment at the top of the file

```js
/* cross-sell.js — hamtaro.sa cross-sell popup | v1.1.0 */
```

### 3. Commit and push

```bash
git add cross-sell.js
git commit -m "fix cross-sell.js: short description of what changed"
git push
```

### 4. Create a release (new tag = new CDN URL)

```bash
# Format: <script-slug>-v<semver>
# Uses the uvmu GitHub account (isolated gh config, see `ghp` alias above)
ghp release create cross-sell-v1.1.0 \
  --title "cross-sell.js v1.1.0 — short description" \
  --notes "- what changed
- why"
```

### 5. Get the CDN link

```
https://cdn.jsdelivr.net/gh/uvmu/oud@cross-sell-v1.1.0/cross-sell.js
```

Paste that into the Salla custom-code field wrapped in a `<script>` tag:

```html
<script src="https://cdn.jsdelivr.net/gh/uvmu/oud@cross-sell-v1.1.0/cross-sell.js" defer></script>
```

---

## How to publish a NEW script from a `components/*.html` preview

This is the path for turning a dev-workspace preview (an `.html` file in `~/Desktop/Personal/salla/components/`)
into a real deployed script for the first time. Concrete example: `components/3rd.html` → `hm-landing3.js`.

1. **Check the preview file.** It's typically a single `<script data-cfasync="false"> ... </script>`
   block containing an IIFE. Confirm the first and last lines are exactly the opening/closing
   `<script>` tags (`head`/`tail` the file) — don't assume, since some previews may include extra
   markup.
2. **Strip the `<script>` wrapper**, keeping only the JS body (everything between the opening and
   closing tag lines).
3. **Pick a filename and version.** Ask the user if it's not obvious — filenames here are kebab-case
   and double as the tag slug (e.g. `hm-landing3.js` → tag prefix `hm-landing3`). First release is
   always `v1.0.0`.
4. **Prepend a version header comment**, matching the convention used by every other file:
   ```js
   /* hm-landing3.js — reference/landing embed for cat-food product bundle offers | v1.0.0 */
   ```
5. **Check for name collisions** before writing anything: `ghp release list` and `git tag` (in this
   repo) — make sure the chosen slug isn't already in use.
6. **Save the file into this repo's root** (not into `components/` — that stays HTML-only), then
   commit, push, and cut the first release exactly as in the "ship a change" steps above, using
   `<slug>-v1.0.0` as the tag.
7. **Update this README** — add the new script to the "Script URLs" table and to "Repo structure"
   below, in the same commit or a follow-up one. This file is the only place that lists every
   shipped script, so it must stay in sync or the next agent/session won't know the file exists.
8. **Hand the user the final CDN `<script>` tag** to paste into Salla.

---

## Tag naming convention

```
<script-slug>-v<major>.<minor>.<patch>
```

Examples: `cross-sell-v1.1.0`, `float-v1.0.1`, `hamtaro-v2.0.0`, `hm-landing3-v1.0.0`

Patch = bug fix · Minor = new feature, backwards-compatible · Major = breaking change

---

## Repo structure

```
cross-sell.js              ← cross-sell popup (shown after add-to-cart)
float-cluster.js           ← right-side floating widget cluster
upsell-tiers.js            ← quantity tier price selector
product-page-refinement.js ← product page UI tweaks
hamtaro.js                 ← cart milestone progress widget
hm-landing3.js             ← cat-food product bundle reference/landing embed (from components/3rd.html)
oud.js                     ← misc utility tweaks
reset.js                   ← CSS reset overrides
effectx-critical.css       ← critical CSS injected in <head>
assets/                    ← binary assets (video, etc.) referenced by scripts, released as `assets-v<semver>`
```

---

## Quick checklist for a new agent/session picking this up cold

- [ ] Confirm you're in the right checkout: `git remote -v` should show `github.com/uvmu/oud`.
- [ ] Use `ghp` (isolated uvmu `gh` config), never plain `gh`, for release/API commands.
- [ ] Only `.js`/`.css` files in repo root are deployed; `components/*.html` in the dev workspace
      are previews only.
- [ ] Every new/changed script gets a version-header comment bump and a matching git tag/release.
- [ ] Every shipped script must appear in this README's URL table and structure list — treat an
      out-of-sync README as a bug to fix, not something to ignore.
- [ ] When converting a preview `.html` to a deployed `.js`, only strip the outer `<script>` tags —
      don't otherwise rewrite the code unless asked.
