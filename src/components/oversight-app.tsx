import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BookOpen, Download, MessageSquare, Moon, RefreshCw, Satellite, Scale, Search, X } from "lucide-react";
import {
  STATUS_LABEL,
  TYPE_COLOR,
  TYPE_LABEL,
  countInBox,
  countInRadius,
  defaultFilters,
  inGroup,
  loadArchive,
  searchNames,
  tally,
  type Archive,
  type Filters,
  type GearGroup,
  typeName,
} from "@/lib/archive";
import { askArchive, type ChatTurn, type ViewStats, type ZoomKind } from "@/lib/ask";
import { geocodePlace } from "@/lib/geocode";
import { BriefPanel } from "@/components/brief-panel";
import { LiveRadio } from "@/components/live-radio";
import { MapStage, type FlyTarget, type SourcePin } from "@/components/map-stage";
import { SuitPanel } from "@/components/suit-panel";
import { checkSource, type SourceReport } from "@/lib/source-check";

type UiMsg = { role: "user" | "assistant" | "note"; content: string };
type MobileTab = "map" | "brief" | "suit" | "ask";
type Desk = "ask" | "brief" | "suit";

const GROUPS: { id: GearGroup; label: string }[] = [
  { id: "all", label: "All" },
  { id: "plate", label: "Plates" },
  { id: "video", label: "Video" },
  { id: "audio", label: "Audio" },
  { id: "air", label: "Air" },
  { id: "other", label: "Other" },
];

const PROMPTS = [
  "There is no federal plate-reader statute. How did the network get this big anyway?",
  "Steelman the case for these cameras, then the case against them.",
  "What is the difference between a hot-list hit and a historical search?",
  "A city buys a login, not a camera. What does that change?",
];

export function OversightApp() {
  const [archive, setArchive] = useState<Archive | null>(null);
  const [progress, setProgress] = useState({ pct: 4, label: "Starting" });
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(() => defaultFilters());
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [fly, setFly] = useState<FlyTarget | null>(null);
  const [basemap, setBasemap] = useState<"satellite" | "dark">("satellite");
  const [mobile, setMobile] = useState<MobileTab>("map");
  const [desk, setDesk] = useState<Desk>("ask");
  const [messages, setMessages] = useState<UiMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [asks, setAsks] = useState(0);
  const [view, setView] = useState<ViewStats | null>(null);
  const [checking, setChecking] = useState(false);
  const [source, setSource] = useState<SourceReport | null>(null);
  const [pins, setPins] = useState<SourcePin[]>([]);

  useEffect(() => {
    let cancel = false;
    loadArchive((p) => {
      if (!cancel) setProgress(p);
    })
      .then((data) => {
        if (!cancel) setArchive(data);
      })
      .catch((err: unknown) => {
        if (!cancel) setError(err instanceof Error ? err.message : "Could not read the archive.");
      });
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (!archive) return;
    const id = window.setTimeout(() => setHits(searchNames(archive, query, filters)), 180);
    return () => window.clearTimeout(id);
  }, [archive, query, filters]);

  const stats = useMemo(() => (archive ? tally(archive, filters) : null), [archive, filters]);

  const snapshot = useMemo(() => {
    if (!archive) return null;
    return {
      total: archive.count,
      inService: archive.statusCounts[0] ?? 0,
      inPlanning: archive.statusCounts[1] ?? 0,
      decommissioned: archive.statusCounts[2] ?? 0,
      other: archive.statusCounts[3] ?? 0,
      activeFlag: archive.activeCount,
    };
  }, [archive]);

  function toggleStatus(index: number) {
    setFilters((prev) => {
      const status = [...prev.status];
      status[index] = !status[index];
      return { ...prev, status };
    });
  }

  function toggleType(id: string) {
    setFilters((prev) => {
      const hiddenTypes = new Set(prev.hiddenTypes);
      if (hiddenTypes.has(id)) hiddenTypes.delete(id);
      else hiddenTypes.add(id);
      return { ...prev, hiddenTypes };
    });
  }

  function focusIndex(index: number) {
    if (!archive) return;
    setSelected(index);
    setFly({
      nonce: Date.now(),
      kind: "point",
      lat: archive.lat[index] ?? 0,
      lon: archive.lon[index] ?? 0,
      zoom: 16,
    });
    setMobile("map");
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || pending || !archive || !snapshot || asks >= 20) return;
    const prior: ChatTurn[] = messages
      .filter((m): m is ChatTurn => m.role === "user" || m.role === "assistant")
      .slice(-7);
    const next: ChatTurn[] = [...prior, { role: "user", content }];
    setMessages((m) => [...m, { role: "user", content }]);
    setDraft("");
    setPending(true);
    setAsks((n) => n + 1);
    setDesk("ask");
    try {
      const result = await askArchive({ data: { messages: next, snapshot, view } });
      if (!result.ok) {
        setMessages((m) => [...m, { role: "note", content: result.error }]);
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: result.answer }]);
      if (result.place && result.zoom) {
        const note = await flyToPlace(result.place, result.zoom);
        setMessages((m) => [...m, { role: "note", content: note }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "note", content: "The briefing desk could not be reached." }]);
    } finally {
      setPending(false);
    }
  }

  async function flyToPlace(place: string, zoom: ZoomKind): Promise<string> {
    if (!archive) return "The table is not loaded yet.";
    const geo = await geocodePlace({ data: { query: place, zoom } });
    if (!geo.ok) return geo.error;
    if (geo.box) {
      setFly({ nonce: Date.now(), kind: "box", s: geo.box.s, w: geo.box.w, n: geo.box.n, e: geo.box.e });
      const counted = countInBox(archive, geo.box);
      setView({
        label: geo.label,
        frame: "rough state frame, not a legal boundary",
        total: counted.total,
        inService: counted.inService,
        top: counted.top,
      });
      return `Map centered on ${geo.label}. Inside that rough frame the archive holds ${counted.total.toLocaleString()} records, ${counted.inService.toLocaleString()} marked in service. Not a legal boundary, and not a live count.`;
    }
    setFly({ nonce: Date.now(), kind: "point", lat: geo.lat, lon: geo.lon, zoom: geo.zoom });
    const counted = countInRadius(archive, geo.lat, geo.lon, geo.miles);
    setView({
      label: geo.label,
      frame: `${geo.miles} mile radius`,
      total: counted.total,
      inService: counted.inService,
      top: counted.top,
    });
    const tops = counted.top.map((row) => `${row.label} ${row.n.toLocaleString()}`).join(", ");
    return `Map centered on ${geo.label}. Within ${geo.miles} miles the archive holds ${counted.total.toLocaleString()} records, ${counted.inService.toLocaleString()} marked in service${tops ? ` (${tops})` : ""}.`;
  }

  async function refreshSource() {
    setChecking(true);
    try {
      const report = await checkSource({ data: {} });
      setSource(report);
      setPins(report.pins);
      if (report.pins.length > 0) {
        const first = report.pins[0];
        if (first) {
          setFly({ nonce: Date.now(), kind: "point", lat: first.lat, lon: first.lon, zoom: 12 });
          setMobile("map");
        }
      }
    } catch {
      setSource({
        state: "unreachable",
        checkedAt: new Date().toISOString(),
        lastModified: null,
        etag: null,
        bodyBytes: null,
        sha256: null,
        added: 0,
        moved: 0,
        removed: 0,
        sourceRows: null,
        pins: [],
        note: "The source check did not finish. The map is still the copy saved with this app.",
      });
      setPins([]);
    } finally {
      setChecking(false);
    }
  }

  const mapVisible = mobile === "map";

  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className="pulse-dot size-2 shrink-0 rounded-full bg-signal" aria-hidden />
        <div className="min-w-0">
          <p className="truncate font-serif text-lg leading-tight sm:text-xl">
            The internet did the oversight for free
          </p>
          <p className="truncate text-xs text-muted">
            {archive
              ? `${archive.count.toLocaleString()} published device records · offline after this load`
              : "National device archive"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refreshSource()}
          disabled={checking}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-line px-3 py-2 text-xs text-fg disabled:opacity-40"
        >
          <RefreshCw className={`size-4 ${checking ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">{checking ? "Checking" : "Check source"}</span>
          <span className="sm:hidden">{checking ? "…" : "Source"}</span>
        </button>
      </header>
      <LiveRadio />
      {source && (
        <div className="border-b border-line px-4 py-3 text-sm">
          <div className="flex items-start justify-between gap-3">
            <p>
              {source.state === "same"
                ? "Same table. No new rows to place."
                : source.state === "changed"
                  ? `Newer file. ${source.added.toLocaleString()} added, ${source.moved.toLocaleString()} moved, ${source.removed.toLocaleString()} gone from the source.`
                  : "Could not finish the compare."}
            </p>
            <button type="button" className="text-xs text-muted" onClick={() => { setSource(null); setPins([]); }}>
              Hide
            </button>
          </div>
          <p className="mt-1 text-xs text-muted">{source.note}</p>
          {source.lastModified && (
            <p className="mt-1 text-xs text-muted">Source last-modified {source.lastModified}.</p>
          )}
          {source.pins.length > 0 && (
            <ul className="mt-2 max-h-36 space-y-1 overflow-auto">
              {source.pins.map((pin, index) => (
                <li key={`${pin.lat}-${pin.lon}-${index}`}>
                  <button
                    type="button"
                    className="text-left text-xs text-fg underline decoration-line underline-offset-4"
                    onClick={() => {
                      setFly({ nonce: Date.now(), kind: "point", lat: pin.lat, lon: pin.lon, zoom: 14 });
                      setMobile("map");
                    }}
                  >
                    {pin.kind === "added" ? "New" : "Moved"} · {pin.name} · {pin.type}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-80 shrink-0 flex-col border-r border-line lg:flex">
          <Sidebar
            archive={archive}
            filters={filters}
            statsShown={stats?.shown ?? 0}
            query={query}
            hits={hits}
            onQuery={setQuery}
            onStatus={toggleStatus}
            onGroup={(group) => setFilters((prev) => ({ ...prev, group }))}
            onType={toggleType}
            onHit={focusIndex}
          />
        </aside>

        <div className={`relative min-w-0 flex-1 ${mapVisible ? "block" : "hidden lg:block"}`}>
          <MapStage
            archive={archive}
            filters={filters}
            selected={selected}
            fly={fly}
            visible={mapVisible}
            basemap={basemap}
            pins={pins}
            onPick={setSelected}
          />
          <div className="absolute top-3 right-3 z-10 flex gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-fg"
              onClick={() => setBasemap((b) => (b === "satellite" ? "dark" : "satellite"))}
            >
              {basemap === "satellite" ? <Moon className="size-4" /> : <Satellite className="size-4" />}
              {basemap === "satellite" ? "Dark map" : "Satellite"}
            </button>
          </div>
          {selected != null && archive && (
            <Detail
              archive={archive}
              index={selected}
              onClose={() => setSelected(null)}
            />
          )}
          {!archive && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-bg/90 px-6">
              <div className="w-full max-w-sm">
                <p className="font-serif text-2xl">Reading the table</p>
                <p className="mt-2 text-sm text-muted">{error ?? progress.label}</p>
                <div className="mt-4 h-1 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full bg-signal" style={{ width: `${error ? 0 : progress.pct}%` }} />
                </div>
              </div>
            </div>
          )}
          <div className="absolute top-3 left-3 z-10 max-h-96 w-72 overflow-auto rounded-xl border border-line bg-surface lg:hidden">
            <details>
              <summary className="px-3 py-3 text-sm">Filters and search</summary>
              <FilterBody
                archive={archive}
                filters={filters}
                query={query}
                hits={hits}
                onQuery={setQuery}
                onStatus={toggleStatus}
                onGroup={(group) => setFilters((prev) => ({ ...prev, group }))}
                onType={toggleType}
                onHit={focusIndex}
              />
              <FileFoot />
            </details>
          </div>
        </div>

        {mobile === "brief" && (
          <div className="flex min-h-0 flex-1 flex-col lg:hidden">
            <MobileFilters
              archive={archive}
              filters={filters}
              query={query}
              hits={hits}
              onQuery={setQuery}
              onStatus={toggleStatus}
              onGroup={(group) => setFilters((prev) => ({ ...prev, group }))}
              onType={toggleType}
              onHit={focusIndex}
            />
            <BriefPanel />
          </div>
        )}
        {mobile === "suit" && (
          <div className="flex min-h-0 flex-1 flex-col lg:hidden">
            <SuitPanel />
          </div>
        )}
        {mobile === "ask" && (
          <div className="flex min-h-0 flex-1 flex-col lg:hidden">
            <AskPanel
              messages={messages}
              draft={draft}
              pending={pending}
              asks={asks}
              ready={Boolean(archive)}
              onDraft={setDraft}
              onSend={(text) => void send(text)}
            />
          </div>
        )}

        <aside className="hidden w-96 shrink-0 flex-col border-l border-line lg:flex">
          <div className="flex border-b border-line">
            <TabButton active={desk === "ask"} onClick={() => setDesk("ask")} icon={<MessageSquare className="size-4" />}>
              Ask
            </TabButton>
            <TabButton active={desk === "brief"} onClick={() => setDesk("brief")} icon={<BookOpen className="size-4" />}>
              Brief
            </TabButton>
            <TabButton active={desk === "suit"} onClick={() => setDesk("suit")} icon={<Scale className="size-4" />}>
              Suit
            </TabButton>
          </div>
          {desk === "ask" ? (
            <AskPanel
              messages={messages}
              draft={draft}
              pending={pending}
              asks={asks}
              ready={Boolean(archive)}
              onDraft={setDraft}
              onSend={(text) => void send(text)}
            />
          ) : desk === "brief" ? (
            <BriefPanel />
          ) : (
            <SuitPanel />
          )}
        </aside>
      </div>

      <nav className="grid grid-cols-4 border-t border-line lg:hidden">
        <NavButton active={mobile === "map"} onClick={() => setMobile("map")}>
          Map
        </NavButton>
        <NavButton active={mobile === "brief"} onClick={() => setMobile("brief")}>
          Brief
        </NavButton>
        <NavButton active={mobile === "suit"} onClick={() => setMobile("suit")}>
          Suit
        </NavButton>
        <NavButton active={mobile === "ask"} onClick={() => setMobile("ask")}>
          Ask
        </NavButton>
      </nav>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex flex-1 items-center justify-center gap-2 py-3 text-sm ${active ? "bg-surface text-fg" : "text-muted"}`}
    >
      {icon}
      {children}
    </button>
  );
}

function NavButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-3 text-sm ${active ? "text-signal" : "text-muted"}`}
    >
      {children}
    </button>
  );
}

function Sidebar(props: FilterProps & { statsShown: number }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-line px-4 py-3">
        <p className="text-xs tracking-widest text-muted uppercase">Showing</p>
        <p className="font-serif text-3xl tabular-nums">{props.statsShown.toLocaleString()}</p>
      </div>
      <FilterBody {...props} />
      <FileFoot />
    </div>
  );
}

function MobileFilters(props: FilterProps) {
  return (
    <details className="border-b border-line">
      <summary className="px-4 py-3 text-sm">Filter the table</summary>
      <div className="max-h-64 overflow-y-auto">
        <FilterBody {...props} />
      </div>
    </details>
  );
}

type FilterProps = {
  archive: Archive | null;
  filters: Filters;
  query: string;
  hits: number[];
  onQuery: (value: string) => void;
  onStatus: (index: number) => void;
  onGroup: (group: GearGroup) => void;
  onType: (id: string) => void;
  onHit: (index: number) => void;
};

function FilterBody({ archive, filters, query, hits, onQuery, onStatus, onGroup, onType, onHit }: FilterProps) {
  const types =
    archive?.types
      .map((id, index) => ({ id, n: archive.typeCounts[index] ?? 0 }))
      .filter((row) => row.n > 0 && inGroup(row.id, filters.group))
      .sort((a, b) => b.n - a.n) ?? [];

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3">
      <div className="grid grid-cols-2 gap-2">
        {STATUS_LABEL.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => onStatus(index)}
            className={`rounded-lg border px-2 py-2 text-xs ${filters.status[index] ? "border-line bg-surface-2 text-fg" : "border-line text-muted opacity-50"}`}
          >
            {label}
            <span className="mt-1 block tabular-nums text-muted">
              {(archive?.statusCounts[index] ?? 0).toLocaleString()}
            </span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {GROUPS.map((group) => (
          <button
            key={group.id}
            type="button"
            onClick={() => onGroup(group.id)}
            className={`rounded-full border px-3 py-1 text-xs ${filters.group === group.id ? "border-signal bg-signal text-bg" : "border-line text-muted"}`}
          >
            {group.label}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
        <Search className="size-4 text-muted" />
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search device names"
          className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted"
        />
      </label>
      {query.trim().length >= 2 && (
        <ul className="space-y-1">
          {hits.length === 0 && <li className="text-xs text-muted">No name matched.</li>}
          {archive &&
            hits.map((index) => (
              <li key={index}>
                <button type="button" onClick={() => onHit(index)} className="w-full rounded-md px-2 py-2 text-left hover:bg-surface-2">
                  <span className="block text-sm">{archive.names[index]}</span>
                  <span className="text-xs text-muted">
                    {TYPE_LABEL[typeName(archive, index)] ?? typeName(archive, index)} ·{" "}
                    {STATUS_LABEL[archive.status[index] ?? 0]}
                  </span>
                </button>
              </li>
            ))}
        </ul>
      )}
      <ul className="space-y-1">
        {types.map((row) => {
          const hidden = filters.hiddenTypes.has(row.id);
          return (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => onType(row.id)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs ${hidden ? "opacity-40" : ""}`}
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                style={{ background: TYPE_COLOR[row.id] ?? "var(--color-muted)" }}
                />
                <span className="flex-1">{TYPE_LABEL[row.id] ?? row.id}</span>
                <span className="tabular-nums text-muted">{row.n.toLocaleString()}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FileFoot() {
  return (
    <div className="border-t border-line px-4 py-3 text-xs text-muted">
      <a className="inline-flex items-center gap-2 text-fg" href="/data/cameras.archive" download="cameras.tsv.gz">
        <Download className="size-4" />
        Download the table
      </a>
      <p className="mt-2">
        <a className="underline decoration-line underline-offset-4" href="/data/SCHEMA.txt">
          Schema
        </a>
        {" · "}
        <a className="underline decoration-line underline-offset-4" href="/data/manifest.json">
          Manifest
        </a>
        . Gunzip, keep the header, reload. The map rebuilds from that file.
      </p>
    </div>
  );
}

function Detail({ archive, index, onClose }: { archive: Archive; index: number; onClose: () => void }) {
  const lat = archive.lat[index] ?? 0;
  const lon = archive.lon[index] ?? 0;
  const type = typeName(archive, index);
  const angle = archive.angle[index] ?? -1;
  const features = (archive.features[index] ?? "").split(",").filter(Boolean);
  return (
    <section className="absolute right-3 bottom-24 left-3 z-10 max-w-md rounded-xl border border-line bg-surface p-4 lg:bottom-3">
      <div className="flex items-start gap-3">
        <h2 className="min-w-0 flex-1 font-serif text-xl leading-tight">{archive.names[index]}</h2>
        <button type="button" onClick={onClose} aria-label="Close device" className="text-muted">
          <X className="size-4" />
        </button>
      </div>
      <p className="mt-2 text-sm text-muted">
        {TYPE_LABEL[type] ?? type} · {STATUS_LABEL[archive.status[index] ?? 0]}
        {archive.active[index] ? " · active flag" : ""}
        {angle >= 0 ? ` · facing ${angle}°` : ""}
      </p>
      {features.length > 0 && <p className="mt-2 text-xs text-muted">{features.join(" · ")}</p>}
      <p className="mt-2 text-xs text-muted">
        {lat.toFixed(5)}, {lon.toFixed(5)}. A shared coordinate is a lead, not a room. Full identifiers are in
        the downloadable table.
      </p>
    </section>
  );
}

function AskPanel({
  messages,
  draft,
  pending,
  asks,
  ready,
  onDraft,
  onSend,
}: {
  messages: UiMsg[];
  draft: string;
  pending: boolean;
  asks: number;
  ready: boolean;
  onDraft: (value: string) => void;
  onSend: (text: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div>
            <p className="font-serif text-2xl leading-tight">Tell me your area. I will not pick one.</p>
            <p className="mt-2 text-sm text-muted">
              City and state, or a ZIP. Then I will fly the map and read what this archive holds there. I can
              also brief the law on both sides, including the gaps the network already uses. I will not run a
              plate, stalk a person, or explain how to attack a camera.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={!ready || pending}
                  onClick={() => onSend(prompt)}
                  className="rounded-lg border border-line px-3 py-2 text-left text-sm text-fg hover:bg-surface-2 disabled:opacity-40"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <p
            key={`${message.role}-${index}`}
            className={
              message.role === "user"
                ? "ml-6 rounded-lg bg-surface-2 px-3 py-2 text-sm break-words whitespace-pre-wrap"
                : message.role === "note"
                  ? "text-xs break-words text-signal whitespace-pre-wrap"
                  : "text-sm leading-relaxed break-words whitespace-pre-wrap text-fg"
            }
          >
            {message.content}
          </p>
        ))}
        {pending && <p className="text-sm text-muted">Reading the record…</p>}
      </div>
      <form
        className="border-t border-line p-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSend(draft);
        }}
      >
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
            placeholder={ready ? "Name your area. City and state, or a ZIP." : "Wait for the table"}
            disabled={!ready || pending || asks >= 20}
            className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={!ready || pending || asks >= 20 || !draft.trim()}
            className="rounded-lg bg-signal px-3 py-2 text-sm text-bg disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">
          {asks}/20 questions this sitting. Not legal advice. Counts under a reply come from the archive.
        </p>
      </form>
    </div>
  );
}
