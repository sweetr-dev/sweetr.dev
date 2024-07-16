"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Image1 from "@/public/images/hero/1-sweetr-home.png";
import Image2 from "@/public/images/hero/2-sweetr-teams.png";
import Image3 from "@/public/images/hero/3-sweetr-team-people.png";
import Image4 from "@/public/images/hero/4-sweetr-team-prs.png";
import Image5 from "@/public/images/hero/5-sweetr-team-insights.png";
import Image6 from "@/public/images/hero/6-sweetr-team-cycle-time.png";
import Image7 from "@/public/images/hero/7-swetr-team-pr-size-distribution.png";
import Image8 from "@/public/images/hero/8-sweetr-teamc-deo-review-distribution-hover.png";
import Image9 from "@/public/images/hero/9-sweetr-people-directory.png";
import Image10 from "@/public/images/hero/10-sweetr-person-code-reviews.png";
import {
  IconChevronLeft,
  IconChevronRight,
  IconInfoCircle,
  IconPlayerPause,
  IconPlayerPlay,
} from "@tabler/icons-react";

export const HeroVideo = () => {
  const images = [
    Image1,
    Image2,
    Image3,
    Image4,
    Image5,
    Image6,
    Image7,
    Image8,
    Image9,
    Image10,
  ];
  const docs = [
    null,
    { label: "Teams", href: "https://docs.sweetr.dev/features/teams" },
    { label: "Teams", href: "https://docs.sweetr.dev/features/teams" },
    {
      label: "Pull Requests",
      href: "https://docs.sweetr.dev/features/pull-requests",
    },
    {
      label: "Team Insights",
      href: "https://docs.sweetr.dev/features/team/intro",
    },
    {
      label: "Cycle Time",
      href: "https://docs.sweetr.dev/features/team/cycle-time",
    },
    {
      label: "PR Size Distribution",
      href: "https://docs.sweetr.dev/features/team/pr-size-distribution",
    },
    {
      label: "Code Review Distribution",
      href: "https://docs.sweetr.dev/features/team/code-review-distribution",
    },
    { label: "People", href: "https://docs.sweetr.dev/features/people" },
    {
      label: "Code Reviews",
      href: "https://docs.sweetr.dev/features/code-reviews",
    },
  ];
  const [currentImage, setImage] = useState(0);
  const autoPlay = useRef(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay.current);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!autoPlay.current) return;

      setImage((imageIndex) =>
        imageIndex + 1 === images.length ? 0 : imageIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleAutoPlay = () => {
    autoPlay.current = !autoPlay.current;
    setIsAutoPlaying(autoPlay.current);
  };

  const handlePrevious = () => {
    autoPlay.current = false;
    setIsAutoPlaying(false);
    setImage((imageIndex) =>
      imageIndex - 1 < 0 ? images.length - 1 : imageIndex - 1
    );
  };

  const handleNext = () => {
    autoPlay.current = false;
    setIsAutoPlaying(false);
    setImage((imageIndex) =>
      imageIndex + 1 > images.length - 1 ? 0 : imageIndex + 1
    );
  };

  return (
    <>
      <div className="hidden md:flex justify-end gap-1 text-dark-100 mb-1">
        <button onClick={handleAutoPlay}>
          {isAutoPlaying ? (
            <IconPlayerPause stroke={1.5} size={20} />
          ) : (
            <IconPlayerPlay stroke={1.5} size={20} />
          )}
        </button>
        <button onClick={handlePrevious}>
          <IconChevronLeft stroke={1.5} size={20} />
        </button>
        <button onClick={handleNext}>
          <IconChevronRight stroke={1.5} size={20} />
        </button>
      </div>
      <div className="block relative ease-out duration-300">
        {/* hover:scale-105 cursor-pointer */}
        <Image
          // onClick={handleOpen}
          className="rounded-lg border border-dark-400 shadow-[0_0px_30px_-15px_rgba(255,255,255,0.2)] "
          src={images[currentImage]}
          width={1104}
          height={802}
          alt="Hero"
          quality={100}
          priority
        />
        {docs[currentImage] && (
          <a
            href={docs[currentImage]?.href}
            target="_blank"
            className="absolute flex gap-2 bg-dark-900 border border-dark-400 text-zinc-400 rounded right-0 bottom-0 mr-4 mb-4 items-center p-1 px-2 hover:opacity-100 opacity-70 hover:scale-105 transition"
          >
            <IconInfoCircle stroke={1.5} size={16} />
            {docs[currentImage].label}
          </a>
        )}

        {/* <div
          className="flex absolute h-20 w-20 top-0 left-[50%] ml-[-40px] mt-[25%] justify-center text-3xl items-center rounded-full 
              bg-green-400 text-green-900 border border-green-500 uppercase font-bold shadow-[0px_0px_105px_35px_rgba(74,222,128,0.3)] animate-heartbeat"
        >
          <IconPlayerPlayFilled stroke={1} size={32} />
        </div> */}
      </div>

      {/* <Dialog
        open={isOpen}
        onClose={handleClose}
        className="fixed z-50 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay
            className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="flex items-center justify-center p-4">
            <div
              className="relative rounded shadow-lg"
              onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the modal
            >
              <iframe
                className="w-[80vw] h-[80vh] max-h-[720px] max-w-[1280px] rounded-[10px]"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&loop=1`}
                title="Sweetr.dev Demonstrations"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </Dialog> */}
    </>
  );
};
