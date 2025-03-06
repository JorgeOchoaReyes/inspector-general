import React from "react";
import { Features } from "~/components/landing/features";
import Footer from "~/components/landing/footer";
import { AuroraHero } from "~/components/landing/hero";
import {Pricing} from "~/components/landing/pricing";

export default function Home() {
  return (
    <>
      <AuroraHero />
      <Features />
      <Pricing />
      <Footer />
    </>
  );
}