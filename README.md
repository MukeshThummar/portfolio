# Mukesh Thummar Portfolio

Static portfolio website for Mukesh Thummar, built with semantic HTML, modern CSS and vanilla JavaScript.

## What Is Included

- Multi-page static website: `index.html`, `about.html`, `projects.html`, `blogs.html`, `contact.html`
- Responsive dark/light theme
- Data-driven skills, projects and blog idea cards
- Public GitHub API enrichment with local JSON fallback
- SEO metadata, Open Graph image and JSON-LD Person schema
- Accessibility basics: semantic landmarks, skip link, focus states, keyboard-friendly controls and reduced-motion support

## Run Locally

Because the site loads JSON files with `fetch`, use a local static server rather than opening `index.html` directly.

```powershell
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Deploy

The site can be deployed directly to GitHub Pages, Netlify, Vercel static hosting or any standard web server. No backend is required.

## Content Notes

- Blog cards are intentionally marked as future ideas, not published articles.
- Project descriptions use verified public GitHub metadata where available and avoid inventing unverified behavior.
- No sensitive personal information is included.
- The email CTA is marked as available on request because no verified public email address was provided in the source material.

## Future Asset Guidance

The original brief requested Canva-created visual assets. This implementation uses lightweight built-in technical visuals and an SVG Open Graph preview so the site is immediately deployable. Future Canva exports can be added under `assets/generated/` and referenced from the relevant sections.
