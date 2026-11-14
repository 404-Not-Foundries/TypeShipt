# Shipt mentor feedback (2026-11-14)

> Read `docs/context/project.md` first. This note adds guidance; it does not replace the spec.
> Changes to routing (`src/lib/routing/`, `/api/route-plan`, driver view) are `@rmaytr`'s call.

## What the mentor said
1. **Make the demo user-centric and simpler.** Don't build a general-purpose routing engine with lots of tunable parameters. Show a concrete scenario judges can follow.
2. **Priority stays the same as ours:** the donor app and the nonprofit portal UIs come first. Route optimization is a stretch feature.
3. **How Shipt does it today:** drivers enter their car's VIN at signup. Shipt works out how much the vehicle can carry and buckets the driver into a route size: **S / M / L / XL**, from a Mini Cooper up to a school bus (people really do drive school buses).
4. **Plan routes from the drivers available on a given day**, not in the abstract. The demo line to aim for: *"Tomorrow we have 2 school buses and a convertible, so we generated 2 XL routes and 1 small route."*
5. **Fulfillment:** the mentor liked us having our own volunteer/driver fulfillment, not only Shipt drivers. Shipt also has a **platform API** where partners (e.g., Best Buy) push orders straight into Shipt to be fulfilled. Our "Shipt delivers" option could work the same way: mention it in the pitch and mock it in the demo (a "Send via Shipt" handoff).

## If we have time for routing: the simplest version that matches this
- A driver has a vehicle size `"S" | "M" | "L" | "XL"` with a capacity in item units. Use round numbers (suggested S=10, M=25, L=50, XL=150; these are our assumptions, not Shipt's). Mock the VIN lookup: the user picks a vehicle type and the app assigns the size.
- Input: today's available drivers (vehicle sizes and start points) plus open pledges.
- Output: one route per driver, each within its capacity, using the existing pickup-before-dropoff and receiving-window routing for the stops inside each route.
- Demo control: a **"Tomorrow's drivers"** panel to add or remove vehicles (e.g., 2 buses + 1 convertible). The routes regenerate, with a summary like "2 XL routes + 1 S route, 94 items, 38 min total vs 3h 10m as separate trips."
- Keep it greedy and explainable: fill the biggest vehicles first by area and window, then route each one. No VRP solver.

## Don't
- Don't let routing delay the donor feed, the fill-a-need sheet, or the partner portal.
- Don't edit files outside your owned folders (see Owners in `project.md`). Ask on the board.
