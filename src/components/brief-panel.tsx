import { CASE_AGAINST, CASE_FOR, EXPANSION, LAW_ROWS } from "@/lib/briefing";

export function BriefPanel() {
  return (
    <article className="min-h-0 flex-1 space-y-8 overflow-y-auto px-4 py-4 text-sm leading-relaxed">
      <header>
        <p className="text-xs font-medium tracking-widest text-signal uppercase">The big picture</p>
        <h2 className="mt-2 font-serif text-3xl leading-tight">One table. The law around it. Both sides.</h2>
        <p className="mt-3 text-muted">
          Two narrower desks already exist. FLOCK OFF watches one House bill. ROW Record watches whose
          right-of-way a state can actually clear. This desk is the national device table those facts sit
          inside, and the gaps the network grew through.
        </p>
      </header>

      <section>
        <h3 className="font-serif text-xl">What the dots are</h3>
        <p className="mt-2 text-muted">
          335,701 rows in the file, mirrored from the public table Joshua Michael published. He describes a December 2025
          export. The file on his site was last modified 28 Aug 2026. Checked again 29 Sep 2026: that date had not moved.
          Use Check source to hash the live file and, if it ever differs, see the new rows on the map. A handful of rows have no usable coordinate
          and are not drawn. The rest are cameras and the gear around them:
          plate readers, video, audio, drones, trailers, boxes. The Intercept reported on 24 Sep 2026 that the
          company had told reporters it ran about 120,000 cameras. This table is larger, and it is not all
          cameras. In service, planned, and decommissioned are separate.
        </p>
        <p className="mt-2 text-muted">
          A shared coordinate is a lead, not proof of a room. This is not a live feed, not a permit roster, and
          not affiliated with Flock Safety. The company has tried to have the original map taken down. The
          table is hosted here so the picture does not depend on one website.
        </p>
      </section>

      <section>
        <h3 className="font-serif text-xl">There is still no federal plate-reader statute</h3>
        <p className="mt-2 text-muted">
          Nothing in federal law sets one rule for retention, search, or a warrant. Congress has paper in the
          hopper. Paper is not a vote. State law is a patchwork: some states force deletion, one directive
          forces a three-year hold, and many states leave it to the contract.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="py-2 pr-3 font-medium">Where</th>
                <th className="py-2 pr-3 font-medium">Instrument</th>
                <th className="py-2 pr-3 font-medium">What it does</th>
                <th className="py-2 font-medium">Standing</th>
              </tr>
            </thead>
            <tbody>
              {LAW_ROWS.map((row) => (
                <tr key={row.instrument} className="border-b border-line align-top">
                  <td className="py-2 pr-3 text-fg">{row.where}</td>
                  <td className="py-2 pr-3 text-fg">{row.instrument}</td>
                  <td className="py-2 pr-3 text-muted">{row.does}</td>
                  <td className="py-2 text-muted">{row.standing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-serif text-xl">How the network grew through the gaps</h3>
        <p className="mt-2 text-muted">
          These are the lawful doors the practice already walks through. They are not instructions for hiding
          from police, disabling a camera, or tracking a person.
        </p>
        <ol className="mt-3 space-y-4">
          {EXPANSION.map((item, index) => (
            <li key={item.title}>
              <p className="text-fg">
                <span className="mr-2 font-serif text-signal">{index + 1}</span>
                {item.title}
              </p>
              <p className="mt-1 text-muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4">
          <h3 className="font-serif text-xl">The case for</h3>
          <ul className="mt-3 space-y-2 text-muted">
            {CASE_FOR.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <h3 className="font-serif text-xl">The case against</h3>
          <ul className="mt-3 space-y-2 text-muted">
            {CASE_AGAINST.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h3 className="font-serif text-xl">Other desks</h3>
        <ul className="mt-2 space-y-2 text-muted">
          <li>
            <a className="text-fg underline decoration-line underline-offset-4" href="https://flockoff.grok.me">
              FLOCK OFF
            </a>{" "}
            — unofficial desk for H.R. 10221. Not the House clerk.
          </li>
          <li>
            <a className="text-fg underline decoration-line underline-offset-4" href="https://revokeflock.grok.me">
              ROW Record
            </a>{" "}
            — whose dirt, whose permit. State instruments, not a national ban.
          </li>
          <li>
            <a
              className="text-fg underline decoration-line underline-offset-4"
              href="https://www.congress.gov/bill/119th-congress/house-bill/10221"
            >
              H.R. 10221 on Congress.gov
            </a>
            .{" "}
            <a
              className="text-fg underline decoration-line underline-offset-4"
              href="https://www.congress.gov/crs-product/IN12735"
            >
              CRS on federal ALPR oversight
            </a>
            .{" "}
            <a
              className="text-fg underline decoration-line underline-offset-4"
              href="https://theintercept.com/2026/09/24/how-many-flock-devices-in-united-states-300000/"
            >
              The Intercept, 24 Sep 2026
            </a>
            .
          </li>
        </ul>
        <p className="mt-4 text-muted">
          Not legal advice. Not a plate search. The desk does not pick a place. Name your area.
        </p>
      </section>
    </article>
  );
}
