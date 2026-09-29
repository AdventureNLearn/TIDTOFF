import { DOCKET_NOTE, ORIGIN_NOTE, PATENTS, PIPELINE, SUIT } from "@/lib/suit";

export function SuitPanel() {
  return (
    <article className="min-h-0 flex-1 space-y-8 overflow-y-auto px-4 py-4 text-sm leading-relaxed">
      <header>
        <p className="text-xs font-medium tracking-widest text-signal uppercase">Allegation, not a ruling</p>
        <h2 className="mt-2 font-serif text-3xl leading-tight">The stack, as the complaint tells it</h2>
        <p className="mt-3 text-muted">
          {SUIT.plaintiff} v. {SUIT.defendant}. {SUIT.court}. {SUIT.caseNo}. Filed {SUIT.filed}.{" "}
          {SUIT.judge}. Served {SUIT.served}. Answer due {SUIT.answerDue}.
        </p>
      </header>

      <section>
        <h3 className="font-serif text-xl">What is actually on the docket</h3>
        <p className="mt-2 text-muted">{DOCKET_NOTE}</p>
        <p className="mt-2">
          <a
            className="text-fg underline decoration-line underline-offset-4"
            href={SUIT.complaint}
          >
            Complaint, CourtListener RECAP
          </a>
        </p>
      </section>

      <section>
        <h3 className="font-serif text-xl">Nine steps</h3>
        <p className="mt-2 text-muted">
          This is the pipeline the pleading describes, from the pole to the alert. It is not a wiring
          diagram from the company, and it is not a how-to.
        </p>
        <ol className="mt-4 space-y-4">
          {PIPELINE.map((step) => (
            <li key={step.n} className="border-l-2 border-signal pl-3">
              <p className="text-xs tracking-widest text-signal uppercase">
                {step.n} · {step.title}
              </p>
              <p className="mt-1">{step.does}</p>
              <p className="mt-1 text-xs text-muted">{step.standing}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="font-serif text-xl">Where the plaintiff says the idea came from</h3>
        <p className="mt-2 text-muted">{ORIGIN_NOTE}</p>
      </section>

      <section>
        <h3 className="font-serif text-xl">Patents named in paragraph 1</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-xs">
            <thead className="text-muted">
              <tr>
                <th className="py-2 pr-3 font-medium">Patent</th>
                <th className="py-2 pr-3 font-medium">Claims</th>
                <th className="py-2 pr-3 font-medium">What the complaint calls it</th>
                <th className="py-2 font-medium">Issued</th>
              </tr>
            </thead>
            <tbody>
              {PATENTS.map((row) => (
                <tr key={row.number} className="border-t border-line align-top">
                  <td className="py-2 pr-3">{row.number}</td>
                  <td className="py-2 pr-3">{row.claims}</td>
                  <td className="py-2 pr-3">{row.title}</td>
                  <td className="py-2">{row.issued}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Titles are printed here only when the complaint states them. The other five are still asserted.
          This desk did not invent titles for them.
        </p>
      </section>
    </article>
  );
}
