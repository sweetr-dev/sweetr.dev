"use client";

import { IconBrandGithub } from "@tabler/icons-react";
import Tooltip from "./tooltip";
import { ButtonContactUs } from "./ui/button-contact-us";
import { Slider } from "./ui/slider";
import { useState } from "react";
import { Switch, Field, Label } from "@headlessui/react";

export const PricingCards = () => {
  const [contributors, setContributors] = useState(10);
  const [isYearly, setIsYearly] = useState(false);
  const basePrice = 49;
  const discount = isYearly ? 0.8 : 1;
  const pricePerExtraContributor = 7 * discount;
  const discountedPrice = Math.floor(basePrice * discount);
  const extraContributors = Math.max(contributors - 5, 0);
  const totalPrice =
    discountedPrice + extraContributors * pricePerExtraContributor;

  return (
    <div className="pb-12 md:pb-20">
      <Field className="text-zinc-200 flex items-center gap-3 text-sm mb-6 justify-center">
        <Label className="w-[120px] text-right">Monthly</Label>
        <Switch
          checked={isYearly}
          onChange={setIsYearly}
          className="border border-dark-400 data-[checked]:border-none group inline-flex h-6 w-12 items-center rounded-full bg-dark-400 transition data-[checked]:bg-green-400"
        >
          <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
        </Switch>
        <Label className="w-[120px]">
          Yearly{" "}
          <div className="inline ml-1 border border-green-400 text-green-400 px-2 rounded-full py-1">
            20% off
          </div>
        </Label>
      </Field>

      <div className="max-w-sm mx-auto grid gap-6 lg:grid-cols-2 items-start lg:max-w-none">
        {/* Pricing tab `1` */}
        <div className="h-full">
          <div className="relative flex flex-col h-full p-6 rounded-lg bg-dark-700 border border-dark-400">
            <div className="mb-4">
              <div className="text-lg text-zinc-200 font-semibold mb-1">
                Cloud
              </div>
              <div className="font-inter-tight inline-flex items-baseline mb-2">
                <div className="text-green-400 font-bold text-2xl">
                  ${totalPrice.toFixed(2)} / month{" "}
                </div>
                {isYearly && (
                  <span className="ml-2 text-sm font-normal text-dark-100">
                    billed yearly
                  </span>
                )}
              </div>
              <div className="text-dark-100">
                For organizations that move fast.
              </div>
            </div>
            <div className="grow">
              <div className="pb-8">
                <span className="text-dark-100 text-white mb-3 block">
                  {contributors} contributors
                </span>
                <Slider
                  min={1}
                  max={100}
                  value={[contributors]}
                  onValueChange={(value) => setContributors(value[0])}
                />
              </div>
              <ul className="text-dark-100 text-sm space-y-3 grow">
                <li className="flex items-center">
                  <svg
                    className="w-3 h-3 fill-green-400 mr-3 shrink-0"
                    viewBox="0 0 12 12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <Tooltip
                    id="cloud-all-features"
                    content="Simplified plan with no feature-gating."
                  >
                    All features
                  </Tooltip>
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-3 h-3 fill-green-400 mr-3 shrink-0"
                    viewBox="0 0 12 12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <Tooltip
                    id="1-year-data-retention"
                    content="Sync and mantain historical data up to 1 year."
                  >
                    1 year data retention
                  </Tooltip>
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-3 h-3 fill-green-400 mr-3 shrink-0"
                    viewBox="0 0 12 12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <Tooltip
                    id="regular-support"
                    content="We'll help you through our live chat or email."
                  >
                    Regular support
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
                  <IconBrandGithub size={18} stroke={1.5} /> Start 14-day trial
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Pricing tab 3 */}
        <div className="h-full">
          <div className="relative flex flex-col h-full p-6 rounded-lg bg-dark-700 border border-dark-400">
            <div className="mb-4">
              <div className="text-lg text-dark-100 font-semibold mb-1">
                Enterprise
              </div>
              <div className="font-inter-tight inline-flex items-baseline mb-2">
                <span className="text-zinc-200 font-bold text-2xl">
                  Contact us
                </span>
              </div>
              <div className="text-dark-100">
                For organizations operating at large-scale.
              </div>
            </div>
            <div className="grow">
              <ul className="text-dark-100 text-sm space-y-3 grow">
                <li className="flex items-center">
                  <svg
                    className="w-3 h-3 fill-green-400 mr-3 shrink-0"
                    viewBox="0 0 12 12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <Tooltip
                    id="enterprise-all-features"
                    content="Simplified plan with no feature-gating."
                  >
                    All features
                  </Tooltip>
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-3 h-3 fill-green-400 mr-3 shrink-0"
                    viewBox="0 0 12 12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <Tooltip
                    id="unlimited-contributors"
                    content="Scale without limits."
                  >
                    Unlimited contributors
                  </Tooltip>
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-3 h-3 fill-green-400 mr-3 shrink-0"
                    viewBox="0 0 12 12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <Tooltip
                    id="on-premise-supported"
                    content="Option to self-host our application."
                  >
                    On-premise supported
                  </Tooltip>
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-3 h-3 fill-green-400 mr-3 shrink-0"
                    viewBox="0 0 12 12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  <Tooltip
                    id="3-years-data-retention"
                    content="Sync and mantain historical data up to 3 years. Customizable to your needs."
                  >
                    3+ years data retention
                  </Tooltip>
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-3 h-3 fill-green-400 mr-3 shrink-0"
                    viewBox="0 0 12 12"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>

                  <Tooltip
                    id="priority-support"
                    content="We'll help you through our live chat, email or Slack Connect."
                  >
                    Priority support
                  </Tooltip>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <ButtonContactUs />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
