"use client";

import { useState } from "react";
import Image from "next/image";
import HeroImage from "@/public/images/home.png";
import { IconPlayerPlayFilled } from "@tabler/icons-react";
import { Dialog } from "@headlessui/react";

export const HeroVideo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const videoId = "IMxDeACOWCE";
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <div className="block relative ease-out duration-300 hover:scale-105 cursor-pointer">
        <Image
          onClick={handleOpen}
          className="rounded-lg border border-dark-400 shadow-[0_0px_30px_-15px_rgba(255,255,255,0.2)] "
          src={HeroImage}
          width={1104}
          height={802}
          alt="Hero"
          quality={100}
          priority
        />
        <div
          className="flex absolute h-20 w-20 top-0 left-[50%] ml-[-40px] mt-[25%] justify-center text-3xl items-center rounded-full 
              bg-green-400 text-green-900 border border-green-500 uppercase font-bold shadow-[0px_0px_105px_35px_rgba(74,222,128,0.3)] animate-heartbeat"
        >
          <IconPlayerPlayFilled stroke={1} size={32} />
        </div>
      </div>

      <Dialog
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
      </Dialog>
    </>
  );
};
