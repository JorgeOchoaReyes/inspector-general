import React from "react";
import { Features } from "~/components/landing/features";
import Footer from "~/components/landing/footer";
import { AuroraHero } from "~/components/landing/hero";

export default function Home() {
  return (
    <>
      <AuroraHero />
      <Features />
      <Footer />
    </>
  );
}