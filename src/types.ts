export enum TransactionStatus {
  Normal = 'Normal',
  Suspicious = 'Suspicious',
  VerySuspicious = 'Very Suspicious',
  Critical = 'Critical',
}

export enum SuspiciousPattern {
  LargeFlashLoan = 'Large flash loan amount detected',
  HighTransferCount = 'High number of transfers detected',
  MultipleLargeTransfers = 'Multiple large value transfers detected',
  MultipleMints = 'Multiple minting operations detected',
  MultipleBurns = 'Multiple burning operations detected',
}

export interface FlashLoanTransaction {
  blockNumber: number;
  txHash: string;
  initiator: string;
  target: string;
  asset: string;
  amount: string;
  premium: string;
  currency: string;
  transfers?: Transfer[];
}

export interface Transfer {
  from: string;
  to: string;
  value: string;
  token: string;
}

export interface TransactionAnalysis {
  transactionHash: string;
  blockNumber: number;
  analysis: {
    status: TransactionStatus;
    reasons: string[];
  }[];
}

export interface AttackDetection {
  hasAttacks: boolean;
  transaction: FlashLoanTransaction;
  analysis?: TransactionAnalysis;
}

export interface AttackDetectionResponse {
  [blockNumber: string]: AttackDetection[];
}
export interface FlashLoanDetectionRequest {
  analysis: boolean;
  blockNumberRange: [string, string];
}
