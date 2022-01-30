const { Requester, Validator } = require("@chainlink/external-adapter");
const Web3Storage = require("web3.storage").Web3Storage;
const Moralis = require("moralis/node");
const { decrypt } = require("./helpers/encryption");

require("dotenv").config();

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === "Error") return true;
  return false;
};

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.
const customParams = {
  cid: ["cid"],
  request_id: ["request_id"],
  sender: ["sender"],
};

const getFromIPFS = async (cid) => {
  const client = new Web3Storage({ token: process.env.WEB3STORAGE_API_KEY });
  const res = await client.get(cid);
  console.log(`Got a response! [${res.status}] ${res.statusText}`);
  if (!res.ok) {
    throw new Error(`Failed to get from IPFS: ${cid}`);
  }

  const files = await res?.files();
  return await files[0].text();
};

const intFromBytes = (bytes) =>
  bytes.reduce((a, c, i) => a + c * 2 ** (56 - i * 8), 0);

const initMoralis = async () => {
  try {
    const serverUrl = process.env.MORALIS_SERVER_URL;
    const appId = process.env.MORALIS_APPLICATION_ID;
    await Moralis.start({ serverUrl, appId });
  } catch (err) {
    console.log(err);
  }
};

initMoralis();

const saveToMoralis = async (sender, storyText, cid) => {
  try {
    const Chapter = Moralis.Object.extend("Chapter");
    const chapter = new Chapter();
    chapter.set("sender", `0x${sender}`);
    chapter.set("storyText", storyText);
    chapter.set("ipfsId", cid);
    const result = await chapter.save();
    console.log("New chapter saved with objectId: " + result.id);
  } catch (err) {
    console.log("Failed to save new chapter, with error code: " + err.message);
    throw new Error(`Failed to save chapter to Moralis. ${err.message}`);
  }
};

const createRequest = async (input, callback) => {
  const validator = new Validator(input, customParams);
  const jobRunId = validator.validated.id;
  const cid = validator.validated.data.cid;
  const sender = validator.validated.data.sender;
  const requestId = intFromBytes(validator.validated.data.request_id);
  console.log(`requestId:${requestId}`);
  try {
    const cipherText = await getFromIPFS(cid);
    const text = decrypt(cipherText);

    saveToMoralis(sender, text, cid);

    callback(200, {
      cid: cid,
    });
  } catch (err) {
    callback(500, { id: jobRunId, err });
  }
};

// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data);
  });
};

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data);
  });
};

// This is a wrapper to allow the function to work with
// newer AWS Lambda implementations
exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false,
    });
  });
};

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest;
