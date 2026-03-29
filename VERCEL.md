# Deploying to Vercel

## Fix: "Environment variable not found: DATABASE_URL"

The build script creates a temporary `.env` with a dummy `DATABASE_URL` so `prisma generate` can run. If you still see the error:

1. **Clear build cache and redeploy**  
   Vercel → Project → **Settings** → **General** → scroll to **Build Cache** → **Clear** → Save. Then **Deployments** → **…** on latest → **Redeploy** (check "Clear build cache" if shown).

2. **Confirm the build command**  
   Settings → **General** → **Build & Development Settings** → **Build Command** should be empty (so Vercel uses `npm run build` from package.json) or exactly: `node scripts/build-with-prisma.js && next build`.

3. **Add `DATABASE_URL` for runtime** (so the app connects to your DB after deploy):

1. Open your project on [Vercel](https://vercel.com).
2. Go to **Settings** → **Environment Variables**.
3. Add:
   - **Name:** `DATABASE_URL`
   - **Value:** Your MySQL connection string, e.g.  
     `mysql://USER:PASSWORD@HOST:3306/SMC_DB`
4. Select **Production**, **Preview**, and **Development** (as needed).
5. Save and **redeploy** (Deployments → … → Redeploy).

### MySQL on Vercel

- Use a hosted MySQL service (e.g. PlanetScale, Railway, Aiven) that allows connections from the internet.
- If your DB is behind a VPN or local, Vercel cannot reach it; use a cloud MySQL instance.
- For connection limits with serverless, consider a connection pooler or PlanetScale.

After `DATABASE_URL` is set and you redeploy, the "Environment variable not found" error should be resolved and the app will use your database.
