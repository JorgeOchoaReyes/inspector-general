import crypto from "crypto"; 
import { type Context } from "./api/trpc";

const githubApiUrl = "https://api.github.com";

export const encrypt = (text: string, key: string) => {
  const iv = crypto.randomBytes(16); 
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

export const decrypt = (text: string, key: string) => {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts?.shift() ?? "", "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

export const getUserInfo = async (ctx: Context) => { 
  const defaultAccount = { token: "", account: null };
  if(!ctx.session) {
    return defaultAccount;
  }
  const userAccount = await ctx.db.account.findFirst({
    where: { userId: ctx.session.user.id }, include: { github_accounts: true },
  });
  if(!userAccount) {
    return defaultAccount;
  }
  const githubAccount = userAccount.github_accounts[0];
  if(!githubAccount) {
    return defaultAccount;
  }
  const token = decrypt(githubAccount?.github_token, process.env.ENCRYPTION_KEY ?? "");
  return {
    token,
    account: userAccount
  };
};