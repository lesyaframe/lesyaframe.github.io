window.COURSE = {
  modules: [],
  weeks: [
    { title: "Подготовка и первые запросы", color: "lav", text: "Ставим программы, загружаем учебную базу, пишем первые SELECT и учимся выбирать нужные колонки." },
    { title: "Фильтры, сортировка и функции", color: "mint", text: "WHERE, AND/OR, LIKE, IN, BETWEEN. Сортируем результат и чистим данные строковыми и математическими функциями." },
    { title: "Дата и время", color: "sky", text: "Самая частая тема в аналитике: месяцы, недели, разница между датами, преобразование строк в даты." },
    { title: "Агрегаты и группировка", color: "lime", text: "Считаем выручку, средний чек, количество заказов по городам и месяцам. GROUP BY и HAVING." },
    { title: "Объединение таблиц", color: "lav", text: "JOIN всех видов, подзапросы, NULL и UNION. После этой недели можно отвечать на большинство бизнес-вопросов." },
    { title: "Свои таблицы и оконные функции", color: "mint", text: "CREATE, INSERT, UPDATE, DELETE. Затем оконные функции: рейтинги, накопительные итоги, сравнение с прошлым периодом." },
    { title: "Данные для Excel", color: "sky", text: "CASE, сетка дат, выгрузка в CSV, сводные таблицы и графики в Excel." },
    { title: "Дипломный проект", color: "peach", text: "Отчёт для заказчика: запросы, выгрузка и аналитика в Excel. Итог курса, который можно показать работодателю." }
  ],
  schema: [
    { name: "customers", about: "клиенты", cols: [["customer_id", "id клиента", 1], ["first_name", "имя"], ["last_name", "фамилия"], ["email", "почта"], ["phone", "телефон"], ["city", "город"], ["birth_date", "дата рождения"], ["registered_at", "дата и время регистрации"], ["source", "откуда пришёл"]] },
    { name: "orders", about: "заказы", cols: [["order_id", "номер заказа", 1], ["customer_id", "кто заказал"], ["created_at", "когда оформлен"], ["status", "новый / в пути / доставлен / отменён"], ["delivered_at", "когда доставлен"], ["promo_code", "промокод"], ["delivery_city", "город доставки"]] },
    { name: "order_items", about: "состав заказов", cols: [["order_id", "номер заказа", 1], ["product_id", "товар", 1], ["quantity", "сколько штук"], ["price", "цена за штуку в момент покупки"]] },
    { name: "products", about: "товары", cols: [["product_id", "id товара", 1], ["name", "название"], ["category", "категория"], ["price", "текущая цена"], ["cost", "себестоимость"], ["added_at", "когда появился в каталоге"]] },
    { name: "subscribers", about: "подписчики рассылки", cols: [["email", "почта", 1], ["subscribed_at", "дата подписки"]] },
    { name: "ad_spend", about: "расходы на рекламу", cols: [["month", "месяц (1-е число)", 1], ["channel", "instagram / telegram / vk", 1], ["spend", "сколько потратили, ₽"]] }
  ],
  links: `
<h3>Файлы курса</h3>
<div class="links">
  <a href="data/shop.sql" download><b>shop.sql</b><span>Учебная база «Уютная лавка» для PostgreSQL. Открыть в DBeaver и выполнить.</span></a>
  <a href="cheatsheet.html" target="_blank" rel="noopener"><b>Шпаргалка по SQL</b><span>Все конструкции курса на одной странице. Можно распечатать.</span></a>
  <a href="#/sandbox"><b>Песочница</b><span>PostgreSQL в браузере, если под рукой нет компьютера с DBeaver.</span></a>
</div>
<h3>Документация и справочники</h3>
<div class="links">
  <a href="https://postgrespro.ru/docs/postgresql/17/index" target="_blank" rel="noopener"><b>Документация PostgreSQL на русском</b><span>Postgres Pro. Ищи там любую функцию.</span></a>
  <a href="https://postgrespro.ru/docs/postgresql/17/functions-datetime" target="_blank" rel="noopener"><b>Функции даты и времени</b><span>Полная таблица функций и операторов.</span></a>
  <a href="https://postgrespro.ru/docs/postgresql/17/functions-formatting" target="_blank" rel="noopener"><b>Форматы to_char / to_date</b><span>Все шаблоны вроде YYYY, MM, Day.</span></a>
  <a href="https://postgrespro.ru/docs/postgresql/17/tutorial-window" target="_blank" rel="noopener"><b>Оконные функции</b><span>Официальное введение с примерами.</span></a>
  <a href="https://dbeaver.com/docs/dbeaver/" target="_blank" rel="noopener"><b>Документация DBeaver</b><span>Если что-то не находится в меню.</span></a>
</div>
<h3>Где ещё практиковаться</h3>
<div class="links">
  <a href="https://sql-academy.org/ru/trainer" target="_blank" rel="noopener"><b>SQL Academy</b><span>Тренажёр на русском, задачи от простых к сложным.</span></a>
  <a href="https://stepik.org/course/63054/promo" target="_blank" rel="noopener"><b>Stepik: Интерактивный тренажёр по SQL</b><span>Бесплатный курс с автопроверкой.</span></a>
  <a href="https://sqlbolt.com" target="_blank" rel="noopener"><b>SQLBolt</b><span>Короткие интерактивные уроки (на английском).</span></a>
  <a href="https://www.sql-ex.ru" target="_blank" rel="noopener"><b>sql-ex.ru</b><span>Классический задачник, есть рейтинг.</span></a>
  <a href="https://leetcode.com/studyplan/top-sql-50/" target="_blank" rel="noopener"><b>LeetCode SQL 50</b><span>Задачи с собеседований.</span></a>
  <a href="https://www.db-fiddle.com" target="_blank" rel="noopener"><b>DB Fiddle</b><span>Онлайн-песочница, чтобы поделиться запросом.</span></a>
</div>
<h3>Почитать и посмотреть</h3>
<div class="links">
  <a href="https://www.youtube.com/playlist?list=PLtPJ9lKvJ4oh5SdmGVusIVDPcELrJ2bsT" target="_blank" rel="noopener"><b>Andrey Sozykin: Основы SQL</b><span>Короткие понятные видео, часть из них есть в курсе.</span></a>
  <a href="https://habr.com/ru/hubs/sql/articles/" target="_blank" rel="noopener"><b>Хабр: SQL</b><span>Статьи и разборы задач.</span></a>
  <a href="https://support.microsoft.com/ru-ru/office/создание-сводной-таблицы-для-анализа-данных-листа-a9a84538-bfe9-40a9-a8e9-f99134456576" target="_blank" rel="noopener"><b>Сводные таблицы Excel</b><span>Официальная инструкция Microsoft.</span></a>
</div>`
};
