export type StationId = "rock" | "country" | "classical";

export type Feed = {
  url: string;
  name: string;
  home: string;
};

export type Station = {
  id: StationId;
  genre: string;
  feeds: readonly Feed[];
};

/**
 * Direct public streams that played inside a browser audio element.
 * Country is WMOT, a public station whose stream names the genre Country,
 * with WSM’s Americana feed if that one drops.
 */
export const STATIONS: readonly Station[] = [
  {
    id: "rock",
    genre: "Rock",
    feeds: [
      {
        url: "https://kexp-mp3-128.streamguys1.com/kexp128.mp3",
        name: "KEXP 90.3",
        home: "Seattle public radio",
      },
      {
        url: "https://stream.radioparadise.com/rock-128",
        name: "Radio Paradise Rock",
        home: "Commercial-free rock mix",
      },
    ],
  },
  {
    id: "country",
    genre: "Country",
    feeds: [
      {
        url: "https://playerservices.streamtheworld.com/api/livestream-redirect/WMOTFM.mp3",
        name: "WMOT 89.5",
        home: "Public radio · country",
      },
      {
        url: "https://stream01050.westreamradio.com/wsm2-mp3",
        name: "WSM Americana",
        home: "Nashville",
      },
    ],
  },
  {
    id: "classical",
    genre: "Classical",
    feeds: [
      {
        url: "https://stream.wqxr.org/wqxr",
        name: "WQXR",
        home: "New York Public Radio",
      },
      {
        url: "https://audio-mp3.ibiblio.org/wcpe.mp3",
        name: "WCPE",
        home: "The Classical Station",
      },
    ],
  },
];

export function stationById(id: StationId): Station {
  const found = STATIONS.find((station) => station.id === id);
  if (!found) throw new Error("Unknown station");
  return found;
}
