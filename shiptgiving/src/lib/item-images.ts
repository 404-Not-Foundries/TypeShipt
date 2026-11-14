// Static snapshot of freely licensed item photos, resolved once (not at runtime). See README "Image credits".
export type ItemImage = { url: string; credit: string };
export const ITEM_IMAGES: Record<string, ItemImage> = {
  "socks-mens": { url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/Hand_knitted_socks.jpg/500px-Hand_knitted_socks.jpg", credit: "Peterdownunder, CC BY-SA 4.0, Wikimedia Commons" },
  "socks-womens": { url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/BLW_Pair_of_socks.jpg/500px-BLW_Pair_of_socks.jpg", credit: "David Jackson, CC BY-SA 2.0 uk, Wikimedia Commons" },
  "dress-shirt": { url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Banana_Republic_Button-Down_Shirt_1_2019-03-21.jpg/500px-Banana_Republic_Button-Down_Shirt_1_2019-03-21.jpg", credit: "FASTILY, CC BY-SA 4.0, Wikimedia Commons" },
  "necktie": { url: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Necktie_by_MASA.jpg", credit: "MASA, CC BY-SA 3.0, Wikimedia Commons" },
  "blanket-twin": { url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/96/Grey_knitted_blanket.jpg/500px-Grey_knitted_blanket.jpg", credit: "Hannah Clover, CC BY-SA 4.0, Wikimedia Commons" },
  "sheets-twin-xl": { url: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/Colorful_Bed_sheets.jpg/500px-Colorful_Bed_sheets.jpg", credit: "Peter Griffin, CC0, Wikimedia Commons" },
};
