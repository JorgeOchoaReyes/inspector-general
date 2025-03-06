import { decrypt, encrypt } from "../../server_util";
import { z } from "zod"; 
import {
  createTRPCRouter,
  protectedProcedure, 
} from "~/server/api/trpc";
import { v4 as uuid } from "uuid";
import { Octokit as MyOctoki } from "@octokit/core";  
import {
  paginateRest,
  composePaginateRest,
} from "@octokit/plugin-paginate-rest";

const Octokit = MyOctoki.plugin(paginateRest, composePaginateRest);

export const reposRouter = createTRPCRouter({ 
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
      const githubToken = input.token;
      const encryptedToken =  githubToken;
      const account = await ctx.db.account.findFirst({
        where: { userId: ctx.session.user.id },
      });

      if(!account) {
        return { success: false };
      } 

      await ctx.db.gitHubAccount.deleteMany({
        where: {
          accountId: account.id,
          github_token: encryptedToken,
        },
      });

      return { success: true };
    }),
  listGitHubRepositories: protectedProcedure
    .input(z.object({
      previousLastId: z.string().optional(),
    }))
    .query(async ({ ctx }) => {
      if(!ctx.session) {
        return [];
      }
      const account = await ctx.db.account.findFirstOrThrow({
        where: { userId: ctx.session.user.id },
        select: { 
          github_accounts: true,
          id: true,
        },
      });
      if(!account) {
        return [];
      }
      const githubAccounts = account.github_accounts;
      if(githubAccounts.length === 0) {
        return [];
      }
      const githubAccount = githubAccounts[0];
      if(!githubAccount) {
        return [];
      }
      const encryptedToken = githubAccount.github_token;
      if(!encryptedToken) {
        return [];
      }
      const decryptedToken = decrypt(encryptedToken, process.env.ENCRYPTION_KEY ?? "");
      const octokit = new Octokit({ auth: decryptedToken });
      const data = await octokit.paginate("GET /user/repos",
        { 
          per_page: 30,
          sort: "updated",
          direction: "desc", 
        },  
      ); 
        
      const currentRepos = await ctx.db.gitHubRepo.findMany({
        where: { accountId: account.github_accounts?.[0]?.id },
      });

      type RepoSynced = typeof data[0] & { synced: boolean, url_path_id: string };
 
      const repos = data.map((repo) => { 
        const exist = currentRepos.find((currentRepo) => currentRepo.githubId === repo.id.toString());
        const synced = exist ? true : false;
        return { ...repo, synced, url_path_id: exist?.id ?? ""};
      }) as RepoSynced[];
      
      return repos;
    }),
  syncGitHubRepository: protectedProcedure
    .input(z.object({
      githubId: z.string().min(1),
      name: z.string(),
      full_name: z.string(),
      private: z.boolean(),
      description: z.string(),
      fork: z.boolean(),
      url: z.string(),
      git_url: z.string(),
      ssh_url: z.string(),
      clone_url: z.string(),
      svn_url: z.string(),
      homepage: z.string(),
      size: z.number(),
      stargazers_count: z.number(),
      watchers_count: z.number(), 
    }))
    .mutation(async ({ ctx, input }) => {
      if(!ctx.session) {
        return { success: false };
      }

      const { githubId, name, full_name, private: isPrivate, description, fork, url, git_url, ssh_url, clone_url, svn_url, homepage, size, stargazers_count, watchers_count, } = input;
      const account = await ctx.db.account.findFirst({
        where: { userId: ctx.session.user.id },
      });

      if(!account) {
        return { success: false };
      }

      const githubAccount = await ctx.db.gitHubAccount.findFirst({
        where: { accountId: account.id },
      });

      if(!githubAccount) {
        return { success: false };
      }

      const id = uuid();
      await ctx.db.gitHubRepo.upsert({
        where: { id: id },
        create: { 
          githubId,
          name,
          full_name,
          private: isPrivate,
          description,
          fork,
          url,
          git_url,
          ssh_url,
          clone_url,
          svn_url,
          homepage,
          size,
          stargazers_count,
          watchers_count, 
          accountId: githubAccount.id,
        },
        update: {
          name,
          full_name,
          private: isPrivate,
          description,
          fork,
          url,
          git_url,
          ssh_url,
          clone_url,
          svn_url,
          homepage,
          size,
          stargazers_count,
          watchers_count, 
          accountId: githubAccount.id,
        },
      });

      return { success: true };
       
    }),
  listSyncedGitHubRepositories: protectedProcedure
    .query(async ({ ctx }) => {
      if(!ctx.session) {
        return [];
      }
      const account = await ctx.db.account.findFirstOrThrow({
        where: { userId: ctx.session.user.id },
        select: { 
          github_accounts: true,
          id: true,
        },
      });
      if(!account) {
        return [];
      }
      const githubAccounts = account.github_accounts;
      if(githubAccounts.length === 0) {
        return [];
      }
      const githubAccount = githubAccounts[0];
      if(!githubAccount) {
        return [];
      } 

      const currentRepos = await ctx.db.gitHubRepo.findMany({
        where: { accountId: account.github_accounts?.[0]?.id },
      });
 
      return currentRepos;
    }),
  getOneRepoDetails: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      if(!ctx.session) {
        return null;
      }
      const account = await ctx.db.account.findFirstOrThrow({
        where: { userId: ctx.session.user.id },
        select: { 
          github_accounts: true,
          id: true,
        },
      });
      if(!account) {
        return null;
      }
      const githubAccounts = account.github_accounts;
      if(githubAccounts.length === 0) {
        return null;
      }
      const githubAccount = githubAccounts[0];
      if(!githubAccount) {
        return null;
      } 

      const currentRepo = await ctx.db.gitHubRepo.findFirst({
        where: { id: input.id },
      });

      return currentRepo;
    }),
  userHasGitHubToken: protectedProcedure
    .query(async ({ ctx }) => {
      if(!ctx.session) {
        return { hasToken: false };
      }
      const account = await ctx.db.account.findFirstOrThrow({
        where: { userId: ctx.session.user.id },
        select: { 
          github_accounts: true,
          id: true,
        },
      });
      if(!account) {
        return { hasToken: false };
      }
      const githubAccounts = account.github_accounts;
      if(githubAccounts.length === 0) {
        return { hasToken: false };
      }
      const githubAccount = githubAccounts[0];
      if(!githubAccount) {
        return { hasToken: false };
      }  
      const encryptedToken = githubAccount.github_token;
      if(!encryptedToken) {
        return { hasToken: false };
      } 
      return { hasToken: true };
    }),
});
