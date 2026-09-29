/** Browser-side reader for /data/cameras.tsv.gz. The table never leaves the device. */

export const TYPE_ORDER = [
  "falcon",
  "falconFlex",
  "falconHighway",
  "wing",
  "wingGateway",
  "wingUbicquia",
  "wingApi",
  "picard",
  "picardPtz",
  "picardTrailer",
  "condor",
  "raven",
  "drone",
  "droneDockingStation",
  "droneControllerBox",
  "droneRadar",
  "owl",
  "talkDown",
  "trailer",
  "lprTrailer",
  "sparrow",
  "backhaulBox",
  "multiEvidenceDevice",
  "avicore",
  "automotus",
  "external",
  "factoryFixture",
] as const;

export const TYPE_LABEL: Record<string, string> = {
  falcon: "Falcon LPR",
  falconFlex: "Falcon Flex",
  falconHighway: "Falcon Highway",
  wing: "Wing PTZ",
  wingGateway: "Wing Gateway",
  wingUbicquia: "Wing Ubicquia",
  wingApi: "Wing API",
  picard: "Picard",
  picardPtz: "Picard PTZ",
  picardTrailer: "Picard Trailer",
  condor: "Condor trailer",
  raven: "Raven audio",
  drone: "Drone",
  droneDockingStation: "Drone dock",
  droneControllerBox: "Drone controller",
  droneRadar: "Drone radar",
  owl: "Owl radar",
  talkDown: "Talk-down speaker",
  trailer: "Trailer",
  lprTrailer: "LPR trailer",
  sparrow: "Sparrow",
  backhaulBox: "Backhaul box",
  multiEvidenceDevice: "Multi-evidence",
  avicore: "Avicore",
  automotus: "Automotus",
  external: "External",
  factoryFixture: "Factory fixture",
};

/** Data ink only. Chrome stays on the red/paper/black tokens. */
export const TYPE_COLOR: Record<string, string> = {
  falcon: "#e23d2b",
  falconFlex: "#f07167",
  falconHighway: "#b42318",
  wing: "#3b82f6",
  wingGateway: "#60a5fa",
  wingUbicquia: "#1d4ed8",
  wingApi: "#93c5fd",
  picard: "#a855f7",
  picardPtz: "#c084fc",
  picardTrailer: "#7c3aed",
  condor: "#e0a106",
  raven: "#3d9a62",
  drone: "#14b8c6",
  droneDockingStation: "#0e7490",
  droneControllerBox: "#155e75",
  droneRadar: "#67e8f9",
  owl: "#2dd4bf",
  talkDown: "#ec4899",
  trailer: "#f97316",
  lprTrailer: "#c2410c",
  sparrow: "#a3e635",
  backhaulBox: "#818cf8",
  multiEvidenceDevice: "#8b5cf6",
  avicore: "#e879f9",
  automotus: "#fbbf24",
  external: "#9ca3af",
  factoryFixture: "#6b7280",
};

export const STATUS_LABEL = ["In service", "Planned", "Decommissioned", "Other"] as const;

const PLATE = new Set(["falcon", "falconFlex", "falconHighway", "lprTrailer"]);
const VIDEO = new Set([
  "wing",
  "wingGateway",
  "wingUbicquia",
  "wingApi",
  "picard",
  "picardPtz",
  "picardTrailer",
  "condor",
  "trailer",
]);
const AUDIO = new Set(["raven", "talkDown", "owl"]);
const AIR = new Set(["drone", "droneDockingStation", "droneControllerBox", "droneRadar"]);

export type GearGroup = "all" | "plate" | "video" | "audio" | "air" | "other";

export function inGroup(type: string, group: GearGroup): boolean {
  if (group === "all") return true;
  if (group === "plate") return PLATE.has(type);
  if (group === "video") return VIDEO.has(type);
  if (group === "audio") return AUDIO.has(type);
  if (group === "air") return AIR.has(type);
  return !PLATE.has(type) && !VIDEO.has(type) && !AUDIO.has(type) && !AIR.has(type);
}

const TRAFFIC: Record<string, number> = { NB: 0, EB: 90, SB: 180, WB: 270 };

function facing(name: string, raw: string): number {
  const m = /\b(NB|SB|EB|WB)\b/.exec(name);
  if (m && m[1] && TRAFFIC[m[1]] != null) return TRAFFIC[m[1]];
  if (!raw) return -1;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? Math.round(n) : -1;
}

export type Filters = {
  status: boolean[]; // length 4
  group: GearGroup;
  hiddenTypes: Set<string>;
};

export function defaultFilters(): Filters {
  return { status: [true, true, true, true], group: "all", hiddenTypes: new Set() };
}

export type Archive = {
  count: number;
  lat: Float32Array;
  lon: Float32Array;
  typeId: Uint8Array;
  status: Uint8Array;
  active: Uint8Array;
  angle: Int16Array;
  names: string[];
  features: string[];
  types: string[];
  typeCounts: number[];
  statusCounts: number[];
  activeCount: number;
  cellStart: Map<number, number>;
  cellCount: Map<number, number>;
  cellIndex: Uint32Array;
};

const CELL = 0.5;

function cellKey(lat: number, lon: number): number {
  return Math.floor(lat / CELL) * 10000 + Math.floor(lon / CELL);
}

export function typeName(archive: Archive, index: number): string {
  return archive.types[archive.typeId[index] ?? 0] ?? "unknown";
}

export function passes(archive: Archive, index: number, filters: Filters): boolean {
  const status = archive.status[index] ?? 0;
  if (!filters.status[status]) return false;
  const type = typeName(archive, index);
  if (!inGroup(type, filters.group)) return false;
  if (filters.hiddenTypes.has(type)) return false;
  return true;
}

export type Tally = {
  total: number;
  shown: number;
  status: number[];
  active: number;
  byType: { id: string; label: string; n: number; color: string }[];
};

export function tally(archive: Archive, filters: Filters): Tally {
  const by = new Map<string, number>();
  const status = [0, 0, 0, 0];
  let shown = 0;
  let active = 0;
  for (let i = 0; i < archive.count; i++) {
    if (!passes(archive, i, filters)) continue;
    shown++;
    const s = archive.status[i] ?? 0;
    status[s] = (status[s] ?? 0) + 1;
    if (archive.active[i]) active++;
    const id = typeName(archive, i);
    by.set(id, (by.get(id) ?? 0) + 1);
  }
  const byType = [...by.entries()]
    .map(([id, n]) => ({
      id,
      label: TYPE_LABEL[id] ?? id,
      n,
      color: TYPE_COLOR[id] ?? "#9ca3af",
    }))
    .sort((a, b) => b.n - a.n);
  return { total: archive.count, shown, status, active, byType };
}

export type SliceStats = {
  total: number;
  inService: number;
  top: { label: string; n: number }[];
};

function sliceStats(archive: Archive, indexes: number[]): SliceStats {
  const by = new Map<string, number>();
  let inService = 0;
  for (const i of indexes) {
    if ((archive.status[i] ?? 0) === 0) inService++;
    const id = typeName(archive, i);
    by.set(id, (by.get(id) ?? 0) + 1);
  }
  const top = [...by.entries()]
    .map(([id, n]) => ({ label: TYPE_LABEL[id] ?? id, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 6);
  return { total: indexes.length, inService, top };
}

export function countInBox(
  archive: Archive,
  box: { s: number; w: number; n: number; e: number },
): SliceStats {
  const hit: number[] = [];
  for (let i = 0; i < archive.count; i++) {
    const lat = archive.lat[i] ?? 0;
    const lon = archive.lon[i] ?? 0;
    if (lat >= box.s && lat <= box.n && lon >= box.w && lon <= box.e) hit.push(i);
  }
  return sliceStats(archive, hit);
}

export function countInRadius(
  archive: Archive,
  lat0: number,
  lon0: number,
  miles: number,
): SliceStats {
  const hit: number[] = [];
  const latScale = miles / 69;
  const lonScale = miles / Math.max(20, 69 * Math.cos((lat0 * Math.PI) / 180));
  for (let i = 0; i < archive.count; i++) {
    const lat = archive.lat[i] ?? 0;
    const lon = archive.lon[i] ?? 0;
    if (Math.abs(lat - lat0) > latScale || Math.abs(lon - lon0) > lonScale) continue;
    const dLat = (lat - lat0) * 69;
    const dLon = (lon - lon0) * 69 * Math.cos((lat0 * Math.PI) / 180);
    if (dLat * dLat + dLon * dLon <= miles * miles) hit.push(i);
  }
  return sliceStats(archive, hit);
}

export function searchNames(archive: Archive, query: string, filters: Filters, cap = 30): number[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const hit: number[] = [];
  for (let i = 0; i < archive.count && hit.length < cap; i++) {
    if (!passes(archive, i, filters)) continue;
    const name = archive.names[i] ?? "";
    if (name.toLowerCase().includes(q)) hit.push(i);
  }
  return hit;
}

export function forEachInBounds(
  archive: Archive,
  south: number,
  west: number,
  north: number,
  east: number,
  cb: (index: number) => void,
): void {
  const la0 = Math.floor(south / CELL);
  const la1 = Math.floor(north / CELL);
  const lo0 = Math.floor(west / CELL);
  const lo1 = Math.floor(east / CELL);
  for (let la = la0; la <= la1; la++) {
    for (let lo = lo0; lo <= lo1; lo++) {
      const key = la * 10000 + lo;
      const start = archive.cellStart.get(key);
      const n = archive.cellCount.get(key);
      if (start == null || !n) continue;
      for (let j = 0; j < n; j++) cb(archive.cellIndex[start + j] ?? 0);
    }
  }
}

export function nearest(
  archive: Archive,
  filters: Filters,
  south: number,
  west: number,
  north: number,
  east: number,
  project: (lat: number, lon: number) => { x: number; y: number },
  px: number,
  py: number,
  maxPx: number,
): number | null {
  let best = -1;
  let bestD = maxPx * maxPx;
  forEachInBounds(archive, south, west, north, east, (i) => {
    if (!passes(archive, i, filters)) return;
    const p = project(archive.lat[i] ?? 0, archive.lon[i] ?? 0);
    const dx = p.x - px;
    const dy = p.y - py;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best >= 0 ? best : null;
}

export type Progress = { pct: number; label: string };

export async function loadArchive(onProgress: (p: Progress) => void): Promise<Archive> {
  onProgress({ pct: 8, label: "Opening the archive kept with this app" });
  const buf = await fetchGzip(onProgress);
  onProgress({ pct: 28, label: "Unpacking the table" });
  const stream = new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"));
  let text = await new Response(stream).text();
  onProgress({ pct: 46, label: "Reading rows" });
  const lines = text.split("\n");
  text = "";
  const header = lines[0] ?? "";
  if (!header.startsWith("lat\tlon\ttype")) {
    throw new Error("Archive header was not the expected table.");
  }

  const cap = Math.max(0, lines.length - 1);
  const lat = new Float32Array(cap);
  const lon = new Float32Array(cap);
  const typeId = new Uint8Array(cap);
  const status = new Uint8Array(cap);
  const active = new Uint8Array(cap);
  const angle = new Int16Array(cap);
  const names: string[] = new Array(cap);
  const features: string[] = new Array(cap);
  const types: string[] = [...TYPE_ORDER];
  const typeLookup = new Map<string, number>(TYPE_ORDER.map((t, i) => [t, i]));
  const buckets = new Map<number, number[]>();
  let count = 0;

  const yieldEvery = 20000;
  for (let li = 1; li < lines.length; li++) {
    const line = lines[li];
    if (!line) continue;
    const p = line.split("\t");
    const la = Number(p[0]);
    const lo = Number(p[1]);
    if (!Number.isFinite(la) || !Number.isFinite(lo)) continue;
    if (Math.abs(la) > 90 || Math.abs(lo) > 180) continue;
    if (la === 0 && lo === 0) continue;
    const code = p[2] || "unknown";
    let tid = typeLookup.get(code);
    if (tid == null) {
      tid = types.length;
      types.push(code);
      typeLookup.set(code, tid);
    }
    const st = p[3] === "inService" ? 0 : p[3] === "inPlanning" ? 1 : p[3] === "decommissioned" ? 2 : 3;
    const i = count++;
    lat[i] = la;
    lon[i] = lo;
    typeId[i] = tid > 255 ? 255 : tid;
    status[i] = st;
    active[i] = p[4] === "1" ? 1 : 0;
    angle[i] = facing(p[5] || "", p[7] || "");
    names[i] = p[5] || "Unnamed device";
    features[i] = p[6] || "";
    const key = cellKey(la, lo);
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = [];
      buckets.set(key, bucket);
    }
    bucket.push(i);
    if (count % yieldEvery === 0) {
      const pct = 46 + Math.round((li / lines.length) * 46);
      onProgress({ pct, label: `Reading rows · ${count.toLocaleString()}` });
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  onProgress({ pct: 94, label: "Indexing the map" });
  const cellIndex = new Uint32Array(count);
  const cellStart = new Map<number, number>();
  const cellCount = new Map<number, number>();
  let cursor = 0;
  for (const [key, arr] of buckets) {
    cellStart.set(key, cursor);
    cellCount.set(key, arr.length);
    for (const id of arr) cellIndex[cursor++] = id;
  }

  const typeCounts = new Array(types.length).fill(0) as number[];
  const statusCounts = [0, 0, 0, 0];
  let activeCount = 0;
  for (let i = 0; i < count; i++) {
    const tid = typeId[i] ?? 0;
    typeCounts[tid] = (typeCounts[tid] ?? 0) + 1;
    const s = status[i] ?? 0;
    statusCounts[s] = (statusCounts[s] ?? 0) + 1;
    if (active[i]) activeCount++;
  }

  names.length = count;
  features.length = count;
  onProgress({ pct: 100, label: "On the map" });

  return {
    count,
    lat: lat.subarray(0, count),
    lon: lon.subarray(0, count),
    typeId: typeId.subarray(0, count),
    status: status.subarray(0, count),
    active: active.subarray(0, count),
    angle: angle.subarray(0, count),
    names,
    features,
    types,
    typeCounts,
    statusCounts,
    activeCount,
    cellStart,
    cellCount,
    cellIndex,
  };
}

async function fetchGzip(onProgress: (p: Progress) => void): Promise<ArrayBuffer> {
  const key = "/data/cameras.archive";
  try {
    const cache = await caches.open("oversight-archive-v1");
    const hit = await cache.match(key);
    if (hit) {
      onProgress({ pct: 18, label: "Using the copy saved on this device" });
      return hit.arrayBuffer();
    }
    const res = await fetch(key);
    if (!res.ok) throw new Error(`Archive file unavailable (${res.status})`);
    const buf = await res.arrayBuffer();
    try {
      await cache.put(key, new Response(buf.slice(0), { headers: { "Content-Type": "application/gzip" } }));
    } catch {
      /* private mode can refuse Cache Storage; the session still has the bytes */
    }
    return buf;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Archive")) throw error;
    const res = await fetch(key);
    if (!res.ok) throw new Error(`Archive file unavailable (${res.status})`);
    return res.arrayBuffer();
  }
}
