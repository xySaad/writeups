import puppeteer from "puppeteer";
import type { Page } from "puppeteer";
import config from "../config.json" with { type: "json" };
import { env } from "../env.js";
import { CaptchaSolver } from "../reCaptchaSovler/solver.js";
import type { FlowStep } from "../reCaptchaSovler/solver.js";
import { Signal } from "../utils/signal.js";
import { intoUTC } from "../utils/time.js";
import { pollBuses } from "./buses.js";

const BASE_URL = `https://${env.DOMAIN}`;

function bookingFlow(time: string): FlowStep[] {
  return [
    {
      kind: "click",
      selector: `::-p-xpath(//td[text() = '${time}']/following-sibling::*[3])`,
    },
    { kind: "captcha" },
    { kind: "click", selector: `::-p-xpath(//button[text() = 'Confirm'])` },
  ];
}

async function bookSeat(page: Page, time: string): Promise<void> {
  await page.goto(BASE_URL);
  const solver = new CaptchaSolver(page);
  await solver.execFlow(bookingFlow(time));
}

async function waitForBookingConfirmation(page: Page): Promise<void> {
  const done = new Signal();
  page.on("response", (res) => res.url().includes("booking") && done.resolve());
  await done.promise;
}

export async function runTask(traject: string): Promise<void> {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox"],
    executablePath: config.chormiumBinary,
  });

  await browser.setCookie({
    domain: env.DOMAIN,
    name: "__Secure-elgencia.session_token",
    value: env.TOKEN,
    path: "/",
    secure: true,
    httpOnly: true,
  });

  const page = await browser.newPage();
  const [hour, minute] = traject.split(":");

  console.log(`Starting polling for ${traject} bus...`);
  await pollBuses(intoUTC(Number(hour), Number(minute)));
  await bookSeat(page, `${hour}:${minute}`);
  await waitForBookingConfirmation(page);
  await browser.close();
}
