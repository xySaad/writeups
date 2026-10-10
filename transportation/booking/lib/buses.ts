import { env } from "../env.js";

interface BusEntry {
  date: string;
}

interface BusesResponse {
  buses: BusEntry[];
}

export interface UTCTime {
  hour: number;
  minute: number;
}

const POLL_INTERVAL = 2000;
const API_URL = `https://${env.DOMAIN}/api/buses`;

async function fetchBuses(): Promise<BusesResponse> {
  const res = await fetch(API_URL, {
    cache: "no-store",
    credentials: "include",
    headers: { Cookie: `__Secure-elgencia.session_token=${env.TOKEN}` },
  });

  if (!res.ok) throw new Error(`status code: ${res.status}`);
  return res.json();
}

function busMatchesTime(bus: BusEntry, time: UTCTime): boolean {
  const date = new Date(bus.date);
  return (
    date.getUTCHours() === time.hour && date.getUTCMinutes() === time.minute
  );
}

export async function pollBuses(time: UTCTime): Promise<void> {
  await new Promise<void>((resolve) => {
    const intervalId = setInterval(async () => {
      try {
        const { buses } = await fetchBuses();
        if (buses.some((bus) => busMatchesTime(bus, time))) {
          clearInterval(intervalId);
          resolve();
        }
      } catch (err) {
        console.error("Error polling buses:", err);
      }
    }, POLL_INTERVAL);
  });
}
