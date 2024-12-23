import { ethers } from 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js';

import type { FlashLoanTransaction } from './types.ts';

export enum SuspiciousPattern {
  LargeFlashLoan = 'Large flash loan amount detected',
  HighTransferCount = 'High number of transfers detected',
  MultipleLargeTransfers = 'Multiple large value transfers detected',
  MultipleMints = 'Multiple minting operations detected',
  MultipleBurns = 'Multiple burning operations detected',
}

function determineStatus(patternCount: number): string {
  if (patternCount >= 2) return 'Very Suspicious';
  if (patternCount === 1) return 'Suspicious';
  return 'Normal';
}

export async function analyzeFlashLoan(
  transaction: FlashLoanTransaction,
): Promise<{
  status: string;
  reasons: string[];
}> {
  const suspiciousPatterns: string[] = [];

  // Threshold constants
  const LARGE_FLASH_LOAN_THRESHOLD = ethers.utils.parseEther('1000');
  const LARGE_TRANSFER_THRESHOLD = ethers.utils.parseEther('500');
  const LARGE_MINT_BURN_THRESHOLD = ethers.utils.parseEther('500');
  const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

  // Step 1: Check for large flash loan amount
  const loanAmount = ethers.BigNumber.from(transaction.amount);
  if (loanAmount.gt(LARGE_FLASH_LOAN_THRESHOLD)) {
    suspiciousPatterns.push(
      `${SuspiciousPattern.LargeFlashLoan}: ${
        ethers.utils.formatEther(
          loanAmount,
        )
      } ETH`,
    );
  } else {
    return {
      status: determineStatus(suspiciousPatterns.length),
      reasons: suspiciousPatterns,
    };
  }

  // Step 2: Check for high transfer count
  const totalTransfers = transaction.transfers.length;
  if (totalTransfers > 5) {
    suspiciousPatterns.push(
      `${SuspiciousPattern.HighTransferCount}: ${totalTransfers}`,
    );
  } else {
    return {
      status: determineStatus(suspiciousPatterns.length),
      reasons: suspiciousPatterns,
    };
  }

  // Step 3: Check for large individual transfers
  const largeTransfers = transaction.transfers.filter((transfer) =>
    ethers.BigNumber.from(transfer.value).gt(LARGE_TRANSFER_THRESHOLD)
  );
  if (largeTransfers.length > 2) {
    suspiciousPatterns.push(
      `${SuspiciousPattern.MultipleLargeTransfers}: ${largeTransfers.length}`,
    );
  } else {
    return {
      status: determineStatus(suspiciousPatterns.length),
      reasons: suspiciousPatterns,
    };
  }

  // Step 4: Analyze mint/burn patterns
  const mintsFromNull = transaction.transfers.filter(
    (t) => t.from.toLowerCase() === NULL_ADDRESS.toLowerCase(),
  );
  const burnsToNull = transaction.transfers.filter(
    (t) => t.to.toLowerCase() === NULL_ADDRESS.toLowerCase(),
  );

  if (mintsFromNull.length > 0 || burnsToNull.length > 0) {
    const totalMinted = mintsFromNull.reduce(
      (sum, t) => sum.add(ethers.BigNumber.from(t.value)),
      ethers.BigNumber.from(0),
    );
    const totalBurned = burnsToNull.reduce(
      (sum, t) => sum.add(ethers.BigNumber.from(t.value)),
      ethers.BigNumber.from(0),
    );

    if (mintsFromNull.length > 2 || totalMinted.gt(LARGE_MINT_BURN_THRESHOLD)) {
      suspiciousPatterns.push(
        `${SuspiciousPattern.MultipleMints}: ${mintsFromNull.length} operations, Total minted: ${
          ethers.utils.formatEther(
            totalMinted,
          )
        } tokens`,
      );
    }
    if (burnsToNull.length > 2 || totalBurned.gt(LARGE_MINT_BURN_THRESHOLD)) {
      suspiciousPatterns.push(
        `${SuspiciousPattern.MultipleBurns}: ${burnsToNull.length} operations, Total burned: ${
          ethers.utils.formatEther(
            totalBurned,
          )
        } tokens`,
      );
    }
  } else {
    return {
      status: determineStatus(suspiciousPatterns.length),
      reasons: suspiciousPatterns,
    };
  }

  return {
    status: determineStatus(suspiciousPatterns.length),
    reasons: suspiciousPatterns,
  };
}
