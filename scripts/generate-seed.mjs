// One-off deterministic seed generator for the Barangay Catarman fake database.
// Run with: node scripts/generate-seed.mjs
// Output: data/generated/*.json (consumed by typed wrappers in data/*.ts)
import { faker } from "@faker-js/faker"
import { writeFileSync, mkdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

faker.seed(20260803)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, "..", "data", "generated")
mkdirSync(OUT_DIR, { recursive: true })

const TODAY = new Date("2026-08-03T09:00:00+08:00")

const PUROKS = [
  "Purok 1 - Poblacion",
  "Purok 2 - Riverside",
  "Purok 3 - Mabuhay",
  "Purok 4 - San Isidro",
  "Purok 5 - Maligaya",
  "Purok 6 - Bagong Silang",
]

const STREETS = {
  "Purok 1 - Poblacion": ["Rizal Street", "Bonifacio Street", "Del Pilar Street", "National Highway"],
  "Purok 2 - Riverside": ["Riverside Drive", "Ilog Street", "Malakas Street"],
  "Purok 3 - Mabuhay": ["Mabuhay Street", "Kalayaan Avenue", "Sampaguita Street"],
  "Purok 4 - San Isidro": ["San Isidro Road", "Farmers Avenue", "Palay Street"],
  "Purok 5 - Maligaya": ["Maligaya Street", "Masagana Street", "Bougainvillea Street"],
  "Purok 6 - Bagong Silang": ["Bagong Silang Avenue", "Pag-asa Street", "Tagumpay Street"],
}

const MALE_FIRST_NAMES = [
  "Jose","Juan","Antonio","Ramon","Eduardo","Ricardo","Fernando","Roberto","Manuel","Carlos",
  "Miguel","Rafael","Alfredo","Ernesto","Rodrigo","Danilo","Renato","Rolando","Arnel","Bienvenido",
  "Dominic","Elmer","Ferdinand","Gilbert","Herminio","Ignacio","Jaime","Kristian","Leonardo","Marlon",
  "Noel","Oscar","Paulo","Reynaldo","Samuel","Teodoro","Vicente","Wilfredo","Andres","Benedicto",
]

const FEMALE_FIRST_NAMES = [
  "Maria","Ana","Rosario","Teresita","Corazon","Josefina","Remedios","Perla","Luzviminda","Imelda",
  "Cristina","Divina","Elena","Fe","Gloria","Herminia","Irene","Jocelyn","Karen","Leticia",
  "Marites","Norma","Ofelia","Precious","Rowena","Salve","Teresa","Vilma","Wilma","Yolanda",
  "Angelica","Bernadette","Charito","Dolores","Estrella","Filomena","Grace","Helen","Ivy","Judith",
]

const LAST_NAMES = [
  "Santos","Reyes","Cruz","Bautista","Ocampo","Garcia","Mendoza","Torres","Flores","Ramos",
  "Villanueva","Castillo","Aquino","Del Rosario","Salazar","Gonzales","Fernandez","Pascual","Domingo","Manalo",
  "Marquez","Navarro","Rivera","Soriano","Tolentino","Uy","Valdez","Ventura","Yap","Zamora",
  "Aguilar","Bernardo","Concepcion","De Leon","Espiritu","Francisco","Guevarra","Herrera","Ignacio","Javier",
]

const RELIGIONS = ["Roman Catholic","Roman Catholic","Roman Catholic","Iglesia ni Cristo","Born Again Christian","Baptist","Aglipayan","Islam","Seventh-day Adventist"]
const OCCUPATIONS = ["Farmer","Fisherfolk","Tricycle Driver","Sari-Sari Store Owner","Public School Teacher","Construction Worker","OFW","Government Employee","Vendor","Carpenter","Private Employee","Self-Employed","Barangay Health Worker","Unemployed","Student","Retired"]
const EDUCATION = ["Elementary Undergraduate","Elementary Graduate","High School Undergraduate","High School Graduate","Senior High School Graduate","Vocational Graduate","College Undergraduate","College Graduate","Post Graduate"]
const CIVIL_STATUSES = ["Single","Married","Married","Widowed","Separated"]

function randOf(arr) {
  return faker.helpers.arrayElement(arr)
}
function randMany(arr, count) {
  return faker.helpers.arrayElements(arr, count)
}
function pad(n, len = 4) {
  return String(n).padStart(len, "0")
}
function daysAgo(days) {
  const d = new Date(TODAY)
  d.setDate(d.getDate() - days)
  return d
}
function daysFromNow(days) {
  const d = new Date(TODAY)
  d.setDate(d.getDate() + days)
  return d
}
function iso(d) {
  return d.toISOString()
}
function isoDateOnly(d) {
  return d.toISOString().split("T")[0]
}

// ---------------------------------------------------------------------------
// OFFICIALS
// ---------------------------------------------------------------------------
const COMMITTEES = ["Peace and Order","Health and Sanitation","Education and Youth Development","Infrastructure and Public Works","Environmental Protection","Women and Family","Appropriations and Finance"]

const officials = []
let officialOrder = 1

officials.push({
  id: "off-001",
  name: "Hon. Ramon Villanueva Cruz",
  position: "Punong Barangay",
  committee: "Executive",
  photoUrl: "",
  order: officialOrder++,
  termStart: "2023-11-01",
  termEnd: "2026-10-31",
  contactNumber: "0917-234-5678",
  email: "captain@barangaycatarman.gov.ph",
})

for (let i = 0; i < 7; i++) {
  const male = faker.datatype.boolean()
  const first = randOf(male ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES)
  const last = randOf(LAST_NAMES)
  officials.push({
    id: `off-${pad(officialOrder, 3)}`,
    name: `Hon. ${first} ${last}`,
    position: "Barangay Kagawad",
    committee: COMMITTEES[i],
    photoUrl: "",
    order: officialOrder++,
    termStart: "2023-11-01",
    termEnd: "2026-10-31",
    contactNumber: faker.phone.number("09## ### ####"),
    email: `kagawad.${last.toLowerCase().replace(/\s/g, "")}@barangaycatarman.gov.ph`,
  })
}

officials.push({
  id: `off-${pad(officialOrder, 3)}`,
  name: "Hon. Kristine Mae Domingo",
  position: "SK Chairperson",
  committee: "Sangguniang Kabataan",
  photoUrl: "",
  order: officialOrder++,
  termStart: "2023-11-01",
  termEnd: "2026-10-31",
  contactNumber: faker.phone.number("09## ### ####"),
  email: "sk.chairperson@barangaycatarman.gov.ph",
})

officials.push({
  id: `off-${pad(officialOrder, 3)}`,
  name: "Ms. Herminia Salazar Torres",
  position: "Barangay Secretary",
  committee: "Administration",
  photoUrl: "",
  order: officialOrder++,
  termStart: "2023-11-01",
  termEnd: "2026-10-31",
  contactNumber: faker.phone.number("09## ### ####"),
  email: "secretary@barangaycatarman.gov.ph",
})

officials.push({
  id: `off-${pad(officialOrder, 3)}`,
  name: "Mr. Danilo Fernandez Reyes",
  position: "Barangay Treasurer",
  committee: "Finance",
  photoUrl: "",
  order: officialOrder++,
  termStart: "2023-11-01",
  termEnd: "2026-10-31",
  contactNumber: faker.phone.number("09## ### ####"),
  email: "treasurer@barangaycatarman.gov.ph",
})

// ---------------------------------------------------------------------------
// RESIDENTS + HOUSEHOLDS
// ---------------------------------------------------------------------------
const residents = []
const households = []
let residentSeq = 1
let householdSeq = {}

PUROKS.forEach((purok) => {
  householdSeq[purok] = 1
})

function makeResident({ purok, lastName, isHead, adultOverride }) {
  const male = faker.datatype.boolean()
  const isAdult = adultOverride !== undefined ? adultOverride : faker.datatype.boolean({ probability: 0.62 })
  const age = isAdult ? faker.number.int({ min: 19, max: 88 }) : faker.number.int({ min: 0, max: 18 })
  const birthdate = new Date(TODAY)
  birthdate.setFullYear(birthdate.getFullYear() - age)
  birthdate.setMonth(faker.number.int({ min: 0, max: 11 }))
  birthdate.setDate(faker.number.int({ min: 1, max: 28 }))

  const firstName = randOf(male ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES)
  const middleName = randOf(LAST_NAMES)
  const street = randOf(STREETS[purok])
  const houseNumber = String(faker.number.int({ min: 1, max: 250 }))

  const tags = []
  if (age >= 60) tags.push("Senior Citizen")
  if (faker.datatype.boolean({ probability: 0.045 })) tags.push("PWD")
  if (isAdult && !male && faker.datatype.boolean({ probability: 0.08 })) tags.push("Solo Parent")
  if (isAdult && !male && faker.datatype.boolean({ probability: 0.18 })) tags.push("Woman")
  if (isAdult && (purok === "Purok 2 - Riverside") && faker.datatype.boolean({ probability: 0.35 })) tags.push("Fisherfolk")
  if (faker.datatype.boolean({ probability: 0.12 })) tags.push("4Ps Beneficiary")
  if (faker.datatype.boolean({ probability: 0.09 })) tags.push("Indigent")

  const id = `res-${pad(residentSeq++, 4)}`
  const createdAt = iso(daysAgo(faker.number.int({ min: 30, max: 900 })))

  return {
    id,
    photoUrl: "",
    firstName,
    middleName,
    lastName,
    suffix: isAdult && male && faker.datatype.boolean({ probability: 0.06 }) ? randOf(["Jr.", "Sr.", "III"]) : undefined,
    gender: male ? "Male" : "Female",
    birthdate: isoDateOnly(birthdate),
    civilStatus: isAdult ? randOf(CIVIL_STATUSES) : "Single",
    religion: randOf(RELIGIONS),
    occupation: isAdult ? randOf(OCCUPATIONS) : "Student",
    educationalAttainment: isAdult ? randOf(EDUCATION) : randOf(["Elementary Undergraduate", "High School Undergraduate"]),
    address: { purok, street, houseNumber },
    contactNumber: isAdult ? faker.phone.number("09## ### ####") : "",
    email: isAdult && faker.datatype.boolean({ probability: 0.4 }) ? faker.internet.email({ firstName, lastName }).toLowerCase() : undefined,
    householdId: undefined,
    emergencyContactName: undefined,
    emergencyContactNumber: undefined,
    tags,
    isRegisteredVoter: isAdult && faker.datatype.boolean({ probability: 0.78 }),
    isHouseholdHead: isHead,
    isActive: true,
    createdAt,
    updatedAt: createdAt,
  }
}

PUROKS.forEach((purok) => {
  const householdCount = faker.number.int({ min: 6, max: 8 })
  for (let h = 0; h < householdCount; h++) {
    const familyLastName = randOf(LAST_NAMES)
    const head = makeResident({ purok, lastName: familyLastName, isHead: true, adultOverride: true })
    head.lastName = familyLastName
    const memberCount = faker.number.int({ min: 1, max: 5 })
    const members = [head]
    for (let m = 0; m < memberCount; m++) {
      const member = makeResident({ purok, lastName: familyLastName, isHead: false })
      member.lastName = familyLastName
      member.address = { ...head.address }
      members.push(member)
    }

    const householdNumber = `HH-${purok.split(" ")[1]}-${pad(householdSeq[purok]++, 3)}`
    const householdId = `hh-${householdNumber}`
    members.forEach((m) => {
      m.householdId = householdId
      m.emergencyContactName = `${randOf(LAST_NAMES)}, ${randOf(FEMALE_FIRST_NAMES)}`
      m.emergencyContactNumber = faker.phone.number("09## ### ####")
      residents.push(m)
    })

    households.push({
      id: householdId,
      householdNumber,
      purok,
      address: head.address,
      headResidentId: head.id,
      memberIds: members.map((m) => m.id),
      contactNumber: head.contactNumber,
      classification: faker.helpers.weightedArrayElement([
        { value: "NHTS Poor", weight: 2 },
        { value: "Low Income", weight: 4 },
        { value: "Middle Income", weight: 3 },
        { value: "Not Classified", weight: 1 },
      ]),
      is4PsBeneficiary: members.some((m) => m.tags.includes("4Ps Beneficiary")),
      createdAt: head.createdAt,
      updatedAt: head.createdAt,
    })
  }
})

// ---------------------------------------------------------------------------
// STAFF
// ---------------------------------------------------------------------------
const staffPositions = [
  { position: "System Administrator", role: "Administrator" },
  { position: "Barangay Secretary", role: "Staff" },
  { position: "Records Officer", role: "Staff" },
  { position: "Peace and Order Officer", role: "Staff" },
  { position: "Barangay Health Worker", role: "Staff" },
  { position: "Treasury Aide", role: "Staff" },
  { position: "Social Welfare Officer", role: "Staff" },
  { position: "Lupon Secretary", role: "Staff" },
]

const staff = staffPositions.map((s, idx) => {
  const male = faker.datatype.boolean()
  const firstName = randOf(male ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES)
  const lastName = randOf(LAST_NAMES)
  const createdAt = iso(daysAgo(faker.number.int({ min: 60, max: 700 })))
  return {
    id: `stf-${pad(idx + 1, 3)}`,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s/g, "")}@barangaycatarman.gov.ph`,
    role: s.role,
    position: s.position,
    avatarUrl: "",
    status: faker.datatype.boolean({ probability: 0.92 }) ? "Active" : "Disabled",
    contactNumber: faker.phone.number("09## ### ####"),
    lastLogin: iso(daysAgo(faker.number.int({ min: 0, max: 10 }))),
    createdAt,
  }
})

// ---------------------------------------------------------------------------
// CERTIFICATE REQUESTS
// ---------------------------------------------------------------------------
const DOC_TYPES = ["Barangay Certificate","Barangay Clearance","Certificate of Residency","Certificate of Indigency","Business Clearance","Other Barangay Document"]
const CERT_STATUSES = ["Pending","Under Review","Approved","Rejected","Ready for Claim","Claimed","Not Claimed","Expired"]
const PURPOSES = ["Employment requirement","School requirement","Loan application","PhilHealth application","Business permit application","Travel requirement","Court requirement","Financial assistance application","Scholarship application","Local employment ID"]

function makeTimeline(events) {
  return events.map((e, idx) => ({ id: `tl-${idx}`, ...e }))
}

const certificateRequests = []
for (let i = 0; i < 55; i++) {
  const resident = randOf(residents)
  const status = randOf(CERT_STATUSES)
  const submittedAt = daysAgo(faker.number.int({ min: 1, max: 220 }))
  const channel = faker.datatype.boolean({ probability: 0.65 }) ? "Online" : "Walk-in"
  const docType = randOf(DOC_TYPES)
  const referenceNumber = `BC-${submittedAt.getFullYear()}-${pad(i + 1, 5)}`

  const timeline = [{ id: "tl-0", label: "Request Submitted", actor: channel === "Online" ? resident.firstName + " " + resident.lastName : "Front Desk", timestamp: iso(submittedAt) }]

  let reviewedAt, approvedAt, claimDeadline, claimedAt, rejectionReason, staffNotes, controlNumber, processedBy

  const staffer = randOf(staff.filter((s) => s.status === "Active"))
  processedBy = staffer.name

  if (status !== "Pending") {
    reviewedAt = iso(daysAgo(faker.number.int({ min: 0, max: 150 })))
    timeline.push({ id: "tl-1", label: "Under Review", actor: processedBy, timestamp: reviewedAt })
  }
  if (["Approved", "Ready for Claim", "Claimed", "Not Claimed", "Expired"].includes(status)) {
    approvedAt = iso(daysAgo(faker.number.int({ min: 0, max: 100 })))
    controlNumber = `CTC-${new Date(approvedAt).getFullYear()}-${pad(i + 1, 5)}`
    claimDeadline = iso(daysFromNow(faker.number.int({ min: -20, max: 10 })))
    timeline.push({ id: "tl-2", label: "Approved", actor: processedBy, timestamp: approvedAt })
  }
  if (status === "Ready for Claim") {
    timeline.push({ id: "tl-3", label: "Ready for Claim", actor: processedBy, timestamp: approvedAt })
  }
  if (status === "Claimed") {
    claimedAt = iso(daysAgo(faker.number.int({ min: 0, max: 30 })))
    timeline.push({ id: "tl-3", label: "Claimed by Requestor", actor: processedBy, timestamp: claimedAt })
  }
  if (status === "Not Claimed") {
    timeline.push({ id: "tl-3", label: "Marked Not Claimed", actor: processedBy, timestamp: iso(daysAgo(2)) })
  }
  if (status === "Expired") {
    timeline.push({ id: "tl-3", label: "Claim Period Expired", actor: "System", timestamp: iso(daysAgo(1)) })
  }
  if (status === "Rejected") {
    rejectionReason = randOf(["Incomplete requirements submitted", "Unable to verify residency", "Duplicate request already on file", "Invalid or expired ID presented"])
    timeline.push({ id: "tl-2", label: "Rejected", actor: processedBy, timestamp: iso(daysAgo(faker.number.int({ min: 0, max: 90 }))) })
  }

  staffNotes = faker.datatype.boolean({ probability: 0.4 }) ? "Verified against household records. No outstanding barangay clearance issues." : undefined

  certificateRequests.push({
    id: `cert-${pad(i + 1, 4)}`,
    referenceNumber,
    controlNumber,
    documentType: docType,
    otherDocumentLabel: docType === "Other Barangay Document" ? "Certificate of Good Moral Character" : undefined,
    requestorName: `${resident.firstName} ${resident.middleName ?? ""} ${resident.lastName}`.replace(/\s+/g, " ").trim(),
    address: `${resident.address.houseNumber} ${resident.address.street}, ${resident.address.purok}, Barangay Catarman`,
    contactNumber: resident.contactNumber || faker.phone.number("09## ### ####"),
    email: resident.email || faker.internet.email({ firstName: resident.firstName, lastName: resident.lastName }).toLowerCase(),
    purpose: randOf(PURPOSES),
    requirements: [
      { id: "req-1", name: "Valid_ID.jpg", url: "", sizeKb: faker.number.int({ min: 120, max: 900 }), mimeType: "image/jpeg", uploadedAt: iso(submittedAt) },
      { id: "req-2", name: "Purok_Certification.pdf", url: "", sizeKb: faker.number.int({ min: 80, max: 400 }), mimeType: "application/pdf", uploadedAt: iso(submittedAt) },
    ],
    residentId: resident.id,
    residentPhotoUrl: "",
    channel,
    status,
    staffNotes,
    rejectionReason,
    processedBy: status === "Pending" ? undefined : processedBy,
    submittedAt: iso(submittedAt),
    reviewedAt,
    approvedAt,
    claimDeadline,
    claimedAt,
    timeline,
  })
}

// ---------------------------------------------------------------------------
// COMPLAINTS (Incident Reports)
// ---------------------------------------------------------------------------
const INCIDENT_CATEGORIES = ["Loitering","Noise Complaint","Illegal Parking","Public Disturbance","Illegal Dumping","Vandalism","Other"]
const COMPLAINT_STATUSES = ["New","Under Review","Validated","Resolved","Archived","Dismissed"]
const INCIDENT_DESCRIPTIONS = {
  "Loitering": "Group of unidentified individuals has been loitering near the basketball court late at night, causing unease among residents.",
  "Noise Complaint": "Excessively loud videoke sessions past 11PM disturbing nearby households on a nightly basis.",
  "Illegal Parking": "Delivery trucks are consistently parked overnight along the barangay road, blocking pedestrian and vehicle access.",
  "Public Disturbance": "A heated argument between neighbors escalated into shouting and minor physical altercation in a public area.",
  "Illegal Dumping": "Household and construction waste has been dumped along the creek, causing bad odor and potential flooding risk.",
  "Vandalism": "Barangay basketball court and waiting shed walls were spray-painted with graffiti overnight.",
  "Other": "Suspicious activity observed near the community water pump during early morning hours.",
}

const complaints = []
for (let i = 0; i < 28; i++) {
  const category = randOf(INCIDENT_CATEGORIES)
  const status = randOf(COMPLAINT_STATUSES)
  const submittedAt = daysAgo(faker.number.int({ min: 1, max: 180 }))
  const purok = randOf(PUROKS)
  const reporterMale = faker.datatype.boolean()
  const reporterFirst = randOf(reporterMale ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES)
  const reporterLast = randOf(LAST_NAMES)

  const timeline = [{ id: "tl-0", label: "Incident Reported", actor: `${reporterFirst} ${reporterLast}`, timestamp: iso(submittedAt) }]
  let resolvedAt, staffNotes
  const staffer = randOf(staff.filter((s) => s.status === "Active"))
  if (status !== "New") {
    timeline.push({ id: "tl-1", label: "Under Review", actor: staffer.name, timestamp: iso(daysAgo(faker.number.int({ min: 0, max: 150 }))) })
  }
  if (status === "Validated") {
    timeline.push({ id: "tl-2", label: "Report Validated", actor: staffer.name, timestamp: iso(daysAgo(faker.number.int({ min: 0, max: 100 }))) })
  }
  if (status === "Resolved") {
    resolvedAt = iso(daysAgo(faker.number.int({ min: 0, max: 60 })))
    timeline.push({ id: "tl-2", label: "Resolved", actor: staffer.name, timestamp: resolvedAt })
    staffNotes = "Coordinated with Tanod on duty. Involved parties advised accordingly."
  }
  if (status === "Archived") {
    timeline.push({ id: "tl-2", label: "Archived", actor: staffer.name, timestamp: iso(daysAgo(5)) })
  }
  if (status === "Dismissed") {
    timeline.push({ id: "tl-2", label: "Dismissed - Insufficient Evidence", actor: staffer.name, timestamp: iso(daysAgo(3)) })
    staffNotes = "Unable to verify claim due to lack of corroborating evidence."
  }

  complaints.push({
    id: `cmp-${pad(i + 1, 4)}`,
    referenceNumber: `INC-${submittedAt.getFullYear()}-${pad(i + 1, 5)}`,
    category,
    otherCategoryLabel: category === "Other" ? "Suspicious Activity" : undefined,
    reporterName: `${reporterFirst} ${reporterLast}`,
    reporterPhone: faker.phone.number("09## ### ####"),
    reporterEmail: faker.internet.email({ firstName: reporterFirst, lastName: reporterLast }).toLowerCase(),
    reportedPerson: faker.datatype.boolean({ probability: 0.5 }) ? "Unidentified / Unknown" : `${randOf(MALE_FIRST_NAMES)} ${randOf(LAST_NAMES)}`,
    location: `${randOf(STREETS[purok])}, ${purok}`,
    latitude: 12.5 + faker.number.float({ min: -0.02, max: 0.02, fractionDigits: 6 }),
    longitude: 124.65 + faker.number.float({ min: -0.02, max: 0.02, fractionDigits: 6 }),
    incidentDate: isoDateOnly(submittedAt),
    incidentTime: `${pad(faker.number.int({ min: 0, max: 23 }), 2)}:${pad(faker.helpers.arrayElement([0, 15, 30, 45]), 2)}`,
    description: INCIDENT_DESCRIPTIONS[category],
    reporterPhotoUrl: "",
    evidenceUrls: [],
    status,
    staffNotes,
    isConfidential: true,
    submittedAt: iso(submittedAt),
    resolvedAt,
    timeline,
  })
}

// ---------------------------------------------------------------------------
// BLOTTERS
// ---------------------------------------------------------------------------
const BLOTTER_STATUSES = ["Open","Under Mediation","Settled","Escalated to Court","Closed","Archived"]
const BLOTTER_TYPES = ["Property Dispute","Physical Injury","Verbal Altercation","Debt / Unpaid Loan","Land Boundary Dispute","Animal Complaint","Threat / Intimidation","Trespassing","Family Dispute"]

const blotters = []
for (let i = 0; i < 20; i++) {
  const status = randOf(BLOTTER_STATUSES)
  const createdAt = daysAgo(faker.number.int({ min: 2, max: 300 }))
  const purok = randOf(PUROKS)
  const complainant = randOf(residents)
  const respondentFirst = randOf(faker.datatype.boolean() ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES)
  const respondentLast = randOf(LAST_NAMES)

  const history = [{ id: "h-0", label: "Case Filed", actor: complainant.firstName + " " + complainant.lastName, timestamp: iso(createdAt) }]
  const lupon = randOf(staff)
  if (status !== "Open") {
    history.push({ id: "h-1", label: "Hearing Scheduled", actor: lupon.name, timestamp: iso(daysAgo(faker.number.int({ min: 0, max: 200 }))) })
  }
  if (status === "Under Mediation") {
    history.push({ id: "h-2", label: "Mediation In Progress", actor: lupon.name, timestamp: iso(daysAgo(faker.number.int({ min: 0, max: 100 }))) })
  }
  if (status === "Settled") {
    history.push({ id: "h-2", label: "Amicable Settlement Reached", actor: lupon.name, timestamp: iso(daysAgo(faker.number.int({ min: 0, max: 60 }))) })
  }
  if (status === "Escalated to Court") {
    history.push({ id: "h-2", label: "Certificate to File Action Issued", actor: lupon.name, timestamp: iso(daysAgo(faker.number.int({ min: 0, max: 40 }))) })
  }
  if (status === "Closed" || status === "Archived") {
    history.push({ id: "h-2", label: "Case Closed", actor: lupon.name, timestamp: iso(daysAgo(faker.number.int({ min: 0, max: 30 }))) })
  }

  blotters.push({
    id: `blt-${pad(i + 1, 4)}`,
    caseNumber: `BLT-${createdAt.getFullYear()}-${pad(i + 1, 4)}`,
    incidentType: randOf(BLOTTER_TYPES),
    complainantName: `${complainant.firstName} ${complainant.lastName}`,
    complainantAddress: `${complainant.address.houseNumber} ${complainant.address.street}, ${complainant.address.purok}`,
    complainantContact: complainant.contactNumber || faker.phone.number("09## ### ####"),
    respondentName: `${respondentFirst} ${respondentLast}`,
    respondentAddress: `${randOf(STREETS[purok])}, ${purok}`,
    incidentDate: isoDateOnly(createdAt),
    location: `${randOf(STREETS[purok])}, ${purok}`,
    narrative: "Complainant alleges that the respondent engaged in conduct causing distress and requests barangay mediation to resolve the matter amicably before elevation to higher authorities.",
    status,
    mediator: lupon.name,
    hearingDate: status === "Open" ? undefined : isoDateOnly(daysFromNow(faker.number.int({ min: -30, max: 15 }))),
    resolution: status === "Settled" ? "Both parties agreed to an amicable settlement with written undertaking not to repeat the conduct." : undefined,
    isArchived: status === "Archived",
    history,
    createdAt: iso(createdAt),
    updatedAt: iso(history[history.length - 1] ? new Date(history[history.length - 1].timestamp) : createdAt),
  })
}

// ---------------------------------------------------------------------------
// ANNOUNCEMENTS
// ---------------------------------------------------------------------------
const ANNOUNCEMENT_SEED = [
  { title: "Free Anti-Rabies Vaccination Drive for Pets", category: "Health", content: "The Barangay Health Center, in partnership with the City Veterinary Office, will conduct a free anti-rabies vaccination drive for all pet dogs and cats. Pet owners are encouraged to bring their pets to the Barangay Covered Court. Vaccination cards will be issued on-site." },
  { title: "Barangay Assembly and Budget Transparency Meeting", category: "General", content: "All household heads are invited to attend the Barangay Assembly where the annual budget, ongoing projects, and community concerns will be discussed. Attendance certificates will be issued to all who participate." },
  { title: "Advisory: Water Interruption Along National Highway", category: "Advisory", content: "Residents along the National Highway and Purok 1 are advised of a scheduled water service interruption due to pipeline maintenance works. Please store enough water for household use during the affected period." },
  { title: "Typhoon Preparedness Bulletin", category: "Safety", content: "In view of the approaching low pressure area, all residents especially those in Purok 2 - Riverside are reminded to secure loose materials, prepare emergency go-bags, and monitor official announcements from the MDRRMO." },
  { title: "Job Opening: Barangay Health Worker (Contract of Service)", category: "Job Opening", content: "The Barangay is hiring one (1) Barangay Health Worker under Contract of Service. Interested applicants must submit their resume and credentials to the Barangay Hall on or before the deadline." },
  { title: "3rd Quarter Senior Citizens' Pension Distribution", category: "General", content: "Senior citizens are informed that the 3rd quarter social pension will be distributed at the Barangay Multi-Purpose Hall. Please bring your Senior Citizen ID and a valid government ID." },
  { title: "Clean-Up Drive and Tree Planting Activity", category: "Event", content: "The Sangguniang Kabataan, in coordination with barangay officials, will conduct a community clean-up drive and tree planting activity along the riverside area. Volunteers are welcome to join." },
  { title: "Reminder: Barangay Clearance Requirements Updated", category: "Advisory", content: "Please be informed that starting this quarter, all Barangay Clearance applications must be accompanied by a valid ID and Purok Certification. Incomplete requirements will delay processing." },
  { title: "Free Legal Aid and Mediation Consultation Day", category: "Event", content: "The Lupong Tagapamayapa will hold a free legal aid and mediation consultation day for residents with ongoing disputes or legal concerns. Walk-in consultations will be accommodated." },
  { title: "Barangay Fiesta Schedule of Activities", category: "Event", content: "The Barangay Catarman Fiesta celebration schedule of activities is now available, including the search for Mutya ng Catarman, sports fest, and the grand community parade." },
]

const announcements = ANNOUNCEMENT_SEED.map((a, idx) => {
  const isPinned = idx < 3
  const publishAt = isPinned ? daysAgo(idx * 3 + 1) : daysAgo(faker.number.int({ min: 10, max: 200 }))
  return {
    id: `ann-${pad(idx + 1, 3)}`,
    title: a.title,
    content: `<p>${a.content}</p><p>For more information, please visit or contact the Barangay Hall during office hours.</p>`,
    excerpt: a.content.slice(0, 140) + "...",
    imageUrl: "",
    category: a.category,
    isPinned,
    status: "Published",
    publishAt: iso(publishAt),
    author: "Barangay Secretary",
    createdAt: iso(publishAt),
    updatedAt: iso(publishAt),
  }
})

const activities = [
  { id: "act-001", title: "Barangay Health and Wellness Fair", description: "Free medical check-ups, dental services, and health seminars for all residents.", location: "Barangay Multi-Purpose Hall", startDate: isoDateOnly(daysFromNow(12)), endDate: isoDateOnly(daysFromNow(12)) },
  { id: "act-002", title: "Solid Waste Management Seminar", description: "Seminar on proper waste segregation and composting for household heads.", location: "Barangay Covered Court", startDate: isoDateOnly(daysFromNow(20)), endDate: isoDateOnly(daysFromNow(20)) },
  { id: "act-003", title: "Barangay Sports Fest Opening", description: "Opening ceremony of the annual inter-purok sports festival.", location: "Barangay Covered Court", startDate: isoDateOnly(daysFromNow(35)), endDate: isoDateOnly(daysFromNow(42)) },
]

// ---------------------------------------------------------------------------
// EMERGENCY CONTACTS
// ---------------------------------------------------------------------------
const emergencyContacts = [
  { id: "ec-1", name: "Barangay Emergency Hotline", category: "Barangay Hotline", contactNumber: "0917-234-5678", availability: "24/7" },
  { id: "ec-2", name: "Philippine National Police - Municipal Station", category: "Police", contactNumber: "0917-111-2222", availability: "24/7" },
  { id: "ec-3", name: "Bureau of Fire Protection", category: "Fire", contactNumber: "0917-333-4444", availability: "24/7" },
  { id: "ec-4", name: "Rural Health Unit / RHU", category: "Medical", contactNumber: "0917-555-6666", availability: "8:00 AM - 5:00 PM" },
  { id: "ec-5", name: "Municipal Disaster Risk Reduction Office (MDRRMO)", category: "Disaster Response", contactNumber: "0917-777-8888", availability: "24/7" },
  { id: "ec-6", name: "VAWC Desk (Women and Children Protection)", category: "Other", contactNumber: "0917-999-0000", availability: "8:00 AM - 5:00 PM" },
]

// ---------------------------------------------------------------------------
// ACTIVITY LOGS
// ---------------------------------------------------------------------------
const LOG_MODULES = ["Authentication","Residents","Households","Certificates","Complaints","Blotters","Announcements","Settings","Backup","Staff"]
const BROWSERS = ["Chrome 128.0 / Windows", "Chrome 127.0 / Android", "Edge 126.0 / Windows", "Safari 17.5 / macOS", "Firefox 129.0 / Windows"]
const LOG_ACTIONS = {
  Authentication: ["Logged in", "Logged out", "Failed login attempt", "Password reset requested"],
  Residents: ["Added new resident record", "Updated resident information", "Deleted resident record", "Exported resident list"],
  Households: ["Added new household", "Updated household members", "Removed household record"],
  Certificates: ["Approved certificate request", "Rejected certificate request", "Marked certificate as claimed", "Printed certificate"],
  Complaints: ["Reviewed incident report", "Resolved complaint", "Archived complaint"],
  Blotters: ["Filed new blotter case", "Updated case status", "Scheduled mediation hearing"],
  Announcements: ["Published announcement", "Edited announcement", "Pinned announcement"],
  Settings: ["Updated barangay information", "Updated SMTP configuration", "Updated certificate template"],
  Backup: ["Initiated manual backup", "Automatic backup completed", "Restored from backup"],
  Staff: ["Added new staff account", "Disabled staff account", "Reset staff password"],
}

const activityLogs = []
for (let i = 0; i < 120; i++) {
  const module = randOf(LOG_MODULES)
  const action = randOf(LOG_ACTIONS[module])
  const actor = randOf(staff)
  const timestamp = iso(daysAgo(faker.number.int({ min: 0, max: 120 })))
  activityLogs.push({
    id: `log-${pad(i + 1, 4)}`,
    actorName: actor.name,
    actorRole: actor.role,
    action,
    module,
    description: `${actor.name} (${actor.position}) performed "${action}" in the ${module} module.`,
    ipAddress: faker.internet.ipv4(),
    browser: randOf(BROWSERS),
    status: action.toLowerCase().includes("failed") ? "Failed" : "Success",
    timestamp,
  })
}
activityLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

// ---------------------------------------------------------------------------
// NOTIFICATIONS
// ---------------------------------------------------------------------------
const notifications = [
  { id: "ntf-1", title: "New Certificate Request", message: "A new Barangay Clearance request was submitted online.", type: "info", isRead: false, link: "/staff/certificates", createdAt: iso(daysAgo(0)) },
  { id: "ntf-2", title: "Incident Report Filed", message: "A new noise complaint incident report requires review.", type: "warning", isRead: false, link: "/staff/complaints", createdAt: iso(daysAgo(0)) },
  { id: "ntf-3", title: "Certificate Ready for Claim", message: "3 certificates are ready for claim and awaiting pickup.", type: "success", isRead: true, link: "/staff/certificates", createdAt: iso(daysAgo(1)) },
  { id: "ntf-4", title: "Backup Completed", message: "Automatic nightly backup completed successfully.", type: "success", isRead: true, link: "/admin/backup", createdAt: iso(daysAgo(1)) },
  { id: "ntf-5", title: "Certificate Claim Expiring Soon", message: "2 approved certificates will expire within 24 hours if unclaimed.", type: "error", isRead: false, link: "/staff/certificates", createdAt: iso(daysAgo(0)) },
]

// ---------------------------------------------------------------------------
// WRITE OUTPUT
// ---------------------------------------------------------------------------
const files = {
  "officials.json": officials,
  "residents.json": residents,
  "households.json": households,
  "staff.json": staff,
  "certificate-requests.json": certificateRequests,
  "complaints.json": complaints,
  "blotters.json": blotters,
  "announcements.json": announcements,
  "activities.json": activities,
  "emergency-contacts.json": emergencyContacts,
  "activity-logs.json": activityLogs,
  "notifications.json": notifications,
}

for (const [name, content] of Object.entries(files)) {
  writeFileSync(path.join(OUT_DIR, name), JSON.stringify(content, null, 2))
  console.log(`Wrote ${name} (${content.length} records)`)
}
