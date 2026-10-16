# Biet Alreef — guest discovery & native publishing contract

## Experiences and session isolation
- **Public marketplace and platform:** guest-only browsing, no required sign-in, no reused Supabase access/refresh tokens, no first-party cookies and no `localStorage`/ `sessionStorage` account state. The public marketplace does not call privileged RPCs.
- **Provider workspace (Flutter/Android/Apple/Web):** keep the established provider session and verification flow separate from guest browsing. A business link from the public market opens an independent browsing context and never silently replaces the active workspace tab.
- **Native app:** Apple Universal Links and Android App Links must be configured with authenticated deep-link handling inside the existing Flutter repo; the current market-only change does not modify either native app. Never log out the app or share session cookies when a market link opens.
- **Identity source:** Supabase Auth and existing RLS; each account retains its stable identifier. Do not provision duplicate identity or parallel storage just to power discovery.
- **Creation:** eligible users create and edit products, services and offers in the existing provider workspace on Android, iOS and Web. The public market only renders published, market-approved items; approval remains separate from profile visibility and each publishing channel's rules.
- **Guest UI:** no private provider data, customer documents, account subscriptions or write actions. Interactions show public item detail or category navigation only.

## Responsive scene contract
- One semantic scene ID; two independently art-directed media assets: wide for desktop/tablet, portrait for phones. Do not rely on cropping an important object out of a generic wide image.
- Current market demo uses existing SVG artwork as fallback. OpenAI-generated photo concepts require asset approval, optimization and publishing to a cacheable public image CDN before selecting a live `<picture>` source.
- Each item hotspot has a normalized [0..100]% position for **each** art variant, plus a category/type, visible label, accessible description and published-item reference *when one exists*.
- If item has a real active market publication, its public data and live availability should be queried from the existing read-only market source. If not, a category discovery link is safe; **never fabricate price, review, provider, discount or supply**.
- All per-image UI interaction stays on the guest surface (tap to bottom sheet on mobile, modal or side panel on wide screens). Hide/disable hotspot on mismatch or missing publication.
- Use low-motion fallback and minimum 44px touch areas; keep interactive elements keyboard accessible.
- True 3D/VR requires a GLB/3D model and camera controls separate from the 2D photographic scene; CSS perspective is not a VR system.

## Security and indexing
- The current `market-test.bietalreef.ae` worker is static: GET/HEAD only, no cookies, same-origin health probe, no outbound auth. All routes are `noindex,nofollow,noarchive` and robots.txt disallows crawling.
- A green `متصل الآن` indicator means **this public domain responded to a same-origin HEAD probe**. It does not mean a logged-in user, connected WhatsApp or operational AI agent.
- Keep pages isolated from production marketplace, Flutter native routes, Stripe, Google Play/Apple subscriptions and provider account controls.

## Optional AI pricing architecture — no activation in this delivery
- One Workers AI inference service with per-account quotas, supported models, audit and budget ceiling; not a dedicated Worker per paying customer.
- Free visitor discovery does not run paid AI without an explicit use case. Customer AI entitlements must be checked server-side against the existing subscription authority.
- Track input/output tokens/neurons by account and model. Enforce rate limits and monthly caps server-side; do not imply unlimited generation.
- AI illustration concepts and prompt writing are separate from real merchant inventory and should be labelled accordingly.
