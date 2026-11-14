import { describe, expect, it } from "vitest";
import { formatEta, formatMinutes, isLate, numberStops, routeColor, ROUTE_COLORS } from "./format";

describe("formatMinutes", () => {
  it("formats short, whole-hour and mixed durations", () => {
    expect(formatMinutes(38)).toBe("38 min");
    expect(formatMinutes(120)).toBe("2 h");
    expect(formatMinutes(190)).toBe("3 h 10 m");
    expect(formatMinutes(-4)).toBe("0 min");
  });
});

describe("formatEta", () => {
  it("passes clock times through and tolerates bad input", () => {
    expect(formatEta("14:05")).toBe("14:05");
    expect(formatEta(undefined)).toBe("");
    expect(formatEta("notaTdate")).toBe("notaTdate");
  });
});

describe("routeColor", () => {
  it("wraps around the palette", () => {
    expect(routeColor(ROUTE_COLORS.length)).toBe(ROUTE_COLORS[0]);
  });
});

describe("numberStops", () => {
  it("skips the start stop", () => {
    expect(numberStops([{ kind: "start" }, { kind: "pickup" }, { kind: "dropoff" }])).toEqual([0, 1, 2]);
  });
});

describe("isLate", () => {
  const window = { open: "09:00", close: "17:00" };
  it("flags ETAs outside the receiving window only", () => {
    expect(isLate({ eta: "17:30", window })).toBe(true);
    expect(isLate({ eta: "08:15", window })).toBe(true);
    expect(isLate({ eta: "12:00", window })).toBe(false);
    expect(isLate({ eta: "12:00" })).toBe(false);
    expect(isLate({ eta: "soon", window })).toBe(false);
  });
});
