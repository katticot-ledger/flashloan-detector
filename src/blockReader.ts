import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";
import "https://deno.land/std@0.205.0/dotenv/load.ts";
import { AAVE_CONTRACT_ADDRESS, FLASH_LOAN_ABI } from "./abi.ts";
import { FlashLoanTransaction, Transfer } from "./types.ts";

const MAX_BLOCKS_PER_QUERY = 5;

const provider = new ethers.providers.JsonRpcProvider(Deno.env.get("endpoint"));

async function decodeTransfers(
  receipt: ethers.providers.TransactionReceipt,
): Promise<Transfer[]> {
  const transfers: Transfer[] = [];

  for (const log of receipt.logs) {
    try {
      if (
        log.topics[0] === ethers.utils.id("Transfer(address,address,uint256)")
      ) {
        const from = ethers.utils.defaultAbiCoder.decode(
          ["address"],
          log.topics[1],
        )[0];
        const to = ethers.utils.defaultAbiCoder.decode(
          ["address"],
          log.topics[2],
        )[0];
        const value = ethers.utils.defaultAbiCoder.decode(
          ["uint256"],
          log.data,
        )[0];

        transfers.push({
          from,
          to,
          value: value.toString(),
          token: log.address,
        });
      }
    } catch (error) {
      console.error("Error parsing transfer:", error);
    }
  }

  return transfers;
}

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

  const transactions = await Promise.all(
    events.map(async (event) => {
      const receipt = await provider.getTransactionReceipt(
        event.transactionHash,
      );
      const transfers = await decodeTransfers(receipt);

      return {
        blockNumber: event.blockNumber,
        txHash: event.transactionHash,
        initiator: event.args.initiator,
        target: event.args.target,
        asset: event.args.asset,
        amount: event.args.amount.toString(),
        premium: event.args.premium.toString(),
        transfers,
      };
    }),
  );

  return transactions;
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
