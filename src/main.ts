import { detectFlashLoan } from './flashDetector.ts';
import { FlashLoanDetectionRequest } from './types.ts';

export async function handleFlashLoanRequest(
  request: Request,
): Promise<Response> {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${request.method} ${request.url}`);

  try {
    if (request.method === 'POST') {
      const body = (await request.json()) as FlashLoanDetectionRequest;

      if (!body.blockNumberRange || body.blockNumberRange.length !== 2) {
        return new Response(
          JSON.stringify({
            error: 'blockNumberRange must be a tuple of [startBlock, endBlock]',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      console.log(
        `[${timestamp}] Received request for block range ${body.blockNumberRange[0]} to ${body.blockNumberRange[1]}`,
      );

      const detectionResult = await detectFlashLoan(body);

      return new Response(JSON.stringify(detectionResult), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error(`[${timestamp}] Error:`, error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

if (import.meta.main) {
  const server = Deno.serve({ port: 8000 }, handleFlashLoanRequest);
  console.log('Server running on http://localhost:8000');
}
