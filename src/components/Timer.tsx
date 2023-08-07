import { useEffect, useRef, useState } from "react";
import { calculateTimeDifference } from "../utils/calculateTimeDifference";

interface Props {
  active: boolean;
}

export const Timer = ({ active }: Props) => {
  const [count, setCount] = useState(0);
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

  return calculateTimeDifference(count);
};
