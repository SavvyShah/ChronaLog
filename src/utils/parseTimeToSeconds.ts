/**
 *
 * @param timeString In HH:MM:SS format
 * @returns
 */
export function parseTimeToSeconds(timeString: string) {
  try {
    const parts = timeString.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parts.length === 3 ? parseInt(parts[2], 10) : 0;
    return hours * 3600 + minutes * 60 + seconds;
  } catch {
    return 0;
  }
}
