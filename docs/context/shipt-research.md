# Shipt + SHIPT Hacks research

> Researched 2026-11-13, the night before the event. Sources are linked inline.
> **Legend:** ✅ confirmed by a primary or reputable source · 📰 reported (trade press, LinkedIn reposts, job boards) · 🔮 our inference or prediction.
> Once the real prompt is announced, `docs/context/project.md` wins over anything here.

---

## TL;DR

- **Shipt** is Target's same-day delivery marketplace. It is headquartered in Birmingham, AL, has about 120 retail partners and around 300,000 independent shoppers, and is available to 80% of the U.S. population. It also runs Target's next-day parcel delivery (TLMD). ✅
- **Its 2026 story is AI and agentic shopping.** Ask Shipt builds carts from text or photos (Sep 2026). Shipt shopping launched inside ChatGPT and Claude (Aug 2026). Sponsored Substitutions came out of its Innovation Lab (Mar 2026). A summer intern built an AI out-of-stock substitution tool. ✅
- **New CEO:** Raj Kapoor, effective Oct 18, 2026. He was Shipt's COO from 2022 to 2025 and then worked at Target. ✅
- **SHIPT Hacks** is Shipt's *first-ever* external hackathon, and registration runs through Shipt's careers site. ✅ It is reported as an in-person, one-day event for CS students and recent grads at Shipt HQ on Sat Nov 14, 2026. 📰 We found **no public tracks, prizes, judging criteria, APIs, or UAB affiliation.**
- **How Shipt judges internally:** each idea needs a business case, a short timed pitch to leaders, and a path to production fast. A proof of concept alone is not enough. ✅
- **Best bets** 🔮: (1) AI or agentic shopping, (2) substitutions and out-of-stocks, (3) shopper (gig worker) tools, (4) routing, batching and ETA, (5) retail media and retailer tools, (6) Birmingham and food access.
- **Our default pick if the prompt is open-ended** 🔮: an AI substitution copilot that connects the member, the shopper and the brand in one live demo (see [Track 2](#track-2-substitutions--out-of-stocks)). It hits Shipt's current AI story, a real pain point, and a retail-media revenue angle in a single demo.

---

## 1. Company basics

| Fact | Detail | Source |
|---|---|---|
| What it is | Same-day delivery marketplace from 120+ retailers. Also runs Target Last Mile Delivery (TLMD) for Target's next-day parcels. ✅ | [Shipt newsroom boilerplate](https://corporate.shipt.com/news/shipt-partners-with-wakefern-food-corp-to-bring-same-day-grocery-delivery-across-the-northeast) |
| Ownership | Target acquired it in 2017. It is now an "independently operated subsidiary of Target Corp." ✅ | [Grocery Dive](https://www.grocerydive.com/news/shipt-names-ceo-raj-kapoor-target/832478/), [newsroom](https://corporate.shipt.com/news/meet-ask-shipt-shipt-s-new-ai-shopping-assistant) |
| HQ | Birmingham, AL. Its 2018 expansion promised 881 jobs. ✅ | [AL Governor's office, 2018](https://governor.alabama.gov/press-releases/governor-ivey-announces-birminghams-shipt-to-create-881-jobs-in-major-expansion/) |
| Reach | "Available to 80% of the U.S. population". Not in Alaska, Wyoming, or West Virginia. ✅ | [newsroom](https://corporate.shipt.com/news/shipt-advances-agentic-shopping-with-new-ai-experiences-in-chatgpt-and-claude), [corporate.shipt.com](https://corporate.shipt.com/) |
| Shoppers | About 300,000 independent contractors, roughly half of Instacart's ~600,000. 📰 | [Modern Retail, Sep 2026](https://www.modernretail.co/technology/big-box-briefing-target-owned-delivery-app-shipt-makes-ai-push-mirroring-instacart/) |
| Retailers | "More than 120 retailers" (boilerplate). Some quotes say 100+. ✅ | [newsroom](https://corporate.shipt.com/news/meet-ask-shipt-shipt-s-new-ai-shopping-assistant) |
| Membership | Unlimited same-day delivery on orders over $35. $99/yr regular price (an April 2026 promo was $69). Orders under $35 pay a $7 fee. A monthly plan also exists. ✅ | [$69 promo](https://corporate.shipt.com/news/shipt-offering-$69-membership-deal-ahead-of-exclusive-member-savings-event), [Ask Shipt fine print](https://corporate.shipt.com/news/meet-ask-shipt-shipt-s-new-ai-shopping-assistant), [Grocery Dive](https://www.grocerydive.com/news/shipt-expands-grocery-partnerships/833516/) |
| Target tie-in | Since May 2025, Target Circle 360 members get same-day delivery from Shipt's 100+ retailers with no markups. Circle 360 costs $99/yr, or $49 for Target cardholders. ✅ | [Target press release](https://corporate.target.com/press/release/2025/05/target-circle-360-members-can-now-get-same-day-delivery-from-100-plus-retailers-with-no-markups) |

### Leadership (late 2026)
- **CEO: Raj Kapoor**, effective Oct 18, 2026. He was COO from 2022 to 2025, then Target SVP of marketplace. He replaces Kamau Witherspoon, who was CEO for more than four years. ✅ [Grocery Dive](https://www.grocerydive.com/news/shipt-names-ceo-raj-kapoor-target/832478/), [Chain Store Age](https://chainstoreage.com/shipt-taps-former-coo-who-target-exec-ceo)
- **Chief Technology & Product Officer: Smrutha Ipparthi.** **Chief Growth & Strategy Officer: Katie Stratton.** Her organization includes Shipt Media, and she is the public face of Ask Shipt. **COO: Chris Falk.** ✅ [Leadership page](https://corporate.shipt.com/leadership) (this page still lists Witherspoon, so it is stale)
- In 2023 the CTO was Mike Calvo, who championed internal hackathons. ✅ [Shipt news, 2023](https://corporate.shipt.com/news/how-hackathons-are-driving-collaboration-and-innovation-at-shipt)
- Founder Bill Smith left and was succeeded by Kelly Caruso (date not confirmed in our sources). 📰 [AndNowUKnow](https://www.andnowuknow.com/node/62069)

### Recent news, 2024–2026 (newest first)
| Date | What | Source |
|---|---|---|
| Oct 21, 2026 | Sally Beauty added to the marketplace ✅ | [Shipt newsroom headline](https://corporate.shipt.com/news) |
| Oct 16, 2026 | **Wakefern** partnership: 350+ Northeast stores across 8 banners, including ShopRite, The Fresh Grocer, and Price Rite ✅ | [Shipt](https://corporate.shipt.com/news/shipt-partners-with-wakefern-food-corp-to-bring-same-day-grocery-delivery-across-the-northeast) |
| Oct 13, 2026 | **Sprouts Farmers Market** partnership covering 500+ stores ✅ | [Grocery Dive](https://www.grocerydive.com/news/shipt-expands-grocery-partnerships/833516/) |
| Oct 7, 2026 | Raj Kapoor named CEO ✅ | [Grocery Dive](https://www.grocerydive.com/news/shipt-names-ceo-raj-kapoor-target/832478/) |
| Sep 28, 2026 | "It's Nice to Be From Birmingham": a hometown-roots campaign ✅ (headline only) | [Shipt news](https://corporate.shipt.com/news/deepening-our-hometown-roots-in-birmingham) |
| Sep 9, 2026 | **Ask Shipt** AI cart builder launched, the same day as Instacart's assistant ✅ | [Shipt](https://corporate.shipt.com/news/meet-ask-shipt-shipt-s-new-ai-shopping-assistant), [eMarketer](https://www.emarketer.com/content/instacart-shipt-ai-grocery-shopping-assistants) |
| Aug 18, 2026 | **Shipt in ChatGPT and Claude** (agentic shopping; checkout hands off to Shipt) ✅ | [Shipt](https://corporate.shipt.com/news/shipt-advances-agentic-shopping-with-new-ai-experiences-in-chatgpt-and-claude) |
| Aug 12, 2026 | 2026 intern showcase: 20 interns. One capstone was an **AI out-of-stock substitution tool** ✅ | [Shipt](https://corporate.shipt.com/news/2026-summer-intern-program) |
| Jul 28, 2026 | DSW partnership for same-day footwear ✅ | [Shipt](https://corporate.shipt.com/news/shipt-and-dsw) |
| Jun 4, 2026 | **Shipt Kits**: one-click curated bundles ("game day" and similar) 📰 | [syndicated release](https://lifestyle.kbew98country.com/story/259464/shipt-kits-announcing-the-game-day-mvp-for-one-click-cart-building-and-stress-free-entertaining/) |
| Mar 2026 | **Sponsored Substitutions** unveiled at Shoptalk, built by the Innovation Lab ✅ | [Shipt](https://corporate.shipt.com/news/shipt-unveils-sponsored-substitutions) |
| Jan 2026 | Shipt Media launches **search conquesting**: brands can bid on competitors' keywords 📰 | [Minimart newsletter](https://minimart.beehiiv.com/p/minimart-1-22-retail-media-fun-facts-shipt-launches-conquesting-and-more) |
| Jan 2026 | Alabama **portable benefits** for shoppers via Stride: 4% of pre-tip earnings, starting in 2026 ✅ | [Shipt](https://corporate.shipt.com/news/empowering-flexible-work-in-alabama-shipt-to-launch-first-portable-benefits-program-in-home-state), [PR Newswire](https://www.prnewswire.com/news-releases/shipt-to-launch-alabamas-first-portable-benefits-program-for-shoppers-302532613.html) |
| 2025–2026 | **TLMD Direct**: Shipt drivers pick up Target parcels from stores. Goal is 100+ stores in 50 markets by end of 2026 ✅ | [Shipt](https://corporate.shipt.com/news/target-fuels-next-day-delivery-expansion-with-shipt), [Supply Chain Dive](https://www.supplychaindive.com/news/target-shipt-next-day-delivery-2026-expansion/816986) |
| May 2025 | No-markup marketplace for Target Circle 360 ✅ | [Target](https://corporate.target.com/press/release/2025/05/target-circle-360-members-can-now-get-same-day-delivery-from-100-plus-retailers-with-no-markups) |
| ~2024 | Layoffs of about 3.5% of filled positions; Shipt also asked to end its Alabama jobs-incentive deal 📰 (exact date not verified) | [Grocery Dive](https://www.grocerydive.com/news/shipt-layoffs-online-grocery-sales/697901/) |
| Jan 2024 | **Innovation Lab** launched to explore new delivery and shopping experiences, including drones and virtual experiences ✅ | [Shipt](https://corporate.shipt.com/news/shipt-unveils-innovation-lab-to-elevate-focus-on-the-future-of-delivery-experience), [Retail TouchPoints](https://www.retailtouchpoints.com/news/drones-and-virtual-experiences-shipt-launches-innovation-lab-to-explore-deliverys-frontier/140259/) |

**What it means for us** 🔮: leadership is signalling AI, the marketplace and partner growth, retail media, and Birmingham pride. A new CEO who came from operations and marketplace roles is likely to value ideas that improve operational efficiency and partner economics, not only consumer polish.

---

## 2. Products and personas

### The three-sided marketplace
Shipt describes itself as a **three-sided marketplace** of members, shoppers and retailers. Shipt's Director of Market Optimization presented on this at Northwestern in 2023. ✅ [NUTC slides (PDF)](https://transportation.tech.northwestern.edu/docs/2023/20230426_workshop-shipt.pdf). Add brands and advertisers through Shipt Media and there are effectively four sides. 🔮

| Product | What it does | Source |
|---|---|---|
| **Member app / Shipt.com** | Pick a retailer, build a cart, and get same-day delivery. Includes **Ask Shipt** (text or photo to cart), **Shipt Kits** (bundles), **Shared Lists** (marked "coming soon"), and **Preferred Shopper** (favorite a 5-star shopper so they're more likely to get your future orders). ✅ | [Ask Shipt](https://corporate.shipt.com/news/meet-ask-shipt-shipt-s-new-ai-shopping-assistant) |
| **Agentic surfaces** | Shipt in ChatGPT (plugin directory) and Claude (Connectors). Users sign in to get past purchases and preferences, then check out in Shipt. ✅ | [Shipt](https://corporate.shipt.com/news/shipt-advances-agentic-shopping-with-new-ai-experiences-in-chatgpt-and-claude) |
| **Shopper app** ("Shipt: Shopper and Driver") | Independent contractors claim orders, shop in store, and deliver. Also used for TLMD parcel driving. 📰 | [App listing](https://appgoblin.info/apps/com.shipt.shopper) |
| **Shipt Media** (retail media network) | Ads in search and in Ask Shipt results, search conquesting, and Sponsored Substitutions. Rebranded from the older ad network in Sep 2023. ✅ | [Welcome Shipt Media](https://corporate.shipt.com/news/welcome-shipt-media), [Sponsored Subs](https://corporate.shipt.com/news/shipt-unveils-sponsored-substitutions), [Modern Retail](https://www.modernretail.co/technology/big-box-briefing-target-owned-delivery-app-shipt-makes-ai-push-mirroring-instacart/) |
| **Retailer partnership** | Retailers join the marketplace; examples include Wakefern, Sprouts, CVS, Lowe's, PetSmart and Hy-Vee. ✅ Shipt also ran **LadderUp**, an accelerator for small retailers. ✅ | [Target release](https://corporate.target.com/press/release/2025/05/target-circle-360-members-can-now-get-same-day-delivery-from-100-plus-retailers-with-no-markups), [Business Alabama](https://businessalabama.com/shipt-selects-10-retailers-for-inaugural-ladderup-program/) |
| **TLMD / TLMD Direct** | Next-day Target parcels delivered by Shipt drivers from sortation centers or directly from stores. ✅ | [Shipt](https://corporate.shipt.com/news/target-fuels-next-day-delivery-expansion-with-shipt) |

### Pain points by persona
Sourced where possible; 🔮 marks lines that are our reasoning.

**Members (customers)**
- Out-of-stocks and bad substitutions. Shipt built Sponsored Substitutions and an intern AI substitution tool around this, which tells you it matters. ✅ [Sponsored Subs](https://corporate.shipt.com/news/shipt-unveils-sponsored-substitutions), [Interns](https://corporate.shipt.com/news/2026-summer-intern-program)
- Building a cart is slow, which is the reason Ask Shipt, Kits and Shared Lists exist. ✅ [Ask Shipt](https://corporate.shipt.com/news/meet-ask-shipt-shipt-s-new-ai-shopping-assistant)
- Price and fee anxiety: markups, the $7 small-order fee, and service fees. Target's "no markups" perk targets exactly this. ✅ [Target](https://corporate.target.com/press/release/2025/05/target-circle-360-members-can-now-get-same-day-delivery-from-100-plus-retailers-with-no-markups)
- Coordinating a household: who adds what to the list, and dietary constraints. 🔮 Shared Lists being "coming soon" hints that this gap is still open.

**Shoppers (gig workers)**
- Pay transparency. The 2020 move to the "V2" pay algorithm caused protests, and an analysis claimed 41% of shoppers saw effective pay cuts. 📰 [Coworker.org](https://home.coworker.org/data-shows-shipts-black-box-algorithm-reduces-pay-of-40-of-workers/), [Marketplace](https://www.marketplace.org/shows/marketplace-tech/shipt-gig-workers-boycott-new-pay-algorithm/)
- Tipping glitches and tips lost on cancellations. 📰 [The Hill](https://digital-release.thehill.com/?p=513169)
- Flexibility is the main draw: Shipt says over 90% prefer flexibility and 85% work under 10 hours a week. Benefits are thin, which is what portable benefits addresses. ✅ [Shipt](https://corporate.shipt.com/news/empowering-flexible-work-in-alabama-shipt-to-launch-first-portable-benefits-program-in-home-state)
- In store: finding items fast, judging substitutions, contacting the customer mid-shop, and parking or handoff at delivery. 🔮

**Retailers**
- They want online sales without losing their brand or customer relationship (a white-label concern) and need accurate inventory sync. Shipt's own boilerplate admits "price discrepancies may exist based on data delays." ✅ [Target release](https://corporate.target.com/press/release/2025/05/target-circle-360-members-can-now-get-same-day-delivery-from-100-plus-retailers-with-no-markups)
- Onboarding catalogs: images, attributes and substitution rules for thousands of SKUs. 🔮

**Brands / advertisers (Shipt Media)**
- Need measurable ROI, placement inside AI answers, and a way to win the substitution moment. ✅ [Modern Retail](https://www.modernretail.co/technology/big-box-briefing-target-owned-delivery-app-shipt-makes-ai-push-mirroring-instacart/), [Sponsored Subs](https://corporate.shipt.com/news/shipt-unveils-sponsored-substitutions)

**Internal ops**
- Matching supply (shoppers) to demand (orders) across markets, batching, holiday peaks, weather. A 2021 Innovation Days project built a weather-impact tool. ✅ [Innovation Days](https://corporate.shipt.com/news/shipt-innovation-days-an-annual-company-celebration-of-ideas)
- Data and DevOps troubleshooting: a 2026 intern capstone built an AI troubleshooting assistant for data DevOps. ✅ [Interns](https://corporate.shipt.com/news/2026-summer-intern-program)

---

## 3. Tech

**We found no public engineering blog.** StackShare lists none, and shipt.com/technology returns a 404. Most of what follows comes from job postings. 📰

| Area | Evidence |
|---|---|
| Backend | **Go** microservices, with Go plus Python for cart and checkout. 📰 [startup.jobs posting](https://startup.jobs/senior-engineer-cart-checkout-shipt-inc-8521637), [BuiltIn](https://builtin.com/job/backend-engineer/7657531) |
| Search | Go + **Elasticsearch** + **Kafka**. 📰 [Mediabistro posting](https://www.mediabistro.com/jobs/3539787694-senior-search-engineer-go-elasticsearch-kafka-hybrid) |
| Infra | **Kubernetes**, API gateway, service mesh, CDN, multi-cloud, Terraform, Helm, GCP, Prometheus and Grafana. 📰 [Simplify posting](https://simplify.jobs/p/69973ed6-c52a-44b2-9e66-ddbf6cc9ada1/Engineer--Infrastructure-Platforms) |
| CI / mobile | Docker Hub `shipt` org publishes Concourse-style resources (`oci-build-task`, `registry-image-resource`) and a `react-native-nodejs-android-java` image. ✅ [hub.docker.com/u/shipt](https://hub.docker.com/u/shipt). 🔮 This suggests Concourse CI and React Native mobile apps. |
| Optimization / DS | A Principal Data Scientist role in Marketplace Optimization asks for routing, assignment, scheduling and flow, and names **OSRM, Valhalla and GraphHopper**. 📰 [posting](https://www.jofdav.com/jobs/31358863-principal-data-scientist-marketplace-optimization-remote) |
| Release culture | "multiple releases daily". 📰 (quoted from the now-404 [technology page](https://www.shipt.com/technology)) |
| Public APIs | None found for outside developers. The open GitHub org (github.com/shipt) could not be confirmed. 🔮 **Assume no Shipt API.** Use mock data plus public datasets (§6). |

**AI/ML use cases**
- ✅ Public: Ask Shipt (LLM cart builder with text and photo input; brands can pay for placement); ChatGPT and Claude connectors; Sponsored Substitutions ("human-in-the-loop"); the intern AI substitution tool; the intern AI DevOps assistant.
- 🔮 Almost certainly internal: order batching and holding time, shopper assignment, ETA prediction, demand and shopper-supply forecasting, dynamic pay, search ranking and recommendations, fraud (promo abuse, account takeover), and catalog and inventory confidence.

---

## 4. The hackathon itself (SHIPT Hacks)

### ✅ Confirmed (official Shipt pages)
- Shipt's internships page says: "Register for our first-ever hackathon, Shipt Hacks, below!" The hero image alt text describes "Shipt Hacks in yellow and black outline. Red and blue stick[y] notes." [shipt.com/corporate/careers/internships](https://www.shipt.com/corporate/careers/internships)
- Registration goes through Shipt's **Workday** careers site, not Devpost or MLH: [Workday registration page](https://shipt.wd1.myworkdayjobs.com/Shipt_External/page/2a443afeb5fd1001a1e4e8f454920000). It would not load for us, so we could not read its details.

### 📰 Reported (LinkedIn reposts surfaced in search; not on an official page we could read)
- **In-person, one-day** hackathon "designed for computer science students and recent grads".
- **Saturday, November 14, 2026, at Shipt HQ, Birmingham, AL.** "Space is limited." Hashtags #ShiptHacks and #BirminghamAL. (Reposts by Shipt employees, e.g. [LinkedIn profile](https://www.linkedin.com/in/pranay-joshi-/).)

### ❓ Not found anywhere
Tracks or themes, prizes, judging criteria, team-size rules, schedule, sponsors, provided APIs or datasets, and any UAB or university affiliation. No Devpost, MLH or Luma listing exists.

### ✅ How Shipt runs its *internal* hackathons (best proxy for the judging style)
- **Innovation Days** (2021): teams across the company, "centered on a common theme, problem to solve or uncovered opportunity". Every idea needs **"a business case"**: customer value, a pain point solved, or a product improved. Three days to plan, design, build and rehearse, then a **5-minute pitch with a buzzer**, judged by a panel of leaders. Past projects: a weather-impact tool, member–shopper communication, and a grocery shopping video game. Pitch-coaching happy hours were held beforehand. [Shipt, 2021](https://corporate.shipt.com/news/shipt-innovation-days-an-annual-company-celebration-of-ideas)
- **Week-long hackathons** (2023): about 50 ideas get submitted through a Slack integration and voted on. Each hackathon has a **"Northstar"** focus area, for example keeping customers coming back, reducing friction, or improving a business line. Event names are puns ("Curiodyssey", "Turn Up the Volume"). Judges want ideas that are **time-bound, quick to reach production, and easy to iterate on, not just a proof of concept.** Awards go to the concepts that "garner the most excitement". [Shipt, 2023](https://corporate.shipt.com/news/how-hackathons-are-driving-collaboration-and-innovation-at-shipt)
- **2026 intern capstones** ("real-world business challenges"): an AI out-of-stock substitution tool, an AI troubleshooting assistant for data DevOps, the Birmingham Hometown Campaign, a go-to-market plan for Shared Memberships, and financial modeling. [Shipt, Aug 2026](https://corporate.shipt.com/news/2026-summer-intern-program)

### 🔮 What this implies for tomorrow
- It is likely a **single theme or Northstar** announced at kickoff, possibly with a few sub-prompts, rather than an MLH-style list of sponsor tracks.
- Expect judges to be Shipt engineering and product leaders. They will reward a clear business case, a crisp short pitch, and something that **looks shippable inside Shipt's product**, so match Shipt's UI patterns and personas.
- It doubles as a **recruiting event**: it is run by the careers and internships team. Clean code, teamwork, and explaining trade-offs will matter alongside the demo.
- One day means roughly 8–10 build hours, not 24. Scope accordingly.
- **Ask on arrival:** judging rubric, pitch length, whether a deployed URL or slides are required, any provided data or API, rules on AI tools and pre-written code, and team-size limits.

---

## 5. Predicted tracks + project ideas 🔮

Ranked by likelihood. Each idea is sized for 3 people and about 8–10 hours. ⭐ marks the ideas we think would wow a grocery-delivery judge.

### Track 1: AI-powered / agentic shopping
*Why likely:* Ask Shipt and the ChatGPT/Claude connectors are Shipt's flagship 2026 launches, and Shared Lists is publicly "coming soon". ✅ [Ask Shipt](https://corporate.shipt.com/news/meet-ask-shipt-shipt-s-new-ai-shopping-assistant), [agentic](https://corporate.shipt.com/news/shipt-advances-agentic-shopping-with-new-ai-experiences-in-chatgpt-and-claude)
1. ⭐ **Fridge-to-cart.** Snap a photo of your fridge or pantry, plus "5 dinners for 4, one vegetarian, $80". An LLM with vision finds what's missing and builds a cart across a mock catalog, with per-meal recipes and a budget meter. *Demo:* phone photo to a filled cart in 20 seconds.
2. ⭐ **Household Shared List with AI merge.** Several family members add items by voice or text in real time. AI de-duplicates ("milk" plus "2% milk"), checks dietary flags, and turns the list into a one-tap cart. This builds the feature Shipt says is coming soon.
3. **Shipt MCP server.** A small MCP server exposing `search_products`, `build_cart` and `suggest_substitute` over mock data. Demo it live from Claude Desktop. It mirrors Shipt's own Claude connector and shows agent-native thinking.

### Track 2: Substitutions & out-of-stocks
*Why likely:* Sponsored Substitutions (Innovation Lab) plus an intern AI substitution tool in the same year means this is a live problem space. ✅ [Sponsored Subs](https://corporate.shipt.com/news/shipt-unveils-sponsored-substitutions), [Interns](https://corporate.shipt.com/news/2026-summer-intern-program)
1. ⭐ **Substitution Copilot (our default pick).** The shopper scans an out-of-stock item. The model ranks substitutes by similarity (size, brand tier, dietary tags, price delta) and the member's history. The member approves from a push-style card. A brand can bid on the slot, shown as "sponsored" with a relevance floor. *Demo:* a split screen of shopper app, member phone and brand dashboard updating live. It covers four sides of the marketplace in one flow.
2. **Out-of-stock predictor.** Score each cart item's in-stock risk at checkout (mock or Instacart-style data) and pre-collect member preferences for the risky ones ("if no Chobani, then…?").
3. **Substitution preference memory.** Learn from approvals and rejections ("never swap brands on coffee"), then show "why we picked this" explanations.

### Track 3: Shopper (gig-worker) experience
*Why likely:* 300k shoppers are a core side of the marketplace, Shipt is pushing flexibility messaging and portable benefits, and pay has a history of controversy. ✅ [Portable benefits](https://corporate.shipt.com/news/empowering-flexible-work-in-alabama-shipt-to-launch-first-portable-benefits-program-in-home-state), 📰 [Coworker.org](https://home.coworker.org/data-shows-shipts-black-box-algorithm-reduces-pay-of-40-of-workers/)
1. ⭐ **In-store pick-path optimizer.** Given a store layout (mock aisle map) and an order, generate the fastest walking order, with a live checklist and an "ask member" button for ambiguous items. *Demo:* an animated route on a store map showing minutes saved.
2. **Earnings co-pilot.** Shows the shopper an order's estimated $/hour (pay plus tip, minus drive time from routing), the best hours and zones, and progress toward portable-benefit thresholds. This one turns transparency into a feature.
3. **Voice-first hands-free shopping mode.** Read the next item aloud, confirm with "got it", and report "out of stock" with no hands on the phone.

### Track 4: Logistics: batching, routing, ETA
*Why likely:* TLMD Direct is expanding to 100+ stores, Shipt hires for routing and assignment, and Shipt has spoken publicly about its three-sided marketplace. ✅ [TLMD](https://corporate.shipt.com/news/target-fuels-next-day-delivery-expansion-with-shipt), 📰 [DS posting](https://www.jofdav.com/jobs/31358863-principal-data-scientist-marketplace-optimization-remote)
1. ⭐ **Batching simulator for Birmingham.** Generate orders on a map of Birmingham neighborhoods, then compare "deliver one by one" against greedy and OR-Tools batching. Show miles saved, on-time %, and shopper $/hr on a live dashboard. Local geography resonates at HQ.
2. **ETA explainer.** Predict delivery ETA from distance, store busyness, time of day and weather, and tell the member *why* it's late. Proactively notify and offer a credit.
3. **Weather and event surge forecaster.** Predict demand spikes (storms, game days at Protective Stadium) and recommend shopper bonuses by zone. It echoes the 2021 weather-impact project. ✅ [Innovation Days](https://corporate.shipt.com/news/shipt-innovation-days-an-annual-company-celebration-of-ideas)

### Track 5: Retail media & retailer tools
*Why likely:* Shipt Media is a revenue engine (search conquesting, sponsored subs, ads in Ask Shipt, a Google integration), and Shipt keeps onboarding retailers. ✅ [Sponsored Subs](https://corporate.shipt.com/news/shipt-unveils-sponsored-substitutions), 📰 [WebProNews on Google](https://www.webpronews.com/google-expands-commerce-media-suite-with-best-buy-shipt-integrations-in-2026)
1. ⭐ **Ads inside AI answers, done right.** A sandbox where brands bid on Ask Shipt intents ("taco night"), with relevance-gated auctions and clear "sponsored" labels. Show member trust metrics next to ad revenue.
2. **Catalog onboarding AI for new retailers.** Upload a messy CSV or shelf photos and get clean titles, attributes, dietary tags, images, and substitution groups. This is the problem behind onboarding 350 Wakefern stores fast.
3. **Brand insights dashboard.** Substitution win/loss by brand, showing "you lost 1,200 orders to Brand X when out of stock", with a CTA to sponsor.

### Track 6: Birmingham, community & food access
*Why likely:* the hometown-roots campaign (Sep 2026), the HQ location, and student-recruiting goals. ✅ [Shipt news](https://corporate.shipt.com/news/deepening-our-hometown-roots-in-birmingham), [Birmingham Free Press](https://birminghamfreepress.com/2026/10/08/shipt-names-new-ceo-as-birmingham-roots-frame-its-next-chapter/)
1. ⭐ **Food-desert delivery planner.** Overlay the USDA Food Access Research Atlas for Jefferson County with partner stores. Propose group-order drop points and SNAP-friendly baskets, and estimate households reached.
2. **Community pantry restock.** Food banks post needs, neighbors fund them, and Shipt shoppers deliver from the nearest partner store.
3. **Senior-friendly ordering.** Order by phone call or SMS with an AI agent and a caregiver approval loop.

### Wildcards (smaller odds)
- **Developer productivity / internal tools:** an AI on-call or data-pipeline troubleshooting assistant (mirrors the intern capstone). ✅ [Interns](https://corporate.shipt.com/news/2026-summer-intern-program)
- **Membership and retention** ("keep customers coming back" was a past Northstar ✅): churn-risk scoring with personalized win-back offers.
- **Sustainability:** consolidated deliveries and a "green slot" picker that shows CO₂ saved.

### Picking rules for the day 🔮
1. Prefer ideas that **touch at least two sides** of the marketplace (member + shopper, or member + brand). That is Shipt's mental model.
2. Show a **number** in the demo: minutes saved, $ per order, % fewer bad substitutions.
3. Make it look like it **belongs in the Shipt app.** Mobile-first, with Shipt's green palette and a member-facing tone.
4. Use one LLM call where it's magic, not everywhere. Have a canned fallback if the Wi-Fi or API fails.

---

## 6. Public datasets and APIs we can use

These come from general knowledge. Check terms and keys on the day.

| Need | Option | Notes |
|---|---|---|
| Grocery orders and baskets | [Instacart Market Basket Analysis (Kaggle)](https://www.kaggle.com/c/instacart-market-basket-analysis) | 3M+ orders, 200k users, 134 aisles. **Research-use license**, fine for a demo. [loader docs](https://beta-recsys.readthedocs.io/en/stable/_modules/beta_rec/datasets/instacart.html) |
| Product info, ingredients, allergens, images | [Open Food Facts API](https://world.openfoodfacts.org/data) | Free, no key, barcode lookup. Good for substitution similarity and dietary tags. |
| Nutrition | [USDA FoodData Central API](https://fdc.nal.usda.gov/api-guide) | Free API key (instant). |
| Real store products and locations | [Kroger Developer API](https://developer.kroger.com/) | Free developer account; products, locations, prices. OAuth setup takes time, so pre-register tonight if we want it. |
| Routing / matrix / isochrones | [OSRM](https://project-osrm.org/), [OpenRouteService](https://openrouteservice.org/), [GraphHopper](https://www.graphhopper.com/), [Valhalla](https://github.com/valhalla/valhalla) | The same tools Shipt's DS posting names. ORS has a free key. |
| Optimization | [Google OR-Tools](https://developers.google.com/optimization/routing) | Vehicle routing with time windows in about 50 lines of Python. |
| Maps / UI | [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/), or [Mapbox](https://www.mapbox.com/) | Leaflet needs no key. |
| Food access | [USDA Food Access Research Atlas](https://www.ers.usda.gov/data-products/food-access-research-atlas/) | Census-tract food-desert flags for Birmingham. |
| Weather | [Open-Meteo](https://open-meteo.com/) | Free, no key. |
| LLM / vision / agents | Claude API, [MCP](https://modelcontextprotocol.io/) | For Ask-Shipt-style features and an MCP server demo. |
| Fake data | Faker, or LLM-generated catalogs | Seed a mock "Shipt catalog" JSON tonight so we don't burn hours on data tomorrow. |

---

## 7. Pitch cheat sheet 🔮
- Open with the **persona and pain** in one sentence, using Shipt's words: "members", "shoppers", "retail partners", "same-day".
- Name-drop **current Shipt initiatives** we extend: Ask Shipt, Shared Lists (coming soon), Sponsored Substitutions, Preferred Shopper, TLMD Direct.
- Give the **business case:** retention, basket size, shopper $/hr, ad revenue, or cost per delivery.
- Explain the **path to production:** "Built as a Go service plus a React Native screen; plugs into the existing substitution flow." This speaks to their "not just a proof of concept" bar.
- Keep it **under the time limit.** The internal events used a buzzer.
