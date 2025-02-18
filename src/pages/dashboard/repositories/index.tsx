import React from "react";  
import { FadeInSlide } from "~/components/animation/fadeInSlide";
import { DashboardLayout } from "~/components/layout/DashboardLayout";  
import { api } from "~/utils/api";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import { DataTable } from "~/components/table"; 
import { Loader2, Lock, Star, Unplug } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/router";
 
type RouterOutput = inferRouterOutputs<AppRouter>;
type listSyncedGitHubRepositories = RouterOutput["repos"]["listSyncedGitHubRepositories"];

export default function Repos() { 
  const listGithubRepos = api.repos.listSyncedGitHubRepositories.useQuery(); 
  const router = useRouter();
  
  return (
    <DashboardLayout title="Repositories">
      <FadeInSlide>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0"> 
          <div className="min-h-[100vh] flex-1 rounded-xl  md:min-h-min items-start justify-start flex"> 
            <div className="flex flex-col gap-4 p-4 pt-10 md:w-full"> 
              <div className="flex flex-row justify-between items-start gap-4"> 
                <h1 className="text-2xl font-semibold">
                  Synced GitHub Repositories
                  <br /> 
                  <span className="text-base font-normal text-gray-500">
                    View details of your synced GitHub repositories
                  </span>
                </h1> 
              </div>
              <hr /> 
              {
                listGithubRepos.error ? (
                  <div className="text-red-500">Error: {listGithubRepos.error.message}</div>
                ) : null
              }
              {
                listGithubRepos.isLoading ? (
                  <div className="flex flex-col gap-4 rounded-xl p-4 items-center justify-center"> 
                    <p>
                      <Loader2 className="animate-spin" />
                    </p>
                  </div>
                ) :
                  <DataTable 
                    columns={[
                      {
                        accessorKey: "full_name",
                        header: "Repo",
                        cell: (cell) => { 
                          const isPrivate = (cell.row.original).private;
                          return (
                            <div className="flex flex-row items-center gap-2"> 
                              <Star size={18} />
                              <a  
                                href={`/dashboard/repositories/${cell.row.original.id}`} 
                                className="text-blue-500"
                              >{cell.getValue() as string}</a> 
                              {isPrivate &&  <Lock size={18} />}
                            </div>
                          );
                        }
                      },  
                      {
                        accessorKey: "",
                        header: "View",
                        cell: (cell) => {  
                          return (
                            <Button onClick={async ()=>{
                              await router.push(`/dashboard/repositories/${cell.row.original.id}`);
                            }}>
                              View Details
                            </Button>
                          );
                        }
                      },  
                    ]}
                    data={(listGithubRepos.data ?? [] as listSyncedGitHubRepositories).sort((a, b) => a.full_name.localeCompare(b.full_name))}
                  />
              }
            </div>        
          </div>
        </div>
      </FadeInSlide>
    </DashboardLayout> 
  );
}

