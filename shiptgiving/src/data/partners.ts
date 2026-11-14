import type { Partner, Window } from "@/lib/types";

// Real Birmingham nonprofits. Coordinates from OpenStreetMap Nominatim.
// Windows with assumed: true were not published by the partner; the UI should say "call to confirm".

const DAILY = [0, 1, 2, 3, 4, 5, 6];
const WEEKDAYS = [1, 2, 3, 4, 5];

const win = (days: number[], open: string, close: string, assumed = false): Window =>
  assumed ? { days, open, close, assumed } : { days, open, close };

export const partners: Partner[] = [
  {
    id: "firehouse",
    name: "Firehouse Ministries",
    mission:
      "Shelter and a pathway to stability for men experiencing homelessness. Sleeps 215+ men every night and opens its day shelter whenever it drops below 40°F.",
    neighborhood: "Downtown",
    address: "626 2nd Ave N, Birmingham, AL 35203 (side loading dock, call first)",
    location: { lat: 33.5065, lng: -86.8251 },
    receiving: [win(DAILY, "07:00", "18:00")],
    accepts: { newOnly: false, perishables: false, porchPickup: true, refuses: ["used underwear", "used socks", "opened toiletries"] },
    features: ["weatherSurge"],
  },
  {
    id: "jvtf",
    name: "Jones Valley Teaching Farm",
    mission:
      "Teaches Birmingham students through food and farming, and gives away everything it grows to neighbors with little access to fresh food.",
    neighborhood: "Downtown / Smithfield",
    address: "701 25th St N, Birmingham, AL 35203",
    location: { lat: 33.5238, lng: -86.8028 },
    receiving: [win(WEEKDAYS, "09:00", "16:00", true)],
    accepts: { newOnly: true, perishables: true, porchPickup: false, refuses: ["treated lumber", "chemical pesticides"] },
    features: ["perishables"],
  },
  {
    id: "edfarm",
    name: "Ed Farm",
    mission:
      "Closes the digital skills gap by equipping Birmingham students and teachers with technology, training and Student Fellow projects.",
    neighborhood: "Downtown",
    address: "1914 4th Ave N (Forbes Building), Birmingham, AL 35203",
    location: { lat: 33.5167, lng: -86.8087 },
    receiving: [win(WEEKDAYS, "09:00", "17:00", true)],
    accepts: { newOnly: true, perishables: false, porchPickup: true, refuses: ["used electronics", "devices with personal data"] },
    features: ["classroom"],
  },
  {
    id: "promise",
    name: "Birmingham Promise",
    mission:
      "Scholarships, internships and coaching for Birmingham City Schools graduates. The scholarship doesn't cover housing, meals or work clothes, so donors do.",
    neighborhood: "Downtown",
    address: "1500 1st Ave N (Innovation Depot, front desk), Birmingham, AL 35203",
    location: { lat: 33.5121, lng: -86.8126 },
    receiving: [win(WEEKDAYS, "09:00", "17:00", true)],
    accepts: { newOnly: true, perishables: false, porchPickup: true, refuses: ["used bedding"] },
    features: ["dormKits"],
  },
  {
    id: "foodbank",
    name: "Community Food Bank of Central Alabama",
    mission: "Supplies food to pantries, shelters and children's programs across Central Alabama.",
    neighborhood: "Finley",
    address: "107 Walter Davis Dr, Birmingham, AL 35209 (shelf-stable at the lobby)",
    location: { lat: 33.4727, lng: -86.838 },
    receiving: [win(WEEKDAYS, "07:30", "16:00")],
    accepts: { newOnly: true, perishables: true, porchPickup: false, refuses: ["home-canned food", "expired food", "opened packages"] },
    features: ["perishables"],
  },
  {
    id: "jimmiehale",
    name: "Jimmie Hale Mission",
    mission: "Shelter, meals and recovery programs for men in Birmingham.",
    neighborhood: "Woodlawn",
    address: "3420 2nd Ave N, Birmingham, AL 35222",
    location: { lat: 33.525, lng: -86.7863 },
    receiving: [win(DAILY, "08:00", "18:00", true)],
    accepts: { newOnly: true, perishables: false, porchPickup: true, refuses: ["used underwear", "non-washable blankets"] },
    features: ["weatherSurge"],
  },
  {
    id: "pathways",
    name: "Pathways",
    mission: "Shelter, day services and housing for women and children experiencing homelessness.",
    neighborhood: "Downtown",
    // Confidential: the shelter address is never stored. location mirrors the public drop point.
    address: "Confidential shelter address",
    location: { lat: 33.5184, lng: -86.8064 },
    dropPoint: { address: "Public drop point, downtown Birmingham", location: { lat: 33.5184, lng: -86.8064 } },
    receiving: [win(WEEKDAYS, "09:00", "16:00", true)],
    accepts: { newOnly: true, perishables: false, porchPickup: true, refuses: ["used clothing", "opened toiletries"] },
    features: ["confidential"],
  },
  {
    id: "ywca",
    name: "YWCA Central Alabama",
    mission: "Domestic violence shelter, housing and child care for women and families in Central Alabama.",
    neighborhood: "Downtown",
    // Confidential: shelters are at undisclosed locations. Deliveries go to the public admin office.
    address: "Confidential shelter address",
    location: { lat: 33.5186, lng: -86.8028 },
    dropPoint: { address: "YWCA admin office, 309 23rd St N, Birmingham, AL 35203", location: { lat: 33.5186, lng: -86.8028 } },
    receiving: [win(WEEKDAYS, "09:00", "16:00", true)],
    accepts: { newOnly: true, perishables: false, porchPickup: true, refuses: ["used items", "opened toiletries"] },
    features: ["confidential"],
  },
  {
    id: "csm",
    name: "Christian Service Mission",
    mission: "Moves donated food, clothing and supplies to churches and neighbors in need across Birmingham.",
    neighborhood: "Southside / Woodlawn",
    address: "3600 3rd Ave S, Birmingham, AL 35222",
    location: { lat: 33.5205, lng: -86.7806 },
    receiving: [win([1, 2, 3, 4], "08:00", "16:00")],
    accepts: { newOnly: false, perishables: false, porchPickup: true, refuses: ["expired food", "stained clothing"] },
    features: [],
  },
  {
    id: "brotherbryan",
    name: "Brother Bryan Mission",
    mission: "Hot meals, shelter and recovery for men downtown.",
    neighborhood: "Downtown",
    address: "1616 2nd Ave N, Birmingham, AL 35203",
    location: { lat: 33.5134, lng: -86.8108 },
    receiving: [win(DAILY, "09:00", "17:00", true)],
    accepts: { newOnly: true, perishables: true, porchPickup: false, refuses: ["home-cooked food", "opened packages"] },
    features: [],
  },
  {
    id: "lovelady",
    name: "The Lovelady Center",
    mission: "Faith-based recovery and re-entry program for women and their children.",
    neighborhood: "Eastwood",
    address: "7916 2nd Ave S, Birmingham, AL 35206",
    location: { lat: 33.564, lng: -86.7232 },
    receiving: [win([1, 2, 3, 4, 5, 6], "09:00", "17:00", true)],
    accepts: { newOnly: true, perishables: false, porchPickup: true, refuses: ["opened toiletries", "products containing alcohol"] },
    features: [],
  },
];
