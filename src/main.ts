import { detectFlashLoan } from './flashDetector.ts';

export interface DetectFlashLoanRequest {
  blockNumber: number;
}

export async function handleFlashLoanRequest(
  request: Request,
): Promise<Response> {
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);

  try {
    if (request.method === 'POST') {
      const body = (await request.json()) as DetectFlashLoanRequest;
      console.log(
        `[${
          new Date().toISOString()
        }] Received request for block ${body.blockNumber}`,
      );

      if (!body.blockNumber) {
        return new Response(
          JSON.stringify({ error: 'blockNumber is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      const hasFlashLoan = await detectFlashLoan(body.blockNumber);
      return new Response(
        JSON.stringify({
          blockNumber: body.blockNumber,
          hasFlashLoan,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error);
    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
if (import.meta.main) {
  const server = Deno.serve({ port: 8000 }, handleFlashLoanRequest);
  console.log(`Server running on http://localhost:8000`);
}
