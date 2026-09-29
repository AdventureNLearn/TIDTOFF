/** Rough frames for fitBounds. Not legal boundaries. */
export type StateFrame = {
  name: string;
  abbr: string;
  s: number;
  w: number;
  n: number;
  e: number;
};

export const STATES: StateFrame[] = [
  { name: "Alabama", abbr: "AL", s: 30.2, w: -88.5, n: 35.0, e: -84.9 },
  { name: "Alaska", abbr: "AK", s: 51.2, w: -179.1, n: 71.4, e: -129.9 },
  { name: "Arizona", abbr: "AZ", s: 31.3, w: -114.8, n: 37.0, e: -109.0 },
  { name: "Arkansas", abbr: "AR", s: 33.0, w: -94.6, n: 36.5, e: -89.6 },
  { name: "California", abbr: "CA", s: 32.5, w: -124.5, n: 42.0, e: -114.1 },
  { name: "Colorado", abbr: "CO", s: 37.0, w: -109.1, n: 41.0, e: -102.0 },
  { name: "Connecticut", abbr: "CT", s: 41.0, w: -73.7, n: 42.1, e: -71.8 },
  { name: "Delaware", abbr: "DE", s: 38.4, w: -75.8, n: 39.8, e: -75.0 },
  { name: "District of Columbia", abbr: "DC", s: 38.79, w: -77.12, n: 39.0, e: -76.9 },
  { name: "Florida", abbr: "FL", s: 24.5, w: -87.6, n: 31.0, e: -80.0 },
  { name: "Georgia", abbr: "GA", s: 30.4, w: -85.6, n: 35.0, e: -80.8 },
  { name: "Hawaii", abbr: "HI", s: 18.9, w: -160.3, n: 22.3, e: -154.8 },
  { name: "Idaho", abbr: "ID", s: 42.0, w: -117.2, n: 49.0, e: -111.0 },
  { name: "Illinois", abbr: "IL", s: 37.0, w: -91.5, n: 42.5, e: -87.5 },
  { name: "Indiana", abbr: "IN", s: 37.8, w: -88.1, n: 41.8, e: -84.8 },
  { name: "Iowa", abbr: "IA", s: 40.4, w: -96.6, n: 43.5, e: -90.1 },
  { name: "Kansas", abbr: "KS", s: 37.0, w: -102.1, n: 40.0, e: -94.6 },
  { name: "Kentucky", abbr: "KY", s: 36.5, w: -89.6, n: 39.1, e: -81.9 },
  { name: "Louisiana", abbr: "LA", s: 28.9, w: -94.0, n: 33.0, e: -89.0 },
  { name: "Maine", abbr: "ME", s: 43.1, w: -71.1, n: 47.5, e: -66.9 },
  { name: "Maryland", abbr: "MD", s: 37.9, w: -79.5, n: 39.7, e: -75.0 },
  { name: "Massachusetts", abbr: "MA", s: 41.2, w: -73.5, n: 42.9, e: -69.9 },
  { name: "Michigan", abbr: "MI", s: 41.7, w: -90.4, n: 48.3, e: -82.4 },
  { name: "Minnesota", abbr: "MN", s: 43.5, w: -97.2, n: 49.4, e: -89.5 },
  { name: "Mississippi", abbr: "MS", s: 30.2, w: -91.7, n: 35.0, e: -88.1 },
  { name: "Missouri", abbr: "MO", s: 36.0, w: -95.8, n: 40.6, e: -89.1 },
  { name: "Montana", abbr: "MT", s: 44.4, w: -116.1, n: 49.0, e: -104.0 },
  { name: "Nebraska", abbr: "NE", s: 40.0, w: -104.1, n: 43.0, e: -95.3 },
  { name: "Nevada", abbr: "NV", s: 35.0, w: -120.0, n: 42.0, e: -114.0 },
  { name: "New Hampshire", abbr: "NH", s: 42.7, w: -72.6, n: 45.3, e: -70.6 },
  { name: "New Jersey", abbr: "NJ", s: 38.9, w: -75.6, n: 41.4, e: -73.9 },
  { name: "New Mexico", abbr: "NM", s: 31.3, w: -109.1, n: 37.0, e: -103.0 },
  { name: "New York", abbr: "NY", s: 40.5, w: -79.8, n: 45.0, e: -71.9 },
  { name: "North Carolina", abbr: "NC", s: 33.8, w: -84.3, n: 36.6, e: -75.5 },
  { name: "North Dakota", abbr: "ND", s: 45.9, w: -104.1, n: 49.0, e: -96.6 },
  { name: "Ohio", abbr: "OH", s: 38.4, w: -84.8, n: 42.0, e: -80.5 },
  { name: "Oklahoma", abbr: "OK", s: 33.6, w: -103.0, n: 37.0, e: -94.4 },
  { name: "Oregon", abbr: "OR", s: 42.0, w: -124.6, n: 46.3, e: -116.5 },
  { name: "Pennsylvania", abbr: "PA", s: 39.7, w: -80.5, n: 42.3, e: -74.7 },
  { name: "Rhode Island", abbr: "RI", s: 41.1, w: -71.9, n: 42.0, e: -71.1 },
  { name: "South Carolina", abbr: "SC", s: 32.0, w: -83.4, n: 35.2, e: -78.5 },
  { name: "South Dakota", abbr: "SD", s: 42.5, w: -104.1, n: 45.9, e: -96.4 },
  { name: "Tennessee", abbr: "TN", s: 35.0, w: -90.3, n: 36.7, e: -81.6 },
  { name: "Texas", abbr: "TX", s: 25.8, w: -106.6, n: 36.5, e: -93.5 },
  { name: "Utah", abbr: "UT", s: 37.0, w: -114.1, n: 42.0, e: -109.0 },
  { name: "Vermont", abbr: "VT", s: 42.7, w: -73.4, n: 45.0, e: -71.5 },
  { name: "Virginia", abbr: "VA", s: 36.5, w: -83.7, n: 39.5, e: -75.2 },
  { name: "Washington", abbr: "WA", s: 45.5, w: -124.8, n: 49.0, e: -116.9 },
  { name: "West Virginia", abbr: "WV", s: 37.2, w: -82.6, n: 40.6, e: -77.7 },
  { name: "Wisconsin", abbr: "WI", s: 42.5, w: -92.9, n: 47.1, e: -86.8 },
  { name: "Wyoming", abbr: "WY", s: 41.0, w: -111.1, n: 45.0, e: -104.0 },
];

function norm(q: string): string {
  return q
    .trim()
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/^state of\s+/, "")
    .replace(/\s+/g, " ");
}

/** Exact state only. "Washington, DC" is DC. Bare "Washington" is the state. */
export function matchState(query: string): StateFrame | null {
  const t = norm(query);
  if (t === "washington dc" || t === "washington, dc" || t === "district of columbia" || t === "dc") {
    return STATES.find((s) => s.abbr === "DC") ?? null;
  }
  return STATES.find((s) => s.name.toLowerCase() === t || s.abbr.toLowerCase() === t) ?? null;
}
