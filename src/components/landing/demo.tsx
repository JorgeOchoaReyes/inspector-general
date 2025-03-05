import React from "react"; 
import { motion, type MotionValue } from "framer-motion";
import { DemoChat } from "../chat/demo-chat";
import { api } from "~/utils/api"; 
import { AnimatedInput } from "../input/animatedInput";
import { GitPullRequest } from "lucide-react";

export const Demo: React.FC<{
    bgStyle?: {
        border: MotionValue<string>,
        boxShadow: MotionValue<string>,
    }, 
}> = ({
  bgStyle, 
}) => {
  const getPrDiff = api.dmeoInspectorGeneral.getPullRequest.useMutation(); 
  const getReview = api.dmeoInspectorGeneral.analyzePullRequest.useMutation();
  
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
        />
      </div>
      <div className="flex flex-row gap-4">  
        <div className="max-h-[70vh] overflow-y-auto rounded-xl bg-black w-[30vw] max-w-[30vw]"> 
          <div  
            //   dangerouslySetInnerHTML={{ 
            //     __html: Diff2Html.html(getPullRequestt.data.success.diff_text, { drawFileList: true, matching: "lines", colorScheme: "dark" as ColorSchemeType,  },) 
            //   }}
          ></div>
        </div>
        <div className={"flex flex-col rounded-xl bg-black w-[30vw] max-w-[30vw] max-h-[70vh]"}> 
          <DemoChat
            handleSendMessage={async () => {
              alert("ASD");
            }}
            history={[
              {
                role: "AI",
                content: "Hello, World!"
              }
            ]}
            widthClassNames="w-[30vw] min-w-[30vw] max-w-[30vw]"
            isGenerating={false}
            loading={false}
          /> 
        </div>
      </div>
    </motion.div>
  );
};