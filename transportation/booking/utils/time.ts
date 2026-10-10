export function intoUTC(hour: number, minute: number): { hour: number; minute: number } {
  const now = new Date();
  const localDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    0
  );
  return {
    hour: localDate.getUTCHours(),
    minute: localDate.getUTCMinutes(),
  };
}
