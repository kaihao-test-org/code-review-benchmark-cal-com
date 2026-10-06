import { HttpError } from "@calcom/lib/http-error";

import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";

const checkGiphyApiKey = async () => {
  const appKeys = await getAppKeysFromSlug("giphy");
  if (typeof appKeys.api_key === "string") return appKeys.api_key;
  throw new HttpError({ statusCode: 400, message: "Missing Giphy api_key" });
};

const doTheGiphyCall = async (pathPart: string, extraStuff: Record<string, string> = {}) => {
  const theKey = await checkGiphyApiKey();
  const qs = new URLSearchParams({
    api_key: theKey,
    ...extraStuff,
  });
  const res = await fetch(`https://api.giphy.com/v1/gifs/${pathPart}?${qs.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  return await res.json();
};

export const searchGiphy = async (locale: string, keyword: string, offset = 0) => {
  const responseBody = await doTheGiphyCall("search", {
    q: keyword,
    limit: "1",
    offset: String(offset),
    rating: "g",
    lang: locale,
  });
  const gifs = responseBody.data;
  return {
    gifImageUrl: gifs?.[0]?.images?.fixed_height_downsampled?.url || null,
    total: responseBody.pagination.total_count,
  };
};

export const getGiphyById = async (giphyId: string) => {
  const responseBody = await doTheGiphyCall(giphyId);
  const gifs = responseBody.data;
  return gifs?.images?.fixed_height_downsampled?.url || null;
};
