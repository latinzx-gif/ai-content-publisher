# ai-content-publisher

## PRD Figma Prototype Page

This app has a dedicated route for the PRD prototype:

- `http://localhost:3000/prd` => full-screen embed of `https://cozy-ritzy-09485008.figma.site`
- `http://localhost:3000/` redirects to `/prd`
- Original dashboard remains at `http://localhost:3000/editor-canvas2`

Run locally:

```bash
cd /Users/jakarinosk/HEAD-OFFICE/head-office-app
npm run dev
```

Build & run production:

```bash
npm run build
npm run start
```

### Push changes

```bash
git add src/app/page.tsx src/app/prd/page.tsx README.md
git commit -m "Add full-screen Figma PRD embed page"
git push -u origin main
```
