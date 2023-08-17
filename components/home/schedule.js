import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { convertUnixToTime } from "../../utils/getTimes";
import { PlayIcon } from "@heroicons/react/20/solid";
import { BackwardIcon, ForwardIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export default function Schedule({ data, scheduleData, time }) {
  let now = new Date();
  let currentDay =
    now.toLocaleString("default", { weekday: "long" }).toLowerCase() +
    "Schedule";
  currentDay = currentDay.replace("Schedule", "");

  const [currentPage, setCurrentPage] = useState(0);
  const [days, setDay] = useState();

  useEffect(() => {
    if (scheduleData) {
      const days = Object.keys(scheduleData);
      setDay(days);
    }
  }, [scheduleData]);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => (prevPage + 1) % days.length);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => (prevPage - 1 + days.length) % days.length);
  };

  useEffect(() => {
    const todayIndex = days?.findIndex((day) =>
      day.toLowerCase().includes(currentDay)
    );
    setCurrentPage(todayIndex >= 0 ? todayIndex : 0);
  }, [currentDay, days]);

  // console.log({ scheduleData });

  return (
    <div className="flex flex-col gap-5 px-4 lg:px-0">
      <div className="rounded mb-5 shadow-md shadow-black">
        <div className="overflow-hidden w-full h-[96px] lg:h-[10rem] rounded relative">
          <div className="absolute flex flex-col justify-center pl-5 lg:pl-16 rounded z-20 bg-gradient-to-r from-30% from-[#0c0c0c] to-transparent w-full h-full">
            <h1 className="text-xs lg:text-lg">Coming Soon...</h1>
            <div className="w-1/2 lg:w-2/5 hidden lg:block font-medium font-karla leading-[2.9rem] text-white line-clamp-1">
              <Link
                href={`/en/anime/${data.id}`}
                className="hover:underline underline-offset-4 decoration-2 lg:text-[1.7vw] "
              >
                {data.title.romaji || data.title.english || data.title.native}
              </Link>
            </div>
            <h1 className="w-1/2 lg:hidden font-medium font-karla leading-9 text-white line-clamp-1">
              {data.title.romaji || data.title.english || data.title.native}
            </h1>
          </div>
          {data.bannerImage ? (
            <Image
              src={data.bannerImage || data.coverImage.large}
              width={500}
              height={500}
              alt="banner next anime"
              className="absolute z-10 top-0 right-0 w-3/4 h-full object-cover brightness-[30%]"
            />
          ) : (
            <Image
              src={data.coverImage.large}
              width={500}
              height={500}
              sizes="100vw"
              alt="banner next anime"
              className="absolute z-10 top-0 right-0 h-full object-contain object-right brightness-[90%]"
            />
          )}
          <div
            className={`absolute flex justify-end items-center pr-5 gap-5 md:gap-10 z-20 w-1/2 h-full right-0 ${
              data.bannerImage ? "md:pr-16" : "md:pr-48"
            }`}
          >
            {/* Countdown Timer */}
            <div className="flex items-center gap-2 md:gap-5 font-bold font-karla text-sm md:text-xl">
              {/* Countdown Timer */}
              <div className="flex flex-col items-center">
                <span className="text-action/80">{time.days}</span>
                <span className="text-sm lg:text-base font-medium">Days</span>
              </div>
              <span></span>
              <div className="flex flex-col items-center">
                <span className="text-action/80">{time.hours}</span>
                <span className="text-sm lg:text-base font-medium">Hours</span>
              </div>
              <span></span>
              <div className="flex flex-col items-center">
                <span className="text-action/80">{time.minutes}</span>
                <span className="text-sm lg:text-base font-medium">Mins</span>
              </div>
              <span></span>
              <div className="flex flex-col items-center">
                <span className="text-action/80">{time.seconds}</span>
                <span className="text-sm lg:text-base font-medium">Secs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
