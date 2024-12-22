# Flash Loan Attack Detector

This document details my thought process, decisions, and steps taken while building the Flash Loan Attack Detector.

## Understanding the Problem

As DeFi becomes more widely used, some bad actors attempt to test the resilience of the infrastructure, often with the intent of profiting from its vulnerabilities.

The Flash Loan Detector focuses on one of these attack types and learns from it to detect similar attacks.

### Objectives

- Build an API endpoint to detect similar hacks in a given block.
- The output will provide the following information:
  - **YES/NO**: About the presence of an attack.
  - **Attacker Address**: Identifies the address of the attacker.
  - **Victim Address**: Identifies the address of the victim.
  - **Amount Lost**: The total value lost in the attack.

## Design Decisions

- API Endpoint: `POST /detect-flash-loan`
  - Input: Block number
  - Output: List of suspicious transactions
- Tools:
  - Ethers.js
  - QuickNode
  - Deno
  - Vitest
  - SQLite Optional

## Workflow

### 1

- Set up the project with TypeScript and dependencies.
- Explored Euler Finance attack patterns.
- Created a basic API to handle POST requests with block numbers.
### 2
- Implemented logic to fetch transactions from a given block.
- Decoded transaction logs to identify flash loans.
