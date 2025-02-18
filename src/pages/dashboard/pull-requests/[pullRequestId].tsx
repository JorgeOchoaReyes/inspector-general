import { DashboardLayout } from "~/components/layout/DashboardLayout"; 
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Loader2 } from "lucide-react";
import * as Diff2Html from "diff2html";
import { type ColorSchemeType } from "diff2html/lib/types";
import { FaPersonMilitaryRifle } from "react-icons/fa6";

export default function Home(){    
  const router = useRouter(); 
  const { pullRequestId, repo } = router.query;

  const getPullRequestt = api.pullRequest.getPullRequest.useQuery({
    repo: repo as string,
    pullRequestNumber: parseFloat((pullRequestId ?? "0") as string) 
  },);

  return (
    <DashboardLayout title="Pull Request"> 
      <div className="flex flex-row gap-4 p-4 pt-0 h-full">  
        {
          getPullRequestt.isPending ? <div className="flex justify-center items-center w-full h-full"> <Loader2 className="animate-spin" /> </div> :
            (!getPullRequestt.isSuccess || !getPullRequestt.data.success) ? <div> Error! Could not fetch details. </div> :
              getPullRequestt.isSuccess && getPullRequestt.data.success &&
              <>
                <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-6 max-w-[50%]"> 
                  <div className="flex flex-row justify-between items-center"> 
                    <h1 className="text-3xl font-bold">
                      <a className="underline text-blue-600" target="_blank" rel="noopener noreferrer" href={getPullRequestt.data.success.html_url}>{getPullRequestt.data.success.title} #{getPullRequestt.data.success.number} </a>
                    </h1> 
                    <p className="text-lg flex flex-row items-center gap-2 my-2">
                      { 
                        getPullRequestt.data.success.state === "open" ? 
                          <div className="bg-orange-500 rounded-full h-4 w-4"></div> : 
                          <div className="bg-purple-500 rounded-full h-4 w-4"></div>
                      }
                      <u>{getPullRequestt.data.success.state.toUpperCase()} </u> 
                    </p>
                  </div>
                  <hr />  
                  <div className="my-4">
                    <h2 className="text-xl font-bold"> Description: </h2>
                    <p className="text-gray-500"> {(getPullRequestt.data.success.body === "" || !getPullRequestt.data.success.body) ? "No Description" : getPullRequestt.data.success.body} </p>
                  </div>   
                  <div className="my-4 max-w-full overflow-y-auto rounded-xl bg-[#0d1017] p-4"> 
                    <div  dangerouslySetInnerHTML={{ 
                      __html: Diff2Html.html(getPullRequestt.data.success.diff_text, { drawFileList: true, matching: "lines", colorScheme: "dark" as ColorSchemeType,  },) 
                    }}></div>
                  </div>
                </div>
              </>
        } 
        <div className="h-[90vh] rounded-xl bg-muted/50 md:min-h-min min-w-[48%] sticky top-10 p-6 self-start">  
          <h2 className="text-2xl font-bold flex flex-row items-center gap-2">  <FaPersonMilitaryRifle />  Inspector General Chat </h2>
        </div>
      </div>
    </DashboardLayout>
  );
};                 