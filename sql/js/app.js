/* SQL с нуля: учебная платформа. Прогресс хранится в браузере ученика. */
(function () {
  const PGLITE = "https://cdn.jsdelivr.net/npm/@electric-sql/pglite@0.5.8/dist/index.js";
  const KEY = "sql-course-v1";
  const MODS = window.COURSE.modules;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- состояние ---------- */
  let S = { done: {}, name: "", start: "", code: {} };
  try { S = Object.assign(S, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
  const isDone = k => !!S.done[k];
  function setDone(k, v) { if (v) S.done[k] = 1; else delete S.done[k]; save(); refreshProgress(); }

  function keysOf(m) {
    const k = [];
    if (m.video && m.video.length) k.push(m.id + ":v");
    (m.theory || []).forEach(b => k.push(m.id + ":t:" + b.id));
    ((m.practice || {}).tasks || []).forEach(t => k.push(m.id + ":p:" + t.id));
    ((m.homework || {}).tasks || []).forEach(t => k.push(m.id + ":h:" + t.id));
    return k;
  }
  const allKeys = () => MODS.flatMap(keysOf);
  const pct = keys => keys.length ? Math.round(100 * keys.filter(isDone).length / keys.length) : 0;

  /* ---------- иконки ---------- */
  const I = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    db: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="6" rx="7" ry="2.8"/><path d="M5 6v12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>',
    cols: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="4" width="17" height="16" rx="3"/><path d="M9.5 4v16M14.5 4v16"/></svg>',
    filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 5h16l-6 7.5V19l-4-2v-4.5z"/></svg>',
    sort: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M7 4v16M3.5 16.5L7 20l3.5-3.5M13 6h8M13 11h6M13 16h4"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/></svg>',
    sigma: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 5H6l6 7-6 7h12"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
    win: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="4" width="17" height="16" rx="3"/><path d="M3.5 9h17M3.5 14h17M9 9v11"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 20h16M7 16v-4M12 16V7M17 16v-6"/></svg>',
    cap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M2.5 9.5L12 5l9.5 4.5L12 14z"/><path d="M6.5 11.5V16c3 2.5 8 2.5 11 0v-4.5M21.5 9.5v5"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></svg>',
    tool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="12" rx="2.5"/><path d="M8 21h8M12 17v4M7.5 9.5l2 1.5-2 1.5M12 13h4"/></svg>'
  };

  /* ---------- подсветка SQL ---------- */
  const KW = new Set(("select from where and or not in is null as on join left right full inner outer cross group by order having limit offset distinct " +
    "case when then else end between like ilike union all intersect except create table insert into values update set delete drop alter add column " +
    "primary key references default with over partition rows range preceding following unbounded current row asc desc nulls first last exists " +
    "true false interval date time timestamp text integer numeric int varchar boolean serial if begin commit rollback truncate rename to using cascade constraint check unique filter").split(" "));
  const FN = new Set(("count sum avg min max round ceil floor abs coalesce nullif lower upper trim ltrim rtrim length concat substring replace split_part position left right " +
    "now current_date current_timestamp extract date_part date_trunc to_char to_date to_timestamp age make_date make_timestamp lag lead rank dense_rank row_number ntile " +
    "first_value last_value string_agg cast generate_series greatest least power sqrt mod initcap reverse lpad rpad justify_days random").split(" "));
  function hl(code) {
    let out = "", i = 0;
    const re = /(--[^\n]*)|('(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|([A-Za-zА-Яа-яЁё_][\wА-Яа-яЁё]*)|([\s\S])/g;
    let m;
    while ((m = re.exec(code))) {
      if (m[1]) out += '<span class="c">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="s">' + esc(m[2]) + "</span>";
      else if (m[3]) out += '<span class="nm">' + m[3] + "</span>";
      else if (m[4]) {
        const w = m[4].toLowerCase();
        if (KW.has(w)) out += '<span class="k">' + m[4] + "</span>";
        else if (FN.has(w)) out += '<span class="fn">' + m[4] + "</span>";
        else out += esc(m[4]);
      } else out += esc(m[5]);
    }
    return out;
  }

  /* ---------- база в браузере ---------- */
  let dbP = null, queue = Promise.resolve();
  function getDB() {
    if (!dbP) dbP = (async () => {
      const { PGlite } = await import(PGLITE);
      const p = v => v;
      const db = new PGlite({ parsers: { 1082: p, 1114: p, 1184: p, 1083: p, 1186: p } });
      await db.exec("SET TIME ZONE 'Europe/Moscow'");
      await db.exec(window.SHOP_SQL);
      return db;
    })().catch(e => { dbP = null; throw e; });
    return dbP;
  }
  function resetDB() { dbP = null; return getDB(); }
  // всё выполняем по очереди, чтобы транзакции не перепутались
  function serial(fn) { const r = queue.then(fn, fn); queue = r.catch(() => {}); return r; }

  function lastResult(arr) {
    let res = null;
    for (const r of arr) if (r.fields && r.fields.length) res = r;
    if (res) return { cols: res.fields.map(f => f.name), rows: res.rows };
    const aff = arr.reduce((s, r) => s + (r.affectedRows || 0), 0);
    return { cols: [], rows: [], affected: aff, commands: arr.map(r => r.command).filter(Boolean) };
  }
  // keep=false: всё откатываем, база остаётся чистой
  function run(sql, opts = {}) {
    return serial(async () => {
      const db = await getDB();
      if (!opts.keep) await db.exec("BEGIN");
      try {
        const out = lastResult(await db.exec(sql, { rowMode: "array" }));
        if (opts.verify) out.verify = lastResult(await db.exec(opts.verify, { rowMode: "array" }));
        return out;
      } finally { if (!opts.keep) { try { await db.exec("ROLLBACK"); } catch (e) {} } }
    });
  }

  const ERR = [
    [/syntax error at end of input/, () => "Запрос оборвался на середине. Проверь, всё ли дописано: нет ли лишней запятой в конце или незакрытой скобки."],
    [/syntax error at or near "(.+?)"/, m => `Синтаксическая ошибка рядом с «${m[1]}». Частые причины: пропущена или лишняя запятая, опечатка в слове, кавычки не те.`],
    [/column "(.+?)" does not exist/, m => `Столбца «${m[1]}» нет. Проверь название в схеме таблиц. Если это текст, а не столбец, возьми его в одинарные кавычки: '${m[1]}'.`],
    [/relation "(.+?)" does not exist/, m => `Таблицы «${m[1]}» нет. Проверь название (список таблиц есть в песочнице).`],
    [/column "(.+?)" must appear in the GROUP BY clause/, m => `Столбец «${m[1]}» есть в SELECT, но его нет в GROUP BY и он не внутри агрегатной функции. Добавь его в GROUP BY или оберни в COUNT/SUM/MAX и т. п.`],
    [/aggregate functions are not allowed in WHERE/, () => "Агрегатные функции (SUM, COUNT…) нельзя писать в WHERE. Условие на результат группировки пишется в HAVING."],
    [/window functions are not allowed in WHERE/, () => "Оконные функции нельзя использовать в WHERE. Оберни запрос в подзапрос или CTE и фильтруй снаружи."],
    [/function (.+?) does not exist/, m => `Функции ${m[1]} нет. Проверь название и типы аргументов (иногда нужно привести тип через ::).`],
    [/operator does not exist: (.+)/, m => `Нельзя применить оператор: ${m[1]}. Обычно это сравнение разных типов, например текста с числом. Поможет приведение типа через ::.`],
    [/invalid input syntax for type (\w+): "(.*?)"/, m => `Значение «${m[2]}» не получается превратить в тип ${m[1]}. Проверь формат.`],
    [/division by zero/, () => "Деление на ноль. Оберни делитель в NULLIF(делитель, 0)."],
    [/column reference "(.+?)" is ambiguous/, m => `Столбец «${m[1]}» есть в нескольких таблицах. Уточни, из какой: например o.${m[1]}.`],
    [/missing FROM-clause entry for table "(.+?)"/, m => `Псевдоним или таблица «${m[1]}» не объявлены во FROM / JOIN.`],
    [/duplicate key value violates unique constraint/, () => "Такая запись уже есть: значение первичного ключа должно быть уникальным."],
    [/relation "(.+?)" already exists/, m => `Таблица «${m[1]}» уже существует. Используй CREATE TABLE IF NOT EXISTS или другое имя.`],
    [/each UNION query must have the same number of columns/, () => "В обеих частях UNION должно быть одинаковое число столбцов."],
    [/subquery must return only one column/, () => "Подзапрос должен возвращать один столбец."],
    [/more than one row returned by a subquery/, () => "Подзапрос вернул несколько строк, а здесь ожидается одно значение."]
  ];
  function explainErr(e) {
    const msg = (e && e.message) || String(e);
    for (const [re, f] of ERR) { const m = msg.match(re); if (m) return f(m) + "<small>" + esc(msg) + "</small>"; }
    return "Ошибка в запросе.<small>" + esc(msg) + "</small>";
  }

  const isNum = v => typeof v === "number" || typeof v === "bigint" || (typeof v === "string" && /^-?\d+(\.\d+)?$/.test(v));
  function tableHTML(res, limit = 200) {
    if (!res.cols.length) {
      const c = (res.commands || []).join(", ");
      return `<div class="msg info">Готово${c ? " (" + esc(c) + ")" : ""}. Затронуто строк: ${res.affected || 0}.</div>`;
    }
    const rows = res.rows.slice(0, limit);
    return `<div class="res-meta"><span>Строк: <b>${res.rows.length}</b>${res.rows.length > limit ? " (показаны первые " + limit + ")" : ""}</span>` +
      `<button data-csv>Скачать CSV для Excel</button></div>` +
      `<div class="res-table"><table><thead><tr>${res.cols.map(c => "<th>" + esc(c) + "</th>").join("")}</tr></thead><tbody>` +
      rows.map(r => "<tr>" + r.map(v => v === null ? '<td class="null">NULL</td>' : `<td${isNum(v) ? ' class="num"' : ""}>${esc(typeof v === "object" ? JSON.stringify(v) : v)}</td>`).join("") + "</tr>").join("") +
      "</tbody></table></div>";
  }
  function csv(res) {
    const cell = v => {
      if (v === null) return "";
      let s = String(v);
      if (/^-?\d+\.\d+$/.test(s)) s = s.replace(".", ","); // для русского Excel
      return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const text = [res.cols.map(cell).join(";"), ...res.rows.map(r => r.map(cell).join(";"))].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" }));
    a.download = "result.csv"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function showResult(box, res) {
    box.innerHTML = tableHTML(res);
    const b = $("[data-csv]", box);
    if (b) b.onclick = () => csv(res);
  }
  const loadingHTML = '<div class="loading"><span class="spin"></span>Запускаю PostgreSQL в браузере… (первый раз до 10–20 секунд)</div>';

  /* ---------- сравнение результатов ---------- */
  function norm(v) {
    if (v === null || v === undefined) return "∅";
    if (isNum(v)) return String(Math.round(Number(v) * 100) / 100);
    return String(v).trim();
  }
  function compare(got, exp, ordered) {
    if (!exp.cols.length) return { ok: true };
    if (!got.cols.length) return { ok: false, why: "Запрос ничего не вернул в виде таблицы. Нужен SELECT." };
    if (got.cols.length !== exp.cols.length)
      return { ok: false, why: `В результате ${got.cols.length} ${plural(got.cols.length, "столбец", "столбца", "столбцов")}, а нужно ${exp.cols.length}. Нужные столбцы по порядку: ${exp.cols.join(", ")}.` };
    if (got.rows.length !== exp.rows.length)
      return { ok: false, why: `Получилось ${got.rows.length} ${plural(got.rows.length, "строка", "строки", "строк")}, а должно быть ${exp.rows.length}. Проверь условия фильтрации.` };
    let a = got.rows.map(r => r.map(norm).join("‖")), b = exp.rows.map(r => r.map(norm).join("‖"));
    if (!ordered) { a = [...a].sort(); b = [...b].sort(); }
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) {
      if (ordered && [...a].sort().join() === [...b].sort().join()) return { ok: false, why: "Строки правильные, но порядок другой. Проверь ORDER BY." };
      return { ok: false, why: `Количество строк и столбцов совпало, но значения отличаются (например, в строке ${i + 1}). Проверь вычисления и порядок столбцов: ${exp.cols.join(", ")}.` };
    }
    return { ok: true };
  }
  const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c; };

  /* ---------- редактор ---------- */
  function makeEditor(host, value, onRun) {
    if (window.CodeMirror) {
      const cm = CodeMirror(host, {
        value, mode: "text/x-pgsql", lineNumbers: true, lineWrapping: true, indentUnit: 2, tabSize: 2, viewportMargin: Infinity,
        extraKeys: { "Ctrl-Enter": onRun, "Cmd-Enter": onRun, Tab: c => c.replaceSelection("  ") }
      });
      return { get: () => cm.getValue(), set: v => cm.setValue(v), on: f => cm.on("change", f), refresh: () => cm.refresh() };
    }
    const ta = document.createElement("textarea");
    ta.value = value; ta.spellcheck = false; host.appendChild(ta);
    ta.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); onRun(); } });
    return { get: () => ta.value, set: v => { ta.value = v; }, on: f => ta.addEventListener("input", f), refresh: () => {} };
  }

  /* ---------- общие куски ---------- */
  function markBtn(key, label = "Отметить пройденным") {
    const on = isDone(key);
    return `<button class="mark${on ? " on" : ""}" data-mark="${key}"><span class="box">${I.check}</span><span>${on ? "Пройдено" : label}</span></button>`;
  }
  function bindMarks(root) {
    $$("[data-mark]", root).forEach(b => b.onclick = () => {
      const k = b.dataset.mark, v = !isDone(k);
      setDone(k, v);
      $$(`[data-mark="${k}"]`).forEach(x => { x.classList.toggle("on", v); x.lastElementChild.textContent = v ? "Пройдено" : "Отметить пройденным"; });
      const card = b.closest(".block,.task");
      if (card) card.classList.toggle("done", v);
      if (v) toast("Отмечено ✓");
    });
  }
  let tt;
  function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => el.classList.remove("show"), 1800); }

  // примеры кода в теории: подсветка + кнопка «Запустить»
  function enhanceCode(root) {
    $$("pre.sql", root).forEach(pre => {
      const code = pre.textContent.replace(/^\n+|\s+$/g, "");
      const box = document.createElement("div");
      box.className = "codebox";
      const norun = pre.classList.contains("norun");
      box.innerHTML = `<pre>${hl(code)}</pre>` + (norun ? "" : `<div class="cb-bar"><button class="run">▶ Запустить</button><button class="to-sb">Открыть в песочнице</button></div><div class="result" style="padding:0 12px 12px"></div>`);
      pre.replaceWith(box);
      if (norun) return;
      const out = $(".result", box);
      $(".run", box).onclick = async () => {
        out.innerHTML = loadingHTML;
        try { showResult(out, await run(code)); } catch (e) { out.innerHTML = `<div class="msg err">${explainErr(e)}</div>`; }
      };
      $(".to-sb", box).onclick = () => { S.code.sandbox = code; save(); location.hash = "#/sandbox"; };
    });
  }

  function videoHTML(v) {
    return `<div class="video"><div class="frame" data-yt="${v.id}" style="background-image:url(https://i.ytimg.com/vi/${v.id}/hqdefault.jpg)"><span class="play">${I.play}</span></div>
      <div class="cap"><b>${esc(v.title)}</b><span>${esc(v.author)} · ${esc(v.len)}</span>${v.note ? `<div style="margin-top:6px">${v.note}</div>` : ""}</div></div>`;
  }
  function bindVideos(root) {
    $$("[data-yt]", root).forEach(f => f.onclick = () => {
      if ($("iframe", f)) return;
      f.insertAdjacentHTML("beforeend", `<iframe src="https://www.youtube-nocookie.com/embed/${f.dataset.yt}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>`);
    });
  }

  /* ---------- шапка ---------- */
  function header(route) {
    const p = pct(allKeys());
    const nav = [["#/", "Главная"], ["#/plan", "План на 8 недель"], ["#/sandbox", "Песочница"], ["#/links", "Материалы"]];
    $("#top").innerHTML = `<div class="wrap">
      <a class="logo" href="#/"><span class="logo-mark">SQL</span><span class="logo-text">SQL с нуля</span></a>
      <nav class="nav" id="nav">${nav.map(([h, t]) => `<a href="${h}" class="${route === h ? "on" : ""}">${t}</a>`).join("")}</nav>
      <a class="top-progress" href="#/" title="Общий прогресс">${ring(p, 30)}<span>${p}% курса</span></a>
      <button class="round burger" id="burger" aria-label="Меню">${I.menu}</button></div>`;
    $("#burger").onclick = () => $("#nav").classList.toggle("open");
  }
  function ring(p, size) {
    const r = size / 2 - 3, c = 2 * Math.PI * r;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" data-ring><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#ece9f4" stroke-width="4"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#1d1e23" stroke-width="4" stroke-linecap="round" stroke-dasharray="${c * p / 100} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>`;
  }
  function refreshProgress() {
    const p = pct(allKeys());
    const tp = $(".top-progress");
    if (tp) tp.innerHTML = ring(p, 30) + `<span>${p}% курса</span>`;
    const m = currentModule && MODS.find(x => x.id === currentModule);
    if (m) {
      const mp = pct(keysOf(m));
      $$("[data-mprog]").forEach(el => el.style.width = mp + "%");
      $$("[data-mprog-t]").forEach(el => el.textContent = `${keysOf(m).filter(isDone).length} из ${keysOf(m).length} блоков · ${mp}%`);
      MODS.forEach(x => { const n = $(`.side a[data-id="${x.id}"] .n`); if (n) n.classList.toggle("full", pct(keysOf(x)) === 100); });
      $$("[data-tabcount]").forEach(el => {
        const t = el.dataset.tabcount, list = t === "theory" ? [...(m.video && m.video.length ? [m.id + ":v"] : []), ...(m.theory || []).map(b => m.id + ":t:" + b.id)]
          : t === "practice" ? m.practice.tasks.map(x => m.id + ":p:" + x.id) : m.homework.tasks.map(x => m.id + ":h:" + x.id);
        el.textContent = `${list.filter(isDone).length}/${list.length}`;
      });
    }
  }

  /* ---------- даты плана ---------- */
  const DAY = 864e5;
  const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  function startDate() { return S.start ? new Date(S.start + "T00:00:00") : null; }
  function mondayOf(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return x; }
  function currentWeek() {
    const s = startDate(); if (!s) return 1;
    return Math.min(8, Math.max(1, Math.floor((mondayOf(new Date()) - mondayOf(s)) / (7 * DAY)) + 1));
  }
  const WEEKS = window.COURSE.weeks;

  /* ---------- главная ---------- */
  function nextModule() { return MODS.find(m => pct(keysOf(m)) < 100) || MODS[MODS.length - 1]; }
  function home() {
    const p = pct(allKeys()), nm = nextModule();
    const started = Object.keys(S.done).length > 0;
    const tasks = MODS.reduce((s, m) => s + m.practice.tasks.length + ((m.homework || {}).tasks || []).length, 0);
    const solved = Object.keys(S.done).filter(k => /:(p|h):/.test(k)).length;
    const s = startDate(), wk = currentWeek();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    // календарь: две колонки по 4 недели, чтобы первый экран не был длинным
    const head = '<span class="dname">нед</span>' + ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(d => `<span class="dname">${d}</span>`).join("");
    const base = mondayOf(s || today);
    let cal = '<div class="cal2">';
    for (let half = 0; half < 2; half++) {
      cal += '<div class="cal">' + head;
      for (let w = half * 4; w < half * 4 + 4; w++) {
        const col = WEEKS[w].color;
        cal += `<span class="wk" title="${WEEKS[w].title}">${w + 1}</span>`;
        for (let d = 0; d < 7; d++) {
          const day = new Date(base.getTime() + (w * 7 + d) * DAY + 3 * 36e5); day.setHours(0, 0, 0, 0);
          const isT = day.getTime() === today.getTime();
          cal += `<span class="d ${isT ? "today" : ""}" style="${isT ? "" : `background:var(--${col})`}" title="Неделя ${w + 1}: ${WEEKS[w].title}">${day.getDate()}</span>`;
        }
      }
      cal += "</div>";
    }
    cal += "</div>";
    const art = `<svg class="hero-art" viewBox="0 0 300 300" aria-hidden="true">
      <g fill="#fff" opacity=".9"><path d="M60 40l4 12 12 4-12 4-4 12-4-12-12-4 12-4z"/><path d="M250 80l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/><path d="M210 22l2.5 7 7 2.5-7 2.5-2.5 7-2.5-7-7-2.5 7-2.5z"/></g>
      <g transform="translate(70 70)">
        <rect x="0" y="120" width="180" height="58" rx="16" fill="#8fb0ea"/><rect x="10" y="128" width="160" height="10" rx="5" fill="#fff" opacity=".85"/><rect x="10" y="146" width="110" height="8" rx="4" fill="#5b7fc6"/><rect x="10" y="160" width="140" height="8" rx="4" fill="#5b7fc6" opacity=".6"/>
        <rect x="14" y="64" width="170" height="58" rx="16" fill="#b5d8ca"/><rect x="24" y="72" width="150" height="10" rx="5" fill="#fff" opacity=".9"/><rect x="24" y="90" width="80" height="8" rx="4" fill="#2f6b56" opacity=".7"/><rect x="112" y="90" width="58" height="8" rx="4" fill="#2f6b56" opacity=".4"/><rect x="24" y="104" width="120" height="8" rx="4" fill="#2f6b56" opacity=".5"/>
        <rect x="-4" y="8" width="176" height="58" rx="16" fill="#fff"/><rect x="6" y="16" width="156" height="10" rx="5" fill="#c7b9f1"/><rect x="6" y="34" width="40" height="8" rx="4" fill="#6a3fd1"/><rect x="52" y="34" width="70" height="8" rx="4" fill="#9a98a8" opacity=".6"/><rect x="6" y="48" width="100" height="8" rx="4" fill="#9a98a8" opacity=".4"/>
      </g></svg>`;
    $("#app").innerHTML = `<div class="wrap">
      <section class="hero">
        <div class="card lav hero-main">${art}
          <h1>SQL с нуля за&nbsp;2&nbsp;месяца</h1>
          <p>Научишься доставать данные из базы, считать метрики и готовить отчёты для Excel. Теория, живые задачи из работы аналитика и подсказки, если застрянешь.</p>
          <div class="hero-actions">
            <a class="btn" href="#/m/${nm.id}">${started ? "Продолжить: " + esc(nm.short) : "Начать обучение"} <span class="arr">${I.arrow}</span></a>
            <a class="btn light" href="#/sandbox">Открыть песочницу</a>
          </div>
        </div>
        <div class="hero-side">
          <div class="card">
            <div class="hello"><div class="ava">${esc((S.name || "Я").trim()[0] || "Я").toUpperCase()}</div>
              <div style="flex:1"><div style="font-size:13px;color:var(--muted);font-weight:600">Привет 👋</div><input id="nm" value="${esc(S.name)}" placeholder="Как тебя зовут?" maxlength="30"></div></div>
            <div style="display:flex;justify-content:space-between;font-weight:700;font-size:14px;margin-bottom:8px"><span>Твой прогресс</span><span>${p}%</span></div>
            <div class="bar"><i style="width:${p}%"></i></div>
            <div class="stats">
              <div class="stat lav"><b>${MODS.filter(m => pct(keysOf(m)) === 100).length}/${MODS.length}</b><span>модулей</span></div>
              <div class="stat mint"><b>${solved}/${tasks}</b><span>задач</span></div>
              <div class="stat sky"><b>${wk}/8</b><span>неделя</span></div>
            </div>
          </div>
          <div class="card">
            <div class="cal-head"><span class="round" style="width:42px;height:42px;background:#f3f2f7;box-shadow:none">${I.cal}</span><h3>Расписание обучения</h3>
              <label class="chip out" style="cursor:pointer">старт: <input type="date" id="start" value="${S.start || iso(today)}" style="border:0;background:transparent;font:600 13px Manrope;width:118px"></label></div>
            ${cal}
            <div class="cal-note">${s ? `Сейчас неделя ${wk}: <b>${WEEKS[wk - 1].title}</b>. ` : "Выбери день старта, и календарь разложит курс по неделям. "}Около 5–7 часов в неделю.</div>
          </div>
        </div>
      </section>

      <div class="sec-head"><h2>Как устроен курс</h2><p>Каждый модуль делится на теорию, практику и домашку. Каждый блок можно отметить пройденным.</p></div>
      <div class="howto">
        <div class="card"><div class="num">1</div><h4>Теория</h4><p>Видео и подробные методички со схемами. Все примеры кода можно запустить прямо на странице.</p></div>
        <div class="card"><div class="num">2</div><h4>Практика</h4><p>Задачи от «руководителя» интернет-магазина. Пишешь запрос, жмёшь «Проверить» и сразу видишь, верно ли.</p></div>
        <div class="card"><div class="num">3</div><h4>Подсказки</h4><p>Застряла или застрял? Подсказки открываются по одной и ведут к ответу, не выдавая его целиком.</p></div>
        <div class="card"><div class="num">4</div><h4>Домашка</h4><p>Задачи посложнее для закрепления. В конце дипломный проект: отчёт для заказчика в Excel.</p></div>
      </div>

      <div class="sec-head"><h2>Программа курса</h2><p>12 модулей и подготовка. Учебная база одна на весь курс: интернет-магазин «Уютная лавка».</p></div>
      <div class="mods">${MODS.map(modCard).join("")}</div>
    </div>`;
    $("#nm").onchange = e => { S.name = e.target.value.trim(); save(); home(); };
    $("#start").onchange = e => { S.start = e.target.value; save(); home(); };
  }
  function modCard(m) {
    const k = keysOf(m), d = k.filter(isDone).length, p = pct(k);
    return `<a class="mod ${m.color}" href="#/m/${m.id}">
      <div class="mod-top"><span class="mod-ico">${I[m.icon] || I.db}</span><span class="chip">${m.num === 0 ? "Старт" : "Модуль " + m.num} · неделя ${m.week}</span></div>
      <div class="tag">${esc(m.tag)}</div><h3>${esc(m.title)}</h3><p>${esc(m.desc)}</p>
      <div class="mod-foot"><div class="bar"><i style="width:${p}%"></i></div><span class="chip">${p === 100 ? "✓ готово" : d + "/" + k.length}</span><span class="round">${I.arrow}</span></div></a>`;
  }

  /* ---------- модуль ---------- */
  let currentModule = null;
  function moduleView(id, tab) {
    const i = MODS.findIndex(m => m.id === id);
    if (i < 0) return home();
    const m = MODS[i];
    currentModule = m.id;
    tab = tab || "theory";
    const hasHW = m.homework && m.homework.tasks.length;
    const tabs = [["theory", "Теория"], ["practice", "Практика"]].concat(hasHW ? [["homework", "Домашка"]] : []);
    const side = MODS.map(x => `<a href="#/m/${x.id}" data-id="${x.id}" class="${x.id === m.id ? "on" : ""}"><span class="n ${pct(keysOf(x)) === 100 ? "full" : ""}">${x.num}</span>${esc(x.short)}</a>`).join("");
    $("#app").innerHTML = `<div class="wrap"><div class="layout">
      <aside class="side"><div class="label">Программа</div>${side}<div class="label">Инструменты</div><a href="#/sandbox"><span class="n">▶</span>Песочница</a><a href="#/links"><span class="n">★</span>Материалы</a></aside>
      <main>
        <section class="card ${m.color} mhead">
          <div class="chips"><a class="chip dark" href="#/" style="text-decoration:none">← Все модули</a><span class="chip">${m.num === 0 ? "Подготовка" : "Модуль " + m.num}</span><span class="chip">Неделя ${m.week}</span><span class="chip">${esc(m.time)}</span></div>
          <h1>${esc(m.title)}</h1><p class="lead">${m.lead}</p>
          <div class="goals">${m.goals.map(g => `<div>${I.check}<span>${g}</span></div>`).join("")}</div>
          <div class="mprog"><div class="bar"><i data-mprog style="width:${pct(keysOf(m))}%"></i></div><span data-mprog-t></span></div>
        </section>
        <nav class="tabs">${tabs.map(([t, n]) => `<a href="#/m/${m.id}/${t}" class="${t === tab ? "on" : ""}">${n} <small data-tabcount="${t}"></small></a>`).join("")}</nav>
        <div id="pane"></div>
        <div class="foot-nav">
          ${i > 0 ? `<a href="#/m/${MODS[i - 1].id}"><small>← Назад</small><b>${esc(MODS[i - 1].title)}</b></a>` : "<span></span>"}
          ${i < MODS.length - 1 ? `<a class="next" href="#/m/${MODS[i + 1].id}"><small>Дальше →</small><b>${esc(MODS[i + 1].title)}</b></a>` : ""}
        </div>
      </main></div></div>`;
    const pane = $("#pane");
    if (tab === "theory") theoryPane(m, pane);
    else if (tab === "practice") tasksPane(m, pane, "p", m.practice);
    else tasksPane(m, pane, "h", m.homework);
    refreshProgress();
  }

  function theoryPane(m, pane) {
    let html = "";
    if (m.video && m.video.length) {
      const k = m.id + ":v";
      html += `<section class="card block ${isDone(k) ? "done" : ""}"><div class="block-head"><span class="bn">▶</span><h3>Видео к модулю</h3></div>
        <div class="content"><p>${m.videoNote || "Посмотри перед чтением методички. Видео короткие, их удобно смотреть на скорости 1,25."}</p></div>
        <div class="videos">${m.video.map(videoHTML).join("")}</div><div class="block-foot">${markBtn(k)}</div></section>`;
    }
    m.theory.forEach((b, n) => {
      const k = m.id + ":t:" + b.id;
      html += `<section class="card block ${isDone(k) ? "done" : ""}" id="${b.id}"><div class="block-head"><span class="bn">${n + 1}</span><h3>${esc(b.title)}</h3></div>
        <div class="content">${b.html}</div><div class="block-foot">${markBtn(k)}${n === m.theory.length - 1 ? `<a class="btn small" style="margin-left:auto" href="#/m/${m.id}/practice">К практике <span class="arr">${I.arrow}</span></a>` : ""}</div></section>`;
    });
    pane.innerHTML = html;
    enhanceCode(pane); bindVideos(pane); bindMarks(pane);
  }

  function tasksPane(m, pane, kind, part) {
    const hw = kind === "h";
    let html = part.intro ? `<section class="card block"><div class="content">${part.intro}</div></section>` : "";
    part.tasks.forEach((t, n) => {
      const k = `${m.id}:${kind}:${t.id}`;
      html += `<section class="card task ${hw ? "hw" : ""} ${isDone(k) ? "done" : ""}" data-task="${t.id}">
        <div class="task-head"><span class="bn">${hw ? "ДЗ" : ""}${n + 1}</span><div class="ttl"><small>${hw ? "Домашнее задание" : "Задача"} ${n + 1}${t.level ? " · " + t.level : ""}</small><h3>${esc(t.title)}</h3></div></div>
        <div class="story">${t.text}</div>
        ${t.manual ? "" : `<div class="editor" data-ed></div>
        <div class="run-bar"><button class="btn small" data-run>▶ Запустить</button><button class="btn small lav" data-check>Проверить</button>
          <button class="btn small light" data-hint>Подсказка ${t.hints.length ? `(0/${t.hints.length})` : ""}</button>
          <button class="btn small light" data-exp>Что должно получиться</button>
          <span class="hint-k"><span class="kbd">Ctrl</span> + <span class="kbd">Enter</span> запуск</span></div>`}
        ${t.manual && t.hints && t.hints.length ? `<div class="run-bar"><button class="btn small light" data-hint>Подсказка (0/${t.hints.length})</button></div>` : ""}
        <div class="hints"></div><div class="expected"></div><div class="result"></div><div class="verdict"></div>
        <div class="block-foot">${markBtn(k, t.manual ? "Сделано" : "Отметить решённой")}</div></section>`;
    });
    pane.innerHTML = html;
    enhanceCode(pane); bindMarks(pane);
    part.tasks.forEach(t => bindTask(m, kind, t, $(`[data-task="${t.id}"]`, pane)));
  }

  function bindTask(m, kind, t, el) {
    const k = `${m.id}:${kind}:${t.id}`, ck = m.id + "/" + kind + "/" + t.id;
    const hints = $(".hints", el), out = $(".result", el), verdict = $(".verdict", el), exp = $(".expected", el);
    let shown = 0;
    const hb = $("[data-hint]", el);
    if (hb) hb.onclick = () => {
      if (shown < t.hints.length) {
        hints.insertAdjacentHTML("beforeend", `<div class="h"><b>Подсказка ${shown + 1}</b>${t.hints[shown]}</div>`);
        shown++;
        hb.textContent = shown < t.hints.length ? `Ещё подсказка (${shown}/${t.hints.length})` : (t.solution ? "Показать решение" : "Подсказок больше нет");
        enhanceCode(hints);
      } else if (t.solution && !$(".sol", hints)) {
        if (!confirm("Точно показать готовое решение? Лучше сначала попробовать ещё раз 🙂")) return;
        hints.insertAdjacentHTML("beforeend", `<div class="h sol"><b>Решение</b>${t.explain || ""}<pre class="sql norun">${esc(t.solution)}</pre></div>`);
        enhanceCode(hints);
        hb.disabled = true;
      }
    };
    if (t.manual) return;
    const onRun = () => doRun();
    const ed = makeEditor($("[data-ed]", el), S.code[ck] != null ? S.code[ck] : (t.starter || "-- Напиши запрос здесь\n"), onRun);
    ed.on(() => { S.code[ck] = ed.get(); save(); });
    async function doRun() {
      verdict.innerHTML = ""; out.innerHTML = loadingHTML;
      try { showResult(out, await run(ed.get(), { verify: t.verify })); } catch (e) { out.innerHTML = `<div class="msg err">${explainErr(e)}</div>`; }
    }
    $("[data-run]", el).onclick = onRun;
    $("[data-check]", el).onclick = async () => {
      verdict.innerHTML = ""; out.innerHTML = loadingHTML;
      let got;
      try { got = await run(ed.get(), { verify: t.verify }); }
      catch (e) { out.innerHTML = `<div class="msg err">${explainErr(e)}</div>`; return; }
      try {
        const want = await run(t.solution, { verify: t.verify });
        const r = t.verify ? compare(got.verify, want.verify, true) : compare(got, want, !!t.ordered);
        showResult(out, t.verify ? got.verify : got);
        if (t.verify) out.insertAdjacentHTML("afterbegin", `<p class="res-meta">Проверочный запрос после твоего кода:</p>`);
        if (r.ok) {
          verdict.innerHTML = `<div class="msg ok"><b>Верно! 🎉</b> ${t.after || "Задача решена и отмечена пройденной."}</div>`;
          if (!isDone(k)) { setDone(k, true); const b = $(`[data-mark="${k}"]`, el); b.classList.add("on"); b.lastElementChild.textContent = "Пройдено"; el.classList.add("done"); }
        } else verdict.innerHTML = `<div class="msg bad"><b>Пока не совпадает.</b> ${r.why}</div>`;
      } catch (e) { verdict.innerHTML = `<div class="msg err">Не получилось проверить: ${explainErr(e)}</div>`; }
    };
    $("[data-exp]", el).onclick = async () => {
      if (exp.innerHTML) { exp.innerHTML = ""; return; }
      exp.innerHTML = loadingHTML;
      try {
        const want = await run(t.solution, { verify: t.verify });
        const res = t.verify ? want.verify : want;
        const short = { cols: res.cols, rows: res.rows.slice(0, 5) };
        exp.innerHTML = `<div class="msg info" style="margin-bottom:8px"><b>Так должен выглядеть результат</b>${t.verify ? " проверочного запроса" : ""}: ${res.rows.length} ${plural(res.rows.length, "строка", "строки", "строк")}, столбцы: ${res.cols.map(c => "<code>" + esc(c) + "</code>").join(", ")}. ${res.rows.length > 5 ? "Ниже первые 5 строк." : ""}${t.ordered ? " Порядок строк важен." : " Порядок строк не важен."}</div>` + tableHTML(short);
        const b = $("[data-csv]", exp); if (b) b.remove();
      } catch (e) { exp.innerHTML = `<div class="msg err">${explainErr(e)}</div>`; }
    };
  }

  /* ---------- песочница ---------- */
  function sandbox() {
    currentModule = null;
    const T = window.COURSE.schema;
    $("#app").innerHTML = `<div class="wrap"><div class="sb">
      <main>
        <section class="card sky mhead" style="padding:30px">
          <h1 style="font-size:clamp(28px,4vw,44px)">Песочница</h1>
          <p class="lead">Настоящий PostgreSQL прямо в браузере, с базой «Уютной лавки». Пиши любые запросы. Можно создавать свои таблицы: они живут до перезагрузки страницы.</p>
        </section>
        <section class="card" style="margin-top:18px">
          <div class="editor" id="sbed"></div>
          <div class="run-bar"><button class="btn small" id="sbrun">▶ Запустить</button><button class="btn small light" id="sbreset">Вернуть базу к исходной</button>
            <span class="hint-k"><span class="kbd">Ctrl</span> + <span class="kbd">Enter</span> запуск</span></div>
          <div class="result" id="sbout"></div>
        </section>
        <section class="card" style="margin-top:18px"><h3>Быстрые запросы</h3><div class="run-bar" id="quick"></div></section>
      </main>
      <aside class="card schema"><h3 style="font-size:19px">Таблицы базы</h3><p style="font-size:13.5px;color:var(--muted)">Нажми на таблицу, чтобы увидеть столбцы. 🔑 первичный ключ.</p>
        ${T.map((t, i) => `<details ${i < 2 ? "open" : ""}><summary>${t.name}<span>${t.about}</span></summary><ul>${t.cols.map(c => `<li class="${c[2] ? "pk" : ""}"><code>${c[0]}</code><span>${c[1]}</span></li>`).join("")}</ul></details>`).join("")}
      </aside></div></div>`;
    const out = $("#sbout");
    const go = async () => {
      S.code.sandbox = ed.get(); save();
      out.innerHTML = loadingHTML;
      try { showResult(out, await run(ed.get(), { keep: true })); } catch (e) { out.innerHTML = `<div class="msg err">${explainErr(e)}</div>`; }
    };
    const ed = makeEditor($("#sbed"), S.code.sandbox || "SELECT *\nFROM orders\nLIMIT 10;", go);
    $("#sbrun").onclick = go;
    $("#sbreset").onclick = async () => { out.innerHTML = loadingHTML; await serial(() => resetDB()); out.innerHTML = '<div class="msg ok">База снова в исходном виде.</div>'; };
    const Q = [["Первые 10 заказов", "SELECT *\nFROM orders\nLIMIT 10;"], ["Все товары", "SELECT *\nFROM products;"], ["Клиенты", "SELECT *\nFROM customers\nLIMIT 20;"],
      ["Состав заказов", "SELECT *\nFROM order_items\nLIMIT 20;"], ["Список таблиц", "SELECT table_name\nFROM information_schema.tables\nWHERE table_schema = 'public';"]];
    $("#quick").innerHTML = Q.map((q, i) => `<button class="btn small light" data-q="${i}">${q[0]}</button>`).join("");
    $$("[data-q]").forEach(b => b.onclick = () => { ed.set(Q[b.dataset.q][1]); go(); });
  }

  /* ---------- план ---------- */
  function plan() {
    currentModule = null;
    const wk = currentWeek(), s = startDate();
    $("#app").innerHTML = `<div class="wrap">
      <section class="card mint mhead" style="margin-top:12px"><div class="chips"><span class="chip">8 недель</span><span class="chip">5–7 часов в неделю</span></div>
        <h1>План на 2 месяца</h1><p class="lead">Темп рассчитан на занятия 3–4 раза в неделю по 1,5–2 часа. Если неделя выдалась занятой, ничего страшного: просто сдвинь дату старта на главной.</p></section>
      <div style="display:grid;gap:14px;margin-top:20px">${WEEKS.map((w, i) => {
        const ms = MODS.filter(m => m.week === i + 1);
        const from = s ? new Date(mondayOf(s).getTime() + i * 7 * DAY + 3 * 36e5) : null;
        const range = from ? `${from.toLocaleDateString("ru", { day: "numeric", month: "short" })} – ${new Date(from.getTime() + 6 * DAY).toLocaleDateString("ru", { day: "numeric", month: "short" })}` : "";
        return `<section class="card" style="display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:start;${s && i + 1 === wk ? "box-shadow:inset 0 0 0 2px var(--ink)" : ""}">
          <div class="ava" style="background:var(--${w.color});width:64px;height:64px;font-size:15px;text-align:center;line-height:1.1">нед<br>${i + 1}</div>
          <div><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:6px"><h3 style="margin:0">${w.title}</h3>${range ? `<span class="chip" style="background:#f3f2f7">${range}</span>` : ""}${s && i + 1 === wk ? '<span class="chip dark">сейчас</span>' : ""}</div>
          <p style="color:#474755;margin:0 0 10px">${w.text}</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap">${ms.map(m => `<a class="btn small ${pct(keysOf(m)) === 100 ? "" : "light"}" href="#/m/${m.id}">${pct(keysOf(m)) === 100 ? "✓ " : ""}${m.num === 0 ? "Старт" : "Модуль " + m.num}: ${esc(m.short)}</a>`).join("")}</div></div></section>`;
      }).join("")}</div></div>`;
  }

  /* ---------- материалы ---------- */
  function links() {
    currentModule = null;
    $("#app").innerHTML = `<div class="wrap"><section class="card peach mhead" style="margin-top:12px"><h1>Материалы</h1><p class="lead">Файлы курса, шпаргалка и проверенные ресурсы, к которым стоит возвращаться.</p></section>
      <section class="card block" style="margin-top:18px"><div class="content">${window.COURSE.links}</div></section></div>`;
    enhanceCode($("#app"));
  }

  /* ---------- роутер ---------- */
  function route() {
    const h = location.hash || "#/";
    const parts = h.slice(2).split("/");
    let r = "#/";
    if (parts[0] === "m") { r = ""; moduleView(parts[1], parts[2]); }
    else if (parts[0] === "sandbox") { r = "#/sandbox"; sandbox(); }
    else if (parts[0] === "plan") { r = "#/plan"; plan(); }
    else if (parts[0] === "links") { r = "#/links"; links(); }
    else { currentModule = null; home(); }
    header(r);
    if (parts[0] === "m" && lastMod === parts[1] && $(".tabs")) window.scrollTo(0, $(".mhead").offsetTop + $(".mhead").offsetHeight - 60);
    else window.scrollTo(0, 0);
    lastMod = parts[0] === "m" ? parts[1] : null;
    if (parts[0] === "m" || parts[0] === "sandbox") setTimeout(() => getDB().catch(() => {}), 1500);
  }
  let lastMod = null;
  window.addEventListener("hashchange", route);
  route();
})();
