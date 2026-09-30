// Присылает в Telegram напоминания из раздела «Работа».
// Запускается GitHub Actions каждые 10 минут (см. .github/workflows/reminders.yml).
import admin from "firebase-admin";

const { FIREBASE_SERVICE_ACCOUNT, TELEGRAM_TOKEN, TELEGRAM_CHAT_ID } = process.env;
if (!FIREBASE_SERVICE_ACCOUNT || !TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
  console.log("Ключи ещё не добавлены в настройки репозитория — пропускаю.");
  process.exit(0);
}

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(FIREBASE_SERVICE_ACCOUNT)) });
const db = admin.firestore();

// время напоминаний записано по Москве (UTC+3, без перехода на летнее время)
const MSK = 3 * 3600e3;
const nowKey = new Date(Date.now() + MSK).toISOString().slice(0, 16); // "ГГГГ-ММ-ДДTЧЧ:ММ"
const MON = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
const day = s => { const d = new Date(s + "T12:00:00Z"); return d.getUTCDate() + " " + MON[d.getUTCMonth()]; };

const projSnap = await db.doc("apps/work/settings/projects").get();
const projects = projSnap.exists ? projSnap.data().list || [] : [];
const tasks = await db.collection("apps/work/tasks").get();

let sent = 0;
for (const doc of tasks.docs) {
  const t = doc.data();
  if (t.done || !t.remindDate) continue;
  const key = `${t.remindDate}T${t.remindTime || "09:00"}`;
  if (key > nowKey) continue;              // ещё рано
  if (t.tgSentFor === key) continue;       // это напоминание уже ушло
  const lateHours = (Date.parse(nowKey + "Z") - Date.parse(key + "Z")) / 36e5;
  if (lateHours > 24) { await doc.ref.update({ tgSentFor: key }); continue; } // слишком старое — не шлём

  const project = projects.find(p => p.id === t.project)?.name;
  const lines = [
    `Напоминание${project ? " · " + project : ""}`,
    `<b>${esc(t.title)}</b>`,
    t.deadline ? `Срок: ${day(t.deadline)}` : "",
    t.note ? esc(t.note.slice(0, 300)) : "",
    `<a href="https://lesyaframe.github.io/work.html">Открыть задачи</a>`
  ].filter(Boolean);

  const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: lines.join("\n"), parse_mode: "HTML", disable_web_page_preview: true })
  });
  if (!r.ok) { console.error("Telegram ответил ошибкой:", r.status, await r.text()); continue; }
  await doc.ref.update({ tgSentFor: key });
  sent++;
}
console.log(`Проверено задач: ${tasks.size}, отправлено напоминаний: ${sent}`);

function esc(s) { return String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
