import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { reposRouter } from "./routers/repos";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  repos: reposRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
 
export const createCaller = createCallerFactory(appRouter);
