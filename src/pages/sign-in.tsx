import React, { type ReactNode } from "react";
import { SiDiscord, SiGithub, SiGoogle } from "react-icons/si";
import { FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react"; 
import Link from "next/link"; 

export default function AuthPage() {
  const router = useRouter(); 
  return (
    <div className="bg-zinc-950 flex h-screen items-center text-zinc-200 selection:bg-zinc-600">
      <BubbleButton className="absolute left-4 top-6 text-sm" onClick={() => router.push("/")}> 
        <FiArrowLeft />
        Go back
      </BubbleButton>
      <motion.div
        initial={{
          opacity: 0,
          y: 25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 1.25,
          ease: "easeInOut",
        }}
        className="relative z-10 mx-auto w-full max-w-xl p-4"
      >
        <Heading />
        <SocialOptions />
        <Terms />
      </motion.div>
      <CornerGrid />
    </div>
  );
};

const Heading = () => (
  <div>
    <NavLogo />
    <div className="mb-9 mt-6 space-y-1.5">
      <h1 className="text-2xl font-semibold">Sign in to your account or Sign up</h1>
      <p className="text-zinc-400">
        {"Don't"} have an account?{" "}
      </p>
      <p className="">
          Create one by clicking any of the buttons below.
      </p>
    </div>
  </div>
);

const SocialOptions = () => { 
  return <div> 
    <div className="flex-row flex gap-3"> 
      <BubbleButton className="flex w-full justify-center py-3" 
        onClick={async () => {
          alert("GitHub sign-in is not yet implemented.");
        }}>
        <SiGithub />
      </BubbleButton>
      <BubbleButton className="flex w-full justify-center py-3" 
        onClick={async () => { 
          try {
            await signIn("discord", {  
              callbackUrl: "/dashboard",
            }); 
          } catch (error) {
            console.error(error);
          }  
        }}>
        <SiDiscord />
      </BubbleButton>
    </div>
    <BubbleButton className="flex w-full justify-center py-3 mt-3" 
      onClick={async () => {
        alert("Google sign-in is not yet implemented.");
      }}>
      <SiGoogle />
    </BubbleButton>
  </div>;
};  

const Terms = () => (
  <p className="mt-9 text-xs text-zinc-400">
    By signing in, you agree to our{" "}
    <a href="#" className="text-blue-400">
      Terms & Conditions
    </a>{" "}
    and{" "}
    <a href="#" className="text-blue-400">
      Privacy Policy.
    </a>
  </p>
);

const BubbleButton = ({ children, className, ...rest }: ButtonProps) => {
  return (
    <button
      className={twMerge(
        `
        relative z-0 flex items-center gap-2 overflow-hidden whitespace-nowrap rounded-md 
        border border-zinc-700 bg-gradient-to-br from-zinc-800 to-zinc-950
        px-3 py-1.5
        text-zinc-50 transition-all duration-300
        
        before:absolute before:inset-0
        before:-z-10 before:translate-y-[200%]
        before:scale-[2.5]
        before:rounded-[100%] before:bg-zinc-100
        before:transition-transform before:duration-500
        before:content-[""]

        hover:scale-105 hover:text-zinc-900
        hover:before:translate-y-[0%]
        active:scale-100`,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

const CornerGrid = () => {
  return (
    <div
      style={{
        backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke-width='2' stroke='rgb(30 58 138 / 0.5)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
      }}
      className="absolute right-0 top-0 z-0 size-[50vw]"
    >
      <div
        style={{
          backgroundImage:
            "radial-gradient(100% 100% at 100% 0%, rgba(9,9,11,0), rgba(9,9,11,1))",
        }}
        className="absolute inset-0"
      />
    </div>
  );
};

const NavLogo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <img
          src="/inspector-general.png"
          alt="" 
          className="rounded-md"
        />
      </div>
      <div className="grid flex-1 text-left text-xl leading-tight">
        <span className="truncate font-semibold">
          Inspector General
        </span> 
      </div> 
    </Link>
  );
};

type ButtonProps = {
  children: ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;