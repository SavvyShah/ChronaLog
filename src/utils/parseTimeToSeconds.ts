/**
 *
 * @param timeString In HH:MM:SS format
 * @returns
 */
export function parseTimeToSeconds(timeString: string) {
  try {
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    // Check if the timeString includes "hr", "min", "sec" to determine the format
    // Check for the various formats
    if (
      timeString.includes("hr") &&
      timeString.includes("min") &&
      timeString.includes("sec")
    ) {
      const parts = timeString.split(/[^\d]+/);
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
      seconds = parseInt(parts[2], 10);
    } else if (timeString.includes("hr") && timeString.includes("min")) {
      const parts = timeString.split(/[^\d]+/);
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
    } else if (timeString.includes("min") && timeString.includes("sec")) {
      const parts = timeString.split(/[^\d]+/);
      minutes = parseInt(parts[0], 10);
      seconds = parseInt(parts[1], 10);
    } else if (timeString.includes("hr") && timeString.includes("sec")) {
      const parts = timeString.split(/[^\d]+/);
      hours = parseInt(parts[0], 10);
      seconds = parseInt(parts[1], 10);
    } else {
      const parts = timeString.split(":");
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
      seconds = parts.length === 3 ? parseInt(parts[2], 10) : 0;
    }

    return hours * 3600 + minutes * 60 + seconds;
  } catch {
    return 0;
  }
}
