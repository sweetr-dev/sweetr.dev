"use client";

import { useEffect, useState } from "react";
import classes from "./hero-type-animation.module.css";

export default function HeroTypeAnimation() {
  const toRotate = ["productivity", "experience", "satisfaction"];

  const [text, setText] = useState(toRotate[0]); // Start with the full first word
  const [isDeleting, setIsDeleting] = useState(true); // Start by deleting
  const [loopNum, setLoopNum] = useState(0);
  const [index, setIndex] = useState(toRotate[0].length); // Start with the full length of the first word
  const [typingSpeed, setTypingSpeed] = useState(120);

  useEffect(() => {
    const current = loopNum % toRotate.length;
    const fullText = toRotate[current];

    const handleTyping = () => {
      if (isDeleting) {
        setText((prev) => prev.substring(0, index - 1));
        setIndex(index - 1);
        setTypingSpeed(60);
      } else {
        setText((prev) => prev + fullText.charAt(index));
        setIndex(index + 1);
        setTypingSpeed(120);
      }

      if (!isDeleting && index === fullText.length) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && index === 0) {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setIndex(0);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, index, loopNum, toRotate]);

  return (
    <em
      className={`italic flex relative justify-center items-center text-green-400`}
    >
      continuous improvement
      {/* <div className=" min-w-[230px] text-left ml-2 flex items-center">
        {text}
        <span className={classes.cursor}>&nbsp;</span>
      </div> */}
    </em>
  );
}
