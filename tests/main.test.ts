import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FlashLoanDetectionRequest } from './types';

async function detectFlashLoanRequest(
  payload: FlashLoanDetectionRequest,
): Promise<Response> {
  const url = 'http://localhost:8000/detect-flash-loan';
  return await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

describe('Flash Loan Detection API', () => {
  beforeAll((done) => {
    //TODO add server start here
    // server = createServer(app).listen(8000, done);
  });

  afterAll(() => {
    //TODO add server stop
    // server.close();
  });


  it('should return 405 for unsupported HTTP methods', async () => {
    const url = 'http://localhost:8000/detect-flash-loan';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(405);

    const data = await response.json();
    expect(data).toEqual({
      error: 'Method not allowed. Use POST.',
    });
  });

  it('should handle valid request with no flash loans', async () => {
    const payload: FlashLoanDetectionRequest = {
      analysis: true,
      blockNumberRange: ['12345', '12350'],
    };

    const response = await detectFlashLoanRequest(payload);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({
      '12345': [],
      '12346': [],
      '12347': [],
      '12348': [],
      '12349': [],
      '12350': [],
    });
  });

  it('should detect flash loan transactions for a valid block range', async () => {
    const payload: FlashLoanDetectionRequest = {
      analysis: true,
      blockNumberRange: ['16817996', '16817996'],
    };

    const response = await detectFlashLoanRequest(payload);
    expect(response.status).toBe(200);

    const data = await response.json();

    // Check if `hasAttacks` is true for block 16817996
    expect(data['16817996']).toBeDefined();
    const detectedTransactions = data['16817996'];
    expect(detectedTransactions.length).toBeGreaterThan(0);

    detectedTransactions.forEach((transaction) => {
      expect(transaction.hasAttacks).toBe(true);
    });
  });
  it('should handle invalid request', async () => {
    const payload: Partial<FlashLoanDetectionRequest> = {}; // Invalid payload

    const response = await detectFlashLoanRequest(payload as FlashLoanDetectionRequest);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toEqual({
      error: 'blockNumberRange must be a tuple of [startBlock, endBlock]',
    });
  });
});
