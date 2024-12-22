// Aave V2 LendingPool proxy address
export const AAVE_CONTRACT_ADDRESS =
  "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9";

export const FLASH_LOAN_ABI = [
  "event FlashLoan(address indexed target, address indexed initiator, address indexed asset, uint256 amount, uint256 premium, uint16 referralCode)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];
