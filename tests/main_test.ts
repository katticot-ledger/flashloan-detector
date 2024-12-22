import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { handleFlashLoanRequest } from "../src/main.ts";

async function detectFlashLoanRequest(
  blockNumber: number | null,
): Promise<Response> {
  const url = "http://localhost:8001/detect-flash-loan";
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(blockNumber ? { blockNumber } : {}),
  });
}

Deno.test("Flash Loan Detection API", async (t) => {
  const controller = new AbortController();
  const server = Deno.serve(
    { port: 8001, signal: controller.signal },
    handleFlashLoanRequest,
  );

  try {
    await t.step("should handle valid request", async () => {
      const response = await detectFlashLoanRequest(12345);
      assertEquals(response.status, 200);

      const data = await response.json();
      assertEquals(data, {
        blockNumber: 12345,
        hasFlashLoan: true,
      });
    });

    await t.step("should handle invalid request", async () => {
      const response = await detectFlashLoanRequest(null);
      assertEquals(response.status, 400);

      const data = await response.json();
      assertEquals(data, {
        error: "blockNumber is required",
      });
    });
  } finally {
    controller.abort();
  }
});
