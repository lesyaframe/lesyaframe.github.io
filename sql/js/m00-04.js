(function () {
const M = window.COURSE.modules;
const from = (who, text) => `<span class="from"><b>${who}</b>${text}</span>`;
const MARINA = "Марина, владелица «Уютной лавки»";
const DIMA = "Дима, маркетолог";
const OLYA = "Оля, финансы";
const SERGEY = "Сергей, склад";

/* ===================== 0. ПОДГОТОВКА ===================== */
M.push({
  id: "m0", num: 0, week: 1, color: "peach", icon: "tool", time: "≈ 1,5 часа",
  short: "Подготовка", tag: "Перед стартом", title: "Что установить и как всё устроено",
  desc: "Ставим PostgreSQL и DBeaver, загружаем учебную базу и знакомимся с магазином, на данных которого будем учиться.",
  lead: "Перед первым запросом нужно подготовить рабочее место. Это займёт около часа. Если сейчас нет возможности что-то ставить, все задачи курса можно решать в песочнице прямо на сайте, а установку сделать позже.",
  goals: ["Установить PostgreSQL и DBeaver", "Загрузить учебную базу «Уютная лавка»", "Понять, какие таблицы есть в базе"],
  video: [{ id: "Zeh-Icitlrg", title: "Установка PostgreSQL, создание схемы и таблицы, импорт CSV", author: "Товарищ Excel", len: "16 мин", note: "Установка показана на Windows. Смотри до момента импорта CSV, остальное пригодится в модуле 9." }],
  videoNote: "Видео дублирует текстовую инструкцию ниже. Удобно смотреть и повторять шаги параллельно.",
  theory: [
    { id: "what", title: "Что понадобится", html: `
<p>Для работы аналитика с SQL нужны три вещи: сама база данных, программа, в которой пишутся запросы, и таблицы (Excel или аналог), куда потом выгружаются результаты.</p>
<div class="tbl-wrap"><table class="t">
<tr><th>Программа</th><th>Зачем</th><th>Цена</th><th>Где взять</th></tr>
<tr><td><b>PostgreSQL</b></td><td>Сама база данных. Хранит таблицы и выполняет запросы. Работает «невидимо», как служба на компьютере.</td><td>бесплатно</td><td><a href="https://postgrespro.ru/windows" target="_blank" rel="noopener">postgrespro.ru/windows</a> (Windows)<br><a href="https://postgresapp.com/" target="_blank" rel="noopener">postgresapp.com</a> (Mac)</td></tr>
<tr><td><b>DBeaver Community</b></td><td>Окно, где пишешь запросы и видишь результат таблицей. Умеет выгружать данные в Excel и CSV.</td><td>бесплатно</td><td><a href="https://dbeaver.io/download/" target="_blank" rel="noopener">dbeaver.io/download</a></td></tr>
<tr><td><b>Excel</b></td><td>Сводные таблицы и графики в модулях 11–12.</td><td>платно</td><td>Подойдут бесплатные <a href="https://ru.libreoffice.org/download/" target="_blank" rel="noopener">LibreOffice Calc</a>, Google Таблицы или Яндекс Таблицы</td></tr>
<tr><td><b>Браузер</b></td><td>Песочница курса: PostgreSQL прямо на этом сайте, без установки.</td><td>бесплатно</td><td><a href="#/sandbox">Песочница</a></td></tr>
</table></div>
<div class="note"><b>Почему именно PostgreSQL</b>Это самая популярная бесплатная база в России и в мире. Её используют банки, маркетплейсы, онлайн-школы. Если выучишь SQL на PostgreSQL, на MySQL, ClickHouse или MS SQL переключишься за пару дней: основа у всех одна, отличаются отдельные функции.</div>
<div class="tip"><b>Можно начать без установки</b>Все задачи на сайте проверяются в браузере. Установка нужна, чтобы привыкнуть к настоящему рабочему инструменту: в компании ты будешь работать именно в DBeaver или похожей программе.</div>` },
    { id: "pg", title: "Устанавливаем PostgreSQL", html: `
<div class="grid2">
<div class="tile sky"><h4>Windows</h4>
<ol class="steps">
<li>Открой <a href="https://postgrespro.ru/windows" target="_blank" rel="noopener">postgrespro.ru/windows</a> и скачай последнюю версию PostgreSQL (64-bit). Это та же бесплатная PostgreSQL, собранная российской компанией Postgres Professional. Альтернатива: официальный установщик на <a href="https://www.postgresql.org/download/windows/" target="_blank" rel="noopener">postgresql.org</a>.</li>
<li>Запусти установщик, на всех шагах жми «Далее».</li>
<li>На шаге с паролем придумай пароль для пользователя <code>postgres</code> и <b>запиши его</b>. Без него не подключишься.</li>
<li>Порт оставь <code>5432</code>, локаль по умолчанию.</li>
<li>В конце установщик может предложить Stack Builder. Его можно закрыть, он не нужен.</li>
</ol></div>
<div class="tile lav"><h4>macOS</h4>
<ol class="steps">
<li>Скачай <a href="https://postgresapp.com/downloads.html" target="_blank" rel="noopener">Postgres.app</a> и перетащи его в «Программы».</li>
<li>Открой приложение и нажми <b>Initialize</b>. Появится сервер со статусом Running.</li>
<li>Пользователь по умолчанию совпадает с именем пользователя Mac, пароль пустой. Можно подключаться и пользователем <code>postgres</code>.</li>
<li>Чтобы сервер стартовал сам, в настройках Postgres.app включи «Automatically start at login».</li>
</ol></div>
</div>
<div class="warn"><b>Проверь, что сервер работает</b>На Windows: «Пуск» → «Службы» → служба <code>postgresql-x64-…</code> должна быть в состоянии «Выполняется». На Mac: в окне Postgres.app зелёная галочка.</div>` },
    { id: "dbeaver", title: "Устанавливаем DBeaver и подключаемся", html: `
<ol class="steps">
<li>Скачай <b>DBeaver Community</b> с <a href="https://dbeaver.io/download/" target="_blank" rel="noopener">dbeaver.io/download</a> для своей системы и установи.</li>
<li>Открой DBeaver. Слева панель «Навигатор баз данных». Нажми на значок вилки с плюсом <b>«Новое соединение»</b> (или <span class="kbd">Ctrl</span>+<span class="kbd">Shift</span>+<span class="kbd">N</span>).</li>
<li>Выбери <b>PostgreSQL</b> → «Далее».</li>
<li>Заполни: Host <code>localhost</code>, Port <code>5432</code>, Database <code>postgres</code>, Username <code>postgres</code>, Password: тот, что записал(а) при установке.</li>
<li>Нажми <b>«Тест соединения»</b>. DBeaver предложит скачать драйвер, соглашайся. Должно появиться «Connected».</li>
<li>«Готово». Слева появится подключение <code>postgres</code>.</li>
</ol>
<div class="tbl-wrap"><table class="t">
<tr><th>Что сделать в DBeaver</th><th>Как</th></tr>
<tr><td>Открыть окно для запросов</td><td>Выдели подключение → <span class="kbd">F3</span> или «SQL редактор» → «Открыть SQL скрипт»</td></tr>
<tr><td>Выполнить один запрос (под курсором)</td><td><span class="kbd">Ctrl</span>+<span class="kbd">Enter</span></td></tr>
<tr><td>Выполнить весь скрипт</td><td><span class="kbd">Alt</span>+<span class="kbd">X</span></td></tr>
<tr><td>Отформатировать запрос красиво</td><td><span class="kbd">Ctrl</span>+<span class="kbd">Shift</span>+<span class="kbd">F</span></td></tr>
<tr><td>Подсказка названий таблиц и столбцов</td><td><span class="kbd">Ctrl</span>+<span class="kbd">Space</span></td></tr>
<tr><td>Выгрузить результат</td><td>Правой кнопкой по результату → «Экспорт данных»</td></tr>
</table></div>
<div class="tip">На Mac вместо <span class="kbd">Ctrl</span> нажимай <span class="kbd">Cmd</span>.</div>` },
    { id: "load", title: "Загружаем учебную базу", html: `
<p>Весь курс построен на одной базе: интернет-магазин кофе, чая и уютных вещей для дома <b>«Уютная лавка»</b>. Данные выдуманы, но устроены как в настоящем магазине: клиенты, заказы, товары, промокоды, отмены, реклама.</p>
<ol class="steps">
<li>Скачай файл базы: <a class="btn small" href="data/shop.sql" download>⬇ shop.sql</a></li>
<li>В DBeaver нажми правой кнопкой на подключение → «Создать» → «База данных». Назови её <code>shop</code>, кодировка UTF8 → OK.</li>
<li>Выдели новую базу <code>shop</code> в навигаторе и открой SQL редактор (<span class="kbd">F3</span>). Проверь сверху окна, что выбрана именно <code>shop</code>.</li>
<li>Открой файл: «Файл» → «Открыть файл» → <code>shop.sql</code>. Или просто перетащи файл в окно редактора, скопируй всё и вставь в свой скрипт.</li>
<li>Выполни весь скрипт: <span class="kbd">Alt</span>+<span class="kbd">X</span>. Займёт пару секунд.</li>
<li>Нажми <span class="kbd">F5</span> на базе <code>shop</code> в навигаторе. В «Схемы → public → Таблицы» появятся 6 таблиц.</li>
</ol>
<p>Проверочный запрос. Выполни его в DBeaver, а потом нажми «Запустить» здесь: цифры должны совпасть.</p>
<pre class="sql">SELECT
  (SELECT count(*) FROM customers) AS customers,
  (SELECT count(*) FROM orders) AS orders,
  (SELECT count(*) FROM products) AS products;</pre>
<div class="note">Должно получиться 80 клиентов, 514 заказов и 32 товара.</div>` },
    { id: "shop", title: "Знакомимся с «Уютной лавкой»", html: `
<p>Магазин работает с января 2025 года. Клиенты регистрируются на сайте, оформляют заказы, заказ состоит из нескольких товаров. Вот как связаны таблицы:</p>
<svg class="diag" viewBox="0 0 860 330" font-family="Manrope, sans-serif" font-size="13">
  <defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#6b6d78"/></marker></defs>
  <g><rect x="10" y="20" width="200" height="200" rx="18" fill="#ddd5f6"/><text x="26" y="48" font-weight="800" font-size="15">customers</text>
  <text x="26" y="74">🔑 customer_id</text><text x="26" y="96">first_name, last_name</text><text x="26" y="118">email, phone</text><text x="26" y="140">city, birth_date</text><text x="26" y="162">registered_at</text><text x="26" y="184">source</text></g>
  <g><rect x="300" y="20" width="220" height="200" rx="18" fill="#d5e9e1"/><text x="316" y="48" font-weight="800" font-size="15">orders</text>
  <text x="316" y="74">🔑 order_id</text><text x="316" y="96">customer_id →</text><text x="316" y="118">created_at</text><text x="316" y="140">status</text><text x="316" y="162">delivered_at</text><text x="316" y="184">promo_code, delivery_city</text></g>
  <g><rect x="610" y="20" width="230" height="130" rx="18" fill="#dce6f6"/><text x="626" y="48" font-weight="800" font-size="15">order_items</text>
  <text x="626" y="74">🔑 order_id →</text><text x="626" y="96">🔑 product_id →</text><text x="626" y="118">quantity, price</text></g>
  <g><rect x="610" y="180" width="230" height="140" rx="18" fill="#e8f3cf"/><text x="626" y="208" font-weight="800" font-size="15">products</text>
  <text x="626" y="234">🔑 product_id</text><text x="626" y="256">name, category</text><text x="626" y="278">price, cost</text><text x="626" y="300">added_at</text></g>
  <g><rect x="10" y="240" width="200" height="80" rx="18" fill="#f8e3d6"/><text x="26" y="268" font-weight="800" font-size="15">subscribers</text><text x="26" y="294">email, subscribed_at</text></g>
  <g><rect x="300" y="240" width="220" height="80" rx="18" fill="#f1f0f6"/><text x="316" y="268" font-weight="800" font-size="15">ad_spend</text><text x="316" y="294">month, channel, spend</text></g>
  <path d="M300 92 H 214" stroke="#6b6d78" stroke-width="2" fill="none" marker-end="url(#ar)"/>
  <path d="M610 70 H 524" stroke="#6b6d78" stroke-width="2" fill="none" marker-end="url(#ar)"/>
  <path d="M760 152 V 176" stroke="#6b6d78" stroke-width="2" fill="none" marker-end="url(#ar)"/>
  <path d="M110 238 V 224" stroke="#b6b3c4" stroke-width="2" stroke-dasharray="5 4" fill="none"/>
</svg>
<div class="tbl-wrap"><table class="t">
<tr><th>Таблица</th><th>Что внутри</th><th>Одна строка это…</th></tr>
<tr><td><code>customers</code></td><td>Клиенты магазина, 80 человек</td><td>один клиент</td></tr>
<tr><td><code>orders</code></td><td>Заказы с января 2025 по сентябрь 2026</td><td>один заказ (чек)</td></tr>
<tr><td><code>order_items</code></td><td>Из каких товаров состоит заказ</td><td>один товар в одном заказе</td></tr>
<tr><td><code>products</code></td><td>Каталог: 32 товара в 6 категориях</td><td>один товар</td></tr>
<tr><td><code>subscribers</code></td><td>Подписчики email-рассылки (не все из них покупатели)</td><td>одна почта</td></tr>
<tr><td><code>ad_spend</code></td><td>Сколько потратили на рекламу по месяцам и каналам</td><td>месяц + канал</td></tr>
</table></div>
<div class="life"><b>Где здесь «жизнь»</b>Как в реальных данных, тут есть неидеальности: у части клиентов нет телефона, телефоны записаны в разных форматах, некоторые почты написаны капсом и с пробелами, есть отменённые заказы и клиенты без покупок. Учиться на них полезнее, чем на стерильных примерах.</div>
<div class="note"><b>Важная деталь про цены</b>В <code>products.price</code> лежит текущая цена товара. А в <code>order_items.price</code> цена в момент покупки. С 2026 года кофе подорожал, поэтому для расчёта выручки всегда бери цену из <code>order_items</code>.</div>` },
    { id: "trouble", title: "Если что-то не получилось", html: `
<div class="tbl-wrap"><table class="t">
<tr><th>Что видишь</th><th>Что делать</th></tr>
<tr><td><code>Connection refused</code></td><td>Сервер PostgreSQL не запущен. Windows: «Службы» → запусти службу postgresql. Mac: открой Postgres.app и нажми Start.</td></tr>
<tr><td><code>password authentication failed</code></td><td>Неверный пароль. Если забыл(а), проще всего переустановить PostgreSQL и в этот раз записать пароль.</td></tr>
<tr><td>DBeaver не может скачать драйвер</td><td>Проверь интернет или включи/выключи VPN. Драйвер нужен только при первом подключении.</td></tr>
<tr><td><code>relation "orders" does not exist</code></td><td>Запрос выполняется не в той базе. Сверху над редактором выбери базу <code>shop</code>.</td></tr>
<tr><td>Скрипт выполнился с ошибкой на середине</td><td>Выполни его ещё раз целиком через <span class="kbd">Alt</span>+<span class="kbd">X</span>: в начале файла стоит удаление старых таблиц, так что повторный запуск безопасен.</td></tr>
<tr><td>Ничего не помогает</td><td>Работай в песочнице на сайте, а установкой займись позже. На курс это не повлияет.</td></tr>
</table></div>` }
  ],
  practice: {
    intro: `<p>Первая задача проверяется автоматически. Напиши запрос в окне, нажми «Запустить», чтобы увидеть результат, и «Проверить», чтобы сравнить с правильным ответом. Если не знаешь, с чего начать, открывай подсказки: они появляются по одной.</p>`,
    tasks: [
      { id: "first", title: "Первый запрос", text: `<p>Выведи всё содержимое таблицы товаров <code>products</code>. Просто скопируй запрос ниже в окно и запусти:</p><pre class="sql norun">SELECT * FROM products;</pre>`,
        hints: ["Звёздочка <code>*</code> значит «все столбцы». После FROM пишется название таблицы."], solution: "SELECT * FROM products;", after: "Ты только что написал(а) первый SQL-запрос." },
      { id: "dbeaver", title: "То же самое в DBeaver", manual: true, text: `<p>Открой DBeaver, выбери базу <code>shop</code> и выполни там <code>SELECT * FROM customers;</code>. Должно получиться 80 строк. Отметь задачу сделанной, когда увидишь результат.</p>`,
        hints: ["Число строк DBeaver показывает внизу окна результата. По умолчанию он подгружает первые 200 строк."] }
    ]
  },
  homework: {
    intro: `<p>Домашка подготовительного модуля: убедиться, что рабочее место готово.</p>`,
    tasks: [
      { id: "setup", title: "Рабочее место готово", manual: true, text: `<ul><li>PostgreSQL установлен и запущен.</li><li>В DBeaver есть подключение и база <code>shop</code> с шестью таблицами.</li><li>Проверочный запрос из блока «Загружаем учебную базу» показывает 80, 514 и 30.</li><li>Ты попробовал(а) сочетания <span class="kbd">Ctrl</span>+<span class="kbd">Enter</span> и <span class="kbd">Ctrl</span>+<span class="kbd">Shift</span>+<span class="kbd">F</span>.</li></ul>`,
        hints: ["Если что-то не выходит, загляни в блок «Если что-то не получилось» в теории."] },
      { id: "explore", title: "Погуляй по базе", manual: true, text: `<p>В DBeaver дважды кликни на каждую таблицу и открой вкладку «Данные». Просто посмотри глазами: какие там значения, где пусто, как записаны даты. Аналитик всегда начинает с того, что смотрит на сырые данные.</p>`, hints: [] }
    ]
  }
});

/* ===================== 1. АНАЛИЗ ДАННЫХ И SQL ===================== */
M.push({
  id: "m1", num: 1, week: 1, color: "lav", icon: "db", time: "≈ 3 часа",
  short: "Анализ данных и SQL", tag: "Основы", title: "Анализ данных и SQL",
  desc: "Как SQL помогает решать задачи бизнеса. Устройство базы данных и первые запросы с SELECT.",
  lead: "Разбираемся, чем занимается аналитик, где хранятся данные компании и как с ними разговаривать на SQL. В конце модуля ты сама или сам достанешь из базы первые данные.",
  goals: ["Понимать, какие задачи решает аналитик", "Знать, что такое таблица, строка, ключ", "Писать запросы SELECT … FROM … LIMIT"],
  video: [
    { id: "uGKIXTUjZbc", title: "Базы данных и SQL", author: "Andrey Sozykin", len: "9 мин" },
    { id: "Zf8M3xJaMEc", title: "SQL для начинающих. Всё, что нужно знать в SQL для аналитики", author: "Noukash", len: "16 мин", note: "Обзор всего, что ждёт в курсе. Не страшно, если сейчас понятно не всё." }
  ],
  theory: [
    { id: "analyst", title: "Чем занимается аналитик и зачем ему SQL", html: `
<p>Аналитик отвечает на вопросы бизнеса цифрами. Владелица магазина спрашивает «почему в августе упала выручка?», маркетолог «какой канал рекламы приводит клиентов дешевле?», финансист «сколько мы потеряли на отменах?». Ответы лежат в данных, а данные в базе.</p>
<div class="flow"><span>Вопрос бизнеса</span><i>→</i><span>SQL-запрос к базе</span><i>→</i><span>Таблица с цифрами</span><i>→</i><span>Excel: сводная, график</span><i>→</i><span>Вывод и решение</span></div>
<p>SQL (Structured Query Language, язык структурированных запросов) нужен на втором шаге. Это язык, на котором ты просишь базу: «покажи мне вот это, вот так посчитай и вот так отсортируй».</p>
<div class="tbl-wrap"><table class="t">
<tr><th>Вопрос</th><th>Что делает аналитик в SQL</th><th>Модуль</th></tr>
<tr><td>Какие товары самые дорогие?</td><td>Выбирает и сортирует</td><td>2–4</td></tr>
<tr><td>Сколько заказов было в декабре?</td><td>Фильтрует по дате и считает</td><td>5–7</td></tr>
<tr><td>Какой средний чек у клиентов из Москвы?</td><td>Объединяет таблицы, группирует</td><td>7–8</td></tr>
<tr><td>Как менялась выручка по месяцам и на сколько выросла?</td><td>Оконные функции</td><td>10</td></tr>
<tr><td>Отчёт для руководителя в Excel</td><td>Готовит выгрузку</td><td>11–12</td></tr>
</table></div>
<div class="life"><b>Как это выглядит в работе</b>Утром приходит сообщение: «Дай, пожалуйста, топ-10 товаров за сентябрь по выручке». Ты пишешь запрос на 6–8 строк, выгружаешь результат в Excel, отправляешь. Вся задача занимает 10 минут. К концу курса такие просьбы будут для тебя рутиной.</div>` },
    { id: "db", title: "Что такое база данных", html: `
<p>Реляционная база данных это набор таблиц, связанных между собой. Похоже на книгу Excel с несколькими листами, только строже: у каждого столбца свой тип данных, и таблицы связаны через специальные столбцы-ключи.</p>
<div class="grid3">
<div class="tile lav"><h4>Таблица</h4><p>Набор однотипных объектов: клиенты, заказы, товары.</p></div>
<div class="tile mint"><h4>Строка (запись)</h4><p>Один объект: один клиент, один заказ.</p></div>
<div class="tile sky"><h4>Столбец (поле)</h4><p>Одно свойство объекта: город, цена, дата. У каждого столбца свой тип.</p></div>
</div>
<p>Вот кусочек таблицы <code>orders</code>:</p>
<div class="tbl-wrap"><table class="t">
<tr><th>order_id 🔑</th><th>customer_id</th><th>created_at</th><th>status</th><th>promo_code</th></tr>
<tr><td>1001</td><td>1</td><td>2025-08-09 15:27:31</td><td>доставлен</td><td style="color:#aaa">NULL</td></tr>
<tr><td>1002</td><td>1</td><td>2025-09-05 22:54:12</td><td>доставлен</td><td>AUTUMN15</td></tr>
<tr><td>1003</td><td>2</td><td>2025-02-17 13:16:45</td><td>доставлен</td><td>WELCOME10</td></tr>
</table></div>
<h4>Ключи и связи</h4>
<ul>
<li><b>Первичный ключ</b> (primary key, 🔑) это столбец, который однозначно определяет строку. У каждого заказа свой <code>order_id</code>, двух одинаковых не бывает.</li>
<li><b>Внешний ключ</b> (foreign key) это ссылка на строку в другой таблице. В заказе написан <code>customer_id = 1</code>: значит, его оформил клиент с номером 1 из таблицы <code>customers</code>.</li>
</ul>
<div class="note"><b>Зачем делить данные на таблицы</b>Если записывать имя, почту и город клиента в каждый его заказ, то при смене почты придётся править десятки строк, и где-то обязательно останется старая. Поэтому клиент хранится один раз, а заказы просто ссылаются на его номер.</div>
<h4>Типы данных, которые встретятся в курсе</h4>
<div class="tbl-wrap"><table class="t">
<tr><th>Тип</th><th>Что хранит</th><th>Пример из лавки</th></tr>
<tr><td><code>integer</code></td><td>целые числа</td><td>order_id, quantity</td></tr>
<tr><td><code>numeric(10,2)</code></td><td>точные дробные числа (деньги)</td><td>price = 690.00</td></tr>
<tr><td><code>text</code></td><td>строки любой длины</td><td>name, city, status</td></tr>
<tr><td><code>date</code></td><td>дата без времени</td><td>birth_date = 1994-05-17</td></tr>
<tr><td><code>timestamp</code></td><td>дата и время</td><td>created_at = 2025-12-03 21:14:05</td></tr>
</table></div>` },
    { id: "syntax", title: "Как устроен запрос", html: `
<p>Самый главный оператор в SQL это <code>SELECT</code>, «выбери». Минимальный запрос выглядит так:</p>
<pre class="sql">SELECT *
FROM products;</pre>
<div class="tbl-wrap"><table class="t">
<tr><th>Часть</th><th>Что значит</th></tr>
<tr><td><code>SELECT</code></td><td>«Выбери», с этого слова начинается запрос на чтение данных</td></tr>
<tr><td><code>*</code></td><td>все столбцы</td></tr>
<tr><td><code>FROM products</code></td><td>из таблицы products</td></tr>
<tr><td><code>;</code></td><td>конец запроса. Нужен, когда в окне несколько запросов</td></tr>
</table></div>
<h4>Правила оформления</h4>
<ul>
<li>Регистр команд не важен: <code>select</code> и <code>SELECT</code> работают одинаково. Принято писать команды заглавными, а названия таблиц и столбцов строчными, так легче читать.</li>
<li>Переносы строк и пробелы не важны. Каждую часть запроса пишут с новой строки, чтобы было видно структуру.</li>
<li>Текст в запросе пишется в <b>одинарных</b> кавычках: <code>'Москва'</code>. Двойные кавычки в PostgreSQL означают название столбца, это частая ошибка новичков.</li>
<li>Комментарии: всё после <code>--</code> до конца строки база игнорирует. Пиши себе заметки.</li>
</ul>
<pre class="sql">-- Это комментарий: база его пропустит
SELECT *          -- все столбцы
FROM customers;   -- из таблицы клиентов</pre>` },
    { id: "first", title: "Первые запросы: SELECT, FROM, LIMIT", html: `
<p>В рабочих базах таблицы бывают огромными: миллионы строк. Выводить всё целиком долго и бессмысленно. Чтобы посмотреть, как выглядят данные, добавляют <code>LIMIT</code>:</p>
<pre class="sql">SELECT *
FROM orders
LIMIT 5;</pre>
<p>Можно перечислить только нужные столбцы через запятую. Они выведутся в том порядке, в каком ты их написал(а):</p>
<pre class="sql">SELECT name, category, price
FROM products;</pre>
<div class="warn"><b>Самая частая ошибка</b>Лишняя запятая перед FROM: <code>SELECT name, price, FROM products</code>. База ответит «syntax error at or near FROM». Если видишь такую ошибку, сначала проверь запятые.</div>
<div class="tip"><b>Привычка аналитика</b>Перед любой задачей сначала посмотри на таблицу: <code>SELECT * FROM таблица LIMIT 10</code>. Так ты увидишь названия столбцов, формат дат и сразу заметишь странности.</div>` },
    { id: "errors", title: "Как не бояться ошибок", html: `
<p>Ошибки в запросах это нормальная часть работы, даже у опытных аналитиков. База всегда пишет, что не так. В курсе мы переводим самые частые сообщения на русский, а в DBeaver текст будет на английском. Вот словарик:</p>
<div class="tbl-wrap"><table class="t">
<tr><th>Сообщение</th><th>Перевод</th><th>Что проверить</th></tr>
<tr><td><code>syntax error at or near "…"</code></td><td>синтаксическая ошибка рядом с …</td><td>запятые, опечатки в командах, кавычки</td></tr>
<tr><td><code>column "…" does not exist</code></td><td>такого столбца нет</td><td>название столбца; текст ли это в одинарных кавычках</td></tr>
<tr><td><code>relation "…" does not exist</code></td><td>такой таблицы нет</td><td>название таблицы, выбрана ли нужная база</td></tr>
<tr><td><code>syntax error at end of input</code></td><td>запрос оборвался</td><td>незакрытая скобка или кавычка</td></tr>
</table></div>
<p>Попробуй запустить запрос с ошибкой и посмотри, что будет:</p>
<pre class="sql">SELECT name, price,
FROM products;</pre>` }
  ],
  practice: {
    intro: `<p>Все задачи в курсе приходят от команды «Уютной лавки». Решай их здесь или в DBeaver, а сюда вставляй готовый запрос для проверки.</p><div class="tip">Схема всех таблиц открыта в <a href="#/sandbox">песочнице</a> справа. Держи её во второй вкладке.</div>`,
    tasks: [
      { id: "cat", title: "Посмотреть каталог", text: `${from(MARINA, "Привет! Ты у нас новенькая(ий) в команде. Для начала выгрузи мне, пожалуйста, весь каталог товаров со всеми полями.")}`,
        hints: ["Нужны все столбцы, значит, после SELECT ставим звёздочку.", "Каталог товаров лежит в таблице <code>products</code>."], solution: "SELECT *\nFROM products;" },
      { id: "peek", title: "Глянуть на клиентов", text: `${from(DIMA, "Хочу понять, какие данные о клиентах у нас вообще есть. Покажи первые 10 строк таблицы клиентов, все поля.")}`,
        hints: ["Ограничить число строк помогает <code>LIMIT</code> в конце запроса.", "Шаблон: <code>SELECT * FROM … LIMIT …;</code>"], solution: "SELECT *\nFROM customers\nLIMIT 10;" },
      { id: "cols", title: "Только нужные столбцы", text: `${from(SERGEY, "Мне для склада не нужно всё подряд. Дай список товаров: только название и категория.")}`,
        hints: ["Перечисли столбцы через запятую после SELECT.", "Столбцы называются <code>name</code> и <code>category</code>. Порядок как в просьбе: сначала название."], solution: "SELECT name, category\nFROM products;" },
      { id: "ads", title: "Расходы на рекламу", text: `${from(OLYA, "Покажи, пожалуйста, таблицу расходов на рекламу: месяц, канал и сумма.")}`,
        hints: ["Расходы хранятся в таблице <code>ad_spend</code>.", "Столбцы: <code>month</code>, <code>channel</code>, <code>spend</code>."], solution: "SELECT month, channel, spend\nFROM ad_spend;" }
    ]
  },
  homework: {
    intro: `<p>Домашка закрепляет SELECT. Решение проверяется так же, кнопкой «Проверить».</p>`,
    tasks: [
      { id: "orders5", title: "Первые заказы", text: `<p>Выведи первые 20 строк таблицы <code>orders</code>: номер заказа, номер клиента, дату создания и статус.</p>`,
        hints: ["Столбцы: <code>order_id</code>, <code>customer_id</code>, <code>created_at</code>, <code>status</code>.", "Не забудь LIMIT."], solution: "SELECT order_id, customer_id, created_at, status\nFROM orders\nLIMIT 20;" },
      { id: "subs", title: "Подписчики рассылки", text: `<p>Выведи все почты подписчиков из таблицы <code>subscribers</code> и дату подписки.</p>`,
        hints: ["Посмотри столбцы таблицы в песочнице.", "<code>email</code> и <code>subscribed_at</code>."], solution: "SELECT email, subscribed_at\nFROM subscribers;" },
      { id: "think", title: "Подумай как аналитик", manual: true, text: `<p>Посмотри на таблицу <code>orders</code> и напиши себе в заметки 3 вопроса, на которые можно ответить с помощью этих данных. Например: «в какие часы чаще всего заказывают?». К концу курса вернись к списку и ответь на них запросами.</p>`, hints: ["Подумай о времени (когда), людях (кто), деньгах (сколько) и проблемах (отмены, промокоды)."] }
    ]
  }
});

/* ===================== 2. SELECT: КОЛОНКИ ===================== */
M.push({
  id: "m2", num: 2, week: 1, color: "mint", icon: "cols", time: "≈ 4 часа",
  short: "SELECT: колонки", tag: "Оператор SELECT", title: "Выбор колонок и вычисления",
  desc: "Выбираем нужные столбцы, даём им понятные имена, считаем маржу и скидки прямо в запросе.",
  lead: "В Excel ты бы добавила или добавил новый столбец с формулой. В SQL то же самое делается прямо в SELECT: можно складывать, умножать, склеивать текст и сразу давать результату понятное имя.",
  goals: ["Выбирать и переименовывать столбцы (AS)", "Считать новые столбцы по формулам", "Убирать дубли с DISTINCT", "Понимать типы и приведение ::"],
  video: [{ id: "0Jw3pnF0huk", title: "Оператор SELECT", author: "Andrey Sozykin", len: "7 мин" }],
  theory: [
    { id: "cols", title: "Выбор и порядок столбцов", html: `
<p>После <code>SELECT</code> перечисляются столбцы через запятую. Порядок в результате будет таким, каким ты его написал(а), а не как в таблице.</p>
<pre class="sql">SELECT category, name, price
FROM products;</pre>
<div class="tip"><b>Звёздочку лучше не использовать в рабочих запросах</b><code>SELECT *</code> хорош, чтобы посмотреть на таблицу. В отчётах всегда перечисляй столбцы явно: так запрос быстрее, понятнее и не сломается, если в таблицу добавят новое поле.</div>` },
    { id: "alias", title: "Псевдонимы: AS", html: `
<p>Столбцу в результате можно дать другое имя с помощью <code>AS</code>. Это нужно для отчётов (понятные названия) и для вычисляемых столбцов, у которых иначе будет некрасивое имя вроде <code>?column?</code>.</p>
<pre class="sql">SELECT name AS product,
       price AS price_rub
FROM products;</pre>
<ul>
<li>Слово <code>AS</code> можно пропустить: <code>SELECT name product</code> тоже сработает. Но с AS понятнее.</li>
<li>Если хочешь имя с пробелом или по-русски, бери его в <b>двойные</b> кавычки: <code>price AS "Цена, ₽"</code>.</li>
</ul>
<pre class="sql">SELECT name AS "Товар", price AS "Цена, ₽"
FROM products;</pre>
<div class="note">Двойные кавычки для имён, одинарные для текстовых значений. Это правило ещё не раз пригодится.</div>` },
    { id: "math", title: "Арифметика в запросе", html: `
<p>С числовыми столбцами можно делать всё то же, что в формулах Excel. Вычисление выполняется для каждой строки отдельно.</p>
<div class="tbl-wrap"><table class="t">
<tr><th>Оператор</th><th>Что делает</th><th>Пример</th><th>Результат</th></tr>
<tr><td><code>+ -</code></td><td>сложение, вычитание</td><td><code>price - cost</code></td><td>маржа с одной штуки</td></tr>
<tr><td><code>*</code></td><td>умножение</td><td><code>quantity * price</code></td><td>сумма по позиции</td></tr>
<tr><td><code>/</code></td><td>деление</td><td><code>price / 2</code></td><td>половина цены</td></tr>
<tr><td><code>%</code></td><td>остаток от деления</td><td><code>17 % 5</code></td><td>2</td></tr>
<tr><td><code>round(x, n)</code></td><td>округление до n знаков</td><td><code>round(10.567, 1)</code></td><td>10.6</td></tr>
</table></div>
<pre class="sql">-- Маржа и наценка по каждому товару
SELECT name,
       price,
       cost,
       price - cost AS margin,
       round((price - cost) / cost * 100, 1) AS markup_pct
FROM products;</pre>
<div class="warn"><b>Ловушка: деление целых чисел</b>Если оба числа целые (integer), PostgreSQL отбрасывает дробную часть: <code>7 / 2</code> даст <code>3</code>, а не 3.5. Чтобы получить дробь, сделай одно из чисел дробным: <code>7 / 2.0</code> или <code>7::numeric / 2</code>.</div>
<pre class="sql">SELECT 7 / 2 AS integers,
       7 / 2.0 AS decimals,
       7::numeric / 2 AS casted;</pre>
<p>SELECT можно использовать даже без таблицы, как калькулятор: <code>SELECT 1290 * 0.85;</code></p>` },
    { id: "text", title: "Склеиваем текст", html: `
<p>Строки соединяются оператором <code>||</code> (две вертикальные черты) или функцией <code>concat()</code>.</p>
<pre class="sql">SELECT first_name || ' ' || last_name AS full_name,
       city
FROM customers;</pre>
<div class="tbl-wrap"><table class="t">
<tr><th></th><th><code>||</code></th><th><code>concat()</code></th></tr>
<tr><td>Запись</td><td><code>a || ' ' || b</code></td><td><code>concat(a, ' ', b)</code></td></tr>
<tr><td>Если одно из значений пустое (NULL)</td><td>весь результат станет NULL</td><td>пустое значение просто пропустится</td></tr>
</table></div>
<pre class="sql">-- У некоторых клиентов нет телефона: сравни два способа
SELECT first_name || ', тел. ' || phone AS with_pipes,
       concat(first_name, ', тел. ', phone) AS with_concat
FROM customers
LIMIT 15;</pre>` },
    { id: "distinct", title: "Уникальные значения: DISTINCT", html: `
<p><code>DISTINCT</code> убирает повторяющиеся строки из результата. Очень полезно, чтобы быстро понять, какие вообще значения встречаются в столбце.</p>
<pre class="sql">SELECT DISTINCT city
FROM customers;</pre>
<p>Если указать несколько столбцов, уникальными будут <b>сочетания</b> значений:</p>
<pre class="sql">SELECT DISTINCT status, promo_code
FROM orders;</pre>
<div class="life"><b>Где пригодится</b>Тебе прислали новую таблицу. Первым делом смотришь <code>SELECT DISTINCT status</code>, чтобы узнать все возможные статусы заказа. Вдруг там есть не только «доставлен» и «отменён», но и «доставлен » с пробелом, который потом испортит отчёт.</div>` },
    { id: "types", title: "Типы данных и приведение ::", html: `
<p>Иногда нужно превратить значение одного типа в другой. В PostgreSQL для этого есть короткая запись <code>::</code> и стандартная <code>CAST(… AS …)</code>.</p>
<div class="tbl-wrap"><table class="t">
<tr><th>Запись</th><th>Что получится</th></tr>
<tr><td><code>created_at::date</code></td><td>дата без времени: 2025-12-03</td></tr>
<tr><td><code>price::integer</code></td><td>цена без копеек (с округлением)</td></tr>
<tr><td><code>'2026-01-15'::date</code></td><td>текст превратился в дату</td></tr>
<tr><td><code>order_id::text</code></td><td>число превратилось в текст</td></tr>
<tr><td><code>CAST(price AS integer)</code></td><td>то же, что <code>price::integer</code></td></tr>
</table></div>
<pre class="sql">SELECT order_id,
       created_at,
       created_at::date AS order_date
FROM orders
LIMIT 10;</pre>` }
  ],
  practice: {
    intro: `<p>Порядок столбцов в ответе важен: проверка сравнивает их по позиции. Названия столбцов (AS) можно давать любые.</p>`,
    tasks: [
      { id: "price", title: "Прайс-лист", text: `${from(MARINA, "Собери прайс для партнёров: категория, название, цена. Именно в таком порядке.")}`,
        hints: ["Порядок столбцов в SELECT определяет порядок в результате.", "Столбцы <code>category</code>, <code>name</code>, <code>price</code> из таблицы <code>products</code>."], solution: "SELECT category, name, price\nFROM products;" },
      { id: "margin", title: "Сколько зарабатываем на товаре", text: `${from(OLYA, "Мне нужно понять маржу. Выведи название товара, цену, себестоимость и маржу в рублях (цена минус себестоимость).")}`,
        hints: ["Маржа это вычисление прямо в SELECT: из одного столбца вычитаем другой.", "Четвёртый столбец: <code>price - cost</code>. Дай ему имя через AS."], solution: "SELECT name, price, cost, price - cost AS margin\nFROM products;" },
      { id: "sale", title: "Цены для распродажи", text: `${from(DIMA, "Готовим чёрную пятницу, скидка 15% на всё. Дай название, текущую цену и цену со скидкой, округлённую до рублей.")}`,
        hints: ["Цена со скидкой 15% это 85% от цены, то есть <code>price * 0.85</code>.", "Округление до целых: <code>round(значение)</code> или <code>round(значение, 0)</code>."], solution: "SELECT name, price, round(price * 0.85) AS sale_price\nFROM products;" },
      { id: "cities", title: "Откуда наши клиенты", text: `${from(DIMA, "В каких городах вообще есть наши клиенты? Нужен список без повторов.")}`,
        hints: ["Чтобы убрать повторы, после SELECT добавь одно слово.", "<code>SELECT DISTINCT …</code> по столбцу <code>city</code> таблицы <code>customers</code>."], solution: "SELECT DISTINCT city\nFROM customers;" },
      { id: "fullname", title: "Список для открыток", text: `${from(MARINA, "Хочу подписать открытки постоянным клиентам. Дай одну колонку: имя и фамилия через пробел. И второй колонкой город.")}`,
        hints: ["Строки склеиваются через <code>||</code>. Не забудь пробел между именем и фамилией: <code>' '</code>.", "<code>first_name || ' ' || last_name</code>, затем <code>city</code>."], solution: "SELECT first_name || ' ' || last_name AS full_name, city\nFROM customers;" },
      { id: "lines", title: "Сумма по каждой позиции", text: `${from(OLYA, "В таблице состава заказов есть количество и цена за штуку. Посчитай для каждой строки сумму позиции. Выведи номер заказа, id товара, количество, цену и сумму.")}`,
        hints: ["Данные в таблице <code>order_items</code>.", "Сумма позиции: <code>quantity * price</code>. Это пятый столбец."], solution: "SELECT order_id, product_id, quantity, price, quantity * price AS line_total\nFROM order_items;" }
    ]
  },
  homework: {
    tasks: [
      { id: "markup", title: "Наценка в процентах", level: "средне", text: `<p>Для каждого товара выведи название и наценку в процентах: <code>(цена − себестоимость) / себестоимость × 100</code>, округлённую до 1 знака после запятой.</p>`,
        hints: ["Сначала вычти, потом раздели, потом умножь на 100. Скобки важны!", "<code>round(выражение, 1)</code>. Цены у нас типа numeric, так что целочисленного деления не будет."], solution: "SELECT name, round((price - cost) / cost * 100, 1) AS markup_pct\nFROM products;" },
      { id: "dates", title: "Только дата регистрации", text: `<p>Выведи для клиентов id, почту и дату регистрации <b>без времени</b>.</p>`,
        hints: ["Время отрезается приведением к типу date.", "<code>registered_at::date</code>"], solution: "SELECT customer_id, email, registered_at::date AS reg_date\nFROM customers;" },
      { id: "combos", title: "Статусы и промокоды", text: `<p>Выведи все уникальные сочетания статуса заказа и промокода.</p>`,
        hints: ["DISTINCT работает и для нескольких столбцов сразу.", "<code>SELECT DISTINCT status, promo_code FROM orders</code>"], solution: "SELECT DISTINCT status, promo_code\nFROM orders;" },
      { id: "card", title: "Карточка товара", level: "посложнее", text: `<p>Сделай одну текстовую колонку вида <code>Кружка «Рябина» (Посуда): 950 ₽</code> для каждого товара. Цена без копеек.</p>`,
        hints: ["Нужно склеить название, категорию в скобках и цену. Цену без копеек можно получить через <code>price::integer</code>.", "Шаблон: <code>name || ' (' || category || '): ' || … || ' ₽'</code>"], solution: "SELECT name || ' (' || category || '): ' || price::integer || ' ₽' AS card\nFROM products;" }
    ]
  }
});

/* ===================== 3. SELECT: ФИЛЬТРАЦИЯ ===================== */
M.push({
  id: "m3", num: 3, week: 2, color: "sky", icon: "filter", time: "≈ 5 часов",
  short: "SELECT: фильтрация", tag: "Оператор SELECT", title: "Фильтрация строк: WHERE",
  desc: "Оставляем только нужные строки. Сравнения, AND и OR, IN, BETWEEN, LIKE и проверка на пустоту.",
  lead: "В реальной работе почти никогда не нужна вся таблица. Нужны заказы за месяц, клиенты из Москвы, товары дороже тысячи. Для этого есть WHERE, и это, пожалуй, самая используемая часть SQL после SELECT.",
  goals: ["Фильтровать числа и строки", "Комбинировать условия AND / OR и ставить скобки", "Использовать IN, BETWEEN, LIKE, IS NULL", "Понимать порядок выполнения запроса"],
  video: [{ id: "Q8UmK7wC9Hk", title: "Фильтрация данных в SQL: WHERE", author: "Andrey Sozykin", len: "9 мин" }],
  theory: [
    { id: "where", title: "WHERE и операторы сравнения", html: `
<p><code>WHERE</code> пишется после <code>FROM</code> и оставляет только строки, для которых условие истинно.</p>
<pre class="sql">SELECT name, price
FROM products
WHERE price > 1000;</pre>
<div class="tbl-wrap"><table class="t">
<tr><th>Оператор</th><th>Значение</th><th>Пример</th></tr>
<tr><td><code>=</code></td><td>равно</td><td><code>city = 'Казань'</code></td></tr>
<tr><td><code>&lt;&gt;</code> или <code>!=</code></td><td>не равно</td><td><code>status &lt;&gt; 'отменён'</code></td></tr>
<tr><td><code>&gt;</code> <code>&lt;</code></td><td>больше, меньше</td><td><code>price &lt; 500</code></td></tr>
<tr><td><code>&gt;=</code> <code>&lt;=</code></td><td>больше или равно, меньше или равно</td><td><code>quantity &gt;= 2</code></td></tr>
</table></div>
<div class="warn"><b>Текст сравнивается точно</b><code>city = 'москва'</code> не найдёт «Москва»: регистр букв важен. И <code>'Москва '</code> с пробелом на конце тоже другое значение. Как с этим бороться, разберём в модуле 4.</div>
<p>Даты тоже сравниваются, если записать их в формате <code>'ГГГГ-ММ-ДД'</code>:</p>
<pre class="sql">SELECT order_id, created_at
FROM orders
WHERE created_at >= '2026-09-01';</pre>` },
    { id: "logic", title: "AND, OR, NOT и скобки", html: `
<p>Условия комбинируются логическими операторами:</p>
<div class="grid3">
<div class="tile lav"><h4>AND</h4><p>Оба условия должны выполняться. «Москва <b>и</b> из инстаграма».</p></div>
<div class="tile mint"><h4>OR</h4><p>Хотя бы одно из условий. «Москва <b>или</b> Петербург».</p></div>
<div class="tile sky"><h4>NOT</h4><p>Переворачивает условие. <code>NOT city = 'Москва'</code>.</p></div>
</div>
<pre class="sql">SELECT first_name, city, source
FROM customers
WHERE city = 'Москва' AND source = 'instagram';</pre>
<h4>Ловушка с приоритетом</h4>
<p><code>AND</code> выполняется раньше, чем <code>OR</code>, как умножение раньше сложения. Задача: товары категорий «Кофе» или «Чай» дешевле 500 ₽.</p>
<div class="grid2">
<div class="tile peach"><h4>❌ Неправильно</h4><pre class="sql norun">WHERE category = 'Кофе'
   OR category = 'Чай'
  AND price &lt; 500</pre><p>База поймёт так: весь кофе (любой цены) ИЛИ чай дешевле 500.</p></div>
<div class="tile lime"><h4>✅ Правильно</h4><pre class="sql norun">WHERE (category = 'Кофе'
    OR category = 'Чай')
  AND price &lt; 500</pre><p>Скобки задают порядок явно.</p></div>
</div>
<div class="tip">Правило: если в условии есть и AND, и OR, всегда ставь скобки. Даже если кажется, что и так понятно.</div>
<pre class="sql">SELECT name, category, price
FROM products
WHERE (category = 'Кофе' OR category = 'Чай')
  AND price < 500;</pre>` },
    { id: "in", title: "IN и BETWEEN: короче и понятнее", html: `
<p><code>IN</code> проверяет, входит ли значение в список. Заменяет цепочку из OR:</p>
<pre class="sql">SELECT first_name, last_name, city
FROM customers
WHERE city IN ('Москва', 'Санкт-Петербург', 'Казань');</pre>
<p><code>NOT IN</code> наоборот: всё, кроме перечисленного.</p>
<p><code>BETWEEN a AND b</code> проверяет диапазон, <b>включая обе границы</b>:</p>
<pre class="sql">SELECT name, price
FROM products
WHERE price BETWEEN 500 AND 1000;  -- то же, что price >= 500 AND price <= 1000</pre>
<div class="warn"><b>BETWEEN и даты со временем</b><code>created_at BETWEEN '2026-09-01' AND '2026-09-30'</code> не включит заказы 30 сентября после полуночи: <code>'2026-09-30'</code> превращается в <code>2026-09-30 00:00:00</code>. Для периодов надёжнее писать <code>created_at &gt;= '2026-09-01' AND created_at &lt; '2026-10-01'</code>. Подробно в модуле 6.</div>` },
    { id: "like", title: "Поиск по тексту: LIKE и ILIKE", html: `
<p>Когда нужно найти не точное совпадение, а часть текста, используют шаблоны:</p>
<div class="tbl-wrap"><table class="t">
<tr><th>Символ</th><th>Значит</th><th>Шаблон</th><th>Найдёт</th></tr>
<tr><td><code>%</code></td><td>любое количество любых символов (и ноль тоже)</td><td><code>'Кофе%'</code></td><td>всё, что начинается на «Кофе»</td></tr>
<tr><td><code>%</code></td><td></td><td><code>'%250 г'</code></td><td>всё, что заканчивается на «250 г»</td></tr>
<tr><td><code>%</code></td><td></td><td><code>'%свеч%'</code></td><td>«свеч» в любом месте</td></tr>
<tr><td><code>_</code></td><td>ровно один любой символ</td><td><code>'_ван'</code></td><td>Иван, но не Иванов</td></tr>
</table></div>
<pre class="sql">SELECT name
FROM products
WHERE name LIKE '%250 г%';</pre>
<p><code>LIKE</code> различает регистр. <code>ILIKE</code> (особенность PostgreSQL) не различает:</p>
<pre class="sql">SELECT email
FROM customers
WHERE email ILIKE '%@gmail.com%';</pre>
<div class="note">Почему <code>%</code> и в конце шаблона почты? Некоторые адреса в базе записаны с пробелами по краям. Попробуй убрать последний <code>%</code> и посмотри, сколько строк пропадёт.</div>` },
    { id: "null", title: "Пустые значения: IS NULL", html: `
<p><code>NULL</code> значит «значение неизвестно» или «его нет». Это не ноль и не пустая строка. У клиента без телефона в поле <code>phone</code> стоит NULL.</p>
<div class="warn"><b>С NULL нельзя сравнивать через =</b><code>WHERE phone = NULL</code> не найдёт ничего, даже если пустых телефонов много. Сравнение с неизвестным даёт «неизвестно», а не «да». Правильно: <code>IS NULL</code> и <code>IS NOT NULL</code>.</div>
<pre class="sql">-- Клиенты без телефона
SELECT first_name, last_name, email
FROM customers
WHERE phone IS NULL;</pre>
<pre class="sql">-- Заказы с любым промокодом
SELECT order_id, promo_code
FROM orders
WHERE promo_code IS NOT NULL;</pre>
<p>Ещё одна ловушка: <code>WHERE promo_code &lt;&gt; 'WELCOME10'</code> не вернёт заказы <b>без</b> промокода, потому что NULL ни с чем не сравнивается. Если они нужны, добавь <code>OR promo_code IS NULL</code>.</p>` },
    { id: "order", title: "В каком порядке база выполняет запрос", html: `
<p>Пишем мы запрос в одном порядке, а база выполняет его в другом. Это объясняет многие ошибки.</p>
<div class="flow"><span>FROM<small>берём таблицу</small></span><i>→</i><span>WHERE<small>отбираем строки</small></span><i>→</i><span>SELECT<small>считаем столбцы</small></span><i>→</i><span>ORDER BY<small>сортируем</small></span><i>→</i><span>LIMIT<small>обрезаем</small></span></div>
<p>Поэтому <b>псевдоним из SELECT нельзя использовать в WHERE</b>: на момент фильтрации его ещё не существует.</p>
<div class="grid2">
<div class="tile peach"><h4>❌ Ошибка</h4><pre class="sql norun">SELECT name, price - cost AS margin
FROM products
WHERE margin > 500;</pre></div>
<div class="tile lime"><h4>✅ Работает</h4><pre class="sql norun">SELECT name, price - cost AS margin
FROM products
WHERE price - cost > 500;</pre></div>
</div>
<p>Позже мы добавим в эту цепочку GROUP BY, HAVING и оконные функции.</p>` }
  ],
  practice: {
    intro: `<p>В этом модуле начинаются задачи, похожие на настоящие рабочие. Читай просьбу внимательно: какие столбцы нужны и какие условия.</p>`,
    tasks: [
      { id: "exp", title: "Дорогие товары", text: `${from(MARINA, "Какие товары у нас стоят от 1500 ₽ и выше? Название и цена.")}`,
        hints: ["«От 1500 и выше» значит, что 1500 тоже входит.", "<code>WHERE price >= 1500</code>"], solution: "SELECT name, price\nFROM products\nWHERE price >= 1500;" },
      { id: "cancel", title: "Отменённые заказы", text: `${from(OLYA, "Выгрузи отменённые заказы: номер заказа, номер клиента и дату.")}`,
        hints: ["Статус хранится текстом, значение пишется в одинарных кавычках.", "Посмотри точное написание статуса через <code>SELECT DISTINCT status FROM orders</code>. Нужен <code>'отменён'</code>."], solution: "SELECT order_id, customer_id, created_at\nFROM orders\nWHERE status = 'отменён';" },
      { id: "spbinst", title: "Аудитория для таргета", text: `${from(DIMA, "Хочу проверить, как работает инстаграм в Питере. Дай имя, фамилию и почту клиентов из Санкт-Петербурга, которые пришли из instagram.")}`,
        hints: ["Два условия, оба должны выполняться одновременно. Какой оператор?", "<code>WHERE city = 'Санкт-Петербург' AND source = 'instagram'</code>"], solution: "SELECT first_name, last_name, email\nFROM customers\nWHERE city = 'Санкт-Петербург' AND source = 'instagram';" },
      { id: "cheapdrinks", title: "Недорогие напитки", text: `${from(MARINA, "Подбираю подарки до 600 ₽ к заказу. Покажи кофе и чай дешевле 600 ₽: название, категория, цена.")}`,
        hints: ["Здесь есть и «или» (кофе или чай), и «и» (дешевле 600). Помнишь про скобки?", "Удобнее через IN: <code>category IN ('Кофе', 'Чай') AND price &lt; 600</code>."], solution: "SELECT name, category, price\nFROM products\nWHERE category IN ('Кофе', 'Чай') AND price < 600;" },
      { id: "nophone", title: "Кому не позвонить", text: `${from(SERGEY, "Курьеры жалуются, что у части клиентов нет телефона. Дай список: id клиента, имя, город. Только тех, у кого телефон не указан.")}`,
        hints: ["Пустое значение ищется не через <code>=</code>.", "<code>WHERE phone IS NULL</code>"], solution: "SELECT customer_id, first_name, city\nFROM customers\nWHERE phone IS NULL;" },
      { id: "dhrip", title: "Найти товары по слову", text: `${from(DIMA, "Пишу пост про всё, что связано с кофе. Найди товары, в названии которых есть слово «кофе», неважно, с большой буквы или с маленькой. Нужны название и цена.")}`,
        hints: ["Нужен поиск по части текста без учёта регистра.", "<code>WHERE name ILIKE '%кофе%'</code>"], solution: "SELECT name, price\nFROM products\nWHERE name ILIKE '%кофе%';" },
      { id: "sept", title: "Заказы за сентябрь", text: `${from(OLYA, "Нужны все заказы за сентябрь 2026: номер, дата и статус.")}`,
        hints: ["Дата заказа хранится с временем. Удобно задать полуинтервал: от начала сентября включительно до начала октября не включительно.", "<code>created_at >= '2026-09-01' AND created_at &lt; '2026-10-01'</code>"], solution: "SELECT order_id, created_at, status\nFROM orders\nWHERE created_at >= '2026-09-01' AND created_at < '2026-10-01';" }
    ]
  },
  homework: {
    tasks: [
      { id: "mid", title: "Средний ценовой сегмент", text: `<p>Найди товары с ценой от 800 до 1500 ₽ включительно. Выведи название, категорию и цену.</p>`,
        hints: ["Подходит оператор диапазона, который включает обе границы."], solution: "SELECT name, category, price\nFROM products\nWHERE price BETWEEN 800 AND 1500;" },
      { id: "gmail", title: "Почты на gmail", text: `<p>Маркетолог хочет знать, сколько клиентов на gmail. Выведи id и почту клиентов, у которых почта на <code>gmail.com</code>. Учти, что некоторые адреса записаны заглавными буквами и с пробелами.</p>`,
        hints: ["Регистр не должен влиять, значит, ILIKE.", "Из-за пробелов в конце строки шаблон должен заканчиваться на <code>%</code>: <code>'%gmail.com%'</code>."], solution: "SELECT customer_id, email\nFROM customers\nWHERE email ILIKE '%gmail.com%';" },
      { id: "notmsk", title: "Регионы без промо", level: "посложнее", text: `<p>Найди доставленные заказы не из Москвы и не из Санкт-Петербурга (по городу доставки), оформленные без промокода. Выведи номер заказа, город доставки и дату.</p>`,
        hints: ["Три условия через AND: статус, город, промокод.", "Город: <code>delivery_city NOT IN (…)</code>. Промокода нет: <code>promo_code IS NULL</code>."], solution: "SELECT order_id, delivery_city, created_at\nFROM orders\nWHERE status = 'доставлен'\n  AND delivery_city NOT IN ('Москва', 'Санкт-Петербург')\n  AND promo_code IS NULL;" },
      { id: "young", title: "Молодая аудитория", level: "посложнее", text: `<p>Выведи имя, дату рождения и источник клиентов, родившихся в 2000 году или позже, которые пришли из telegram или vk.</p>`,
        hints: ["Дату можно сравнивать со строкой <code>'2000-01-01'</code>.", "Не забудь скобки или используй IN для источников."], solution: "SELECT first_name, birth_date, source\nFROM customers\nWHERE birth_date >= '2000-01-01'\n  AND source IN ('telegram', 'vk');" },
      { id: "notwelcome", title: "Ловушка с NULL", level: "с подвохом", text: `<p>Выведи номера и промокоды всех заказов, кроме тех, что оформлены с промокодом <code>WELCOME10</code>. Заказы без промокода тоже должны попасть в результат.</p>`,
        hints: ["Условие <code>promo_code &lt;&gt; 'WELCOME10'</code> само по себе потеряет строки с NULL.", "Добавь <code>OR promo_code IS NULL</code>."], solution: "SELECT order_id, promo_code\nFROM orders\nWHERE promo_code <> 'WELCOME10' OR promo_code IS NULL;" }
    ]
  }
});

/* ===================== 4. СОРТИРОВКА И ФУНКЦИИ ===================== */
M.push({
  id: "m4", num: 4, week: 2, color: "lime", icon: "sort", time: "≈ 5 часов",
  short: "Сортировка и функции", tag: "Сортировка и функции", title: "Сортировка, функции для строк и чисел",
  desc: "ORDER BY и топ-N. Математические функции, чистка текста, первое знакомство с датами.",
  lead: "Отчёт «топ-10 товаров» невозможен без сортировки. А реальные данные почти всегда «грязные»: пробелы, разный регистр, телефоны в трёх форматах. В этом модуле учимся сортировать и приводить данные в порядок функциями.",
  goals: ["Сортировать по нескольким полям, делать топ-N", "Округлять и считать математику", "Чистить текст: trim, lower, replace, split_part", "Получать текущую дату и время"],
  video: [{ id: "bYdjR6QexJY", title: "Сортировка в SQL: ORDER BY", author: "Andrey Sozykin", len: "10 мин" }],
  theory: [
    { id: "orderby", title: "ORDER BY: сортировка", html: `
<p><code>ORDER BY</code> пишется в конце запроса, перед LIMIT. По умолчанию сортирует по возрастанию (<code>ASC</code>), для убывания добавь <code>DESC</code>.</p>
<pre class="sql">SELECT name, price
FROM products
ORDER BY price DESC;</pre>
<h4>Сортировка по нескольким полям</h4>
<p>Сначала по первому полю, при равенстве по второму и так далее. Направление указывается для каждого поля отдельно.</p>
<pre class="sql">SELECT category, name, price
FROM products
ORDER BY category ASC, price DESC;</pre>
<div class="tbl-wrap"><table class="t">
<tr><th>Можно сортировать по</th><th>Пример</th></tr>
<tr><td>столбцу</td><td><code>ORDER BY price</code></td></tr>
<tr><td>псевдониму из SELECT</td><td><code>ORDER BY margin DESC</code> (здесь можно: ORDER BY выполняется после SELECT)</td></tr>
<tr><td>выражению</td><td><code>ORDER BY price - cost DESC</code></td></tr>
<tr><td>номеру столбца в SELECT</td><td><code>ORDER BY 2 DESC</code> (удобно, но в отчётах лучше по имени)</td></tr>
</table></div>
<h4>Куда деваются NULL</h4>
<p>В PostgreSQL пустые значения при сортировке по возрастанию идут в конец, при убывании в начало. Управлять этим можно явно: <code>NULLS FIRST</code> / <code>NULLS LAST</code>.</p>
<pre class="sql">SELECT order_id, delivered_at
FROM orders
ORDER BY delivered_at DESC NULLS LAST
LIMIT 10;</pre>` },
    { id: "top", title: "Топ-N: ORDER BY + LIMIT", html: `
<p>Самый частый отчёт в мире: «покажи топ-5 чего-нибудь». Это сортировка плюс ограничение.</p>
<pre class="sql">-- 5 самых дорогих товаров
SELECT name, price
FROM products
ORDER BY price DESC
LIMIT 5;</pre>
<p><code>OFFSET</code> пропускает строки. Например, товары с 6-го по 10-е место:</p>
<pre class="sql">SELECT name, price
FROM products
ORDER BY price DESC
LIMIT 5 OFFSET 5;</pre>
<div class="warn"><b>LIMIT без ORDER BY</b>Без сортировки база не гарантирует порядок строк. <code>LIMIT 5</code> без ORDER BY вернёт «какие-то» 5 строк, и при следующем запуске они могут быть другими.</div>` },
    { id: "math", title: "Математические функции", html: `
<div class="tbl-wrap"><table class="t">
<tr><th>Функция</th><th>Что делает</th><th>Пример</th><th>Результат</th></tr>
<tr><td><code>round(x)</code></td><td>округление до целого</td><td><code>round(4.5)</code></td><td>5</td></tr>
<tr><td><code>round(x, n)</code></td><td>до n знаков</td><td><code>round(3.14159, 2)</code></td><td>3.14</td></tr>
<tr><td><code>round(x, -2)</code></td><td>до сотен</td><td><code>round(1349, -2)</code></td><td>1300</td></tr>
<tr><td><code>ceil(x)</code></td><td>вверх до целого</td><td><code>ceil(4.1)</code></td><td>5</td></tr>
<tr><td><code>floor(x)</code></td><td>вниз до целого</td><td><code>floor(4.9)</code></td><td>4</td></tr>
<tr><td><code>abs(x)</code></td><td>модуль (без минуса)</td><td><code>abs(-300)</code></td><td>300</td></tr>
<tr><td><code>power(x, n)</code></td><td>степень</td><td><code>power(1.1, 2)</code></td><td>1.21</td></tr>
<tr><td><code>x % y</code> / <code>mod(x, y)</code></td><td>остаток</td><td><code>mod(10, 3)</code></td><td>1</td></tr>
<tr><td><code>greatest(a, b)</code> / <code>least(a, b)</code></td><td>большее / меньшее из значений</td><td><code>greatest(0, -5)</code></td><td>0</td></tr>
</table></div>
<pre class="sql">-- «Красивые» цены: округляем до десятков вниз и вычитаем 1 рубль
SELECT name,
       price,
       floor(price * 1.1 / 10) * 10 - 1 AS new_price
FROM products
ORDER BY price;</pre>
<div class="life"><b>Где пригодится</b>Расчёт количества коробок для склада: товаров 23, в коробку входит 6. <code>ceil(23 / 6.0)</code> даст 4 коробки. А <code>floor</code> скажет, сколько полных коробок получится.</div>` },
    { id: "strings", title: "Функции для работы со строками", html: `
<div class="tbl-wrap"><table class="t">
<tr><th>Функция</th><th>Что делает</th><th>Пример → результат</th></tr>
<tr><td><code>lower(s)</code> / <code>upper(s)</code></td><td>в нижний / верхний регистр</td><td><code>lower('АННА')</code> → анна</td></tr>
<tr><td><code>initcap(s)</code></td><td>каждое слово с заглавной</td><td><code>initcap('нижний новгород')</code> → Нижний Новгород</td></tr>
<tr><td><code>trim(s)</code></td><td>убирает пробелы по краям</td><td><code>trim('  a@b.ru ')</code> → a@b.ru</td></tr>
<tr><td><code>length(s)</code></td><td>длина в символах</td><td><code>length('чай')</code> → 3</td></tr>
<tr><td><code>replace(s, что, на_что)</code></td><td>замена подстроки</td><td><code>replace('8-915', '-', '')</code> → 8915</td></tr>
<tr><td><code>left(s, n)</code> / <code>right(s, n)</code></td><td>первые / последние n символов</td><td><code>right('89151234567', 4)</code> → 4567</td></tr>
<tr><td><code>substring(s, start, len)</code></td><td>кусок строки</td><td><code>substring('Ярославль', 1, 3)</code> → Яро</td></tr>
<tr><td><code>split_part(s, разделитель, n)</code></td><td>n-я часть строки</td><td><code>split_part('anna@mail.ru', '@', 2)</code> → mail.ru</td></tr>
<tr><td><code>position(подстрока in s)</code></td><td>где находится подстрока</td><td><code>position('@' in 'a@b.ru')</code> → 2</td></tr>
<tr><td><code>regexp_replace(s, шаблон, на_что, 'g')</code></td><td>замена по регулярному выражению</td><td><code>regexp_replace('+7 (915)', '\\D', '', 'g')</code> → 7915</td></tr>
</table></div>
<p>Функции можно вкладывать друг в друга. Типичная чистка почты: убрать пробелы и привести к нижнему регистру.</p>
<pre class="sql">SELECT email AS raw_email,
       lower(trim(email)) AS clean_email,
       split_part(lower(trim(email)), '@', 2) AS domain
FROM customers
WHERE customer_id IN (7, 23, 41, 58, 1);</pre>
<div class="life"><b>Чистим телефоны</b>Телефоны записаны тремя способами: <code>+7 (915) 123-45-67</code>, <code>89151234567</code>, <code>+79151234567</code>. Чтобы сравнивать их, оставим только цифры и последние 10 из них:</div>
<pre class="sql">SELECT phone,
       right(regexp_replace(phone, '\\D', '', 'g'), 10) AS phone10
FROM customers
WHERE phone IS NOT NULL
LIMIT 10;</pre>
<p><code>\\D</code> в регулярном выражении означает «любой символ, кроме цифры». Регулярные выражения это отдельная большая тема, в курсе хватит этого шаблона.</p>` },
    { id: "now", title: "Первое знакомство с датами", html: `
<p>Подробно даты будут в модулях 5 и 6. Пока три полезные вещи:</p>
<div class="tbl-wrap"><table class="t">
<tr><th>Функция</th><th>Что возвращает</th></tr>
<tr><td><code>current_date</code></td><td>сегодняшняя дата</td></tr>
<tr><td><code>now()</code></td><td>текущие дата и время</td></tr>
<tr><td><code>extract(year from дата)</code></td><td>год из даты (так же month, day)</td></tr>
</table></div>
<pre class="sql">SELECT current_date AS today,
       now() AS right_now,
       extract(year from current_date) AS this_year;</pre>
<pre class="sql">-- Год рождения клиентов
SELECT first_name, birth_date, extract(year from birth_date) AS birth_year
FROM customers
ORDER BY birth_date
LIMIT 10;</pre>` }
  ],
  practice: {
    intro: `<p>Где в задаче есть слово «отсортируй» или «топ», порядок строк проверяется. В остальных задачах порядок не важен.</p>`,
    tasks: [
      { id: "top5", title: "Топ-5 дорогих товаров", ordered: true, text: `${from(MARINA, "Какие 5 товаров у нас самые дорогие? Название и цена, от дорогого к дешёвому.")}`,
        hints: ["Сначала отсортируй по убыванию цены, потом оставь первые строки.", "<code>ORDER BY price DESC LIMIT 5</code>"], solution: "SELECT name, price\nFROM products\nORDER BY price DESC\nLIMIT 5;" },
      { id: "catsort", title: "Каталог по полочкам", ordered: true, text: `${from(SERGEY, "Нужен список товаров для инвентаризации: категория, название, цена. Отсортируй по категории по алфавиту, а внутри категории от дешёвых к дорогим.")}`,
        hints: ["Сортировка по двум полям, через запятую.", "<code>ORDER BY category, price</code>. ASC можно не писать."], solution: "SELECT category, name, price\nFROM products\nORDER BY category, price;" },
      { id: "topmargin", title: "Самые выгодные товары", ordered: true, text: `${from(OLYA, "Какие 3 товара дают самую большую маржу в рублях с одной штуки? Название и маржа.")}`,
        hints: ["Маржа = цена минус себестоимость. По псевдониму в ORDER BY сортировать можно.", "<code>SELECT name, price - cost AS margin … ORDER BY margin DESC LIMIT 3</code>"], solution: "SELECT name, price - cost AS margin\nFROM products\nORDER BY margin DESC\nLIMIT 3;" },
      { id: "cleanmail", title: "Чистые почты для рассылки", text: `${from(DIMA, "Загружаю базу в сервис рассылок, а он ругается на почты с пробелами и капсом. Дай id клиента и почту в нормальном виде: без пробелов по краям и маленькими буквами.")}`,
        hints: ["Понадобятся две функции, одна внутри другой.", "<code>lower(trim(email))</code>"], solution: "SELECT customer_id, lower(trim(email)) AS email\nFROM customers;" },
      { id: "domains", title: "Почтовые сервисы", text: `${from(DIMA, "А какие почтовые домены вообще встречаются? Нужен список уникальных доменов (то, что после @), почищенных от пробелов и капса.")}`,
        hints: ["Домен это вторая часть строки, если разрезать её по символу <code>@</code>.", "<code>SELECT DISTINCT split_part(lower(trim(email)), '@', 2)</code>"], solution: "SELECT DISTINCT split_part(lower(trim(email)), '@', 2) AS domain\nFROM customers;" },
      { id: "boxes", title: "Сколько нужно коробок", text: `${from(SERGEY, "Чай и кофе мы пакуем по 4 упаковки в коробку. Для каждой строки состава заказов, где количество больше 1, посчитай, сколько коробок нужно. Выведи номер заказа, id товара, количество и число коробок.")}`,
        hints: ["Коробки считаются с округлением вверх: 5 упаковок это 2 коробки.", "Не попадись на целочисленное деление: <code>ceil(quantity / 4.0)</code>. Условие: <code>WHERE quantity > 1</code>."], solution: "SELECT order_id, product_id, quantity, ceil(quantity / 4.0) AS boxes\nFROM order_items\nWHERE quantity > 1;" }
    ]
  },
  homework: {
    tasks: [
      { id: "newest", title: "Новые клиенты", ordered: true, text: `<p>Выведи 10 последних зарегистрированных клиентов: имя, город и дату регистрации, от самых новых.</p>`,
        hints: ["Сортировка по <code>registered_at</code> по убыванию."], solution: "SELECT first_name, city, registered_at\nFROM customers\nORDER BY registered_at DESC\nLIMIT 10;" },
      { id: "phones", title: "Телефоны в одном формате", level: "средне", text: `<p>Приведи все телефоны к виду из 10 цифр (без +7 и 8 в начале). Выведи id клиента и телефон. Клиентов без телефона не выводи.</p>`,
        hints: ["Сначала оставь только цифры с помощью <code>regexp_replace(phone, '\\D', '', 'g')</code>.", "Потом возьми последние 10 символов функцией <code>right(…, 10)</code>."], solution: "SELECT customer_id, right(regexp_replace(phone, '\\D', '', 'g'), 10) AS phone10\nFROM customers\nWHERE phone IS NOT NULL;" },
      { id: "short", title: "Короткие названия для этикеток", level: "средне", text: `<p>На этикетку влезает 20 символов. Выведи названия товаров, которые длиннее 20 символов, их длину и первые 17 символов названия с многоточием <code>...</code> в конце. Отсортируй по длине от больших к меньшим.</p>`,
        hints: ["Длина: <code>length(name)</code>. Обрезка: <code>left(name, 17) || '...'</code>.", "Фильтр по длине в WHERE, сортировка по длине. При одинаковой длине порядок не проверяется строго, но лучше добавить второе поле name."], ordered: false, solution: "SELECT name, length(name) AS len, left(name, 17) || '...' AS label\nFROM products\nWHERE length(name) > 20\nORDER BY len DESC;" },
      { id: "age", title: "Возраст клиентов", level: "посложнее", text: `<p>Посчитай для каждого клиента примерный возраст как разницу между текущим годом и годом рождения. Выведи имя, дату рождения и возраст. Отсортируй от самых молодых к старшим.</p>`,
        hints: ["Год из даты: <code>extract(year from …)</code>. Текущий год: <code>extract(year from current_date)</code>.", "Самые молодые родились позже всех, значит, сортировка по дате рождения по убыванию."], ordered: false, solution: "SELECT first_name, birth_date, extract(year from current_date) - extract(year from birth_date) AS age\nFROM customers\nORDER BY birth_date DESC;" }
    ]
  }
});
})();
