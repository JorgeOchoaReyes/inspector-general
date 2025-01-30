import { decrypt, encrypt } from "../../server_util";
import { z } from "zod"; 
import {
  createTRPCRouter,
  protectedProcedure, 
} from "~/server/api/trpc";

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
        const encryptedToken = encrypt(token, process.env.ENCRYPTION_KEY ??  "");
        await ctx.db.account.updateMany({
          where: { userId: id, user: { id } },
          data: { github_personal_token: encryptedToken },
        });
        return { success: true };
      } catch (error) {
        console.error(error);
        return { success: false };
      }
    }), 
  readGitHubAccessToken: protectedProcedure
    .query(async ({ ctx }) => {
      if(!ctx.session) {
        return { token: null };
      }
      const { user } = ctx.session;
      const { id } = user;
      const account = await ctx.db.account.findFirstOrThrow({
        where: { userId: id },
        select: { github_personal_token: true },
      });
      if(!account) {
        return { token: null };
      }
      const encryptedToken = account.github_personal_token;
      if(!encryptedToken) {
        return { token: null };
      }
      const decryptedToken = decrypt(encryptedToken, process.env.ENCRYPTION_KEY ?? "");
      return { token: decryptedToken };
    }),
  deleteGitHubAccessToken: protectedProcedure
    .mutation(async ({ ctx }) => {
      if(!ctx.session) {
        return { success: false };
      }
      const { user } = ctx.session;
      const { id } = user;
      await ctx.db.account.updateMany({
        where: { userId: id, user: { id } },
        data: { github_personal_token: null },
      });
      return { success: true };
    }),
});
