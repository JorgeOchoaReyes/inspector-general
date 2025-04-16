import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { reposRouter } from "./routers/repos";
import { pullRequestRouter } from "./routers/pull-request";
import { inspectorGeneralRouter } from "./routers/inspector-general";
import { demoInspectorGeneralRouter } from "./routers/demo-inspector-general";

export const appRouter = createTRPCRouter({
  repos: reposRouter,
  pullRequest: pullRequestRouter,
  inspectorGeneralRouter: inspectorGeneralRouter,
  demoInspectorGeneralRouter: demoInspectorGeneralRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
 
export const createCaller = createCallerFactory(appRouter);
