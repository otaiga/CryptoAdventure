import Moralis from "moralis";

export const queryMoralis = async (filename: string, tableName: string) => {
  try {
    const query = new Moralis.Query(tableName);
    query.equalTo("name", filename);
    const [retrieved] = await query.find();
    if (!retrieved) {
      return;
    }
    const ipfs = retrieved.get("fileData").ipfs();
    console.log({ ipfs });
    return ipfs;
  } catch (err) {
    return;
  }
};

export const storeFileToIPFSMoralis = async (
  fileData: File,
  tableName: string
) => {
  const file = new Moralis.File(fileData.name, fileData);
  await file.saveIPFS();
  const uploadedFile = new Moralis.Object(tableName);
  uploadedFile.set("name", fileData.name);
  uploadedFile.set("fileData", file);
  await uploadedFile.save();
  const fileLocation = await queryMoralis(fileData.name, tableName);
  return fileLocation;
};

export const storeObjectToIPFSMoralis = async (
  objectData: { [key: string]: any },
  tableName: string,
  name: string
) => {
  const buf = Buffer.from(JSON.stringify(objectData), "base64");
  const file = new Moralis.File("file.json", {
    base64: buf.toString("base64"),
  });
  await file.saveIPFS();
  const uploadedFile = new Moralis.Object(tableName);
  uploadedFile.set("name", name);
  uploadedFile.set("fileData", file);
  await uploadedFile.save();
};

export const storeStoryCidToMoralis = async (cid: string) => {
  const uploadedFile = new Moralis.Object("StoryList");
  uploadedFile.set("cid", cid);
  await uploadedFile.save();
};

export const listStoryIds = async () => {
  try {
    const query = new Moralis.Query("StoryList");
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
