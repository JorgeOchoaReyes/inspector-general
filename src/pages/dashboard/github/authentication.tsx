import { Link2Icon, SaveAllIcon, SaveIcon } from "lucide-react"; 
import React from "react";  
import { FadeInSlide } from "~/components/animation/fadeInSlide";
import { DashboardLayout } from "~/components/layout/DashboardLayout"; 
import { Modal } from "~/components/modal";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

const linkToGithubScope = (date:string) => `https://github.com/settings/tokens/new?description=Inspector+General+(Created on ${date})&scopes=repo,read:org,read:user,user:email`;

const dateFormat = "MMM d, h:mm a"; 

export default function Home() {

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
                    description="To authenticate with GitHub, you need to create a personal access token."
                    buttonNodes={[
                      <Button key="save" variant="default" onClick={() => {
                        console.log("Save Token");
                      }}>
                        <SaveIcon /> Save Token
                      </Button>,
                    ]}
                  >
                    <ul className="flex flex-col gap-4">
                      <li>
                        <p className="flex flex-col gap-2">
                          <strong>Step 1:</strong> Create a new personal access token on GitHub.
                          <Button className="w-fit">
                            <a
                              href={linkToGithubScope(new Date().toLocaleDateString())} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center gap-2"> 
                              Create Token <Link2Icon />
                            </a>
                          </Button>
                        </p>
                      </li>
                      <li>
                        <p>
                          <strong>Step 2:</strong> Copy the token and paste it below.
                        </p>
                        <Input
                          placeholder="Paste your token here"
                          className="w-full my-2"
                          type="password"
                          
                        />
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

            </div>
          </div>
        </div>
      </FadeInSlide>
    </DashboardLayout> 
  );
}