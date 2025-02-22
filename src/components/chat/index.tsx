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

export const Chat: React.FC<{
  history: {role: string, content: string}[],
  loading: boolean,
  isGenerating: boolean, 
  handleSendMessage: (newMessage: {
    role: string, 
    content: string
  }) => Promise<void>
}> = ({
  history,
  loading,
  isGenerating, 
  handleSendMessage
}) => {  
  const formRef = React.useRef<HTMLFormElement>(null); 
  const [input, setInput] = React.useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="flex flex-col mt-10 w-[38vw] min-w-[38vw] max-w-[38vw]" >  
      <ChatMessageList className="overflow-y-auto h-[585px]">  
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
      <div 
        className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
      >
        <ChatInput
          value={input} 
          onChange={(e) => {
            handleInputChange(e);
          }}
          placeholder="Type your message here..."
          className="rounded-lg bg-background border-0 shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center p-3 pt-0">
          <Button variant="ghost" size="icon">
            <Paperclip className="size-4" />
            <span className="sr-only">Attach file</span>
          </Button> 
          <Button variant="ghost" size="icon">
            <Mic className="size-4" />
            <span className="sr-only">Use Microphone</span>
          </Button> 
          <Button
            disabled={!input || loading}
            onClick={async () => {
              setInput("");
              try {
                await handleSendMessage({
                  role: "USER",
                  content: input
                }); 
              } catch (error) { 
                console.error(error); 
              } 
            }}
            type="submit"
            size="sm"
            className="ml-auto gap-1.5"
          >
              Send Message
            <CornerDownLeft className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};