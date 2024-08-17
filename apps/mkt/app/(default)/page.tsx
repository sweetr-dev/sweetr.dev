import Hero from "@/components/hero";
import Cta from "@/components/cta";
import FeaturesOverview from "@/components/features-overview";
import FeaturesTraits from "@/components/features-traits";
import FeaturesAutomations from "@/components/features-automations";
import PricingTabs from "@/components/pricing-tabs";
import ProblemStatements from "@/components/problem-statements";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "sweetr.dev",
  description:
    "The dev-first platform for continuous improvement. Enable your software engineering teams to optimize and speed up development while improving developer experience.",
  openGraph: {
    title: "sweetr.dev",
    description: "The dev-first platform for continuous improvement.",
    url: "https://sweetr.dev",
    siteName: "sweetr.dev",
    images: [
      {
        url: "https://sweetr.dev/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "sweetr.dev",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "sweetr.dev",
    description: "The dev-first platform for continuous improvement.",
    images: ["https://sweetr.dev/images/og-image.png"],
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <ProblemStatements />
      <FeaturesOverview />
      <FeaturesAutomations />
      <FeaturesTraits />
      <PricingTabs />
      {/* <Testimonials /> */}
      <Cta />
    </>
  );
}
