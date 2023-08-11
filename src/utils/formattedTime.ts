export function formattedTime(totalSeconds: number) {
  const years = Math.floor(totalSeconds / (3600 * 24 * 365));
  totalSeconds %= 3600 * 24 * 365;
  const months = Math.floor(totalSeconds / (3600 * 24 * 30));
  totalSeconds %= 3600 * 24 * 30;
  const days = Math.floor(totalSeconds / (3600 * 24));
  totalSeconds %= 3600 * 24;
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (years) {
    return `${years}yr ${months}mo`;
  } else if (months) {
    return `${months}mo ${days}day`;
  } else if (days) {
    return `${days}day ${hours}hr`;
  } else if (hours) {
    return `${hours}hr ${minutes}min`;
  } else {
    return `${minutes}min ${seconds}sec`;
  }
}
export function formattedTimeHHMMSS(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedTimeDifference = `${padWithZero(hours)}hr ${padWithZero(
    minutes
  )}min ${padWithZero(seconds)}sec`;

  return formattedTimeDifference;
}

function padWithZero(number: number) {
  // Helper function to pad single-digit numbers with a leading zero
  return number.toString().padStart(2, "0");
}
