export interface FlashLoanTransaction {
  blockNumber: number;
  txHash: string;
  initiator: string;
  target: string;
  asset: string;
  amount: string;
  premium: string;
  transfers: Transfer[];
}

export interface Transfer {
  from: string;
  to: string;
  value: string;
  token: string;
}
