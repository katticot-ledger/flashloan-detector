# Flash Loan Detection Project

## Overview

This is a service to detect flash loan attacks in blockchain transactions by analyzing block data. It provides an API endpoint to check if a given block contains potential flash loan attacks.

## Technical Architecture

### API Design

- Endpoint: `POST /detect-flash-loan`
- Input: Block number
- Output: Detection result (boolean)

### Core Components

1. HTTP Server

   - Input validation

2. Flash Loan Detector
   - Block analysis
   - Transaction pattern matching
   - Attack signature detection

## Development Process

### Setup and Tools

- Deno runtime for TypeScript execution
- Vitest for testing
- ESLint for code quality

## Running the Project

### Development

```bash
deno task dev
```

### Testing

```bash
npx vitest --run
```

### Production

```bash
deno task start
```
