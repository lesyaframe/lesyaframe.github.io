(function () {
const M = window.COURSE.modules;
const from = (who, text) => `<span class="from"><b>${who}</b>${text}</span>`;
const MARINA = "Марина, владелица «Уютной лавки»";
const DIMA = "Дима, маркетолог";
const OLYA = "Оля, финансы";
const SERGEY = "Сергей, склад";

/* ===================== 5. ДАТА И ВРЕМЯ, ЧАСТЬ 1 ===================== */
M.push({
  id: "m5", num: 5, week: 3, color: "sky", icon: "clock", time: "≈ 4 часа",
  short: "Дата и время. Часть 1", tag: "Функции даты и времени", title: "Дата и время. Часть 1",
  desc: "Системные дата и время, части даты, форматы и арифметика: сколько дней прошло, какой день недели, во сколько заказывают.",
  lead: "Почти любой вопрос бизнеса привязан ко времени: за месяц, по неделям, в выходные, сколько дней шла доставка. Здесь разберёмся, как устроены даты в PostgreSQL и что с ними можно делать.",
  goals: ["Получать системные дату и время", "Доставать из даты год, месяц, день недели, час", "Форматировать даты через to_char", "Считать разницу между датами и сдвигать их"],
  video: [{ id: "W6b-r9i1ZGg", title: "Работа с датой и временем. Уроки PostgreSQL", author: "Аве Кодер", len: "6 мин" }],
  theory: [
    { id: "types", title: "Типы даты и времени", html: `
<div class="tbl-wrap"><table class="t">
<tr><th>Тип</th><th>Что хранит</th><th>Пример</th><th>Где в лавке</th></tr>
<tr><td><code>date</code></td><td>только дату</td><td>2026-09-15</td><td>birth_date, added_at</td></tr>
<tr><td><code>timestamp</code></td><td>дату и время</td><td>2026-09-15 14:30:05</td><td>created_at, registered_at</td></tr>
<tr><td><code>timestamptz</code></td><td>дату и время с часовым поясом</td><td>2026-09-15 14:30:05+03</td><td>результат now()</td></tr>
<tr><td><code>time</code></td><td>только время</td><td>14:30:05</td><td>редко</td></tr>
<tr><td><code>interval</code></td><td>промежуток</td><td>3 days 04:00:00</td><td>разница двух timestamp</td></tr>
</table></div>
<div class="note"><b>Формат записи</b>PostgreSQL хранит и показывает даты в формате ISO: <code>ГГГГ-ММ-ДД</code>. Это удобно: такие строки правильно сортируются и сравниваются. Если в запросе пишешь дату текстом, пиши её именно так: <code>'2026-09-15'</code>.</div>` },
    { id: "now", title: "Системные дата и время", html: `
<div class="tbl-wrap"><table class="t">
<tr><th>Функция</th><th>Что возвращает</th><th>Тип</th></tr>
<tr><td><code>current_date</code></td><td>сегодняшняя дата</td><td>date</td></tr>
<tr><td><code>now()</code> или <code>current_timestamp</code></td><td>текущий момент с часовым поясом</td><td>timestamptz</td></tr>
<tr><td><code>localtimestamp</code></td><td>текущий момент без пояса</td><td>timestamp</td></tr>
<tr><td><code>current_time</code></td><td>текущее время</td><td>time</td></tr>
</table></div>
<pre class="sql">SELECT current_date, now(), localtimestamp, current_time;</pre>
<div class="warn"><b>Учебные данные заканчиваются 30 сентября 2026</b>Если в задаче сказано «за последние 30 дней», в рабочей базе ты бы написал(а) <code>current_date - 30</code>. В учебной базе даты не обновляются, поэтому в задачах мы часто будем считать «от 30 сентября 2026»: <code>'2026-09-30'::date</code>.</div>
<p>Небольшой факт: <code>now()</code> возвращает время начала транзакции, поэтому внутри одного запроса оно одинаковое во всех строках. Это удобно, значение не «плывёт».</p>` },
    { id: "extract", title: "Части даты: extract и date_part", html: `
<p><code>extract(часть from дата)</code> достаёт из даты нужный кусок числом.</p>
<div class="tbl-wrap"><table class="t">
<tr><th>Часть</th><th>Что вернёт для 2026-09-15 14:30 (вторник)</th></tr>
<tr><td><code>year</code></td><td>2026</td></tr>
<tr><td><code>quarter</code></td><td>3</td></tr>
<tr><td><code>month</code></td><td>9</td></tr>
<tr><td><code>week</code></td><td>38 (номер недели по ISO)</td></tr>
<tr><td><code>day</code></td><td>15</td></tr>
<tr><td><code>dow</code></td><td>2 (день недели, 0 = воскресенье)</td></tr>
<tr><td><code>isodow</code></td><td>2 (день недели, 1 = понедельник … 7 = воскресенье)</td></tr>
<tr><td><code>doy</code></td><td>258 (день года)</td></tr>
<tr><td><code>hour</code>, <code>minute</code></td><td>14, 30</td></tr>
<tr><td><code>epoch</code></td><td>секунды с 1970-01-01 (удобно для разниц)</td></tr>
</table></div>
<pre class="sql">SELECT order_id,
       created_at,
       extract(year from created_at)   AS y,
       extract(month from created_at)  AS m,
       extract(isodow from created_at) AS weekday,
       extract(hour from created_at)   AS h
FROM orders
LIMIT 10;</pre>
<p><code>date_part('month', created_at)</code> делает то же самое, просто другая запись. Встретишь в чужих запросах.</p>
<div class="tip"><b>isodow вместо dow</b>В России неделя начинается с понедельника. С <code>isodow</code> выходные это 6 и 7, а с <code>dow</code> это 6 и 0, легко запутаться.</div>` },
    { id: "format", title: "Форматы: to_char", html: `
<p><code>to_char(дата, 'шаблон')</code> превращает дату в текст нужного вида. Полезно для отчётов и подписей на графиках.</p>
<div class="tbl-wrap"><table class="t">
<tr><th>Шаблон</th><th>Значит</th><th>Пример</th></tr>
<tr><td><code>YYYY</code></td><td>год</td><td>2026</td></tr>
<tr><td><code>MM</code></td><td>месяц числом</td><td>09</td></tr>
<tr><td><code>Mon</code> / <code>Month</code></td><td>месяц словом</td><td>Sep / September</td></tr>
<tr><td><code>DD</code></td><td>день</td><td>15</td></tr>
<tr><td><code>Dy</code> / <code>Day</code></td><td>день недели</td><td>Tue / Tuesday</td></tr>
<tr><td><code>HH24:MI</code></td><td>часы и минуты</td><td>14:30</td></tr>
<tr><td><code>Q</code></td><td>квартал</td><td>3</td></tr>
<tr><td><code>IW</code></td><td>номер недели ISO</td><td>38</td></tr>
</table></div>
<pre class="sql">SELECT created_at,
       to_char(created_at, 'DD.MM.YYYY') AS ru_date,
       to_char(created_at, 'YYYY-MM') AS month_key,
       to_char(created_at, 'HH24:MI') AS time_only,
       to_char(created_at, 'YYYY "Q"Q') AS quarter
FROM orders
LIMIT 5;</pre>
<div class="note"><b>Месяцы по-русски</b>Добавь приставку <code>TM</code>: <code>to_char(created_at, 'TMMonth')</code>. Она берёт язык из настроек сервера. В DBeaver на русском сервере получится «Сентябрь», а в песочнице курса будет по-английски.</div>
<div class="warn"><b>to_char возвращает текст</b>После to_char дата стала строкой. Сравнивать и сортировать её как дату уже нельзя (кроме формата <code>YYYY-MM</code>, он сортируется правильно). Поэтому форматируй в самом конце, для красоты.</div>` },
    { id: "math", title: "Арифметика дат", html: `
<div class="tbl-wrap"><table class="t">
<tr><th>Операция</th><th>Результат</th><th>Пример</th></tr>
<tr><td><code>date + целое</code></td><td>дата через N дней</td><td><code>'2026-09-15'::date + 14</code> → 2026-09-29</td></tr>
<tr><td><code>date − date</code></td><td>число дней</td><td><code>'2026-09-30'::date - '2026-09-01'::date</code> → 29</td></tr>
<tr><td><code>timestamp + interval</code></td><td>сдвиг на промежуток</td><td><code>created_at + interval '2 hours'</code></td></tr>
<tr><td><code>timestamp − timestamp</code></td><td>interval</td><td><code>delivered_at - created_at</code> → 3 days 05:12:00</td></tr>
<tr><td><code>age(a, b)</code></td><td>разница «по-человечески»</td><td><code>age('2026-09-30', '1994-05-17')</code> → 32 years 4 mons 13 days</td></tr>
</table></div>
<p>Интервалы пишутся словами: <code>interval '1 day'</code>, <code>'3 hours'</code>, <code>'2 weeks'</code>, <code>'1 month'</code>, <code>'1 year 2 months'</code>.</p>
<pre class="sql">-- Сколько шла доставка
SELECT order_id,
       created_at,
       delivered_at,
       delivered_at - created_at AS took,
       delivered_at::date - created_at::date AS days
FROM orders
WHERE status = 'доставлен'
LIMIT 10;</pre>
<pre class="sql">-- Точный возраст клиента в годах
SELECT first_name,
       birth_date,
       extract(year from age(current_date, birth_date)) AS age_years
FROM customers
LIMIT 10;</pre>
<div class="tip"><b>Разница в часах</b>Чтобы получить разницу двух timestamp числом часов, переведи интервал в секунды и раздели: <code>extract(epoch from delivered_at - created_at) / 3600</code>.</div>` },
    { id: "trunc", title: "Округление дат: date_trunc", html: `
<p><code>date_trunc('единица', дата)</code> «обрезает» дату до начала месяца, недели, дня. Это главный инструмент для отчётов по периодам: все заказы сентября получат одну и ту же метку <code>2026-09-01</code>.</p>
<div class="tbl-wrap"><table class="t">
<tr><th>Вызов</th><th>Для 2026-09-17 14:30</th></tr>
<tr><td><code>date_trunc('year', …)</code></td><td>2026-01-01 00:00</td></tr>
<tr><td><code>date_trunc('quarter', …)</code></td><td>2026-07-01 00:00</td></tr>
<tr><td><code>date_trunc('month', …)</code></td><td>2026-09-01 00:00</td></tr>
<tr><td><code>date_trunc('week', …)</code></td><td>2026-09-14 00:00 (понедельник)</td></tr>
<tr><td><code>date_trunc('day', …)</code></td><td>2026-09-17 00:00</td></tr>
<tr><td><code>date_trunc('hour', …)</code></td><td>2026-09-17 14:00</td></tr>
</table></div>
<pre class="sql">SELECT created_at,
       date_trunc('month', created_at)::date AS month,
       date_trunc('week', created_at)::date AS week_start
FROM orders
LIMIT 10;</pre>
<p>В модуле 7 мы будем группировать по этим меткам и получим выручку по месяцам и неделям.</p>` }
  ],
  practice: {
    tasks: [
      { id: "hour", title: "Во сколько заказывают", text: `${from(DIMA, "Хочу ставить рекламу на правильные часы. Для каждого заказа выведи номер и час оформления (числом от 0 до 23).")}`,
        hints: ["Нужна часть даты <code>hour</code>.", "<code>extract(hour from created_at)</code>"], solution: "SELECT order_id, extract(hour from created_at) AS hour\nFROM orders;" },
      { id: "weekend", title: "Заказы в выходные", text: `${from(MARINA, "Мне кажется, по выходным заказывают больше. Покажи все заказы, оформленные в субботу или воскресенье: номер заказа и дату.")}`,
        hints: ["День недели достаётся через extract. Удобнее <code>isodow</code>: суббота 6, воскресенье 7.", "<code>WHERE extract(isodow from created_at) IN (6, 7)</code>"], solution: "SELECT order_id, created_at\nFROM orders\nWHERE extract(isodow from created_at) IN (6, 7);" },
      { id: "delivery", title: "Сколько дней шла доставка", text: `${from(SERGEY, "Для доставленных заказов посчитай, за сколько календарных дней мы доставили: номер заказа и число дней (дата доставки минус дата заказа, без учёта часов).")}`,
        hints: ["Если вычесть одну date из другой, получится целое число дней. Значит, сначала отрежь время.", "<code>delivered_at::date - created_at::date</code>, фильтр по статусу 'доставлен'."], solution: "SELECT order_id, delivered_at::date - created_at::date AS days\nFROM orders\nWHERE status = 'доставлен';" },
      { id: "return", title: "Срок возврата", text: `${from(OLYA, "По закону товар можно вернуть в течение 14 дней после получения. Для доставленных заказов выведи номер, дату доставки (без времени) и последний день возврата.")}`,
        hints: ["К дате (date) можно прибавить целое число дней.", "<code>delivered_at::date</code> и <code>delivered_at::date + 14</code>."], solution: "SELECT order_id, delivered_at::date AS delivered, delivered_at::date + 14 AS return_until\nFROM orders\nWHERE status = 'доставлен';" },
      { id: "monthlabel", title: "Подписи для отчёта", text: `${from(MARINA, "Сделай мне колонку с месяцем заказа в виде «2026-09» и рядом дату в привычном виде «15.09.2026». Номер заказа первым столбцом.")}`,
        hints: ["Форматирование дат в текст делает <code>to_char</code>.", "Шаблоны: <code>'YYYY-MM'</code> и <code>'DD.MM.YYYY'</code>."], solution: "SELECT order_id, to_char(created_at, 'YYYY-MM') AS month, to_char(created_at, 'DD.MM.YYYY') AS day\nFROM orders;" },
      { id: "regdays", title: "Сколько дней с нами", text: `${from(DIMA, "Сделаем письмо «Спасибо, что вы с нами N дней». Посчитай для каждого клиента, сколько дней прошло от регистрации до 30 сентября 2026. Выведи id, имя и число дней.")}`,
        hints: ["Дата, от которой считаем: <code>'2026-09-30'::date</code>.", "Отрежь время у регистрации и вычти: <code>'2026-09-30'::date - registered_at::date</code>."], solution: "SELECT customer_id, first_name, '2026-09-30'::date - registered_at::date AS days_with_us\nFROM customers;" }
    ]
  },
  homework: {
    tasks: [
      { id: "night", title: "Ночные покупатели", text: `<p>Найди заказы, оформленные с 22:00 до 23:59. Выведи номер заказа, время в формате <code>HH24:MI</code> и id клиента.</p>`,
        hints: ["Условие на час: <code>extract(hour from created_at) >= 22</code>.", "Время текстом: <code>to_char(created_at, 'HH24:MI')</code>."], solution: "SELECT order_id, to_char(created_at, 'HH24:MI') AS time, customer_id\nFROM orders\nWHERE extract(hour from created_at) >= 22;" },
      { id: "hours", title: "Доставка в часах", level: "средне", text: `<p>Для доставленных заказов посчитай время доставки в часах, округлённое до целого. Выведи номер заказа и часы. Отсортируй от самых долгих доставок, оставь 10.</p>`,
        hints: ["Интервал в секунды: <code>extract(epoch from delivered_at - created_at)</code>.", "Раздели на 3600 и округли. ORDER BY по убыванию, LIMIT 10."], ordered: true, solution: "SELECT order_id, round(extract(epoch from delivered_at - created_at) / 3600) AS hours\nFROM orders\nWHERE status = 'доставлен'\nORDER BY hours DESC, order_id\nLIMIT 10;" },
      { id: "q4", title: "Заказы четвёртого квартала", text: `<p>Выведи номера и даты заказов, оформленных в 4 квартале любого года (октябрь–декабрь).</p>`,
        hints: ["Подойдёт <code>extract(quarter from created_at) = 4</code>."], solution: "SELECT order_id, created_at\nFROM orders\nWHERE extract(quarter from created_at) = 4;" },
      { id: "ages", title: "Точный возраст", level: "посложнее", text: `<p>Посчитай точный возраст клиентов в полных годах на 30 сентября 2026 с помощью <code>age()</code>. Выведи id, дату рождения и возраст.</p>`,
        hints: ["<code>age(дата1, дата2)</code> вернёт интервал вида «32 years 4 mons».", "Достань из него годы: <code>extract(year from age('2026-09-30'::date, birth_date))</code>."], solution: "SELECT customer_id, birth_date, extract(year from age('2026-09-30'::date, birth_date)) AS age\nFROM customers;" }
    ]
  }
});

/* ===================== 6. ДАТА И ВРЕМЯ, ЧАСТЬ 2 ===================== */
M.push({
  id: "m6", num: 6, week: 3, color: "lav", icon: "cal", time: "≈ 4 часа",
  short: "Дата и время. Часть 2", tag: "Функции даты и времени", title: "Дата и время. Часть 2",
  desc: "Как правильно фильтровать по дате, превращать строки в даты и собирать даты из чисел.",
  lead: "Здесь подробная методичка без видео: тема узкая, хороших коротких роликов по ней мало. Разберём ошибки, на которых спотыкаются почти все новички, и научимся собирать даты из кусочков.",
  goals: ["Правильно сравнивать timestamp с конкретной датой", "Фильтровать по периодам без потерь", "Превращать строки в даты: to_date, to_timestamp", "Создавать даты: make_date, интервалы, начало и конец месяца"],
  theory: [
    { id: "equal", title: "Почему created_at = '2025-12-23' ничего не находит", html: `
<p>Классическая ошибка. Хотим заказы за 23 декабря 2025:</p>
<pre class="sql">SELECT order_id, created_at
FROM orders
WHERE created_at = '2025-12-23';</pre>
<p>Пусто, хотя заказы в этот день были. Причина: <code>created_at</code> имеет тип timestamp, и строка <code>'2025-12-23'</code> превращается в <code>2025-12-23 00:00:00</code>. Сравнение ищет заказы, оформленные ровно в полночь до секунды.</p>
<div class="tbl-wrap"><table class="t">
<tr><th>Способ</th><th>Запись</th><th>Оценка</th></tr>
<tr><td>Отрезать время</td><td><code>created_at::date = '2025-12-23'</code></td><td>✅ просто и понятно</td></tr>
<tr><td>Полуинтервал</td><td><code>created_at &gt;= '2025-12-23' AND created_at &lt; '2025-12-24'</code></td><td>✅ самый быстрый на больших таблицах</td></tr>
<tr><td>BETWEEN</td><td><code>created_at BETWEEN '2025-12-23' AND '2025-12-23 23:59:59'</code></td><td>⚠️ работает, но легко ошибиться</td></tr>
<tr class="off"><td>Равенство</td><td><code>created_at = '2025-12-23'</code></td><td>❌ найдёт только полночь</td></tr>
</table></div>
<pre class="sql">SELECT order_id, created_at
FROM orders
WHERE created_at::date = '2025-12-23';</pre>
<div class="note"><b>Почему полуинтервал быстрее</b>На больших таблицах по столбцу с датой обычно построен индекс (как оглавление в книге). Условие <code>created_at::date = …</code> заставляет базу посчитать выражение для каждой строки, и индекс не работает. Условие <code>&gt;= … AND &lt; …</code> использует индекс напрямую. На учебных данных разницы не почувствуешь, а на миллионах строк она огромная.</div>` },
    { id: "periods", title: "Фильтры по периодам", html: `
<p>Несколько способов отобрать заказы за декабрь 2025:</p>
<div class="tbl-wrap"><table class="t">
<tr><th>Запись</th><th>Комментарий</th></tr>
<tr class="hl"><td><code>created_at &gt;= '2025-12-01' AND created_at &lt; '2026-01-01'</code></td><td>лучший вариант</td></tr>
<tr><td><code>date_trunc('month', created_at) = '2025-12-01'</code></td><td>читается легко</td></tr>
<tr><td><code>extract(year from created_at) = 2025 AND extract(month from created_at) = 12</code></td><td>длинно, но понятно</td></tr>
<tr><td><code>to_char(created_at, 'YYYY-MM') = '2025-12'</code></td><td>работает, но сравниваем текст</td></tr>
</table></div>
<h4>Относительные периоды</h4>
<p>В рабочих отчётах периоды обычно считают от сегодняшнего дня, чтобы запрос не приходилось править:</p>
<div class="tbl-wrap"><table class="t">
<tr><th>Период</th><th>Условие</th></tr>
<tr><td>последние 7 дней</td><td><code>created_at &gt;= current_date - 7</code></td></tr>
<tr><td>текущий месяц</td><td><code>created_at &gt;= date_trunc('month', current_date)</code></td></tr>
<tr><td>прошлый месяц</td><td><code>created_at &gt;= date_trunc('month', current_date) - interval '1 month'<br>AND created_at &lt; date_trunc('month', current_date)</code></td></tr>
<tr><td>с начала года</td><td><code>created_at &gt;= date_trunc('year', current_date)</code></td></tr>
</table></div>
<p>В учебной базе «сегодня» это 30 сентября 2026, поэтому подставим дату вместо current_date:</p>
<pre class="sql">-- Заказы за прошлый месяц относительно 30.09.2026 (то есть за август)
SELECT order_id, created_at
FROM orders
WHERE created_at >= date_trunc('month', '2026-09-30'::date) - interval '1 month'
  AND created_at <  date_trunc('month', '2026-09-30'::date);</pre>` },
    { id: "parse", title: "Строки в даты: to_date и to_timestamp", html: `
<p>Данные часто приходят из Excel, CSV или от партнёров в «человеческом» виде: <code>15.09.2026</code>, <code>15/09/2026 14:30</code>. Чтобы работать с ними как с датами, их нужно преобразовать.</p>
<div class="tbl-wrap"><table class="t">
<tr><th>Строка</th><th>Как превратить</th><th>Результат</th></tr>
<tr><td><code>'2026-09-15'</code></td><td><code>'2026-09-15'::date</code></td><td>2026-09-15</td></tr>
<tr><td><code>'15.09.2026'</code></td><td><code>to_date('15.09.2026', 'DD.MM.YYYY')</code></td><td>2026-09-15</td></tr>
<tr><td><code>'09/15/2026'</code> (американский)</td><td><code>to_date('09/15/2026', 'MM/DD/YYYY')</code></td><td>2026-09-15</td></tr>
<tr><td><code>'15.09.2026 14:30'</code></td><td><code>to_timestamp('15.09.2026 14:30', 'DD.MM.YYYY HH24:MI')</code></td><td>2026-09-15 14:30:00+03</td></tr>
<tr><td><code>'20260915'</code></td><td><code>to_date('20260915', 'YYYYMMDD')</code></td><td>2026-09-15</td></tr>
</table></div>
<div class="warn"><b>Опасная двусмысленность</b><code>'03.04.2026'</code> это 3 апреля или 4 марта? Приведение через <code>::date</code> угадывает формат по настройкам сервера, и угадать может неправильно. Для любых форматов, кроме ISO, всегда используй to_date с явным шаблоном.</div>
<h4>Маленькая таблица прямо в запросе: VALUES</h4>
<p>Чтобы потренироваться, не создавая таблиц, можно описать данные прямо в запросе. Это пригодится и в работе, когда коллега прислал пару значений в чате.</p>
<pre class="sql">SELECT raw,
       to_date(raw, 'DD.MM.YYYY') AS parsed
FROM (VALUES ('01.10.2026'), ('15.10.2026'), ('31.12.2026')) AS t(raw);</pre>
<p>Здесь <code>t</code> это имя «таблицы», а <code>raw</code> имя её столбца.</p>` },
    { id: "make", title: "Создаём даты: make_date, интервалы, границы месяца", html: `
<div class="tbl-wrap"><table class="t">
<tr><th>Задача</th><th>Запись</th></tr>
<tr><td>Дата из года, месяца и дня</td><td><code>make_date(2026, 9, 15)</code></td></tr>
<tr><td>Дата и время из частей</td><td><code>make_timestamp(2026, 9, 15, 14, 30, 0)</code></td></tr>
<tr><td>Интервал из чисел</td><td><code>make_interval(days =&gt; 10)</code> или <code>10 * interval '1 day'</code></td></tr>
<tr><td>Первый день месяца</td><td><code>date_trunc('month', d)::date</code></td></tr>
<tr><td>Последний день месяца</td><td><code>(date_trunc('month', d) + interval '1 month - 1 day')::date</code></td></tr>
<tr><td>Первый день следующего месяца</td><td><code>(date_trunc('month', d) + interval '1 month')::date</code></td></tr>
<tr><td>Понедельник текущей недели</td><td><code>date_trunc('week', d)::date</code></td></tr>
</table></div>
<pre class="sql">SELECT make_date(2026, 12, 31) AS new_year_eve,
       (date_trunc('month', '2026-02-10'::date) + interval '1 month - 1 day')::date AS last_feb_day,
       '2026-09-30'::date + make_interval(days => 45) AS plus_45;</pre>
<div class="life"><b>День рождения в этом году</b>Маркетологу нужно поздравлять клиентов. Год рождения не нужен, нужна дата дня рождения в 2026 году: <code>make_date(2026, extract(month from birth_date)::int, extract(day from birth_date)::int)</code>. Приведение <code>::int</code> нужно, потому что extract возвращает дробное число, а make_date ждёт целые.</div>
<pre class="sql">SELECT first_name,
       birth_date,
       make_date(2026, extract(month from birth_date)::int, extract(day from birth_date)::int) AS bday_2026
FROM customers
LIMIT 10;</pre>
<h4>Список дат: generate_series</h4>
<p>Иногда нужен календарь: все дни или все месяцы подряд. Его создаёт <code>generate_series</code>. Подробно будем использовать в модуле 11.</p>
<pre class="sql">SELECT generate_series('2026-09-01'::date, '2026-09-07'::date, interval '1 day')::date AS day;</pre>` },
    { id: "cheat", title: "Шпаргалка по датам", html: `
<div class="grid2">
<div class="tile sky"><h4>Взять часть</h4><ul><li><code>extract(month from d)</code></li><li><code>extract(isodow from d)</code></li><li><code>d::date</code> отрезать время</li></ul></div>
<div class="tile mint"><h4>Округлить до периода</h4><ul><li><code>date_trunc('month', d)</code></li><li><code>date_trunc('week', d)</code></li></ul></div>
<div class="tile lav"><h4>Сдвинуть и посчитать</h4><ul><li><code>d + 7</code>, <code>d + interval '1 month'</code></li><li><code>d2 - d1</code> дни или интервал</li><li><code>age(d2, d1)</code></li></ul></div>
<div class="tile lime"><h4>Из текста и в текст</h4><ul><li><code>to_date(s, 'DD.MM.YYYY')</code></li><li><code>to_timestamp(s, 'DD.MM.YYYY HH24:MI')</code></li><li><code>to_char(d, 'DD.MM.YYYY')</code></li></ul></div>
</div>
<p>Полный список функций есть в <a href="https://postgrespro.ru/docs/postgresql/17/functions-datetime" target="_blank" rel="noopener">документации Postgres Pro</a>.</p>` }
  ],
  practice: {
    tasks: [
      { id: "xmas", title: "Предновогодний день", text: `${from(MARINA, "Помню, 28 декабря 2025 был завал с заказами. Покажи, какие заказы пришли в этот день: номер и время оформления.")}`,
        hints: ["Сравнение timestamp со строкой даты найдёт только полночь. Нужно отрезать время или взять полуинтервал.", "<code>WHERE created_at::date = '2025-12-28'</code>"], solution: "SELECT order_id, created_at\nFROM orders\nWHERE created_at::date = '2025-12-28';" },
      { id: "dec", title: "Декабрьские заказы", text: `${from(OLYA, "Нужны все заказы за декабрь 2025: номер, клиент, дата. Сделай так, чтобы не потерялся ни один заказ 31 декабря.")}`,
        hints: ["Используй полуинтервал: от 1 декабря включительно до 1 января не включительно.", "<code>created_at >= '2025-12-01' AND created_at &lt; '2026-01-01'</code>"], solution: "SELECT order_id, customer_id, created_at\nFROM orders\nWHERE created_at >= '2025-12-01' AND created_at < '2026-01-01';" },
      { id: "last30", title: "Последние 30 дней", text: `${from(DIMA, "Какие заказы пришли за последние 30 дней? «Сегодня» для нас это 30 сентября 2026, и сам этот день тоже считаем. Номер заказа и дата.")}`,
        hints: ["30 дней, включая 30 сентября: это с 1 сентября по 30 сентября включительно. От даты можно отнять число дней: <code>'2026-09-30'::date - 29</code>.", "Чтобы захватить весь день 30 сентября, верхняя граница строго меньше <code>'2026-10-01'</code>."], solution: "SELECT order_id, created_at\nFROM orders\nWHERE created_at >= '2026-09-30'::date - 29\n  AND created_at < '2026-10-01';" },
      { id: "partner", title: "Даты от партнёра", text: `${from(SERGEY, "Поставщик прислал даты поставок в таком виде: 05.10.2026, 19.10.2026, 02.11.2026. Преврати их в нормальные даты и посчитай, какой это день недели (isodow). Два столбца: дата и день недели.")}`,
        hints: ["Сделай таблицу на лету: <code>FROM (VALUES ('05.10.2026'), …) AS t(raw)</code>.", "Дата: <code>to_date(raw, 'DD.MM.YYYY')</code>. День недели: <code>extract(isodow from to_date(…))</code>."], solution: "SELECT to_date(raw, 'DD.MM.YYYY') AS supply_date,\n       extract(isodow from to_date(raw, 'DD.MM.YYYY')) AS weekday\nFROM (VALUES ('05.10.2026'), ('19.10.2026'), ('02.11.2026')) AS t(raw);" },
      { id: "bday", title: "Именинники октября", text: `${from(DIMA, "Хочу отправить промокод клиентам, у кого день рождения в октябре. Дай имя, почту и дату их дня рождения в 2026 году.")}`,
        hints: ["Фильтр: месяц рождения равен 10.", "Дата в 2026 году: <code>make_date(2026, extract(month from birth_date)::int, extract(day from birth_date)::int)</code>."], solution: "SELECT first_name, email,\n       make_date(2026, extract(month from birth_date)::int, extract(day from birth_date)::int) AS bday_2026\nFROM customers\nWHERE extract(month from birth_date) = 10;" }
    ]
  },
  homework: {
    tasks: [
      { id: "lastday", title: "Заказы в последний день месяца", level: "посложнее", text: `<p>Найди заказы, оформленные в последний день любого месяца. Выведи номер заказа и дату (без времени).</p>`,
        hints: ["Последний день месяца для даты: <code>(date_trunc('month', created_at) + interval '1 month - 1 day')::date</code>.", "Сравни с <code>created_at::date</code>."], solution: "SELECT order_id, created_at::date AS day\nFROM orders\nWHERE created_at::date = (date_trunc('month', created_at) + interval '1 month - 1 day')::date;" },
      { id: "aug", title: "Прошлый месяц формулой", text: `<p>Выведи номера заказов за прошлый месяц относительно 30.09.2026, используя date_trunc и интервал (не вписывай август руками).</p>`,
        hints: ["Начало текущего месяца: <code>date_trunc('month', '2026-09-30'::date)</code>. Начало прошлого: то же минус <code>interval '1 month'</code>."], solution: "SELECT order_id\nFROM orders\nWHERE created_at >= date_trunc('month', '2026-09-30'::date) - interval '1 month'\n  AND created_at < date_trunc('month', '2026-09-30'::date);" },
      { id: "ts", title: "Время из CSV", text: `<p>Из выгрузки пришли строки <code>'03.10.2026 09:15'</code>, <code>'03.10.2026 18:40'</code>, <code>'04.10.2026 23:05'</code>. Преврати их в timestamp и выведи вторым столбцом час.</p>`,
        hints: ["<code>to_timestamp(raw, 'DD.MM.YYYY HH24:MI')</code>", "Час: extract(hour from …)."], solution: "SELECT to_timestamp(raw, 'DD.MM.YYYY HH24:MI') AS ts,\n       extract(hour from to_timestamp(raw, 'DD.MM.YYYY HH24:MI')) AS h\nFROM (VALUES ('03.10.2026 09:15'), ('03.10.2026 18:40'), ('04.10.2026 23:05')) AS t(raw);" },
      { id: "fastreg", title: "Заказы августовских новичков", level: "средне", text: `<p>Выведи номер заказа и id клиента для всех заказов клиентов, которые зарегистрировались в августе 2026. Данные о регистрации лежат в другой таблице, а JOIN мы ещё не проходили. Выручит подзапрос внутри IN: это разминка перед модулем 8.</p>`,
        hints: ["Внутри IN можно написать целый запрос: <code>WHERE customer_id IN (SELECT customer_id FROM customers WHERE …)</code>.", "Период регистрации: <code>registered_at >= '2026-08-01' AND registered_at &lt; '2026-09-01'</code>."], solution: "SELECT order_id, customer_id\nFROM orders\nWHERE customer_id IN (\n  SELECT customer_id FROM customers\n  WHERE registered_at >= '2026-08-01' AND registered_at < '2026-09-01'\n);" }
    ]
  }
});

/* ===================== 7. АГРЕГАТЫ И ГРУППИРОВКА ===================== */
M.push({
  id: "m7", num: 7, week: 4, color: "mint", icon: "sigma", time: "≈ 6 часов",
  short: "Агрегаты и группировка", tag: "Агрегатные функции", title: "Агрегатные функции и группировка",
  desc: "COUNT, SUM, AVG, MIN, MAX. Группируем по городам, статусам и месяцам, фильтруем группы через HAVING.",
  lead: "До этого модуля каждая строка результата соответствовала строке таблицы. Теперь будем «сворачивать» много строк в одну цифру: сколько заказов, какая выручка, какой средний чек. Это основа любой аналитики.",
  goals: ["Считать количество, сумму, среднее, минимум и максимум", "Группировать по одному и нескольким полям", "Фильтровать группы через HAVING", "Строить отчёты по месяцам"],
  video: [
    { id: "q0nuhf7vzkE", title: "Агрегатные функции", author: "Andrey Sozykin", len: "9 мин" },
    { id: "ytfXUvCsNuo", title: "Группировки и фильтрация в SQL: HAVING", author: "Andrey Sozykin", len: "5 мин" }
  ],
  theory: [
    { id: "agg", title: "Агрегатные функции", html: `
<p>Агрегатная функция берёт много значений и возвращает одно.</p>
<div class="tbl-wrap"><table class="t">
<tr><th>Функция</th><th>Что считает</th><th>Пример</th></tr>
<tr><td><code>count(*)</code></td><td>количество строк</td><td>сколько всего заказов</td></tr>
<tr><td><code>count(столбец)</code></td><td>количество непустых значений</td><td><code>count(phone)</code>: у скольких есть телефон</td></tr>
<tr><td><code>count(DISTINCT столбец)</code></td><td>количество разных значений</td><td><code>count(DISTINCT customer_id)</code>: сколько разных покупателей</td></tr>
<tr><td><code>sum(x)</code></td><td>сумма</td><td>выручка</td></tr>
<tr><td><code>avg(x)</code></td><td>среднее арифметическое</td><td>средняя цена</td></tr>
<tr><td><code>min(x)</code> / <code>max(x)</code></td><td>минимум / максимум</td><td>первый и последний заказ</td></tr>
</table></div>
<pre class="sql">SELECT count(*)                    AS orders,
       count(promo_code)           AS with_promo,
       count(DISTINCT customer_id) AS buyers,
       min(created_at)             AS first_order,
       max(created_at)             AS last_order
FROM orders;</pre>
<div class="warn"><b>Агрегаты пропускают NULL</b><code>count(promo_code)</code> считает только заказы, где промокод есть. <code>avg(x)</code> делит на количество непустых значений, а не всех строк. Обычно это то, что нужно, но помни об этом.</div>
<h4>Выручка и средний чек</h4>
<p>Договоримся о терминах на весь курс:</p>
<ul>
<li><b>Выручка</b> это сумма <code>quantity * price</code> из <code>order_items</code>. Обычно считают только доставленные заказы.</li>
<li><b>Средний чек</b> = выручка / количество заказов.</li>
</ul>
<pre class="sql">SELECT sum(quantity * price) AS revenue,
       count(DISTINCT order_id) AS orders,
       round(sum(quantity * price) / count(DISTINCT order_id), 2) AS avg_check
FROM order_items;</pre>
<p>Здесь пока все заказы, включая отменённые. Отфильтровать по статусу получится после модуля 8, когда соединим таблицы.</p>` },
    { id: "groupby", title: "GROUP BY: считаем по группам", html: `
<p><code>GROUP BY</code> разбивает строки на группы с одинаковым значением и считает агрегат для каждой группы отдельно.</p>
<div class="grid2">
<div class="tile sky"><h4>Было: таблица orders</h4>
<table class="t"><tr><th>order_id</th><th>status</th></tr><tr><td>1001</td><td>доставлен</td></tr><tr><td>1002</td><td>отменён</td></tr><tr><td>1003</td><td>доставлен</td></tr><tr><td>1004</td><td>доставлен</td></tr><tr><td>1005</td><td>отменён</td></tr></table></div>
<div class="tile mint"><h4>Стало: GROUP BY status</h4>
<table class="t"><tr><th>status</th><th>count(*)</th></tr><tr><td>доставлен</td><td>3</td></tr><tr><td>отменён</td><td>2</td></tr></table></div>
</div>
<pre class="sql">SELECT status, count(*) AS orders
FROM orders
GROUP BY status;</pre>
<div class="warn"><b>Главное правило GROUP BY</b>В SELECT могут быть только: столбцы из GROUP BY и агрегатные функции. Если написать <code>SELECT status, order_id, count(*) … GROUP BY status</code>, база спросит: «какой из сотни order_id показывать в строке „доставлен“?» и выдаст ошибку <code>must appear in the GROUP BY clause</code>.</div>
<h4>Группировка по нескольким полям</h4>
<pre class="sql">SELECT city, source, count(*) AS customers
FROM customers
GROUP BY city, source
ORDER BY city, customers DESC;</pre>
<h4>Группировка по выражению</h4>
<p>Группировать можно по вычисленному значению, например по месяцу. Это самый частый отчёт в аналитике:</p>
<pre class="sql">SELECT date_trunc('month', created_at)::date AS month,
       count(*) AS orders
FROM orders
GROUP BY date_trunc('month', created_at)
ORDER BY month;</pre>
<p>В PostgreSQL можно сокращать: <code>GROUP BY 1</code> значит «по первому столбцу из SELECT», а ещё можно группировать по псевдониму: <code>GROUP BY month</code>.</p>` },
    { id: "having", title: "HAVING: фильтр для групп", html: `
<p><code>WHERE</code> фильтрует строки <b>до</b> группировки, <code>HAVING</code> фильтрует группы <b>после</b>. Поэтому условие на агрегат (count, sum…) пишется только в HAVING.</p>
<div class="flow"><span>FROM</span><i>→</i><span>WHERE<small>фильтр строк</small></span><i>→</i><span>GROUP BY<small>группы</small></span><i>→</i><span>HAVING<small>фильтр групп</small></span><i>→</i><span>SELECT</span><i>→</i><span>ORDER BY</span><i>→</i><span>LIMIT</span></div>
<pre class="sql">-- Клиенты, у которых больше 10 заказов
SELECT customer_id, count(*) AS orders
FROM orders
GROUP BY customer_id
HAVING count(*) > 10
ORDER BY orders DESC;</pre>
<pre class="sql">-- Города, где больше 3 клиентов из instagram
SELECT city, count(*) AS customers
FROM customers
WHERE source = 'instagram'       -- сначала берём только instagram
GROUP BY city
HAVING count(*) > 3;             -- потом оставляем крупные города</pre>
<div class="tip"><b>Как выбрать: WHERE или HAVING?</b>Спроси себя: «условие про одну строку или про группу целиком?». «Заказ отменён» про строку, это WHERE. «В городе больше 5 заказов» про группу, это HAVING.</div>` },
    { id: "filter", title: "Полезные приёмы", html: `
<h4>Несколько счётчиков в одной строке: FILTER</h4>
<p>В PostgreSQL можно посчитать агрегат только по части строк, прямо внутри SELECT. Получается мини-сводная таблица:</p>
<pre class="sql">SELECT date_trunc('month', created_at)::date AS month,
       count(*) AS all_orders,
       count(*) FILTER (WHERE status = 'отменён') AS cancelled,
       count(*) FILTER (WHERE promo_code IS NOT NULL) AS with_promo
FROM orders
GROUP BY 1
ORDER BY 1;</pre>
<h4>Доля в процентах</h4>
<pre class="sql">SELECT round(100.0 * count(*) FILTER (WHERE status = 'отменён') / count(*), 1) AS cancel_rate_pct
FROM orders;</pre>
<div class="warn"><b>100.0, а не 100</b>Помнишь про целочисленное деление? count возвращает целое. <code>100 * 43 / 514</code> даст 8, а <code>100.0 * 43 / 514</code> даст 8.37.</div>
<h4>Склеить значения группы в строку</h4>
<pre class="sql">SELECT category, string_agg(name, ', ' ORDER BY name) AS products
FROM products
GROUP BY category;</pre>` }
  ],
  practice: {
    tasks: [
      { id: "status", title: "Заказы по статусам", text: `${from(MARINA, "Сколько у нас заказов в каждом статусе?")}`,
        hints: ["Группируем по статусу и считаем строки.", "<code>SELECT status, count(*) FROM orders GROUP BY status</code>"], solution: "SELECT status, count(*) AS orders\nFROM orders\nGROUP BY status;" },
      { id: "cats", title: "Ассортимент по категориям", ordered: true, text: `${from(SERGEY, "По каждой категории: сколько товаров и средняя цена (округли до рубля). Отсортируй по количеству товаров от большего, при равенстве по названию категории.")}`,
        hints: ["Три столбца: категория, count(*), round(avg(price)).", "<code>ORDER BY products DESC, category</code>"], solution: "SELECT category, count(*) AS products, round(avg(price)) AS avg_price\nFROM products\nGROUP BY category\nORDER BY products DESC, category;" },
      { id: "sources", title: "Откуда приходят клиенты", ordered: true, text: `${from(DIMA, "Сколько клиентов пришло из каждого источника? Отсортируй от самого большого. Клиенты без источника тоже нужны, они будут отдельной строкой.")}`,
        hints: ["GROUP BY по <code>source</code>. NULL станет отдельной группой автоматически.", "При одинаковом количестве порядок может прыгать, добавь второе поле сортировки: <code>ORDER BY customers DESC, source</code>."], solution: "SELECT source, count(*) AS customers\nFROM customers\nGROUP BY source\nORDER BY customers DESC, source;" },
      { id: "monthly", title: "Динамика заказов", ordered: true, text: `${from(MARINA, "Покажи, сколько заказов было в каждом месяце, по порядку. Месяц в виде даты первого числа.")}`,
        hints: ["Месяц: <code>date_trunc('month', created_at)::date</code>.", "Сгруппируй по нему (можно <code>GROUP BY 1</code>) и отсортируй."], solution: "SELECT date_trunc('month', created_at)::date AS month, count(*) AS orders\nFROM orders\nGROUP BY 1\nORDER BY 1;" },
      { id: "checks", title: "Сумма каждого заказа", text: `${from(OLYA, "Посчитай по таблице состава заказов сумму каждого заказа и количество товаров (штук) в нём. Номер заказа, сумма, штук.")}`,
        hints: ["Группируем <code>order_items</code> по <code>order_id</code>.", "<code>sum(quantity * price)</code> и <code>sum(quantity)</code>."], solution: "SELECT order_id, sum(quantity * price) AS total, sum(quantity) AS items\nFROM order_items\nGROUP BY order_id;" },
      { id: "loyal", title: "Постоянные клиенты", ordered: true, text: `${from(MARINA, "Кто у нас заказывал больше 10 раз (не считая отменённых)? id клиента и число заказов, по убыванию.")}`,
        hints: ["Отменённые убираем ещё до группировки, это WHERE. Условие на количество это HAVING.", "<code>WHERE status &lt;&gt; 'отменён' GROUP BY customer_id HAVING count(*) > 10</code>. Для стабильного порядка добавь customer_id вторым полем сортировки."], solution: "SELECT customer_id, count(*) AS orders\nFROM orders\nWHERE status <> 'отменён'\nGROUP BY customer_id\nHAVING count(*) > 10\nORDER BY orders DESC, customer_id;" },
      { id: "cancelrate", title: "Доля отмен по месяцам", ordered: true, text: `${from(OLYA, "Хочу понять, не растут ли отмены. По каждому месяцу 2026 года: всего заказов, отменённых и процент отмен с одним знаком после запятой.")}`,
        hints: ["Фильтр по 2026 году в WHERE, группировка по месяцу.", "Отменённые: <code>count(*) FILTER (WHERE status = 'отменён')</code>. Процент: <code>round(100.0 * … / count(*), 1)</code>."], solution: "SELECT date_trunc('month', created_at)::date AS month,\n       count(*) AS orders,\n       count(*) FILTER (WHERE status = 'отменён') AS cancelled,\n       round(100.0 * count(*) FILTER (WHERE status = 'отменён') / count(*), 1) AS cancel_pct\nFROM orders\nWHERE created_at >= '2026-01-01'\nGROUP BY 1\nORDER BY 1;" }
    ]
  },
  homework: {
    tasks: [
      { id: "promo", title: "Популярность промокодов", ordered: true, text: `<p>Сколько раз использовали каждый промокод? Заказы без промокода не учитывай. Отсортируй по популярности, при равенстве по названию промокода.</p>`,
        hints: ["Пустые промокоды убираются в WHERE.", "При равенстве добавь сортировку по названию промокода."], solution: "SELECT promo_code, count(*) AS uses\nFROM orders\nWHERE promo_code IS NOT NULL\nGROUP BY promo_code\nORDER BY uses DESC, promo_code;" },
      { id: "hours", title: "Самые горячие часы", ordered: true, text: `<p>Посчитай количество заказов по часам оформления и выведи топ-3 часа. При равном количестве выше тот час, что раньше.</p>`,
        hints: ["Группировка по <code>extract(hour from created_at)</code>.", "При равенстве количества сортируй по часу."], solution: "SELECT extract(hour from created_at) AS hour, count(*) AS orders\nFROM orders\nGROUP BY 1\nORDER BY orders DESC, hour\nLIMIT 3;" },
      { id: "bigorders", title: "Крупные заказы", level: "средне", text: `<p>Найди заказы на сумму больше 7000 ₽. Выведи номер заказа и сумму.</p>`,
        hints: ["Сумма заказа считается группировкой <code>order_items</code> по <code>order_id</code>.", "Условие на сумму это HAVING."], solution: "SELECT order_id, sum(quantity * price) AS total\nFROM order_items\nGROUP BY order_id\nHAVING sum(quantity * price) > 7000;" },
      { id: "cityweek", title: "Города и выходные", level: "посложнее", text: `<p>По каждому городу доставки посчитай: всего заказов, заказов в выходные и долю выходных в процентах (1 знак). Оставь только города, где больше 20 заказов. Порядок не важен.</p>`,
        hints: ["Выходные: <code>count(*) FILTER (WHERE extract(isodow from created_at) IN (6, 7))</code>.", "Крупные города: <code>HAVING count(*) > 20</code>."], solution: "SELECT delivery_city,\n       count(*) AS orders,\n       count(*) FILTER (WHERE extract(isodow from created_at) IN (6, 7)) AS weekend,\n       round(100.0 * count(*) FILTER (WHERE extract(isodow from created_at) IN (6, 7)) / count(*), 1) AS weekend_pct\nFROM orders\nGROUP BY delivery_city\nHAVING count(*) > 20;" }
    ]
  }
});

/* ===================== 8. ОБЪЕДИНЕНИЕ ТАБЛИЦ ===================== */
M.push({
  id: "m8", num: 8, week: 5, color: "sky", icon: "link", time: "≈ 7 часов",
  short: "Объединение таблиц", tag: "JOIN, подзапросы, UNION", title: "Объединение данных из разных таблиц",
  desc: "JOIN всех видов, подзапросы и CTE, ловушки NULL, UNION. Самый важный модуль курса.",
  lead: "Данные о заказе разложены по четырём таблицам: кто купил, когда, что именно, по какой цене. Чтобы ответить на вопрос «какая выручка по категориям в Москве», их нужно соединить. После этого модуля ты сможешь ответить почти на любой вопрос бизнеса.",
  goals: ["Соединять таблицы через INNER и LEFT JOIN", "Находить «пропавшие» данные: клиентов без заказов", "Писать подзапросы и CTE (WITH)", "Работать с NULL: coalesce, nullif", "Склеивать результаты через UNION"],
  video: [
    { id: "SYJ1B2KrDCQ", title: "Запрос данных из нескольких таблиц: JOIN", author: "Andrey Sozykin", len: "10 мин" },
    { id: "n-5RLxezWh8", title: "Типы соединений в SQL", author: "Andrey Sozykin", len: "7 мин" },
    { id: "Df6tQlWhn3Q", title: "Подзапросы", author: "Andrey Sozykin", len: "7 мин" }
  ],
  theory: [
    { id: "join", title: "INNER JOIN: соединяем таблицы", html: `
<p>В заказе записан только <code>customer_id</code>. Чтобы увидеть имя покупателя, нужно «подтянуть» строку из <code>customers</code> с тем же id.</p>
<pre class="sql">SELECT o.order_id,
       o.created_at,
       c.first_name,
       c.city
FROM orders AS o
JOIN customers AS c ON c.customer_id = o.customer_id
LIMIT 10;</pre>
<div class="tbl-wrap"><table class="t">
<tr><th>Часть</th><th>Что значит</th></tr>
<tr><td><code>FROM orders AS o</code></td><td>основная таблица и её короткое имя (псевдоним) <code>o</code></td></tr>
<tr><td><code>JOIN customers AS c</code></td><td>присоединяем клиентов с псевдонимом <code>c</code></td></tr>
<tr><td><code>ON c.customer_id = o.customer_id</code></td><td>условие: какие строки друг другу соответствуют</td></tr>
<tr><td><code>o.order_id</code></td><td>столбец order_id из таблицы o. Указывать таблицу обязательно, если столбец с таким именем есть в обеих</td></tr>
</table></div>
<p><code>JOIN</code> и <code>INNER JOIN</code> это одно и то же. Такое соединение оставляет только строки, у которых нашлась пара в обеих таблицах.</p>
<h4>Цепочка соединений</h4>
<p>Выручка по категориям: заказ → состав → товар.</p>
<pre class="sql">SELECT p.category,
       sum(oi.quantity * oi.price) AS revenue
FROM orders AS o
JOIN order_items AS oi ON oi.order_id = o.order_id
JOIN products AS p ON p.product_id = oi.product_id
WHERE o.status = 'доставлен'
GROUP BY p.category
ORDER BY revenue DESC;</pre>
<div class="tip"><b>Как писать JOIN без ошибок</b>Нарисуй (хотя бы в голове) цепочку таблиц и по какому столбцу каждая связана со следующей. Схема есть в модуле 0 и в песочнице.</div>` },
    { id: "types", title: "LEFT, RIGHT, FULL и CROSS JOIN", html: `
<svg class="diag" viewBox="0 0 860 190" font-family="Manrope, sans-serif" font-size="14" font-weight="700">
  <g transform="translate(20 10)"><circle cx="60" cy="70" r="55" fill="#ddd5f6"/><circle cx="120" cy="70" r="55" fill="#ddd5f6"/><path d="M90 24a55 55 0 0 1 0 92a55 55 0 0 1 0-92z" fill="#9d86e6"/><circle cx="60" cy="70" r="55" fill="none" stroke="#1d1e23" stroke-width="1.5"/><circle cx="120" cy="70" r="55" fill="none" stroke="#1d1e23" stroke-width="1.5"/><text x="90" y="160" text-anchor="middle">INNER JOIN</text><text x="90" y="178" text-anchor="middle" font-weight="500" font-size="12">только пары</text></g>
  <g transform="translate(230 10)"><circle cx="60" cy="70" r="55" fill="#9d86e6"/><circle cx="120" cy="70" r="55" fill="#ddd5f6"/><path d="M90 24a55 55 0 0 1 0 92a55 55 0 0 1 0-92z" fill="#9d86e6"/><circle cx="60" cy="70" r="55" fill="none" stroke="#1d1e23" stroke-width="1.5"/><circle cx="120" cy="70" r="55" fill="none" stroke="#1d1e23" stroke-width="1.5"/><text x="90" y="160" text-anchor="middle">LEFT JOIN</text><text x="90" y="178" text-anchor="middle" font-weight="500" font-size="12">все из левой</text></g>
  <g transform="translate(440 10)"><circle cx="60" cy="70" r="55" fill="#9d86e6"/><circle cx="120" cy="70" r="55" fill="#ddd5f6"/><path d="M90 24a55 55 0 0 1 0 92a55 55 0 0 1 0-92z" fill="#ddd5f6"/><circle cx="60" cy="70" r="55" fill="none" stroke="#1d1e23" stroke-width="1.5"/><circle cx="120" cy="70" r="55" fill="none" stroke="#1d1e23" stroke-width="1.5"/><text x="90" y="160" text-anchor="middle">LEFT + IS NULL</text><text x="90" y="178" text-anchor="middle" font-weight="500" font-size="12">у кого нет пары</text></g>
  <g transform="translate(650 10)"><circle cx="60" cy="70" r="55" fill="#9d86e6"/><circle cx="120" cy="70" r="55" fill="#9d86e6"/><circle cx="60" cy="70" r="55" fill="none" stroke="#1d1e23" stroke-width="1.5"/><circle cx="120" cy="70" r="55" fill="none" stroke="#1d1e23" stroke-width="1.5"/><text x="90" y="160" text-anchor="middle">FULL JOIN</text><text x="90" y="178" text-anchor="middle" font-weight="500" font-size="12">все из обеих</text></g>
</svg>
<div class="tbl-wrap"><table class="t">
<tr><th>Тип</th><th>Что вернёт</th><th>Когда нужен</th></tr>
<tr><td><code>INNER JOIN</code></td><td>только строки, у которых есть пара</td><td>заказы с данными клиента</td></tr>
<tr><td><code>LEFT JOIN</code></td><td>все строки левой таблицы, а где пары нет, справа будет NULL</td><td>все клиенты, даже без заказов</td></tr>
<tr><td><code>RIGHT JOIN</code></td><td>то же, но для правой таблицы</td><td>почти не используют, проще поменять таблицы местами</td></tr>
<tr><td><code>FULL JOIN</code></td><td>все строки обеих таблиц</td><td>сверка двух списков</td></tr>
<tr><td><code>CROSS JOIN</code></td><td>каждая строка с каждой</td><td>сетка «все месяцы × все категории»</td></tr>
</table></div>
<pre class="sql">-- Клиенты, которые ни разу ничего не заказали
SELECT c.customer_id, c.first_name, c.registered_at
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;</pre>
<div class="warn"><b>Ловушка: фильтр по правой таблице в WHERE</b>Хотим всех клиентов и число их доставленных заказов. Если написать <code>LEFT JOIN orders … WHERE o.status = 'доставлен'</code>, клиенты без заказов пропадут: у них status = NULL, и WHERE их выкинет. LEFT JOIN тихо превратится в INNER. Условие на правую таблицу пиши в ON: <code>LEFT JOIN orders o ON o.customer_id = c.customer_id AND o.status = 'доставлен'</code>.</div>
<pre class="sql">SELECT c.customer_id, c.first_name, count(o.order_id) AS delivered_orders
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.customer_id AND o.status = 'доставлен'
GROUP BY c.customer_id, c.first_name
ORDER BY delivered_orders
LIMIT 12;</pre>` },
    { id: "dupes", title: "Размножение строк и как его заметить", html: `
<p>Если у одной строки слева несколько пар справа, она повторится столько раз, сколько пар. Это не ошибка, так работает JOIN. Но из-за этого легко посчитать неправильно.</p>
<div class="life"><b>Типичная ошибка в отчёте</b>Считаем количество заказов по городам, присоединив состав заказа. Заказ из 3 товаров превратился в 3 строки, и <code>count(*)</code> посчитал его трижды. Выход: <code>count(DISTINCT o.order_id)</code> или не присоединять лишние таблицы.</div>
<pre class="sql">SELECT count(*) AS rows_after_join,
       count(DISTINCT o.order_id) AS real_orders
FROM orders AS o
JOIN order_items AS oi ON oi.order_id = o.order_id;</pre>
<div class="tip"><b>Проверка после JOIN</b>Посчитай строки до соединения и после. Если число неожиданно выросло, где-то связь «один ко многим», и агрегаты нужно проверить.</div>` },
    { id: "null", title: "NULL подробно: coalesce и nullif", html: `
<div class="tbl-wrap"><table class="t">
<tr><th>Выражение</th><th>Результат</th><th>Почему</th></tr>
<tr><td><code>NULL + 100</code></td><td>NULL</td><td>неизвестное плюс 100 всё ещё неизвестно</td></tr>
<tr><td><code>NULL = NULL</code></td><td>NULL (не true!)</td><td>два неизвестных нельзя считать равными</td></tr>
<tr><td><code>'a' || NULL</code></td><td>NULL</td><td>то же правило для текста</td></tr>
<tr><td><code>count(x)</code>, <code>sum(x)</code></td><td>пропускают NULL</td><td>агрегаты игнорируют пустые значения</td></tr>
<tr><td><code>sum(x)</code> по пустому набору</td><td>NULL, а не 0</td><td>нечего складывать</td></tr>
</table></div>
<p><code>coalesce(a, b, c…)</code> возвращает первое непустое значение. Главный инструмент, чтобы подставить значение по умолчанию.</p>
<pre class="sql">SELECT order_id,
       coalesce(promo_code, 'без промокода') AS promo,
       coalesce(delivered_at::text, 'ещё в пути') AS delivered
FROM orders
ORDER BY order_id DESC
LIMIT 10;</pre>
<p><code>nullif(a, b)</code> возвращает NULL, если a = b. Классика: защита от деления на ноль, <code>x / nullif(y, 0)</code>.</p>
<pre class="sql">SELECT c.customer_id,
       coalesce(sum(oi.quantity * oi.price), 0) AS revenue
FROM customers AS c
LEFT JOIN orders AS o ON o.customer_id = c.customer_id
LEFT JOIN order_items AS oi ON oi.order_id = o.order_id
GROUP BY c.customer_id
ORDER BY revenue
LIMIT 10;</pre>` },
    { id: "sub", title: "Подзапросы и WITH", html: `
<p>Подзапрос это запрос внутри запроса, в скобках. Бывают трёх видов:</p>
<div class="grid3">
<div class="tile lav"><h4>Одно значение</h4><p>Возвращает одну цифру. Можно сравнивать: <code>price &gt; (SELECT avg(price) FROM products)</code></p></div>
<div class="tile mint"><h4>Список</h4><p>Возвращает столбец. Используют с IN: <code>customer_id IN (SELECT …)</code></p></div>
<div class="tile sky"><h4>Таблица</h4><p>Стоит во FROM, у неё обязательно есть имя: <code>FROM (SELECT …) AS t</code></p></div>
</div>
<pre class="sql">-- Товары дороже средней цены
SELECT name, price
FROM products
WHERE price > (SELECT avg(price) FROM products)
ORDER BY price;</pre>
<pre class="sql">-- Средний чек: сначала суммы заказов, потом среднее по ним
SELECT round(avg(total), 2) AS avg_check
FROM (
  SELECT order_id, sum(quantity * price) AS total
  FROM order_items
  GROUP BY order_id
) AS t;</pre>
<h4>EXISTS</h4>
<p><code>EXISTS (подзапрос)</code> истинно, если подзапрос вернул хоть одну строку. Удобно для «есть ли у клиента хотя бы один заказ с промокодом».</p>
<pre class="sql">SELECT c.first_name, c.email
FROM customers AS c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id AND o.promo_code = 'NEWYEAR');</pre>
<h4>WITH (CTE): подзапросы с именами</h4>
<p>Когда подзапросов много, читать их тяжело. <code>WITH</code> позволяет дать каждому шагу имя и написать запрос сверху вниз, как рецепт.</p>
<pre class="sql">WITH order_totals AS (
  SELECT order_id, sum(quantity * price) AS total
  FROM order_items
  GROUP BY order_id
),
delivered AS (
  SELECT o.order_id, o.delivery_city, t.total
  FROM orders AS o
  JOIN order_totals AS t ON t.order_id = o.order_id
  WHERE o.status = 'доставлен'
)
SELECT delivery_city, count(*) AS orders, round(avg(total)) AS avg_check
FROM delivered
GROUP BY delivery_city
ORDER BY orders DESC;</pre>
<div class="tip">В работе аналитика WITH используют постоянно. Привыкай разбивать сложную задачу на шаги.</div>` },
    { id: "union", title: "UNION: складываем результаты в столбик", html: `
<p>JOIN приклеивает столбцы сбоку. <code>UNION</code> ставит результаты двух запросов друг под другом.</p>
<div class="tbl-wrap"><table class="t">
<tr><th>Оператор</th><th>Что делает</th></tr>
<tr><td><code>UNION</code></td><td>объединяет и убирает дубли</td></tr>
<tr><td><code>UNION ALL</code></td><td>объединяет и оставляет всё (быстрее)</td></tr>
<tr><td><code>INTERSECT</code></td><td>только строки, которые есть в обоих</td></tr>
<tr><td><code>EXCEPT</code></td><td>строки первого запроса, которых нет во втором</td></tr>
</table></div>
<p>Правила: одинаковое число столбцов, совместимые типы, названия берутся из первого запроса.</p>
<pre class="sql">-- Единый список всех почт: покупатели + подписчики
SELECT lower(trim(email)) AS email, 'клиент' AS who FROM customers
UNION
SELECT email, 'подписчик' FROM subscribers
ORDER BY email
LIMIT 20;</pre>
<pre class="sql">-- Подписчики, которые ещё не стали клиентами
SELECT email FROM subscribers
EXCEPT
SELECT lower(trim(email)) FROM customers;</pre>` }
  ],
  practice: {
    intro: `<p>Если запрос не сходится с ответом, проверь три вещи: правильные ли условия в ON, не размножились ли строки, не потерялись ли строки с NULL.</p>`,
    tasks: [
      { id: "names", title: "Заказы с именами", text: `${from(SERGEY, "Курьерам нужен список заказов в пути: номер заказа, имя и фамилия клиента, телефон.")}`,
        hints: ["Соедини <code>orders</code> и <code>customers</code> по <code>customer_id</code>.", "Фильтр <code>o.status = 'в пути'</code>. Столбцы: o.order_id, c.first_name, c.last_name, c.phone."], solution: "SELECT o.order_id, c.first_name, c.last_name, c.phone\nFROM orders AS o\nJOIN customers AS c ON c.customer_id = o.customer_id\nWHERE o.status = 'в пути';" },
      { id: "catrev", title: "Выручка по категориям", ordered: true, text: `${from(MARINA, "Какая категория приносит больше всего денег? Выручка по доставленным заказам, от большей к меньшей.")}`,
        hints: ["Цепочка: <code>orders</code> → <code>order_items</code> → <code>products</code>.", "<code>sum(oi.quantity * oi.price)</code>, WHERE по статусу 'доставлен', GROUP BY p.category."], solution: "SELECT p.category, sum(oi.quantity * oi.price) AS revenue\nFROM orders AS o\nJOIN order_items AS oi ON oi.order_id = o.order_id\nJOIN products AS p ON p.product_id = oi.product_id\nWHERE o.status = 'доставлен'\nGROUP BY p.category\nORDER BY revenue DESC;" },
      { id: "noorders", title: "Зарегистрировались, но не купили", text: `${from(DIMA, "Найди клиентов, которые зарегистрировались, но не сделали ни одного заказа. Им отправим письмо с промокодом. id, имя, почта.")}`,
        hints: ["Нужны все клиенты, даже без пары в orders. Значит, LEFT JOIN.", "У клиентов без заказов поля из orders будут NULL: <code>WHERE o.order_id IS NULL</code>."], solution: "SELECT c.customer_id, c.first_name, c.email\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.customer_id\nWHERE o.order_id IS NULL;" },
      { id: "topclients", title: "Топ-5 клиентов по деньгам", ordered: true, text: `${from(MARINA, "Кто наши лучшие клиенты? Топ-5 по сумме доставленных заказов: имя, фамилия и сумма.")}`,
        hints: ["Нужны три таблицы: customers, orders, order_items.", "Группируй по c.customer_id, c.first_name, c.last_name. Сортировка по сумме по убыванию, LIMIT 5."], solution: "SELECT c.first_name, c.last_name, sum(oi.quantity * oi.price) AS revenue\nFROM customers AS c\nJOIN orders AS o ON o.customer_id = c.customer_id\nJOIN order_items AS oi ON oi.order_id = o.order_id\nWHERE o.status = 'доставлен'\nGROUP BY c.customer_id, c.first_name, c.last_name\nORDER BY revenue DESC\nLIMIT 5;" },
      { id: "unsold", title: "Товары, которые не покупают", text: `${from(SERGEY, "Есть ли товары, которые ни разу не заказывали? Хочу понять, что лежит на складе мёртвым грузом. Название и категория.")}`,
        hints: ["Похоже на задачу про клиентов без заказов: LEFT JOIN от products к order_items.", "<code>WHERE oi.product_id IS NULL</code>. Если ничего не нашлось, это тоже ответ, но здесь кое-что найдётся."], solution: "SELECT p.name, p.category\nFROM products AS p\nLEFT JOIN order_items AS oi ON oi.product_id = p.product_id\nWHERE oi.product_id IS NULL;" },
      { id: "abovecheck", title: "Заказы выше среднего чека", text: `${from(OLYA, "Покажи заказы, сумма которых больше среднего чека по всем заказам. Номер заказа и сумма.")}`,
        hints: ["Сначала посчитай сумму каждого заказа (WITH или подзапрос), потом среднее по этим суммам.", "<code>WITH t AS (SELECT order_id, sum(quantity*price) AS total FROM order_items GROUP BY order_id) SELECT … FROM t WHERE total > (SELECT avg(total) FROM t)</code>"], solution: "WITH t AS (\n  SELECT order_id, sum(quantity * price) AS total\n  FROM order_items\n  GROUP BY order_id\n)\nSELECT order_id, total\nFROM t\nWHERE total > (SELECT avg(total) FROM t);" },
      { id: "subsnot", title: "Подписчики без покупок", text: `${from(DIMA, "Кто из подписчиков рассылки не является нашим клиентом? Нужен список почт.")}`,
        hints: ["Подойдёт EXCEPT или LEFT JOIN. Помни, что почты клиентов «грязные».", "<code>SELECT email FROM subscribers EXCEPT SELECT lower(trim(email)) FROM customers</code>"], solution: "SELECT email FROM subscribers\nEXCEPT\nSELECT lower(trim(email)) FROM customers;" }
    ]
  },
  homework: {
    tasks: [
      { id: "cityrev", title: "Средний чек по городам", ordered: true, text: `<p>Посчитай по доставленным заказам для каждого города доставки: число заказов и средний чек (округли до рубля). Отсортируй по среднему чеку по убыванию.</p>`,
        hints: ["Сначала суммы заказов (WITH), потом JOIN с orders и группировка по городу.", "Средний чек = avg(сумма заказа). При равенстве добавь сортировку по городу."], solution: "WITH t AS (\n  SELECT order_id, sum(quantity * price) AS total\n  FROM order_items\n  GROUP BY order_id\n)\nSELECT o.delivery_city, count(*) AS orders, round(avg(t.total)) AS avg_check\nFROM orders AS o\nJOIN t ON t.order_id = o.order_id\nWHERE o.status = 'доставлен'\nGROUP BY o.delivery_city\nORDER BY avg_check DESC, o.delivery_city;" },
      { id: "allclients", title: "Все клиенты и их заказы", level: "средне", text: `<p>Выведи всех клиентов (id и имя) и количество их доставленных заказов. Клиенты без доставленных заказов тоже должны быть, с нулём.</p>`,
        hints: ["LEFT JOIN и условие на статус в ON, а не в WHERE.", "Считай <code>count(o.order_id)</code>, а не count(*): для клиента без заказов count(*) даст 1."], solution: "SELECT c.customer_id, c.first_name, count(o.order_id) AS delivered\nFROM customers AS c\nLEFT JOIN orders AS o ON o.customer_id = c.customer_id AND o.status = 'доставлен'\nGROUP BY c.customer_id, c.first_name;" },
      { id: "source_rev", title: "Выручка по источникам", level: "средне", ordered: true, text: `<p>Какой источник привлечения приносит больше выручки? По доставленным заказам посчитай выручку по <code>source</code> клиента. Клиентов без источника подпиши «неизвестно». Сортировка по выручке по убыванию.</p>`,
        hints: ["Цепочка customers → orders → order_items.", "<code>coalesce(c.source, 'неизвестно')</code>, группировка по этому выражению (можно GROUP BY 1)."], solution: "SELECT coalesce(c.source, 'неизвестно') AS source, sum(oi.quantity * oi.price) AS revenue\nFROM customers AS c\nJOIN orders AS o ON o.customer_id = c.customer_id\nJOIN order_items AS oi ON oi.order_id = o.order_id\nWHERE o.status = 'доставлен'\nGROUP BY 1\nORDER BY revenue DESC;" },
      { id: "bothsubs", title: "Подписчики, которые покупают", text: `<p>Найди клиентов, которые одновременно подписаны на рассылку. Выведи id клиента, имя и дату подписки.</p>`,
        hints: ["JOIN customers и subscribers по почте. Почту клиента нужно почистить: <code>lower(trim(c.email)) = s.email</code>."], solution: "SELECT c.customer_id, c.first_name, s.subscribed_at\nFROM customers AS c\nJOIN subscribers AS s ON s.email = lower(trim(c.email));" },
      { id: "promoloss", title: "Сколько стоят промокоды", level: "посложнее", text: `<p>Промокоды дают скидку: WELCOME10 10%, AUTUMN15 15%, NEWYEAR 20%. Скидка в базе не записана, цены в <code>order_items</code> указаны без неё. Посчитай по доставленным заказам для каждого промокода: количество заказов, сумму заказов до скидки и сумму скидки в рублях. Подсказка: таблицу скидок можно сделать через VALUES.</p>`,
        hints: ["Таблица на лету: <code>(VALUES ('WELCOME10', 0.10), ('AUTUMN15', 0.15), ('NEWYEAR', 0.20)) AS d(code, pct)</code>, присоедини её через JOIN по промокоду.", "Сумма до скидки: sum(oi.quantity * oi.price). Скидка: та же сумма × d.pct. Заказов: count(DISTINCT o.order_id). Группировка по промокоду и pct."], solution: "SELECT o.promo_code,\n       count(DISTINCT o.order_id) AS orders,\n       sum(oi.quantity * oi.price) AS gross,\n       round(sum(oi.quantity * oi.price) * d.pct, 2) AS discount\nFROM orders AS o\nJOIN order_items AS oi ON oi.order_id = o.order_id\nJOIN (VALUES ('WELCOME10', 0.10), ('AUTUMN15', 0.15), ('NEWYEAR', 0.20)) AS d(code, pct) ON d.code = o.promo_code\nWHERE o.status = 'доставлен'\nGROUP BY o.promo_code, d.pct;" }
    ]
  }
});
})();
