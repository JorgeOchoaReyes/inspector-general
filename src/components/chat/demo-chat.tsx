import React from "react"; 
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeDisplayBlock from "~/components/code-block"; 
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleAction } from "~/components/ui/chat/chat-bubble";
import {
  CopyIcon, 
  RefreshCcw, 
  Volume2,
} from "lucide-react";
import { ChatMessageList } from "~/components/ui/chat/chat-message-list";
import { Typewriter } from "./typewrite";
import { text } from "stream/consumers";

const ChatAiIcons = [
  {
    icon: CopyIcon,
    label: "Copy",
  },
  {
    icon: RefreshCcw,
    label: "Refresh",
  },
  {
    icon: Volume2,
    label: "Volume",
  },
]; 

export const DemoChat: React.FC<{
  history: {role: string, content: string}[],
  loading: boolean,
  isGenerating: boolean,  
  widthClassNames?: string,
  heightClassNames?: string,
}> = ({
  history, 
  isGenerating,  
  widthClassNames = "w-[38vw] min-w-[38vw] max-w-[38vw]",
  heightClassNames = ""
}) => {    

  return (
    <div className={"flex flex-col mt-10" + widthClassNames + heightClassNames} >  
      <ChatMessageList 
        style={{height: "70vh"}}
        className={"overflow-y-auto scrollbar" }>  
        {history?.map((message, index) => (
          <ChatBubble
            key={index}
            className=""
            variant={message.role == "USER" ? "sent" : "received"}
          > 
            <ChatBubbleMessage style={{
              backgroundColor: "#171717 !important",
            }} className="w-[]">
              {message.content
                .split("```")
                .map((part: string, index: number) => {
                  if (index % 2 === 0) {
                    return (
                      <Typewriter 
                        key={index}
                        text={part}
                        speed={1}
                        delay={0}
                        className="text-white"
                        customRenderText={(text: string) =>
                          <Markdown key={index} remarkPlugins={[remarkGfm]}>
                            {text}
                          </Markdown>
                        } 
                      />
                    );
                  } else {
                    return (
                      <pre className="whitespace-pre-wrap pt-2" key={index}>
                        <CodeDisplayBlock code={part} lang="js" _theme="dark" />
                      </pre>
                    );
                  }
                })} 
              {message.role === "assistant" &&
                    history.length - 1 === index && (
                <div className="flex items-center mt-1.5 gap-1">
                  {!isGenerating && (
                    <>
                      {ChatAiIcons.map((icon, iconIndex) => {
                        const Icon = icon.icon;
                        return (
                          <ChatBubbleAction
                            variant="outline"
                            className="size-5"
                            key={iconIndex}
                            icon={<Icon className="size-3" />} 
                          />
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </ChatBubbleMessage>
          </ChatBubble>
        ))} 

        {/* Loading */}
        {isGenerating && (
          <ChatBubble variant="received">
            <ChatBubbleAvatar src="" fallback="🤖" />
            <ChatBubbleMessage isLoading />
          </ChatBubble>
        )}
      </ChatMessageList>  
    </div>
  );
};