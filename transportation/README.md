# Broken Anti-Automation - Booking

The platform uses reCaptcha to supposedly prevent automation and create some sort of fairness when booking places.

## The Flaw

The current website uses Google reCAPTCHA v2 which is easily defeated by modern AI transcription models.

## Solutions

Note: While the solutions below makes automation harder to implement and more ressource consuming but there's no anti-automation defense that is entirely bulletproof.

### WAF

Puppeteer leaves behind distinct "fingerprints" even when running in `headless: false` mode (e.g., specific `navigator.webdriver` flags, missing plugins, unmasked hardware concurrency).

- Implement a Web Application Firewall (WAF) with robust bot management, such as **Cloudflare Bot Management** or **DataDome**. These services specialize in detecting automated browsers like Puppeteer/Selenium and will block the connection before it even reaches your servers.

### Upgrade The Captcha

The current script successfully bypasses the CAPTCHA by utilizing the audio challenge fallback and feeding it to a local machine learning model (`Xenova/whisper-tiny`).

- **reCAPTCHA v3 / Enterprise:** Works completely in the background by analyzing user behavior (mouse movements, browser fingerprints) and returns a score. Since this script launches an automated Puppeteer instance with no human-like mouse movements before clicking, v3 would assign it a very low score and block the action.
- **Cloudflare Turnstile:** A privacy-first alternative that performs complex browser checks (proof-of-work) without relying on interactive challenges that can be bypassed by AI.

# IDOR - Candidate Reservations

The platform's seat swap feature exposes sensitive reservation details of other users through an Insecure Direct Object Reference (IDOR) vulnerability.

## The Flaw

The swap candidates endpoint (`/api/buses/reservations/swap/candidates`) allows any authenticated user with a valid booked seat (`seatId`) to query for other users' reservations using a search string (`query`). The API response leaks sensitive information about the target users, including:

- Username and Full Name
- Bus schedule details (Departure, Destination, Time, and Type)

This allows an attacker to enumerate and extract the travel plans and personal information of any user on the platform.

## Solutions

To prevent this data leak, the following measures should be implemented:

### Secure Swap Mechanisms

- **Use Unique Swap Codes:** Instead of making user reservations searchable by username, users who wish to swap should be able to generate a temporary, unique "swap code" for their reservation. They can share this code privately with their swap partner. The other user can then input this code to initiate the swap, eliminating the need for a searchable directory and preventing data enumeration entirely.

- **Implement Privacy Controls:** Allow users to opt-in or opt-out of being searchable for seat swaps.

- **Swap by Bus Schedule:** Drop the username search entirely. Allow users to add their seats to an anonymous swap pool and let others search for swaps based solely on bus times and destinations.
