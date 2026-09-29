import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ORIGIN = "https://flocksurveillance.org/data/cameras.tsv";

/** Mirror baked into this app. Rechecked against the live file on 29 Sep 2026. */
export const MIRROR = {
  lastModified: "Fri, 28 Aug 2026 15:13:03 GMT",
  sha256: "ad59797d1fd80599dc030e1fab0db0f26e5cd8299a519038803fc2014a85bf44",
  uncompressedBytes: 50291519,
  rows: 335701,
};

export type SourcePin = {
  lat: number;
  lon: number;
  name: string;
  type: string;
  status: string;
  kind: "added" | "moved";
};

export type SourceReport = {
  state: "same" | "changed" | "unreachable";
  checkedAt: string;
  lastModified: string | null;
  etag: string | null;
  bodyBytes: number | null;
  sha256: string | null;
  added: number;
  moved: number;
  removed: number;
  sourceRows: number | null;
  pins: SourcePin[];
  note: string;
};

type Row = { lat: number; lon: number; name: string; type: string; status: string };

function parseTable(text: string): Map<string, Row> {
  const lines = text.split("\n");
  const header = lines[0] ?? "";
  if (!header.startsWith("lat\tlon\ttype")) {
    throw new Error("Source header was not the expected table.");
  }
  const rows = new Map<string, Row>();
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const p = line.split("\t");
    const lat = Number(p[0]);
    const lon = Number(p[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) continue;
    if (lat === 0 && lon === 0) continue;
    const id = p[9] || p[8] || `${lat.toFixed(5)},${lon.toFixed(5)},${p[5] ?? ""}`;
    rows.set(id, {
      lat,
      lon,
      name: p[5] || "Unnamed device",
      type: p[2] || "unknown",
      status: p[3] || "",
    });
  }
  return rows;
}

function readMirrorGzip(): Buffer {
  const candidates = [
    join(process.cwd(), "public/data/cameras.archive"),
    join(process.cwd(), ".vercel/output/static/data/cameras.archive"),
  ];
  for (const path of candidates) {
    try {
      return readFileSync(path);
    } catch {
      /* try the next place the build may have put the file */
    }
  }
  throw new Error("The mirrored table is not on this server.");
}

function moved(a: Row, b: Row): boolean {
  return Math.abs(a.lat - b.lat) > 0.0004 || Math.abs(a.lon - b.lon) > 0.0004;
}

export async function checkPublishedTable(): Promise<SourceReport> {
  const checkedAt = new Date().toISOString();
  const empty = {
    added: 0,
    moved: 0,
    removed: 0,
    sourceRows: null as number | null,
    pins: [] as SourcePin[],
  };
  try {
    const res = await fetch(ORIGIN, {
      headers: { "Accept-Encoding": "gzip", "User-Agent": "oversight-archive-check" },
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) {
      return {
        state: "unreachable",
        checkedAt,
        lastModified: res.headers.get("last-modified"),
        etag: res.headers.get("etag"),
        bodyBytes: null,
        sha256: null,
        ...empty,
        note: `The published file answered ${res.status}. The map is still the copy saved with this app.`,
      };
    }
    const lastModified = res.headers.get("last-modified");
    const etag = res.headers.get("etag");
    const raw = Buffer.from(await res.arrayBuffer());
    const text = (raw[0] === 0x1f && raw[1] === 0x8b ? gunzipSync(raw) : raw).toString("utf8");
    const bodyBytes = Buffer.byteLength(text);
    const sha256 = createHash("sha256").update(text).digest("hex");
    if (sha256 === MIRROR.sha256) {
      return {
        state: "same",
        checkedAt,
        lastModified,
        etag,
        bodyBytes,
        sha256,
        ...empty,
        sourceRows: MIRROR.rows,
        note: "No new table. The live file hashes to the same rows already on this map. Nothing new to place.",
      };
    }
    const fresh = parseTable(text);
    const mirror = parseTable(gunzipSync(readMirrorGzip()).toString("utf8"));
    const pins: SourcePin[] = [];
    let added = 0;
    let movedCount = 0;
    let removed = 0;
    for (const [id, row] of fresh) {
      const prev = mirror.get(id);
      if (!prev) {
        added++;
        if (pins.length < 80) pins.push({ ...row, kind: "added" });
      } else if (moved(prev, row)) {
        movedCount++;
        if (pins.filter((p) => p.kind === "moved").length < 40) pins.push({ ...row, kind: "moved" });
      }
    }
    for (const id of mirror.keys()) {
      if (!fresh.has(id)) removed++;
    }
    return {
      state: "changed",
      checkedAt,
      lastModified,
      etag,
      bodyBytes,
      sha256,
      added,
      moved: movedCount,
      removed,
      sourceRows: fresh.size,
      pins,
      note:
        pins.length < added + movedCount
          ? "The published file no longer matches this copy. The map marks a sample of the new and moved rows, not every one."
          : "The published file no longer matches this copy. The marks are the rows that showed up or moved.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "The source check failed.";
    return {
      state: "unreachable",
      checkedAt,
      lastModified: null,
      etag: null,
      bodyBytes: null,
      sha256: null,
      ...empty,
      note: message,
    };
  }
}
