import { useEffect, useRef, useState } from "react";
import { HiPauseCircle, HiPlayCircle } from "react-icons/hi2";

export const Timer = () => {
  const [count, setCount] = useState(0);
  const [active, setIsActive] = useState<boolean>(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setCount((c) => c + 1);
      }, 1000);
    }
    if (!active) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [active, count]);

  return (
    <div>
      <div>{calculateTimeDifference(count)}</div>
      <div>
        {active ? (
          <HiPauseCircle onClick={() => setIsActive(false)} />
        ) : (
          <HiPlayCircle onClick={() => setIsActive(true)} />
        )}
      </div>
    </div>
  );
};
function calculateTimeDifference(secondsPassed: number) {
  // Convert seconds to hours, minutes, and seconds
  const hours = Math.floor(secondsPassed / 3600);
  secondsPassed %= 3600;
  const minutes = Math.floor(secondsPassed / 60);
  const seconds = secondsPassed % 60;

  // Format the result as "HHhr MMmin SSs"
  const formattedTimeDifference = `${padWithZero(hours)}: ${padWithZero(
    minutes
  )}: ${padWithZero(seconds)}`;

  return formattedTimeDifference;
}

function padWithZero(number: number) {
  // Helper function to pad single-digit numbers with a leading zero
  return number.toString().padStart(2, "0");
}
