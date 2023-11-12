import contentful from "contentful-management";
import { Bot, InlineKeyboard } from "grammy";

export const cmaClient = (environmentId: string, spaceId: string) =>
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

export const sendTelegramPhoto = async (
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
