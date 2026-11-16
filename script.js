// ================= EDIT YOUR EVENT HERE =================
const EVENT = {
  title: "Community Tech Day",
  // Use the format YYYY-MM-DDTHH:MM:SS+05:30 (+05:30 is Indian time)
  start: "2026-12-20T18:00:00+05:30",
  end: "2026-12-20T21:30:00+05:30",
  place: "Main Hall, Sample Venue",
  address: "Sample Venue, Main Road, Your City",
  description: "A day of demos, talks and hands-on workshops.",
  // Where RSVPs go. Fill in ONE of these (leave the other empty).
  rsvpWhatsApp: "", // country code + number, digits only, e.g. "919876543210"
  rsvpEmail: ""     // e.g. "events@example.com"
};
// ========================================================

const $ = (id) => document.getElementById(id);
const startDate = new Date(EVENT.start);
const endDate = new Date(EVENT.end);

// ---------- Fill in the details ----------
document.title = "You're invited | " + EVENT.title;
$("event-title").textContent = EVENT.title;
$("event-place").textContent = EVENT.place;
$("event-date").textContent = startDate.toLocaleDateString("en-IN", {
  weekday: "long", day: "numeric", month: "long", year: "numeric"
});
$("event-time").textContent = startDate.toLocaleTimeString("en-IN", {
  hour: "numeric", minute: "2-digit", hour12: true
});
$("map-link").href =
  "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(EVENT.address);
$("year").textContent = new Date().getFullYear();

// ---------- Toast ----------
let toastTimer;
function showToast(message) {
  const t = $("toast");
  t.textContent = message;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3000);
}

// ---------- Countdown ----------
function updateCountdown() {
  const now = new Date();
  let label = "Starts in";
  let diff = startDate - now;

  if (diff <= 0 && now < endDate) {
    label = "Happening now";
    diff = 0;
  } else if (now >= endDate) {
    label = "This event has ended";
    diff = 0;
  }

  $("count-label").textContent = label;
  const s = Math.floor(diff / 1000);
  $("c-days").textContent = Math.floor(s / 86400);
  $("c-hours").textContent = Math.floor((s % 86400) / 3600);
  $("c-mins").textContent = Math.floor((s % 3600) / 60);
  $("c-secs").textContent = s % 60;
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ---------- Add to calendar (.ics file) ----------
function icsDate(d) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

$("add-cal").addEventListener("click", () => {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Event Invite//EN",
    "BEGIN:VEVENT",
    "UID:" + Date.now() + "@event-invite",
    "DTSTAMP:" + icsDate(new Date()),
    "DTSTART:" + icsDate(startDate),
    "DTEND:" + icsDate(endDate),
    "SUMMARY:" + EVENT.title,
    "LOCATION:" + EVENT.address,
    "DESCRIPTION:" + EVENT.description,
    "END:VEVENT",
    "END:VCALENDAR"
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "event.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
  showToast("Calendar file downloaded");
});

// ---------- Share ----------
$("share").addEventListener("click", async () => {
  const data = { title: EVENT.title, text: "You're invited to " + EVENT.title, url: location.href };
  try {
    if (navigator.share) {
      await navigator.share(data);
    } else {
      await navigator.clipboard.writeText(location.href);
      showToast("Link copied");
    }
  } catch (err) {
    /* The person closed the share sheet. Nothing to do. */
  }
});

// ---------- RSVP ----------
$("rsvp-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const error = $("form-error");
  error.textContent = "";

  const name = $("f-name").value.trim();
  const guests = $("f-guests").value;
  const reply = document.querySelector('input[name="reply"]:checked').value;
  const note = $("f-msg").value.trim();

  if (!name) {
    error.textContent = "Please enter your name.";
    $("f-name").focus();
    return;
  }

  const text =
    "RSVP for " + EVENT.title + "\n" +
    "Name: " + name + "\n" +
    "Reply: " + reply + "\n" +
    "Guests: " + guests +
    (note ? "\nMessage: " + note : "");

  if (EVENT.rsvpWhatsApp) {
    window.open("https://wa.me/" + EVENT.rsvpWhatsApp + "?text=" + encodeURIComponent(text), "_blank");
  } else if (EVENT.rsvpEmail) {
    location.href =
      "mailto:" + EVENT.rsvpEmail +
      "?subject=" + encodeURIComponent("RSVP: " + EVENT.title) +
      "&body=" + encodeURIComponent(text);
  } else {
    error.textContent = "RSVP contact is not set yet. Add a WhatsApp number or email in script.js.";
  }
});