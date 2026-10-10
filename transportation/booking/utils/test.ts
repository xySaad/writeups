import puppeteer from "puppeteer";

export async function testChromiumBinary(chormiumBinary: string): Promise<void> {
  console.log(`Testing Chromium binary at: ${chormiumBinary}`);
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chormiumBinary,
    args: ["--no-sandbox"],
  });
  console.log("Chromium binary is valid and usable!");
  await browser.close();
}
