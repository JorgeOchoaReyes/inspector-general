import { DashboardLayout } from "~/components/layout/DashboardLayout"; 
import { FadeInSlide } from "~/components/animation/fadeInSlide";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { GitForkIcon, GitPullRequest, Link2Icon, Loader2, Lock, LockKeyholeOpenIcon, MemoryStick, Star, } from "lucide-react";
import { FiGithub } from "react-icons/fi";

export default function Home(){   
  const router = useRouter();
  const pathId = router.query.id as string;
  const repoDetails = api.repos.getOneRepoDetails.useQuery({ id: pathId });
  const pullRequest = api.pullRequest.listPullRequest.useQuery({ repo: repoDetails.data?.name ?? "", filterPullRequest: "all" });
  

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
                         Repo Description: {repoDetails.data?.description === "" ?  "No Description . . . ." : repoDetails.data?.description}
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
                          <h3 className="text-2xl font-semibold">
                            Recent Pull Requests
                          </h3> 
                        </div>
                      </div>  
                      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min aspect-video mt-5"> 
                        <h2 className="text-2xl font-semibold p-6 flex flex-row items-center gap-4"> 
                          <GitPullRequest /> Pull Request 
                        </h2>

                        <div className="flex flex-col gap-4 p-4 pt-0"> 
                          {

                          }
                          <div className="flex flex-col gap-4 rounded-xl p-4 items-center justify-center"> 
                            <Loader2 className="animate-spin" /> 
                          </div>
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