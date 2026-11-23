# Owner dashboard

Open `/admin` and sign in with GitHub. Reserve a code for the application, then copy the portfolio URL from its saved reservation. The URL uses `https://khine.dev/?code=` and preserves the code's casing. After embedding the URL, upload the PDF (up to 2 MB) and publish the version. Editing a reservation’s code clears any attached PDF. Archive a version to remove its link from the sharing controls while keeping it available to recipients. Revocation permanently retires the code and ends access on future requests.

Use **Projects** to draft and preview Case Study Markdown, publish or unpublish the Project, and reorder the homepage. Set the stable URL slug when creating the draft. Markdown supports links and images.

## Configure Convex and GitHub

1. Run `npx convex dev` to connect the app to a development deployment and set `NEXT_PUBLIC_CONVEX_URL` locally. Set the corresponding production Convex URL in the Next.js hosting environment.
2. Initialize Convex Auth signing keys with `npx @convex-dev/auth`, or configure `JWT_PRIVATE_KEY` and `JWKS` manually. Set `SITE_URL` on each deployment to the matching Next.js origin.
3. Create a GitHub OAuth app for each environment. Set its callback to the deployment's HTTP Actions URL followed by `/api/auth/callback/github`. Set `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` in that Convex deployment.
4. Set `OWNER_GITHUB_ID` in Convex to the numeric GitHub account ID of `williamKhine` (available with `gh api users/williamKhine --jq .id`). The dashboard checks the authenticated GitHub account ID on every protected dashboard operation.

See the [Convex Auth setup guide](https://labs.convex.dev/auth/setup) and [GitHub OAuth configuration](https://labs.convex.dev/auth/config/oauth/github).

## Production deployment

Link the repository to the intended Vercel project and connect `khine.dev`. Use `npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL` as the Vercel production build command and set the production `CONVEX_DEPLOY_KEY` in Vercel. Configure Convex Auth in the production deployment with `SITE_URL=https://khine.dev` and the production GitHub callback.

Next.js derives the Convex HTTP Actions hostname from the deployment URL. Set `CONVEX_SITE_URL` on the Next.js server when using a local deployment or a custom HTTP Actions hostname.

Set `RESUME_PROXY_SECRET` to the same random secret in Next.js and Convex (for example, generate one with `openssl rand -hex 32`). This is a server-only variable. It restricts the Convex PDF action to the Next.js endpoint, where Vercel supplies the request address for rate limiting. After 30 invalid lookups in a minute, that address receives HTTP 429 for the rest of the window. Local runs use a single shared bucket.

## Verify authenticated flows

Use a disposable development deployment. Sign in as William and as a different GitHub account in separate browser sessions. To run the authenticated Playwright tests, use the sessions' Playwright storage state paths as `PLAYWRIGHT_OWNER_STATE` and `PLAYWRIGHT_VISITOR_STATE`. Keep the session files outside the repository. Run `npm test -- tests/admin.spec.ts` with the same development deployment and `http://localhost:3105` as its `SITE_URL`.

Set `PLAYWRIGHT_VERIFY_GITHUB_REDIRECT=1` to also verify that the sign-in button reaches GitHub’s authorization endpoint.

Run `npm run test:convex` for server-side access and reservation tests.
