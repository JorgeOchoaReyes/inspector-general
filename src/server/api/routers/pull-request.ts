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
type UserReposResponse = Endpoints["GET /repos/{owner}/{repo}/pulls/{pull_number}"]["response"];
type GetRepo = Endpoints["GET /repos/{owner}/{repo}"]["response"];

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
  getPullRequest: protectedProcedure
    .input(z.object({ 
      repo: z.string(),
      pullRequestNumber: z.number()
    }))
    .query(async ({ ctx, input }) => {
      const { repo, pullRequestNumber } = input;
      
      
      if(!repo || repo === "" || typeof pullRequestNumber !== "number") {
        return { success: null };
      }
      if(!ctx.session) {
        return { success: null };
      }
      try { 
        const userInfo = await getUserInfo(ctx);
        if(!userInfo) {
          return { success: null };
        }
        const { token } = userInfo; 
        const github = new Octokit({ auth: token }); 
        const owner = userInfo.account?.github_accounts[0]?.login ?? ""; 
        const pullRequest = await github.request(`GET /repos/${owner}/${repo}/pulls/${pullRequestNumber}`, {
          owner: "OWNER",
          repo: "REPO",
          headers: {
            "X-GitHub-Api-Version": "2022-11-28"
          }
        });   

        const pr = (pullRequest as UserReposResponse).data;
        
        if(!pr) {
          return { success: null };
        }

        const getTextFromDiffFile = await fetch(pr.diff_url); 
        const diffText = await getTextFromDiffFile.text();

        const results = {
          ...pr,
          diff_text: diffText
        } as UserReposResponse["data"] & { diff_text: string };

        return { success: results };
      } catch (error) {
        console.error(error);
        return { success: null };
      }
    }), 
});
