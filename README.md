# سوق بيت الريف — نموذج تجربة جديد

Fresh development-only marketplace prototype, authored from scratch. No files, components, images, account records or product data were copied from the old marketplace or admin repositories.

## Run

Node.js 20+; no package installation needed.

```sh
npm run build
npm test
```

Cloudflare Pages output: `dist`. Development project: `bietalreef-market-staging`.

## Screens

Home, categories, search and filters, product/service/offer detail templates, business storefront template, and operating model. The default experience contains no listings. Template screens are explicitly marked. Search and location selection are browser-local presentation only. No checkout, admin actions, publishing, API calls, login or persistent user data.

The repository is public. `private: true` in package.json only prevents accidental npm package publication; it does not make GitHub private.

## Boundaries

- Staging HTML, HTTP headers and robots.txt disallow indexing.
- Content Security Policy blocks API/network data connections.
- External business-management links open the existing official provider app; this prototype does not implement its functions.
- Existing production routes, domains, repositories and database permissions have not been changed.
- This is a UX prototype, not a complete replacement for production.

See [operating model](docs/operating-model-ar.md) and [repository map](docs/repository-map.json).
