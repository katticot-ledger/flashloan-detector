import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Helper function for making HTTP requests
async function detectFlashLoanRequest(
  blockNumber: number | null,
): Promise<Response> {
  const url = 'http://localhost:8000/detect-flash-loan';
  return await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(blockNumber ? { blockNumber } : {}),
  });
}

// flashloan on block 16818057
const flashloanTransaction = [
  {
    blockNumber: 16818057,
    txHash:
      '0x71a908be0bef6174bccc3d493becdfd28395d78898e355d451cb52f7bac38617',
    initiator: '0x036cec1a199234fC02f72d29e596a09440825f1C',
    target: '0x036cec1a199234fC02f72d29e596a09440825f1C',
    asset: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    amount: '300000000000',
    premium: '270000000',
  },
];

describe('Flash Loan Detection API', () => {
  // let server: any;

  beforeAll((done) => {
    // server = createServer(app).listen(8000, done);
  });

  afterAll(() => {
    // server.close();
  });

  it('should handle valid request', async () => {
    const response = await detectFlashLoanRequest(12345);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({
      blockNumber: 12345,
      hasFlashLoan: [false, []],
    });
  });

  it('should detect flashloan transactions valid request', async () => {
    const response = await detectFlashLoanRequest(16818057);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({
      blockNumber: 16818057,
      hasFlashLoan: [true, flashloanTransaction],
    });
  });

  it('should handle invalid request', async () => {
    const response = await detectFlashLoanRequest(null);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toEqual({
      error: 'blockNumber is required',
    });
  });
});
