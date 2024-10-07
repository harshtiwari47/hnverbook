export function formatDate(toFormat) {
  const date = new Date(toFormat);

  const options = {
    weekday: 'short', // Sat
    year: 'numeric',  // 2024
    month: 'short',   // Oct
    day: 'numeric'    // 5
  };

  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = date.toLocaleDateString(undefined, options); // Using system's default locale

  return `${time} ${formattedDate}`;
}