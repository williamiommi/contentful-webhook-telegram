import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cmaClient, sendTelegramPhoto } from "../lib/utils";

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

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
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
      `Hello subscribers!! We just released a new recipe.<br/>Today's recipe is <strong>${data.title}</strong>`,
      "Read more",
      `https://yourawesomewebsite.com/${data.slug}`
    );
  } catch (e: any) {
    console.error(e);
    return response.status(500).json({ error: e });
  }

  response.status(200).send("");
}
