import { z } from "zod"; 
import {
  createTRPCRouter,
  publicProcedure, 
} from "~/server/api/trpc"; 
import { Octokit } from "@octokit/core";  
import type { Endpoints } from "@octokit/types";  
import { inspector_general } from "~/server/server_util";
  
type getPullRequestResponse = Endpoints["GET /repos/{owner}/{repo}/pulls/{pull_number}"]["response"];
type UserReposResponse = Endpoints["GET /repos/{owner}/{repo}/pulls/{pull_number}"]["response"]; 
type getPullRequestFilesResponse = Endpoints["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"]["response"]; 

export const demoInspectorGeneralRouter = createTRPCRouter({  
  analyzePullRequest: publicProcedure
    .input(z.object({ 
      publicPullRequestURL: z.string().min(1)
    }))
    .mutation(async function* ({ input }) {
      const { publicPullRequestURL } = input; 

      if(!publicPullRequestURL || publicPullRequestURL === "" || !process.env.GH_TOKEN_DEMO) {
        return { success: null };
      } 
      try {  
        const github = new Octokit({
          auth: process.env.GH_TOKEN_DEMO ?? ""
        }); 
        // https://github.com/{owner}/{repo}/pull/{pullRequestNumber}

        const urlParts = publicPullRequestURL.split("/");
        const owner = urlParts[3];
        const repo = urlParts[4];
        const pullRequestNumber = urlParts[6];

        if(!owner || !repo || !pullRequestNumber) {
          return { success: null };
        }

        const pullRequest = await github.request(`GET /repos/${owner}/${repo}/pulls/${pullRequestNumber}`, {
          owner: "OWNER",
          repo: "REPO",
          headers: {
            "X-GitHub-Api-Version": "2022-11-28"
          }
        });   
        const pr = (pullRequest as UserReposResponse).data;
        
        if(!pr) { return { success: null }; }

        const getTextFromDiffFile = await fetch(pr.diff_url); 
        const diffText = await getTextFromDiffFile.text(); 

        const listPullRequestFiles = await github.request(`GET /repos/${owner}/${repo}/pulls/${pullRequestNumber}/files`, {
          owner: "OWNER",
          repo: "REPO",
          pull_number: "PULL_NUMBER",
          headers: {
            "X-GitHub-Api-Version": "2022-11-28"
          }
        }); 
        let files = listPullRequestFiles.data as getPullRequestFilesResponse["data"];
        // Filter package.lock files
        files = files.filter((file) => !file.filename.includes("package-lock.json"));
    
        const fileContents = await Promise.all(files.map(async (file) => { 
          try {
            const getFileContent = await github.request(`GET /repos/${owner}/${repo}/contents/${file.filename}`, {
              owner: "OWNER",
              repo: "REPO",
            });
            const fileContent = getFileContent.data as {
                content: string;
              }; 
            const contentToString = Buffer.from(fileContent.content, "base64").toString("utf-8");
            return {
              filename: file.filename,
              content: contentToString
            };
          } catch (error) {
            return {
              filename: file.filename,
              content: "Unable to retrieve file content."
            };
          } 
        })); 

        const instructions =  `
            You a senior software engineer. You are asked to provide a code review focusing ONLY on potential issues
            and anything that can cause bug errors.
            Make sure you only focus on the code referenced in the diff.
            Be concise and focus on the most impactful suggestions only.
            Provide code examples where necessary.

            Pull Request Title: ${pr.title}
            Pull Request Description: ${pr.body}

            ### START of Git diff of the PR
            ${diffText}
            ### END of Git diff of the PR

            For reference only: here's a snapshot of the files with the changes applied:

            ### START File Contents after the changes ### 
            ${fileContents.map((file) => {return `####  File: ${file.filename} \n ${file.content}`;}).join("\n")}
            ### END File Contents after the changes ###
        `;  
        const igChat = inspector_general(instructions);   
        const stream = (await igChat.generateContentStream("What do you think of the changes?")).stream; 
        for await  (const chunk of stream) {
          const text = chunk.text(); 
          if(text) {
            yield text; 
          } 
        } 
        
      } catch (error) {
        console.error(error);
        return null;
      }
    }), 
  getPullRequest: publicProcedure
    .input(z.object({  
      publicPullRequestURL: z.string().min(1)
    }))
    .mutation(async ({ input }) => {
      const { publicPullRequestURL } = input; 
      if(!publicPullRequestURL || publicPullRequestURL === "") {
        return { success: null };
      }
      try { 
        const github = new Octokit({
          auth: process.env.GH_TOKEN_DEMO ?? ""
        }); 
        const urlParts = publicPullRequestURL.split("/");
        const owner = urlParts[3];
        const repo = urlParts[4];
        const pullRequestNumber = urlParts[6];

        const pullRequest = await github.request(`GET /repos/${owner}/${repo}/pulls/${pullRequestNumber}`, {
          owner: "OWNER",
          repo: "REPO",
          headers: {
            "X-GitHub-Api-Version": "2022-11-28"
          }
        }) as getPullRequestResponse;   
    
        const pr = (pullRequest).data;
        
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
