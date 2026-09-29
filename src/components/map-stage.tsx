import { useEffect, useRef } from "react";
import type { LatLngBounds, LeafletMouseEvent, Map as LeafletMap, Point } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  TYPE_COLOR,
  forEachInBounds,
  passes,
  type Archive,
  type Filters,
  typeName,
} from "@/lib/archive";

export type FlyTarget =
  | { nonce: number; kind: "point"; lat: number; lon: number; zoom: number }
  | { nonce: number; kind: "box"; s: number; w: number; n: number; e: number };

export type SourcePin = {
  lat: number;
  lon: number;
  name: string;
  kind: "added" | "moved";
};

type Props = {
  archive: Archive | null;
  filters: Filters;
  selected: number | null;
  fly: FlyTarget | null;
  visible: boolean;
  basemap: "satellite" | "dark";
  pins: SourcePin[];
  onPick: (index: number | null) => void;
};

const SIGNAL = "#e23d2b";

export function MapStage({ archive, filters, selected, fly, visible, basemap, pins, onPick }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawRef = useRef<() => void>(() => {});
  const stateRef = useRef({ archive, filters, selected, basemap });
  stateRef.current = { archive, filters, selected, basemap };

  useEffect(() => {
    const host = hostRef.current;
    if (!host || mapRef.current) return;
    let disposed = false;
    let map: LeafletMap | null = null;

    void import("leaflet").then((mod) => {
      if (disposed || !hostRef.current) return;
      const L = mod.default;
      map = L.map(host, {
        center: [39.5, -98.5],
        zoom: 5,
        minZoom: 3,
        maxZoom: 19,
        zoomControl: false,
        attributionControl: true,
      });
      L.control.zoom({ position: "bottomright" }).addTo(map);
      map.createPane("devices");
      const pane = map.getPane("devices");
      if (pane) {
        pane.style.zIndex = "670";
        pane.style.pointerEvents = "none";
      }
      const canvas = document.createElement("canvas");
      canvas.className = "device-canvas";
      pane?.appendChild(canvas);
      canvasRef.current = canvas;

      const satellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Tiles &copy; Esri", maxZoom: 19 },
      );
      const labels = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Labels &copy; Esri", maxZoom: 19, pane: "shadowPane" },
      );
      const dark = L.tileLayer("https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: "&copy; OpenStreetMap &copy; CARTO",
        maxZoom: 19,
        subdomains: "abcd",
      });

      const applyBasemap = () => {
        if (!map) return;
        const mode = stateRef.current.basemap;
        if (mode === "dark") {
          if (map.hasLayer(satellite)) map.removeLayer(satellite);
          if (map.hasLayer(labels)) map.removeLayer(labels);
          if (!map.hasLayer(dark)) dark.addTo(map);
        } else {
          if (map.hasLayer(dark)) map.removeLayer(dark);
          if (!map.hasLayer(satellite)) satellite.addTo(map);
          if (!map.hasLayer(labels)) labels.addTo(map);
        }
      };

      const draw = () => {
        if (!map) return;
        const cvs = canvasRef.current;
        const data = stateRef.current.archive;
        if (!cvs) return;
        const size = map.getSize();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        cvs.width = Math.max(1, Math.floor(size.x * dpr));
        cvs.height = Math.max(1, Math.floor(size.y * dpr));
        cvs.style.width = `${size.x}px`;
        cvs.style.height = `${size.y}px`;
        L.DomUtil.setPosition(cvs, map.containerPointToLayerPoint([0, 0]));
        const ctx = cvs.getContext("2d");
        if (!ctx || !data) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, size.x, size.y);
        paint(ctx, map, data, stateRef.current.filters, stateRef.current.selected);
      };
      drawRef.current = () => {
        applyBasemap();
        draw();
      };

      map.on("moveend zoomend viewreset resize", draw);
      map.on("click", (event: LeafletMouseEvent) => {
        const current = map;
        const data = stateRef.current.archive;
        if (!current || !data) return;
        const z = current.getZoom();
        if (z < 10) {
          current.flyTo(event.latlng, Math.min(z + 2, 11), { duration: 0.6 });
          return;
        }
        const pt = current.latLngToContainerPoint(event.latlng);
        const bounds = current.getBounds().pad(0.15);
        pickRef.current(
          hitTest(
            data,
            stateRef.current.filters,
            bounds,
            (lat, lon) => current.latLngToContainerPoint([lat, lon]),
            pt.x,
            pt.y,
          ),
        );
      });

      mapRef.current = map;
      applyBasemap();
      draw();
    });

    return () => {
      disposed = true;
      map?.remove();
      mapRef.current = null;
      canvasRef.current = null;
    };
  }, []);

  const pickRef = useRef(onPick);
  pickRef.current = onPick;

  useEffect(() => {
    drawRef.current();
  }, [archive, filters, selected, basemap]);

  useEffect(() => {
    if (!visible) return;
    const id = requestAnimationFrame(() => mapRef.current?.invalidateSize());
    return () => cancelAnimationFrame(id);
  }, [visible]);

  useEffect(() => {
    if (!fly) return;
    let cancelled = false;
    const go = () => {
      if (cancelled) return;
      const map = mapRef.current;
      if (!map) {
        window.setTimeout(go, 120);
        return;
      }
      if (fly.kind === "box") {
        map.fitBounds(
          [
            [fly.s, fly.w],
            [fly.n, fly.e],
          ],
          { padding: [28, 28], animate: true },
        );
      } else {
        map.flyTo([fly.lat, fly.lon], fly.zoom, { duration: 0.8 });
      }
    };
    go();
    return () => {
      cancelled = true;
    };
  }, [fly]);

  const pinLayerRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const paint = () => {
      const map = mapRef.current;
      if (!map) {
        window.setTimeout(() => {
          if (!cancelled) paint();
        }, 150);
        return;
      }
      void import("leaflet").then((mod) => {
        if (cancelled || !mapRef.current) return;
        pinLayerRef.current?.remove();
        const L = mod.default;
        const group = L.layerGroup();
        for (const pin of pins) {
          const mark = L.circleMarker([pin.lat, pin.lon], {
            radius: pin.kind === "added" ? 8 : 6,
            color: pin.kind === "added" ? "#e23d2b" : "#e6e1d6",
            weight: 2,
            fillColor: pin.kind === "added" ? "#e23d2b" : "#1d3f73",
            fillOpacity: 0.85,
          });
          mark.bindTooltip(
            `${pin.kind === "added" ? "New in the source" : "Moved in the source"} · ${pin.name}`,
            { direction: "top" },
          );
          mark.addTo(group);
        }
        group.addTo(mapRef.current);
        pinLayerRef.current = group;
      });
    };
    paint();
    return () => {
      cancelled = true;
      pinLayerRef.current?.remove();
      pinLayerRef.current = null;
    };
  }, [pins]);

  return <div ref={hostRef} className="absolute inset-0 z-0" data-map="oversight" />;
}

function hitTest(
  archive: Archive,
  filters: Filters,
  bounds: LatLngBounds,
  project: (lat: number, lon: number) => Point,
  x: number,
  y: number,
): number | null {
  let best = -1;
  let bestD = 16 * 16;
  forEachInBounds(archive, bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast(), (i) => {
    if (!passes(archive, i, filters)) return;
    const p = project(archive.lat[i] ?? 0, archive.lon[i] ?? 0);
    const dx = p.x - x;
    const dy = p.y - y;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best >= 0 ? best : null;
}

function paint(
  ctx: CanvasRenderingContext2D,
  map: LeafletMap,
  archive: Archive,
  filters: Filters,
  selected: number | null,
) {
  const z = map.getZoom();
  const bounds = map.getBounds().pad(0.08);
  if (z < 10) {
    paintBins(ctx, map, archive, filters, bounds, z);
    return;
  }
  const items: { i: number; x: number; y: number }[] = [];
  forEachInBounds(
    archive,
    bounds.getSouth(),
    bounds.getWest(),
    bounds.getNorth(),
    bounds.getEast(),
    (i) => {
      if (!passes(archive, i, filters)) return;
      const p = map.latLngToContainerPoint([archive.lat[i] ?? 0, archive.lon[i] ?? 0]);
      items.push({ i, x: p.x, y: p.y });
    },
  );
  if (z >= 16) spreadStacks(items);
  const radius = z >= 15 ? 4.5 : z >= 12 ? 3.5 : 2.4;
  for (const item of items) {
    const type = typeName(archive, item.i);
    const color = TYPE_COLOR[type] ?? "#9ca3af";
    const status = archive.status[item.i] ?? 0;
    const angle = archive.angle[item.i] ?? -1;
    ctx.globalAlpha = status === 2 ? 0.35 : 1;
    if (z >= 14 && angle >= 0) {
      const len = 18;
      const half = (22 * Math.PI) / 180;
      const b = (angle * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(item.x, item.y);
      ctx.lineTo(item.x + Math.sin(b - half) * len, item.y - Math.cos(b - half) * len);
      ctx.lineTo(item.x + Math.sin(b + half) * len, item.y - Math.cos(b + half) * len);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(item.x, item.y, radius, 0, Math.PI * 2);
    if (status === 1) {
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.fill();
    }
    if (item.i === selected) {
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(item.x, item.y, radius + 5, 0, Math.PI * 2);
      ctx.strokeStyle = "#e6e1d6";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

function spreadStacks(items: { i: number; x: number; y: number }[]) {
  const groups = new Map<string, { i: number; x: number; y: number }[]>();
  for (const item of items) {
    const key = `${Math.round(item.x)}:${Math.round(item.y)}`;
    const list = groups.get(key);
    if (list) list.push(item);
    else groups.set(key, [item]);
  }
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const radius = Math.min(22, 8 + group.length);
    for (let n = 0; n < group.length; n++) {
      const row = group[n];
      if (!row) continue;
      const theta = (Math.PI * 2 * n) / group.length - Math.PI / 2;
      row.x += Math.cos(theta) * radius;
      row.y += Math.sin(theta) * radius;
    }
  }
}

function paintBins(
  ctx: CanvasRenderingContext2D,
  map: LeafletMap,
  archive: Archive,
  filters: Filters,
  bounds: L.LatLngBounds,
  zoom: number,
) {
  const bin = zoom < 5 ? 1.25 : zoom < 7 ? 0.6 : 0.28;
  const buckets = new Map<string, { lat: number; lon: number; n: number }>();
  const south = bounds.getSouth();
  const north = bounds.getNorth();
  const west = bounds.getWest();
  const east = bounds.getEast();
  for (let i = 0; i < archive.count; i++) {
    if (!passes(archive, i, filters)) continue;
    const lat = archive.lat[i] ?? 0;
    const lon = archive.lon[i] ?? 0;
    if (lat < south || lat > north || lon < west || lon > east) continue;
    const key = `${Math.floor(lat / bin)}:${Math.floor(lon / bin)}`;
    const row = buckets.get(key);
    if (row) {
      row.n += 1;
      row.lat += lat;
      row.lon += lon;
    } else buckets.set(key, { lat, lon, n: 1 });
  }
  for (const row of buckets.values()) {
    const lat = row.lat / row.n;
    const lon = row.lon / row.n;
    const p = map.latLngToContainerPoint([lat, lon]);
    const r = Math.min(36, 3 + Math.sqrt(row.n) * 1.15);
    ctx.beginPath();
    ctx.globalAlpha = 0.82;
    ctx.fillStyle = SIGNAL;
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
    if (r >= 11) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#0c0d10";
      ctx.font = "600 11px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(row.n >= 1000 ? `${Math.round(row.n / 100) / 10}k` : String(row.n), p.x, p.y);
    }
  }
  ctx.globalAlpha = 1;
}
