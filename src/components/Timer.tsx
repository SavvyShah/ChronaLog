import { useEffect, useRef, useState } from "react";
import { HiPauseCircle, HiPlayCircle } from "react-icons/hi2";
import { calculateTimeDifference } from "../utils/calculateTimeDifference";

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
