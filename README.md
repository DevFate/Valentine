# Valentine Story Website (Next.js)

A creative, mobile-friendly Valentine website with:

- Animated hero + floating heart atmosphere
- Auto-import from your local `Memories/` folders
- EXIF-aware context (capture date, location, device when available)
- Heart popup gallery for folders with 1-3 moments
- Creative chapter layouts for larger folders (mosaic, film strip, stacked polaroids)
- Interactive "Will you be my Valentine?" prompt
- GitHub Pages deployment workflow

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## How your `Memories` folder is used

You already added folders in `Memories/`.

The project auto-processes them with `scripts/sync-memories.mjs`:

1. Reads every subfolder in `Memories/`
2. Detects image/video files
3. Generates a site manifest at `src/data/generatedMemories.ts`
4. Copies optimized static paths to `public/memories/user/` for rendering
5. Extracts image metadata for context captions where available

### Group behavior

- **1-3 files in a folder** → shown as clickable floating heart cards (opens popup gallery)
- **4+ files in a folder** → shown as major story chapters with varied visual layouts

## Update your content

Whenever you add/remove media in `Memories/`, run:

```bash
npm run sync:memories
```

This also runs automatically before `npm run dev` and `npm run build`.

## Personalize text

Edit `src/data/story.ts` for:

- names and proposal date
- hero letter lines
- reasons section
- extra creative ideas section

## Deploy to GitHub Pages

1. Push repo to GitHub
2. In **Settings → Pages**, choose **GitHub Actions**
3. Push to `main`
4. Workflow at `.github/workflows/deploy.yml` builds and deploys static output

## Notes

- `next.config.ts` is configured for static export (`output: "export"`) and repo-aware base path.
- `public/memories/user/` is generated automatically and ignored from git.
- For best compatibility/performance, prefer `jpeg/webp` images and short `mp4` clips.
