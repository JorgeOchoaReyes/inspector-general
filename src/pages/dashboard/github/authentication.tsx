import { Eye, EyeOff, Link2Icon, Loader2, SaveIcon, Trash2Icon, TrashIcon, XIcon } from "lucide-react"; 
import React from "react";  
import { FadeInSlide } from "~/components/animation/fadeInSlide";
import { DashboardLayout } from "~/components/layout/DashboardLayout"; 
import { Modal } from "~/components/modal";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import moment from "moment-timezone";
import { api } from "~/utils/api"; 
import { linkToGithubScope, dateFormat } from "~/utils";  
import { Popover, PopoverContent, PopoverTrigger, } from "~/components/ui/popover";

export default function Home() {
  const [token, setToken] = React.useState<string | null>(null);
  const [modelOpen, setModelOpen] = React.useState<boolean>(false);
  const [tokenVisible, setTokenVisible] = React.useState<boolean>(false);
  const [deleteAlert, setDeleteAlert] = React.useState<boolean>(false);

  const saveeGitHubToken = api.github.saveGitHubAccessToken.useMutation();
  const readGitHubToken = api.github.readGitHubAccessTokens.useQuery();
  const deleteGitHubToken = api.github.deleteGitHubAccessToken.useMutation();

  const toggleTokenVisibility = () => setTokenVisible(!tokenVisible); 

  return (
    <DashboardLayout title="GitHub Authentication">
      <FadeInSlide>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0"> 
          <div className="min-h-[100vh] flex-1 rounded-xl  md:min-h-min items-start justify-center flex"> 
            <div className="flex flex-col gap-4 p-4 pt-10 md:w-1/2"> 
              <div className="flex flex-row justify-between items-start gap-4"> 
                <h1 className="text-2xl font-semibold">
                    GitHub Authentication
                  <br /> 
                  <span className="text-base font-normal text-gray-500">
                    Authenticate with GitHub to access your repositories.
                  </span>
                </h1>
                <a
                  href={"https://graphite.dev/docs/authenticate-with-github-app"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-blue-500"> 
                Learn More <Link2Icon />
                </a>
              </div>
              <hr />
              {
                readGitHubToken.isError ?
                  <div className="flex flex-col gap-4 border border-secondary rounded-xl p-4">
                    <h2>
                      Error
                    </h2>
                    <hr />
                    <p>
                      An error occurred while fetching your GitHub token. Please try again later.
                    </p>
                  </div>
                  :
                  readGitHubToken.isLoading ?
                    <div className="flex flex-col gap-4 border border-secondary rounded-xl p-4 items-center justify-center"> 
                      <p>
                        <Loader2 className="animate-spin" />
                      </p>
                    </div>
                    :
                    readGitHubToken?.data?.token ?
                      <div className="flex flex-col gap-4 border border-blue-700 rounded-xl p-4">
                        <h2>
                         Personal Access Token
                        </h2>
                        <hr />
                        <div className="flex flex-col bg-secondary rounded-xl gap-4 p-4">
                          <p className="text-gray-400">
                            Your GitHub token is already saved.
                          </p>
                          <div className="flex flex-row items-center justify-between gap-4">
                            <div className="flex flex-row items-center gap-4">
                              <img 
                                src={readGitHubToken.data?.account?.avatar_url}
                                alt="GitHub Logo" 
                                className="w-12 h-12  rounded-xl"
                              />
                              <a className="text-md text-blue-500" href={`https://github.com/${readGitHubToken.data?.account?.login}`} target="_blank" rel="noopener noreferrer">
                                {readGitHubToken.data?.account?.login}
                              </a>
                            </div>
                            <div className="flex flex-col gap-2">
                              <p className="text-gray-500 text-md">
                                Public Repos: {readGitHubToken.data?.account?.public_repos}
                              </p>
                              <p className="text-gray-500 text-md">
                                Private Repos: {readGitHubToken.data?.account?.private_repos}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-row items-center">
                            <Input
                              type={tokenVisible ? "text" : "password"}
                              value={readGitHubToken.data.token}
                              disabled
                            />
                            <Button className="mr-3" onClick={toggleTokenVisibility}>{tokenVisible ? <Eye /> : <EyeOff />}</Button>
                            <Popover open={deleteAlert} onOpenChange={setDeleteAlert}>
                              <PopoverTrigger asChild>
                                <Button variant={"destructive"}> <TrashIcon className="color-red" /> Delete </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80">
                                <div className="grid gap-4">
                                  <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Delete Token</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Are you sure you want to delete your GitHub token?
                                    </p>
                                    <Button
                                      onClick={async () => {
                                        setDeleteAlert(false);
                                      }}
                                      disabled={deleteGitHubToken.isPending}
                                      variant="default"
                                      className="mr-3"
                                    >
                                      {deleteGitHubToken.isPending ? <Loader2 className="animate-spin" /> : <> <XIcon /> Cancel</>}
                                    </Button>
                                    <Button
                                      onClick={async () => {
                                        if(!readGitHubToken.data.token) {
                                          alert("No token found."); 
                                          return;
                                        }
                                        await deleteGitHubToken.mutateAsync({
                                          token: readGitHubToken.data.account.github_token,
                                        });
                                        await readGitHubToken.refetch();
                                        setDeleteAlert(false);
                                      }}
                                      disabled={deleteGitHubToken.isPending}
                                      variant="destructive"
                                    >
                                      {deleteGitHubToken.isPending ? <Loader2 className="animate-spin" /> : <><Trash2Icon /> Delete Token</>}
                                    </Button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </div>
                      :
                      <div className="flex flex-col gap-4 border border-secondary rounded-xl p-4"> 
                        <h2>
                          Personal Access Token
                        </h2>
                        <hr /> 
                        <div className="flex flex-col bg-secondary rounded-xl p-4 gap-4 justify-center items-center"> 
                          <p className="text-gray-400">
                            To authenticate with GitHub, you need to create a personal access token. 
                          </p> 
                          <Modal
                            button_label="Add Token"
                            title="Create a Personal Access Token"
                            open={modelOpen}
                            onOpen={() => {
                              setModelOpen(true);
                            }} 
                        
                            onClose={() => {
                              setToken(null);
                              setModelOpen(false);
                            }} 
                            description="To authenticate with GitHub, you need to create a personal access token."
                            buttonNodes={[
                              <Button 
                                key="save" 
                                variant="default"
                                disabled={saveeGitHubToken.isPending}
                                onClick={async () => {
                                  if(!token || token.length < 1) {
                                    alert("Please enter a valid token.");
                                    return; 
                                  }  
                                  await saveeGitHubToken.mutateAsync({ token: token ?? "" }); 
                                  await readGitHubToken.refetch();
                                  setModelOpen(false);
                                }}
                              >
                                {saveeGitHubToken.isPending ? <Loader2 className="animate-spin" /> : <><SaveIcon /> Save Token</>}
                              </Button>,
                            ]}
                          >
                            <ul className="flex flex-col gap-4">
                              <li>
                                <p className="flex flex-col gap-2">
                                  <strong>Step 1:</strong> Create a new personal access token on GitHub.
                                  <Button className="w-fit" onClick={() => {
                                    window.open(linkToGithubScope(moment().format(dateFormat)), "_blank");
                                  }}> 
                            Create Token <Link2Icon /> 
                                  </Button>
                                </p>
                              </li>
                              <li>
                                <p>
                                  <strong>Step 2:</strong> Copy the token and paste it below.
                                </p>
                                <div className="flex flex-row gap-2 items-center">
                                  <Input
                                    placeholder="Paste your token here"
                                    className="w-full my-2"
                                    type={tokenVisible ? "text" : "password"}
                                    value={token ?? ""}
                                    onChange={(e) => setToken(e.target.value)}
                                  />
                                  <Button onClick={toggleTokenVisibility}>{tokenVisible ? <Eye /> : <EyeOff />}</Button>
                                </div>
                              </li>
                              <li>
                                <p>
                                  <strong>Step 3:</strong> Click the {"\"Save Token\""} button.
                                </p>
                              </li>
                            </ul>
                          </Modal>
                        </div>
                      </div>
              }
            </div>
          </div>
        </div>
      </FadeInSlide>
    </DashboardLayout> 
  );
}

