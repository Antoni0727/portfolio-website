# Editing the website

All text lives in a few files. Open the project folder (`tonyjedits-site`) in your code editor,
find the text, change it, save. Tip: use your editor's "Find in files" (Cmd+Shift+F) and search
for the exact words you see on the site — that takes you straight to them.

## Where everything is

| What you see on the site | File | What to look for |
| --- | --- | --- |
| Email, social links, "Book a call" link | `src/data/site.ts` | `email`, `socials`, `bookingUrl` |
| Page title + Google description | `src/data/site.ts` | `title`, `description` |
| Videos (long-form + reels), their labels | `src/data/work.ts` | one line per video, change the YouTube `id` |
| How many videos show before "Show more" | `src/data/work.ts` | `longVisible`, `shortsVisible` |
| The 4 numbers under the hero (2M+, …) | `src/data/content.ts` | `proof` |
| "Why me" comparison rows | `src/data/content.ts` | `comparison` (keep each side 3–5 words) |
| Client messages (Joseph, Ava) + your reply | `src/data/content.ts` | `chat` |
| YouTube comments | `src/data/content.ts` | `comments` |
| FAQ questions and answers | `src/data/content.ts` | `faq` |
| Hero headline + buttons | `src/components/Hero.astro` | `Edits that turn content into` |
| "Selected work" heading | `src/components/Work.astro` | `Videos edited to be` |
| "Drag the playhead" section text | `src/components/Compare.astro` | `Drag the` |
| Process steps (titles + text) | `src/components/Process.astro` | `step__title`, `step__text` |
| "Why me" heading + line under it | `src/components/Why.astro` | `Most edits try to` |
| About text + the 2019 / 2024 / 2025 / Now timeline | `src/components/About.astro` | `journey` (top) and `prose` |
| Final contact card | `src/components/ContactCta.astro` | `Let's make your next video` |
| "Message me" pop-up window text | `src/components/ContactWindow.astro` | `Let's talk about your next video` |
| Footer line | `src/components/Footer.astro` | `Video editor for creators` |

Notes:
- In `.astro` files, an `&` is written as `&amp;` and an apostrophe is fine as `'`.
- The highlighted word in a heading is the one wrapped in `<span class="sel" data-sel>…</span>`.
  Keep that wrapper around whichever word you want highlighted.
- Words in `src/data/*.ts` sit inside quotes. If your text contains an apostrophe ('),
  wrap it in double quotes instead: `"I'm happy…"`.

## Preview your change

```bash
npm run dev
```
Open http://localhost:4321 — it updates as you save. (If something looks stale, stop it with
Ctrl+C and run `rm -rf node_modules/.vite && npm run dev`.)

## Publish your change

```bash
git add -A
git commit -m "Update text"
git push
```
Netlify rebuilds automatically and the live site updates in 1–2 minutes.
If the build fails, Netlify → Deploys shows the error.

## Swapping the before/after clips

Put new clips in `media-src/` and ask Claude to rebuild `public/compare/stack*.mp4`
(raw on the left, edit on the right, audio split by channel).

## Logo

The logo lives in `src/components/Logo.astro` (site) and `public/icons/` (browser icons).
To use your own later, replace those files with your design.
