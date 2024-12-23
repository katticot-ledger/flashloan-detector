import { analyzeFlashLoan } from './analyzer.ts';
import { fetchFlashLoanTransactions } from './blockReader.ts';
import {
  type AttackDetection,
  type AttackDetectionResponse,
  type FlashLoanDetectionRequest,
  TransactionStatus,
} from './types.ts';

export async function detectFlashLoan(
  request: FlashLoanDetectionRequest,
): Promise<AttackDetectionResponse> {
  const [startBlock, endBlock] = request.blockNumberRange.map(Number);

  const blockNumbers = Array.from(
    { length: Number(endBlock) - Number(startBlock) + 1 },
    (_, i) => Number(startBlock) + i,
  );

  const detectionResponse: AttackDetectionResponse = {};

  for (const blockNumber of blockNumbers) {
    const flashLoanTransactions = await fetchFlashLoanTransactions(blockNumber);

    const detections = await Promise.all(
      flashLoanTransactions.map(async (transaction) => {
        const analysis = await analyzeFlashLoan(transaction);

        const baseDetection: AttackDetection = {
          transaction: {
            ...transaction,
            transfers: request.analysis ? transaction.transfers : [],
          },
          hasAttacks: analysis.analysis[0].status !== TransactionStatus.Normal,
        };

        if (request.analysis) {
          return {
            ...baseDetection,
            analysis,
          };
        }

        return baseDetection;
      }),
    );

    detectionResponse[blockNumber.toString()] = detections;
  }

  return detectionResponse;
}
