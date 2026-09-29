import { createServerFn } from "@tanstack/react-start";
import { matchState } from "@/lib/states";
import type { ZoomKind } from "@/lib/ask";

export type GeoHit = {
  ok: true;
  label: string;
  lat: number;
  lon: number;
  zoom: number;
  miles: number;
  box: { s: number; w: number; n: number; e: number } | null;
};

export type GeoResult = GeoHit | { ok: false; error: string };

function inCountry(lat: number, lon: number): boolean {
  return lat >= 17 && lat <= 72 && lon >= -180 && lon <= -64;
}

const ZOOM_LEVEL: Record<ZoomKind, number> = { state: 6, city: 11, zip: 13, street: 15 };
const MILES: Record<ZoomKind, number> = { state: 0, city: 12, zip: 5, street: 1 };

export const geocodePlace = createServerFn({ method: "POST" })
  .validator((input: unknown) => input)
  .handler(async ({ data }): Promise<GeoResult> => {
    const body = data as { query?: unknown; zoom?: unknown } | null;
    const query = typeof body?.query === "string" ? body.query.trim().slice(0, 180) : "";
    const zoom: ZoomKind =
      body?.zoom === "state" || body?.zoom === "city" || body?.zoom === "zip" || body?.zoom === "street"
        ? body.zoom
        : "city";
    if (!query) return { ok: false, error: "No place to find." };

    const zip = query.match(/\b(\d{5})\b/)?.[1];
    const state = matchState(query);
    if (state && (zoom === "state" || query.trim().length <= state.name.length + 4)) {
      const lat = (state.s + state.n) / 2;
      const lon = (state.w + state.e) / 2;
      return {
        ok: true,
        label: state.name,
        lat,
        lon,
        zoom: 6,
        miles: 0,
        box: { s: state.s, w: state.w, n: state.n, e: state.e },
      };
    }

    if (zip && (zoom === "zip" || /^\d{5}$/.test(query))) {
      const hit = await zipHit(zip);
      if (hit) return hit;
    }

    const named = await nominatim(query, zoom);
    if (named) return named;
    if (zip) {
      const hit = await zipHit(zip);
      if (hit) return hit;
    }
    return { ok: false, error: "That place did not resolve inside the United States." };
  });

async function zipHit(zip: string): Promise<GeoHit | null> {
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      places?: { latitude?: string; longitude?: string; "place name"?: string; "state abbreviation"?: string }[];
    };
    const place = body.places?.[0];
    if (!place?.latitude || !place.longitude) return null;
    const lat = Number(place.latitude);
    const lon = Number(place.longitude);
    if (!inCountry(lat, lon)) return null;
    const city = place["place name"] || zip;
    const st = place["state abbreviation"] || "";
    return {
      ok: true,
      label: st ? `${city}, ${st} ${zip}` : `${city} ${zip}`,
      lat,
      lon,
      zoom: ZOOM_LEVEL.zip,
      miles: MILES.zip,
      box: null,
    };
  } catch {
    return null;
  }
}

async function nominatim(query: string, zoom: ZoomKind): Promise<GeoHit | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        Accept: "application/json",
        "User-Agent": "OversightArchive/1.0 (civic map of a published device table)",
      },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as { lat?: string; lon?: string; display_name?: string }[];
    const row = rows[0];
    if (!row?.lat || !row.lon) return null;
    const lat = Number(row.lat);
    const lon = Number(row.lon);
    if (!inCountry(lat, lon)) return null;
    const label = (row.display_name || query).split(",").slice(0, 3).join(",").trim();
    return {
      ok: true,
      label,
      lat,
      lon,
      zoom: ZOOM_LEVEL[zoom],
      miles: MILES[zoom],
      box: null,
    };
  } catch {
    return null;
  }
}
