import readline from "node:readline/promises";
import { env } from "./env.js";
import type { ReservationsResp, SwapQuery } from "./types.js";

const URL = `https://${env.DOMAIN}/api/buses/reservations/swap/candidates`;

const getSeats = async () => {
  const resp = await fetch(`https://${env.DOMAIN}/api/buses/reservations`, {
    headers: { Cookie: `__Secure-elgencia.session_token=${env.TOKEN}` },
  });

  const json: ReservationsResp = await resp.json();
  return json.res;
};

const main = async () => {
  let target = process.argv.slice(2).join(" ");
  if (!target) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    target = await rl.question("Enter target to search for: ");
    rl.close();
  }

  //TODO: if no seats where already booked, book new one using `../booking`
  const seats = await getSeats();
  for (const seat of seats) {
    const resp = await fetch(`${URL}/?seatId=${seat.id}&query=${target}`, {
      headers: { Cookie: `__Secure-elgencia.session_token=${env.TOKEN}` },
    });

    const json: SwapQuery = await resp.json();
    const output = json.candidates.map((candidate) => {
      const schedule = candidate.bus.schedule;
      return {
        username: candidate.username,
        fullName: candidate.fullName,
        departure: schedule.departure,
        destination: schedule.destination,
        time: schedule.time,
        type: schedule.type,
      };
    });

    console.log(JSON.stringify(output, null, 2));
  }
};

main().catch(console.error);
