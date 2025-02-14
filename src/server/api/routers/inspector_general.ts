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

type getPullRequestResponse = Endpoints["GET /repos/{owner}/{repo}/pulls/{pull_number}"]["response"];

export const inspectorGeneralRouter = createTRPCRouter({ 
  initialAnalyzePullRequest: protectedProcedure
    .input(z.object({ 
      repoId: z.string(),
      pullRequestNumber: z.string(),
      pullRequestId: z.string()
    }))
    .mutation(async ({ ctx, input }) => { 
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
      const user = await getUserInfo(ctx);
      const { token } = user;
      const { repoId, pullRequestNumber } = input;
      const github = new Octokit({ auth: token });

      const getPullRequest = await github.request(`GET /repos/${repoId}/pulls/${pullRequestNumber}`) as getPullRequestResponse;
      
      if(!getPullRequest) {
        return { success: false };
      }

      const pullRequest = getPullRequest.data;
      const title = pullRequest.title;
      const body = pullRequest.body;
      const diff = pullRequest.diff_url;
      const getDiffContent = await fetch(diff);
      const diffContent = await getDiffContent.text();
        
      const instructionsFunction = (diff: string,): string => {
        return `
        You a senior software engineer. You are asked to provide a code review with 
        helpful suggestions for the following pull request.
        Make sure you only focus on the code referenced in the diff.
        Be concise and focus on the most impactful suggestions only.

        ### START of Git diff of the PR
        ${diff}
        ### END of Git diff of the PR

        For reference only: here's a snapshot of the files with the changes applied:

        ### START File Contents after the changes ###

        ####  File: build/common.sh

        [file content here]

        ####  File: build/lib/release.sh

        [file content here]

        ####  File: build/release-images.sh

        [file content here ...]

        ### END File Contents after the changes ###
        `;
      }; 
    }),  
  initialAnalyzeRepo: protectedProcedure
    .input(z.object({ repoId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { repoId } = input;
 
        
    
    }),  
  chatWithPullRequest: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { token } = input;
 
        
    
    }),
  chatWithRepo: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { token } = input;
 
        
    
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
