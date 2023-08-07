export function calculateTimeDifference(secondsPassed: number) {
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
