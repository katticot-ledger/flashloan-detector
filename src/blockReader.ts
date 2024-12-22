import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";
import "https://deno.land/std@0.205.0/dotenv/load.ts";
import { AAVE_CONTRACT_ADDRESS, FLASH_LOAN_ABI } from "./abi.ts";
import { FlashLoanTransaction } from "./types.ts";

const MAX_BLOCKS_PER_QUERY = 5;

const provider = new ethers.providers.JsonRpcProvider(Deno.env.get("endpoint"));

export async function fetchFlashLoanTransactions(
  startBlock: number,
  endBlock?: number,
): Promise<FlashLoanTransaction[]> {
  const latestBlock = endBlock ?? startBlock;
  const aaveContract = new ethers.Contract(
    AAVE_CONTRACT_ADDRESS,
    FLASH_LOAN_ABI,
    provider,
  );

  const trimRanges = createBlockRanges(startBlock, latestBlock);

  // Fetch all transactions in parallel
  const events = (
    await Promise.all(
      trimRanges.map(([from, to]) =>
        aaveContract.queryFilter(aaveContract.filters.FlashLoan(), from, to),
      ),
    )
  ).flat();

  return events.map((event) => ({
    blockNumber: event.blockNumber,
    txHash: event.transactionHash,
    initiator: event.args.initiator,
    target: event.args.target,
    asset: event.args.asset,
    amount: event.args.amount.toString(),
    premium: event.args.premium.toString(),
  }));
}

// Create ranges of blocks to respect the max block query limit
//https://www.quicknode.com/docs/ethereum/eth_getLogs
function createBlockRanges(start: number, end: number): [number, number][] {
  const ranges: [number, number][] = [];
  for (let i = start; i <= end; i += MAX_BLOCKS_PER_QUERY + 1) {
    ranges.push([i, Math.min(i + MAX_BLOCKS_PER_QUERY, end)]);
  }
  return ranges;
}

async function displayFlashLoanTransactions(
  startBlock: number,
  endBlock?: number,
) {
  console.log(
    `Fetching transactions from block ${startBlock} to ${endBlock ?? "latest"}...`,
  );
  const transactions = await fetchFlashLoanTransactions(startBlock, endBlock);

  if (transactions.length === 0) {
    console.log("No flash loan transactions found.");
  } else {
    transactions.forEach((tx) => {
      console.log("-".repeat(50));
      console.log(`Block: ${tx.blockNumber}`);
      console.log(`Transaction Hash: ${tx.txHash}`);
      console.log(`Initiator: ${tx.initiator}`);
      console.log(`Target: ${tx.target}`);
      console.log(`Asset: ${tx.asset}`);
      console.log(`Amount: ${ethers.utils.formatEther(tx.amount)} ETH`);
      console.log(`Premium: ${ethers.utils.formatEther(tx.premium)} ETH`);
    });
  }
}

async function main() {
  const startBlock = 16817996;
  const endBlock = 16818057;

  await displayFlashLoanTransactions(startBlock, endBlock);
}

if (import.meta.main) {
  main();
}
