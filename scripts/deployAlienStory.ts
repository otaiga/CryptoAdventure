import { Web3Storage, File } from "web3.storage";
import { v4 as uuidv4 } from "uuid";
import { encrypt } from "../client/helpers/encryption";
import Moralis from "moralis/node";
import { StoryChapter } from "../client/pages/story/story";
import { rawJson } from "../rawStory";
import { ethers } from "hardhat";
import {
  FUJI_STORY_LIBRARY_CONTRACT_ADDRESS,
  FUJI_COLLECTIBLES_CONTRACT_ADDRESS,
} from "../client/fuji_contract_addresses";
import StoryLibrary from "../artifacts/contracts/StoryLibrary.sol/StoryLibrary.json";
import collectibles from "../artifacts/contracts/Collectibles.sol/Collectibles.json";
import { config } from "dotenv";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

config();
const token = process.env.WEB3_API_TOKEN;
const encryptKey = process.env.ENCRYPT_KEY;

const moralisCreds = {
  appId: process.env.MORALIS_APPLICATION_ID,
  serverUrl: process.env.MORALIS_SERVER_URL,
};

if (!token) {
  throw Error("no token available");
}
if (!encryptKey) {
  throw Error("no encrypt key available");
}

if (moralisCreds.appId === undefined || moralisCreds.serverUrl === undefined) {
  throw Error("Moralis creds not present");
}
try {
  Moralis.initialize(moralisCreds.appId);
  Moralis.serverURL = moralisCreds.serverUrl;
} catch (err) {
  throw err;
}

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

const setStoryContract = async (cid: string) =>
  new Promise(async (resolve, reject) => {
    //Get signer information
    const accounts = await ethers.getSigners();
    const signer = accounts[0];

    const libraryContract = new ethers.Contract(
      FUJI_STORY_LIBRARY_CONTRACT_ADDRESS,
      StoryLibrary.abi,
      signer
    );
    await libraryContract.setChapter(cid, {
      value: ethers.utils.parseEther("0.01"),
    });
  });

const mintCollectable = async (signer: SignerWithAddress) => {
  const cid = "bafkreifyzcntlasvz6gfcs2hnfccklzqtrccnc6egikdlvv7einfc73ste";
  return new Promise(async (resolve, reject) => {
    try {
      const collectiblesContract = new ethers.Contract(
        FUJI_COLLECTIBLES_CONTRACT_ADDRESS,
        collectibles.abi,
        signer
      );
      const res = await collectiblesContract.mintToken(5, cid);
      const receipt = await res.wait();
      const token = Number(receipt.events[0].args[3]);
      return resolve(token);
    } catch (err) {
      console.log(err);
      return reject(err);
    }
  });
};

export const processUpload = async (
  signer: SignerWithAddress,
  collectibleToken: number
) => {
  const account = signer.address;
  const metaData: any = {
    storyTitle: "Aboard the Moralis",
    storyImage: "bafkreidulxvrz7p3n3ea4vxkuqd4rotefccox7fm5xweunhkd2hqdtbp5a",
    storyDescription: "A space adventure horror",
    seq: 1,
    chapterTitle: "The Awakening",
    chapterDescription:
      "Brought back to consciousness from hypersleep, but something is terribly wrong. You are not where you're supposed to be and it looks like you're in trouble..",
  };
  const chapterData = rawJson;
  chapterData.breach = {
    ...chapterData.breach,
    ...{ collectable: collectibleToken },
  };
  const userId = "M04QrMvg4dT7i1TsaiOhgHAY";
  const storyId = rawId();
  console.log("uploading: ", {
    metaData,
    chapterData,
    userId,
    storyId,
    account,
  });
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
  await setStoryContract(cid);
  console.log("done");
};

async function main() {
  const signers = await ethers.getSigners();
  const signer = signers[0];
  const collectibleToken = await mintCollectable(signer);
  if (typeof collectibleToken === "number") {
    await processUpload(signer, collectibleToken);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
