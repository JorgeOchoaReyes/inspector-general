import React from "react";  
import { FadeInSlide } from "~/components/animation/fadeInSlide";
import { DashboardLayout } from "~/components/layout/DashboardLayout";  
import { api } from "~/utils/api";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";
import { DataTable } from "~/components/table";
import { SiGithub } from "react-icons/si";
import { CheckCircle, Link2, Loader2, Lock, Unplug } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/router"; 
 
type RouterOutput = inferRouterOutputs<AppRouter>;
type listGitHubRepositoriesOutput = RouterOutput["repos"]["listGitHubRepositories"];

export default function Repos() {  
  const listGithubRepos = api.repos.listGitHubRepositories.useQuery({
    
  }); 
  const syncRepo = api.repos.syncGitHubRepository.useMutation();
  const router = useRouter();
  
  return (
    <DashboardLayout title="Sync Repositories">
      <FadeInSlide>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0"> 
          <div className="min-h-[100vh] flex-1 rounded-xl  md:min-h-min items-start justify-start flex"> 
            <div className="flex flex-col gap-4 p-4 pt-10 md:w-full"> 
              <div className="flex flex-row justify-between items-start gap-4"> 
                <h1 className="text-2xl font-semibold">
                  Repositories
                  <br /> 
                  <span className="text-base font-normal text-gray-500">
                    Connect your repositories to allow Inpector General to review your code!
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
                              <SiGithub className="text-2xl mr-2" />
                              <a 
                                href={`https://github.com/${cell.getValue() as string}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-500"
                              >{cell.getValue() as string}</a>
                              <div className="bg-secondary rounded-3xl text-xs text-gray-400 p-2"> {cell.row.original.default_branch} </div>
                              {isPrivate &&  <Lock size={18} />}
                            </div>
                          );
                        }
                      }, 
                      {
                        accessorKey: "",
                        header: "Sync",
                        cell: (cell) => {
                          const row = cell.row.original;
                          const isSynced = row.synced;
                          return (<>
                            {
                              isSynced ? <Button 
                                className="text-green-500"
                                variant={"link"} 
                              >
                                <CheckCircle size={10}/> Synced
                              </Button> : <Button
                                className="btn btn-primary"
                                disabled={syncRepo.isPending}
                                onClick={ async () => {
                                  const results = await syncRepo.mutateAsync({
                                    githubId: row.id.toString(),
                                    name: row.name,
                                    full_name: row.full_name,
                                    private: row.private,
                                    description: row.description ?? "",
                                    fork: row.fork,
                                    url: row.url,
                                    git_url: row.git_url,
                                    ssh_url: row.ssh_url,
                                    clone_url: row.clone_url,
                                    svn_url: row.svn_url,
                                    homepage: row.homepage ?? "",
                                    size: row.size,
                                    stargazers_count: row.stargazers_count,
                                    watchers_count: row.watchers_count, 
                                  });
                                  if(results.success) {
                                    await listGithubRepos.refetch();
                                  } else {
                                    alert("Failed to sync repository");
                                  }
                                }}
                              >
                                {syncRepo.isPending ? <Loader2 className="animate-spin" /> : <>Sync <Unplug /> </>}
                              </Button>
                            }
                          </>
                          );
                        }
                      },
                      {
                        accessorKey: "",
                        header: "Details",
                        cell: (cell) => {
                          const row = cell.row.original;
                          const isSynced = row.synced;
                          return (
                            <>
                              {
                                isSynced ? <Button 
                                  className="text-blue-500"
                                  variant={"link"} onClick={async () => {
                                    if(!row.url_path_id) {
                                      alert("No url path id found");
                                      return;
                                    }
                                    await router.push(`/dashboard/repositories/${row.url_path_id}`);
                                  }}>
                                  <Link2 /> View Details
                                </Button> :  null
                              }
                            </>
                          );
                        }
                      },
                    ]}
                    data={(listGithubRepos.data ?? [] as listGitHubRepositoriesOutput)}
                  />
              } 
            </div>        
          </div>
        </div>
      </FadeInSlide>
    </DashboardLayout> 
  );
}

