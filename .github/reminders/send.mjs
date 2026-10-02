// Присылает в Telegram напоминания: задачи из «Работы» и записи из «Личного» (за день и за полтора часа).
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

  if (!(await tg(lines.join("\n")))) continue;
  await doc.ref.update({ tgSentFor: key });
  sent++;
}
console.log(`Проверено задач: ${tasks.size}, отправлено напоминаний: ${sent}`);

/* ---------- записи: за день и за полтора часа ---------- */
const nowMs = Date.parse(nowKey + "Z");
const specs = Object.fromEntries((await db.collection("apps/personal/specialists").get()).docs.map(d => [d.id, d.data()]));
const visits = await db.collection("apps/personal/visits").get();
let sentV = 0;
for (const doc of visits.docs) {
  const v = doc.data();
  if (v.remind === false || !v.date) continue;
  const time = v.time || "";
  const ev = Date.parse(`${v.date}T${time || "10:00"}Z`);   // без времени считаем 10:00
  if (nowMs >= ev) continue;                                  // уже прошла
  const sig = `${v.date}T${time}`;                            // перенесли запись — напомним заново
  const due90 = time ? ev - 90 * 60e3 : null, due1d = ev - 24 * 3600e3;
  let which = null;
  if (due90 && nowMs >= due90 && v.tg90For !== sig) which = "90";
  else if (nowMs >= due1d && v.tg1dFor !== sig) which = "1d";
  if (!which) continue;

  const sp = specs[v.specialistId];
  const title = v.title || v.service || sp?.name || "запись";
  const dayDiff = Math.round((Date.parse(v.date + "T00:00Z") - Date.parse(nowKey.slice(0, 10) + "T00:00Z")) / 864e5);
  const when = dayDiff === 0 ? "Сегодня" : dayDiff === 1 ? "Завтра" : day(v.date);
  const left = (ev - nowMs) / 60e3;
  const head = which === "90"
    ? (left >= 75 ? `Через полтора часа, в ${time}` : `Скоро, в ${time}`)
    : `${when}${time ? " в " + time : ""}`;
  const lines = [
    `${head}: <b>${esc(title)}</b>`,
    sp?.name && sp.name !== title ? esc(sp.name) : "",
    sp?.address ? esc(sp.address) : "",
    v.note ? esc(v.note.slice(0, 200)) : "",
    `<a href="https://lesyaframe.github.io/personal.html#visits">Мои записи</a>`
  ].filter(Boolean);
  if (!(await tg(lines.join("\n")))) continue;
  await doc.ref.update(which === "90" ? { tg90For: sig, tg1dFor: sig } : { tg1dFor: sig });
  sentV++;
}
console.log(`Проверено записей: ${visits.size}, отправлено напоминаний: ${sentV}`);

async function tg(text) {
  const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: "HTML", disable_web_page_preview: true })
  });
  if (!r.ok) console.error("Telegram ответил ошибкой:", r.status, await r.text());
  return r.ok;
}

function esc(s) { return String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
