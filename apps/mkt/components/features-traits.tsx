import Image from "next/image";
import ShieldImage from "@/public/images/shield.png";
import CommandImage from "@/public/images/command.png";
import SimpleImage from "@/public/images/simple.png";
import CommunityImage from "@/public/images/community-bg.png";
import SpeedImage from "@/public/images/speed.png";

import {
  IconActivityHeartbeat,
  IconBolt,
  IconCode,
  IconFocus,
  IconHeadphones,
  IconHeartHandshake,
  IconRefreshDot,
  IconShieldHeart,
  IconSteam,
  IconTableShortcut,
  IconTarget,
} from "@tabler/icons-react";
import Link from "next/link";
import Particles from "./automation-carousel/particles";
import Highlighter from "./automation-carousel/highlighter";

export default function FeaturesTraits() {
  return (
    <section className="bg-dark-800 border-t border-dark-400">
      <div className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-0">
          <div className="relative max-w-3xl mx-auto text-center pb-12 md:pb-12">
            <h2 className="font-inter-tight text-3xl md:text-4xl font-bold text-white mb-4">
              Your team will love it
            </h2>
            <h3 className="text-lg text-green-400">
              Designed for modern software teams.
            </h3>
          </div>

          <div>
            <Highlighter className="max-w-sm mx-auto sm:max-w-none grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-4 lg:gap-8">
              <article className="min-h-[330px] relative flex flex-col border border-dark-400 bg-dark-900 rounded-lg before:absolute before:w-48 before:h-48 before:-left-24 before:-top-24 before:bg-green-400 before:rounded-full before:opacity-0 before:pointer-events-none before:transition-opacity before:duration-500 before:translate-x-[var(--mouse-x)] before:translate-y-[var(--mouse-y)] before:hover:opacity-60 before:z-30 before:blur-[100px] after:absolute after:inset-0 after:rounded-[inherit] after:opacity-0 after:transition-opacity after:duration-500 after:[background:_radial-gradient(250px_circle_at_var(--mouse-x)_var(--mouse-y),theme(colors.slate.400),transparent)] after:group-hover:opacity-100 after:z-10 overflow-hidden">
                <Particles
                  className="absolute inset-0 z-10 group-hover/slide:opacity-100 "
                  quantity={5}
                  rgb="105, 219, 124"
                  refresh={true}
                />
                <div className="w-full absolute top-0 left-0 z-20">
                  <div className="grow flex flex-col p-5 pt-6">
                    <div className="flex items-center space-x-3 mb-1">
                      <IconShieldHeart
                        stroke={1}
                        size={32}
                        className="text-zinc-200"
                      />
                      <h3 className="font-inter-tight font-semibold text-zinc-200">
                        Developer-first.
                      </h3>
                    </div>
                    <p className="grow max-w-md text-sm text-dark-100">
                      No individual performance tracking or harmful metrics.{" "}
                      <Link
                        href="https://docs.sweetr.dev/about/principles"
                        target="_blank"
                        className="text-green-400 underline"
                      >
                        Read our guiding principles.
                      </Link>
                    </p>
                  </div>
                  <figure>
                    <Image
                      className="object-cover object-left mx-auto sm:object-contain sm:h-auto"
                      src={ShieldImage}
                      width={174}
                      height={195}
                      quality={100}
                      alt="Feature Post 02"
                    />
                  </figure>
                </div>
              </article>

              <article className="min-h-[330px] relative flex flex-col border border-dark-400 bg-dark-900 rounded-lg before:absolute before:w-48 before:h-48 before:-left-24 before:-top-24 before:bg-green-400 before:rounded-full before:opacity-0 before:pointer-events-none before:transition-opacity before:duration-500 before:translate-x-[var(--mouse-x)] before:translate-y-[var(--mouse-y)] before:hover:opacity-60 before:z-30 before:blur-[100px] after:absolute after:inset-0 after:rounded-[inherit] after:opacity-0 after:transition-opacity after:duration-500 after:[background:_radial-gradient(250px_circle_at_var(--mouse-x)_var(--mouse-y),theme(colors.slate.400),transparent)] after:group-hover:opacity-100 after:z-10 overflow-hidden">
                <Particles
                  className="absolute inset-0 z-10 group-hover/slide:opacity-100 "
                  quantity={5}
                  rgb="105, 219, 124"
                  refresh={true}
                />
                <div className="w-full absolute top-0 left-0 z-20">
                  <div className="grow flex flex-col p-5 pt-6">
                    <div className="flex items-center space-x-3 mb-1">
                      <IconFocus
                        stroke={1}
                        size={32}
                        className="text-zinc-200"
                      />
                      <h3 className="font-inter-tight font-semibold text-zinc-200">
                        Simple & Focused
                      </h3>
                    </div>
                    <p className="grow max-w-md text-sm text-dark-100">
                      Clutter-free interface and limited data-exposure for
                      maximum comprehension.
                    </p>
                  </div>
                  <figure>
                    <Image
                      className="mt-[40px] object-cover object-left mx-auto sm:object-contain sm:h-auto"
                      src={SimpleImage}
                      width={342}
                      quality={100}
                      height={114}
                      alt="Simple & Focused"
                    />
                  </figure>
                </div>
              </article>
              <article className="min-h-[330px] relative flex flex-col border border-dark-400 bg-dark-900 rounded-lg before:absolute before:w-48 before:h-48 before:-left-24 before:-top-24 before:bg-green-400 before:rounded-full before:opacity-0 before:pointer-events-none before:transition-opacity before:duration-500 before:translate-x-[var(--mouse-x)] before:translate-y-[var(--mouse-y)] before:hover:opacity-60 before:z-30 before:blur-[100px] after:absolute after:inset-0 after:rounded-[inherit] after:opacity-0 after:transition-opacity after:duration-500 after:[background:_radial-gradient(250px_circle_at_var(--mouse-x)_var(--mouse-y),theme(colors.slate.400),transparent)] after:group-hover:opacity-100 after:z-10 overflow-hidden">
                <Particles
                  className="absolute inset-0 z-10 group-hover/slide:opacity-100 "
                  quantity={5}
                  rgb="105, 219, 124"
                  refresh={true}
                />
                <div className="w-full absolute top-0 left-0 z-20">
                  <div className="grow flex flex-col p-5 pt-6">
                    <div className="flex items-center space-x-3 mb-1">
                      <IconBolt
                        stroke={1}
                        size={32}
                        className="text-zinc-200"
                      />
                      <h3 className="font-inter-tight font-semibold text-zinc-200">
                        Blazing Fast
                      </h3>
                    </div>
                    <p className="grow max-w-md text-sm text-dark-100">
                      Built for performance since day zero. No time wasted.
                    </p>
                  </div>
                  <figure>
                    <Image
                      className="object-cover object-left mx-auto sm:object-contain sm:h-auto"
                      src={SpeedImage}
                      width={174}
                      height={195}
                      quality={100}
                      alt="Blazing Fast"
                    />
                  </figure>
                </div>
              </article>
              <article className=" sm:col-span-2 min-h-[370px] relative flex flex-col border border-dark-400 bg-dark-900 rounded-lg before:absolute before:w-48 before:h-48 before:-left-24 before:-top-24 before:bg-green-400 before:rounded-full before:opacity-0 before:pointer-events-none before:transition-opacity before:duration-500 before:translate-x-[var(--mouse-x)] before:translate-y-[var(--mouse-y)] before:hover:opacity-60 before:z-30 before:blur-[100px] after:absolute after:inset-0 after:rounded-[inherit] after:opacity-0 after:transition-opacity after:duration-500 after:[background:_radial-gradient(250px_circle_at_var(--mouse-x)_var(--mouse-y),theme(colors.slate.400),transparent)] after:group-hover:opacity-100 after:z-10 overflow-hidden">
                <Particles
                  className="absolute inset-0 z-10 group-hover/slide:opacity-100 "
                  quantity={5}
                  rgb="105, 219, 124"
                  refresh={true}
                />

                <div className="w-full absolute top-0 left-0 z-20">
                  <div className="grow flex flex-col p-5 pt-6">
                    <div className="flex items-center space-x-3 mb-1">
                      <IconCode
                        stroke={1}
                        size={32}
                        className="text-zinc-200"
                      />
                      <h3 className="font-inter-tight font-semibold text-zinc-200 ">
                        Community-oriented & source-available.
                      </h3>
                    </div>
                    <p className="grow  text-sm text-dark-100">
                      Join our GitHub community to share feedback, report
                      problems or submit contributions.{" "}
                      <Link
                        href="https://github.com/orgs/sweetr-dev/discussions"
                        className="text-green-400 underline"
                      >
                        Learn more.
                      </Link>
                    </p>
                  </div>
                  <figure className="relative">
                    <Image
                      className="h-[250px] mt-[27px] lg:h-[280px] lg:max-h-[280px] border border-dark-400 w-auto object-cover mx-auto object-left sm:object-contain sm:h-auto rounded-t-lg opacity-80 shadow-[0_0_20px_3px_rgba(255,255,255,0.1)] block"
                      src={CommunityImage}
                      width={721}
                      height={280}
                      alt="Community"
                    />
                  </figure>
                </div>
              </article>
              <article className="min-h-[370px] relative flex flex-col border border-dark-400 bg-dark-900 rounded-lg before:absolute before:w-48 before:h-48 before:-left-24 before:-top-24 before:bg-green-400 before:rounded-full before:opacity-0 before:pointer-events-none before:transition-opacity before:duration-500 before:translate-x-[var(--mouse-x)] before:translate-y-[var(--mouse-y)] before:hover:opacity-60 before:z-30 before:blur-[100px] after:absolute after:inset-0 after:rounded-[inherit] after:opacity-0 after:transition-opacity after:duration-500 after:[background:_radial-gradient(250px_circle_at_var(--mouse-x)_var(--mouse-y),theme(colors.slate.400),transparent)] after:group-hover:opacity-100 after:z-10 overflow-hidden">
                <Particles
                  className="absolute inset-0 z-10 group-hover/slide:opacity-100 "
                  quantity={5}
                  rgb="105, 219, 124"
                  refresh={true}
                />
                <div className="w-full absolute top-0 left-0 z-20">
                  <div className="grow flex flex-col p-5 pt-6">
                    <div className="flex items-center space-x-3 mb-1">
                      <IconTableShortcut
                        stroke={1}
                        size={32}
                        className="text-zinc-200"
                      />
                      <h3 className="font-inter-tight font-semibold text-zinc-200">
                        Command Bar
                      </h3>
                    </div>
                    <p className="grow max-w-md text-sm text-dark-100">
                      Perform actions, search, or navigate using your keyboard.
                    </p>
                  </div>
                  <figure>
                    <Image
                      className="object-cover object-left ml-[20px] mt-[5px] sm:object-contain sm:h-auto opacity-80"
                      src={CommandImage}
                      width={369}
                      height={394}
                      quality={100}
                      alt="Feature Post 03"
                    />
                  </figure>
                </div>
              </article>
            </Highlighter>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-24 lg:mt-28">
          <div className="text-center">
            <h2 className="font-inter-tight text-2xl md:text-3xl font-bold text-white">
              A lot more to come
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
