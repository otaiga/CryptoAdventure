import type { NextApiRequest, NextApiResponse } from "next";
import Moralis from "moralis/node";

const moralisCreds = {
  appId: process.env.NEXT_PUBLIC_MORALIS_APPLICATION_ID,
  serverUrl: process.env.NEXT_PUBLIC_MORALIS_SERVER_URL,
};

if (moralisCreds.appId === undefined || moralisCreds.serverUrl === undefined) {
  throw Error("Moralis creds not present");
}
Moralis.initialize(moralisCreds.appId);
Moralis.serverURL = moralisCreds.serverUrl;

const listChapters = async () => {
  try {
    const query = new Moralis.Query("Chapters");
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

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = process.env.WEB3_API_TOKEN;
  if (!token) {
    throw Error("no token available");
  }
  if (req.method === "GET") {
    const chaptersData = await listChapters();
    return res.status(200).json(chaptersData);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
