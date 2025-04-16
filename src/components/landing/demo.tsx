import React from "react"; 
import { motion, type MotionValue } from "framer-motion";
import { DemoChat } from "../chat/demo-chat";
import { api } from "~/utils/api"; 
import { AnimatedInput } from "../input/animatedInput";
import { GithubIcon, GitPullRequest, Loader2 } from "lucide-react";
import { useDemoStore } from "~/hooks/use-demo-storage";
import { type ColorSchemeType } from "diff2html/lib/types";
import * as Diff2Html from "diff2html";

export const Demo: React.FC<{
    bgStyle?: {
        border: MotionValue<string>,
        boxShadow: MotionValue<string>,
    }, 
}> = ({
  bgStyle, 
}) => { 
  const getPrDiff = api.demoInspectorGeneralRouter.getPullRequest.useMutation(); 
  const getReview = api.demoInspectorGeneralRouter.analyzePullRequest.useMutation();
  
  const demoStore = useDemoStore();

  return (
    <motion.div 
      className="w-[60vw] bg-[#171717] p-4 rounded-lg min-h-[70vh] my-20"

      style={{
        ...bgStyle
      }}   
    > 
      <div className="mb-4"> 
        <AnimatedInput
          _buttonText="Review PR"
          _icon={<GitPullRequest />}
          _onClick={async (e) => { 
            const prinfo = await getPrDiff.mutateAsync({
              publicPullRequestURL: e
            });
            const reviewResults = await getReview.mutateAsync({
              publicPullRequestURL: e
            });
            if(prinfo.success) {
              demoStore.setDiffText(prinfo.success.diff_text);
            }
            if(reviewResults) {
              let aggregate = "";
              for await (const result of reviewResults) {
                aggregate = aggregate + result;
                demoStore.setInspectorGeneralReview(aggregate);
              }
            }
          }}
          _loading={getPrDiff.isPending || getReview.isPending}
        />
      </div>
      <div className="flex flex-row gap-4">  
        <div className="max-h-[70vh] overflow-y-auto rounded-xl bg-black w-[30vw] max-w-[30vw] scrollbar"> 
          {
            getPrDiff.isPending ? 
              <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin" /> 
              </div>
              :
              demoStore.diffText ?
                <div  
                  dangerouslySetInnerHTML={{ 
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    __html: Diff2Html.html(demoStore.diffText, { drawFileList: true, matching: "lines", colorScheme: "dark" as ColorSchemeType,  },) 
                  }}
                ></div> :
                <div className="flex items-center justify-center h-full"> 
                  <p className="text-white"> <GithubIcon /> Git Changes Will Show Here  </p>
                </div>
          }
        </div>
        <div className={"flex flex-col rounded-xl bg-black w-[30vw] max-w-[30vw] max-h-[70vh]"}> 
          <DemoChat 
            history={
              getReview.isPending ? [] :
                [
                  {
                    role: "inspector-general",
                    content: demoStore.inspectorGeneralReview
                  }
                ]}
            widthClassNames="w-[30vw] min-w-[30vw] max-w-[30vw]"
            isGenerating={getPrDiff.isPending || getReview.isPending}
            loading={getPrDiff.isPending || getReview.isPending}
          /> 
        </div>
      </div>
    </motion.div>
  );
};