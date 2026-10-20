# Customer footer and Al Ain guides
This release adds 15 complete Arabic HTML routes: eight service guides, five customer guides, one Al Ain hub and an HTML sitemap. Twelve district links point to named sections of the hub; no thin district permutations or company records are generated.
Source: content/guides.mjs. Homepage footer is checked for equality with the shared generator by tests. Static content pages do not load app.js, so client rendering cannot overwrite their content.
Build: npm run build. Verify: npm test. GitHub Actions runs both.
Staging stays noindex. No production domain change, database connection, payment flow or SEO migration is included. No XML sitemap submission is made.
Removing the global SPA rewrite enables real unknown-route 404 handling for these static pages; existing home hash previews still work. Before production cutover, explicitly restore every required legacy route and validate publication/data contracts, English variants, canonical/hreflang, production indexing and CDN/service-worker behavior.
District spellings follow platform data/localServices.js. Directory presence is not evidence of service coverage.
