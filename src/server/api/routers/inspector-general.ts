import { api } from "~/utils/api";
/* eslint-disable @typescript-eslint/no-unsafe-assignment */ 
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
  InstructionsPullRequest,
  IGChatHistoryRepo,
  IGChatMessageRepo,  
} from "@prisma/client";
import { Pinecone } from "@pinecone-database/pinecone"; 
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Annotation } from "@langchain/langgraph"; 
import { StateGraph } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { pull } from "langchain/hub";
import { type ChatPromptTemplate } from "@langchain/core/prompts";
import { type Document } from "@langchain/core/documents";

type getPullRequestResponse = Endpoints["GET /repos/{owner}/{repo}/pulls/{pull_number}"]["response"];
type getPullRequestFilesResponse = Endpoints["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"]["response"]; 
type getRepoResponse = Endpoints["GET /repos/{owner}/{repo}"]["response"];
type getBranchResponse = Endpoints["GET /repos/{owner}/{repo}/branches/{branch}"]["response"];
type getTreeResponse = Endpoints["GET /repos/{owner}/{repo}/git/trees/{tree_sha}"]["response"];
type getFileContent = Endpoints["GET /repos/{owner}/{repo}/contents/{path}"]["response"];

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
      const getDiffContent = await fetch(pullRequest.diff_url);
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
        You a senior software engineer. You are asked to provide a code review with 
        helpful suggestions for the following pull request.
        Make sure you only focus on the code referenced in the diff.
        Be concise and focus on the most impactful suggestions only.
        Provide code examples where necessary.

        Pull Request Title: ${pullRequest.title}
        Pull Request Description: ${pullRequest.body}

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
        githunRepoId: currentRepo?.id ?? "", 
        ig_chat_id: "",
      }; 

      const chatHistory: IGChatHistory = {
        id: uuid(),
        chatName: `Code Review for ${pullRequest.title}`,  
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

      const instructionsPullRequiest: InstructionsPullRequest = {
        id: uuid(),
        githubPullRequestId: githubPullRequest.id,
        instructions: [instructions],
      }; 

      const db = ctx.db;

      await db.gitHubPullRequest.create({
        data: githubPullRequest,
      });
      await db.iGChatHistory.create({
        data: chatHistory,
      });
      await db.iGChatMessage.createMany({
        data: [firstMessage, secondMessage],
      });  
      await db.instructionsPullRequest.create({
        data: instructionsPullRequiest,
      });

      return {
        success: true,
        chatHistory: {
          ...chatHistory,
          messages: [firstMessage, secondMessage],
        },
      };

    }),  
  getPullRequestChatHistory: protectedProcedure
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
        messages: messages.sort((m, n) => new Date(m.timestamp).getTime() - new Date(n.timestamp).getTime()),
      }; 
 
    }),
  chatWithPullRequest: protectedProcedure
    .input(z.object({ 
      repo: z.string().min(1),
      pullRequestNumber: z.string().min(1),  
      message: z.object({
        role: z.string().min(1),
        content: z.string().min(1),
      })
    }))
    .mutation(async ({ ctx, input }) => {
      const { repo, pullRequestNumber, message } = input;
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? ""); 
      const userInfo = await getUserInfo(ctx);
      const { token } = userInfo; 
      const db = ctx.db;
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
        include: { ig_chat_history: true, instructions_pull_request: true },
      });

      const initialInstructions = chatHistory?.instructions_pull_request?.instructions[0] ?? "";
      
      const getMessages = await ctx.db.iGChatMessage.findMany({
        where: { chatId: chatHistory?.ig_chat_history?.id ?? "" },
      });
      
      const messages = getMessages.sort((m, n) => new Date(m.timestamp).getTime() - new Date(n.timestamp).getTime()).map((message) => {
        const convertRoles = message.sender === "USER" ? "user" : "model";
        return {
          role: convertRoles,
          parts: [{ text: message.message }],
        };
      });

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: initialInstructions,
      });
 
      const startChat = model.startChat({
        history: messages,
      });

      const response = await startChat.sendMessage(message.content);

      const offsetDateByOne = new Date();
      const newDate = new Date(offsetDateByOne.setSeconds(offsetDateByOne.getSeconds() + 1));

      const newMessageResponse: IGChatMessage = {
        id: uuid(),
        message: response.response.text(),
        sender: "ASSISTANT",
        timestamp: newDate,
        chatId: chatHistory?.ig_chat_history?.id ?? "",
      };

      const newMessageUser: IGChatMessage = {
        id: uuid(),
        message: message.content,
        sender: message.role,
        timestamp: new Date(),
        chatId: chatHistory?.ig_chat_history?.id ?? "",
      };

      await db.iGChatMessage.createMany({
        data: [newMessageResponse, newMessageUser],
      });

      const newMessages = [
        ...messages,
        {
          role: newMessageUser.sender,
          parts: [{ text: newMessageUser.message }],
        }, 
        {
          role: newMessageResponse.sender,
          parts: [{ text: newMessageResponse.message }],
        },
      ];
      const convertToChatHistory = newMessages.map((message) => {
        const revertRoles = message.role.toLowerCase() === "user" ? "USER" : "ASSISTANT";
        return {
          role: revertRoles,
          content: message?.parts?.[0]?.text ?? "",
        };
      });
  
      return {
        success: true,
        chatHistory: convertToChatHistory
      }; 
    
    }),
  initialAnalyzeRepo: protectedProcedure
    .input(z.object({ repoId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { repoId } = input;
      const user = await getUserInfo(ctx);
      const { token } = user;
      const github = new Octokit({ auth: token }); 
      const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY ?? "",
      });
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? ""); 

      try { 
        const owner = user.account?.github_accounts[0]?.login ?? "";
        const repoFromDb = await ctx.db.gitHubRepo.findFirst({
          where: { id: repoId },  
        });
        if(!repoFromDb) {
          return { success: false };
        }
        const repo = repoFromDb.name;
        const repoDetails = await github.request(`GET /repos/${owner}/${repo}`, {
          owner: "OWNER",
          repo: "REPO",
          headers: {
            "X-GitHub-Api-Version": "2022-11-28"
          }
        }) as getRepoResponse;
        const mainBranch = repoDetails.data.default_branch;

        const branchDetails = await github.request(`GET /repos/${owner}/${repo}/branches/${mainBranch}`, {
          owner: "OWNER",
          repo: "REPO",
          branch: "BRANCH",
          headers: {
            "X-GitHub-Api-Version": "2022-11-28"
          }
        }) as getBranchResponse;

        const treeSha = branchDetails.data.commit.commit.tree.sha;
        const treeDetails = await github.request(`GET /repos/${owner}/${repo}/git/trees/${treeSha}`, {
          owner: "OWNER",
          repo: "REPO",
          tree_sha: "TREE_SHA",
          recursive: "true",
          headers: {
            "X-GitHub-Api-Version": "2022-11-28"
          }
        });

        const treeData = treeDetails.data as getTreeResponse["data"];

        const tree = treeData.tree;
       
        const namespaceForPineCone = (`${owner}-${repo}`)
          .replace(/_/g, "-")
          .replace(/\./g, "-")
          .toLowerCase(); 

        const files = await Promise.all(tree.map(async (file) => {
          try {
            const getFileContent = await github.request(`GET /repos/${owner}/${repo}/contents/${file.path}`, {
              owner: "OWNER",
              repo: "REPO",
            }) as getFileContent;
            const fileContent = getFileContent.data as {
              content: string; 
            };
            
            const fileType = getFileContent.headers["content-type"] ?? "";
            // skip images/audio/video files
            if(fileType === "application/octet-stream" || fileType.includes("image") || fileType.includes("audio") || fileType.includes("video")) {
              return null; 
            }
            const contentToString = Buffer.from((fileContent?.content), "base64").toString("utf-8");
            return {
              id: file.path,
              text: contentToString,
              category: file.path
            };
          } catch (error) {
            return {
              id: file.path,
              text: "Unable to retrieve file content.",
              category: file.path
            };
          } 
        }).filter((file) => file !== null) 
        ) as { id: string; text: string; category: string }[]; 

        const embedding = genAI.getGenerativeModel({ model: "text-embedding-004", }); 

        const transformFiles = files.map((file) => {
          return { content: { role: "user", parts: [{ text: file.text }] } };
        });

        const embedResults = await embedding.batchEmbedContents({
          requests: transformFiles,
        });
        const embeddings = embedResults.embeddings;

        const records = files.map((record, i) => {
          return {
            id: record.id ?? "",
            values: embeddings?.[i]?.values ?? [0],
            metadata: { text: record.text },
          };
        }); 
        
        try{
          await pc.createIndex({
            name: `code-review-${namespaceForPineCone}`,
            dimension: 768,
            metric: "cosine",  
            spec: { 
              serverless: { 
                cloud: "aws", 
                region: "us-east-1" 
              }
            }, 
            waitUntilReady: true, 
          });   

          const index = pc.index(`code-review-${namespaceForPineCone}`);  
          await index.namespace(namespaceForPineCone).upsert(records);
        } catch (error) {
          console.log("[Error]: ", (error as {message: string}));
          return { success: false };
        }

        const db = ctx.db;

        console.log(`Code review index created for ${namespaceForPineCone}`, repoId);

        await db.gitHubRepo.update({
          where: { id: repoId },
          data: { pinecone_index: `code-review-${namespaceForPineCone}`, pinecone_namespaces: namespaceForPineCone, analyzed: true },
        }); 

        return { success: true };
      } catch (error) {
        console.log((error as {message: string}));
        return { success: false };
      } 
    }),   
  getRepoChatHistory: protectedProcedure
    .input(z.object({ repoId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { repoId } = input;
      if(!repoId) {
        return { success: false };
      }
      const db = ctx.db;
      const chatHistory = await db.iGChatHistoryRepo.findFirst({
        where: { githubRepoId: repoId },
      });

      if(!chatHistory) {
        return { success: false };
      }

      const messages = await db.iGChatMessageRepo.findMany({
        where: { chatId: chatHistory.id },
      });

      return {
        success: true,
        messages: messages.sort((m, n) => new Date(m.timestamp).getTime() - new Date(n.timestamp).getTime()),
      };
    }),
  chatWithRepo: protectedProcedure
    .input(z.object({ 
      repoId: z.string().min(1),
      message: z.object({
        role: z.string().min(1),
        content: z.string().min(1),
      })
    }))
    .mutation(async ({ ctx, input }) => {
      const { repoId } = input; 
      const db = ctx.db; 
      const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY ?? "",
      });

      const retreiveRepo = await db.gitHubRepo.findFirstOrThrow({
        where: { id: repoId },
      });

      const namespace = retreiveRepo.pinecone_namespaces;
      const index = retreiveRepo.pinecone_index ?? "";

      if(!namespace || !index) {
        return { success: false, message: "Repo has not been analyzed." };
      }

      const model = new ChatGoogleGenerativeAI({
        model: "gemini-1.5-flash", 
        apiKey: process.env.GEMINI_API_KEY ?? "",
      });
      const embeddingModel = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY ?? "",
      });

      const existingIndex = pc.index(index);
      const vectorStore = await PineconeStore.fromExistingIndex(embeddingModel, {
        pineconeIndex: existingIndex,
        namespace: namespace,
      });  

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const InputStateAnnotation = Annotation.Root({
        question: Annotation<string>,
      });
      
      const StateAnnotation = Annotation.Root({
        question: Annotation<string>,
        context: Annotation<Document[]>,
        answer: Annotation<string>,
      }); 

      const promptTemplate = await pull<ChatPromptTemplate>("rlm/rag-prompt");   

      const retrieve = async (state: typeof InputStateAnnotation.State) => {
        const retrievedDocs = await vectorStore.similaritySearch(state.question);
        return { context: retrievedDocs };
      };

      const testRetrieve = await retrieve({
        question: "Provide feedback for the src/index.ts file",
      });

      console.log(testRetrieve);
      
      const generate = async (state: typeof StateAnnotation.State) => {
        const docsContent = state.context.map((doc) => doc.pageContent).join("\n");
        const messages = await promptTemplate.invoke({
          question: state.question,
          context: docsContent,
        });
        const response = await model.invoke(messages);
        return { answer: response.content };
      };

      const graph = new StateGraph(StateAnnotation)
        .addNode("retrieve", retrieve)
        .addNode("generate", generate)
        .addEdge("__start__", "retrieve")
        .addEdge("retrieve", "generate")
        .addEdge("generate", "__end__")
        .compile();

      let retriveExisingChat = await db.iGChatHistoryRepo.findFirst({
        where: { githubRepoId: repoId },
        include: { chatMessages: true },
      }); 
      if(!retriveExisingChat) {
        const newChat: IGChatHistoryRepo = {
          id: uuid(),
          chatName: "Chat with Inspector General",   
          repoUpdated: new Date(),
          githubRepoId: repoId, 
        }; 
        await db.iGChatHistoryRepo.create({
          data: newChat,
        });
        retriveExisingChat = {
          ...newChat,
          chatMessages: [],
        };
      }  
      // const config3 = { configurable: { thread_id: uuid() } };

      // await graph.updateState(config3, {
      //   messages: retriveExisingChat.chatMessages.map((message) => {
      //     return {
      //       role: message.sender.toLowerCase(),
      //       content: message.message,
      //     };
      //   }),
      // }); 

      const inputs = { question: input.message.content }; 
      const result = await graph.invoke(inputs); 

      const newMessageUser: IGChatMessageRepo = {
        id: uuid(),
        message: input.message.content,
        sender: input.message.role,
        timestamp: new Date(),
        chatId: retriveExisingChat.id,
      };   
      const shiftedDate = new Date();
      const newDate = new Date(shiftedDate.setSeconds(shiftedDate.getSeconds() + 1)); 
      const newMessageResponse: IGChatMessageRepo = {
        id: uuid(),
        message: result.answer,
        sender: "ASSISTANT",
        timestamp: newDate,
        chatId: retriveExisingChat.id,
      };

      await db.iGChatMessageRepo.createMany({
        data: [newMessageUser, newMessageResponse],
      });

      const fullUpdatedChatHistory = [retriveExisingChat.chatMessages, newMessageUser, newMessageResponse]
        .flat()
        .sort((m, n) => new Date(m.timestamp).getTime() - new Date(n.timestamp).getTime())
        .map((message) => {
          return {
            role: message.sender,
            content: message.message,
          };
        });

      return {
        success: true,
        chatHistory: fullUpdatedChatHistory
      };

    }), 
});
