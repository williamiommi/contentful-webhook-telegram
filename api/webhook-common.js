import { createClient } from "contentful-management";
import { Bot, InlineKeyboard } from "grammy";

const DEFAULT_LOCALE = "en-US";

const cmaClient = (environmentId, spaceId) =>
  createClient(
    {
      accessToken: process.env.CMA_TOKEN,
    },
    { type: "plain", defaults: { environmentId, spaceId } }
  );

const getInlineLink = (linkText, linkUrl) => {
  if (!linkText || !linkUrl) return undefined;
  return new InlineKeyboard().url(linkText, linkUrl);
};

const sendTelegramPhoto = async (photoUrl, caption, linkText, linkUrl) => {
  const bot = new Bot(String(process.env.BOT_TOKEN));
  const inlineLink = getInlineLink(linkText, linkUrl);

  await bot.api.sendPhoto(String(process.env.TELEGRAM_CHANNEL), photoUrl, {
    ...(caption && { parse_mode: "HTML", caption }),
    ...(inlineLink && { reply_markup: inlineLink }),
  });
};

module.exports = async (request, response) => {
  try {
    // accept only POST
    if (request.method?.toUpperCase() !== "POST")
      return response.status(405).json({ error: "Method Not Allowed" });

    const { environmentId, spaceId, data } = request.body;

    if (
      !environmentId ||
      !spaceId ||
      !data.title ||
      !data.slug ||
      !data.assetId
    )
      throw Error("Data is missing");

    //get contentful client
    const client = cmaClient(environmentId, spaceId);

    //retrieve the image
    const asset = await client.asset.get({ assetId: data.assetId });
    const assetUrl = asset.fields.file[DEFAULT_LOCALE].url;
    if (!assetUrl) throw Error("Image URL is missing");

    //sending message
    await sendTelegramPhoto(
      `https:${assetUrl}`,
      `Hello subscribers!! We just released a new recipe.\nToday's recipe is <strong>${data.title}</strong>`,
      "Read more",
      `https://yourawesomewebsite.com/${data.slug}`
    );
  } catch (e) {
    console.error(e);
    return response.status(500).json({ error: e });
  }

  response.status(200).send("");
};
