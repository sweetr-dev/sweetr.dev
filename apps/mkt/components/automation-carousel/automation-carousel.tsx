"use client";

import { useEffect, useState } from "react";
import Particles from "./particles";
import Highlighter from "./highlighter";
import Swiper, { Navigation } from "swiper";
import "swiper/swiper.min.css";
import AutomationIcon from "./automation-benefit-icon";

Swiper.use([Navigation]);

export const AutomationCarousel = () => {
  const [swiperInitialized, setSwiperInitialized] = useState<boolean>(false);

  useEffect(() => {
    const carousel = new Swiper("#automation-carousel", {
      breakpoints: {
        320: {
          slidesPerView: 1,
        },
        640: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
        },
      },
      grabCursor: true,
      loop: false,
      centeredSlides: false,
      initialSlide: 0,
      spaceBetween: 24,
      navigation: {
        nextEl: ".carousel-next",
        prevEl: ".carousel-prev",
      },
    });
    setSwiperInitialized(true);
  }, []);

  return (
    <div>
      <div className="relative before:absolute before:inset-0 before:-translate-x-full before:z-20 before:bg-gradient-to-l before:from-transparent before:to-dark-800 before:to-20% after:absolute after:inset-0 after:translate-x-full after:z-20 after:bg-gradient-to-r after:from-transparent after:to-dark-800 after:to-20%">
        <div id="automation-carousel" className="swiper-container group h-full">
          <Highlighter
            className="swiper-wrapper w-fit"
            refresh={swiperInitialized}
          >
            <div className="rounded-[4px] swiper-slide h-full group/slide">
              <div className="border border-dark-400 relative h-full bg-dark-700 rounded-[inherit] z-20 overflow-hidden">
                <div className="bg-blue-100 flex align-center justify-center text-[80px] py-8 z-20 relative">
                  📏
                  <Particles
                    className="absolute inset-0 -z-10 opacity-80 transition-opacity duration-500 ease-in-out"
                    quantity={4}
                    refresh={swiperInitialized}
                    rgb="23, 25, 25"
                  />
                </div>
                <div className="flex flex-col p-4 h-full">
                  <div className="grow">
                    <div className="font-bold text-lg mb-1 text-zinc-200">
                      Label PR Size
                    </div>
                    <div className="text-dark-200 mb-3">
                      Automatically label a Pull Request on GitHub with its
                      size. Increase awareness about creating small PRs.
                    </div>
                  </div>
                  <div className="flex space-x-1 mb-1">
                    <AutomationIcon type="cycleTime" />
                    <AutomationIcon type="failureRate" />
                  </div>
                  <div className="font-bold text-green-400">Available</div>
                </div>
              </div>
            </div>
            <div className="rounded-[4px] swiper-slide h-full group/slide">
              <div className="border border-dark-400 relative h-full bg-dark-700 rounded-[inherit] z-20 overflow-hidden">
                <div className="bg-green-100 flex align-center justify-center text-[80px] py-8 z-20 relative">
                  ✍️
                  <Particles
                    className="absolute inset-0 -z-10 opacity-80 transition-opacity duration-500 ease-in-out"
                    quantity={4}
                    refresh={swiperInitialized}
                    rgb="23, 25, 25"
                  />
                </div>
                <div className="flex flex-col p-4 h-full">
                  <div className="grow">
                    <div className="font-bold text-lg mb-1 text-zinc-200">
                      PR Title Requirements
                    </div>
                    <div className="text-dark-200 mb-3">
                      Enforce standards on Pull Request titles. Ticket code,
                      specific prefix, or something else? You pick it.
                    </div>
                  </div>
                  <div className="flex space-x-1 mb-1">
                    <AutomationIcon type="techDebt" />
                  </div>
                  <div className="font-bold text-green-400">Available</div>
                </div>
              </div>
            </div>
            <div className="rounded-[4px] swiper-slide h-full group/slide">
              <div className="border border-dark-400 relative h-full bg-dark-700 rounded-[inherit] z-20 overflow-hidden">
                <div className="bg-blue-100 flex align-center justify-center text-[80px] py-8 z-20 relative">
                  🕵️‍♀️
                  <Particles
                    className="absolute inset-0 -z-10 opacity-80 transition-opacity duration-500 ease-in-out"
                    quantity={4}
                    refresh={swiperInitialized}
                    rgb="23, 25, 25"
                  />
                </div>
                <div className="flex flex-col p-4 h-full">
                  <div className="grow">
                    <div className="font-bold text-lg mb-1 text-zinc-200">
                      Notify Stale PRs
                    </div>
                    <div className="text-dark-200 mb-3">
                      Send a Slack message when a Pull Request hasn't been
                      reviewed or has been open for too long.
                    </div>
                  </div>
                  <div className="flex space-x-1 mb-1">
                    <AutomationIcon type="cycleTime" />
                  </div>
                  <div className="font-bold text-dark-100">Coming Soon</div>
                </div>
              </div>
            </div>
            <div className="rounded-[4px] swiper-slide h-full group/slide">
              <div className="border border-dark-400 relative h-full bg-dark-700 rounded-[inherit] z-20 overflow-hidden">
                <div className="bg-red-100 flex align-center justify-center text-[80px] py-8 z-20 relative">
                  🧊
                  <Particles
                    className="absolute inset-0 -z-10 opacity-80 transition-opacity duration-500 ease-in-out"
                    quantity={4}
                    refresh={swiperInitialized}
                    rgb="23, 25, 25"
                  />
                </div>
                <div className="flex flex-col p-4 h-full">
                  <div className="grow">
                    <div className="font-bold text-lg mb-1 text-zinc-200">
                      Code Freeze
                    </div>
                    <div className="text-dark-200 mb-3">
                      Big migration? Xmas break? Schedule a period where no PRs
                      can be merged in selected repositories.
                    </div>
                  </div>
                  <div className="flex space-x-1 mb-1">
                    <AutomationIcon type="failureRate" />
                  </div>
                  <div className="font-bold text-dark-100">Coming Soon</div>
                </div>
              </div>
            </div>
            <div className="rounded-[4px] swiper-slide h-full group/slide border-[2px] border-dashed border-dark-300">
              <div className="relative h-[385px] bg-dark-800 rounded-[inherit] z-20 overflow-hidden text-gray-100 flex items-center justify-center text-lg">
                More coming soon
              </div>
            </div>
          </Highlighter>
        </div>
      </div>

      <div className="flex mt-8 justify-end">
        <button className="carousel-prev relative z-20 w-12 h-12 flex items-center justify-center group">
          <span className="sr-only">Previous</span>
          <svg
            className="w-4 h-4 fill-dark-200 group-hover:fill-green-500 transition duration-150 ease-in-out"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6.7 14.7l1.4-1.4L3.8 9H16V7H3.8l4.3-4.3-1.4-1.4L0 8z" />
          </svg>
        </button>
        <button className="carousel-next relative z-20 w-12 h-12 flex items-center justify-center group">
          <span className="sr-only">Next</span>
          <svg
            className="w-4 h-4 fill-dark-200 group-hover:fill-green-500 transition duration-150 ease-in-out"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.3 14.7l-1.4-1.4L12.2 9H0V7h12.2L7.9 2.7l1.4-1.4L16 8z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
