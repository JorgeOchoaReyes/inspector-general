import { DashboardLayout } from "~/components/layout/DashboardLayout"; 
import { FadeInSlide } from "~/components/animation/fadeInSlide";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { Loader2, } from "lucide-react"; 
import React from "react";    
import { Chat } from "~/components/chat";

export default function Home(){   
  const router = useRouter(); 
  const pathId = router.query.id as string;
  const repoDetails = api.repos.getOneRepoDetails.useQuery({ id: pathId }); 
  const [messages, setMessages] = React.useState<{role: string, content: string}[] | null>(null);
  
  const handleSendMessage = async (newMessage: {role: string, content: string}) => {
    setMessages([...(messages ?? []), newMessage]);
  };

  return (
    <DashboardLayout title={"Repo Details"}>  
      <FadeInSlide>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0"> 
          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min w-full items-center justify-center flex"> 
            <div className="flex flex-col gap-4 p-6 md:w-[80vw] items-center justify-center bg-slate-900/40 rounded-xl"> 
              <h2 className="text-2xl font-bold text-white"> 
                {repoDetails.data?.full_name} 
              </h2>
              <hr className="w-full border border-slate-700" />
              {
                repoDetails.isLoading ? 
                  <div className="flex flex-col gap-4 rounded-xl p-4 items-center justify-center"> 
                    <Loader2 className="animate-spin" /> 
                  </div>
                  : 
                  <FadeInSlide> 
                    <Chat
                      history={messages ?? [
                        {
                          role: "inspector-general",
                          content: "Hello! I am the Inspector General. I will help you review this pull request."
                        }, 
                      ]}
                      loading={false}
                      isGenerating={false}
                      handleSendMessage={handleSendMessage}
                      widthClassNames="w-[70vw] min-w-[70vw] max-w-[70vw]"
                      heightClassNames="h-[80vh] min-h-[80vh] max-h-[80vh]"
                    />
                  </FadeInSlide>
              }
            </div>    
          </div>
        </div>
      </FadeInSlide>
    </DashboardLayout>
  );
}; 