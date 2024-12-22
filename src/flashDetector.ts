import { fetchFlashLoanTransactions } from "./blockReader.ts";
import { FlashLoanTransaction } from "./types.ts";

export async function detectFlashLoan(
  blockNumber: number,
): Promise<[boolean, FlashLoanTransaction[]]> {
  const transactions = await fetchFlashLoanTransactions(blockNumber);

  return [transactions.length > 0, transactions];
}
