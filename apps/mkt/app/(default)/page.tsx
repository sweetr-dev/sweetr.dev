import Hero from "@/components/hero";
import Cta from "@/components/cta";
import FeaturesOverview from "@/components/features-overview";
import FeaturesTraits from "@/components/features-traits";
import FeaturesAutomations from "@/components/features-automations";
import PricingTabs from "@/components/pricing-tabs";
import ProblemStatements from "@/components/problem-statements";
import FeaturesSlack from "@/components/features-slack-digests";

export default function Home() {
  return (
    <>
      <Hero />
      <ProblemStatements />
      <FeaturesOverview />
      <FeaturesSlack />
      <FeaturesAutomations />
      <FeaturesTraits />
      <PricingTabs />
      {/* <Testimonials /> */}
      <Cta />
    </>
  );
}
