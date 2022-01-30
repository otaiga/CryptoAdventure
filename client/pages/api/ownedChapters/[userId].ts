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

const listChapters = async (userId: string) => {
  try {
    const query = new Moralis.Query("ChaptersOwned");
    query.equalTo("userId", userId);
    const retrieved = await query.find();
    if (!retrieved) {
      return [];
    }
    return retrieved;
  } catch (err) {
    console.log(err);
    return [];
  }
};

const storeChapterDataToMoralis = async (
  storyChapter: StoryChapter,
  userId: string
) => {
  const chapter = new Moralis.Object("ChaptersOwned");
  chapter.set("userId", userId);
  Object.entries(storyChapter).map(([k, v]) => {
    chapter.set(k, v);
  });
  await chapter.save();
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = process.env.WEB3_API_TOKEN;
  if (!token) {
    throw Error("no token available");
  }
  const {
    query: { userId },
    method,
  } = req;
  if (typeof userId !== "string") {
    return res.status(404);
  }
  switch (method) {
    case "GET":
      const chaptersData = await listChapters(userId);
      return res.status(200).json(chaptersData);
    case "POST":
      try {
        //todo get chaperId data and decrypt it and re-encrypt with user secret/wallet
        const storyChapter = req.body.storyChapter;
        const removeFields = ["createdAt", "updatedAt", "objectId", "ACL"];
        removeFields.map((field) => delete storyChapter[field]);
        await storeChapterDataToMoralis(storyChapter, userId);
        return res.status(200).json({ cid: storyChapter.cid });
      } catch (err) {
        console.log(err);
        return res.status(500).send("something went wrong");
      }
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
