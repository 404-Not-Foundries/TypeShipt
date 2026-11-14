import type { Need, Urgency } from "@/lib/types";

// Demo day: Saturday 2026-11-14, Birmingham (CT). Seeded progress is already delivered and
// confirmed (qtyPledged === qtyReceived), so it never implies a pledge that isn't in the store.

const DAY = "2026-11-14";
const at = (hhmm: string, day = DAY) => `${day}T${hhmm}:00-06:00`;
const TONIGHT = at("18:00");
const MONDAY = at("16:00", "2026-11-16");
const THANKSGIVING_WEEK = at("16:00", "2026-11-23");

type Extra = { got?: number; urgency?: Urgency; deadline?: string; created?: string };

const need = (id: string, partnerId: string, itemId: string, title: string, qtyNeeded: number, extra: Extra = {}): Need => ({
  id,
  partnerId,
  itemId,
  title,
  qtyNeeded,
  qtyPledged: extra.got ?? 0,
  qtyReceived: extra.got ?? 0,
  urgency: extra.urgency ?? "normal",
  ...(extra.deadline ? { deadline: extra.deadline } : {}),
  createdAt: at(extra.created ?? "08:00"),
});

export const needs: Need[] = [
  // Firehouse Ministries (weatherSurge)
  need("n-fh-socks", "firehouse", "socks-mens", "Men's socks (L/XL)", 40, { urgency: "high", deadline: TONIGHT, created: "07:15" }),
  need("n-fh-blankets", "firehouse", "blanket-fleece", "Blankets", 20, { deadline: TONIGHT, created: "07:15" }),
  need("n-fh-warmers", "firehouse", "hand-warmers", "Hand warmers", 30, { created: "07:20" }),
  need("n-fh-underwear", "firehouse", "underwear-mens", "New men's underwear", 25, { got: 8, urgency: "high" }),
  need("n-fh-water", "firehouse", "water-24", "Bottled water", 15, { got: 6 }),
  need("n-fh-deodorant", "firehouse", "deodorant", "Deodorant", 60, { got: 22 }),

  // Jimmie Hale Mission (weatherSurge)
  need("n-jh-bars", "jimmiehale", "breakfast-bars", "Breakfast bars", 30, { got: 12 }),
  need("n-jh-blankets", "jimmiehale", "blanket-twin", "Twin washable blankets", 24, { urgency: "high", deadline: TONIGHT }),
  need("n-jh-hats", "jimmiehale", "knit-hat", "Winter hats", 35, { got: 10 }),
  need("n-jh-gloves", "jimmiehale", "gloves", "Gloves", 35),

  // Brother Bryan Mission
  need("n-bb-meals", "brotherbryan", "meal-bundle", "Feed 40 men tonight", 4, { urgency: "urgent", deadline: at("16:30"), created: "09:00" }),
  need("n-bb-coffee", "brotherbryan", "coffee", "Coffee for the breakfast line", 6, { got: 2 }),
  need("n-bb-razors", "brotherbryan", "razors", "Razors", 20),

  // Pathways (confidential)
  need("n-pw-diapers", "pathways", "diapers", "Diapers (size 4)", 12, { urgency: "high", got: 3 }),
  need("n-pw-pajamas", "pathways", "kids-pajamas", "Children's pajamas", 18),
  need("n-pw-hygiene", "pathways", "hygiene-kit", "Hygiene kits for new arrivals", 25, { got: 9 }),

  // YWCA Central Alabama (confidential)
  need("n-yw-pads", "ywca", "feminine-pads", "Feminine pads", 30, { urgency: "high", got: 11 }),
  need("n-yw-shampoo", "ywca", "shampoo", "Shampoo", 40, { got: 15 }),
  need("n-yw-toothbrush", "ywca", "toothbrush-kit", "Toothbrush kits", 50),

  // Community Food Bank of Central Alabama (perishables)
  need("n-fb-peanut-butter", "foodbank", "peanut-butter", "Peanut butter", 120, { got: 48, deadline: THANKSGIVING_WEEK }),
  need("n-fb-vegetables", "foodbank", "canned-vegetables", "Canned vegetables", 100, { got: 35, deadline: THANKSGIVING_WEEK }),
  need("n-fb-milk", "foodbank", "milk-gallon", "Milk for the weekend backpack program", 30, { urgency: "high", deadline: MONDAY }),

  // Jones Valley Teaching Farm (perishables)
  need("n-jv-seeds", "jvtf", "seed-packets", "Winter vegetable seeds", 15, { got: 4 }),
  need("n-jv-gloves", "jvtf", "garden-gloves", "Youth garden gloves", 30),
  need("n-jv-aprons", "jvtf", "apron", "Aprons for the teaching kitchen", 20, { got: 7 }),

  // Ed Farm (classroom, new only)
  need("n-ef-headphones", "edfarm", "headphones", "Classroom headphones (teacher wishlist)", 28, { got: 10 }),
  need("n-ef-chargers", "edfarm", "usb-c-charger", "USB-C chargers for Student Fellows", 12),
  need("n-ef-chromebooks", "edfarm", "chromebook", "Chromebooks for a classroom set (new only)", 6, { got: 1 }),

  // Birmingham Promise (dormKits)
  need("n-bp-dorm-kits", "promise", "dorm-kit", "Dorm move-in kits for spring scholars", 10, { got: 3, deadline: at("17:00", "2026-12-18") }),
  need("n-bp-shirts", "promise", "dress-shirt", "Suit up a student: dress shirts (M/L)", 20, { got: 5 }),
  need("n-bp-ties", "promise", "necktie", "Suit up a student: ties", 20),

  // Christian Service Mission
  need("n-cs-rice", "csm", "rice-5lb", "Rice for pantry boxes", 60, { got: 20 }),
  need("n-cs-pasta", "csm", "pasta-sauce", "Pasta dinner sets", 45),

  // The Lovelady Center
  need("n-ll-hygiene", "lovelady", "hygiene-kit", "Hygiene kits", 50, { got: 18 }),
  need("n-ll-socks", "lovelady", "socks-womens", "Women's socks", 40),
];
