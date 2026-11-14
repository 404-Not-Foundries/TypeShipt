import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { EXCERPTS } from "./excerpts";

// Excerpt paths are relative to the app folder (shiptgiving/).
const appFile = (path: string) => fileURLToPath(new URL(`../../../${path}`, import.meta.url));

describe("how-it-works code excerpts", () => {
  it.each(EXCERPTS.map((e) => [e.path, e]))("%s exists and still contains the excerpt", (_, excerpt) => {
    const file = appFile(excerpt.path);
    expect(existsSync(file)).toBe(true);
    const source = readFileSync(file, "utf8");
    for (const line of excerpt.code.split("\n")) expect(source).toContain(line.trim());
  });
});
