import { DashboardLayout } from "~/components/layout/DashboardLayout"; 
import { FadeInSlide } from "~/components/animation/fadeInSlide";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";

export default function Home(){   
  const router = useRouter();
  const pathId = router.query.id as string;
  const repoDetails = api.repos.getOneRepoDetails.useQuery({ id: pathId });
  

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
                         Repo Description: {repoDetails.data?.description}
                        </div>
                      </h1> 
                    </div> 
                    <div>
                      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div className="aspect-video rounded-xl bg-muted/50">
                          {repoDetails.data?.full_name}
                        </div>
                        <div className="aspect-video rounded-xl bg-muted/50">
                          {repoDetails.data?.full_name}
                        </div>
                        <div className="aspect-video rounded-xl bg-muted/50">
                          {repoDetails.data?.full_name}
                        </div>
                      </div> 
                      
                      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min aspect-video mt-5"> 
                         
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