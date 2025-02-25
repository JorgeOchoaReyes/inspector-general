import { DashboardLayout } from "~/components/layout/DashboardLayout"; 
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Loader2 } from "lucide-react";
import * as Diff2Html from "diff2html";
import { type ColorSchemeType } from "diff2html/lib/types";
import { FaPersonMilitaryRifle } from "react-icons/fa6";
import React, { useEffect } from "react";   
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { AiButton } from "~/components/button/AiButton";
import { Chat } from "~/components/chat";


export default function Home(){    
  const router = useRouter(); 
  const { pullRequestId, repo } = router.query;
  const [messages, setMessages] = React.useState<{role: string, content: string}[] | null>(null);

  const getPullRequestt = api.pullRequest.getPullRequest.useQuery({
    repo: repo as string,
    pullRequestNumber: parseFloat((pullRequestId ?? "0") as string) ?? 0
  });   
  const intializeInspectorReview = api.inspectorGeneralRouter.initialAnalyzePullRequest.useMutation();
  const chatHistory = api.inspectorGeneralRouter.getPullRequestChatHistory.useQuery({
    repo: repo as string,
    pullRequestNumber: ((pullRequestId as string) ?? "")
  }, 
  );
  const chatWithBot = api.inspectorGeneralRouter.chatWithPullRequest.useMutation();

  const handleSendMessage = async (newMessage: {role: string, content: string}) => { 
    setMessages([...(messages ?? []), newMessage]);
    const res = await chatWithBot.mutateAsync({
      repo: ((repo ?? "") as string), 
      pullRequestNumber: ((pullRequestId ?? "") as string),
      message: newMessage
    });
    if(res.success && res.chatHistory) { 
      setMessages(res.chatHistory);
    }
  };

  useEffect(() => {
    if(chatHistory.isSuccess && chatHistory?.data?.messages) {
      const convertedMessages = chatHistory.data.messages.map((message) => {
        return {
          role: message.sender,
          content: message.message
        };
      });
       
      if(convertedMessages) { 
        console.log(convertedMessages);
        setMessages(convertedMessages);
      } else {
        setMessages(null);
      }
    }
  }, [chatHistory.isSuccess, chatHistory.data]);
 
  const heightMinsAndMaxLg = "xl:h-[825px] xl:max-h-[825px] xl:min-h-[825px]";

  return (
    <DashboardLayout title="Pull Request"> 
      <div className={`flex flex-row gap-4 pt-0 justify-around ml-2 ${heightMinsAndMaxLg}`}>  
        {
          getPullRequestt.isPending ? <div className="flex justify-center items-center w-full h-full"> <Loader2 className="animate-spin" /> </div> :
            (!getPullRequestt.isSuccess || !getPullRequestt.data.success) ? <div> Error! Could not fetch details. </div> :
              getPullRequestt.isSuccess && getPullRequestt.data.success &&
              <>
                <div className={"flex flex-col rounded-xl bg-muted/50 p-4 w-[40vw] max-w-[40vw]"}> 
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
                  <div className="my-4 max-w-full max-h-[70vh] overflow-y-auto rounded-xl bg-[#0d1017] p-4"> 
                    <div  dangerouslySetInnerHTML={{ 
                      __html: Diff2Html.html(getPullRequestt.data.success.diff_text, { drawFileList: true, matching: "lines", colorScheme: "dark" as ColorSchemeType,  },) 
                    }}></div>
                  </div>
                </div>
              </>
        } 
        <div className={"flex flex-col rounded-xl bg-muted/50 items-center w-[40vw] min-w-[40vw] max-w-[40vw] p-4"}>   
          <h2 className="text-2xl font-bold flex flex-row items-center gap-2">  <FaPersonMilitaryRifle />  Inspector General Chat </h2> 
          <div className={"flex w-[40vw] min-w-[40vw] max-w-[40vw]" + ( (!chatHistory.isPending && !messages) || (chatHistory.isPending || intializeInspectorReview.isPending)) ? "justify-center" : ""}>
            {
              (chatHistory.isPending || intializeInspectorReview.isPending) ?              
                <div className="mt-80"> <Loader2 className="animate-spin" /></div> : 
                (!chatHistory.isPending && !messages) ? 
                  <div className="mt-80">
                    <AiButton 
                      onClick={async () => {
                        const resu = await intializeInspectorReview.mutateAsync({ 
                          repo: ((repo ?? "") as string), 
                          pullRequestNumber: ((pullRequestId ?? "") as string) 
                        });
                        if(resu.success && resu.chatHistory) {
                          const convertedMessages = resu.chatHistory.messages.map((message) => {
                            return {
                              role: message.sender,
                              content: message.message
                            };
                          });
                          setMessages(convertedMessages);
                        }
                      }}   
                      _text="Analyze Pull Request"
                      icon={<MagnifyingGlassIcon className="text-xl" />}
                      loading={intializeInspectorReview.isPending}
                    />
                  </div> : 
                  <Chat 
                    history={messages ?? [{
                      role: "inspector-general",
                      content: "Hello! I am the Inspector General. I will help you review this pull request."
                    }]}
                    loading={chatHistory.isPending}
                    isGenerating={
                      intializeInspectorReview.isPending || chatWithBot.isPending
                    }
                    handleSendMessage={handleSendMessage}
                  />
            }   
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};                 