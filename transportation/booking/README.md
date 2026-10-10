# Transport Booking Automation

## Overview

This project is an automated bus booking tool for `transport.<redacted>.ma`. It schedules background tasks to constantly poll for bus availability at user-specified times. Once the target bus becomes available, the program automatically launches a browser using Puppeteer, authenticates using a session token, and completes the booking process. To ensure uninterrupted booking, it includes an integrated auto-solver for reCAPTCHA that listens to audio challenges and solves them locally using the `Xenova/whisper-tiny` machine learning model.

## Requirements

- **Node.js**: (Version 18+ recommended)
- **Chromium / Google Chrome**: A local installation of the Chromium or Chrome browser is required for Puppeteer to navigate the site.

## Installation

1. Clone the repository and navigate into the `booking` directory.
2. Install the necessary dependencies by running:
   ```bash
   npm install
   ```
3. Set up your environment variables by copying `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and insert your session token. This token can be found in your browser cookies under the name `__Secure-elgencia.session_token`:
   ```env
   TOKEN=your_session_token_here
   ```
4. Configure your booking preferences in `config.json`:
   - `chormiumBinary`: The absolute path to your local Chromium or Chrome executable (e.g., `/usr/bin/chromium-browser`).
   - `slots`: A list of scheduled bookings you want to make. Each object should include:
     - `run_at`: The exact time of day to start the polling process (format: `HH:MM:SS`).
     - `traject`: The departure time of the bus you wish to book (format: `HH:MM`).
     - `destination`: The destination of the bus.
   - `test_slot`: (Optional) A specific bus time (format: `HH:MM`) to immediately test the bot when the program starts.

## Usage

Start the automation script by running:

```bash
npm start
```

**How it works during runtime:**

1. **Binary Check**: It first tests the configured Chromium binary to ensure the browser can be launched properly.
2. **Test Run**: If a `test_slot` is defined in `config.json`, the program will immediately attempt to book that slot.
3. **Cron Scheduling**: The program schedules the remaining `slots` to trigger automatically at their respective `run_at` times.
4. **Execution**: When a scheduled time arrives, the script rapidly polls the `/api/buses` endpoint. As soon as the target bus time (`traject`) appears in the API response, it opens the browser, completes the booking, defeats any reCAPTCHAs via the audio challenge solver, and waits for a booking confirmation before closing.
