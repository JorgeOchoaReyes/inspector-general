import { useRouter } from "next/router";
import React from "react"; 
import { Button } from "../ui/button";

export const GithubTokenError = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <h1>GitHub Token Error</h1>
      <p>You are missing a GitHub Token, please ensure to add it</p>
      <Button
        onClick={async () => {
          await router.push("/settings");
        }}
      >
        Add GitHub Token
      </Button>
    </div>
  );  
};