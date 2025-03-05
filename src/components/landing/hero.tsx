import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect } from "react";
import { FiArrowRight } from "react-icons/fi";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react"; 
import { GithubIcon } from "lucide-react";
import { Demo } from "./demo";

const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

export const AuroraHero = () => {
  const color = useMotionValue(COLORS_TOP[0]);
  const router = useRouter();
  const { data: session } = useSession();
  useEffect(() => {
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, []);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;
  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`; 

  return (
    <motion.section
      style={{
        backgroundImage,
      }}
      className="relative grid min-h-screen overflow-hidden bg-gray-950 px-4 pt-24  text-gray-200"
    >
      <div className="relative z-10 flex flex-col items-center">
        <span className="mb-1.5 inline-block rounded-xl bg-gray-600/50 px-3 py-1.5 text-sm">
          Beta Now Live!
        </span>
        <h1 className="max-w-6xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-center text-3xl font-bold leading-tight text-transparent sm:text-5xl sm:leading-tight md:text-5xl md:leading-tight">
           Ship with  confidence. 
        </h1>
        <h1 className="max-w-6xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-center text-3xl font-bold leading-tight text-transparent sm:text-5xl sm:leading-tight md:text-5xl md:leading-tight">
           The AI inspector to <u className="text-white"> ship faster. </u>
        </h1>
        <p className="my-6 max-w-xl text-center text-base leading-relaxed md:text-lg md:leading-relaxed">
          Inspector General is the AI that helps any developer 
          go from 1x developer to <u className="text-white font-bold"> 10x developer. </u>
        </p>
        <div className="flex flex-row gap-2"> 
          <motion.button
            style={{
              border,
              boxShadow,
            }}
            whileHover={{
              scale: 1.015,
            }}
            whileTap={{
              scale: 0.985,
            }}
            onClick={async () => {
              if(window) {
                window.open("https://github.com/JorgeOchoaReyes/inspector-general","_blank");
              }
            }}
            className="group relative flex w-fit items-center gap-1.5 rounded-xl bg-gray-950/100 px-4 py-2 text-gray-50 transition-colors hover:bg-gray-950/50"
          > 
            <GithubIcon className="transition-transform group-hover:-rotate-45 group-active:-rotate-12" /> GitHub
          </motion.button>
          <motion.button
            style={{
              border,
              boxShadow,
            }}
            whileHover={{
              scale: 1.015,
            }}
            whileTap={{
              scale: 0.985,
            }}
            onClick={async () => {
              if (session) {
                await router.push("/dashboard");
                return;
              }
              await router.push("/sign-in");
            }}
            className="group relative flex w-fit items-center gap-1.5 rounded-xl bg-gray-950/100 px-4 py-2 text-gray-50 transition-colors hover:bg-gray-950/50"
          >
          Try it now!
            <FiArrowRight className="transition-transform group-hover:-rotate-45 group-active:-rotate-12" />
          </motion.button> 
        </div>
      </div> 
      <div className="absolute inset-0 z-0">
        <Canvas>
          <Stars radius={50} count={2500} factor={4} fade speed={2} />
        </Canvas>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <Demo  
          bgStyle={{
            border,
            boxShadow,
          }}
        />  
      </div>
    </motion.section>
  );
};