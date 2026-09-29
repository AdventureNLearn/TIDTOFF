import { createServerFn } from "@tanstack/react-start";
import { CASE_AGAINST, CASE_FOR, EXPANSION, LAW_ROWS } from "@/lib/briefing";
import { SUIT_FOR_DESK } from "@/lib/suit";

export type ZoomKind = "state" | "city" | "zip" | "street";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type SnapshotStats = {
  total: number;
  inService: number;
  inPlanning: number;
  decommissioned: number;
  other: number;
  activeFlag: number;
};

export type ViewStats = {
  label: string;
  frame: string;
  total: number;
  inService: number;
  top: { label: string; n: number }[];
};

export type AskResult =
  | { ok: true; answer: string; place: string | null; zoom: ZoomKind | null }
  | { ok: false; error: string };

const ZOOM: ZoomKind[] = ["state", "city", "zip", "street"];

function num(value: unknown, max: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > max) return null;
  return Math.round(value);
}

function cleanSnapshot(value: unknown): SnapshotStats | null {
  if (!value || typeof value !== "object") return null;
  const s = value as Record<string, unknown>;
  const total = num(s.total, 2_000_000);
  const inService = num(s.inService, 2_000_000);
  const inPlanning = num(s.inPlanning, 2_000_000);
  const decommissioned = num(s.decommissioned, 2_000_000);
  const other = num(s.other, 2_000_000);
  const activeFlag = num(s.activeFlag, 2_000_000);
  if (
    total == null ||
    inService == null ||
    inPlanning == null ||
    decommissioned == null ||
    other == null ||
    activeFlag == null
  ) {
    return null;
  }
  return { total, inService, inPlanning, decommissioned, other, activeFlag };
}

function cleanView(value: unknown): ViewStats | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.label !== "string" || typeof v.frame !== "string") return null;
  const total = num(v.total, 2_000_000);
  const inService = num(v.inService, 2_000_000);
  if (total == null || inService == null) return null;
  const topIn = Array.isArray(v.top) ? v.top.slice(0, 6) : [];
  const top: { label: string; n: number }[] = [];
  for (const row of topIn) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const n = num(r.n, 2_000_000);
    if (typeof r.label !== "string" || n == null) continue;
    top.push({ label: r.label.slice(0, 80), n });
  }
  return {
    label: v.label.slice(0, 160),
    frame: v.frame.slice(0, 80),
    total,
    inService,
    top,
  };
}

function cleanMessages(value: unknown): ChatTurn[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 8) return null;
  const out: ChatTurn[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object") return null;
    const r = row as Record<string, unknown>;
    if ((r.role !== "user" && r.role !== "assistant") || typeof r.content !== "string") return null;
    const content = r.content.trim().slice(0, 2500);
    if (!content) return null;
    out.push({ role: r.role, content });
  }
  if (out[out.length - 1]?.role !== "user") return null;
  return out;
}

function lawBlock(): string {
  const rows = LAW_ROWS.map(
    (row) => `- ${row.where}: ${row.instrument}. ${row.does} Standing: ${row.standing}`,
  ).join("\n");
  const gaps = EXPANSION.map((item) => `- ${item.title}. ${item.body}`).join("\n");
  return `LEGAL RECORD YOU MAY RELY ON (do not upgrade "introduced" into "passed"):\n${rows}\n\nHOW THE PRACTICE EXPANDED THROUGH GAPS THAT ALREADY EXIST:\n${gaps}\n\nCASE FOR KEEPING THE CAMERAS:\n${CASE_FOR.map((x) => `- ${x}`).join("\n")}\n\nCASE AGAINST:\n${CASE_AGAINST.map((x) => `- ${x}`).join("\n")}`;
}

function buildSystem(snapshot: SnapshotStats, view: ViewStats | null): string {
  const viewLine = view
    ? `Current map frame "${view.label}" (${view.frame}): ${view.total.toLocaleString()} archive records inside it, ${view.inService.toLocaleString()} marked in service. Top types: ${view.top.map((t) => `${t.label} ${t.n.toLocaleString()}`).join("; ") || "none"}. You may cite these frame numbers. They are this archive, not a live census.`
    : "No map frame is selected. You do not know where the person is. Do not guess a city, a state, or a ZIP, and do not offer an example place. Ask them to name the area. If they do, set place and zoom so the app can count, and say the number will appear from the archive under your reply. Do not invent a count.";

  return `You are the briefing desk inside "The internet did the oversight for free," an independent offline archive of a published Flock device table. You are not Flock Safety, not a lawyer, and not a plate lookup.

SNAPSHOT THIS APP LOADED
${snapshot.total.toLocaleString()} rows. In service ${snapshot.inService.toLocaleString()}. Planned ${snapshot.inPlanning.toLocaleString()}. Decommissioned ${snapshot.decommissioned.toLocaleString()}. Other status ${snapshot.other.toLocaleString()}. Active flag ${snapshot.activeFlag.toLocaleString()}.
The table was mirrored from Joshua Michael's public file at flocksurveillance.org (origin file dated 28 Aug 2026; he describes a December 2025 export). A check on 29 Sep 2026 still found that same last-modified date. A shared coordinate is a lead, not proof of a room. The Intercept reported on 24 Sep 2026 that the company had told reporters it ran about 120,000 cameras, while this table is a larger mix of cameras and other gear. Do not invent a newer device count. If the user asks whether the table changed, say the app's source check compares a live hash to the mirror, and you do not have that button's result unless the message includes it.

${viewLine}

MAP CONTROL
You do not know the person's area. Never pick a place for them, never use a sample city, and never name a state transportation department unless they named that place or that agency in this chat. If they have not named an area, ask them to. City and state, or a ZIP.
If they name a US city, state, ZIP, or street, return that place and only that place. Otherwise place is null and zoom is null.
- state: the state name only, zoom "state"
- city: "City, ST", zoom "city"
- zip: five digits, zoom "zip"
- street: a street address, zoom "street"
Do not invent a place they did not ask to see. Do not claim you already moved the map.

HOW TO ANSWER
Plain English. Short paragraphs. No markdown headings. Both sides, in good faith, when the question is a debate. Name the instrument. Say whether it is enacted, an introduced bill, a company statement, or contested reporting. If you are not sure a bill number or a year, say you are not sure. Never turn a company letter into an audit.
Cover mass-surveillance questions beyond this one vendor when asked: cell-site warrants after Carpenter, data brokers, fusion centers, real-time crime centers, face and voice capture. Stay accurate. People disagree, and you say so.
The "loopholes" the user is asking about are the lawful gaps that let the surveillance practice grow: private ownership, shared logins, third-party arguments, hot lists versus historical search, retention floors versus caps, highway permits that do not touch city streets, and funding bills that are not removal crews. Explain those gaps as they work today. Do not write them as a guide to beating a camera, evading a stop, stalking a person, or getting away with a crime.

REFUSE, IN ONE SHORT PARAGRAPH, THEN OFFER THE PUBLIC RECORD
- How to disable, steal, blind, or attack a device
- How to re-enter a vendor system, tokens, or exploit steps
- How to track a named private person, or run their plate
- Turn-by-turn help evading police
You may still say what the published archive shows about a place, and you may still explain the law.

${lawBlock()}

${SUIT_FOR_DESK}

Sibling desks, if the user wants the deep file rather than the big picture: flockoff.grok.me is the unofficial H.R. 10221 desk (not the House clerk). revokeflock.grok.me is the right-of-way record. This desk is the national table and the legal picture around it. Do not steer them to a state they did not name.

Reply as JSON only: {"answer":"string","place":null|"string","zoom":null|"state"|"city"|"zip"|"street"}`;
}

export const askArchive = createServerFn({ method: "POST" })
  .validator((input: unknown) => input)
  .handler(async ({ data }): Promise<AskResult> => {
    const body = data as Record<string, unknown> | null;
    const messages = cleanMessages(body?.messages);
    const snapshot = cleanSnapshot(body?.snapshot);
    const view = body?.view == null ? null : cleanView(body.view);
    if (!messages || !snapshot || (body?.view != null && !view)) {
      return { ok: false, error: "That question could not be sent." };
    }

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "The briefing desk is not available in this copy." };

    let res: Response;
    try {
      res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.3,
          max_tokens: 800,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: buildSystem(snapshot, view) },
            ...messages,
          ],
        }),
      });
    } catch {
      return { ok: false, error: "The briefing desk could not be reached." };
    }

    if (!res.ok) {
      return { ok: false, error: `The briefing desk returned an error (${res.status}).` };
    }

    const payload = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = payload.choices?.[0]?.message?.content?.trim() ?? "";
    if (!raw) return { ok: false, error: "The briefing desk returned an empty answer." };
    return { ok: true, ...parseReply(raw) };
  });

function parseReply(raw: string): { answer: string; place: string | null; zoom: ZoomKind | null } {
  let text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced?.[1]) text = fenced[1].trim();
  try {
    const parsed = JSON.parse(text) as { answer?: unknown; place?: unknown; zoom?: unknown };
    const answer = typeof parsed.answer === "string" ? parsed.answer.trim() : "";
    const place =
      typeof parsed.place === "string" && parsed.place.trim() ? parsed.place.trim().slice(0, 160) : null;
    const zoom = ZOOM.includes(parsed.zoom as ZoomKind) ? (parsed.zoom as ZoomKind) : null;
    return {
      answer: answer || raw.trim(),
      place,
      zoom: place ? zoom ?? "city" : null,
    };
  } catch {
    return { answer: raw.trim(), place: null, zoom: null };
  }
}
