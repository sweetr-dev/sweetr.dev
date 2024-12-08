"use client";

import { useState, useRef } from "react";
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
  IconEyeCode,
  IconExternalLink,
  IconBrandGithub,
} from "@tabler/icons-react";
import { ButtonDocs } from "./ui/button-docs";

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
        <ButtonDocs
          href="https://docs.sweetr.dev/features/pull-requests"
          className="mt-4"
        />
      </>
    ),
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
        <ButtonDocs
          href="https://docs.sweetr.dev/features/code-reviews"
          className="mt-4"
        />
      </>
    ),
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
        <ButtonDocs
          href="https://docs.sweetr.dev/features/team/cycle-time"
          className="mt-4"
        />
      </>
    ),
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
        <ButtonDocs
          href="https://docs.sweetr.dev/features/team/code-review-distribution"
          className="mt-4"
        />
      </>
    ),
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
        <ButtonDocs
          href="https://docs.sweetr.dev/features/team/pr-size-distribution"
          className="mt-4"
        />
      </>
    ),
    icon: IconAspectRatio,
    image: FeaturePRSize,
  },
];

export default function FeaturesOverview() {
  const [tab, setTab] = useState<number>(0);

  const tabs = useRef<HTMLDivElement>(null);

  return (
    <section className="relative border-t border-dark-400 bg-dark-800">
      <div className="py-12 md:py-20">
        {/* Carousel */}
        <div className="max-w-xl lg:max-w-6xl mx-auto px-4 sm:px-6 md:px-0">
          <div className="relative max-w-3xl mx-auto text-center pb-12 md:pb-12">
            <h2 className="font-inter-tight text-3xl md:text-4xl font-bold text-white mb-4">
              Meet the solution
            </h2>
            <h3 className="text-lg text-green-400">
              Unlock continuous improvement with team-focused data, insights &
              automations.
            </h3>
          </div>

          <div className="lg:flex space-y-12 lg:space-y-0 lg:space-x-12 xl:space-x-12">
            {/* Content */}
            <div className="lg:max-w-[430px] lg:min-w-[430px]">
              {/* Tabs buttons */}
              <div className="mb-8 md:mb-0 space-y-3">
                <div>
                  <p className="text-white uppercase text-sm font-medium text-center ">
                    For managers & their teams
                  </p>
                  <p className="text-dark-100 text-sm text-center mt-1">
                    Sweetr syncs your GitHub data automatically.
                  </p>
                </div>
                {features.map((feature, index) => {
                  const Icon = feature.icon;

                  return (
                    <button
                      key={index}
                      className={`w-full text-left px-4 py-4 rounded border border-dark-400 transition-all duration-500 ${
                        tab !== index ? "hover:scale-105" : ``
                      }`}
                      onClick={(e) => {
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
      </div>
    </section>
  );
}
