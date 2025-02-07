import { decrypt, encrypt, getUserInfo } from "../../server_util";
import { z } from "zod"; 
import {
  createTRPCRouter,
  protectedProcedure, 
} from "~/server/api/trpc";
import { v4 as uuid } from "uuid";
import { Octokit } from "@octokit/core";  

export const pullRequestRouter = createTRPCRouter({ 
  listPullRequest: protectedProcedure
    .input(z.object({ 
      repo: z.string().min(1),
      filterPullRequest: z.string().min(1)
    }))
    .query(async ({ ctx, input }) => {
      const { filterPullRequest, repo } = input;
      if(!repo || repo === "") {
        return { success: false };
      }
      if(!ctx.session) {
        return { success: false };
      }
      try { 
        const userInfo = await getUserInfo(ctx);
        if(!userInfo) {
          return { success: false };
        }
        const { token } = userInfo; 
        const github = new Octokit({ auth: token }); 
        const owner = userInfo.account?.github_accounts[0]?.login ?? "";

        const pullRequest = await github.request(`GET /repos/${owner}/${repo}/pulls`, {
          owner: "OWNER",
          repo: "REPO",
          state: filterPullRequest ?? "open",
          headers: {
            "X-GitHub-Api-Version": "2022-11-28"
          }
        });  
 
        return { success: pullRequest };
      } catch (error) {
        console.error(error);
        return { success: false };
      }
    }), 

});
