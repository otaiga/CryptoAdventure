import type { NextApiRequest, NextApiResponse } from "next";
import Moralis from "moralis/node";
import { StoryChapter } from "../../story/story";

const moralisCreds = {
  appId: process.env.NEXT_PUBLIC_MORALIS_APPLICATION_ID,
  serverUrl: process.env.NEXT_PUBLIC_MORALIS_SERVER_URL,
};

if (moralisCreds.appId === undefined || moralisCreds.serverUrl === undefined) {
  throw Error("Moralis creds not present");
}
Moralis.initialize(moralisCreds.appId);
Moralis.serverURL = moralisCreds.serverUrl;

const getStoryData = async (storyId: string) => {
  try {
    const query = new Moralis.Query("Chapters");
    query.equalTo("storyId", storyId);
    query.descending("seq");
    const retrieved = await query.find();
    if (!retrieved) {
      return;
    }
    const storyTitle = retrieved[0].get("storyTitle");
    const storyImage = retrieved[0].get("storyImage");
    const storyDescription = retrieved[0].get("storyDescription");
    const seq = retrieved[0].get("seq");
    return {
      storyTitle,
      storyImage,
      storyDescription,
      seq,
    };
  } catch (err) {
    console.log(err);
    return [];
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = process.env.WEB3_API_TOKEN;
  if (!token) {
    throw Error("no token available");
  }
  const {
    query: { storyId },
    method,
  } = req;
  if (method === "GET") {
    if (typeof storyId === "string") {
      const storyData = await getStoryData(storyId);
      console.log({ storyData });
      const { storyTitle, storyImage, storyDescription, seq } =
        storyData as StoryChapter;
      const returnJson = {
        storyTitle,
        storyImage,
        storyDescription,
        seq,
      };
      if (seq) {
        returnJson.seq = seq + 1;
      }
      return res.status(200).json(returnJson);
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
