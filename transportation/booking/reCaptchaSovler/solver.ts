import { convertMp3BufferToWav, waveBufferToF64 } from "./audio.js";
import {
  pipeline,
  type AutomaticSpeechRecognitionOutput,
} from "@xenova/transformers";
import type { Page, Frame, HTTPResponse } from "puppeteer";
import { Signal } from "../utils/signal.js";

export type FlowStep =
  | { kind: "click"; selector: string }
  | { kind: "captcha" };

const transcriber = await pipeline(
  "automatic-speech-recognition",
  "Xenova/whisper-tiny",
);

export class CaptchaSolver {
  readonly #page: Page;
  #answer: Signal<string>;

  constructor(page: Page) {
    this.#page = page;
    this.#answer = new Signal<string>();

    page.on("response", async (response: HTTPResponse) => {
      try {
        if (
          response.url().includes("payload") &&
          response.request().resourceType() === "media"
        ) {
          const buffer = await response.buffer();
          console.log("Got media response bytes:", buffer.length);
          const audioData = waveBufferToF64(
            await convertMp3BufferToWav(buffer),
          );
          const raw = await transcriber(audioData);
          const result: AutomaticSpeechRecognitionOutput = Array.isArray(raw)
            ? raw[0]
            : raw;
          console.log("result:", result.text);
          this.#answer.resolve(result.text);
        }
      } catch (err) {
        console.error("Error handling response:", err);
      }
    });
  }

  async execFlow(flow: FlowStep[]): Promise<void> {
    for (const step of flow) {
      if (step.kind === "captcha") {
        await this.solveCaptcha();
      } else {
        await this.#page.locator(step.selector).click();
      }
    }
  }

  async solveCaptcha(): Promise<void> {
    const iframe = await this.#page.waitForSelector(
      'iframe[title="reCAPTCHA"]',
    );
    if (iframe === null) throw new Error("reCAPTCHA iframe not found");

    const frame = await iframe.contentFrame();
    if (frame === null) throw new Error("Could not access reCAPTCHA frame");

    await frame.waitForSelector("#rc-anchor-container");
    await frame.locator("#rc-anchor-container").click();

    frame.waitForSelector(".recaptcha-checkbox-checked").then(() => {
      console.log("captcha solved!");
      this.#answer.reject();
    });

    const challengeIframe = await this.#page.waitForSelector(
      'iframe[title="recaptcha challenge expires in two minutes"]',
    );
    if (challengeIframe === null) throw new Error("Challenge iframe not found");

    const challengeFrame = await challengeIframe.contentFrame();
    if (challengeFrame === null)
      throw new Error("Could not access challenge frame");

    challengeFrame.waitForSelector(".audio-button-holder").then(async () => {
      await challengeFrame.locator(".audio-button-holder").click();
    });

    while (true) {
      try {
        const text = await this.#answer.promise;
        this.#answer.reset();
        if (text.trim().length === 0) {
          await challengeFrame.click("#recaptcha-reload-button", {
            delay: 4.2,
          });
          continue;
        }
        await challengeFrame.type("#audio-response", text, { delay: 20 });
        await challengeFrame.click("#recaptcha-verify-button", { delay: 10 });
      } catch {
        break;
      }
    }
  }
}
