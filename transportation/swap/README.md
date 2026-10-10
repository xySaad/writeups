# Transport Swap Candidates Searcher

This script automates the process of finding potential ticket swap candidates for your booked bus seats on the transport portal (`transport.<redacted>.ma`).

## How It Works

1. **Fetches Booked Seats**: It connects to the transport API using your session token and retrieves all your current bus seat reservations.
2. **Searches for Candidates**: For each booked seat, it queries the swap candidates endpoint using candidate username.
3. **Displays Results**: candidate's username, full name, and schedule details (departure, destination, time, and type).

## Prerequisites

- Node.js installed on your system.
- Dependencies installed via `npm install`.
- A `.env` file in the project root containing your session token:
  ```env
  TOKEN=your_session_token_here
  ```

## Usage

You can run the script using `npm run start` (which executes `tsx main.ts`).

### Passing the target as an argument:

```bash
npm run start "john doe"
```

or

```bash
npm run start
> Enter target to search for: john doe
```
