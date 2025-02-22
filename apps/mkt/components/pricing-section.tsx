import Accordion from "@/components/accordion";
import Link from "next/link";
import { PricingCards } from "./pricing-cards";

export default function PricingSection() {
  const faqs = [
    {
      title: "What is a contributor?",
      text: (
        <>
          A contributor is anyone who has created or reviewed a Pull Request in
          the last 30 days.
        </>
      ),
      active: true,
    },
    {
      title: "Is my repository code safe?",
      text: (
        <>
          Absolutely. Sweetr does not have access to your code. We follow
          stringent security best practices to protect our servers and
          application.{" "}
          <a
            href="https://docs.sweetr.dev/about/data-privacy-and-security"
            target="_blank"
            className="text-green-400 underline"
          >
            Read more
          </a>
          .
        </>
      ),
      active: true,
    },
    {
      title: "Is self-hosting available?",
      text: (
        <>
          Yes! Self-hosting is free, forever. However, it comes with maintenance
          and setup hurdles. We recommend the Cloud version unless you have hard
          requirements to manage your own infrastructure.{" "}
          <a
            href="https://docs.sweetr.dev/get-started/self-host"
            target="_blank"
            className="text-green-400 underline"
          >
            Learn how to self-host
          </a>
          .
        </>
      ),
      active: false,
    },
    {
      title: "Is training needed?",
      text: "Not at all, you and your team should be able to use Sweetr without any prior training. We design simple and intuitive interfaces, and documentation is highly available.",
      active: false,
    },
    {
      title: "How is my data used? Can it be removed?",
      text: (
        <>
          Sweetr only saves data necessary to provide service to you. You can
          delete all of your private data from our servers by revoking OAuth
          access or uninstalling our application from your GitHub account or
          organization at any moment.
          <Link
            className="text-green-400 hover:underline block mt-1"
            target="_blank"
            href="/privacy-policy"
          >
            Read our privacy policy.
          </Link>
        </>
      ),
      active: false,
    },
    {
      title: "Is GitLab or BitBucket supported?",
      text: (
        <>
          Not yet. They are in our backlog, you can check their status on
          Featurebase.
          <div className="mt-1">
            <Link
              target="_blank"
              className="text-green-400 hover:underline"
              href="https://sweetr.featurebase.app/p/bitbucket-integration-2"
            >
              BitBucket
            </Link>{" "}
            •{" "}
            <Link
              target="_blank"
              className="text-green-400 hover:underline"
              href="https://sweetr.featurebase.app/p/gitlab-integration-8"
            >
              {" "}
              GitLab
            </Link>
          </div>
        </>
      ),
      active: false,
    },
    {
      title: "Are contributions accepted?",
      text: (
        <>
          Fore sure! We welcome PRs from the community. You can learn more in
          our{" "}
          <Link
            target="_blank"
            className="text-green-400 hover:underline"
            href="https://docs.sweetr.dev/about/open-source"
          >
            contribution guide
          </Link>
          .
        </>
      ),
      active: false,
    },
  ];

  return (
    <section id="pricing" className="bg-dark-800 border-t border-dark-400">
      <div className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-0">
          <div className="relative max-w-3xl mx-auto text-center pb-12">
            <h2 className="font-inter-tight text-3xl md:text-4xl font-bold text-white mb-4">
              Pricing
            </h2>
            <h3 className="text-lg text-dark-100">
              No credit card required to get started.{" "}
              <span className="text-green-400">Self-host for free.</span>
            </h3>
          </div>

          <PricingCards />

          {/* FAQs */}
          <div className="max-w-2xl mx-auto">
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <Accordion
                  key={index}
                  title={faq.title}
                  id={`faqs-${index}`}
                  active={faq.active}
                >
                  {faq.text}
                </Accordion>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
