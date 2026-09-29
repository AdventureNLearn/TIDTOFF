/** Patent complaint record. Allegations are labeled. Nothing here is a ruling. */

export const SUIT = {
  caseNo: "1:26-cv-01141",
  court: "U.S. District Court for the District of Delaware",
  filed: "10 Sep 2026",
  plaintiff: "SecureNet Solutions Group, LLC",
  defendant: "Flock Group Inc. d/b/a Flock Safety",
  judge: "Unassigned, on the public docket read 29 Sep 2026",
  served: "11 Sep 2026",
  answerDue: "2 Oct 2026",
  complaint:
    "https://storage.courtlistener.com/recap/gov.uscourts.ded.94595/gov.uscourts.ded.94595.1.0.pdf",
};

export const PATENTS = [
  {
    number: "12,375,342",
    claims: "12, 17, 20",
    title: "Correlation engine for correlating sensory events",
    issued: "29 Jul 2025",
    stage: "Correlate",
  },
  {
    number: "11,323,314",
    claims: "13, 21",
    title: "Hierarchical data storage and correlation system",
    issued: "3 May 2022",
    stage: "Store",
  },
  { number: "9,344,616", claims: "48", title: "Title not stated in the complaint", issued: "Not stated", stage: "Asserted" },
  { number: "11,929,870", claims: "1, 12, 20", title: "Title not stated in the complaint", issued: "Not stated", stage: "Asserted" },
  { number: "9,619,984", claims: "10", title: "Title not stated in the complaint", issued: "Not stated", stage: "Asserted" },
  { number: "10,587,460", claims: "11, 13, 14", title: "Title not stated in the complaint", issued: "Not stated", stage: "Asserted" },
  { number: "10,862,744", claims: "16, 26", title: "Title not stated in the complaint", issued: "Not stated", stage: "Asserted" },
];

export type PipeStep = {
  n: string;
  title: string;
  does: string;
  standing: string;
};

/** The stack the complaint describes. Each step says how sure the paper is. */
export const PIPELINE: PipeStep[] = [
  {
    n: "01",
    title: "The pole",
    does: "The complaint names Falcon plate cameras and the Raven audio box as accused products, along with the software that ties them together. A camera on a pole is the start of the file, not the whole system.",
    standing: "Named in the complaint, paragraph 2. Not a finding that the hardware infringes.",
  },
  {
    n: "02",
    title: "On the device",
    does: "The complaint says Falcon cameras detect motion, classify a vehicle and a plate, and keep a temporary copy before anything is sent. It also says the cameras report connectivity and health over an LTE link.",
    standing: "Alleged product behavior, including paragraphs 149 and 150. Read those paragraphs before treating a brochure as the claim.",
  },
  {
    n: "03",
    title: "Vehicle Fingerprint",
    does: "The complaint describes this as machine vision that reads a plate and a state, then traits such as color, type, make, a roof rack, or a bumper sticker, with a confidence score and a cutoff.",
    standing: "Plaintiff’s description of the product. The company has used the same product name in its own materials. A shared name is not an admission of infringement.",
  },
  {
    n: "04",
    title: "Into the cloud",
    does: "The complaint says events are stored for later search, and — on information and belief — that storage cascades from the camera, to AWS, to AWS GovCloud when the data is criminal-justice information.",
    standing: "The cascade is pleaded “on information and belief.” That is a claim, not a document this desk has from the vendor.",
  },
  {
    n: "05",
    title: "One format",
    does: "The complaint says Vehicle Fingerprint and FlockOS turn camera, plate, and other sensor events into one searchable record so a later search does not care which device saw the car.",
    standing: "Allegation, including paragraph 152. This is the “normalize” step in the older patents’ own diagrams, which the complaint retells.",
  },
  {
    n: "06",
    title: "Across time and place",
    does: "The complaint says Enhanced LPR and FlockOS can look across more than one camera and more than one time, and it names Multi-Geo Search and Convoy Search as examples. The ‘342 patent, as titled in the complaint, is a correlation engine for sensory events.",
    standing: "Allegation, including paragraph 153. Correlation is what the plaintiff says it patented after a 2007 workshop. See the origin note. Not a finding that these buttons infringe.",
  },
  {
    n: "07",
    title: "Other people’s files",
    does: "The complaint says FlockOS takes in hot lists, BOLOs, NCIC, computer-aided dispatch, records systems, 911, drone-as-first-responder feeds, gunshot alerts, NCMEC, and AMBER alerts, then matches those against a camera event.",
    standing: "Alleged integrations, including paragraphs 189 and 208. Some are pleaded on information and belief. A match on a hot list is the use agencies defend. The history around it is the use critics fight.",
  },
  {
    n: "08",
    title: "The alert",
    does: "The complaint says the platform watches events as they arrive and can notify when a plate or a description hits a list. That is the product the safety case is built on: a stolen car, a warrant, an Amber alert.",
    standing: "Alleged, including paragraphs 154 and 180. Whether that alert is a search under the Fourth Amendment is a different case. This docket is a patent case.",
  },
  {
    n: "09",
    title: "How long the file lives",
    does: "The complaint alleges a 30-day rolling default and rules that move or delete data. Separately, the company’s 8 Sep 2026 letter to a senator said new law-enforcement customers are steered to 7 days, and that about 3 percent keep data more than 30 days.",
    standing: "Two statements, not one audit. The complaint is a pleading. The letter is the company speaking. Neither is a ruling about what a given city keeps.",
  },
];

export const ORIGIN_NOTE =
  "Paragraph 9 says the inventors conceived the inventions after a three-day workshop with CLEMIS, the IT shop for the Oakland County, Michigan confederation of police departments, and it calls 2007 the priority date. That is the plaintiff’s origin story for the patents. The complaint does not say the defendant was in that room. A social post on 29 Sep 2026 folded those sentences into “Flock copied a police workshop.” The paper does not say that.";

export const DOCKET_NOTE =
  "Filed 10 Sep 2026. Summons returned: served 11 Sep 2026, answer due 2 Oct 2026. On 29 Sep 2026 the public docket still listed the judge as unassigned, and this desk had not read an answer. A social post that day said the company calls the suit meritless and says it built the system itself. That sentence was not in the complaint and not in an answer this desk has read. People disagree. There is no ruling.";

export const SUIT_FOR_DESK = `PATENT CASE, AS OF 29 SEP 2026 (allegation, not a ruling):
SecureNet Solutions Group, LLC v. Flock Group Inc. d/b/a Flock Safety, D. Del. 1:26-cv-01141, complaint filed 10 Sep 2026. Judge was still unassigned on the public docket. Served 11 Sep 2026. Answer due 2 Oct 2026. No answer was in the docket this app’s record read. Do not say a court found infringement or found the suit meritless.
Asserted patents and claims from paragraph 1: 12,375,342 (claims 12, 17, 20; complaint title “Correlation engine for correlating sensory events,” issued 29 Jul 2025); 11,323,314 (claims 13, 21; hierarchical storage and correlation, issued 3 May 2022); 9,344,616 (claim 48); 11,929,870 (claims 1, 12, 20); 9,619,984 (claim 10); 10,587,460 (claims 11, 13, 14); 10,862,744 (claims 16, 26).
Accused products named in paragraph 2: Falcon LPR, Vehicle Fingerprint, FlockOS real-time crime center, Enhanced LPR, Flock Safety Platform, Raven audio.
Paragraph 9: inventors say they conceived the inventions after a three-day CLEMIS workshop with Oakland County, Michigan police IT, priority date 2007. Do not upgrade that into “the defendant attended” or “the defendant copied the workshop.”
A 27 Jan 2026 letter to Dan Haley, the company’s chief legal officer, is the complaint’s basis for willfulness. That is an allegation of notice.
Pipeline the complaint describes, in order: device capture, on-device classification and temporary storage, Vehicle Fingerprint traits and confidence, cloud storage (the AWS / GovCloud cascade is “on information and belief”), normalize to one record, correlate across time and place (Multi-Geo, Convoy), join hot lists / NCIC / CAD / RMS / 911 / AMBER, alert, retain or delete. The complaint alleges a 30-day rolling default. The company’s 8 Sep 2026 letter described a 7-day default for new law-enforcement customers. Say both, and say they are not an audit.
Do not describe how to damage, blind, or steal a camera. Do not treat a social-media claim that protesters smashed cameras as a method.`;
