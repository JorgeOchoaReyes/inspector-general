import React, { type ReactNode, type CSSProperties } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

export const Pricing = () => {
  const router = useRouter();
  const onClickLeadToDashboard = async () => {
    await router.push("/dashboard");
  };    
  return (
    <section 
      className="relative overflow-hidden  bg-[#0f172a] text-zinc-200 selection:bg-zinc-600 min-h"
    >
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-28 md:px-8">
        <div className="mb-12 space-y-3">
          <h2 className="text-center text-3xl font-semibold leading-tight sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
            Pricing
          </h2>
          <p className="text-center text-base text-zinc-400 md:text-lg">
            Use it for free for yourself, upgrade when your team needs more repos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <PriceCard
            tier="Free"
            price="$0/mo"
            bestFor="Best for 1-5 users"
            CTA={<GhostButton onClick={onClickLeadToDashboard} className="w-full">Get started free</GhostButton>}
            benefits={[
              { text: "One repository", checked: true }, 
              { text: "30 day data retention", checked: true },  
            ]}
          />
          <PriceCard
            tier="Pro"
            price="$10/mo"
            bestFor="Best for 5-50 users"
            CTA={
              <GhostButton onClick={onClickLeadToDashboard} className="w-full bg-zinc-50 text-zinc-950 hover:bg-zinc-200 hover:text-zinc-900">
                14-day free trial
              </GhostButton>
            }
            benefits={[ 
              { text: "Multiple repository", checked: true },
              { text: "Email support", checked: true }, 
              { text: "365 day data retention", checked: true }, 
              { text: "Priority support", checked: true }, 
            ]}
          />
          <PriceCard
            tier="Enterprise"
            price="Contact us"
            bestFor="Best for 50+ users"
            CTA={<GhostButton  onClick={async () => {
              await router.push("sign-in");
            }} className="w-full">Contact us</GhostButton>}
            benefits={[
              { text: "Multiple repository", checked: true },
              { text: "Email support", checked: true },
              { text: "Data retention", checked: true }, 
              { text: "Priority support", checked: true }, 
            ]}
          />
        </div>
      </div>
    </section>
  );
};

const PriceCard = ({ tier, price, bestFor, CTA, benefits }: PriceCardProps) => {
  return (
    <Card>
      <div className="flex flex-col items-center border-b border-zinc-700 pb-6">
        <span className="mb-6 inline-block text-zinc-50">{tier}</span>
        <span className="mb-3 inline-block text-4xl font-medium ">{price}</span>
        <span className="bg-gradient-to-br from-zinc-200 to-zinc-500 bg-clip-text text-center text-transparent">
          {bestFor}
        </span>
      </div>

      <div className="space-y-4 py-9">
        {benefits.map((b, i) => (
          <Benefit {...b} key={i} />
        ))}
      </div> 
      {CTA} 
    </Card>
  );
};

const Benefit = ({ text, checked }: BenefitType) => {
  return (
    <div className="flex items-center gap-3">
      {checked ? (
        <span className="grid size-5 place-content-center rounded-full bg-blue-600 text-sm text-zinc-50">
          <FiCheck />
        </span>
      ) : (
        <span className="grid size-5 place-content-center rounded-full bg-zinc-800 text-sm text-zinc-400">
          <FiX />
        </span>
      )}
      <span className="text-sm text-zinc-300">{text}</span>
    </div>
  );
};

const Card = ({ className, children, style = {} }: CardProps) => {
  return (
    <motion.div
      initial={{
        filter: "blur(2px)",
      }}
      whileInView={{
        filter: "blur(0px)",
      }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
        delay: 0.25,
      }}
      style={style}
      className={twMerge(
        "relative h-full w-full overflow-hidden rounded-2xl border border-zinc-700 bg-[#020818] p-6",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

const GhostButton = ({ children, className, ...rest }: GhostButtonProps) => {
  return (
    <button
      className={twMerge(
        "rounded-md px-4 py-2 text-lg text-zinc-100 transition-all hover:scale-[1.02] hover:bg-zinc-800 hover:text-zinc-50 active:scale-[0.98]",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

type PriceCardProps = {
  tier: string;
  price: string;
  bestFor: string;
  CTA: ReactNode;
  benefits: BenefitType[];
};

type CardProps = {
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
};

type BenefitType = {
  text: string;
  checked: boolean;
};

type GhostButtonProps = {
  children: ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>; 