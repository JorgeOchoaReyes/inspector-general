/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { decrypt, encrypt } from "../../server_util";
import { z } from "zod"; 
import {
  createTRPCRouter,
  protectedProcedure, 
} from "~/server/api/trpc"; 
import { Octokit } from "@octokit/core";  
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuid } from "uuid";
import { getUserInfo } from "../../server_util"; 
import type { Endpoints } from "@octokit/types";
import type { 
  GitHubPullRequest,
  IGChatHistory,
  IGChatMessage,
} from "@prisma/client";

type getPullRequestResponse = Endpoints["GET /repos/{owner}/{repo}/pulls/{pull_number}"]["response"];
type getPullRequestFilesResponse = Endpoints["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"]["response"]; 
type getRepoResponse = Endpoints["GET /repos/{owner}/{repo}"]["response"];

export const inspectorGeneralRouter = createTRPCRouter({ 
  initialAnalyzePullRequest: protectedProcedure
    .input(z.object({ 
      repo: z.string(),
      pullRequestNumber: z.string(), 
    }))
    .mutation(async ({ ctx, input }) => { 
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

      const userInfo = await getUserInfo(ctx);
      const { token } = userInfo;
      const { repo, pullRequestNumber } = input;
      const github = new Octokit({ auth: token }); 
      const owner = userInfo.account?.github_accounts[0]?.login ?? ""; 
      const repoDetails = await github.request(`GET /repos/${owner}/${repo}`, {
        owner: "OWNER",
        repo: "REPO",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28"
        }
      }) as getRepoResponse; 
      const repoId = repoDetails.data.id.toString();

      const currentRepo = await ctx.db.gitHubRepo.findFirst({
        where: { githubId: repoId },
      });
      const githubStoredId = currentRepo?.id ?? "";

      const getPullRequest = await github.request(`GET /repos/${owner}/${repo}/pulls/${pullRequestNumber}`, {
        owner: "OWNER",
        repo: "REPO", 
        headers: {
          "X-GitHub-Api-Version": "2022-11-28"
        }
      }) as getPullRequestResponse;
      
      if(!getPullRequest) {
        return { success: false };
      } 
      const pullRequest = getPullRequest.data;
      const title = pullRequest.title;
      const body = pullRequest.body;
      const diff = pullRequest.diff_url;
      const getDiffContent = await fetch(diff);
      const diffContent = await getDiffContent.text();

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
      })); 
       
      const instructions =  `
        You a senior software engineer. You are asked to provide a code review with 
        helpful suggestions for the following pull request.
        Make sure you only focus on the code referenced in the diff.
        Be concise and focus on the most impactful suggestions only.

        Pull Request Title: ${title}
        Pull Request Description: ${body}

        ### START of Git diff of the PR
        ${diffContent}
        ### END of Git diff of the PR

        For reference only: here's a snapshot of the files with the changes applied:

        ### START File Contents after the changes ###

        ${
  fileContents.map((file) => {
    return `
                      ####  File: ${file.filename}
                      ${file.content}
                      `;
  }).join("\n")
}
        ### END File Contents after the changes ###
        `; 
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: instructions,
      });

      const startChat = model.startChat();

      const initialQuestion = startChat.sendMessage("Provide a code review for the pull request.");
      const resultOfReview = (await initialQuestion).response.text(); 
      
      const githubPullRequest: GitHubPullRequest = {
        id: uuid(),
        githubId: pullRequest.id.toString(),
        number: pullRequest.number,
        state: pullRequest.state,
        title: pullRequest.title,
        diff_url: pullRequest.diff_url,
        html_url: pullRequest.html_url,
        issues_url: pullRequest.issue_url,
        created_at: new Date(pullRequest.created_at),
        updated_at: new Date(pullRequest.updated_at),
        commits_url: pullRequest.commits_url,
        review_comments_url: pullRequest.review_comments_url,
        review_comment_url: pullRequest.review_comment_url,
        comments_url: pullRequest.comments_url,
        statuses_url: pullRequest.statuses_url, 
        githunRepoId: githubStoredId, 
        ig_chat_id: ""
      }; 

      const chatHistory: IGChatHistory = {
        id: uuid(),
        chatName: `Code Review for ${title}`,  
        pullRequestUpdated: new Date(pullRequest.updated_at),
        githubPullRequestId: githubPullRequest.id,
      }; 

      githubPullRequest.ig_chat_id = chatHistory.id;
      
      const firstMessage: IGChatMessage = { 
        id: uuid(),
        message: "Provide a code review for the pull request.",
        sender: "USER",
        timestamp: new Date(),
        chatId: chatHistory.id,
      }; 

      const secondMessage: IGChatMessage = {
        id: uuid(),
        message: resultOfReview,
        sender: "ASSISTANT",
        timestamp: new Date(),
        chatId: chatHistory.id,
      }; 

      const db = ctx.db;
      await db.gitHubPullRequest.create({
        data: githubPullRequest,
      });
      await db.iGChatHistory.create({
        data: chatHistory,
      });
      await db.iGChatMessage.create({
        data: firstMessage,
      }); 
      await db.iGChatMessage.create({
        data: secondMessage,
      });

      return {
        success: true,
        chatHistory: {
          ...chatHistory,
          messages: [firstMessage, secondMessage],
        },
      };

    }),  
  initialAnalyzeRepo: protectedProcedure
    .input(z.object({ repoId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { repoId } = input;
      const user = await getUserInfo(ctx);
      const { token } = user;
      const github = new Octokit({ auth: token }); 
    
    }),  

  getChatHistory: protectedProcedure
    .input(z.object({
      repo: z.string(),
      pullRequestNumber: z.string(), 
    }))
    .query(async ({ ctx, input }) => {
      const userInfo = await getUserInfo(ctx);
      const { token } = userInfo;
      const { repo, pullRequestNumber } = input;
      const github = new Octokit({ auth: token }); 
      const owner = userInfo.account?.github_accounts[0]?.login ?? "";

      const getPullRequest = await github.request(`GET /repos/${owner}/${repo}/pulls/${pullRequestNumber}`, {
        owner: "OWNER",
        repo: "REPO",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28"
        }
      }) as getPullRequestResponse;
      
      const id = getPullRequest.data.id.toString();

      const chatHistory = await ctx.db.gitHubPullRequest.findFirst({
        where: { githubId: id },
        include: { ig_chat_history: true },
      });

      if(!chatHistory || !chatHistory.ig_chat_history) {
        return { success: false };
      }
      const igChatHistoryId = chatHistory.ig_chat_history.id;
      const messages = await ctx.db.iGChatMessage.findMany({
        where: { chatId: igChatHistoryId },
      });

      return {
        success: true,
        messages,
      }; 
 
    }),
  chatWithPullRequest: protectedProcedure
    .input(z.object({ 
      repo: z.string().min(1),
      pullRequestNumber: z.string().min(1),
      pulllRequestId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { repo, pullRequestNumber, pulllRequestId } = input;
      
      
        
    
    }),
  chatWithRepo: protectedProcedure
    .input(z.object({ 
      repoId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { repoId } = input;
    
    }),
  retrievePullRequestAnalysis: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { token } = input;
       
    
    }),
  retrieveRepoAnalysis: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { token } = input;
      
        
    
    }),
});
