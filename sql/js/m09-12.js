(function () {
const M = window.COURSE.modules;
const from = (who, text) => `<span class="from"><b>${who}</b>${text}</span>`;
const MARINA = "Марина, владелица «Уютной лавки»";
const DIMA = "Дима, маркетолог";
const OLYA = "Оля, финансы";
const SERGEY = "Сергей, склад";

/* ===================== 9. МОДИФИКАЦИЯ ТАБЛИЦ ===================== */
M.push({
  id: "m9", num: 9, week: 6, color: "lime", icon: "edit", time: "≈ 5 часов",
  short: "Модификация таблиц", tag: "CREATE, INSERT, UPDATE, DELETE", title: "Создание и изменение таблиц",
  desc: "Создаём таблицы, загружаем в них данные, обновляем и удаляем строки, загружаем CSV.",
  lead: "Аналитик в основном читает данные, но свои таблицы создавать тоже приходится: сохранить промежуточный результат, загрузить файл от партнёра, собрать витрину для отчёта. Здесь учимся это делать аккуратно, ничего не сломав.",
  goals: ["Создавать таблицы с правильными типами и ограничениями", "Добавлять строки: INSERT … VALUES и INSERT … SELECT", "Обновлять и удалять данные без катастроф", "Загружать CSV через DBeaver"],
  video: [
    { id: "7nD1e4m9Wgg", title: "Создание таблиц в SQL", author: "Andrey Sozykin", len: "15 мин" },
    { id: "eyWGkfBYmIY", title: "Вставка и изменение данных в SQL", author: "Andrey Sozykin", len: "10 мин" }
  ],
  theory: [
    { id: "safe", title: "Сначала о безопасности", html: `
<div class="warn"><b>Изменения в базе необратимы</b>SELECT ничего не ломает. А вот UPDATE, DELETE и DROP меняют данные навсегда. В компании аналитику часто дают доступ «только на чтение», и это правильно. Если доступ на запись есть, соблюдай три правила.</div>
<ol class="steps">
<li><b>Сначала SELECT.</b> Перед <code>UPDATE … WHERE условие</code> выполни <code>SELECT * … WHERE условие</code> и посмотри, те ли строки попадут под изменение.</li>
<li><b>Всегда WHERE.</b> <code>UPDATE products SET price = 0</code> без WHERE обнулит цены у всего каталога.</li>
<li><b>Транзакция.</b> Оберни изменения в <code>BEGIN; … ;</code>, проверь результат и только потом <code>COMMIT;</code>. Если что-то не так, <code>ROLLBACK;</code> отменит всё.</li>
</ol>
<pre class="sql norun">BEGIN;
UPDATE products SET price = price * 1.1 WHERE category = 'Чай';
SELECT name, price FROM products WHERE category = 'Чай';  -- проверяем
-- всё хорошо? COMMIT;   передумал(а)? ROLLBACK;</pre>
<div class="note"><b>Как работают примеры на этой странице</b>Кнопка «Запустить» выполняет пример и сразу откатывает изменения. Поэтому каждый пример самодостаточный: создаёт таблицу, наполняет и показывает результат. Чтобы таблицы сохранялись, работай в <a href="#/sandbox">песочнице</a> или в DBeaver.</div>` },
    { id: "create", title: "CREATE TABLE", html: `
<pre class="sql">CREATE TABLE suppliers (
  supplier_id integer PRIMARY KEY,
  name        text NOT NULL,
  city        text,
  rating      numeric(3,1) CHECK (rating BETWEEN 0 AND 5),
  created_at  timestamp DEFAULT now()
);
SELECT * FROM suppliers;</pre>
<div class="tbl-wrap"><table class="t">
<tr><th>Ограничение</th><th>Что делает</th></tr>
<tr><td><code>PRIMARY KEY</code></td><td>уникальный и непустой идентификатор строки</td></tr>
<tr><td><code>NOT NULL</code></td><td>значение обязательно</td></tr>
<tr><td><code>DEFAULT значение</code></td><td>что подставить, если при вставке не указали</td></tr>
<tr><td><code>CHECK (условие)</code></td><td>база не даст записать значение, не подходящее под условие</td></tr>
<tr><td><code>UNIQUE</code></td><td>значения в столбце не повторяются</td></tr>
<tr><td><code>REFERENCES таблица(столбец)</code></td><td>внешний ключ: значение должно существовать в другой таблице</td></tr>
</table></div>
<h4>Как выбрать тип</h4>
<div class="tbl-wrap"><table class="t">
<tr><th>Данные</th><th>Тип</th></tr>
<tr><td>id, количество</td><td><code>integer</code> (или <code>bigint</code> для очень больших таблиц)</td></tr>
<tr><td>автоматический номер</td><td><code>integer GENERATED ALWAYS AS IDENTITY</code> (или старый вариант <code>serial</code>)</td></tr>
<tr><td>деньги</td><td><code>numeric(12,2)</code>. Никогда не <code>real</code> / <code>float</code>: они округляют копейки</td></tr>
<tr><td>текст</td><td><code>text</code> (или <code>varchar(n)</code>, если нужна предельная длина)</td></tr>
<tr><td>да / нет</td><td><code>boolean</code></td></tr>
<tr><td>дата, дата и время</td><td><code>date</code>, <code>timestamp</code></td></tr>
</table></div>
<h4>Таблица из результата запроса</h4>
<p>Очень полезно для аналитика: сохранить результат сложного запроса как отдельную таблицу.</p>
<pre class="sql">CREATE TABLE category_revenue AS
SELECT p.category, sum(oi.quantity * oi.price) AS revenue
FROM order_items oi
JOIN products p ON p.product_id = oi.product_id
GROUP BY p.category;

SELECT * FROM category_revenue ORDER BY revenue DESC;</pre>` },
    { id: "insert", title: "INSERT: добавляем строки", html: `
<pre class="sql">CREATE TABLE suppliers (supplier_id integer PRIMARY KEY, name text NOT NULL, city text);

INSERT INTO suppliers (supplier_id, name, city)
VALUES (1, 'Обжарочная «Зерно»', 'Москва'),
       (2, 'Чайный дом', 'Санкт-Петербург'),
       (3, 'Свечная мастерская', NULL);

SELECT * FROM suppliers;</pre>
<ul>
<li>Список столбцов в скобках после имени таблицы лучше писать всегда. Тогда не важно, в каком порядке столбцы в таблице, и пропущенные получат DEFAULT.</li>
<li>Несколько строк вставляются одной командой через запятую.</li>
<li>Текст и даты в одинарных кавычках, NULL без кавычек.</li>
</ul>
<h4>INSERT … SELECT</h4>
<p>Вставить в таблицу результат запроса:</p>
<pre class="sql">CREATE TABLE vip_clients (customer_id integer PRIMARY KEY, orders integer);

INSERT INTO vip_clients (customer_id, orders)
SELECT customer_id, count(*)
FROM orders
WHERE status = 'доставлен'
GROUP BY customer_id
HAVING count(*) >= 10;

SELECT * FROM vip_clients ORDER BY orders DESC;</pre>` },
    { id: "update", title: "UPDATE и DELETE", html: `
<pre class="sql">-- Чай дорожает на 5%, округляем до рубля
UPDATE products
SET price = round(price * 1.05)
WHERE category = 'Чай';

SELECT name, price FROM products WHERE category = 'Чай';</pre>
<p>Можно менять несколько столбцов сразу: <code>SET price = 500, cost = 250</code>. В SET можно использовать значения из других столбцов той же строки.</p>
<pre class="sql">-- Удаляем подписчиков, подписавшихся до марта 2025
DELETE FROM subscribers
WHERE subscribed_at < '2025-03-01';

SELECT count(*) AS left_subscribers FROM subscribers;</pre>
<div class="tbl-wrap"><table class="t">
<tr><th>Команда</th><th>Что удаляет</th><th>Можно ли вернуть</th></tr>
<tr><td><code>DELETE FROM t WHERE …</code></td><td>подходящие строки</td><td>только в незакрытой транзакции</td></tr>
<tr><td><code>DELETE FROM t</code></td><td>все строки, таблица остаётся</td><td>аналогично</td></tr>
<tr><td><code>TRUNCATE t</code></td><td>все строки, очень быстро</td><td>аналогично</td></tr>
<tr><td><code>DROP TABLE t</code></td><td>таблицу целиком вместе со структурой</td><td>аналогично</td></tr>
</table></div>` },
    { id: "alter", title: "ALTER TABLE: меняем структуру", html: `
<div class="tbl-wrap"><table class="t">
<tr><th>Задача</th><th>Команда</th></tr>
<tr><td>добавить столбец</td><td><code>ALTER TABLE customers ADD COLUMN is_vip boolean DEFAULT false;</code></td></tr>
<tr><td>удалить столбец</td><td><code>ALTER TABLE customers DROP COLUMN is_vip;</code></td></tr>
<tr><td>переименовать столбец</td><td><code>ALTER TABLE customers RENAME COLUMN source TO channel;</code></td></tr>
<tr><td>сменить тип</td><td><code>ALTER TABLE t ALTER COLUMN x TYPE numeric(12,2);</code></td></tr>
<tr><td>переименовать таблицу</td><td><code>ALTER TABLE t RENAME TO t_old;</code></td></tr>
</table></div>
<pre class="sql">ALTER TABLE customers ADD COLUMN is_vip boolean DEFAULT false;

UPDATE customers
SET is_vip = true
WHERE customer_id IN (
  SELECT customer_id FROM orders
  WHERE status = 'доставлен'
  GROUP BY customer_id
  HAVING count(*) >= 10
);

SELECT customer_id, first_name, is_vip FROM customers WHERE is_vip;</pre>
<h4>Представления (VIEW)</h4>
<p>Представление это сохранённый запрос, который выглядит как таблица. Данные не копируются: при каждом обращении запрос выполняется заново, поэтому цифры всегда свежие. Удобно для отчётов, которые нужно часто обновлять.</p>
<pre class="sql">CREATE VIEW order_totals AS
SELECT order_id, sum(quantity * price) AS total
FROM order_items
GROUP BY order_id;

SELECT * FROM order_totals ORDER BY total DESC LIMIT 5;</pre>` },
    { id: "csv", title: "Загружаем CSV через DBeaver", html: `
<p>Типичная ситуация: прислали Excel-файл, и его нужно соединить с данными из базы. План: сохранить файл как CSV и загрузить в новую таблицу.</p>
<ol class="steps">
<li>В Excel: «Файл» → «Сохранить как» → тип <b>CSV UTF-8 (разделители-запятые)</b>. В первой строке должны быть названия столбцов, лучше латиницей без пробелов.</li>
<li>В DBeaver раскрой базу <code>shop</code> → «Схемы» → <code>public</code>. Правой кнопкой по «Таблицы» → <b>«Импорт данных»</b>.</li>
<li>Выбери «CSV» → «Далее» → укажи файл.</li>
<li>В настройках импорта проверь разделитель (запятая или точка с запятой), кодировку UTF-8 и что «Header» = top.</li>
<li>На шаге «Сопоставление таблиц» нажми на целевую таблицу и выбери <b>new</b>: DBeaver создаст новую таблицу. Задай имя, проверь типы столбцов (кнопка «Configure»).</li>
<li>«Далее» → «Начать». Нажми <span class="kbd">F5</span>, и новая таблица появится в списке.</li>
</ol>
<div class="tip"><b>Проверяй после загрузки</b>Сразу сделай <code>SELECT count(*)</code> и сравни с числом строк в файле. И посмотри <code>SELECT * … LIMIT 10</code>: не съехали ли столбцы, правильно ли распознались даты и дробные числа (запятая или точка).</div>
<p>Для больших файлов в PostgreSQL есть команда <code>COPY</code>, но ей нужен доступ к файлам на сервере. Для аналитика импорт через DBeaver удобнее.</p>` }
  ],
  practice: {
    intro: `<p>В этих задачах проверяется не результат твоего запроса, а то, как изменилась база. После твоего кода выполняется проверочный запрос, и его результат сравнивается с эталоном. Все изменения после проверки откатываются, так что экспериментируй смело.</p>`,
    tasks: [
      { id: "create", title: "Таблица поставщиков", text: `${from(SERGEY, "Хочу вести поставщиков в базе. Создай таблицу <code>suppliers</code>: <code>supplier_id</code> (integer, первичный ключ), <code>name</code> (text, обязательное), <code>city</code> (text), <code>phone</code> (text).")}`,
        hints: ["Шаблон: <code>CREATE TABLE имя ( столбец тип ограничения, … );</code>", "Для name нужно <code>NOT NULL</code>, для supplier_id <code>PRIMARY KEY</code>."],
        verify: "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'suppliers' ORDER BY ordinal_position;",
        solution: "CREATE TABLE suppliers (\n  supplier_id integer PRIMARY KEY,\n  name text NOT NULL,\n  city text,\n  phone text\n);" },
      { id: "insert", title: "Заполняем поставщиков", starter: "CREATE TABLE suppliers (\n  supplier_id integer PRIMARY KEY,\n  name text NOT NULL,\n  city text,\n  phone text\n);\n\n-- добавь строки ниже\n",
        text: `${from(SERGEY, "Внеси трёх поставщиков: 1, «Обжарочная Зерно», Москва, +7 495 111-22-33. 2, «Чайный дом», Санкт-Петербург, телефона нет. 3, «Свечная мастерская», Ярославль, +7 4852 55-66-77. Таблица уже создана в начале кода.")}`,
        hints: ["<code>INSERT INTO suppliers (supplier_id, name, city, phone) VALUES (…), (…), (…);</code>", "Названия пиши без кавычек-ёлочек: <code>'Обжарочная Зерно'</code>. Отсутствующий телефон это <code>NULL</code> без кавычек."],
        verify: "SELECT * FROM suppliers ORDER BY supplier_id;",
        solution: "CREATE TABLE suppliers (\n  supplier_id integer PRIMARY KEY,\n  name text NOT NULL,\n  city text,\n  phone text\n);\nINSERT INTO suppliers (supplier_id, name, city, phone) VALUES\n  (1, 'Обжарочная Зерно', 'Москва', '+7 495 111-22-33'),\n  (2, 'Чайный дом', 'Санкт-Петербург', NULL),\n  (3, 'Свечная мастерская', 'Ярославль', '+7 4852 55-66-77');" },
      { id: "price", title: "Подорожание свечей", text: `${from(OLYA, "Поставщик свечей поднял цены. Подними цену всех товаров категории «Свечи» на 8% и округли до целых рублей.")}`,
        hints: ["UPDATE … SET price = … WHERE category = 'Свечи'.", "<code>round(price * 1.08)</code>"],
        verify: "SELECT product_id, price FROM products ORDER BY product_id;",
        solution: "UPDATE products\nSET price = round(price * 1.08)\nWHERE category = 'Свечи';" },
      { id: "delete", title: "Чистим рассылку", text: `${from(DIMA, "Сервис рассылок сообщил, что подписчики с адресами на <code>@bk.ru</code> больше не получают письма. Удали их из таблицы <code>subscribers</code>.")}`,
        hints: ["Сначала проверь, кого удалишь: <code>SELECT * FROM subscribers WHERE email LIKE '%@bk.ru'</code>.", "<code>DELETE FROM subscribers WHERE …</code>"],
        verify: "SELECT email FROM subscribers ORDER BY email;",
        solution: "DELETE FROM subscribers\nWHERE email LIKE '%@bk.ru';" },
      { id: "ctas", title: "Витрина выручки по месяцам", text: `${from(MARINA, "Хочу, чтобы у нас была отдельная таблица <code>monthly_revenue</code> с двумя столбцами: <code>month</code> (дата первого числа месяца) и <code>revenue</code> (выручка доставленных заказов за месяц).")}`,
        hints: ["<code>CREATE TABLE monthly_revenue AS SELECT …</code>", "Внутри SELECT: JOIN orders и order_items, WHERE по статусу, GROUP BY <code>date_trunc('month', o.created_at)::date</code>."],
        verify: "SELECT month, revenue FROM monthly_revenue ORDER BY month;",
        solution: "CREATE TABLE monthly_revenue AS\nSELECT date_trunc('month', o.created_at)::date AS month,\n       sum(oi.quantity * oi.price) AS revenue\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'доставлен'\nGROUP BY 1;" },
      { id: "vip", title: "Отмечаем VIP-клиентов", text: `${from(MARINA, "Добавь клиентам признак <code>is_vip</code> (boolean, по умолчанию false) и поставь true тем, у кого 10 и больше доставленных заказов.")}`,
        hints: ["Два шага: <code>ALTER TABLE … ADD COLUMN …</code>, потом <code>UPDATE … WHERE customer_id IN (подзапрос)</code>.", "Подзапрос: <code>SELECT customer_id FROM orders WHERE status = 'доставлен' GROUP BY customer_id HAVING count(*) >= 10</code>."],
        verify: "SELECT customer_id, is_vip FROM customers ORDER BY customer_id;",
        solution: "ALTER TABLE customers ADD COLUMN is_vip boolean DEFAULT false;\nUPDATE customers\nSET is_vip = true\nWHERE customer_id IN (\n  SELECT customer_id FROM orders\n  WHERE status = 'доставлен'\n  GROUP BY customer_id\n  HAVING count(*) >= 10\n);" }
    ]
  },
  homework: {
    tasks: [
      { id: "reviews", title: "Таблица отзывов", level: "средне", text: `<p>Создай таблицу <code>reviews</code>: <code>review_id</code> integer первичный ключ, <code>product_id</code> integer со ссылкой на products, <code>rating</code> integer от 1 до 5 (через CHECK), <code>comment</code> text, <code>created_at</code> timestamp со значением по умолчанию now(). Добавь три отзыва: на товары 1, 16 и 21 с оценками 5, 4, 5 (комментарии любые, created_at не указывай).</p>`,
        hints: ["Ссылка: <code>product_id integer REFERENCES products(product_id)</code>. Проверка: <code>rating integer CHECK (rating BETWEEN 1 AND 5)</code>.", "В INSERT перечисли только review_id, product_id, rating, comment."],
        verify: "SELECT review_id, product_id, rating, created_at IS NOT NULL AS has_date FROM reviews ORDER BY review_id;",
        solution: "CREATE TABLE reviews (\n  review_id integer PRIMARY KEY,\n  product_id integer REFERENCES products(product_id),\n  rating integer CHECK (rating BETWEEN 1 AND 5),\n  comment text,\n  created_at timestamp DEFAULT now()\n);\nINSERT INTO reviews (review_id, product_id, rating, comment) VALUES\n  (1, 1, 5, 'Отличный кофе'),\n  (2, 16, 4, 'Тёплый, но колется'),\n  (3, 21, 5, 'Пахнет как дома');" },
      { id: "check", title: "Сломай ограничение", manual: true, text: `<p>В песочнице создай таблицу reviews из прошлого задания и попробуй вставить отзыв с оценкой 7 и отзыв на несуществующий товар 999. Прочитай сообщения об ошибках. Так ограничения защищают данные от мусора.</p>`, hints: [] },
      { id: "fixmail", title: "Почистить почты в базе", text: `<p>Исправь почты клиентов прямо в таблице: убери пробелы по краям и приведи к нижнему регистру. Меняй только те строки, где почта действительно «грязная».</p>`,
        hints: ["<code>SET email = lower(trim(email))</code>", "Условие для «грязных»: <code>WHERE email &lt;&gt; lower(trim(email))</code>."],
        verify: "SELECT customer_id, email FROM customers ORDER BY customer_id;",
        solution: "UPDATE customers\nSET email = lower(trim(email))\nWHERE email <> lower(trim(email));" },
      { id: "view", title: "Представление для отчёта", level: "средне", text: `<p>Создай представление <code>delivered_lines</code>: все строки состава доставленных заказов с полями <code>order_id</code>, <code>created_at</code>, <code>category</code>, <code>name</code>, <code>quantity</code>, <code>price</code>, <code>line_total</code>. Им удобно будет пользоваться в следующих модулях.</p>`,
        hints: ["<code>CREATE VIEW delivered_lines AS SELECT …</code>", "JOIN orders, order_items и products; WHERE o.status = 'доставлен'; line_total = oi.quantity * oi.price."],
        verify: "SELECT order_id, category, name, quantity, line_total FROM delivered_lines;",
        solution: "CREATE VIEW delivered_lines AS\nSELECT o.order_id, o.created_at, p.category, p.name, oi.quantity, oi.price,\n       oi.quantity * oi.price AS line_total\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nJOIN products p ON p.product_id = oi.product_id\nWHERE o.status = 'доставлен';" },
      { id: "import", title: "Импорт CSV в DBeaver", manual: true, text: `<p>Сделай в Excel или Google Таблицах маленькую таблицу из 5 строк: <code>product_id</code>, <code>stock</code> (остаток на складе). Сохрани в CSV и загрузи в базу <code>shop</code> через импорт DBeaver как таблицу <code>stock</code>. Потом напиши запрос: название товара и его остаток (JOIN с products).</p>`,
        hints: ["Пошаговая инструкция в блоке «Загружаем CSV через DBeaver».", "Если столбцы склеились в один, при импорте не тот разделитель. Поменяй запятую на точку с запятой."] }
    ]
  }
});

/* ===================== 10. ОКОННЫЕ ФУНКЦИИ ===================== */
M.push({
  id: "m10", num: 10, week: 6, color: "lav", icon: "win", time: "≈ 7 часов",
  short: "Оконные функции", tag: "OVER, LAG, LEAD, RANK", title: "Оконные функции",
  desc: "Рейтинги, накопительные итоги, сравнение с прошлым месяцем, доля от общего. Инструмент, который отличает уверенного аналитика.",
  lead: "GROUP BY схлопывает строки в одну. Оконные функции считают агрегаты и рейтинги, но оставляют все строки на месте. Так можно в одной таблице видеть и заказ, и его место в рейтинге, и сумму всех заказов клиента до него. На собеседованиях аналитиков про окна спрашивают почти всегда.",
  goals: ["Понимать OVER, PARTITION BY и ORDER BY в окне", "Ранжировать: ROW_NUMBER, RANK, DENSE_RANK", "Сравнивать с прошлым периодом через LAG и LEAD", "Считать накопительные итоги и скользящие средние"],
  video: [
    { id: "XWbN5v_a1Lk", title: "Оконные функции: основы", author: "karpov.courses", len: "20 мин" },
    { id: "GO9Gu_hfoD4", title: "Оконные функции RANK и LAG", author: "karpov.courses", len: "21 мин" },
    { id: "phIR9W0yIaE", title: "Оконные функции SQL за 13 минут", author: "Listen IT", len: "14 мин", note: "Короткое повторение, если после двух первых видео хочется ещё раз всё уложить." }
  ],
  theory: [
    { id: "idea", title: "Идея: агрегат без схлопывания", html: `
<p>Хотим рядом с каждым товаром видеть среднюю цену его категории. С GROUP BY не выйдет: строки товаров схлопнутся. С окном выходит:</p>
<pre class="sql">SELECT name,
       category,
       price,
       round(avg(price) OVER (PARTITION BY category)) AS avg_in_category
FROM products
ORDER BY category, price;</pre>
<div class="grid2">
<div class="tile sky"><h4>GROUP BY</h4><p>Много строк → одна строка на группу. Детали теряются.</p></div>
<div class="tile lav"><h4>OVER (окно)</h4><p>Каждая строка остаётся. К ней добавляется значение, посчитанное по «окну» соседних строк.</p></div>
</div>
<h4>Из чего состоит окно</h4>
<pre class="sql norun">функция() OVER (
  PARTITION BY …   -- на какие группы делить (как GROUP BY, но без схлопывания)
  ORDER BY …       -- в каком порядке идти внутри группы
  ROWS BETWEEN …   -- какие строки брать в расчёт (рамка)
)</pre>
<p>Все три части необязательны. <code>OVER ()</code> с пустыми скобками значит «окно это вся таблица».</p>
<pre class="sql">-- Доля каждой категории в выручке
SELECT p.category,
       sum(oi.quantity * oi.price) AS revenue,
       round(100.0 * sum(oi.quantity * oi.price) / sum(sum(oi.quantity * oi.price)) OVER (), 1) AS share_pct
FROM order_items oi
JOIN products p ON p.product_id = oi.product_id
GROUP BY p.category
ORDER BY revenue DESC;</pre>
<div class="note"><b>sum(sum(…)) OVER ()</b>выглядит странно, но логика простая: внутренний sum считается при группировке (выручка категории), а внешний оконный sum складывает выручки всех категорий. Окна выполняются после GROUP BY, поэтому так можно.</div>` },
    { id: "rank", title: "Рейтинги: ROW_NUMBER, RANK, DENSE_RANK", html: `
<p>Три функции нумеруют строки по порядку из ORDER BY в окне. Отличаются тем, как обрабатывают одинаковые значения.</p>
<div class="tbl-wrap"><table class="t">
<tr><th>Товар</th><th>Цена</th><th>row_number</th><th>rank</th><th>dense_rank</th></tr>
<tr><td>Свеча «Корица и яблоко»</td><td>790</td><td>1</td><td>1</td><td>1</td></tr>
<tr><td>Свеча «Ваниль»</td><td>790</td><td>2</td><td>1</td><td>1</td></tr>
<tr><td>Кружка керамическая</td><td>890</td><td>3</td><td>3</td><td>2</td></tr>
<tr><td>Кружка «Рябина»</td><td>950</td><td>4</td><td>4</td><td>3</td></tr>
</table></div>
<ul>
<li><code>row_number()</code> просто нумерует 1, 2, 3… Одинаковым значениям достаются разные номера.</li>
<li><code>rank()</code> одинаковым даёт одинаковый ранг, а следующий номер пропускает (1, 1, 3).</li>
<li><code>dense_rank()</code> без пропусков (1, 1, 2).</li>
</ul>
<pre class="sql">SELECT category, name, price,
       row_number() OVER (PARTITION BY category ORDER BY price DESC) AS rn,
       rank()       OVER (PARTITION BY category ORDER BY price DESC) AS rnk,
       dense_rank() OVER (PARTITION BY category ORDER BY price DESC) AS drnk
FROM products
ORDER BY category, price DESC;</pre>
<h4>Топ-N в каждой группе</h4>
<p>Оконные функции нельзя писать в WHERE. Поэтому сначала считаем номер в подзапросе или CTE, потом фильтруем снаружи. Этот шаблон встречается постоянно.</p>
<pre class="sql">-- Самый дорогой товар в каждой категории
WITH ranked AS (
  SELECT category, name, price,
         row_number() OVER (PARTITION BY category ORDER BY price DESC) AS rn
  FROM products
)
SELECT category, name, price
FROM ranked
WHERE rn = 1;</pre>` },
    { id: "lag", title: "LAG и LEAD: сравнение с соседней строкой", html: `
<p><code>lag(x)</code> берёт значение из предыдущей строки окна, <code>lead(x)</code> из следующей. Главное применение: «как изменилось по сравнению с прошлым месяцем».</p>
<pre class="sql">WITH m AS (
  SELECT date_trunc('month', o.created_at)::date AS month,
         sum(oi.quantity * oi.price) AS revenue
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'доставлен'
  GROUP BY 1
)
SELECT month,
       revenue,
       lag(revenue) OVER (ORDER BY month) AS prev_month,
       round(100.0 * (revenue - lag(revenue) OVER (ORDER BY month)) / lag(revenue) OVER (ORDER BY month), 1) AS growth_pct
FROM m
ORDER BY month;</pre>
<div class="tbl-wrap"><table class="t">
<tr><th>Запись</th><th>Что вернёт</th></tr>
<tr><td><code>lag(x)</code></td><td>значение из предыдущей строки (у первой NULL)</td></tr>
<tr><td><code>lag(x, 12)</code></td><td>значение 12 строк назад: тот же месяц прошлого года</td></tr>
<tr><td><code>lag(x, 1, 0)</code></td><td>третий аргумент: что вернуть вместо NULL</td></tr>
<tr><td><code>lead(x)</code></td><td>значение из следующей строки</td></tr>
</table></div>
<div class="life"><b>Сколько дней между покупками</b>С PARTITION BY по клиенту lag показывает дату его предыдущего заказа. Разница дат даёт интервал между покупками, это одна из ключевых метрик удержания.</div>
<pre class="sql">SELECT customer_id,
       order_id,
       created_at::date AS order_date,
       created_at::date - lag(created_at::date) OVER (PARTITION BY customer_id ORDER BY created_at) AS days_since_prev
FROM orders
ORDER BY customer_id, created_at
LIMIT 20;</pre>` },
    { id: "running", title: "Накопительный итог и скользящее среднее", html: `
<p>Если в окне есть ORDER BY, агрегат считается «от начала до текущей строки». Так получается накопительный итог (нарастающим итогом, как говорят бухгалтеры).</p>
<pre class="sql">WITH m AS (
  SELECT date_trunc('month', o.created_at)::date AS month,
         sum(oi.quantity * oi.price) AS revenue
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'доставлен' AND o.created_at >= '2026-01-01'
  GROUP BY 1
)
SELECT month, revenue,
       sum(revenue) OVER (ORDER BY month) AS revenue_ytd
FROM m
ORDER BY month;</pre>
<h4>Рамка окна: ROWS BETWEEN</h4>
<div class="tbl-wrap"><table class="t">
<tr><th>Рамка</th><th>Какие строки</th></tr>
<tr><td><code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code></td><td>от первой до текущей (накопительный итог)</td></tr>
<tr><td><code>ROWS BETWEEN 2 PRECEDING AND CURRENT ROW</code></td><td>текущая и две предыдущие (скользящее за 3)</td></tr>
<tr><td><code>ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING</code></td><td>соседи с обеих сторон</td></tr>
<tr><td><code>ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING</code></td><td>вся группа</td></tr>
</table></div>
<pre class="sql">-- Скользящее среднее количества заказов за 3 месяца: сглаживает скачки
WITH m AS (
  SELECT date_trunc('month', created_at)::date AS month, count(*) AS orders
  FROM orders
  GROUP BY 1
)
SELECT month, orders,
       round(avg(orders) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS avg_3m
FROM m
ORDER BY month;</pre>
<h4>first_value и номер заказа клиента</h4>
<pre class="sql">SELECT customer_id, order_id, created_at,
       row_number() OVER (PARTITION BY customer_id ORDER BY created_at) AS nth_order,
       first_value(created_at) OVER (PARTITION BY customer_id ORDER BY created_at) AS first_order_at
FROM orders
ORDER BY customer_id, created_at
LIMIT 15;</pre>` },
    { id: "order", title: "Полный порядок выполнения запроса", html: `
<div class="flow"><span>FROM / JOIN</span><i>→</i><span>WHERE</span><i>→</i><span>GROUP BY</span><i>→</i><span>HAVING</span><i>→</i><span>Окна (OVER)</span><i>→</i><span>SELECT</span><i>→</i><span>DISTINCT</span><i>→</i><span>ORDER BY</span><i>→</i><span>LIMIT</span></div>
<ul>
<li>Окна считаются после группировки, поэтому можно писать <code>sum(sum(x)) OVER ()</code>.</li>
<li>Окна считаются после WHERE, поэтому фильтровать по ним можно только снаружи, через подзапрос или CTE.</li>
<li>Окно видит только строки, которые прошли WHERE. Если отфильтровать 2026 год, lag у января вернёт NULL, а не декабрь 2025.</li>
</ul>
<div class="tip"><b>Повторяющееся окно можно назвать</b>Если одно и то же окно встречается несколько раз, вынеси его в конец: <code>… lag(revenue) OVER w … FROM m WINDOW w AS (ORDER BY month)</code>.</div>` }
  ],
  practice: {
    tasks: [
      { id: "avgcat", title: "Цена против средней по категории", text: `${from(MARINA, "Для каждого товара покажи название, категорию, цену и среднюю цену в его категории (округли до рубля). Хочу увидеть, какие товары выбиваются.")}`,
        hints: ["Средняя по категории без схлопывания: <code>avg(price) OVER (PARTITION BY category)</code>.", "Оберни в <code>round(…)</code>."], solution: "SELECT name, category, price, round(avg(price) OVER (PARTITION BY category)) AS avg_cat\nFROM products;" },
      { id: "rankcat", title: "Рейтинг цен внутри категории", text: `${from(SERGEY, "Пронумеруй товары внутри каждой категории от самого дорогого к дешёвому. Одинаковые цены пусть получают одинаковый номер без пропусков. Категория, название, цена, место.")}`,
        hints: ["«Одинаковый номер без пропусков» это dense_rank.", "<code>dense_rank() OVER (PARTITION BY category ORDER BY price DESC)</code>"], solution: "SELECT category, name, price, dense_rank() OVER (PARTITION BY category ORDER BY price DESC) AS place\nFROM products;" },
      { id: "mom", title: "Рост к прошлому месяцу", ordered: true, text: `${from(OLYA, "Нужна выручка доставленных заказов по месяцам за всё время и рядом выручка прошлого месяца. Месяц, выручка, выручка прошлого месяца.")}`,
        hints: ["Сначала посчитай выручку по месяцам в CTE.", "Потом <code>lag(revenue) OVER (ORDER BY month)</code> и сортировка по месяцу."], solution: "WITH m AS (\n  SELECT date_trunc('month', o.created_at)::date AS month,\n         sum(oi.quantity * oi.price) AS revenue\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status = 'доставлен'\n  GROUP BY 1\n)\nSELECT month, revenue, lag(revenue) OVER (ORDER BY month) AS prev_revenue\nFROM m\nORDER BY month;" },
      { id: "ytd", title: "Нарастающий итог 2026", ordered: true, text: `${from(MARINA, "Покажи, как копилась выручка в 2026 году: месяц, выручка за месяц и выручка с начала года нарастающим итогом. Только доставленные заказы.")}`,
        hints: ["Фильтр на 2026 год в CTE, иначе в итог попадёт 2025.", "<code>sum(revenue) OVER (ORDER BY month)</code>"], solution: "WITH m AS (\n  SELECT date_trunc('month', o.created_at)::date AS month,\n         sum(oi.quantity * oi.price) AS revenue\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status = 'доставлен' AND o.created_at >= '2026-01-01'\n  GROUP BY 1\n)\nSELECT month, revenue, sum(revenue) OVER (ORDER BY month) AS ytd\nFROM m\nORDER BY month;" },
      { id: "firstorder", title: "Первые заказы клиентов", text: `${from(DIMA, "Хочу понять, с чего начинают новые клиенты. Дай по каждому клиенту только его первый заказ: id клиента, номер заказа, дата.")}`,
        hints: ["Пронумеруй заказы каждого клиента по дате: <code>row_number() OVER (PARTITION BY customer_id ORDER BY created_at)</code>.", "Отфильтруй <code>rn = 1</code> снаружи, в CTE или подзапросе."], solution: "WITH r AS (\n  SELECT customer_id, order_id, created_at,\n         row_number() OVER (PARTITION BY customer_id ORDER BY created_at) AS rn\n  FROM orders\n)\nSELECT customer_id, order_id, created_at\nFROM r\nWHERE rn = 1;" },
      { id: "gap", title: "Интервал между покупками", text: `${from(DIMA, "Сколько в среднем дней проходит между заказами одного клиента? Посчитай для каждого клиента, у которого больше одного заказа, средний интервал в днях (округли до целого). id клиента и средний интервал.")}`,
        hints: ["Шаг 1 (CTE): для каждого заказа разница с предыдущим заказом клиента через lag по <code>created_at::date</code>.", "Шаг 2: <code>round(avg(gap))</code> с группировкой по клиенту. У первого заказа gap = NULL, avg его пропустит. Клиенты с одним заказом получат NULL: убери их через <code>HAVING count(gap) > 0</code>."], solution: "WITH g AS (\n  SELECT customer_id,\n         created_at::date - lag(created_at::date) OVER (PARTITION BY customer_id ORDER BY created_at) AS gap\n  FROM orders\n)\nSELECT customer_id, round(avg(gap)) AS avg_gap\nFROM g\nGROUP BY customer_id\nHAVING count(gap) > 0;" },
      { id: "top2", title: "Два хита в каждой категории", text: `${from(MARINA, "Какие два товара в каждой категории приносят больше всего выручки (доставленные заказы)? Категория, товар, выручка.")}`,
        hints: ["Шаг 1: выручка по товарам (JOIN трёх таблиц, GROUP BY категория и название).", "Шаг 2: <code>row_number() OVER (PARTITION BY category ORDER BY revenue DESC)</code> и фильтр <code>rn &lt;= 2</code>."], solution: "WITH rev AS (\n  SELECT p.category, p.name, sum(oi.quantity * oi.price) AS revenue\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  JOIN products p ON p.product_id = oi.product_id\n  WHERE o.status = 'доставлен'\n  GROUP BY p.category, p.name\n), r AS (\n  SELECT *, row_number() OVER (PARTITION BY category ORDER BY revenue DESC) AS rn\n  FROM rev\n)\nSELECT category, name, revenue\nFROM r\nWHERE rn <= 2;" }
    ]
  },
  homework: {
    tasks: [
      { id: "share", title: "Доля города в выручке", ordered: true, text: `<p>По доставленным заказам посчитай выручку по городам доставки и долю каждого города в общей выручке в процентах (1 знак). Сортировка по выручке по убыванию.</p>`,
        hints: ["Доля: <code>100.0 * sum(…) / sum(sum(…)) OVER ()</code>."], solution: "SELECT o.delivery_city,\n       sum(oi.quantity * oi.price) AS revenue,\n       round(100.0 * sum(oi.quantity * oi.price) / sum(sum(oi.quantity * oi.price)) OVER (), 1) AS share_pct\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'доставлен'\nGROUP BY o.delivery_city\nORDER BY revenue DESC;" },
      { id: "yoy", title: "Год к году", level: "посложнее", ordered: true, text: `<p>Для месяцев 2026 года выведи выручку и выручку того же месяца 2025 года, а также рост в процентах (1 знак). Доставленные заказы.</p>`,
        hints: ["Посчитай выручку по всем месяцам и возьми <code>lag(revenue, 12) OVER (ORDER BY month)</code>. Пропусков месяцев в данных нет, так что 12 строк назад это ровно год назад.", "Фильтр на 2026 год делай снаружи, после окна, иначе lag не увидит 2025 год."], solution: "WITH m AS (\n  SELECT date_trunc('month', o.created_at)::date AS month,\n         sum(oi.quantity * oi.price) AS revenue\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status = 'доставлен'\n  GROUP BY 1\n), y AS (\n  SELECT month, revenue, lag(revenue, 12) OVER (ORDER BY month) AS last_year\n  FROM m\n)\nSELECT month, revenue, last_year, round(100.0 * (revenue - last_year) / last_year, 1) AS yoy_pct\nFROM y\nWHERE month >= '2026-01-01'\nORDER BY month;" },
      { id: "nth", title: "Какой по счёту заказ", text: `<p>Для каждого заказа выведи id клиента, номер заказа и порядковый номер этого заказа у клиента (1, 2, 3…), а также дату следующего заказа этого клиента (LEAD).</p>`,
        hints: ["Оба окна одинаковые: <code>PARTITION BY customer_id ORDER BY created_at</code>.", "<code>row_number()</code> и <code>lead(created_at)</code>."], solution: "SELECT customer_id, order_id,\n       row_number() OVER (PARTITION BY customer_id ORDER BY created_at) AS nth,\n       lead(created_at) OVER (PARTITION BY customer_id ORDER BY created_at) AS next_order_at\nFROM orders;" },
      { id: "ma", title: "Скользящая выручка", level: "средне", ordered: true, text: `<p>Посчитай выручку доставленных заказов по месяцам и скользящее среднее за 3 месяца (текущий и два предыдущих), округлённое до рубля.</p>`,
        hints: ["<code>avg(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)</code>"], solution: "WITH m AS (\n  SELECT date_trunc('month', o.created_at)::date AS month,\n         sum(oi.quantity * oi.price) AS revenue\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status = 'доставлен'\n  GROUP BY 1\n)\nSELECT month, revenue,\n       round(avg(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)) AS ma3\nFROM m\nORDER BY month;" }
    ]
  }
});

/* ===================== 11. ДАННЫЕ ДЛЯ EXCEL ===================== */
M.push({
  id: "m11", num: 11, week: 7, color: "mint", icon: "chart", time: "≈ 6 часов",
  short: "Данные для Excel", tag: "CASE, шкала времени, выгрузка", title: "Подготовка данных для Excel",
  desc: "CASE для сегментов, сетка дат без пропусков, «плоские» таблицы для сводных, выгрузка и графики в Excel.",
  lead: "Финальный шаг работы аналитика: отдать данные в таком виде, чтобы из них легко было сделать сводную таблицу и график. Здесь учимся готовить правильную выгрузку и делать по ней отчёт в Excel.",
  goals: ["Делить данные на группы через CASE", "Строить непрерывную шкалу времени с generate_series", "Готовить «плоскую» таблицу для сводной", "Выгружать в CSV/Excel и строить сводные и графики"],
  video: [
    { id: "kyG3AQssi70", title: "Оператор CASE", author: "ГАУС, SQL для начинающих", len: "5 мин" },
    { id: "4roVtL2mynA", title: "Сводные таблицы Excel с нуля до профи за полчаса", author: "Билял Хасенов", len: "35 мин" },
    { id: "yFZd2-uRsOw", title: "Импорт и экспорт данных", author: "Товарищ Excel", len: "23 мин" }
  ],
  theory: [
    { id: "case", title: "CASE: «если… то…» в SQL", html: `
<p><code>CASE</code> это аналог функции ЕСЛИ в Excel. Проверяет условия по очереди и возвращает значение первого подошедшего.</p>
<pre class="sql">SELECT name,
       price,
       CASE
         WHEN price < 500  THEN 'бюджетный'
         WHEN price < 1500 THEN 'средний'
         ELSE 'премиум'
       END AS segment
FROM products
ORDER BY price;</pre>
<ul>
<li>Условия проверяются сверху вниз, срабатывает первое подходящее. Поэтому во второй строке достаточно <code>price &lt; 1500</code>: всё, что меньше 500, уже забрала первая.</li>
<li>Если ни одно условие не подошло и нет ELSE, вернётся NULL.</li>
<li>Не забудь <code>END</code> в конце.</li>
</ul>
<h4>Короткая форма</h4>
<pre class="sql">SELECT order_id,
       CASE status
         WHEN 'доставлен' THEN 'успех'
         WHEN 'отменён'   THEN 'потеря'
         ELSE 'в процессе'
       END AS result
FROM orders
LIMIT 10;</pre>
<h4>CASE внутри агрегата</h4>
<p>Самый мощный приём: условные суммы. Работает в любой базе, не только в PostgreSQL (FILTER из модуля 7 есть не везде).</p>
<pre class="sql">SELECT date_trunc('month', o.created_at)::date AS month,
       sum(CASE WHEN p.category = 'Кофе' THEN oi.quantity * oi.price ELSE 0 END) AS coffee,
       sum(CASE WHEN p.category = 'Чай'  THEN oi.quantity * oi.price ELSE 0 END) AS tea,
       sum(CASE WHEN p.category NOT IN ('Кофе', 'Чай') THEN oi.quantity * oi.price ELSE 0 END) AS other
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
JOIN products p ON p.product_id = oi.product_id
WHERE o.status = 'доставлен'
GROUP BY 1
ORDER BY 1;</pre>` },
    { id: "flat", title: "Какие данные любит Excel", html: `
<p>Для сводной таблицы нужна «плоская» (длинная) таблица: одна строка = один факт, в каждом столбце один признак. Сводная потом сама разложит её как угодно.</p>
<div class="grid2">
<div class="tile lime"><h4>✅ Удобно для сводной</h4>
<table class="t"><tr><th>month</th><th>category</th><th>city</th><th>revenue</th></tr>
<tr><td>2026-08-01</td><td>Кофе</td><td>Москва</td><td>15 300</td></tr>
<tr><td>2026-08-01</td><td>Чай</td><td>Москва</td><td>4 100</td></tr>
<tr><td>2026-08-01</td><td>Кофе</td><td>Казань</td><td>2 700</td></tr></table></div>
<div class="tile peach"><h4>❌ Неудобно</h4>
<table class="t"><tr><th>category</th><th>авг Москва</th><th>авг Казань</th><th>сен Москва</th></tr>
<tr><td>Кофе</td><td>15 300</td><td>2 700</td><td>…</td></tr></table>
<p style="margin-top:8px">Такую таблицу уже не перевернёшь и не отфильтруешь по месяцу.</p></div>
</div>
<div class="tbl-wrap"><table class="t">
<tr><th>Правило</th><th>Почему</th></tr>
<tr><td>Даты отдавай как даты (<code>2026-08-01</code>), а не текстом «август»</td><td>Excel сможет группировать по годам и кварталам и правильно сортировать</td></tr>
<tr><td>Деньги без пробелов и знака ₽</td><td>иначе Excel воспримет число как текст</td></tr>
<tr><td>Понятные названия столбцов</td><td>они станут названиями полей в сводной</td></tr>
<tr><td>Не больше миллиона строк</td><td>лимит Excel 1 048 576 строк. Агрегируй в SQL до нужного уровня</td></tr>
<tr><td>Не забывай нули</td><td>если в каком-то месяце продаж не было, строки не будет вовсе и график «соврёт». Об этом следующий блок</td></tr>
</table></div>
<pre class="sql">-- Плоская выгрузка для сводной: месяц × категория × город
SELECT date_trunc('month', o.created_at)::date AS month,
       p.category,
       o.delivery_city AS city,
       count(DISTINCT o.order_id) AS orders,
       sum(oi.quantity * oi.price) AS revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
JOIN products p ON p.product_id = oi.product_id
WHERE o.status = 'доставлен'
GROUP BY 1, 2, 3
ORDER BY 1, 2, 3;</pre>` },
    { id: "series", title: "Шкала времени без дыр: generate_series", html: `
<p>Товар «Пряники имбирные» появился в ноябре 2025 и продаётся не каждый месяц. Если просто сгруппировать продажи по месяцам, месяцы без продаж исчезнут, а на графике линия соединит соседние точки, как будто провала не было.</p>
<p>Решение: сначала сделать сетку всех месяцев, потом присоединить к ней данные через LEFT JOIN и заменить NULL на 0.</p>
<pre class="sql">WITH months AS (
  SELECT generate_series('2025-11-01'::date, '2026-09-01'::date, interval '1 month')::date AS month
),
sales AS (
  SELECT date_trunc('month', o.created_at)::date AS month,
         sum(oi.quantity) AS qty
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  JOIN products p ON p.product_id = oi.product_id
  WHERE p.name = 'Пряники имбирные' AND o.status = 'доставлен'
  GROUP BY 1
)
SELECT m.month, coalesce(s.qty, 0) AS qty
FROM months m
LEFT JOIN sales s ON s.month = m.month
ORDER BY m.month;</pre>
<h4>Сетка «месяц × категория»</h4>
<p>Если нужны нули в каждой комбинации, сетку делают через CROSS JOIN: все месяцы умножить на все категории.</p>
<pre class="sql">WITH months AS (
  SELECT generate_series('2026-01-01'::date, '2026-09-01'::date, interval '1 month')::date AS month
), cats AS (
  SELECT DISTINCT category FROM products
)
SELECT m.month, c.category
FROM months m
CROSS JOIN cats c
ORDER BY 1, 2
LIMIT 12;</pre>
<div class="life"><b>Объединяем данные по шкале времени</b>Разные данные (расходы на рекламу, регистрации, выручка) хранятся в разных таблицах, но у всех есть время. Приводим всё к одной шкале (например, месяцу) через <code>date_trunc</code> и соединяем по месяцу. Так рождаются маркетинговые метрики вроде стоимости привлечения клиента (CAC).</div>
<pre class="sql">WITH spend AS (
  SELECT month, sum(spend) AS ad_spend FROM ad_spend GROUP BY month
), newbies AS (
  SELECT date_trunc('month', registered_at)::date AS month, count(*) AS new_customers
  FROM customers
  WHERE source IN ('instagram', 'telegram', 'vk')
  GROUP BY 1
)
SELECT s.month, s.ad_spend, coalesce(n.new_customers, 0) AS new_customers,
       round(s.ad_spend / nullif(n.new_customers, 0)) AS cac
FROM spend s
LEFT JOIN newbies n ON n.month = s.month
ORDER BY s.month;</pre>` },
    { id: "export", title: "Выгрузка из DBeaver и открытие в Excel", html: `
<h4>Способ 1. Быстро: копировать</h4>
<p>Выдели результат в DBeaver (<span class="kbd">Ctrl</span>+<span class="kbd">A</span>), нажми правой кнопкой → «Расширенное копирование» (<span class="kbd">Ctrl</span>+<span class="kbd">Shift</span>+<span class="kbd">C</span>) → поставь галочку «Копировать заголовки» → вставь в Excel. Подходит для небольших таблиц.</p>
<h4>Способ 2. Правильно: экспорт</h4>
<ol class="steps">
<li>Правой кнопкой по результату запроса → <b>«Экспорт данных»</b>.</li>
<li>Формат: <b>XLSX</b> (сразу Excel) или <b>CSV</b>.</li>
<li>Для CSV укажи разделитель <code>;</code> (так русский Excel откроет файл сразу по столбцам) и кодировку UTF-8, галочка «Insert BOM».</li>
<li>Выбери папку и имя файла → «Далее» → «Начать».</li>
</ol>
<h4>Способ 3. Из курса</h4>
<p>Под каждым результатом на этом сайте есть кнопка <b>«Скачать CSV для Excel»</b>: файл уже с разделителем «;», русской десятичной запятой и в нужной кодировке. Двойной клик, и он открывается в Excel.</p>
<div class="warn"><b>Если в Excel всё в одном столбце или «кракозябры»</b>Открой Excel → «Данные» → «Из текста/CSV» → выбери файл → кодировка «65001: Юникод (UTF-8)», разделитель «Точка с запятой» → «Загрузить».</div>` },
    { id: "pivot", title: "Сводная таблица и график в Excel", html: `
<ol class="steps">
<li>Встань в любую ячейку выгрузки → «Вставка» → <b>«Сводная таблица»</b> → «На новый лист» → OK.</li>
<li>Справа появится список полей. Перетащи <code>month</code> в <b>«Строки»</b>, <code>category</code> в <b>«Столбцы»</b>, <code>revenue</code> в <b>«Значения»</b>.</li>
<li>Если Excel сгруппировал даты по годам и кварталам, а нужны месяцы: правой кнопкой по дате → «Группировать» → выбери «Месяцы» и «Годы».</li>
<li>Формат чисел: правой кнопкой по значению → «Числовой формат» → «Числовой», разделитель групп разрядов, 0 знаков.</li>
<li>Встань в сводную → «Анализ сводной таблицы» → <b>«Сводная диаграмма»</b> → «Гистограмма с накоплением» или «График».</li>
<li>Добавь <b>срез</b> (Анализ → Вставить срез → city), чтобы фильтровать отчёт по городам одной кнопкой.</li>
</ol>
<div class="tbl-wrap"><table class="t">
<tr><th>Что показываем</th><th>Какой график</th></tr>
<tr><td>Динамика по времени</td><td>линейный график или гистограмма</td></tr>
<tr><td>Сравнение категорий</td><td>горизонтальные столбцы, отсортированные по значению</td></tr>
<tr><td>Структура (доли)</td><td>гистограмма с накоплением 100%. Круговую только если частей 2–4</td></tr>
<tr><td>Две метрики разного масштаба (расходы и клиенты)</td><td>комбинированная с двумя осями</td></tr>
</table></div>
<div class="tip">Нет Excel? В Google Таблицах всё то же самое: «Вставка» → «Сводная таблица», а потом «Вставка» → «Диаграмма».</div>` }
  ],
  practice: {
    tasks: [
      { id: "seg", title: "Сегменты цен", text: `${from(DIMA, "Для отчёта раздели товары на сегменты: до 500 ₽ «эконом», от 500 до 1499 ₽ «средний», от 1500 ₽ «премиум». Название, цена, сегмент.")}`,
        hints: ["CASE WHEN … THEN … WHEN … THEN … ELSE … END.", "Условия по порядку: <code>price &lt; 500</code>, <code>price &lt; 1500</code>, иначе премиум."], solution: "SELECT name, price,\n       CASE\n         WHEN price < 500 THEN 'эконом'\n         WHEN price < 1500 THEN 'средний'\n         ELSE 'премиум'\n       END AS segment\nFROM products;" },
      { id: "agegroups", title: "Возрастные группы", ordered: true, text: `${from(DIMA, "Сколько клиентов в каждой возрастной группе на 30.09.2026: «до 25», «25–34», «35–44», «45+»? Отсортируй группы по возрасту.")}`,
        hints: ["Возраст: <code>extract(year from age('2026-09-30'::date, birth_date))</code>. Удобно посчитать его в CTE.", "Чтобы группы шли по порядку, можно сортировать по <code>min(age)</code>."], solution: "WITH a AS (\n  SELECT extract(year from age('2026-09-30'::date, birth_date)) AS age\n  FROM customers\n)\nSELECT CASE\n         WHEN age < 25 THEN 'до 25'\n         WHEN age < 35 THEN '25–34'\n         WHEN age < 45 THEN '35–44'\n         ELSE '45+'\n       END AS age_group,\n       count(*) AS customers\nFROM a\nGROUP BY 1\nORDER BY min(age);" },
      { id: "pivotsql", title: "Сводная прямо в SQL", ordered: true, text: `${from(OLYA, "По месяцам 2026 года покажи количество заказов в трёх колонках: доставлено, отменено, в процессе (новые и в пути). Месяц и три числа.")}`,
        hints: ["<code>sum(CASE WHEN status = 'доставлен' THEN 1 ELSE 0 END)</code> и так далее. Или count(*) FILTER.", "«В процессе»: <code>status IN ('новый', 'в пути')</code>."], solution: "SELECT date_trunc('month', created_at)::date AS month,\n       sum(CASE WHEN status = 'доставлен' THEN 1 ELSE 0 END) AS delivered,\n       sum(CASE WHEN status = 'отменён' THEN 1 ELSE 0 END) AS cancelled,\n       sum(CASE WHEN status IN ('новый', 'в пути') THEN 1 ELSE 0 END) AS in_progress\nFROM orders\nWHERE created_at >= '2026-01-01'\nGROUP BY 1\nORDER BY 1;" },
      { id: "grid", title: "Продажи «Хвои» без пропусков", ordered: true, text: `${from(SERGEY, "Мне для плана закупок нужна помесячная статистика продаж свечи «Хвоя» в штуках с ноября 2025 по сентябрь 2026. Месяцы без продаж тоже покажи, с нулём.")}`,
        hints: ["Сетка месяцев: <code>generate_series('2025-11-01'::date, '2026-09-01'::date, interval '1 month')::date</code>.", "Продажи по месяцам в отдельном CTE (только доставленные), затем LEFT JOIN к сетке и <code>coalesce(qty, 0)</code>. Название: <code>'Свеча «Хвоя»'</code>."], solution: "WITH months AS (\n  SELECT generate_series('2025-11-01'::date, '2026-09-01'::date, interval '1 month')::date AS month\n), sales AS (\n  SELECT date_trunc('month', o.created_at)::date AS month, sum(oi.quantity) AS qty\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  JOIN products p ON p.product_id = oi.product_id\n  WHERE p.name = 'Свеча «Хвоя»' AND o.status = 'доставлен'\n  GROUP BY 1\n)\nSELECT m.month, coalesce(s.qty, 0) AS qty\nFROM months m\nLEFT JOIN sales s ON s.month = m.month\nORDER BY m.month;" },
      { id: "cac", title: "Сколько стоит клиент из каждого канала", ordered: true, text: `${from(DIMA, "По каждому рекламному каналу (instagram, telegram, vk) посчитай за всё время: расходы, количество пришедших клиентов и стоимость одного клиента (расходы / клиенты, округли до рубля). Отсортируй от самого дешёвого клиента.")}`,
        hints: ["Две агрегации отдельно: расходы по channel из ad_spend и клиенты по source из customers. Потом JOIN по <code>channel = source</code>.", "Делить безопасно: <code>round(spend / nullif(clients, 0))</code>."], solution: "WITH s AS (\n  SELECT channel, sum(spend) AS spend FROM ad_spend GROUP BY channel\n), c AS (\n  SELECT source, count(*) AS clients FROM customers GROUP BY source\n)\nSELECT s.channel, s.spend, c.clients, round(s.spend / nullif(c.clients, 0)) AS cac\nFROM s\nJOIN c ON c.source = s.channel\nORDER BY cac;" },
      { id: "export", title: "Выгрузка и сводная", manual: true, text: `${from(MARINA, "Сделай мне в Excel сводную: выручка по месяцам (строки) и категориям (столбцы) за 2026 год, и рядом гистограмму с накоплением.")}<p>Возьми плоскую выгрузку из блока «Какие данные любит Excel», добавь фильтр на 2026 год, выгрузи (кнопкой «Скачать CSV» или из DBeaver) и построй сводную и график по инструкции из теории.</p>`,
        hints: ["Фильтр: <code>AND o.created_at >= '2026-01-01'</code> в WHERE.", "Если Excel показал всё в одном столбце, открой файл через «Данные» → «Из текста/CSV»."] }
    ]
  },
  homework: {
    tasks: [
      { id: "heat", title: "Данные для тепловой карты", text: `<p>Подготовь выгрузку: день недели (isodow), час и количество заказов. По ней в Excel сделаешь сводную «дни × часы» с условным форматированием (цветовая шкала), и сразу видно, когда клиенты активнее всего.</p>`,
        hints: ["GROUP BY по двум выражениям: <code>extract(isodow from created_at)</code> и <code>extract(hour from created_at)</code>."], solution: "SELECT extract(isodow from created_at) AS weekday,\n       extract(hour from created_at) AS hour,\n       count(*) AS orders\nFROM orders\nGROUP BY 1, 2;" },
      { id: "rfm", title: "Сегменты клиентов по числу заказов", level: "средне", ordered: true, text: `<p>Раздели клиентов на группы по количеству доставленных заказов: «0 заказов», «1 заказ», «2–4 заказа», «5+ заказов». Для каждой группы выведи количество клиентов. Группы по порядку.</p>`,
        hints: ["Сначала посчитай заказы на клиента с LEFT JOIN (иначе потеряешь тех, у кого 0).", "Потом CASE по количеству и группировка. Для порядка сортируй по <code>min(cnt)</code>."], solution: "WITH c AS (\n  SELECT cu.customer_id, count(o.order_id) AS cnt\n  FROM customers cu\n  LEFT JOIN orders o ON o.customer_id = cu.customer_id AND o.status = 'доставлен'\n  GROUP BY cu.customer_id\n)\nSELECT CASE\n         WHEN cnt = 0 THEN '0 заказов'\n         WHEN cnt = 1 THEN '1 заказ'\n         WHEN cnt <= 4 THEN '2–4 заказа'\n         ELSE '5+ заказов'\n       END AS segment,\n       count(*) AS customers\nFROM c\nGROUP BY 1\nORDER BY min(cnt);" },
      { id: "catgrid", title: "Сетка месяц × категория с нулями", level: "посложнее", text: `<p>Выведи выручку доставленных заказов для каждой пары «месяц 2026 года × категория», включая пары с нулевой выручкой. Месяц, категория, выручка.</p>`,
        hints: ["Сетка: CROSS JOIN месяцев (generate_series с января по сентябрь 2026) и категорий (DISTINCT из products).", "Факт: выручка по месяцу и категории. LEFT JOIN по двум полям и coalesce."], solution: "WITH months AS (\n  SELECT generate_series('2026-01-01'::date, '2026-09-01'::date, interval '1 month')::date AS month\n), cats AS (\n  SELECT DISTINCT category FROM products\n), fact AS (\n  SELECT date_trunc('month', o.created_at)::date AS month, p.category, sum(oi.quantity * oi.price) AS revenue\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  JOIN products p ON p.product_id = oi.product_id\n  WHERE o.status = 'доставлен'\n  GROUP BY 1, 2\n)\nSELECT m.month, c.category, coalesce(f.revenue, 0) AS revenue\nFROM months m\nCROSS JOIN cats c\nLEFT JOIN fact f ON f.month = m.month AND f.category = c.category;" },
      { id: "chart", title: "График расходов и клиентов", manual: true, text: `<p>Выгрузи запрос про CAC по месяцам из теории (блок «Шкала времени без дыр»), построй в Excel комбинированную диаграмму: расходы столбиками по основной оси, новые клиенты линией по вспомогательной. Напиши под графиком один вывод: есть ли связь между расходами и притоком клиентов.</p>`,
        hints: ["Excel: выдели данные → «Вставка» → «Комбинированная диаграмма» → для ряда new_customers включи «Вспомогательная ось»."] }
    ]
  }
});

/* ===================== 12. ДИПЛОМ ===================== */
M.push({
  id: "m12", num: 12, week: 8, color: "peach", icon: "cap", time: "≈ 8–10 часов",
  short: "Дипломная работа", tag: "Итоговый проект", title: "Дипломная работа: отчёт для заказчика",
  desc: "Полноценная аналитическая задача: от брифа до Excel-отчёта с выводами. Проект для портфолио.",
  lead: "Пора собрать всё вместе. Владелица «Уютной лавки» готовит стратегию на 2027 год и просит аналитический отчёт. Твоя задача: составить запросы, выгрузить данные, подготовить их в Excel и сформулировать выводы.",
  goals: ["Разложить задачу заказчика на запросы", "Применить фильтры, группировку, JOIN, окна, CASE", "Собрать Excel-отчёт со сводными и графиками", "Сформулировать выводы и рекомендации"],
  theory: [
    { id: "brief", title: "Бриф от заказчика", html: `
<div class="life"><b>Марина, владелица «Уютной лавки»</b>
<p>Привет! Мы работаем почти два года, и я хочу понять, куда двигаться дальше. Мне нужен отчёт, по которому я смогу принять решения на 2027 год. Что хочу знать:</p>
<ol>
<li>Как в целом растёт магазин: выручка, заказы, средний чек, сколько покупателей. Сравни январь–сентябрь 2026 с тем же периодом 2025.</li>
<li>Как выручка меняется по месяцам, есть ли сезонность.</li>
<li>Какие категории и товары тянут нас вверх, а какие лучше убрать. Важна не только выручка, но и маржа.</li>
<li>Какие города самые важные и где много отмен.</li>
<li>Какой рекламный канал окупается лучше.</li>
<li>Насколько клиенты возвращаются за повторными покупками.</li>
</ol>
<p>Excel-файл с графиками и короткие выводы на одну страницу. Спасибо!</p></div>
<h4>Что сдаёшь в итоге</h4>
<div class="grid3">
<div class="tile lav"><h4>1. SQL-файл</h4><p><code>diploma.sql</code> со всеми запросами. Каждый подписан комментарием: на какой вопрос отвечает.</p></div>
<div class="tile mint"><h4>2. Excel-отчёт</h4><p>Лист на каждый раздел: данные, сводная, график. Первый лист «Дашборд» с ключевыми цифрами.</p></div>
<div class="tile sky"><h4>3. Выводы</h4><p>5–7 пунктов: что видно в данных и что ты рекомендуешь сделать. Можно на первом листе Excel.</p></div>
</div>` },
    { id: "plan", title: "План работы", html: `
<div class="tbl-wrap"><table class="t">
<tr><th>День</th><th>Что делаем</th><th>Задачи</th></tr>
<tr><td>1</td><td>Читаем бриф, уточняем термины (что считаем выручкой, какие заказы берём), смотрим на данные</td><td>этот блок</td></tr>
<tr><td>2–3</td><td>Пишем запросы для разделов 1–4</td><td>Д1–Д5</td></tr>
<tr><td>4</td><td>Запросы для разделов 5–6</td><td>Д6–Д8</td></tr>
<tr><td>5</td><td>Выгрузки и сводные в Excel</td><td>ДЗ: отчёт</td></tr>
<tr><td>6</td><td>Графики, дашборд</td><td>ДЗ: отчёт</td></tr>
<tr><td>7</td><td>Выводы, проверка, упаковка в портфолио</td><td>ДЗ: выводы и портфолио</td></tr>
</table></div>
<h4>Договорённости о метриках</h4>
<div class="tbl-wrap"><table class="t">
<tr><th>Метрика</th><th>Как считаем</th></tr>
<tr><td>Выручка</td><td><code>sum(oi.quantity * oi.price)</code> по <b>доставленным</b> заказам</td></tr>
<tr><td>Заказы</td><td>количество доставленных заказов</td></tr>
<tr><td>Средний чек</td><td>выручка / заказы</td></tr>
<tr><td>Покупатели</td><td>количество разных клиентов с доставленными заказами</td></tr>
<tr><td>Валовая прибыль (маржа)</td><td><code>sum(oi.quantity * (oi.price - p.cost))</code></td></tr>
<tr><td>Доля отмен</td><td>отменённые заказы / все заказы, кроме «новых» и «в пути»</td></tr>
<tr><td>CAC</td><td>расходы на канал / клиенты, пришедшие из канала</td></tr>
<tr><td>Повторные покупатели</td><td>клиенты с 2 и более доставленными заказами / все покупатели</td></tr>
</table></div>
<div class="tip">Запиши эти договорённости на первый лист Excel. Заказчик должен понимать, что именно ты посчитал(а). В реальной работе этот шаг экономит часы споров.</div>` },
    { id: "style", title: "Как оформить запросы", html: `
<p>Твой SQL-файл будут читать другие люди, и ты сам(а) через полгода. Хороший запрос читается как текст.</p>
<pre class="sql norun">-- ============================================
-- Раздел 3. Категории: выручка, маржа, доля
-- Период: январь–сентябрь 2026, доставленные заказы
-- ============================================
WITH lines AS (                      -- строки доставленных заказов 2026 года
  SELECT p.category,
         oi.quantity * oi.price            AS revenue,
         oi.quantity * (oi.price - p.cost) AS margin
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  JOIN products p     ON p.product_id = oi.product_id
  WHERE o.status = 'доставлен'
    AND o.created_at >= '2026-01-01'
    AND o.created_at <  '2026-10-01'
)
SELECT category,
       sum(revenue) AS revenue,
       sum(margin)  AS margin
FROM lines
GROUP BY category
ORDER BY revenue DESC;</pre>
<ul>
<li>Шапка-комментарий: раздел, период, какие заказы.</li>
<li>Сложные расчёты разбиты на шаги через WITH с понятными именами.</li>
<li>Ключевые слова заглавными, каждый столбец на своей строке.</li>
<li>Выравнивание (DBeaver: <span class="kbd">Ctrl</span>+<span class="kbd">Shift</span>+<span class="kbd">F</span>).</li>
</ul>` },
    { id: "check", title: "Критерии проверки и самопроверка", html: `
<div class="tbl-wrap"><table class="t">
<tr><th>Критерий</th><th>Что проверить</th></tr>
<tr><td>Корректность</td><td>Все задачи Д1–Д8 проходят проверку на сайте. Итоги сходятся между разделами (сумма по категориям = общая выручка за тот же период).</td></tr>
<tr><td>Полнота</td><td>Есть ответ на все 6 вопросов брифа.</td></tr>
<tr><td>Читаемость SQL</td><td>Комментарии, WITH, форматирование.</td></tr>
<tr><td>Excel</td><td>Сводные таблицы, а не вбитые руками цифры. На каждый раздел минимум один график. Подписи осей и заголовки.</td></tr>
<tr><td>Выводы</td><td>Конкретные, с цифрами: «Свечи дают 18% выручки и 25% прибыли, расширяем ассортимент», а не «свечи продаются хорошо».</td></tr>
</table></div>
<h4>Как сформулировать вывод</h4>
<div class="flow"><span>Факт с цифрой</span><i>→</i><span>Что это значит для бизнеса</span><i>→</i><span>Что предлагаешь сделать</span></div>
<p>Например: «В ноябре–декабре выручка в 2 раза выше среднего (факт). Сезон подарков даёт треть годовой выручки (значение). Предлагаю закупить свечи и пледы к октябрю и запустить предзаказ новогодних наборов (действие)».</p>
<div class="tip"><b>Для портфолио</b>Готовый проект положи в папку: SQL-файл, Excel, одна страница выводов. Можно загрузить на GitHub или Google Диск и дать ссылку в резюме: «Учебный проект: анализ продаж интернет-магазина, PostgreSQL + Excel». На собеседовании такой проект можно разобрать вместе с интервьюером.</div>` }
  ],
  practice: {
    intro: `<p>Задачи Д1–Д8 это запросы для отчёта. Каждый проверяется автоматически. Подсказки здесь короче: ты уже всё это умеешь, а решения можно открыть после подсказок. Сохраняй каждый запрос в свой файл <code>diploma.sql</code>.</p>`,
    tasks: [
      { id: "d1", title: "Д1. Ключевые цифры 2026 против 2025", ordered: true, text: `<p>Для двух периодов, январь–сентябрь 2025 и январь–сентябрь 2026, посчитай: выручку, количество заказов, средний чек (округли до рубля) и количество покупателей. Столбцы: год, выручка, заказы, средний чек, покупатели. Строки по годам.</p>`,
        hints: ["Условие: месяц заказа с 1 по 9, <code>extract(month from o.created_at) &lt;= 9</code>, и доставленные.", "Группировка по году. Заказы: <code>count(DISTINCT o.order_id)</code> (после JOIN с order_items строки размножились!), покупатели: <code>count(DISTINCT o.customer_id)</code>."],
        solution: "SELECT extract(year from o.created_at) AS year,\n       sum(oi.quantity * oi.price) AS revenue,\n       count(DISTINCT o.order_id) AS orders,\n       round(sum(oi.quantity * oi.price) / count(DISTINCT o.order_id)) AS avg_check,\n       count(DISTINCT o.customer_id) AS buyers\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nWHERE o.status = 'доставлен'\n  AND extract(month from o.created_at) <= 9\nGROUP BY 1\nORDER BY 1;" },
      { id: "d2", title: "Д2. Выручка по месяцам и рост", ordered: true, text: `<p>Выручка по месяцам за всё время, выручка предыдущего месяца и рост в процентах к предыдущему месяцу (1 знак). Месяц, выручка, прошлый месяц, рост %.</p>`,
        hints: ["CTE с выручкой по месяцам, затем lag.", "Рост: <code>round(100.0 * (revenue - prev) / prev, 1)</code>. Для первого месяца будет NULL, это нормально."],
        solution: "WITH m AS (\n  SELECT date_trunc('month', o.created_at)::date AS month,\n         sum(oi.quantity * oi.price) AS revenue\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status = 'доставлен'\n  GROUP BY 1\n), l AS (\n  SELECT month, revenue, lag(revenue) OVER (ORDER BY month) AS prev\n  FROM m\n)\nSELECT month, revenue, prev, round(100.0 * (revenue - prev) / prev, 1) AS growth_pct\nFROM l\nORDER BY month;" },
      { id: "d3", title: "Д3. Категории: выручка, прибыль, доли", ordered: true, text: `<p>За январь–сентябрь 2026 по категориям: выручка, валовая прибыль, доля в выручке % и доля в прибыли % (1 знак). Сортировка по выручке по убыванию.</p>`,
        hints: ["Прибыль: <code>sum(oi.quantity * (oi.price - p.cost))</code>.", "Доли через окно: <code>100.0 * sum(…) / sum(sum(…)) OVER ()</code>."],
        solution: "SELECT p.category,\n       sum(oi.quantity * oi.price) AS revenue,\n       sum(oi.quantity * (oi.price - p.cost)) AS margin,\n       round(100.0 * sum(oi.quantity * oi.price) / sum(sum(oi.quantity * oi.price)) OVER (), 1) AS revenue_share,\n       round(100.0 * sum(oi.quantity * (oi.price - p.cost)) / sum(sum(oi.quantity * (oi.price - p.cost))) OVER (), 1) AS margin_share\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nJOIN products p ON p.product_id = oi.product_id\nWHERE o.status = 'доставлен'\n  AND o.created_at >= '2026-01-01' AND o.created_at < '2026-10-01'\nGROUP BY p.category\nORDER BY revenue DESC;" },
      { id: "d4", title: "Д4. Топ-10 и антитоп-5 товаров", ordered: true, text: `<p>За январь–сентябрь 2026 выведи 10 товаров с наибольшей выручкой: название, категория, проданные штуки, выручка, место в рейтинге (rank). При равной выручке сортируй по названию. Отдельно для себя посмотри 5 товаров с наименьшей выручкой (проверяется только топ-10).</p>`,
        hints: ["Выручка по товарам с группировкой по p.product_id, p.name, p.category.", "<code>rank() OVER (ORDER BY sum(oi.quantity * oi.price) DESC)</code>, ORDER BY по выручке, LIMIT 10."],
        solution: "SELECT p.name, p.category,\n       sum(oi.quantity) AS qty,\n       sum(oi.quantity * oi.price) AS revenue,\n       rank() OVER (ORDER BY sum(oi.quantity * oi.price) DESC) AS place\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nJOIN products p ON p.product_id = oi.product_id\nWHERE o.status = 'доставлен'\n  AND o.created_at >= '2026-01-01' AND o.created_at < '2026-10-01'\nGROUP BY p.product_id, p.name, p.category\nORDER BY revenue DESC, p.name\nLIMIT 10;" },
      { id: "d5", title: "Д5. Города", ordered: true, text: `<p>По городам доставки за всё время: всего завершённых заказов (доставлен + отменён), доставленных, доля отмен % (1 знак), выручка и средний чек (до рубля). Сортировка по выручке по убыванию.</p>`,
        hints: ["Удобно сначала посчитать сумму каждого заказа в CTE, потом LEFT JOIN к orders (у отменённых сумма тоже есть, но в выручку их не берём).", "Выручка: <code>sum(CASE WHEN status = 'доставлен' THEN total END)</code>. Средний чек: <code>avg(CASE WHEN status = 'доставлен' THEN total END)</code>."],
        solution: "WITH t AS (\n  SELECT order_id, sum(quantity * price) AS total\n  FROM order_items\n  GROUP BY order_id\n)\nSELECT o.delivery_city,\n       count(*) AS finished,\n       count(*) FILTER (WHERE o.status = 'доставлен') AS delivered,\n       round(100.0 * count(*) FILTER (WHERE o.status = 'отменён') / count(*), 1) AS cancel_pct,\n       sum(CASE WHEN o.status = 'доставлен' THEN t.total END) AS revenue,\n       round(avg(CASE WHEN o.status = 'доставлен' THEN t.total END)) AS avg_check\nFROM orders o\nJOIN t ON t.order_id = o.order_id\nWHERE o.status IN ('доставлен', 'отменён')\nGROUP BY o.delivery_city\nORDER BY revenue DESC;" },
      { id: "d6", title: "Д6. Окупаемость каналов", ordered: true, text: `<p>По каналам instagram, telegram, vk за всё время: расходы, привлечённые клиенты, CAC (до рубля), выручка от этих клиентов (доставленные заказы) и ROMI в процентах: <code>(выручка − расходы) / расходы × 100</code>, 1 знак. Сортировка по ROMI по убыванию.</p>`,
        hints: ["Три CTE: расходы по каналу, клиенты по source, выручка по source (customers → orders → order_items).", "Соедини их по каналу. ROMI: <code>round(100.0 * (revenue - spend) / spend, 1)</code>."],
        solution: "WITH s AS (\n  SELECT channel, sum(spend) AS spend FROM ad_spend GROUP BY channel\n), c AS (\n  SELECT source, count(*) AS clients FROM customers GROUP BY source\n), r AS (\n  SELECT cu.source, sum(oi.quantity * oi.price) AS revenue\n  FROM customers cu\n  JOIN orders o ON o.customer_id = cu.customer_id\n  JOIN order_items oi ON oi.order_id = o.order_id\n  WHERE o.status = 'доставлен'\n  GROUP BY cu.source\n)\nSELECT s.channel, s.spend, c.clients,\n       round(s.spend / c.clients) AS cac,\n       r.revenue,\n       round(100.0 * (r.revenue - s.spend) / s.spend, 1) AS romi_pct\nFROM s\nJOIN c ON c.source = s.channel\nJOIN r ON r.source = s.channel\nORDER BY romi_pct DESC;" },
      { id: "d7", title: "Д7. Повторные покупки", text: `<p>Одной строкой: сколько всего покупателей (хотя бы 1 доставленный заказ), сколько из них повторных (2+ доставленных заказа), доля повторных % (1 знак) и средний интервал между заказами повторных покупателей в днях (до целого).</p>`,
        hints: ["CTE 1: доставленные заказы с интервалом до предыдущего заказа клиента через lag.", "CTE 2: по клиенту количество заказов и средний интервал. Итог: count(*), count(*) FILTER (WHERE cnt >= 2), доля, round(avg(avg_gap))."],
        solution: "WITH o AS (\n  SELECT customer_id,\n         created_at::date - lag(created_at::date) OVER (PARTITION BY customer_id ORDER BY created_at) AS gap\n  FROM orders\n  WHERE status = 'доставлен'\n), c AS (\n  SELECT customer_id, count(*) AS cnt, avg(gap) AS avg_gap\n  FROM o\n  GROUP BY customer_id\n)\nSELECT count(*) AS buyers,\n       count(*) FILTER (WHERE cnt >= 2) AS repeat_buyers,\n       round(100.0 * count(*) FILTER (WHERE cnt >= 2) / count(*), 1) AS repeat_pct,\n       round(avg(avg_gap)) AS avg_gap_days\nFROM c;" },
      { id: "d8", title: "Д8. Плоская выгрузка для Excel", text: `<p>Подготовь основную выгрузку для сводных: месяц, категория, город доставки, источник клиента (NULL замени на «неизвестно»), заказы (distinct), штуки, выручка, прибыль. Только доставленные заказы, всё время.</p>`,
        hints: ["JOIN четырёх таблиц: orders, order_items, products, customers.", "GROUP BY 1, 2, 3, 4. Источник: <code>coalesce(c.source, 'неизвестно')</code>."],
        solution: "SELECT date_trunc('month', o.created_at)::date AS month,\n       p.category,\n       o.delivery_city AS city,\n       coalesce(c.source, 'неизвестно') AS source,\n       count(DISTINCT o.order_id) AS orders,\n       sum(oi.quantity) AS qty,\n       sum(oi.quantity * oi.price) AS revenue,\n       sum(oi.quantity * (oi.price - p.cost)) AS margin\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.order_id\nJOIN products p ON p.product_id = oi.product_id\nJOIN customers c ON c.customer_id = o.customer_id\nWHERE o.status = 'доставлен'\nGROUP BY 1, 2, 3, 4;" }
    ]
  },
  homework: {
    intro: `<p>Финальная часть диплома делается в Excel. Отметь каждый пункт, когда закончишь.</p>`,
    tasks: [
      { id: "excel", title: "Excel-отчёт", manual: true, text: `<p>Выгрузи результаты Д1–Д8 в один Excel-файл, каждый на свой лист. Затем:</p><ul><li>на листе с Д8 построй сводные: выручка по месяцам и категориям, выручка по городам, по источникам;</li><li>графики: динамика выручки по месяцам (линия), категории (горизонтальные столбцы), каналы (выручка и расходы рядом), повторные покупатели (одна большая цифра);</li><li>подпиши оси, дай графикам заголовки, отформатируй числа с разделителями разрядов.</li></ul>`,
        hints: ["Сводные строй по Д8, это одна «плоская» таблица на всё.", "Для динамики удобно добавить срез по категории."] },
      { id: "dash", title: "Лист «Дашборд»", manual: true, text: `<p>Первым листом сделай дашборд: 4 ключевые цифры из Д1 (2026 и рост к 2025 в %), 2–3 главных графика и блок «Договорённости о метриках». На него руководитель посмотрит в первую очередь.</p>`,
        hints: ["Ключевые цифры удобно оформить крупным шрифтом в объединённых ячейках, рост подсветить зелёным или красным через условное форматирование."] },
      { id: "insights", title: "Выводы и рекомендации", manual: true, text: `<p>Напиши 5–7 выводов по схеме «факт с цифрой → что это значит → что делать». Обязательно затронь: сезонность, лучшие и худшие категории по прибыли, проблемные города по отменам, самый окупаемый канал, повторные покупки.</p>`,
        hints: ["Смотри не только на выручку: категория с меньшей выручкой может давать больше прибыли.", "Сравни CAC каналов со средним чеком: окупается ли клиент с первого заказа?"] },
      { id: "portfolio", title: "Упаковка в портфолио", manual: true, text: `<p>Собери папку проекта: <code>diploma.sql</code>, Excel-отчёт и выводы. Загрузи на GitHub или Google Диск, добавь ссылку в резюме. Поздравляю, курс пройден! 🎓</p>`,
        hints: ["На GitHub добавь README: задача, данные, что сделано, главные выводы, скриншот дашборда."] }
    ]
  }
});
})();
