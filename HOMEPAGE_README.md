# Marci Metzger — Homepage redesign (v3: navigation + gallery fixes)

A responsive single-page **real estate homepage redesign** built for the Junior Website Builder assignment. Uses the source homepage's words, photo assets, broker identity and contact details within a new editorial, mobile-first layout.

**Stack:** Semantic HTML5, handcrafted CSS3, vanilla JavaScript, Vite for development/build, Vercel Hobby for free deployment.

**Source home page:** https://marcimetzger.com/

## Latest fixes (v3)

- Changed the page JavaScript tag to `type="module"` so Vite bundles interactions into `dist/` for Vercel. Previously the production site could be missing the script, making the mobile menu and thumbnail gallery inert.
- Anchors scroll the first section heading below the sticky header, removing excess blank space after navigation.
- Mobile hamburger opens/closes and dismisses after selecting a link or clicking outside it.
- Gallery thumbnails are arranged 2 × 4 on desktop and 4 × 2 on mobile. All 8 images and the counter are updated by JavaScript.
- Browser interaction checks were performed in an isolated environment at widths 320, 375, 768 and 1440px using stand-in images: links, menu, thumbnails, counters and horizontal overflow passed. Confirm actual remote images and the final Vercel build on your computer.

## What changed from the starter project

- Replaced **all Unsplash placeholder links** with the original source-site photo URLs you provided.
- Mapped the 13 unique images to purpose-built sections: Mountain Falls landscape (hero), Marci portrait (about), 3 wide images (selling highlights), the modern home (home search), 3 square images (service cards), reusable images (interactive gallery), and original Ridge / REALTOR® / Equal Housing logos (branding and footer).
- The two repeated URLs for the hero images had alternate resolutions; the larger 1350px versions were selected.
- The gallery labels are descriptive and do **not** claim stock imagery is an actual listing.
- Search gathers preferences and links to the original site's listings page; it does **not** pretend to query an MLS database.
- Contact form opens the visitor's own email application, with a draft for `marcimetzger@gmail.com` (publicly listed on realtor.com; verify before submission). It does **not** pretend to submit to a server.

## 1. Setup

Use Node.js 20.19+ or 22.12+. Open a terminal in this folder:

```bash
npm install
npm run assets:download
npm run dev
```

Open the localhost URL displayed in the terminal, usually `http://localhost:5173`.

**Important:** The image downloader is a one-time step. It uses the original GoDaddy URLs from `original-image-manifest.json` to save files in `public/images/`, and replaces image links in `index.html` and `src/main.js` with local `/images/...` links. You can rerun it safely. If GoDaddy blocks any image, the script reports it and keeps that image's remote URL as a fallback. You should resolve any failed downloads before submitting to comply with the assignment's instruction to download images directly from the original website.

All 13 original images are **not included in the ZIP**, because this environment cannot fetch their bytes. Until the downloader runs, the site uses your original URLs so photos load when the browser can reach them.

## 2. Test

Test all **three layouts** (mobile, tablet, desktop) in Chrome Developer Tools and on at least one real phone if possible:

| Viewport | Example width | Check |
|---|---:|---|
| Mobile | 375px | Hamburger menu, responsive cards/forms, gallery thumbs, no side-scrolling |
| Tablet | 768px | Two-column sections, correct photo crop, tap targets |
| Desktop | 1440px | Hero composition, card layouts, fixed navigation spacing |

Check menu open/close, each gallery arrow and thumbnail, search validation (min > max), email criteria link, contact form, phone links, directions, loading images and accessibility keyboard navigation. Check for no broken images in **Network → Img**. Inspect browser Console for errors.

## 3. Build and deploy on Vercel (free Hobby plan)

1. Run `npm run assets:download` and confirm 13/13 images. **Include `public/images` in your project when you deploy.**
2. Run `npm run build`. Vite generates `dist/`.
3. Push the folder to your own GitHub repository (a private repo is fine). Do not submit the repository URL to the employer.
4. Visit https://vercel.com/new, import the repo and choose the **Vite** framework preset.
5. Build command: `npm run build`. Output directory: `dist`. Deploy.
6. Open the assigned `https://YOUR-PROJECT.vercel.app` link in an incognito browser to verify the deployed site. Submit **that site URL**, not GitHub.

If you prefer deploying directly from your terminal: after installing Vercel CLI (`npm i -g vercel`) and signing in (`vercel login`), run `vercel --prod` in this directory. Verify that `public/images` exists first.

## File map

```
index.html                  Homepage sections and semantic markup
src/styles.css              All custom responsive styles
src/main.js                 Navigation, gallery, property preferences, contact email draft
src/assets/favicon.svg      Tab icon
public/images/              Downloaded original photos (populated after the downloader)
original-image-manifest.json 13 source image URLs, names and purpose
scripts/download-original-images.mjs  Download-and-rewrite helper
package.json                Vite scripts
vercel.json                 Vercel build / output settings
```

## One specific design decision (for your implementation note)

> I replaced the reference page's long sequence of text-heavy sections with a clear visual hierarchy: a location-led hero, compact proof points, story-driven photo cards, and a separate search panel. This makes it easier to identify the agent's expertise, understand her services, and find the next action without scrolling through repeated headings. The design uses the reference photographs and keeps every major section while improving readability across screen sizes.

**Review/adjust the wording to reflect design decisions you understand and personally verified.** The assignment explicitly asks for individual design judgment, not just a downloaded AI-produced website.

## Submission reminders

- The assignment requires the website URL, an updated resume **with mobile number**, and a brief implementation note.
- Subject: `Junior WB Applicant Home Project - Given Name Surname`.
- **Recipient discrepancy in the assignment:** the visible email is `phcareers@luxurypresence.com`, while some embedded mailto hyperlinks target `jchristian@luxurypresence.com`. Confirm the correct recipient from the original recruiter message or ask the recruiter. Do not blindly use the link target.
- Please verify image licensing and the permitted scope of use outside this assessment. Getty/stock images from the original website may be licensed only to the owner.
- This is a **concept**, not an official page affiliated with the business.

## Push fixes to GitHub (including when files already exist)

After downloading original images, run in the project folder:

```bash
npm install
npm run assets:download
npm run build
npm run github:push
```

The push script now **supports updates to an existing repository**: it makes a fresh temporary clone, updates only the project-managed paths, stages them, commits the fix, and pushes without `--force`. It preserves unrelated repository files and keeps the repository's `README.md` separate from `HOMEPAGE_README.md`. A clean Git installation and permission to push to the repository are required.

If you prefer to work in an existing local Git clone, copy updated project files there, then run `git add .`, `git commit -m "fix: repair navigation, mobile menu and gallery"`, `git push origin main` (or your actual branch name).

**Deployment reminder:** after pushing, wait for Vercel's new deployment to finish, hard refresh the site, and check the mobile menu, anchor offsets and all eight gallery thumbnails on the actual live URL.
