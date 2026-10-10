import cron from "node-cron";
import config from "./config.json" with { type: "json" };
import { testChromiumBinary } from "./utils/test.js";
import { runTask } from "./lib/task.js";

interface Slot {
  run_at: string;
  traject: string;
}

function scheduleSlots(slots: Slot[]): void {
  for (const { run_at, traject } of slots) {
    const [hour, minute, seconds] = run_at.split(":");
    cron.schedule(`${seconds} ${minute} ${hour} * * *`, () => runTask(traject));
  }
}

async function main(): Promise<void> {
  await testChromiumBinary(config.chormiumBinary);
  if (config.test_slot) await runTask(config.test_slot);
  scheduleSlots(config.slots);
}

await main();
