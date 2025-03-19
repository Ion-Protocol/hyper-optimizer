import { erc20Abi } from "viem";
import { readContract, simulateContract, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { wagmiConfig } from "../../config/wagmi";

/**
 * Retrieves the balance of a specific address for a given ERC20 token.
 * @param balanceAddress The address for which the balance needs to be retrieved.
 * @param tokenAddress The address of the ERC20 token.
 * @param chainId The chain ID for the token (optional).
 * @returns The balance of the specified address as a BigInt.
 */
export async function balanceOf({
  balanceAddress,
  tokenAddress,
  chainId,
}: {
  balanceAddress: `0x${string}`;
  tokenAddress: `0x${string}`;
  chainId: number;
}): Promise<bigint> {
  if (tokenAddress === "0x") {
    throw new Error(`Error calling balanceOf(): tokenAddress cannot be "0x".`);
  }
  try {
    const balanceOfAsBigInt = await readContract(wagmiConfig, {
      abi: erc20Abi,
      address: tokenAddress,
      functionName: "balanceOf",
      args: [balanceAddress],
      chainId: 1,
    });
    return balanceOfAsBigInt;
  } catch (error) {
    // Attach additional context to the error object
    const errorMessage = `chainId: ${chainId})\n`;
    throw new Error(`${errorMessage}${error instanceof Error ? error.message : error}`);
  }
}

/**
 * Retrieves the allowance of a spender for a specific token.
 *
 * @param tokenAddress - The address of the token contract.
 * @param spenderAddress - The address of the spender.
 * @param userAddress - The address of the user.
 * @returns The allowance as a BigInt.
 */
export async function checkAllowance({
  tokenAddress,
  spenderAddress,
  userAddress,
}: {
  tokenAddress: `0x${string}`;
  spenderAddress: `0x${string}`;
  userAddress: `0x${string}`;
}) {
  const allowanceAsBigInt = await readContract(wagmiConfig, {
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "allowance",
    args: [userAddress, spenderAddress],
    chainId: 1,
  });

  return allowanceAsBigInt;
}

/**
 * Approves the spender to spend the specified amount of tokens from the token owner's account.
 *
 * @param options - The options for the approval.
 * @param options.tokenAddress - The address of the token.
 * @param options.spenderAddress - The address of the spender.
 * @param options.amount - The amount of tokens to be approved.
 * @returns A promise that resolves to the transaction receipt.
 */
export async function approve({
  tokenAddress,
  spenderAddress,
  amount,
}: {
  tokenAddress: `0x${string}`;
  spenderAddress: `0x${string}`;
  amount: bigint;
}): Promise<`0x${string}`> {
  // Simulate the transaction to catch any errors
  await simulateContract(wagmiConfig, {
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "approve",
    args: [spenderAddress, amount],
  });

  // Approve the spender
  const txHash = await writeContract(wagmiConfig, {
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "approve",
    args: [spenderAddress, amount],
  });

  // Wait for the transaction to be confirmed
  await waitForTransactionReceipt(wagmiConfig, {
    hash: txHash,
    timeout: 60_000,
    confirmations: 1,
    pollingInterval: 10_000,
    retryCount: 5,
    retryDelay: 5_000,
  });

  return txHash;
}
