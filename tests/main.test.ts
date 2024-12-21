import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Helper function for making HTTP requests
async function detectFlashLoanRequest(
  blockNumber: number | null,
): Promise<Response> {
  const url = "http://localhost:8000/detect-flash-loan";
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(blockNumber ? { blockNumber } : {}),
  });
}

describe("Flash Loan Detection API", () => {
  // let server: any;

  beforeAll((done) => {
    // server = createServer(app).listen(8000, done);
  });

  afterAll(() => {
    // server.close();
  });

  it("should handle valid request", async () => {
    const response = await detectFlashLoanRequest(12345);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({
      blockNumber: 12345,
      hasFlashLoan: true,
    });
  });

  it("should handle invalid request", async () => {
    const response = await detectFlashLoanRequest(null);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toEqual({
      error: "blockNumber is required",
    });
  });
});
