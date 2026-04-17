# Bass Boost Landing

Marketing / landing page for the Bass Boost Chrome extension.

## Tech Stack

- Single-file static site (`index.html`) — vanilla HTML, CSS, JS
- Deployed on Vercel (`@vercel/static`)
- Google Fonts: Orbitron (headings), DM Sans (body)

## Structure

```
index.html     → All markup, styles, and scripts in one file
vercel.json    → Vercel deployment config (static builder, SPA routing)
```

## Page Sections

1. **Nav** — Sticky, glassmorphism blur, language switcher (EN/ID), CTA
2. **Hero** — Headline, badges, CTA buttons, animated extension mockup
3. **Features** — 6-card grid (free vs Pro distinction)
4. **How It Works** — 4-step flow
5. **Pricing** — Free (Rp 0) vs Pro (donate on Saweria) comparison
6. **FAQ** — 5 collapsible items with accordion toggle
7. **Footer** — Credits

## Features

- **i18n**: English & Indonesian, auto-detected from `navigator.language`, stored in `localStorage` (`bassboost-lang`)
- **Responsive**: Mobile breakpoints at 560px and 640px
- **Dark theme**: CSS custom properties (`--bg: #03050d`, `--blue: #2979ff`, etc.)
- **Animations**: Fade-in on load (`up`), visualizer bars (`vp`)

## Development

Open `index.html` directly in browser. No build step needed.

## Deployment

Push to Vercel. Config in `vercel.json` routes all paths to `index.html`.
