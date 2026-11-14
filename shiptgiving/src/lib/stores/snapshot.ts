import type { Store } from "@/lib/types";

// Real store locations from OpenStreetMap (via Nominatim), captured 2026-11-14.
// Used when the live Overpass lookup is slow or down.
const s = (id: string, brand: string, name: string, address: string, lat: number, lng: number): Store => ({
  id,
  brand,
  name,
  address,
  location: { lat, lng },
  source: "osm-snapshot",
});

export const STORE_SNAPSHOT: Store[] = [
  s("publix-southside", "Publix", "Publix Southside", "230 20th St S, Birmingham", 33.51006, -86.80304),
  s("piggly-clairmont", "Piggly Wiggly", "Piggly Wiggly Clairmont", "3314 Clairmont Ave S, Birmingham", 33.51326, -86.78041),
  s("piggly-north", "Piggly Wiggly", "Piggly Wiggly North Birmingham", "2500 29th Ave N, Birmingham", 33.55041, -86.82014),
  s("piggly-east", "Piggly Wiggly", "Piggly Wiggly 1st Ave N", "6501 1st Ave N, Birmingham", 33.54841, -86.74081),
  s("cvs-11th", "CVS", "CVS Pharmacy 11th Ave S", "1431 11th Ave S, Birmingham", 33.49666, -86.80378),
  s("cvs-tuscaloosa", "CVS", "CVS Pharmacy Tuscaloosa Ave", "632 Tuscaloosa Ave, Birmingham", 33.50013, -86.84319),
  s("walgreens-clairmont", "Walgreens", "Walgreens Clairmont", "3020 Clairmont Ave S, Birmingham", 33.51186, -86.78349),
  s("target-brookwood", "Target", "Target Brookwood Village", "531 Brookwood Village, Homewood", 33.46714, -86.77506),
  s("walmart-montclair", "Walmart", "Walmart Supercenter Montclair", "1600 Montclair Rd, Irondale", 33.52914, -86.72021),
  s("aldi-crestwood", "ALDI", "ALDI Crestwood", "7400 Crestwood Blvd, Birmingham", 33.53067, -86.72729),
  s("aldi-greensprings", "ALDI", "ALDI Green Springs", "428 Green Springs Hwy, Homewood", 33.4639, -86.82148),
  s("winndixie-crosshaven", "Winn-Dixie", "Winn-Dixie Crosshaven", "3925 Crosshaven Dr, Birmingham", 33.46301, -86.7301),
  s("wholefoods-280", "Whole Foods Market", "Whole Foods Market 280", "3100 US-280, Birmingham", 33.45996, -86.7526),
];
