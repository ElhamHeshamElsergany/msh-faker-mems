# مش فاكر الميم

اوصف موقف بالمصري، والتطبيق يدور في مجموعة منتقاة على أقرب سجل موجود. مش بيولّد صور، ومش بينسب رسم لفيلم أو شخص من غير مصدر متحقق.

Egyptian Meme Finder is a small TypeScript monorepo: an Arabic RTL React app and an Express API. Search is deterministic and runs without a paid AI key. The seed catalog is original demo art, not a collection of famous memes.

## What is real today

- Situation search in Egyptian Arabic, with ranking, filters, captions, favorites, and a detail page.
- Local understanding of work, studying, family, relationships, social situations, and reactions such as shock, embarrassment, frustration, happiness, and sarcasm.
- Optional server-side OpenAI classification. If `OPENAI_API_KEY` is missing, responses say the engine is `local`.
- A repository interface with a JSON implementation and an optional Supabase loader.

The seed records in `data/memes.json` are `verificationStatus: "demo"`. Their images are original SVG drawings in `apps/web/public/memes`, licensed CC0 in the record metadata. They are not screenshots from movies, TV, or social media, and the UI labels them as تجربة.

## Repository layout

```text
apps/api          Express API
apps/web          Vite + React frontend
packages/shared   Normalization, ranking, Zod schemas, taxonomy
data/memes.json   Curated catalog
scripts           Local dev runner and demo-art generator
.github/workflows CI and GitHub Pages
render.yaml       Render web service blueprint
```

## Local setup

Requirements: Node.js 20 or newer.

```bash
npm ci
cp .env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
npm run dev
```

- Web: http://localhost:5173
- API: http://127.0.0.1:3001/api/health

The Vite dev server proxies `/api` to the API, so `VITE_API_BASE_URL` can stay empty locally.

Set `VITE_USE_MOCK=true` in `apps/web/.env` only when you want the dev server to search the dataset in the browser without the API. Production builds ignore that flag and never substitute mock results for a failed API.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Builds shared types, then runs the API and web |
| `npm test` | Shared, API, and web tests |
| `npm run typecheck` | Builds shared declarations, then checks API and web |
| `npm run lint` | ESLint |
| `npm run build` | Shared, API, and web production builds |
| `npm run build:server` | API build used by Render |
| `npm start` | Runs the compiled API |
| `npm run demo-art` | Regenerates the original demo SVGs |

After changing `packages/shared` while `npm run dev` is running, restart the API process so it reloads the compiled package.

## Environment

Copy placeholders from `.env.example` and `apps/web/.env.example`. Do not commit `.env` files.

| Variable | Where | Required | Purpose |
| --- | --- | --- | --- |
| `PORT` | API | No, default `3001` | Port. The process listens on `HOST` and `PORT`. |
| `HOST` | API | No, default `0.0.0.0` | Bind address for cloud hosts. |
| `CORS_ORIGINS` | API | Yes in production | Comma-separated frontend origins, no paths. |
| `OPENAI_API_KEY` | API | No | Enables server-side situation classification. |
| `OPENAI_MODEL` | API | No | Defaults to `gpt-4o-mini`. Change it if that id is retired. A failed call falls back to local search. |
| `SUPABASE_URL` | API | No | Switches the catalog to Postgres when the key is also set. |
| `SUPABASE_SERVICE_ROLE_KEY` | API | No | Server only. Never put this in a `VITE_` variable. |
| `MEME_DATA_PATH` | API | No | Override for `data/memes.json`. |
| `VITE_API_BASE_URL` | Web build | Yes for Pages | Public API origin, for example `https://your-service.onrender.com`. |
| `VITE_USE_MOCK` | Web dev | No | Dev-only local search. Ignored in production. |
| `VITE_BASE_PATH` | Web build | For project Pages | `/msh-faker-mems/` in GitHub Actions. `/` locally. |

OpenAI is a paid API. The app is designed to start and search with no key. Supabase is optional; check [Supabase pricing](https://supabase.com/pricing) before creating a project. This repo does not assume that a free database lasts forever.

## API

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/health` | Status, data source, whether AI is configured, meme count. |
| `POST` | `/api/memes/search` | JSON body `{ "query": "...", "categories": [], "reactions": [], "sources": [], "limit": 6 }`. |
| `GET` | `/api/memes/:id` | One catalog record. |
| `GET` | `/api/categories` | Categories, reactions, and source labels. |
| `GET` | `/api/memes/trending` | First records in catalog order. There are no view counts. |

The API validates bodies with Zod, limits JSON to 16 KB, rate-limits meme routes, sends security headers, and logs method, path, status, and duration without the situation text or secrets. Unknown origins are not given CORS approval. In production the process refuses to start without `CORS_ORIGINS`.

Search keeps the original text for display, normalizes Arabic for matching, and returns fewer rows when the score is weak instead of filling the page with unrelated records.

## Importing a verified meme

1. Confirm you can use the image. A random movie still or repost is not enough.
2. Put the file in `apps/web/public/memes/verified/` using a lowercase name such as `memes/verified/example.webp`.
3. Add a record to `data/memes.json`:
   - `verificationStatus`: `"verified"`
   - `sourceUrl`: an `https` page that supports the attribution
   - `sourceTitle`, `characterName`, and `originalContext` only when that same source supports them
   - `attribution`, `license`, and `allowDownload` matching the actual permission
   - `disclaimer` that does not call a demo drawing a famous meme
4. Run `npm test`. Demo records are rejected if they name a person, a title, or a source URL. Verified records are rejected without a source URL. Duplicate ids and image paths fail too.
5. Do not mark the current SVG drawings as verified.

Remote `https` image URLs are accepted only on verified records. Prefer a file you host when you have a stable copy and the license allows it.

### Optional Supabase shape

The JSON repository is the default. If both Supabase variables are set, the API loads `public.memes` through the REST endpoint with the service role key. A failure or an empty table is reported on `/api/health` as `supabase: "unavailable"` and the JSON file is used, so the service still boots. The loader does not pretend the remote table is active in that case.

```sql
create extension if not exists vector;

create table public.memes (
  id text primary key,
  label text not null,
  image_path text not null,
  character_name text,
  source_title text,
  original_context text,
  keywords text[] not null,
  categories text[] not null,
  reactions text[] not null,
  example_captions text[] not null,
  source_url text,
  attribution text not null,
  license text not null,
  allow_download boolean not null default false,
  verification_status text not null check (verification_status in ('demo', 'verified')),
  disclaimer text not null,
  embedding vector(1536)
);
```

`embedding` is reserved for a later pgvector query. Today the API still ranks in process after loading the rows, so adding a vector index does not require a new HTTP contract. Keep the service role key on the server.

## GitHub Pages

The site is a project page, so the production base path is `/msh-faker-mems/`.

Workflow: `.github/workflows/deploy-frontend.yml`. It builds `apps/web/dist`, uploads it with `actions/upload-pages-artifact`, and deploys with `actions/deploy-pages`. Permissions are `contents: read`, `pages: write`, and `id-token: write`.

One-time settings:

1. Push `main`.
2. On GitHub open **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. After the API has a public URL, add a repository variable (not a secret) named `VITE_API_BASE_URL`. It is baked into the static build and must not contain a server key.
4. Re-run **Deploy frontend**.

Client routes refresh through a copied `404.html`, which GitHub Pages serves for unknown paths. The API is not hosted on Pages.

Expected site, after a successful deploy: `https://elhamheshamelsergany.github.io/msh-faker-mems/`

## Render

`render.yaml` describes one free Node web service. It is portable to any host that runs `npm run build:server` and `npm start`.

From the [Render free web service docs](https://render.com/docs/free) and [pricing page](https://render.com/pricing), checked while building this repo:

- Free web services exist (`plan: free`, 512 MB RAM) and are meant for previews and hobby projects, not production.
- A free web service spins down after 15 minutes without traffic and takes about a minute to wake up. Render can show its own loading page during that cold start.
- The filesystem is ephemeral.
- Each workspace gets 750 free instance hours per calendar month. Hours do not roll over. The service does not consume hours while spun down. If the hours run out, Render suspends free web services until next month.
- Outbound bandwidth and build minutes have included amounts. Past the included bandwidth, Render bills a supplement if a payment method exists, or suspends free services if it does not.
- Free Render Postgres databases expire 30 days after creation. This API does not use Render Postgres. The catalog is the JSON file in the repo.

Do not treat those limits as permanent. Read the two links again before deploying.

Dashboard steps:

1. Create a Render account and a blueprint from this repo, or a new **Web Service** pointing at `https://github.com/ElhamHeshamElsergany/msh-faker-mems`.
2. Root directory: the repository root, not `apps/api`.
3. Build command: `npm ci --include=dev && npm run build:server`
4. Start command: `npm start`
5. Health check path: `/api/health`
6. Environment:
   - `NODE_ENV=production`
   - `CORS_ORIGINS=https://elhamheshamelsergany.github.io`
   - Leave `OPENAI_API_KEY` and the Supabase variables empty unless you are actually configuring them in the dashboard. Do not commit them.
7. Render sets `PORT`. The server binds `0.0.0.0` and that port.
8. Copy the public `https://….onrender.com` URL into the GitHub variable `VITE_API_BASE_URL` and redeploy Pages.

Add `http://localhost:5173` to `CORS_ORIGINS` as well if a local frontend should call the hosted API.

No Dockerfile is included. The Node buildpack is enough for this service.

## Free and paid pieces

| Piece | Cost in this setup |
| --- | --- |
| GitHub Pages | Static hosting for the frontend. A public project site does not need a paid plan. |
| GitHub Actions | CI and Pages deploys use the repository's included minutes. |
| Render free web service | $0 compute plan with the sleep, hours, and bandwidth limits above. Not a promise that the plan stays the same. |
| OpenAI | Optional and billed by OpenAI if you set a key. Off by default. |
| Supabase | Optional. Not provisioned here. Check current pricing before use. |
| Google Fonts | Cairo and Tajawal are loaded from Google Fonts in the browser. |

## Known limits

- The catalog is 12 demo drawings. Low-confidence situations return no results on purpose.
- Nothing in the seed is a verified Egyptian movie or internet meme.
- Download is enabled only when the record says `allowDownload`. The caption editor previews text in CSS and does not bake it into the file.
- Favorites stay in `localStorage` on one browser.
- Ranking is keyword, phrase, category, and reaction overlap. It is not a semantic embedding search yet.
- The optional model only classifies the sentence. It cannot add images.
- Rate limits are in memory and reset when a free instance sleeps or restarts.
