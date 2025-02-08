import { getUserInfo } from "../../server_util";
import { z } from "zod"; 
import {
  createTRPCRouter,
  protectedProcedure, 
} from "~/server/api/trpc";
import { v4 as uuid } from "uuid";
import { Octokit } from "@octokit/core";  
import type { Endpoints } from "@octokit/types";
 
type listUserReposResponse = Endpoints["GET /repos/{owner}/{repo}/pulls"]["response"];

export const pullRequestRouter = createTRPCRouter({ 
  listPullRequest: protectedProcedure
    .input(z.object({ 
      repo: z.string(),
      filterPullRequest: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const { filterPullRequest, repo } = input;
      if(!repo || repo === "") {
        return { success: [] };
      }
      if(!ctx.session) {
        return { success: [] };
      }
      try { 
        const userInfo = await getUserInfo(ctx);
        if(!userInfo) {
          return { success: [] };
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

        const listPrs = pullRequest as listUserReposResponse;
        
        if(!listPrs) {
          return { success: [] };
        } 

        return { success: listPrs.data };
      } catch (error) {
        console.error(error);
        return { success: [] };
      }
    }), 

});
