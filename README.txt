DEXAURON TELEGRAM BOT (Render-ready)
====================================

Что это
-------
Готовый Telegram-бот, работающий через GPT-5. Настроен для деплоя на Render как Web Service.
Внутри есть HTTP-сервер для health-check, так что Render не будет его останавливать.

Быстрый старт на Render (через iPhone)
--------------------------------------
1) Создай zip-архив (уже готов) и загрузи проект в Render:
   - Зайди на https://render.com → New → Web Service.
   - Source: Upload code (или подключи GitHub-репозиторий).
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm start

2) В Settings → Environment добавь переменные:
   - TELEGRAM_BOT_TOKEN=ТВОЙ_ТОКЕН_ОТ_BOTFATHER
   - OPENAI_API_KEY=ТВОЙ_OPENAI_API_KEY
   - PORT=3000 (или оставь пустым — Render задаст свой)

3) Нажми Deploy и дождись статуса Live.

4) В Telegram открой своего бота и отправь /start.

Команды
-------
/start — приветствие и краткая инструкция
/help  — список возможностей

Настройки и безопасность
------------------------
- Никогда не коммить ключи в репозиторий. Используй .env локально и переменные окружения на Render.
- Если ключи светились в публичном месте — СРОЧНО сгенерируй новые.

Расширение
----------
- Можно добавить команды (например, /report, /train, /post) — и обрабатывать их отдельно.
- Можно подключить вебхуки Telegram вместо long polling. Для этого:
  - Подними HTTPS-эндпоинт (Express уже есть).
  - Вызови setWebhook у Telegram с URL твоего сервиса.
