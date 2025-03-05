import { motion, useInView } from "framer-motion";
import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react";
import { type IconType } from "react-icons";
import { FiDollarSign, FiEye, FiPlay, FiSearch } from "react-icons/fi";

export const Features = () => {
  return (
    <> 
      <SwapColumnFeatures /> 
    </>
  );
};

const SwapColumnFeatures = () => {
  const [featureInView, setFeatureInView] = useState<FeatureType>(features?.[0] ?? {
    id: 0,
    callout: "",
    title: "",
    description: "",
    contentPosition: "l",
    Icon: FiEye,
  });

  return (
    <section className="relative mx-auto max-w-7xl">
      <SlidingFeatureDisplay featureInView={featureInView} />
 
      <div className="-mt-[100vh] hidden md:block" />

      {features.map((s) => (
        <Content
          key={s.id}
          featureInView={s}
          setFeatureInView={setFeatureInView}
          {...s}
        />
      ))}
    </section>
  );
};

const SlidingFeatureDisplay = ({
  featureInView,
}: {
  featureInView: FeatureType;
}) => {
  return (
    <div
      style={{
        justifyContent:
          featureInView.contentPosition === "l" ? "flex-end" : "flex-start",
      }}
      className="pointer-events-none sticky top-0 z-10 hidden h-screen w-full items-center justify-center md:flex"
    >
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
        className="h-fit w-3/5 rounded-xl p-8"
      >
        <ExampleFeature featureInView={featureInView} />
      </motion.div>
    </div>
  );
};

const Content = ({
  setFeatureInView,
  featureInView,
}: {
  setFeatureInView: Dispatch<SetStateAction<FeatureType>>;
  featureInView: FeatureType;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    margin: "-150px",
  });

  useEffect(() => {
    if (isInView) {
      setFeatureInView(featureInView);
    }
  }, [isInView]);

  return (
    <section
      ref={ref}
      className="relative z-0 flex h-fit md:h-screen"
      style={{
        justifyContent:
          featureInView.contentPosition === "l" ? "flex-start" : "flex-end",
      }}
    >
      <div className="grid h-full w-full place-content-center px-4 py-12 md:w-2/5 md:px-8 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <span className="rounded-full bg-indigo-600 px-2 py-1.5 text-xs font-medium text-white">
            {featureInView.callout}
          </span>
          <p className="my-3 text-5xl font-bold">{featureInView.title}</p>
          <p className="text-slate-600">{featureInView.description}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="mt-8 block md:hidden"
        >
          <ExampleFeature featureInView={featureInView} />
        </motion.div>
      </div>
    </section>
  );
};

const ExampleFeature = ({ featureInView }: { featureInView: FeatureType }) => {
  return (
    <div className="relative h-96 w-full rounded-xl bg-slate-800 shadow-xl">
      <div className="flex w-full gap-1.5 rounded-t-xl bg-slate-900 p-3">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <div className="h-3 w-3 rounded-full bg-yellow-500" />
        <div className="h-3 w-3 rounded-full bg-green-500" />
      </div>
      <div className="p-2">
        <p className="font-mono text-sm text-slate-200">
          <span className="text-green-300">~</span> Show a part of your product
          that explains what{" "}
          <span className="inline-block rounded bg-indigo-600 px-1 font-semibold">
            {"\""}{featureInView.title}{"\""}
          </span>{" "}
          means.
        </p>
      </div>

      <span className="absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] text-9xl text-slate-700">
        <featureInView.Icon />
      </span>
    </div>
  );
};
 

type FeatureType = {
  id: number;
  callout: string;
  title: string;
  description: string;
  contentPosition: "l" | "r";
  Icon: IconType;
};

const features: FeatureType[] = [
  {
    id: 1,
    callout: "Automate your workflow",
    title: "Pull Requests Auto-Reviewed",
    description: "Get instant PR code reviews on Github to help develoeprs ship fast!",
    contentPosition: "r",
    Icon: FiEye,
  },
  {
    id: 2,
    callout: "Zone in on feedback",
    title: "Chat with Inspector General",
    description: "Ask inspector general for more details feedback on your code, or narrow in to file specific feedback.",
    contentPosition: "l",
    Icon: FiSearch,
  },
  {
    id: 3,
    callout: "Help Developers",
    title: "Line by line PR feedback",
    description: "We don't just tell a long list of issues, we provide feedback line by line to help developers find the issues and fix them quickly.",
    contentPosition: "r",
    Icon: FiPlay,
  },
  // {
  //   id: 4,
  //   callout: "10x Your Team",
  //   title: "Scan for existing issues",
  //   description: "Inspector General is always on the lookout for issues that may have been missed. It's like having a second pair of eyes on your code.",
  //   contentPosition: "l",
  //   Icon: FiDollarSign,
  // },
];