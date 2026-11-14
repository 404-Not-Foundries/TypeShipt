# Shipt Design Language Context & Claude Design System Prompt

This document captures Shipt's visual design language across its live web experience ([shipt.com](https://www.shipt.com/), [shipt.com/shop](https://www.shipt.com/shop)), official brand guidelines ([Shipt Press Kit 9.2025](https://corporate.shipt.com/getmedia/10073918-ff76-4191-ae79-e861208947c4/Brand-Guidelines.pdf)), and design system history, followed by a ready-to-paste **Design System Prompt** for Claude / Claude Code.

---

## Part 1: Shipt Design Language Context

### 1. Brand Identity & Evolution
* **Core Positioning:** Headquartered in Birmingham, Alabama, Shipt is a Target-owned retail tech company connecting customers, personal shoppers, and local/national retailers for same-day delivery with a "personal touch" ([Shipt Press Kit](https://corporate.shipt.com/getmedia/10073918-ff76-4191-ae79-e861208947c4/Brand-Guidelines.pdf)).
* **Modern Identity (2025–2026 `shipt.com` & Press Kit):** Shipt's current customer-facing web and app experience has evolved beyond its earlier purple-and-green-heavy branding toward a high-contrast, editorial-meets-utility retail aesthetic:
  * **Primary Graphic Foundation:** Crisp White + Near-Black/Charcoal for maximum legibility and bold logo contrast ([Shipt Press Kit](https://corporate.shipt.com/getmedia/10073918-ff76-4191-ae79-e861208947c4/Brand-Guidelines.pdf), [Shipt.com](https://www.shipt.com/)).
  * **Secondary Brand Palette:** **Totemeal** (a warm, inviting off-white/cream canvas inspired by a natural tote bag) and **Target Red** (used for Target synergy, sale pricing, `"Limited-time"` badges, and cart count indicators) ([Shipt Press Kit](https://corporate.shipt.com/getmedia/10073918-ff76-4191-ae79-e861208947c4/Brand-Guidelines.pdf), [Shipt Usability Analysis](https://medium.com/design-bootcamp/shipt-a-usability-and-accessibility-reflection-7741ec08c6b2)).
  * **Cool & Warm Accents:** Cool natural greens and washed sky blues (seen in sage/mint-teal hero banners and light mint-green `"By 11:20 am"` / `"Express delivery"` pills with dark green lightning-bolt icons), plus seasonal warm sunshine yellow and rich pink ([Shipt Press Kit](https://corporate.shipt.com/getmedia/10073918-ff76-4191-ae79-e861208947c4/Brand-Guidelines.pdf), [Shipt.com](https://www.shipt.com/)).
* **Legacy / Brand Heritage Palette:** Earlier Shipt brand systems (2020) centered on deep purple **Haiti** (`#25123A`), **Mountain Meadow** green (`#23CC6B`), and **Yellow Green** (`#BAE581`) ([Mobbin](https://mobbin.com/colors/brand/shipt)). Modern integrations should lead with the crisp white/near-black/Totemeal/mint/Target-red system while optionally using `#23CC6B` or `#25123A` only if matching legacy shopper-app assets.

### 2. Navigation & Information Architecture
* **Sticky Primary Header ([Shipt.com](https://www.shipt.com/)):**
  * Left: Hamburger menu icon + black `"Shipt"` wordmark paired with a black-outlined shopping bag icon.
  * Center: Wide, full-pill search bar (`"What are you looking for?"` globally; `"Search"` inside a store) with a right-aligned magnifying glass icon.
  * Right: `"Deliver to"` label above an underlined ZIP/address selector with a downward triangle dropdown, followed by an outlined pill `"Sign in"` button and solid dark pill `"Sign up"` button (or a top-right cart icon with a stark red circular item-count badge when signed in) ([Shipt.com](https://www.shipt.com/), [Shipt Usability Analysis](https://medium.com/design-bootcamp/shipt-a-usability-and-accessibility-reflection-7741ec08c6b2)).
* **Context-Dependent Sub-Header:**
  * **Marketplace View (`/shop`):** Horizontal category bar directly below the header (`Grocery`, `Alcohol`, `Deals`, `Baby`, `Pets`, `Home Decor`, etc.) ([Shipt Shop](https://www.shipt.com/shop)).
  * **In-Store View:** Store sub-header featuring a rounded-square store logo on the left, a green lightning-bolt delivery window callout (`"Express delivery by 1:20 pm"`) with an info `(i)` icon, a vertical divider, and in-store department links + `"Store pricing"` / `"Store rewards"` ([Shipt Shop](https://www.shipt.com/shop/safeway/landing-page/seasonal/shopdeals)).

### 3. Component & Layout Grammar
* **Radii Hierarchy:**
  * **Full Pills (`9999px`):** Search input, primary/secondary CTA buttons, floating `"Chat"` button, cookie/privacy bar, and status badges (`"Limited-time"`, `"New"`, `"By 11:20 am"`).
  * **Circles (`50%`):** Carousel prev/next navigation arrows and the `+` quick-add-to-cart button on product cards.
  * **Rounded Rectangles (`12px–16px`):** Store logo tiles, product image containers, deals bento cards, testimonial cards, and dark promo banners.
* **Elevation & Borders:** Primarily flat with thin light-gray hairline borders (`1px`). Subtle drop shadows are reserved strictly for floating overlays (carousel navigation arrows, floating `"Chat"` pill, bottom notice bar) ([Shipt.com](https://www.shipt.com/)).
* **Card Patterns:**
  * **Product Card:** Rounded light/white image container with centered product photo and a circular white `+` button (dark outline) anchored at the bottom-right corner; below the image: bold price (near-black regular, or vibrant red sale price + strikethrough gray original price), product title, and muted unit/size metadata (`"1 ct"`, `"5 lb"`).
  * **Store Card:** Rounded-corner logo tile (with optional top-left black `"New"` pill) + store name + either `"No markups"` or a light-mint-green lightning-bolt delivery-time pill (`"By 11:20 am"`).
  * **Deals Bento Grid:** Asymmetric 3-column grid (2 stacked horizontal cards left, 1 tall vertical card center, 2 stacked cards right) inside a hairline-bordered container with bold `"Save $X"` headlines.
* **Typography & Microcopy:** Clean geometric/neo-grotesque sans-serif, heavy/bold display titles, small uppercase eyebrow labels (`"SHOP NOW"`, `"SAVE NOW"`), approachable and savings-focused copy, and high-contrast accessible text ([Shipt.com](https://www.shipt.com/), [Shipt Usability Analysis](https://medium.com/design-bootcamp/shipt-a-usability-and-accessibility-reflection-7741ec08c6b2)). *(Note: Exact computed CSS font-family strings on `shipt.com` were not inspectable due to browser DevTools restrictions; use a clean geometric sans such as `Plus Jakarta Sans`, `DM Sans`, or `Inter` as the web implementation.)*

---

## Part 2: Copy-Pasteable Design System Prompt for Claude

Copy everything inside the block below into your Claude Project Instructions, `CLAUDE.md`, or system prompt:

```markdown
# Design System & UI Integration Spec: Shipt Web & App Aesthetic

You are designing and building an application that must seamlessly integrate with **Shipt's** modern web (`shipt.com`, `shipt.com/shop`) and mobile app design language. Follow these exact visual tokens, layout patterns, component anatomies, and UX principles.

## 1. Visual & Brand Philosophy
- **Aesthetic:** Clean, approachable, high-trust retail utility with warm, human touches. Think crisp white shopping canvases paired with bold near-black typography, warm "Totemeal" off-white surfaces, fresh mint-green speed indicators, and Target-red promotional pops.
- **Hierarchy:** Let product photography, store logos, and clear pricing/delivery-time signals do the work. Keep chrome minimal, flat, and hairline-bordered.

## 2. Color Tokens
*(Core brand colors grounded in Shipt's 2025 Brand Guidelines and live UI; surface hexes are matched to observed live UI values.)*
- **Canvas & Surfaces:**
  - `--bg-primary`: `#FFFFFF` (Crisp white main shopping canvas & header)
  - `--bg-totemeal`: `#F7F4EF` (Warm natural-tote off-white/cream for footer, warm sections, and subtle feature bands)
  - `--bg-surface-muted`: `#F5F5F5` (Soft light gray for search inputs, product image containers, and testimonial/deal containers)
  - `--bg-dark-band`: `#1A1A1A` (Deep charcoal / near-black for membership comparison sections, app download banners, and dark promo blocks)
  - `--bg-hero-sage`: `#D8EAE2` (Soft sage / mint-teal for promotional hero banners)
- **Text & Borders:**
  - `--text-primary`: `#1A1A1A` (Near-black for headings, prices, and primary copy; WCAG AA+ contrast)
  - `--text-secondary`: `#666666` (Muted medium gray for unit sizes like `1 ct` / `5 lb`, subtitles, and strikethrough original prices)
  - `--border-hairline`: `#E5E5E5` (`1px solid` for store cards, category tabs, and bento containers)
  - `--border-active`: `#1A1A1A` (`2px solid` for active store/category tabs)
- **Actions & Semantic Accents:**
  - `--action-primary-bg`: `#1A1A1A` with `#FFFFFF` text (Inverts to `#FFFFFF` border/text on dark backgrounds)
  - `--action-secondary-bg`: `#FFFFFF` with `1px solid #1A1A1A` border and `#1A1A1A` text
  - `--accent-sale-red`: `#CC0000` (Vibrant Target-inspired red for sale prices, `"Limited-time"` badges, and cart item-count circles)
  - `--accent-express-bg`: `#E3F7EC` (Light mint-green pill background for delivery window badges)
  - `--accent-express-text`: `#0B6E3B` (Dark green text & lightning-bolt icon for `"By 11:20 am"` / `"Express delivery"`)
  - `--legacy-brand-purple`: `#25123A` and `--legacy-meadow-green`: `#23CC6B` (Reserve only if referencing legacy Shipt shopper-app elements; do not use as primary background colors in modern customer-facing UI)

## 3. Typography
- **Font Stack:** Clean geometric / neo-grotesque sans-serif: `'Plus Jakarta Sans', 'DM Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`.
- **Scale & Weights:**
  - **Hero / Display:** `32px–44px`, `font-weight: 700–800`, tight line-height (`1.15`), near-black.
  - **Section Headings:** `22px–28px`, `font-weight: 700` (e.g., `"Shop your favorite stores"`, `"Explore weekly deals"`).
  - **Eyebrow Labels:** `11px–12px`, `font-weight: 600`, `text-transform: uppercase`, `letter-spacing: 0.08em` (e.g., `"SHOP NOW"`, `"SAVE NOW"`).
  - **Card Titles / Body:** `14px–16px`, `font-weight: 400–500`, `line-height: 1.4`.
  - **Metadata / Units:** `12px–13px`, `font-weight: 400`, `--text-secondary`.
  - **Buttons & Pills:** `13px–15px`, `font-weight: 600`.

## 4. Shape, Radius & Elevation
- **Border Radii:**
  - **Full Pill (`9999px`):** Search bars, all primary/secondary CTA buttons, status badges (`"Limited-time"`, `"New"`, `"By 11:20 am"`), floating `"Chat"` button.
  - **Circle (`50%`):** Carousel prev/next arrow buttons and `+` quick-add-to-cart buttons.
  - **Cards & Containers (`12px–16px`):** Store tiles, product image containers, bento deal cards, promo banners.
- **Shadows:** Keep UI flat with `1px solid #E5E5E5` hairlines. Reserve subtle elevation (`0 2px 8px rgba(0, 0, 0, 0.12)`) strictly for floating overlays (carousel arrows, floating Chat button, bottom toast/notice bars).

## 5. Core Layout & Component Patterns
1. **Sticky Primary Header (White `#FFFFFF`, `border-bottom: 1px solid #E5E5E5`):**
   - Left: Hamburger menu + wordmark/logo.
   - Center: Full-pill search bar (`#F5F5F5` background, `"What are you looking for?"`, right-aligned magnifying glass).
   - Right: `"Deliver to"` + underlined location/ZIP selector with dropdown caret, plus `"Sign in"` (outlined pill) / `"Sign up"` (solid dark pill) or Cart icon with red circular item-count badge.
2. **Context Sub-Header:**
   - Marketplace view: Horizontal scrollable category links (`Grocery`, `Deals`, etc.).
   - Store/Partner view: Rounded-square partner logo + green lightning-bolt delivery/status pill (`"Express delivery by..."`) + vertical divider + section links.
3. **Product / Item Card:**
   - Square/vertical rounded (`12px`) `#F5F5F5` or `#FFFFFF` image container with centered photo.
   - Bottom-right corner of image container: Circular white `+` button (`32px–36px`, `1px solid #1A1A1A` or subtle shadow) that expands to a `[- 1 +]` quantity stepper when added.
   - Below image: Bold price (red if on sale, followed by gray strikethrough original price), 2-line clamped item title, muted unit/size label.
4. **Store / Partner Tile:**
   - Rounded rectangle (`12px–16px`) with centered brand logo (optional top-left black `"New"` pill).
   - Below tile: Partner name + either `"No markups"` subtext or light-mint-green lightning-bolt timing pill.
5. **Deals / Feature Bento Grid:**
   - Asymmetric 3-column grid inside a `1px solid #E5E5E5` rounded container (2 stacked horizontal cards left, 1 tall vertical card center, 2 stacked cards right) with bold `"Save $X"` or impact headlines.
6. **Horizontal Carousels:**
   - Display 4–6 cards across desktop with circular white floating prev/next arrow buttons on the edges.

## 6. UX, Accessibility & Microcopy Rules
- **Touch & Click Targets:** Minimum `44px × 44px` interactive hit areas on mobile.
- **Tone:** Direct, warm, approachable, and transparent. Use short scannable labels, clear pricing/fee transparency, and upfront availability/substitution states.
- **Accessibility:** Maintain WCAG >= 4.5:1 text contrast, clear focus rings, and explicit labels for dietary, allergen, or eligibility tags.
```
