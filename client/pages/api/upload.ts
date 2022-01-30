// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Web3Storage, File } from "web3.storage";
import { v4 as uuidv4 } from "uuid";
import { encrypt } from "../../helpers/encryption";
import Moralis from "moralis/node";
import { StoryChapter } from "../story/story";

const moralisCreds = {
  appId: process.env.NEXT_PUBLIC_MORALIS_APPLICATION_ID,
  serverUrl: process.env.NEXT_PUBLIC_MORALIS_SERVER_URL,
};

if (moralisCreds.appId === undefined || moralisCreds.serverUrl === undefined) {
  throw Error("Moralis creds not present");
}
Moralis.initialize(moralisCreds.appId);
Moralis.serverURL = moralisCreds.serverUrl;

const rawId = () => uuidv4().split("-").join("");

const uploadChapterData = async (
  client: Web3Storage,
  chapterData: any,
  encryptKey: string
) => {
  const jsonChaperData = JSON.stringify(chapterData);
  console.log("uploading: ", jsonChaperData);
  const encryptedChapterData = encrypt(jsonChaperData, encryptKey);

  const file = new File(
    [Buffer.from(encryptedChapterData)],
    `${rawId()}.json`,
    {
      type: "application/json",
    }
  );
  const cid = await client.put([file], { wrapWithDirectory: false });
  return cid;
};

// only using one story here for all chapter meta data
const uploadStoryData = async (
  client: Web3Storage,
  chapterCid: string,
  storyChapter: any
) => {
  storyChapter.ipfsId = chapterCid;
  const file = new File(
    [Buffer.from(JSON.stringify(storyChapter))],
    `${rawId()}.json`,
    {
      type: "application/json",
    }
  );
  const cid = await client.put([file], { wrapWithDirectory: false });
  return cid;
};

const storeChapterDataToMoralis = async (
  cid: string,
  metaData: StoryChapter,
  chapterData: any,
  userId: string,
  account: string,
  chapterCid: string
) => {
  const chapters = new Moralis.Object("Chapters");
  const chapter = new Moralis.Object("Chapter");
  chapters.set("cid", cid);
  chapters.set("ownerId", userId);
  chapter.set("storyText", JSON.stringify(chapterData));
  chapter.set("sender", account);
  chapter.set("ipfsId", chapterCid);
  Object.entries(metaData).map(([k, v]) => {
    chapters.set(k, v);
  });
  await chapters.save();
  await chapter.save();
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = process.env.WEB3_API_TOKEN;
  const encryptKey = process.env.ENCRYPT_KEY;
  if (!token) {
    throw Error("no token available");
  }
  if (!encryptKey) {
    throw Error("no encrypt key available");
  }
  if (req.method === "POST") {
    const metaData = req.body.metaData;
    const chapterData = req.body.chapterData;
    const userId = req.body.owner;
    const storyId = req.body.storyId ? req.body.storyId : rawId();
    const account = req.body.account;
    console.log({ metaData, chapterData, userId, storyId, account });
    metaData.storyId = storyId;
    const client = new Web3Storage({ token });
    const chapterCid = await uploadChapterData(client, chapterData, encryptKey);
    const cid = await uploadStoryData(client, chapterCid, metaData);
    await storeChapterDataToMoralis(
      cid,
      metaData,
      chapterData,
      userId,
      account,
      chapterCid
    );
    return res.status(200).json({ cid });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
