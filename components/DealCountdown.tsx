"use client";

import { useState, useEffect } from "react";
import { Timer } from "lucide-react";

interface DealCountdownProps {
  endsIn: string;
  days: string;
  hours: string;
  mins: string;
  secs: string;
}

const DealCountdown = ({
  endsIn,
  days,
  hours,
  mins,
  secs,
}: DealCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 35,
    seconds: 42,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        }
        if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        if (prev.days > 0) {
          return {
            ...prev,
            days: prev.days - 1,
            hours: 23,
            minutes: 59,
            seconds: 59,
          };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeUnit = ({
    value,
    label,
  }: {
    value: number;
    label: string;
  }) => (
    <div className="flex flex-col items-center rounded-lg border border-[#a3802e]/40 bg-[#1c2329]/70 p-2 shadow-md sm:p-3">
      <span className="text-lg font-bold text-[#fdf6e8] sm:text-2xl md:text-3xl">
        {value.toString().padStart(2, "0")}
      </span>
      <span className="text-xs font-medium text-[#e4c290] sm:text-sm">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex items-center gap-1 text-[#fdf6e8] sm:gap-2">
        <Timer className="h-4 w-4 shrink-0 text-[#e4c290] sm:h-5 sm:w-5" />
        <span className="text-sm font-semibold sm:text-base">{endsIn}</span>
      </div>
      <div className="grid grid-cols-4 gap-1 sm:gap-2">
        <TimeUnit value={timeLeft.days} label={days} />
        <TimeUnit value={timeLeft.hours} label={hours} />
        <TimeUnit value={timeLeft.minutes} label={mins} />
        <TimeUnit value={timeLeft.seconds} label={secs} />
      </div>
    </div>
  );
};

export default DealCountdown;
