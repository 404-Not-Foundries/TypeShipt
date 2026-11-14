# ShiptGiving

Birmingham nonprofits post what they need, like a wishlist. Anyone can fill a need in a few taps:

- **Shipt delivers:** an ordinary Shipt gift order addressed to the nonprofit.
- **I'll drive it:** volunteer delivery, no fee.
- **Porch pickup:** a driver collects new items from your porch.

A route optimizer batches every pledge into the fewest, shortest trips, inside each nonprofit's receiving hours.

Built at SHIPT Hacks 2026 ("Build a Better Birmingham") by team 404 Not Foundries. The full spec is in [`docs/context/project.md`](../docs/context/project.md).

## Run it

```bash
cd shiptgiving
npm install
cp .env.example .env.local   # optional: add ANTHROPIC_API_KEY, Kroger keys
npm run dev                   # http://localhost:3000
npm test                      # unit tests
```

Open three windows to see the live demo: **Give** (`/`), **Partner** (`/partner`), **Driver** (`/driver`). They sync every 2 seconds.

## Public data and APIs

| Source | Used for | Key? |
|---|---|---|
| OpenStreetMap (Overpass, Nominatim snapshot) | Real Birmingham grocery and pharmacy locations (Publix, Piggly Wiggly, Target, Walmart, ALDI, CVS, Walgreens, Winn-Dixie, Whole Foods) used as pickup points | No |
| Open Food Facts | Product names, brands and photos | No |
| Kroger Developer API | Live shelf prices (optional) | Free account |
| OSRM public server | Drive times and route lines | No |
| National Weather Service (api.weather.gov) | Cold or heat surge for shelters | No |
| Claude (Anthropic) | Turning a nonprofit's plain-text need into catalog items | Yes (fallback without it) |

Shipt has no public consumer API, so the "Send via Shipt" step is a mock of Shipt's existing gift-order checkout. No real payments happen.

## API

`GET /api/state` · `POST /api/pledges` · `PATCH /api/pledges/[id]` · `GET /api/stores?lat=&lng=` · `GET /api/products?q=` (more in the spec).
