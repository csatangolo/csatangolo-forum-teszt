const SUPABASE_URL = window.CSATANGOLO_SUPABASE_URL;
const SUPABASE_ANON_KEY = window.CSATANGOLO_SUPABASE_ANON_KEY;
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("registrationForm");
const message = document.getElementById("formMessage");
const button = document.getElementById("submitButton");

function checkedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(x => x.value);
}

function value(name) {
  const el = form.elements[name];
  return el ? String(el.value || "").trim() : "";
}

function uuid() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function makeParticipantCode(index) {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `FORUM-2026-${String(index).padStart(2, "0")}-${random}`;
}

function showError(text) {
  message.className = "form-message error";
  message.textContent = text;
}


function mainParticipantType(roles) {
  const clean = Array.isArray(roles) ? roles.filter(Boolean) : [];
  if (!clean.length) return "Vendég";

  const priority = [
    ["Előadóként is szívesen kapcsolódnék", "Előadó"],
    ["Oktató", "Oktató"],
    ["Lovasedző", "Oktató / lovasedző"],
    ["Belovagló", "Belovagló"],
    ["Lókiképző", "Lókiképző"],
    ["Lovarda tulajdonos", "Lovardavezető"],
    ["Lovas egyesület képviselője", "Egyesületi képviselő"],
    ["Versenyző", "Versenyző"],
    ["Tenyésztő", "Tenyésztő"],
    ["Patkolókovács", "Patkolókovács"],
    ["Állatorvos", "Állatorvos"],
    ["Nyeregkészítő / nyeregillesztő", "Nyeregillesztő"],
    ["Lótartó", "Lótartó"],
    ["Hobby lovas", "Hobby lovas"],
    ["Érdeklődő", "Vendég"]
  ];

  const found = priority
    .filter(([value]) => clean.includes(value))
    .map(([, label]) => label);

  return found.length ? found.slice(0, 2).join(" • ") : "Vendég";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  button.disabled = true;
  button.textContent = "Küldés folyamatban...";
  message.className = "form-message";
  message.textContent = "";

  try {
    const companions = [value("companion1"), value("companion2"), value("companion3"), value("companion4"), value("companion5")].filter(Boolean);
    const children = [value("child1"), value("child2"), value("child3"), value("child4"), value("child5")].filter(Boolean);
    const childPrograms = checkedValues("childPrograms");
    if (value("childProgramsOther")) childPrograms.push(value("childProgramsOther"));

    const topics = checkedValues("topics");
    if (value("topicsOther")) topics.push(value("topicsOther"));

    const roles = checkedValues("roles");
    const registrationId = uuid();

    const registration = {
      id: registrationId,
      event_name: "I. Országos Belovagló és Lókiképző Szakmai Fórum",
      event_date: "2026-07-25",
      main_name: value("mainName"),
      email: value("email"),
      phone: value("phone"),
      city: value("city"),
      companions: companions,
      has_children: value("hasChildren"),
      children_details: value("childrenDetails"),
      children_names: children,
      child_programs: childPrograms,
      accommodation: value("accommodation"),
      demo_interest: value("demoInterest"),
      demo_details: value("demoDetails"),
      speaker_question: value("speakerQuestion"),
      question_for: value("questionFor"),
      topics: topics,
      roles: roles,
      intro: value("intro"),
      source: value("source"),
      privacy_accepted: form.elements["privacyAccepted"].checked,
      media_accepted: form.elements["mediaAccepted"].checked
    };

    const participantRows = [
      {
        registration_id: registrationId,
        participant_code: makeParticipantCode(1),
        name: registration.main_name,
        type: value("mainTitle") || mainParticipantType(roles),
        email_contact: registration.email,
        phone_contact: registration.phone,
        city: registration.city,
        checked_in: false,
        contribution_paid: false
      },
      ...companions.map((name, i) => ({
        registration_id: registrationId,
        participant_code: makeParticipantCode(i + 2),
        name: name,
        type: value(`companion${i + 1}Title`) || "Vendég",
        email_contact: registration.email,
        phone_contact: registration.phone,
        city: registration.city,
        checked_in: false,
        contribution_paid: false
      })),
      ...children.map((name, i) => ({
        registration_id: registrationId,
        participant_code: makeParticipantCode(companions.length + i + 2),
        name: name,
        type: "Gyermek vendég",
        email_contact: registration.email,
        phone_contact: registration.phone,
        city: registration.city,
        checked_in: false,
        contribution_paid: false
      }))
    ];

    const { error: regError } = await client.from("registrations").insert(registration);
    if (regError) throw regError;

    const { error: participantError } = await client.from("participants").insert(participantRows);
    if (participantError) throw participantError;

    localStorage.setItem("forumTickets", JSON.stringify(participantRows));
    window.location.href = "koszonjuk.html";
  } catch (error) {
    console.error("Regisztrációs hiba:", error);
    showError("Hiba történt a regisztráció küldése közben. Kérlek próbáld újra, vagy jelezd nekünk üzenetben.");
    button.disabled = false;
    button.textContent = "Regisztráció elküldése";
  }
});
