import type { VercelRequest, VercelResponse } from "@vercel/node";
import contentful from "contentful-management";
import { Bot, InlineKeyboard } from "grammy";

const DEFAULT_LOCALE = "en-US";

interface ContentfulPayload {
  environmentId: string;
  spaceId: string;
  entityId: string;
  data: {
    title: string;
    slug: string;
    assetId: string;
  };
}

const cmaClient = (environmentId: string, spaceId: string) =>
  contentful.createClient(
    {
      accessToken: process.env.CMA_TOKEN!,
    },
    { type: "plain", defaults: { environmentId, spaceId } }
  );

const getInlineLink = (linkText?: string, linkUrl?: string) => {
  if (!linkText || !linkUrl) return undefined;
  return new InlineKeyboard().url(linkText, linkUrl);
};

const sendTelegramPhoto = async (
  photoUrl: string,
  caption?: string,
  linkText?: string,
  linkUrl?: string
) => {
  const bot = new Bot(String(process.env.BOT_TOKEN));
  const inlineLink = getInlineLink(linkText, linkUrl);

  await bot.api.sendPhoto(String(process.env.TELEGRAM_CHANNEL), photoUrl, {
    ...(caption && { parse_mode: "HTML", caption }),
    ...(inlineLink && { reply_markup: inlineLink }),
  });
};

const handler = async (request: VercelRequest, response: VercelResponse) => {
  try {
    // accept only POST
    if (request.method?.toUpperCase() !== "POST")
      return response.status(405).json({ error: "Method Not Allowed" });

    const { environmentId, spaceId, data } = request.body as ContentfulPayload;

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
  } catch (e: any) {
    console.error(e);
    return response.status(500).json({ error: e });
  }

  response.status(200).send("");
};

export default handler;
