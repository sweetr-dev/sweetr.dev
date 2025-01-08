"use client";

import { useState, useRef, useEffect } from "react";
import { Transition } from "@headlessui/react";
import Image from "next/image";
import SlackLogo from "@/public/images/logos/slack.svg";
import DigestMetrics from "@/public/images/digest-metrics.png";
import DigestWip from "@/public/images/digest-wip.png";
import { IconChartBar, IconProgress } from "@tabler/icons-react";

export default function FeaturesSlackDigests() {
  const [tab, setTab] = useState<number>(1);

  const tabs = useRef<HTMLDivElement>(null);

  const heightFix = () => {
    if (tabs.current && tabs.current.parentElement)
      tabs.current.parentElement.style.height = `${tabs.current.clientHeight}px`;
  };

  useEffect(() => {
    heightFix();
  }, []);

  return (
    <section className="relative bg-dark-800 border-t border-dark-400">
      <div className="py-12 md:py-20">
        <div className="max-w-[908px] mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center pb-12">
            <h2 className="font-inter-tight text-3xl md:text-4xl font-bold text-white mb-4">
              Digests
            </h2>
            <p className="text-lg text-dark-100">
              Scheduled digests to keep your team informed and accountable.
            </p>
          </div>
          <div>
            {/* Tabs buttons */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6">
              <button
                className={`hover:scale-105 transition-all duration-200 text-left px-4 py-5 border border-dark-400 rounded ${tab !== 1 ? "" : "shadow-lg shadow-green-400/20 border-green-400"}`}
                onClick={(e) => {
                  e.preventDefault();
                  setTab(1);
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div
                    className={`text-xl font-inter-tight font-semibold ${
                      tab !== 1 ? "text-zinc-200" : "text-green-400"
                    }`}
                  >
                    Metrics Digest
                  </div>
                  <div
                    className={`${tab === 1 ? "text-green-400" : "text-white"}`}
                  >
                    <IconChartBar stroke={1} />
                  </div>
                </div>
                <div className="text-sm text-zinc-400">
                  Identify bottlenecks and understand impact of changes.
                </div>
              </button>
              <button
                className={`hover:scale-105 transition-all duration-200 text-left px-4 py-5 border border-dark-400 rounded ${tab !== 2 ? "" : "shadow-lg shadow-green-400/20 border-green-400"}`}
                onClick={(e) => {
                  e.preventDefault();
                  setTab(2);
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div
                    className={`text-xl font-inter-tight font-semibold ${
                      tab !== 2 ? "text-zinc-200" : "text-green-400"
                    }`}
                  >
                    Work In Progress Digest
                  </div>
                  <div
                    className={`${tab === 2 ? "text-green-400" : "text-white"}`}
                  >
                    <IconProgress stroke={1.5} />
                  </div>
                </div>
                <div className="text-sm text-zinc-400">
                  Keep the team in sync.
                </div>
              </button>
            </div>
            {/* Tabs items */}
            <div className="relative lg:max-w-none -mx-6">
              <div className="relative flex flex-col pt-12  mx-6" ref={tabs}>
                {/* Item 1 */}
                <Transition
                  show={tab === 1}
                  as="div"
                  className="w-full text-center"
                  enter="transition ease-in-out duration-700 transform order-first"
                  enterFrom="opacity-0 -translate-y-4"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in-out duration-300 transform absolute"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-4"
                  beforeEnter={() => heightFix()}
                  unmount={false}
                >
                  <div className="inline-flex relative align-top">
                    <Image
                      className="rounded-lg box-content"
                      src={DigestMetrics}
                      quality={100}
                      width={860}
                      height={500}
                      alt="Metrics Digest"
                    />

                    <Image
                      className="absolute top-0 left-full -translate-x-[70%] ml-2 -mt-4 md:ml-5 md:-mt-6 w-[48px] h-[48px] md:w-[100px] md:h-[100px]"
                      src={SlackLogo}
                      width={100}
                      height={100}
                      alt="Illustration"
                      aria-hidden="true"
                    />
                  </div>
                </Transition>
                {/* Item 2 */}
                <Transition
                  show={tab === 2}
                  as="div"
                  className="w-full text-center"
                  enter="transition ease-in-out duration-700 transform order-first"
                  enterFrom="opacity-0 -translate-y-4"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in-out duration-300 transform absolute"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-4"
                  beforeEnter={() => heightFix()}
                  unmount={false}
                >
                  <div className="inline-flex relative align-top">
                    <Image
                      className="rounded-lg box-content"
                      src={DigestWip}
                      width={860}
                      height={500}
                      quality={100}
                      alt="Work In Progress Digest"
                    />

                    <Image
                      className="absolute top-0 left-full -translate-x-[70%] ml-2 -mt-4 md:ml-5 md:-mt-6 w-[48px] h-[48px] md:w-[100px] md:h-[100px]"
                      src={SlackLogo}
                      width={100}
                      height={100}
                      alt="Illustration"
                      aria-hidden="true"
                    />
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
