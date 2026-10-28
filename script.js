const STORAGE_KEY = "studyFlowSessions";
const $ = (selector) => document.querySelector(selector);
const form = $("#session-form");
const timetable = $("#timetable");
const empty = $("#empty");
const message = $("#message");

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function readSessions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function saveSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    return true;
  } catch {
    message.textContent = "Could not save sessions in this browser.";
    return false;
  }
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function formatTime(value) {
  const [hour, minute] = value.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function render() {
  const sessions = readSessions();
  $("#session-count").textContent = `${sessions.length} ${sessions.length === 1 ? "session" : "sessions"}`;
  timetable.replaceChildren();
  empty.hidden = sessions.length > 0;

  days.forEach((day) => {
    const daySessions = sessions
      .filter((session) => session.day === day)
      .sort((a, b) => a.time.localeCompare(b.time));
    if (!daySessions.length) return;

    const group = makeElement("section", "day-group");
    group.append(makeElement("h3", "day-title", day));

    daySessions.forEach((session) => {
      const row = makeElement("article", "session");
      row.append(makeElement("div", "time", formatTime(session.time)));

      const info = makeElement("div", "session-info");
      info.append(
        makeElement("strong", "", session.subject),
        makeElement("small", "", session.topic || "Study session")
      );

      const remove = makeElement("button", "delete", "Delete");
      remove.type = "button";
      remove.setAttribute("aria-label", `Delete ${session.subject} on ${session.day}`);
      remove.addEventListener("click", () => deleteSession(session.id));

      row.append(info, remove);
      group.append(row);
    });

    timetable.append(group);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const subject = $("#subject").value.trim();
  const day = $("#day").value;
  const time = $("#time").value;
  const topic = $("#topic").value.trim();

  if (!subject || !time) {
    message.textContent = "Please enter a subject and study time.";
    return;
  }

  const sessions = readSessions();
  sessions.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    subject, day, time, topic
  });

  if (saveSessions(sessions)) {
    form.reset();
    message.textContent = "Study session added to your timetable!";
    render();
  }
});

function deleteSession(id) {
  if (saveSessions(readSessions().filter((session) => session.id !== id))) {
    message.textContent = "Study session deleted.";
    render();
  }
}

$("#clear-all").addEventListener("click", () => {
  if (!readSessions().length) {
    message.textContent = "There are no sessions to clear.";
    return;
  }
  if (window.confirm("Clear every study session?") && saveSessions([])) {
    message.textContent = "All sessions cleared.";
    render();
  }
});

render();
