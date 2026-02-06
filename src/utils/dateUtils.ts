/**
 * Returns a formatted string representing the time relative to now.
 * Logic:
 * - If < 1 hour: "posted X minutes ago"
 * - If < 24 hours: "posted X hours ago"
 * - If >= 24 hours: "DD/MM/YY"
 */
export const getRelativeTime = (dateInput: string | Date | number): string => {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Future dates or invalid dates handling (fallback)
  if (isNaN(date.getTime()) || diffInSeconds < 0) {
    return "just now";
  }

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours < 1) {
    if (minutes === 0) return "just now";
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  }

  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }

  // Format as DD/MM/YY
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);

  return `${day}/${month}/${year}`;
};
