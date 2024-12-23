import { ethers } from 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js';
import {
  type FlashLoanTransaction,
  SuspiciousPattern,
  TransactionAnalysis,
  TransactionStatus,
} from './types.ts';

function determineStatus(patternCount: number): TransactionStatus {
  if (patternCount > 2) return TransactionStatus.Critical;
  if (patternCount === 2) return TransactionStatus.VerySuspicious;
  if (patternCount === 1) return TransactionStatus.Suspicious;
  return TransactionStatus.Normal;
}

export async function analyzeFlashLoan(
  transaction: FlashLoanTransaction,
): Promise<TransactionAnalysis> {
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
      `${SuspiciousPattern.LargeFlashLoan}: ${ethers.utils.formatEther(
        loanAmount,
      )
      } ETH`,
    );
  } else {
    return {
      transactionHash: transaction.txHash,
      blockNumber: transaction.blockNumber,
      analysis: [
        {
          status: determineStatus(suspiciousPatterns.length),
          reasons: suspiciousPatterns,
        },
      ],
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
      transactionHash: transaction.txHash,
      blockNumber: transaction.blockNumber,
      analysis: [
        {
          status: determineStatus(suspiciousPatterns.length),
          reasons: suspiciousPatterns,
        },
      ],
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
      transactionHash: transaction.txHash,
      blockNumber: transaction.blockNumber,
      analysis: [
        {
          status: determineStatus(suspiciousPatterns.length),
          reasons: suspiciousPatterns,
        },
      ],
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
        `${SuspiciousPattern.MultipleMints}: ${mintsFromNull.length} operations, Total minted: ${ethers.utils.formatEther(
          totalMinted,
        )
        } tokens`,
      );
    }
    if (burnsToNull.length > 2 || totalBurned.gt(LARGE_MINT_BURN_THRESHOLD)) {
      suspiciousPatterns.push(
        `${SuspiciousPattern.MultipleBurns}: ${burnsToNull.length} operations, Total burned: ${ethers.utils.formatEther(
          totalBurned,
        )
        } tokens`,
      );
    }
  } else {
    return {
      transactionHash: transaction.txHash,
      blockNumber: transaction.blockNumber,
      analysis: [
        {
          status: determineStatus(suspiciousPatterns.length),
          reasons: suspiciousPatterns,
        },
      ],
    };
  }

  const finalStatus = determineStatus(suspiciousPatterns.length);
  return {
    transactionHash: transaction.txHash,
    blockNumber: transaction.blockNumber,
    analysis: [
      {
        status: finalStatus,
        reasons: suspiciousPatterns,
      },
    ],
  };
}
