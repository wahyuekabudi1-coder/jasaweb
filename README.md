# NexStack Studio — Vercel-ready folder structure

This ZIP reorganizes the files from the provided Google Stitch export into a conventional Vercel project layout.

## Structure
- `public/` — static HTML pages and browser JavaScript
- `api/` — Vercel serverless API functions
- `database/` — SQL schema, seed, and migrations
- `vercel.json` — Vercel routes and static output configuration

## Deploy
1. Upload the **contents** of this ZIP to the root of a GitHub repository (do not upload this ZIP as a single file).
2. Import that repository in Vercel.
3. Use Framework Preset `Other`.
4. Use Build Command `npm run build`.
5. Set Output Directory to `public` (this ZIP contains that folder).
6. Add the environment variables required by the API in Vercel Project Settings → Environment Variables.

## Environment variables
At minimum, the consultation API expects:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Only add other variables if the corresponding API code requires them. Never expose service-role or other server secrets in browser JavaScript.

## Important
This reorganizes the provided export; it does not guarantee that all features, database tables, payment integrations, or frontend form wiring are production-ready. Test each page and API after deployment.
