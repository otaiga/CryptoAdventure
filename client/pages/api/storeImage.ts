import type { NextApiRequest, NextApiResponse } from "next";
import { Web3Storage, File } from "web3.storage";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false,
  },
};

const storeImage = async (client: Web3Storage, imageBlob: Buffer) => {
  const id = uuidv4().split("-").join("");
  const imageFile = new File([imageBlob], `${id}.png`, {
    type: "image/png",
  });
  const cid = await client.put([imageFile], { wrapWithDirectory: false });
  return cid;
};

const blobPayloadParser = (req: NextApiRequest): Promise<Buffer> =>
  new Promise((resolve) => {
    let data: Uint8Array[] = [];
    req.on("data", (chunk) => {
      data.push(chunk);
    });
    req.on("end", () => {
      resolve(Buffer.concat(data));
    });
  });

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = process.env.WEB3_API_TOKEN;
  if (!token) {
    return res.status(500).end("unauthorised");
  }
  if (req.method === "POST") {
    const data = await blobPayloadParser(req);
    const client = new Web3Storage({ token });
    const imageId = await storeImage(client, data);
    console.log({ imageId });
    return res.status(200).json({ imageId });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
