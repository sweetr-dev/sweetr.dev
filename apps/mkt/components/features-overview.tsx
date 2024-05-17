"use client";

import { useState, useRef, useEffect } from "react";
import { Transition } from "@headlessui/react";
import Image from "next/image";
import FeaturePRs from "@/public/images/feature-prs.png";
import FeatureCodeReviews from "@/public/images/feature-code-review.png";
import FeatureCycleTime from "@/public/images/feature-cycle-time.png";
import FeatureCRDistribution from "@/public/images/feature-cr-distribution.png";
import FeaturePRSize from "@/public/images/feature-pr-size.png";
import {
  IconGitMerge,
  IconClock,
  IconAspectRatio,
  IconEyeDiscount,
  IconTarget,
  IconActivityHeartbeat,
  IconEyeCode,
  IconSteam,
  IconRefreshDot,
  IconHeartHandshake,
  IconHeadphones,
  IconExternalLink,
  IconBrandGithub,
} from "@tabler/icons-react";

const features = [
  {
    title: "Pull Requests",
    description: "Filterable list of PRs with lifecycle indicators.",
    benefits: (
      <>
        <ul className="list-disc marker:text-green-400 ml-4">
          <li>Flags work stuck in review or merge.</li>
          <li>Flags hot PRs with lots of comments.</li>
          <li>Flags PRs that are too big.</li>
        </ul>
      </>
    ),
    contentHeight: 165,
    icon: IconGitMerge,
    image: FeaturePRs,
  },
  {
    title: "Code Reviews",
    description:
      "List of reviews with number of comments and first-to-review indicator.",
    benefits: (
      <>
        <ul className="list-disc marker:text-green-400 ml-4">
          <li>Understand review frequency and depth.</li>
          <li>Spot "LGTM" stamps.</li>
          <li>Empower leaders to coach developers to be better reviewers.</li>
        </ul>
      </>
    ),
    contentHeight: 213,
    icon: IconEyeCode,
    image: FeatureCodeReviews,
  },
  {
    title: "DORA: Cycle Time",
    description: "View average time to code, review, and merge.",
    benefits: (
      <>
        <ul className="list-disc marker:text-green-400 ml-4">
          <li>Identify bottlenecks that need action.</li>
          <li>Understand whether iterations on process are being effective.</li>
        </ul>
      </>
    ),
    contentHeight: 165,
    icon: IconClock,
    image: FeatureCycleTime,
  },
  {
    title: "Code Review Distribution",
    description: "View on developer feedback circle.",
    benefits: (
      <>
        <ul className="list-disc marker:text-green-400 ml-4">
          <li>
            Identify potential <span className="text-red-300">burnout</span> due
            to overload.
          </li>
          <li>Understand team dynamics and mentorship.</li>
          <li>Understand reviewer cross-team allocation.</li>
        </ul>
      </>
    ),
    contentHeight: 165,
    icon: IconEyeDiscount,
    image: FeatureCRDistribution,
  },
  {
    title: "Pull Request Size",
    description: "View on distribution of Pull Requests by size.",
    benefits: (
      <>
        <ul className="list-disc marker:text-green-400 ml-4">
          <li>Verify whether the team is striving for smaller PRs.</li>
          <li>Correlate with cycle time and time to review.</li>
          <li>Encourage a culture of small PRs.</li>
        </ul>
      </>
    ),
    contentHeight: 189,
    icon: IconAspectRatio,
    image: FeaturePRSize,
  },
];

export default function FeaturesOverview() {
  const [tab, setTab] = useState<number>(0);

  const tabs = useRef<HTMLDivElement>(null);

  const heightFix = () => {
    if (tabs.current && tabs.current.parentElement)
      tabs.current.parentElement.style.height = `${tabs.current.clientHeight}px`;
  };

  useEffect(() => {
    setTimeout(heightFix, 300);
  }, [tab, tabs.current]);

  return (
    <section className="relative border-t border-dark-400 bg-dark-800">
      <div className="py-12 md:py-20">
        {/* Carousel */}
        <div className="max-w-xl lg:max-w-6xl mx-auto px-4 sm:px-6 md:px-0">
          <div className="relative max-w-3xl mx-auto text-center pb-12 md:pb-12">
            <h2 className="font-inter-tight text-3xl md:text-4xl font-bold text-white mb-4">
              Understand your flow.
            </h2>
            <p className="text-lg text-green-400">
              Unlock continuous improvement with team-focused data & insights.
            </p>
          </div>

          <div className="lg:flex space-y-12 lg:space-y-0 lg:space-x-12 xl:space-x-12">
            {/* Content */}
            <div className="lg:max-w-none lg:min-w-[430px]">
              {/* Tabs buttons */}
              <div className="mb-8 md:mb-0 space-y-2">
                {features.map((feature, index) => {
                  const Icon = feature.icon;

                  return (
                    <button
                      key={index}
                      className={`w-full text-left px-4 py-4 rounded border border-dark-400 transition-all duration-500 ${
                        tab !== index ? "hover:scale-105" : ``
                      }`}
                      style={{
                        maxHeight:
                          tab === index ? feature.contentHeight + 58 : 61,
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        setTab(index);
                      }}
                    >
                      <div className="flex items-center gap-[8px]">
                        <Icon
                          stroke={1}
                          className={`${
                            tab !== index ? "text-zinc-200" : "text-green-400"
                          } shrink-0`}
                          size={24}
                        />
                        <div className="font-inter-tight text-lg font-semibold text-zinc-200">
                          {feature.title}
                        </div>
                      </div>
                      {tab === index && (
                        <div className="ml-8 text-dark-100">
                          <div>{feature.description}</div>
                          <div className="mt-2">{feature.benefits}</div>
                        </div>
                      )}
                    </button>
                  );
                })}
                <a
                  href="https://github.com/apps/sweetr-dev/installations/new"
                  target="_blank"
                  rel="nofollow"
                  className="block w-full text-left px-4 py-4 rounded border border-green-400 hover:scale-105 transition-all duration-500"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[8px] text-green-400">
                      <IconBrandGithub
                        stroke={1}
                        className={`shrink-0`}
                        size={24}
                      />
                      <div className="font-inter-tight text-lg font-semibold ">
                        Try now - Connect to GitHub
                      </div>
                    </div>
                    <div>
                      <IconExternalLink
                        stroke={1}
                        size={16}
                        className="text-green-400"
                      />
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {/* Tabs items */}
            <div className="relative lg:max-w-none transition-all duration-300">
              <div className="relative flex flex-col" ref={tabs}>
                {features.map((feature, index) => {
                  return (
                    <Transition
                      key={index}
                      show={tab === index}
                      className="w-full"
                      enter="transition ease-in-out duration-700 transform order-first"
                      enterFrom="opacity-0 -translate-y-4"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in-out duration-300 transform absolute"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-4"
                      beforeEnter={() => heightFix()}
                      unmount={false}
                    >
                      <div>
                        <Image
                          className="w-auto lg:max-w-none mx-auto rounded-lg border border-dark-400 shadow-lg"
                          src={feature.image}
                          unoptimized
                          priority={false}
                          alt={feature.title}
                        />
                      </div>
                    </Transition>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Features blocks */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-24 lg:mt-32">
          <div className="text-center">
            <h2 className="font-inter-tight text-2xl md:text-3xl font-bold text-white">
              A lot more to come.
            </h2>
            <p className="text-md text-zinc-400">
              A sneak peek into our planned features and roadmap.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-16 mt-12">
            {/* Block #3 */}
            {[
              {
                title: "DX Surveys",
                description:
                  "Qualitative data on your engineering organization through automated surveys tailored for developers.",
                icon: IconSteam,
              },
              {
                title: "CI Insights",
                description:
                  "Integration with your CI/CD for insights on failure rates, runtime, and correlation with other metrics.",
                icon: IconRefreshDot,
              },
              {
                title: "Focus time",
                description:
                  "Integration with your calendar provider to give you insights on developers' available focus time.",
                icon: IconHeadphones,
              },
              {
                title: "Wellbeing",
                description:
                  "More wellbeing-focused insights for increased developer satisfaction and wellness.",
                icon: IconActivityHeartbeat,
              },
              {
                title: "Targets",
                description:
                  "Define team improvement targets on relevant metrics and get automated nudges and reports.",
                icon: IconTarget,
              },
              {
                title: "Onboarding",
                description:
                  "A gamified experience to make onboarding more effective and fun.",
                icon: IconHeartHandshake,
              },
            ].map((plannedFeature) => {
              const Icon = plannedFeature.icon;

              return (
                <div key={plannedFeature.title}>
                  <div className="flex items-center mb-1 gap-2">
                    <div className="border border-dark-300 p-1 rounded-lg">
                      <Icon stroke={1} className="text-green-400" size={24} />
                    </div>
                    <h3 className="font-inter-tight font-semibold text-zinc-200">
                      {plannedFeature.title}
                    </h3>
                  </div>
                  <p className="text-sm text-dark-100">
                    {plannedFeature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
