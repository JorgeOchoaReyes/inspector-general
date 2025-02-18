import { DashboardLayout } from "~/components/layout/DashboardLayout"; 
import { FadeInSlide } from "~/components/animation/fadeInSlide";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { GitForkIcon, GitPullRequest, Link2Icon, Loader2, Lock, LockKeyholeOpenIcon, MemoryStick, Star, } from "lucide-react";
import { FiGithub } from "react-icons/fi";
import { DataTable } from "~/components/table"; 
import { Toggle } from "~/components/toggle";
import React from "react";  
import { dateToLocal } from "~/utils";
import { FaPersonMilitaryRifle } from "react-icons/fa6";
import { Button } from "~/components/ui/button";

export default function Home(){   
  const router = useRouter();
  const [filter, setFitler] = React.useState("all");
  const pathId = router.query.id as string;
  const repoDetails = api.repos.getOneRepoDetails.useQuery({ id: pathId });
  const pullRequest = api.pullRequest.listPullRequest.useQuery({ repo: repoDetails.data?.name ?? "", filterPullRequest: filter }); 

  return (
    <DashboardLayout title={"Repo Details"}>  
      <FadeInSlide>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0"> 
          <div className="min-h-[100vh] flex-1 rounded-xl  md:min-h-min items-start justify-start flex"> 
            <div className="flex flex-col gap-4 p-4 pt-10 md:w-full"> 
              {
                repoDetails.isLoading ? 
                  <div className="flex flex-col gap-4 rounded-xl p-4 items-center justify-center"> 
                    <Loader2 className="animate-spin" /> 
                  </div>
                  : 
                  <FadeInSlide>
                    <div className="flex flex-row justify-between items-start gap-4"> 
                      <h1 className="text-4xl font-semibold mb-4">
                        {repoDetails.data?.full_name.split("/")[1]}
                        <br /> 
                        <div className="font-normal text-sm text-gray-500 flex-wrap flex max-w-[70%] mt-2">
                         Repo Description: {repoDetails.data?.description === "" ?  "N/A" : repoDetails.data?.description}
                        </div>
                      </h1> 
                    </div> 
                    <div>
                      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div className="aspect-video text-2xl rounded-xl flex-col bg-muted/50 flex items-center self-start justify-center p-4 gap-5">
                          <h3 className="text-2xl font-semibold justify-start">
                          Stars
                          </h3>
                          <div className="flex flex-row items-center gap-2 justify-center">
                            <Star className="mr-4 text-yellow-500" size={24} />  {repoDetails.data?.stargazers_count}
                          </div> 
                        </div>
                        <div className="aspect-video rounded-xl bg-muted/50 flex flex-col items-center justify-center p-4 gap-5">
                          <h3 className="text-2xl font-semibold">
                          Repo Details
                          </h3>
                          <div className="flex flex-row items-start self-start gap-2"> 
                            <FiGithub /> 
                            {repoDetails.data?.full_name} 
                          </div>
                          <div className="flex text-sm flex-row items-start self-start cursor-pointer gap-2"
                            onClick={async () => await navigator.clipboard.writeText(repoDetails?.data?.clone_url ?? "")}>
                            <Link2Icon /> 
                            {repoDetails.data?.clone_url}  
                          </div>
                          <div className="flex text-xs flex-row items-start self-start cursor-pointer gap-2"
                            onClick={async () => await navigator.clipboard.writeText(repoDetails?.data?.clone_url ?? "")}>
                            <GitForkIcon /> 
                            {repoDetails.data?.fork ? "Forked" : "Not Forked"}
                          </div>
                          <div className="flex text-sm flex-row items-start self-start gap-2"
                            onClick={async () => await navigator.clipboard.writeText(repoDetails?.data?.clone_url ?? "")}>
                            {repoDetails.data?.private ? <Lock /> : <LockKeyholeOpenIcon />}   
                            {repoDetails.data?.private ? "Private" : "Public"}
                          </div>
                          <div className="flex text-sm flex-row items-start self-start gap-2" >
                            <MemoryStick /> 
                            {repoDetails.data?.size} mb
                          </div>
                        </div>
                        <div className="aspect-video rounded-xl bg-muted/50 flex flex-col items-center justify-center">
                          <h3 className="text-2xl font-semibold gap-4 flex flex-row">
                            <FaPersonMilitaryRifle /> Chat Inspector General  
                          </h3>  
                          <div className="flex flex-row items-center gap-2 justify-center"> 
                            <div className="flex flex-col-reverse items-center gap-2 mt-10">  
                              <div className="mb-10"> 
                                <Button className="" variant={"secondary"} onClick={async () => await router.push(`/dashboard/repositories/${pathId}/bot`)}>
                                  { 
                                    repoDetails.data?.repo_inspected ? 
                                      <div className="flex flex-row items-center gap-2"> 
                                        <div className="bg-green-500 rounded-full h-4 w-4"></div>
                                        <p>Active</p>
                                      </div>
                                      :
                                      <div className="flex flex-row items-center gap-2"> 
                                        <div className="bg-red-500 rounded-full h-4 w-4"></div>
                                        <p>Inactive</p>
                                      </div>
                                  }  
                                  {repoDetails.data?.repo_inspected ? "Chat Now" : "Initiate Chat"}
                                </Button>
                              </div> 
                            </div> 
                          </div>
                        </div>
                      </div>  
                      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min aspect-video mt-5"> 
                        <div className="flex flex-row justify-between items-center gap-4 p-6 ">  
                          <h2 className="text-2xl font-semibold flex flex-row items-center gap-4"> 
                            <GitPullRequest /> Pull Request 
                          </h2>
                          <Toggle 
                            value={filter}
                            onChange={(e) => setFitler(e)}
                            options={[
                              { label: "All", value: "all" },
                              { label: "Open", value: "open" },
                              { label: "Closed", value: "closed" },
                            ]}
                          />
                        </div> 
                        <div className="flex flex-col gap-4 p-4 pt-0"> 
                          {
                            pullRequest.isPending ? (
                              <div className="flex flex-col gap-4 rounded-xl p-4 items-center justify-center"> 
                                <Loader2 className="animate-spin" /> 
                              </div>
                            ) : <DataTable
                              columns={[
                                {
                                  accessorKey: "title",
                                  header: "Title",
                                  cell: (cell) => {  
                                    return (
                                      <div className="flex flex-row items-center gap-2"> 
                                        <GitPullRequest />
                                        <a  
                                          href={`/dashboard/pull-requests/${cell.row.original.number}?repo=${repoDetails.data?.name}`} 
                                          className="text-blue-500"
                                        >{cell.getValue() as string} #{cell.row.original.number}</a> 
                                      </div>
                                    );
                                  }
                                },   
                                {
                                  accessorKey: "created_at",
                                  header: "Created",
                                  cell: (cell) => {  
                                    return (
                                      <div className="flex flex-row items-center gap-2"> 
                                        {dateToLocal(cell.getValue() as string) }
                                      </div>
                                    );
                                  }
                                },  
                                {
                                  accessorKey: "updated_at",
                                  header: "Updated",
                                  cell: (cell) => {  
                                    return (
                                      <div className="flex flex-row items-center gap-2"> 
                                        {dateToLocal(cell.getValue() as string) }
                                      </div>
                                    );
                                  }
                                },  
                                {
                                  accessorKey: "merged_at",
                                  header: "Merged",
                                  cell: (cell) => {  
                                    return (
                                      <div className="flex flex-row items-center gap-2"> 
                                        {dateToLocal(cell.getValue() as string) }
                                      </div>
                                    );
                                  }
                                },  
                                {
                                  accessorKey: "state",
                                  header: "State",
                                  cell: (cell) => {  
                                    const bgColor = cell.getValue() === "open" ? "bg-orange-500" : "bg-purple-500";
                                    return (
                                      <div className={`flex justify-center flex-row items-center ${bgColor} rounded-md content-center p-1`}> 
                                        {cell.getValue() as string}
                                      </div>
                                    );
                                  }
                                }, 
                              ]}
                              data={pullRequest?.data?.success ? pullRequest?.data?.success : []}
                            />
                          } 
                        </div> 
                      </div>
                    </div>
                  </FadeInSlide>
              }
            </div>    
          </div>
        </div>
      </FadeInSlide>
    </DashboardLayout>
  );
}; 