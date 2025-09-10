# Supabase Environment Setup

Follow these steps to configure Supabase for local and production:

## 1) Create a Supabase project
- Go to https://supabase.com and create a new project
- Copy the Project URL and Anon Key
- Generate a Service Role Key (Settings -> API)

## 2) Fill environment variables
Copy one of the templates to `.env` and set real values:

- For local development (CRA uses REACT_APP_ vars at runtime):
```
REACT_APP_SUPABASE_URL=https://<project>.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<anon>
```

- For API routes (server-side on Vercel):
```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role>
```

You can start from `.env.template` or `.env.example` in this repo.

## 3) Apply database schema (optional)
If you are using the included schema, run migrations locally with the Supabase CLI:

- Install CLI: https://supabase.com/docs/guides/cli
- Link project and run migrations from the `supabase/migrations` folder.

## 4) Verify client initialization
- On app load, if Supabase vars are missing, a non-blocking banner appears.
- `src/services/supabase.ts` guards against bad placeholders.
- `src/services/supabaseAdmin.ts` initializes only when server keys are present.

## 5) Deployment notes (Vercel)
- Add the same env vars in Vercel Project Settings -> Environment Variables
- Client: `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`
- Server: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Redeploy after changing vars

## 6) Security
- Never commit real keys to git
- The service role key must only be used on the server

## 7) Troubleshooting
- If you see "Setup Required" banner, check `.env` is loaded and you restarted `npm start`
- Check Network tab for any 401/403 from Supabase and fix RLS policies accordingly
