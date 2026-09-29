# The internet did the oversight for free

A public mirror of a public table.

**335,701** devices. One row each. No account. No vendor login. No live feed.

The file is [`public/data/cameras.archive`](public/data/cameras.archive). The column list is [`public/data/SCHEMA.txt`](public/data/SCHEMA.txt). The checksum is [`public/data/manifest.json`](public/data/manifest.json).

This repository did not discover the network. It kept a copy of a file someone else had already put where anyone could read it, and it built a map that still works when that site is under pressure.

---

## Thank you

The rows in this box have one publisher.

**Joshua Michael** archived a December 2025 snapshot of device locations from Flock’s own mapping system, after he reported an unauthenticated exposure in November 2025. He published the table and the map at [flocksurveillance.org](https://flocksurveillance.org/). The file this repo mirrors was last modified on that site on **28 August 2026**. This copy was taken **27 September 2026**.

He checked sites in person. He said what the export was and what it was not. He put a disclaimer on the map: it is not affiliated with or endorsed by Flock. When a trademark complaint asked for the map to come down, the table was already in public. That is the whole reason a mirror can exist.

Thank you, Joshua. The count, the names, the status flags, and the coordinates in this repository are your published file. This project does not relicense them. If you set terms, those terms win.

### The other map, built one pole at a time

This table is **not** the crowdsourced map. Saying so is part of the thanks. Those people did a different and harder thing, and they should not be folded into someone else’s export.

**Will Freeman** started **DeFlock** after a road trip where the cameras would not stop showing up. The app lets a person standing on a public street mark a plate reader, with a free OpenStreetMap account, and the mark stays in the commons. DeFlock is volunteer software on top of that commons. The New York Times reported the app past 350,000 downloads and on the order of 125,000 plotted readers, Flock and otherwise. Those numbers move. The point does not.

**OpenStreetMap contributors**, most of them unnamed, walked the blocks, tagged `surveillance:type=ALPR`, and sometimes wrote down who made the camera and which way it faces. Their data is © OpenStreetMap contributors, under the [Open Database License](https://opendatacommons.org/licenses/odbl/). This archive is **not** that database and is **not** under that license. Projects that republish the street survey — DeFlock, and others that say so on their own pages — owe that attribution. This repository owes them a different debt: they proved a camera can be documented without asking the vendor for permission to look.

If you have stood under a pole and added a node, this file is not your node. Thank you anyway. A published export and a person with a phone are the two ways the public got a map at all. Both were gifts. Only one of them is in `cameras.archive`.

### The people who would not let the link die

**Orwell Day** ([@OrwellDay](https://x.com/OrwellDay)) put the map back in front of the timeline. The post that sent people to the table is [this one](https://x.com/OrwellDay/status/2104020067398943122), 26 September 2026: the researcher, the gap between the company’s public camera count and the device count in the export, and the link. He did not collect the rows. He made sure the rows were not a private URL.

Thank you to everyone who copied the file, mirrored the site, or handed the link to one more person while a takedown notice was already in motion. This repository does not have your names. The thanks does not need them. A table that exists in only one place is a table someone else can delete.

### The written record

**The Intercept** (24 September 2026) wrote down the method in public: a snapshot, not a street survey; a report to the company before the download; a map of cameras plus the gear around them; a citation of the findings the same week in a Senate crime and counterterrorism hearing. Later writeups at Newsweek, Cybernews, and Tom’s Hardware carried the same distinction. They are not data donors. They are why a reader can check the story without taking this README’s word for it.

[The Intercept: Flock wants the most detailed map of its cameras taken down](https://theintercept.com/2026/09/24/how-many-flock-devices-in-united-states-300000/)

---

## What is in the box

| | |
|---|---|
| Rows after the header | 335,701 |
| In service | 214,073 |
| In planning | 83,427 |
| Decommissioned | 38,190 |
| Other | 11 |
| Uncompressed size | 50,291,519 bytes |
| Uncompressed SHA-256 | `ad59797d1fd80599dc030e1fab0db0f26e5cd8299a519038803fc2014a85bf44` |
| Origin | `https://flocksurveillance.org/data/cameras.tsv` |
| Origin last-modified | 2026-08-28 |
| This mirror | 2026-09-27 |
| Export, as the publisher described it | December 2025 |

The file is gzip. The extension is `.archive` on purpose. A `.gz` URL was getting unpacked by the browser and then unpacked again. Save it as `cameras.tsv.gz` if you want the usual name.

Columns, in order: `lat`, `lon`, `type`, `status`, `active`, `name`, `features`, `rotationAngle`, `OBJECTID`, `externalId`, `networkExternalId`, `organizationId`, `networkId`, `CreationDate`, `parentExternalId`.

```bash
gunzip -c public/data/cameras.archive > cameras.tsv
```

The running app fetches that file, decompresses it in the browser, and draws it. It does not send the table to a server.

A shared coordinate is a lead, not proof of a room. These points were not re-surveyed here. A device can move, get covered, or be mislabeled, and the row will still say what the snapshot said.

---

## What this is not

- Not affiliated with or endorsed by Flock Safety.
- Not a permit roster, not a live camera, and not a plate search.
- Not instructions for getting back into anyone’s system. The exposure was reported. This copy has no tokens and no path back.
- Not the OpenStreetMap camera survey, and not a substitute for going outside and looking.

---

## The name

The internet did the oversight for free.

A company published a count. A researcher published a larger table and reported the hole he had used. Volunteers published the poles they could see. A timeline published the link. Reporters published the argument. This repository publishes the file, so the next person does not have to ask.

If you have a correction, open an issue. If you have a newer public table with a checksum, send that. Do not send exploits. Do not send anyone’s private life. The map is of devices, not of neighbors.
