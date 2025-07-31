import bcrypt from "bcrypt";

export const generateHash = async ({
  plainText = "",
  saltRound = process.env.SALT_ROUND,
} = {}) => {
  return bcrypt.hashSync(plainText, parseInt(saltRound));
};

export const compareHash = async ({ plainText = "", cipherText = "" } = {}) => {
  return bcrypt.compare(plainText, cipherText);
};
