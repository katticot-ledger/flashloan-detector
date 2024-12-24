# Flash Loan Detection Service

## Overview

This project provides a service to detect flash loan attacks by analyzing blockchain transactions within a specified block range. Flash loans are commonly used in decentralized finance (DeFi) attacks, and this service helps identify suspicious patterns indicative of such activities.

---

## Features

- Analyze blocks for potential flash loan activity.
- Detect suspicious transaction patterns and anomalies.

---


## API Design

### Endpoint: `POST /detect-flash-loan`

- **Input**:
  - JSON payload with the following structure:
    ```json
    {
      "analysis": true,
      "blockNumberRange": ["startBlock", "endBlock"]
    }
    ```
    - `blockNumberRange`: A tuple specifying the range of blocks to analyze (`startBlock`, `endBlock`).
    - `analysis`: Boolean indicating whether to include detailed analysis.

- **Output**:
  - JSON response with detected flash loan activities:
    ```json
    {
      "blockNumber": {
        "transactions": [
          {
            "hasAttacks": true,
            "transaction": {
              "blockNumber": "16817996",
              "transactionHash": "0x123...",
              "initiator": "0xabc...",
              "asset": "0xdef...",
              "amount": "1000000",
              "premium": "5000",
              "transfers": [...],
            },
            "analysis": {
              "status": "Critical",
              "reasons": ["Large flash loan detected", "Multiple high-value transfers"],
            }
          }
        ]
      }
    }
    ```

---

## Development

### Prerequisites

- [Deno](https://deno.land)
- Node.js (for Vitest if testing with `npx`).
- Ensure the `.env` file is configured with your blockchain provider endpoint:
  ```
  endpoint=<YOUR_BLOCKCHAIN_PROVIDER_ENDPOINT>
  FLASH_LOAN_PROVIDER=<FLASH_LOAN_PROVIDER ADDRESS>
  ```
---

## Usage

### Development Mode

To run the server in development mode:

```bash
deno task dev
```
- The server will start at `http://localhost:8000`.

### Testing

To run unit tests:

```bash
npx vitest --run
```

---

## Example API Request

**POST** `/detect-flash-loan`

Request Body:
```json
{
  "analysis": true,
  "blockNumberRange": ["16817996", "16817999"]
}
```

Response:
```json
{
  "16817996": [
    {
      "hasAttacks": true,
      "transaction": {
        "blockNumber": "16817996",
        "transactionHash": "0x123...",
        "initiator": "0xabc...",
        "asset": "0xdef...",
        "amount": "1000000",
        "premium": "5000",
        "transfers": [
          {
            "from": "0xabc...",
            "to": "0xdef...",
            "value": "1000000",
            "token": "0xghi..."
          }
        ]
      },
      "analysis": {
        "status": "Critical",
        "reasons": ["Large flash loan detected"]
      }
    }
  ]
}
```

---
