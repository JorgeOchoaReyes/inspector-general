import { useRouter } from "next/router";
import React from "react"; 
import { Button } from "../ui/button";
import { GithubIcon } from "lucide-react";

export const GithubTokenError = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-2">
      <GithubIcon size={64} />
      <h1>GitHub Token Error</h1>
      <p>You are missing a GitHub Token, please ensure to add it</p>
      <Button
        onClick={async () => {
          await router.push("/dashboard/github");
        }}
      >
        Add GitHub Token
      </Button>
    </div>
  );  
};