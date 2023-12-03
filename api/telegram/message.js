const { Bot, InlineKeyboard } = require("grammy");

const allowCors = (fn) => async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

const handler = async (request, response) => {
  try {
    // verify contentful signature
    // https://www.contentful.com/developers/docs/extensibility/app-framework/request-verification/#verifying-requests-on-the-backend
    // TODO

    // verify body parameters
    const {
      media,
      textMessage,
      linkUrl,
      linkName,
      textMessageParseMode,
      channelName,
    } = request.body;

    if ((!media && !textMessage) || !channelName) {
      console.error("Missing required parameters");
      throw new Error("Missing required parameters");
    }

    // create bot
    const telegramBot = new Bot(process.env.BOT_TOKEN);

    // create link if available
    let inlineLink;
    if (linkUrl) {
      inlineLink = new InlineKeyboard().url(linkName || "Read more", linkUrl);
    }

    // understand what type of message you need to send
    if (media) {
      // sending media type message (w/ optional link). Media can be video or simple image. We use two different methods
      const mediaMethod = media.endsWith(".mp4") ? "sendVideo" : "sendPhoto";

      await telegramBot.api[mediaMethod](channelName, media, {
        parse_mode: textMessageParseMode,
        ...(textMessage && { caption: textMessage }),
        ...(inlineLink && { reply_markup: inlineLink }),
      });
    } else {
      // sending simple text message (w/ optional link)
      await telegramBot.api.sendMessage(channelName, textMessage, {
        parse_mode: textMessageParseMode,
        ...(inlineLink && { reply_markup: inlineLink }),
      });
    }

    response.status(200).json({ status: "ok" });
  } catch (e) {
    console.error(e);
    return response.status(500).json({ error: e });
  }
};

module.exports = allowCors(handler);
