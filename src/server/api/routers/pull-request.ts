import { getUserInfo } from "../../server_util";
import { z } from "zod"; 
import {
  createTRPCRouter,
  protectedProcedure, 
} from "~/server/api/trpc";
import { v4 as uuid } from "uuid";
import { Octokit } from "@octokit/core";  
import type { Endpoints } from "@octokit/types";
import { list } from "postcss";
 
type listUserReposResponse = Endpoints["GET /repos/{owner}/{repo}/pulls"]["response"];
type UserReposResponse = Endpoints["GET /repos/{owner}/{repo}/pulls/{pull_number}"]["response"]; 

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
  listSyncedPullRequest: protectedProcedure
    .input(z.object({ 
      cursor: z.string().optional()
    }))
    .query(async ({ ctx, input }) => { 
      if(!ctx.session) {
        return { success: [] };
      }
      try { 
        const db = ctx.db;
       
        const userInfo = await getUserInfo(ctx);
        if(!userInfo) {
          return { success: [] };
        }
        
        const getGithubAccount = userInfo.account?.github_accounts[0];
        if(!getGithubAccount) {
          return { success: [] };
        }

        const getRepos = await db.gitHubRepo.findMany({
          where: {
            accountId: getGithubAccount.id
          },
        }); 

        if(getRepos.length === 0) {
          return { success: [] };
        }

        const findPullRequest = await Promise.all(getRepos.map(async (repo) => {
          const githubRepoId = repo.id;
          const pullRequsts = await db.gitHubPullRequest.findMany({
            where: {
              githunRepoId: githubRepoId
            }
          });
          const addTitleOfRepo = pullRequsts.map((pr) => {
            return {
              ...pr,
              repoName: repo.name
            };
          }); 
          return addTitleOfRepo;
        }));

        if(findPullRequest.length === 0) {
          return { success: [] };
        }

        const listPrs = findPullRequest;
        
        const flattenList = listPrs.flat();

        return { success: flattenList };
 
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
