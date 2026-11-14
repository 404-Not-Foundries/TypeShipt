// Shipt design tokens for the partner portal (spec: docs/context/shipt-design.md, Part 2).
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const PILL_BUTTON = `inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold disabled:opacity-50 ${FOCUS}`;

export const BTN_PRIMARY = `${PILL_BUTTON} bg-primary text-white hover:bg-primary/85`;
export const BTN_SECONDARY = `${PILL_BUTTON} border border-primary bg-white text-primary hover:bg-surface-muted`;

export const CARD = "rounded-2xl border border-hairline bg-white p-5";
export const WARM_CARD = "rounded-2xl border border-hairline bg-totemeal p-5";
export const HEADING = "text-lg font-bold text-primary";

/** Mint pill for delivery and time signals (tonight, surge window). */
export const PILL_EXPRESS = "inline-flex items-center gap-1 rounded-full bg-express px-2.5 py-0.5 text-xs font-semibold text-express";
export const PILL_MUTED = "inline-flex items-center rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-primary";
/** Red is reserved for Urgent. */
export const PILL_URGENT = "inline-flex items-center rounded-full bg-sale px-2.5 py-0.5 text-xs font-semibold text-white";

export const FIELD = `min-h-11 rounded-xl border border-hairline bg-white px-3 text-sm text-primary ${FOCUS}`;
export const ALERT = "rounded-xl border border-sale bg-white px-3 py-2 text-sm text-sale";
export const SUCCESS = "rounded-xl bg-express px-3 py-2 text-sm font-medium text-express";
