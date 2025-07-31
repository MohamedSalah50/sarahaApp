import crypto from "crypto-js";

export const generateEncryption = async ({
  plainText = "",
  secretKey = process.env.ENC_SECRET_KEY,
} = {}) => {
  return crypto.AES.encrypt(plainText, secretKey).toString();
};

export const decryptEncryption = async ({
  cipherText = "",
  secretKey = process.env.ENC_SECRET_KEY,
} = {}) => {
  return crypto.AES.decrypt(cipherText, secretKey).toString(crypto.enc.Utf8);
};
