import { describe, expect, it } from "vitest";
import { catalog } from "@/data/catalog";
import { ITEM_IMAGES } from "./item-images";

describe("ITEM_IMAGES", () => {
  it("has a photo for every catalog item, so a new item can't silently fall back to the icon", () => {
    expect(catalog.map((item) => item.id).filter((id) => !ITEM_IMAGES[id])).toEqual([]);
  });
});
