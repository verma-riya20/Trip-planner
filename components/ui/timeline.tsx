"use client";

import { TripInfo } from "@/app/_components/ChatBox";
import { Calendar, Users, Wallet } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({
  data,
  tripData,
}: {
  data: TimelineEntry[];
  tripData: TripInfo;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.getBoundingClientRect().height);
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full bg-white dark:bg-neutral-950 font-sans md:px-10"
      ref={containerRef}
    >
      {/* HEADER */}
      <div className="max-w-7xl mx-auto py-10 px-4 md:px-8 lg:px-10">
        <h2 className="text-2xl md:text-4xl mb-4 text-black dark:text-white max-w-4xl leading-snug">
          Your Trip Itinerary from
          <strong className="text-primary"> {tripData?.origin} </strong>to
          <strong className="text-primary"> {tripData?.destination}</strong> is
          Ready
        </h2>

        <div className="flex gap-6 items-center text-neutral-600 dark:text-neutral-300">
          <div className="flex gap-2 items-center">
            <Calendar />
            <h2>{tripData?.duration}</h2>
          </div>

          <div className="flex gap-2 items-center">
            <Wallet />
            <h2>{tripData?.budget}</h2>
          </div>

          <div className="flex gap-2 items-center">
            <Users />
            <h2>{tripData?.group_size}</h2>
          </div>
        </div>
      </div>

      {/* TIMELINE */}
      <div ref={ref} className="relative max-w-7xl mx-auto pb-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-32 md:gap-10"
          >
            {/* LEFT TITLE + DOT */}
          <div className="sticky top-40 flex flex-col md:flex-row 
  z-0 items-center self-start w-0 md:w-72 pointer-events-none">


              <div className="h-8 w-8 absolute left-2 md:left-3 rounded-full pointer-events-none bg-white dark:bg-black flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-neutral-300 dark:bg-neutral-700 border" />
              </div>

              <h3 className="hidden md:block text-4xl font-bold text-neutral-500 dark:text-neutral-500 md:pl-16">
                {item.title}
              </h3>
            </div>

            {/* RIGHT CONTENT */}
            <div className="relative flex-1 min-w-0 pl-12 md:pl-4 pr-4 w-full ">
              <h3 className="md:hidden block text-2xl mb-4 font-bold text-neutral-500 dark:text-neutral-400">
                {item.title}
              </h3>

              <div className="w-full max-w-full overflow-hidden">
                {item.content}
              </div>
            </div>
          </div>
        ))}

        {/* TIMELINE LINE */}
        <div
          style={{ height: height + "px" }}
          className="absolute left-6 md:left-8 top-0 w-[2px] overflow-hidden"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute top-0 w-full bg-gradient-to-b from-purple-500 via-blue-500 to-transparent rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
