export interface FlashLoanTransaction {
  blockNumber: number;
  txHash: string;
  initiator: string;
  target: string;
  asset: string;
  amount: string;
  premium: string;
}
