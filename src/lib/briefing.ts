/**
 * Big-picture record. Counts of devices come from the mirrored table.
 * Law here is labeled: enacted, introduced, company statement, or compilation.
 * Narrower desks: flockoff.grok.me (one federal bill), revokeflock.grok.me (right-of-way).
 */

export type LawRow = {
  where: string;
  instrument: string;
  does: string;
  standing: string;
};

export const LAW_ROWS: LawRow[] = [
  {
    where: "United States",
    instrument: "No comprehensive ALPR statute",
    does: "Nothing in federal law sets one national rule for how long a plate read may be kept, who may search it, or whether a warrant comes first.",
    standing: "Record. CRS IN12735 (2 Sep 2026) and state compilations updated through late September 2026 agree on the gap. They disagree on how many states have filled it.",
  },
  {
    where: "Congress",
    instrument: "H.R. 10221 (Massie)",
    does: "Would prohibit federal funds for covered camera systems — plate readers and biometric capture — and the hardware, software, and cloud stack around them.",
    standing: "Introduced 2 Sep 2026. Referred to House Oversight. As of the Congress.gov cosponsor list read 29 Sep 2026: 8 cosponsors, the last added 14 Sep, no markup, not a vote. The count moves. Check the clerk.",
  },
  {
    where: "Congress",
    instrument: "FLAFO Act (Steube)",
    does: "Circulating House text would restrict governmental use of automated license-plate reader systems.",
    standing: "Introduced paper, September 2026. Not law.",
  },
  {
    where: "Congress",
    instrument: "H.R. 9800, H.R. 9716, H.R. 8470",
    does: "CRS described three introduced approaches: a funding restriction aimed at this class of system, a warrant before federal agents use the data, and a warrant for certain third-party data that does not carve plate readers out.",
    standing: "Introduced. CRS insight IN12735, 2 Sep 2026. Not law.",
  },
  {
    where: "Congress",
    instrument: "“No FLOCK Act” announcement",
    does: "Office press from Reps. Krishnamoorthi and Cloud (15 Sep 2026) described a bill that would withhold a slice of federal highway money from states that do not limit plate-reader uses. Cuts, if the bill passed this year, were described as starting later.",
    standing: "Office announcement. As of 17 Sep 2026 no H.R. number had been pinned down in public compilations. Not law, and not a substitute for H.R. 10221.",
  },
  {
    where: "Virginia",
    instrument: "HB 2724, reported at Va. Code § 2.2-5517",
    does: "Plate data purged 21 days after capture, effective 1 Jul 2025, in a way neither the agency nor the vendor can undo.",
    standing: "Enacted, as reported by 2026 statutory compilations. Read the code before you rely on a paraphrase.",
  },
  {
    where: "Illinois",
    instrument: "625 ILCS 5/2-130",
    does: "Archives data on a short clock and bars some out-of-state sharing, including for immigration and reproductive-care investigations.",
    standing: "Statute on the books. A 2026 secretary-of-state audit, reported publicly, said a federal pilot reached further than some departments had authorized. The audit is contested reporting, not this map.",
  },
  {
    where: "New Hampshire",
    instrument: "RSA 261:75-b",
    does: "Purge within about three minutes unless the plate hits a hot list.",
    standing: "The shortest cap in the compilations. Hot-list hits are the door that stays open.",
  },
  {
    where: "Maine",
    instrument: "29-A M.R.S. § 2117-A",
    does: "About 21 days, and use tied to specific articulable facts. Misuse is an offense.",
    standing: "Compilation. Confirm the section.",
  },
  {
    where: "California",
    instrument: "Civil Code §§ 1798.90.5–1798.90.55",
    does: "Limits who may receive ALPR data. The headline is sharing, not a single retention number.",
    standing: "Enacted framework (SB 34 era). Practice still depends on the agency’s own policy.",
  },
  {
    where: "Washington",
    instrument: "SB 6002, effective 30 Mar 2026",
    does: "Restricts uses, sets retention by purpose (parking, traffic study, evidence), and tells agencies to register systems with the attorney general.",
    standing: "Session law, as explained by MRSC in April 2026. That explainer named 30 Sep 2026 as the registration date. As of 29 Sep 2026 this desk has not confirmed which agencies finished.",
  },
  {
    where: "New Jersey",
    instrument: "AG Directive 2022-12",
    does: "Tells law enforcement to keep plate-reader data for three years.",
    standing: "A floor, not a cap. Some rules force deletion. This one forces retention. Cited in the company’s 8 Sep 2026 letter to Sen. Hawley.",
  },
  {
    where: "Vendor default",
    instrument: "Flock letter, 8 Sep 2026",
    does: "The company told a senator that new law-enforcement customers are steered to a 7-day default, that longer retention needs an elected body, and that about 3% of those customers keep data more than 30 days.",
    standing: "Company statement. Not an independent audit. Existing customers can keep the old window.",
  },
  {
    where: "Delaware",
    instrument: "1:26-cv-01141, SecureNet v. Flock Group",
    does: "A patent complaint filed 10 Sep 2026 says seven patents cover the path from the camera to a searchable, correlated record. Served 11 Sep. Answer due 2 Oct 2026.",
    standing: "Allegation. Public docket read 29 Sep 2026 still showed an unassigned judge and no answer. Not a ruling either way. The Suit tab is the pipeline, labeled paragraph by paragraph.",
  },
];

export const EXPANSION = [
  {
    title: "No federal statute, so the contract is the policy",
    body: "Where a state has not set a cap, a warrant rule, or a sharing ban, the sales contract and the agency’s own policy are the rule. A city council can buy a national search window without a new statute. A later statute can shrink that window. Until it does, the paperwork is the law of that town.",
  },
  {
    title: "The city buys a login, not a camera",
    body: "The vendor owns the device and the database. The agency subscribes. That split is the argument: the government says it is searching a private party’s records, and the private party says it is providing a service the government specified. Carpenter v. United States (2018) required a warrant for historical cell-site locations. Courts have not agreed on whether a year of plate reads on public roads is the same kind of record. That split is the gap the network grew through.",
  },
  {
    title: "One agency’s reads, another agency’s search",
    body: "A shared pool means a department that never installed a camera can still query one. State laws that limit out-of-state or immigration searches try to close this. They close it only for the agencies and the uses the text names, and only if the login is actually cut off. Public reporting in 2026 described federal pilots that reached cameras whose local clients had not asked for that. Treat those stories as reporting, then read the audit.",
  },
  {
    title: "Private lots sit on the same network",
    body: "Homeowner associations, retailers, schools, and neighborhoods can put devices on the same system police search. A state transportation department can pull cameras out of its own highway right-of-way and still leave a grocery lot or a city street untouched. The permit and the private contract are different doors.",
  },
  {
    title: "The hot list is instant. The history is the fight.",
    body: "A plate on a public road is visible to anyone standing there. Agencies argue a camera is that glance, logged, and a hot-list hit (stolen car, Amber alert, felony warrant) is the glance that matters. Opponents argue the log is everyone else: months of innocent trips, searchable later. Many places still allow the historical search under the “public road” theory. A few require a warrant or a short fuse. New Hampshire’s three-minute rule is the short fuse. New Jersey’s three-year directive is the opposite choice.",
  },
  {
    title: "Deletion rules and retention floors",
    body: "A 7-day company default does not bind a customer that voted to keep data, and it does not override a state that ordered a longer hold. Caps (Virginia’s 21 days, Maine’s 21 days) and floors (New Jersey’s three years) are both “the law.” They expand or shrink the practice in opposite directions. In states with neither, nothing automatic deletes the file.",
  },
  {
    title: "The dossier is the second product",
    body: "The camera records a plate, a time, a place, and often a vehicle description. Public descriptions of the investigation products — including the publisher of this dataset — say a later tool can join that plate to commercial identity data: names, addresses, and phone-location products sold by brokers. That second hop is governed by data-broker and privacy statutes, not by the camera ordinance, when it is governed at all. The map in this app is only the first hop: where the devices were.",
  },
  {
    title: "Funding bills are leverage, not a removal crew",
    body: "H.R. 10221 and the highway-money proposals would change who can spend federal dollars. They would not, even if they passed, uninstall a camera a city paid for itself. None of them are law in this briefing. An executive order in one state, such as Missouri’s reported EO 26-18 (September 2026: a 30-day delete at state agencies, no sale of the data), binds that state’s agencies. It is not a statute, and it is not national.",
  },
];

export const CASE_FOR = [
  "Stolen vehicles, Amber and Silver alerts, and felony warrants are the use everyone names, including the sponsors of the limits.",
  "Hit-and-run and violent-crime investigations get a time and a place without waiting on a witness.",
  "A plate displayed on a public road is not a hidden fact. The safety case says logging that glance is ordinary police work, and that audit logs plus short retention are the safeguard.",
  "Agencies point at solves. The company’s September 2026 letter argues most law-enforcement customers already keep data 30 days or less.",
];

export const CASE_AGAINST = [
  "The log is not the suspect list. It is every car that passed, kept long enough to reconstruct a life.",
  "Misreads and shared logins have been documented, including officers searching for reasons that were not a case. A search box does not police itself.",
  "Mission creep is the pattern: a tool sold for stolen cars gets used for civil matters, immigration, or a personal grudge when the login allows it.",
  "People who never enter the system still change their route, their clinic, their protest, or their house of worship because the pole is there. That cost does not show up in a solve rate.",
  "Error is not symmetrical. A false hit pulls a car over. A missed audit does not.",
];
