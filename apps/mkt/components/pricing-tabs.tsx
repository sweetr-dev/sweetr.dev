import Tooltip from "@/components/tooltip";
import Accordion from "@/components/accordion";
import Link from "next/link";
import { IconBook, IconBrandGithub } from "@tabler/icons-react";

export default function PricingTabs() {
  const faqs = [
    {
      title: "Is my repository code safe?",
      text: (
        <>
          Absolutely. Sweetr does not require access to your code. We follow
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
          GitHub.
          <div className="mt-1">
            <Link
              target="_blank"
              className="text-green-400 hover:underline"
              href="https://github.com/orgs/sweetr-dev/discussions/4"
            >
              BitBucket
            </Link>{" "}
            •{" "}
            <Link
              target="_blank"
              className="text-green-400 hover:underline"
              href="https://github.com/orgs/sweetr-dev/discussions/3"
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
              Pricing.
            </h2>
            <h3 className="text-lg text-dark-100">
              Totally free while in beta. No credit card required.
            </h3>
          </div>

          {/* Pricing tabs component */}
          <div className="pb-12 md:pb-20">
            <div className="max-w-sm mx-auto grid gap-6 lg:grid-cols-2 items-start lg:max-w-none">
              {/* Pricing tab `1` */}
              <div className="h-full">
                <div className="relative flex flex-col h-full p-6 rounded-lg bg-dark-700 border border-green-400">
                  {/* <Image
                    className="absolute right-6 -top-5 mix-blend-exclusion"
                    src={PricingDecoration}
                    alt="Pricing decoration"
                    width={76}
                    height={74}
                    aria-hidden="true"
                  /> */}
                  <div className="mb-4">
                    <div className="text-lg text-zinc-200 font-semibold mb-1">
                      Cloud
                    </div>
                    <div className="font-inter-tight inline-flex items-baseline mb-2">
                      <div className="text-green-400 font-bold text-2xl">
                        Free
                        <span className="text-white font-medium text-lg ml-1">
                          while on beta
                        </span>
                      </div>
                    </div>
                    <div className="text-dark-100">
                      For organizations that move fast.
                    </div>
                  </div>
                  <div className="grow">
                    <div className="text-sm text-zinc-200 font-medium mb-4">
                      Includes:
                    </div>
                    <ul className="text-dark-100 text-sm space-y-3 grow">
                      <li className="flex items-center">
                        <svg
                          className="w-3 h-3 fill-emerald-500 mr-3 shrink-0"
                          viewBox="0 0 12 12"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                        </svg>
                        <Tooltip
                          id="18"
                          content="Simplified plan with no feature-gating."
                        >
                          All features
                        </Tooltip>
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="w-3 h-3 fill-emerald-500 mr-3 shrink-0"
                          viewBox="0 0 12 12"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                        </svg>
                        <Tooltip id="14" content="Sync all your GitHub users.">
                          Unlimited users
                        </Tooltip>
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="w-3 h-3 fill-emerald-500 mr-3 shrink-0"
                          viewBox="0 0 12 12"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                        </svg>
                        <Tooltip
                          id="15"
                          content="Sync all your GitHub repositories."
                        >
                          Unlimited repositories
                        </Tooltip>
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="w-3 h-3 fill-emerald-500 mr-3 shrink-0"
                          viewBox="0 0 12 12"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                        </svg>
                        <Tooltip
                          id="16"
                          content="Sync all your GitHub pull requests."
                        >
                          Unlimited pull requests
                        </Tooltip>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-8">
                    <a
                      className="btn text-black font-semibold bg-green-400 border border-dark-400 w-full shadow"
                      href="https://github.com/apps/sweetr-dev/installations/new"
                      target="_blank"
                      rel="nofollow"
                    >
                      <div className="flex items-center gap-2">
                        <IconBrandGithub size={18} stroke={1.5} /> Try now -
                        Connect to GitHub
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              {/* Pricing tab 3 */}
              <div className="h-full">
                <div className="relative flex flex-col h-full p-6 rounded-lg border border-dark-400">
                  <div className="mb-4">
                    <div className="text-lg text-dark-100 font-semibold mb-1">
                      Self-host
                    </div>
                    <div className="font-inter-tight inline-flex items-baseline mb-2">
                      <span className="text-dark-100 font-bold text-2xl">
                        Free forever
                      </span>
                    </div>
                    <div className="text-dark-100">
                      For organizations that require full control.
                    </div>
                  </div>
                  <div className="grow">
                    <div className="text-sm text-dark-100 font-medium mb-4">
                      Includes:
                    </div>
                    <ul className="text-dark-100 text-sm space-y-3 grow">
                      <li className="flex items-center">
                        <svg
                          className="w-3 h-3 fill-emerald-500 mr-3 shrink-0"
                          viewBox="0 0 12 12"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                        </svg>
                        <Tooltip
                          id="18"
                          content="Simplified plan with no feature-gating."
                        >
                          All features
                        </Tooltip>
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="w-3 h-3 fill-emerald-500 mr-3 shrink-0"
                          viewBox="0 0 12 12"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                        </svg>
                        <Tooltip id="14" content="Sync all your GitHub users.">
                          Unlimited users
                        </Tooltip>
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="w-3 h-3 fill-emerald-500 mr-3 shrink-0"
                          viewBox="0 0 12 12"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                        </svg>
                        <Tooltip
                          id="15"
                          content="Sync all your GitHub repositories."
                        >
                          Unlimited repositories
                        </Tooltip>
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="w-3 h-3 fill-emerald-500 mr-3 shrink-0"
                          viewBox="0 0 12 12"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                        </svg>
                        <Tooltip
                          id="16"
                          content="Sync all your GitHub pull requests."
                        >
                          Unlimited pull requests
                        </Tooltip>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-8">
                    <a
                      className="btn border border-dark-400  text-dark-100 w-full shadow"
                      href="https://docs.sweetr.dev/welcome/getting-started"
                      target="_blank"
                    >
                      <div className="flex items-center gap-2">
                        <IconBook size={18} stroke={1.5} /> Documentation
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
