"use client";

import { useState, useRef, useEffect } from "react";
import { Transition } from "@headlessui/react";
import Image from "next/image";
import SlackLogo from "@/public/images/logos/slack.svg";
import DigestMetrics from "@/public/images/digest-metrics.png";
import Alerts from "@/public/images/alerts.png";
import DigestWip from "@/public/images/digest-wip.png";
import {
  IconAlertHexagon,
  IconChartBar,
  IconProgress,
} from "@tabler/icons-react";
import { ButtonDocs } from "./ui/button-docs";

export default function FeaturesSlack() {
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center pb-16">
            <h2 className="font-inter-tight text-3xl md:text-4xl font-bold text-white mb-4">
              Slack Notifications
            </h2>
            <p className="text-lg text-dark-100">
              Real-time alerts & scheduled digests keep your team{" "}
              <span className="text-green-400">informed</span> and{" "}
              <span className="text-green-400">accountable</span>.
            </p>
          </div>
          <div>
            {/* Tabs buttons */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <button
                className={`flex flex-col gap-1 items-center text-center hover:scale-105 transition-all duration-200 text-left py-6 px-10 border border-dark-400 rounded ${tab !== 1 ? "" : "shadow-lg shadow-green-400/20 border-green-400"}`}
                onClick={(e) => {
                  setTab(1);
                }}
              >
                <div
                  className={`mb-1 ${tab === 1 ? "text-green-400" : "text-white"}`}
                >
                  <IconAlertHexagon stroke={1} size={44} />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <div
                    className={`text-xl font-inter-tight font-semibold ${
                      tab !== 1 ? "text-zinc-200" : "text-green-400"
                    }`}
                  >
                    Real-time Alerts
                  </div>
                </div>
                <div className="text-sm text-zinc-400">
                  Configurable alerts for slow review/merge, merged without
                  approval, and more.
                </div>
                <ButtonDocs
                  href="https://docs.sweetr.dev/features/alerts"
                  className="mt-4"
                />
              </button>
              <button
                className={`flex flex-col gap-1 items-center text-center hover:scale-105 transition-all duration-200 text-left py-6 px-10 border border-dark-400 rounded ${tab !== 2 ? "" : "shadow-lg shadow-green-400/20 border-green-400"}`}
                onClick={(e) => {
                  setTab(2);
                }}
              >
                <div
                  className={`mb-1 ${tab === 2 ? "text-green-400" : "text-white"}`}
                >
                  <IconChartBar stroke={0.75} size={44} />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <div
                    className={`text-xl font-inter-tight font-semibold ${
                      tab !== 2 ? "text-zinc-200" : "text-green-400"
                    }`}
                  >
                    Metrics Digest
                  </div>
                </div>
                <div className="text-sm text-zinc-400">
                  Identify bottlenecks and understand impact of changes.
                </div>
                <ButtonDocs
                  href="https://docs.sweetr.dev/features/digests#metrics-digest"
                  className="mt-4"
                />
              </button>
              <button
                className={`flex flex-col gap-1 items-center text-center hover:scale-105 transition-all duration-200 text-left py-6 px-10 border border-dark-400 rounded ${tab !== 3 ? "" : "shadow-lg shadow-green-400/20 border-green-400"}`}
                onClick={(e) => {
                  setTab(3);
                }}
              >
                <div
                  className={`mb-1 ${tab === 3 ? "text-green-400" : "text-white"}`}
                >
                  <IconProgress stroke={1} size={44} />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <div
                    className={`text-xl font-inter-tight font-semibold ${
                      tab !== 3 ? "text-zinc-200" : "text-green-400"
                    }`}
                  >
                    Work In Progress Digest
                  </div>
                </div>
                <div className="text-sm text-zinc-400">
                  Bring visibility into the work and keep the whole team in
                  sync.
                </div>
                <ButtonDocs
                  href="https://docs.sweetr.dev/features/digests#work-in-progress-digest"
                  className="mt-4"
                />
              </button>
            </div>
            {/* Tabs items */}
            <div className="relative lg:max-w-none -mx-6">
              <div className="relative flex flex-col pt-12  mx-6" ref={tabs}>
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
                      src={Alerts}
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
                {/* Item 3 */}
                <Transition
                  show={tab === 3}
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
