import { createClient } from "contentful-management";
import { Bot, InlineKeyboard } from "grammy";

module.exports = async (request, response) => {
  try {
    // accept only POST
    if (request.method?.toUpperCase() !== "POST") {
      return response.status(405).json({ error: "Method Not Allowed" });
    }

    const { environmentId, spaceId, data } = request.body;
    if (
      !environmentId ||
      !spaceId ||
      !data.title ||
      !data.slug ||
      !data.assetId
    ) {
      throw Error("Data is missing");
    }

    // create CMA Client
    const cmaClient = createClient(
      { accessToken: process.env.CMA_TOKEN },
      { type: "plain", defaults: { environmentId, spaceId } }
    );

    // get the image url from Contentful
    const asset = await cmaClient.asset.get({ assetId: data.assetId });
    const photoUrl = asset.fields.file["en-US"].url;
    if (!photoUrl) throw Error("Asset URL is missing");

    // sending message to Telegram Channel
    const bot = new Bot(process.env.BOT_TOKEN);
    const inlineLink = new InlineKeyboard().url(
      "Read more",
      `https://yourawesomewebsite.com/${data.slug}`
    );

    await bot.api.sendPhoto(process.env.TELEGRAM_CHANNEL, `https:${photoUrl}`, {
      parse_mode: "HTML",
      caption: `Hello subscribers!! We just released a new recipe.\n\nToday's recipe is <strong>${data.title}</strong>`,
      reply_markup: inlineLink,
    });

    response.status(200).send("");
  } catch (e) {
    console.error(e);
    return response.status(500).json({ error: e });
  }
};
