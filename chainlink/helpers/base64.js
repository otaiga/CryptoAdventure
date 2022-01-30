const base64Encode = (text) => Buffer.from(text).toString("base64");

const base64Decode = (base64Text) =>
  Buffer.from(base64Text, "base64").toString("utf-8");

module.exports = { base64Decode, base64Encode };
