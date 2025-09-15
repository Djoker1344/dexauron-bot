  import dotenv from "dotenv";
  import express from "express";
  import TelegramBot from "node-telegram-bot-api";
  import OpenAI from "openai";

  dotenv.config();

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const PORT = process.env.PORT || 3000;

  if (!TELEGRAM_BOT_TOKEN) {
    console.error("❌ Missing TELEGRAM_BOT_TOKEN env var");
    process.exit(1);
  }
  if (!OPENAI_API_KEY) {
    console.error("❌ Missing OPENAI_API_KEY env var");
    process.exit(1);
  }

  // Minimal HTTP server for Render health checks
  const app = express();
  app.get("/", (_req, res) => res.status(200).send("Dexauron bot is running."));
  app.listen(PORT, () => {
    console.log(`✅ HTTP health server listening on port ${PORT}`);
  });

  // Init Telegram bot (long polling)
  const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  // Register bot commands
  try {
    await bot.setMyCommands([
      { command: "start", description: "Приветствие и краткая инструкция" },
      { command: "help", description: "Описание возможностей бота" }
    ]);
  } catch (e) {
    console.warn("⚠️ Failed to set commands:", e.message);
  }

  const welcomeMessage = (name) => `👋 Ассаламу алейкум, ${name || "друг"}!

Я — *Dexauron*, твой персональный ассистент.
Пиши любой вопрос: бизнес, 1С, Excel, тренировки, питание, дисциплина — отвечу чётко и по делу.

⚡ Команды:
/start — показать это сообщение
/help — краткая помощь

Совет: просто напиши обычное сообщение — я отвечу.
`;

  bot.onText(/^\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const name = msg.from?.first_name || "Адам";
    await bot.sendMessage(chatId, welcomeMessage(name), { parse_mode: "Markdown" });
  });

  bot.onText(/^\/help/, async (msg) => {
    const chatId = msg.chat.id;
    const help = `Я отвечаю на любые вопросы. Примеры:
- "Составь план тренировки на неделю"
- "Сделай пост в Instagram про 1С"
- "Как исправить двойную номенклатуру на кассе?"
- "Дай чек-лист по сну и энергии"

Просто напиши сообщение — я отвечу.`;
    await bot.sendMessage(chatId, help);
  });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text || "";

    // ignore commands (handled above)
    if (text.startsWith("/")) return;

    try {
      await bot.sendChatAction(chatId, "typing");

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content:
              "Ты — Dexauron: строгий, честный, уважающий ислам цифровой наставник Адама. Отвечай кратко, конкретно, без воды, со списками и шагами. Учитывай цели: здоровье, дисциплина, бизнес 1С, блогинг, автоматизация. Не льсти, не ври, предупреждай о рисках."
          },
          { role: "user", content: text }
        ]
      });

      const reply = response?.choices?.[0]?.message?.content?.trim() || "Не удалось получить ответ. Попробуй ещё раз.";
      await bot.sendMessage(chatId, reply);
    } catch (err) {
      console.error("OpenAI/Telegram error:", err);
      await bot.sendMessage(chatId, "Произошла ошибка при обработке запроса. Попробуй ещё раз.");
    }
  });

  process.on("uncaughtException", (e) => console.error("Uncaught:", e));
  process.on("unhandledRejection", (e) => console.error("Unhandled:", e));
