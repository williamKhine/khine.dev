# Owner dashboard

Open `/admin` and sign in with GitHub. Reserve a code for the application, then copy the portfolio URL from its saved reservation. The URL uses `https://khine.dev/?code=` and preserves the code's casing. Editing a code changes the URL, so copy it again before embedding it in the PDF.

## Configure Convex and GitHub

1. Run `npx convex dev` to connect the app to a development deployment and set `NEXT_PUBLIC_CONVEX_URL` locally. Set the corresponding production Convex URL in the Next.js hosting environment.
2. Initialize Convex Auth signing keys with `npx @convex-dev/auth`, or configure `JWT_PRIVATE_KEY` and `JWKS` manually. Set `SITE_URL` on each deployment to the matching Next.js origin.
3. Create a GitHub OAuth app for each environment. Set its callback to the deployment's HTTP Actions URL followed by `/api/auth/callback/github`. Set `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` in that Convex deployment.
4. Set `OWNER_GITHUB_ID` in Convex to the numeric GitHub account ID of `williamKhine` (available with `gh api users/williamKhine --jq .id`). The dashboard checks the authenticated GitHub account ID on every reservation operation.

See the [Convex Auth setup guide](https://labs.convex.dev/auth/setup) and [GitHub OAuth configuration](https://labs.convex.dev/auth/config/oauth/github).

## Verify authenticated flows

Use a disposable development deployment. Sign in as William and as a different GitHub account in separate browser sessions. To run the authenticated Playwright tests, use the sessions' Playwright storage state paths as `PLAYWRIGHT_OWNER_STATE` and `PLAYWRIGHT_VISITOR_STATE`. Keep the session files outside the repository. Run `npm test -- tests/admin.spec.ts` with the same development deployment and `http://localhost:3105` as its `SITE_URL`.

Set `PLAYWRIGHT_VERIFY_GITHUB_REDIRECT=1` to also verify that the sign-in button reaches GitHub’s authorization endpoint.

Run `npm run test:convex` for server-side access and reservation tests.
