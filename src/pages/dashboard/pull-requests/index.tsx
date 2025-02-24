import React from "react";  
import { FadeInSlide } from "~/components/animation/fadeInSlide";
import { DashboardLayout } from "~/components/layout/DashboardLayout";  
import { api } from "~/utils/api";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import { DataTable } from "~/components/table"; 
import { Loader2, Lock, Star } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/router";
 
type RouterOutput = inferRouterOutputs<AppRouter>;
type listSyncedGitHubPullRequest = RouterOutput["pullRequest"]["listSyncedPullRequest"]["success"];

export default function Repos() { 
  const listGithubPullRequest = api.pullRequest.listSyncedPullRequest.useQuery({
    cursor: ""
  }); 
  const router = useRouter();
  
  return (
    <DashboardLayout title="Repositories">
      <FadeInSlide>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0"> 
          <div className="min-h-[100vh] flex-1 rounded-xl  md:min-h-min items-start justify-start flex"> 
            <div className="flex flex-col gap-4 p-4 pt-10 md:w-full"> 
              <div className="flex flex-row justify-between items-start gap-4"> 
                <h1 className="text-2xl font-semibold">
                  Analyzed Pull Requests
                  <br /> 
                  <span className="text-base font-normal text-gray-500">
                    View details of your pull requests 
                  </span>
                </h1> 
              </div>
              <hr /> 
              {
                listGithubPullRequest.error ? (
                  <div className="text-red-500">Error: {listGithubPullRequest.error.message}</div>
                ) : null
              }
              {
                listGithubPullRequest.isLoading ? (
                  <div className="flex flex-col gap-4 rounded-xl p-4 items-center justify-center"> 
                    <p>
                      <Loader2 className="animate-spin" />
                    </p>
                  </div>
                ) :
                  <DataTable 
                    columns={[
                      {
                        accessorKey: "title",
                        header: "Repo",
                        cell: (cell) => {  
                          return (
                            <div className="flex flex-row items-center gap-2 font-bold"> 
                              <Star size={18} />
                              <a  
                                href={`/dashboard/pull-requests/${cell.row.original.title}?repo=${cell.row.original.repoName}`}  
                              >{cell.getValue() as string}</a>  
                            </div>
                          );
                        }
                      },   
                      {
                        accessorKey: "title",
                        header: "Repo Path",
                        cell: (cell) => {  
                          return (
                            <div className="flex flex-row items-center gap-2"> 
                              <a  
                                href={`${cell.row.original.html_url}`} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500"
                              >
                                {
                                  `${cell.row.original.repoName}/${cell.getValue() as string} #${cell.row.original.number}`
                                }
                              </a>
                            </div>
                          );
                        }
                      },  
                      {
                        accessorKey: "",
                        header: "View",
                        cell: (cell) => {  
                          return (
                            <Button
                              onClick={async () => {
                                await router.push(`/dashboard/pull-requests/${cell.row.original.number}?repo=${cell.row.original.repoName}`);
                              }}
                            >
                              View Details
                            </Button>
                          );
                        }
                      },  
                    ]}
                    data={listGithubPullRequest.data?.success ?? [] as listSyncedGitHubPullRequest} 
                  />
              }
            </div>        
          </div>
        </div>
      </FadeInSlide>
    </DashboardLayout> 
  );
}

