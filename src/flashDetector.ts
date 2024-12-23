import { analyzeFlashLoan } from './analyzer.ts';
import { fetchFlashLoanTransactions } from './blockReader.ts';
import type { FlashLoanTransaction } from './types.ts';

export interface FlashLoanDetectionResponse {
  hasFlashLoan: boolean;
  analyzedTransactions: {
    transaction: FlashLoanTransaction;
    status: string;
    reasons: string[];
  }[];
}

export async function detectFlashLoan(
  blockNumber: number,
): Promise<FlashLoanDetectionResponse> {
  const transactions = await fetchFlashLoanTransactions(blockNumber);

  // Analyze each transaction
  const analyzedTransactions = await Promise.all(
    transactions.map(async (transaction) => {
      const analysis = await analyzeFlashLoan(transaction);
      return {
        transaction,
        ...analysis,
      };
    }),
  );

  const hasFlashLoan = analyzedTransactions.some(
    (tx) => tx.status !== 'Normal',
  );

  return {
    hasFlashLoan,
    analyzedTransactions,
  };
}
