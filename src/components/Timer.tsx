import { useEffect, useState } from "react";

interface Props {
  start: Date;
}

export const Timer = ({ start }: Props) => {
  const [timeDifference, setTimeDifference] = useState<string>(
    calculateTimeDifference(start)
  );

  useEffect(() => {
    setInterval(() => {
      setTimeDifference(calculateTimeDifference(start));
    }, 1000);
  }, [start]);

  return <div>{timeDifference}</div>;
};
function calculateTimeDifference(start: Date) {
  const now = new Date();

  // Calculate the time difference in milliseconds
  let timeDifference = now.getTime() - start.getTime();

  // Convert the time difference to hours, minutes, and seconds
  const hours = Math.floor(timeDifference / (1000 * 60 * 60));
  timeDifference -= hours * (1000 * 60 * 60);
  const minutes = Math.floor(timeDifference / (1000 * 60));
  timeDifference -= minutes * (1000 * 60);
  const seconds = Math.floor(timeDifference / 1000);

  // Format the result as HH:MM:SS
  const formattedTimeDifference = `${padWithZero(hours)}:${padWithZero(
    minutes
  )}:${padWithZero(seconds)}`;

  return formattedTimeDifference;
}

function padWithZero(number: number) {
  // Helper function to pad single-digit numbers with a leading zero
  return number.toString().padStart(2, "0");
}
