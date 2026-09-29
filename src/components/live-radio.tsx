import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { STATIONS, stationById, type StationId } from "@/lib/radio";

type Tone = "idle" | "opening" | "live" | "down";

export function LiveRadio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const attempt = useRef(0);
  const wanted = useRef("");
  const switching = useRef(false);
  const [stationId, setStationId] = useState<StationId | null>(null);
  const [feedIndex, setFeedIndex] = useState(0);
  const [tone, setTone] = useState<Tone>("idle");
  const [playing, setPlaying] = useState(false);

  const station = stationId ? stationById(stationId) : null;
  const feed = station?.feeds[feedIndex] ?? null;

  function open(id: StationId, index = 0) {
    const audio = audioRef.current;
    const next = stationById(id);
    const chosen = next.feeds[index];
    if (!audio || !chosen) {
      setTone("down");
      setPlaying(false);
      return;
    }
    attempt.current = index;
    wanted.current = chosen.url;
    switching.current = true;
    setStationId(id);
    setFeedIndex(index);
    setTone("opening");
    setPlaying(true);
    audio.volume = 0.85;
    audio.src = chosen.url;
    void audio
      .play()
      .catch((error: unknown) => {
        const name = error instanceof DOMException ? error.name : "";
        if (name === "AbortError") return;
        if (name === "NotAllowedError") {
          setTone("down");
          setPlaying(false);
        }
      })
      .finally(() => {
        switching.current = false;
      });
  }

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!stationId) {
      open("rock");
      return;
    }
    if (!audio.paused) {
      audio.pause();
      return;
    }
    open(stationId, attempt.current);
  }

  const line = !feed
    ? "Licensed stations. Rock, country, classical."
    : tone === "down"
      ? "That stream didn’t open. Try another."
      : tone === "opening"
        ? `Opening ${feed.name}…`
        : playing
          ? `${feed.name} · ${feed.home}`
          : `${feed.name} · paused`;

  return (
    <div className="relative flex flex-col gap-2 border-b border-line px-3 py-2 sm:flex-row sm:items-center">
      <div className="flex min-w-0 items-center gap-2 sm:flex-1">
        <Flag />
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-widest text-fg uppercase">Live Legal Radio</p>
          <p className="truncate text-xs text-muted">{line}</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1 sm:flex sm:shrink-0">
        {STATIONS.map((item) => {
          const on = stationId === item.id && tone !== "down";
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={stationId === item.id}
              onClick={() => open(item.id)}
              className={`rounded-lg border px-2 py-2 text-xs ${
                on ? "border-signal bg-surface-2 text-fg" : "border-line text-muted"
              }`}
            >
              {item.genre}
            </button>
          );
        })}
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause the radio" : "Play the radio"}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-signal text-bg sm:w-10"
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>
      </div>
      <audio
        ref={audioRef}
        preload="none"
        className="sr-audio"
        onPlaying={() => {
          switching.current = false;
          setTone("live");
          setPlaying(true);
        }}
        onPause={() => {
          if (switching.current) return;
          setPlaying(false);
        }}
        onError={() => {
          const audio = audioRef.current;
          if (!audio || !stationId) return;
          const assigned = stripQuery(audio.src);
          const want = stripQuery(wanted.current);
          if (want && assigned && assigned !== want) return;
          const next = attempt.current + 1;
          if (next < stationById(stationId).feeds.length) {
            open(stationId, next);
            return;
          }
          wanted.current = "";
          setTone("down");
          setPlaying(false);
        }}
      />
    </div>
  );
}

function stripQuery(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split("?")[0] ?? url;
  }
}

function Flag() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden className="shrink-0">
      <rect width="18" height="12" fill="#e6e1d6" />
      <rect y="0" width="18" height="1.35" fill="#e23d2b" />
      <rect y="2.7" width="18" height="1.35" fill="#e23d2b" />
      <rect y="5.4" width="18" height="1.35" fill="#e23d2b" />
      <rect y="8.1" width="18" height="1.35" fill="#e23d2b" />
      <rect y="10.65" width="18" height="1.35" fill="#e23d2b" />
      <rect width="8" height="6.4" fill="#1d3f73" />
    </svg>
  );
}
