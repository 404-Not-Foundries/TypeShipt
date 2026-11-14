import type { CatalogItem } from "@/lib/types";

// Estimated unit prices (USD) for common store-brand items. storeIds: [] means any store carries it.

const item = (id: string, name: string, category: string, price: number, perishable = false): CatalogItem =>
  perishable ? { id, name, category, price, storeIds: [], perishable } : { id, name, category, price, storeIds: [] };

export const CATEGORIES = [
  "Clothing",
  "Bedding",
  "Cold weather",
  "Heat relief",
  "Hygiene",
  "Food",
  "Fresh food",
  "Baby & kids",
  "Garden & kitchen",
  "School & tech",
  "Dorm",
] as const;

export const catalog: CatalogItem[] = [
  // Clothing
  item("socks-mens", "Men's crew socks, 6-pack (L/XL)", "Clothing", 9.99),
  item("socks-womens", "Women's crew socks, 6-pack", "Clothing", 8.99),
  item("underwear-mens", "Men's boxer briefs, 5-pack (new)", "Clothing", 14.99),
  item("tshirt-mens", "Men's plain T-shirts, 3-pack", "Clothing", 12.99),
  item("dress-shirt", "Dress shirt (interview wear)", "Clothing", 19.99),
  item("necktie", "Necktie", "Clothing", 9.99),
  // Bedding
  item("blanket-fleece", "Fleece throw blanket", "Bedding", 12.99),
  item("blanket-twin", "Twin washable blanket", "Bedding", 16.99),
  item("sheets-twin-xl", "Twin XL sheet set", "Bedding", 21.99),
  item("pillow", "Bed pillow", "Bedding", 7.99),
  // Cold weather
  item("hand-warmers", "Hand warmers, 10-pack", "Cold weather", 8.49),
  item("knit-hat", "Knit winter hat", "Cold weather", 5.99),
  item("gloves", "Insulated gloves", "Cold weather", 7.99),
  item("thermal-set", "Men's thermal underwear set", "Cold weather", 15.99),
  // Heat relief
  item("water-24", "Bottled water, 24-pack", "Heat relief", 4.99),
  item("electrolyte-drink", "Electrolyte drink, 8-pack", "Heat relief", 7.49),
  item("sunscreen", "Sunscreen SPF 50", "Heat relief", 8.99),
  // Hygiene
  item("soap-bar", "Bar soap, 8-pack", "Hygiene", 6.49),
  item("shampoo", "Shampoo, 12 oz", "Hygiene", 4.49),
  item("deodorant", "Deodorant", "Hygiene", 4.99),
  item("toothbrush-kit", "Toothbrush and toothpaste kit", "Hygiene", 3.99),
  item("razors", "Disposable razors, 10-pack", "Hygiene", 6.99),
  item("feminine-pads", "Feminine pads, 36-count", "Hygiene", 7.99),
  item("hygiene-kit", "Travel hygiene kit", "Hygiene", 9.99),
  // Food (shelf-stable)
  item("breakfast-bars", "Breakfast bars, 12-count", "Food", 5.49),
  item("peanut-butter", "Peanut butter, 16 oz", "Food", 3.29),
  item("canned-vegetables", "Canned vegetables, 4-pack", "Food", 4.29),
  item("canned-chicken", "Canned chicken, 2-pack", "Food", 5.99),
  item("rice-5lb", "Long grain rice, 5 lb", "Food", 4.99),
  item("pasta-sauce", "Pasta and sauce dinner set", "Food", 4.49),
  item("cereal", "Whole grain cereal, family size", "Food", 4.79),
  item("coffee", "Ground coffee, 30 oz", "Food", 10.99),
  // Fresh food (perishable: Shipt same-day only)
  item("fresh-fruit", "Fresh fruit (apples, oranges, bananas), 5 lb", "Fresh food", 7.99, true),
  item("milk-gallon", "Milk, 1 gallon", "Fresh food", 3.89, true),
  item("eggs-dozen", "Eggs, 1 dozen", "Fresh food", 3.49, true),
  item("meal-bundle", "Hot meal bundle (feeds 10)", "Fresh food", 24.99, true),
  // Baby & kids
  item("diapers", "Diapers, size 4, 82-count", "Baby & kids", 24.99),
  item("baby-wipes", "Baby wipes, 3-pack", "Baby & kids", 6.99),
  item("kids-pajamas", "Children's pajama set", "Baby & kids", 11.99),
  // Garden & kitchen
  item("seed-packets", "Vegetable seed packets, 10-pack", "Garden & kitchen", 12.99),
  item("garden-gloves", "Garden gloves, youth size", "Garden & kitchen", 5.99),
  item("hand-trowel", "Hand trowel", "Garden & kitchen", 7.99),
  item("apron", "Kitchen apron", "Garden & kitchen", 9.99),
  // School & tech (new only)
  item("headphones", "Wired classroom headphones", "School & tech", 12.99),
  item("usb-c-charger", "USB-C charger and cable", "School & tech", 14.99),
  item("notebooks", "Spiral notebooks, 6-pack", "School & tech", 6.99),
  // Dorm
  item("dorm-kit", "Dorm move-in kit (sheets, towels, hamper, desk lamp)", "Dorm", 89.99),
  item("towel-set", "Bath towel set", "Dorm", 15.99),
  item("laundry-detergent", "Laundry detergent, 64 loads", "Dorm", 11.99),
];

/** Items Weather Surge raises to urgent on a cold night (low under 40°F). */
export const COLD_KIT_ITEM_IDS = ["blanket-fleece", "blanket-twin", "socks-mens", "hand-warmers", "knit-hat", "gloves", "thermal-set"];
/** Items Weather Surge raises to urgent under a heat advisory. */
export const HEAT_KIT_ITEM_IDS = ["water-24", "electrolyte-drink", "sunscreen"];
