import { decrypt, encrypt } from "../../server_util";
import { z } from "zod"; 
import {
  createTRPCRouter,
  protectedProcedure, 
} from "~/server/api/trpc";
import { Octokit } from "@octokit/core";

export const githubRouter = createTRPCRouter({ 
  saveGitHubAccessToken: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { token } = input;
      if(!ctx.session) {
        return { success: false };
      }
      try {
        const { user } = ctx.session;
        const { id } = user;

        const userInfo = await new Octokit({ auth: token }).request("GET /user");
        if(userInfo.status !== 200) {
          return { success: false };
        }

        const { data } = userInfo;
        const username = data.login;
        const publicRepos = data.public_repos;
        const privateRepos = data.total_private_repos;
        const userImage = data.avatar_url;
        const githubId = data.id.toString();
        const encryptedToken = encrypt(token, process.env.ENCRYPTION_KEY ??  "");

        const account = await ctx.db.account.findFirst({
          where: { userId: id },
        });

        if(!account) {
          return { success: false };
        }
        
        await ctx.db.gitHubAccount.upsert({
          where: { id: githubId },
          create: {
            id: githubId,
            login: username,
            public_repos: publicRepos,
            private_repos: privateRepos ?? 0, 
            avatar_url: userImage,
            github_token: encryptedToken,
            accountId: account.id, 
          }, 
          update: {
            login: username,
            public_repos: publicRepos,
            private_repos: privateRepos ?? 0, 
            avatar_url: userImage,
            github_token: encryptedToken,
            accountId: account.id, 
          },
        });
        
        return { success: true };
      } catch (error) {
        console.error(error);
        return { success: false };
      }
    }), 
  readGitHubAccessTokens: protectedProcedure
    .query(async ({ ctx }) => {
      if(!ctx.session) {
        return { token: null };
      }
      try {
        const { user } = ctx.session;
        const { id } = user;
        const account = await ctx.db.account.findFirstOrThrow({
          where: { userId: id },
          select: { 
            github_accounts: true
          },
        });
        if(!account) {
          return { token: null, account: null };
        }
        const githubAccounts = account.github_accounts;
        if(githubAccounts.length === 0) {
          return { token: null, account: null };
        }
        const githubAccount = githubAccounts[0];
        if(!githubAccount) {
          return { token: null, account: null };
        }
        const encryptedToken = githubAccount.github_token;
        if(!encryptedToken) {
          return { token: null, account: null };
        }
        const decryptedToken = decrypt(encryptedToken, process.env.ENCRYPTION_KEY ?? "");
        return { token: decryptedToken, account: githubAccount };
      } catch (error) {
        console.error(error);
        return { token: null, account: null };
      } 
    }),
  deleteGitHubAccessToken: protectedProcedure
    .input(z.object({
      token: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      if(!ctx.session) {
        return { success: false };
      }
      const { user } = ctx.session;
      const githubToken = input.token;
      const encryptedToken = encrypt(githubToken, process.env.ENCRYPTION_KEY ?? "");
      
      await ctx.db.gitHubAccount.deleteMany({
        where: {
          github_token: encryptedToken,
        },
      });
      return { success: true };
    }),
});
