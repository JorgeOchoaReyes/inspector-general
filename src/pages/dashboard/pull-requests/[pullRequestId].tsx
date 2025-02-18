import { DashboardLayout } from "~/components/layout/DashboardLayout"; 
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Loader2 } from "lucide-react";
import * as Diff2Html from "diff2html";
import { type ColorSchemeType } from "diff2html/lib/types";
import { FaPersonMilitaryRifle } from "react-icons/fa6";
import { ChatMessageList } from "~/components/ui/chat/chat-message-list";
import React from "react"; 
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleAction } from "~/components/ui/chat/chat-bubble";
import {
  CopyIcon,
  CornerDownLeft,
  Mic,
  Paperclip,
  RefreshCcw,
  Send,
  Volume2,
} from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeDisplayBlock from "~/components/code-block";
import { Button } from "~/components/ui/button";
import { ChatInput } from "~/components/ui/chat/chat-input";


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

export default function Home(){    
  const router = useRouter(); 
  const { pullRequestId, repo } = router.query;

  const getPullRequestt = api.pullRequest.getPullRequest.useQuery({
    repo: repo as string,
    pullRequestNumber: parseFloat((pullRequestId ?? "0") as string) 
  },);

  const [messages, setMessages] = React.useState<{
    role: "user" | "assistant",
    content: string
  }[]>([{role: "assistant",content: "Hello! How can I help you today?",},{role: "user",content: "I need help with a pull request.",}]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [input, setInput] = React.useState("");
  const formRef = React.useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);


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
        <div className="h-[75vh] rounded-xl bg-muted/50 md:min-h-min min-w-[48%] sticky top-10 p-6 self-start">  
          <h2 className="text-2xl font-bold flex flex-row items-center gap-2">  <FaPersonMilitaryRifle />  Inspector General Chat </h2>

          <ChatMessageList>
            {/* Initial Message */}
            {messages.length === 0 && (
              <div className="w-full bg-background shadow-sm border rounded-lg p-8 flex flex-col gap-2">
                <h1 className="font-bold">Welcome to this example app.</h1>
                <p className="text-muted-foreground text-sm">
                This is a simple Next.JS example application created using{" "}
                  <a
                    href="https://github.com/jakobhoeg/shadcn-chat"
                    className="font-bold inline-flex flex-1 justify-center gap-1 leading-4 hover:underline"
                  >
                  shadcn-chat
                    <svg
                      aria-hidden="true"
                      height="7"
                      viewBox="0 0 6 6"
                      width="7"
                      className="opacity-70"
                    >
                      <path
                        d="M1.25215 5.54731L0.622742 4.9179L3.78169 1.75597H1.3834L1.38936 0.890915H5.27615V4.78069H4.40513L4.41109 2.38538L1.25215 5.54731Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </a>{" "}
                components. It uses{" "}
                  <a
                    href="https://sdk.vercel.ai/"
                    className="font-bold inline-flex flex-1 justify-center gap-1 leading-4 hover:underline"
                  >
                  Vercel AI SDK
                    <svg
                      aria-hidden="true"
                      height="7"
                      viewBox="0 0 6 6"
                      width="7"
                      className="opacity-70"
                    >
                      <path
                        d="M1.25215 5.54731L0.622742 4.9179L3.78169 1.75597H1.3834L1.38936 0.890915H5.27615V4.78069H4.40513L4.41109 2.38538L1.25215 5.54731Z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </a>{" "}
                for the AI integration. Build chat interfaces like this at
                lightspeed with shadcn-chat.
                </p>
                <p className="text-muted-foreground text-sm">
                Make sure to also checkout the shadcn-chat support component at
                the bottom right corner.
                </p>
              </div>
            )}

            {/* Messages */}
            {messages?.map((message, index) => (
              <ChatBubble
                key={index}
                variant={message.role == "user" ? "sent" : "received"}
              >
                <ChatBubbleAvatar
                  src=""
                  fallback={message.role == "user" ? "👨🏽" : "🤖"}
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
                    messages.length - 1 === index && (
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
          <form
            ref={formRef}
            // onSubmit={onSubmit}
            className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
          >
            <ChatInput
              value={input}
              // onKeyDown={onKeyDown}
              // onChange={handleInputChange}
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
                disabled={!input || isLoading}
                type="submit"
                size="sm"
                className="ml-auto gap-1.5"
              >
              Send Message
                <CornerDownLeft className="size-3.5" />
              </Button>
            </div>
          </form>

        </div>
      </div>
    </DashboardLayout>
  );
};                 