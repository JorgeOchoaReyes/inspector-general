import React from "react";
import { Features } from "~/components/landing/features";
import { AuroraHero } from "~/components/landing/hero";

export default function Home() {
  return (
    <>
      <AuroraHero />
      <Features />
    </>
  );
}