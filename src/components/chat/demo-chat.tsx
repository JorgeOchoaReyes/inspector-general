import React from "react"; 
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeDisplayBlock from "~/components/code-block";
import { Button } from "~/components/ui/button";
import { ChatInput } from "~/components/ui/chat/chat-input";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleAction } from "~/components/ui/chat/chat-bubble";
import {
  CopyIcon,
  CornerDownLeft,
  Mic,
  Paperclip,
  RefreshCcw, 
  Volume2,
} from "lucide-react";
import { ChatMessageList } from "~/components/ui/chat/chat-message-list";

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
  handleSendMessage: (newMessage: {
    role: string, 
    content: string
  }) => Promise<void>,
  widthClassNames?: string,
  heightClassNames?: string
}> = ({
  history, 
  isGenerating,  
  widthClassNames = "w-[38vw] min-w-[38vw] max-w-[38vw]",
  heightClassNames = ""
}) => {    

  return (
    <div className={"flex flex-col mt-10" + widthClassNames + heightClassNames} >  
      <ChatMessageList 
        style={{height: "65vh"}}
        className={"overflow-y-auto" }>  
        {history?.map((message, index) => (
          <ChatBubble
            key={index}
            variant={message.role == "USER" ? "sent" : "received"}
          >
            <ChatBubbleAvatar
              src=""
              fallback={message.role == "USER" ? "👨🏽" : "🤖"}
            />
            <ChatBubbleMessage>
              {message.content
                .split("```")
                .map((part: string, index: number) => {
                  if (index % 2 === 0) {
                    return (
                      <Markdown key={index} remarkPlugins={[remarkGfm]}>
                        {part}
                      </Markdown>
                    );
                  } else {
                    return (
                      <pre className="whitespace-pre-wrap pt-2" key={index}>
                        <CodeDisplayBlock code={part} lang="" />
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
                            onClick={() =>
                            // handleActionClick(icon.label, index)
                              alert("Action Clicked")
                            }
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