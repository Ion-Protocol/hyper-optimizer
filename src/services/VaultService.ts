import {
  ATOMIC_QUEUE_CONTRACT_ADDRESS,
  AtomicQueueAbi,
  CrossChainTellerBaseAbi,
  DEFAULT_SLIPPAGE,
  getPreviewFee,
  getRateInQuoteSafe,
  getVaultByKey,
  prepareBridgeData,
  TellerAbi,
  TokenKey,
  VaultKey,
} from "@molecularlabs/nucleus-frontend";
import { Address } from "viem";
import { mainnet } from "viem/chains";
import { simulateContract, switchChain, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { SupportedChainId, wagmiConfig } from "../config/wagmi";
import { sleep } from "../utils/time";

interface BridgeData {
  chainSelector: number;
  destinationChainReceiver: `0x${string}`;
  bridgeFeeToken: `0x${string}`;
  messageGas: bigint;
  data: `0x${string}`;
}

export class VaultService {
  // Private constructor to prevent instantiation.
  private constructor() {}

  private static calculateMinimumMint(depositAmount: bigint, rate: bigint): bigint {
    const slippageAsBigInt = BigInt((DEFAULT_SLIPPAGE * 1e18).toString());
    const minimumMint = (depositAmount * BigInt(1e18)) / rate;
    const slippageAmount = (minimumMint * slippageAsBigInt) / BigInt(1e18);
    return minimumMint - slippageAmount;
  }

  // Get the rate in quote for a vault
  public static async getRateInQuote(vaultKey: VaultKey, depositToken: TokenKey): Promise<bigint> {
    const config = getVaultByKey(vaultKey as VaultKey);
    const tokenAddress =
      config.deposit.depositTokens[mainnet.id]?.[depositToken as TokenKey]?.token.addresses[mainnet.id];
    const accountantAddress = config.contracts.accountant;
    if (!tokenAddress) {
      return BigInt(0);
    }
    const rate = await getRateInQuoteSafe({
      wantAssetAddress: tokenAddress,
      accountantAddress,
      chain: mainnet,
    });

    return rate;
  }

  // Get the preview fee for a vault
  public static async getPreviewFee({
    vaultKey,
    address,
    shareAmount,
  }: {
    vaultKey: VaultKey;
    address: `0x${string}`;
    shareAmount: bigint;
  }) {
    const config = getVaultByKey(vaultKey as VaultKey);
    const tellerContractAddress = config.contracts.teller;
    const bridgeChainId = config.deposit.bridgeChainIdentifier;
    if (bridgeChainId === 0) {
      return BigInt(0);
    }
    const bridgeData = prepareBridgeData(bridgeChainId, address, "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE");
    const previewFee = await getPreviewFee({
      shareAmount,
      bridgeData,
      contractAddress: tellerContractAddress,
      chain: mainnet,
    });
    return previewFee;
  }

  /** 
    Deposit into a vault
    Assuming all vaults are deposit only and no bridging is needed for now
  */
  public static async deposit({
    vaultKey,
    depositToken,
    depositAmount,
    address,
  }: {
    vaultKey: VaultKey;
    depositToken: TokenKey;
    depositAmount: bigint;
    address: `0x${string}`;
  }): Promise<`0x${string}`> {
    const config = getVaultByKey(vaultKey as VaultKey);
    const bridgeChainId = config.deposit.bridgeChainIdentifier;
    const depositTokenAddress =
      config.deposit.depositTokens[mainnet.id]?.[depositToken as TokenKey]?.token.addresses[mainnet.id];
    if (!depositTokenAddress) {
      throw new Error("Deposit token address not found");
    }

    ////////////////////////////////
    // Calculate Minimum Mint
    ////////////////////////////////
    const rate = await this.getRateInQuote(vaultKey, depositToken);
    const minimumMint = this.calculateMinimumMint(depositAmount, rate);

    ////////////////////////////////
    // Calculate Preview Fee
    ////////////////////////////////
    const previewFee = await this.getPreviewFee({
      vaultKey,
      address,
      shareAmount: minimumMint,
    });

    ////////////////////////////////
    // Prepare Bridge Data
    ////////////////////////////////
    const bridgeData: BridgeData = {
      chainSelector: config.deposit.bridgeChainIdentifier,
      destinationChainReceiver: address as `0x${string}`,
      bridgeFeeToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // ETH address
      messageGas: BigInt(100000),
      data: "0x",
    };

    ////////////////////////////////
    // Simulate and Write
    ////////////////////////////////
    let txHash: `0x${string}`;
    if (bridgeChainId !== 0) {
      const bridgeArgs = [
        depositTokenAddress,
        depositAmount,
        minimumMint,
        {
          chainSelector: bridgeData.chainSelector,
          destinationChainReceiver: bridgeData.destinationChainReceiver,
          bridgeFeeToken: bridgeData.bridgeFeeToken,
          messageGas: bridgeData.messageGas,
          data: bridgeData.data,
        },
      ] as const;

      await simulateContract(wagmiConfig, {
        abi: TellerAbi,
        address: config.contracts.teller,
        functionName: "depositAndBridge",
        args: bridgeArgs,
        value: previewFee,
      });
      txHash = await writeContract(wagmiConfig, {
        abi: TellerAbi,
        address: config.contracts.teller,
        functionName: "depositAndBridge",
        args: bridgeArgs,
        value: previewFee,
      });
    } else {
      await simulateContract(wagmiConfig, {
        abi: TellerAbi,
        address: config.contracts.teller,
        functionName: "deposit",
        args: [depositTokenAddress, depositAmount, minimumMint],
        value: previewFee,
      });
      txHash = await writeContract(wagmiConfig, {
        abi: TellerAbi,
        address: config.contracts.teller,
        functionName: "deposit",
        args: [depositTokenAddress, depositAmount, minimumMint],
        value: previewFee,
      });
    }

    ////////////////////////////////
    // Wait for Transaction Receipt
    ////////////////////////////////
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

  public static async bridge({
    vaultKey,
    address,
    shareAmount,
    sourceChainId,
  }: {
    vaultKey: VaultKey;
    address: `0x${string}`;
    shareAmount: bigint;
    sourceChainId: SupportedChainId;
  }): Promise<`0x${string}`> {
    const config = getVaultByKey(vaultKey as VaultKey);
    // Check if bridge is required
    if (config.withdraw.bridgeChainIdentifier === 0) {
      throw new Error(`Tried to bridge but the bridge chain identifier for ${vaultKey} is 0`);
    }

    // Switch to the source chain and wait for it to be switched
    await switchChain(wagmiConfig, {
      chainId: sourceChainId,
    });
    await sleep(500);

    ///////////////////////////////////
    // Bridge
    ///////////////////////////////////
    try {
      const latestPreviewFee = await VaultService.getPreviewFee({
        vaultKey: vaultKey as VaultKey,
        address: address as `0x${string}`,
        shareAmount: shareAmount,
      });
      const bridgeData = {
        chainSelector: config.withdraw.bridgeChainIdentifier,
        destinationChainReceiver: address as Address,
        bridgeFeeToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as Address,
        messageGas: BigInt(100000),
        data: "0x" as `0x${string}`,
      };
      await simulateContract(wagmiConfig, {
        abi: CrossChainTellerBaseAbi,
        address: config.contracts.teller,
        functionName: "bridge",
        args: [shareAmount, bridgeData],
        chainId: sourceChainId,
        value: latestPreviewFee,
      });
      const txHash = await writeContract(wagmiConfig, {
        abi: CrossChainTellerBaseAbi,
        address: config.contracts.teller,
        functionName: "bridge",
        args: [shareAmount, bridgeData],
        chainId: sourceChainId,
        value: latestPreviewFee,
      });
      await waitForTransactionReceipt(wagmiConfig, {
        hash: txHash,
        timeout: 60_000,
        confirmations: 1,
        pollingInterval: 10_000,
        retryCount: 5,
        retryDelay: 5_000,
      });
      return txHash;
    } finally {
      // Switch back to Ethereum chain on success or failure
      await switchChain(wagmiConfig, {
        chainId: mainnet.id as SupportedChainId,
      });
      await sleep(500);
    }
  }

  public static async updateAtomicRequest({
    atomicPrice,
    chainId,
    deadline,
    offer,
    offerAmount,
    want,
  }: {
    atomicPrice: bigint;
    chainId: SupportedChainId;
    deadline: number;
    offer: `0x${string}`;
    offerAmount: bigint;
    want: `0x${string}`;
  }): Promise<`0x${string}`> {
    await simulateContract(wagmiConfig, {
      abi: AtomicQueueAbi,
      address: ATOMIC_QUEUE_CONTRACT_ADDRESS,
      functionName: "updateAtomicRequest",
      args: [
        offer,
        want,
        {
          deadline: BigInt(deadline),
          atomicPrice: atomicPrice,
          offerAmount: offerAmount,
          inSolve: false,
        },
      ],
      chainId,
    });
    const txHash = await writeContract(wagmiConfig, {
      abi: AtomicQueueAbi,
      address: ATOMIC_QUEUE_CONTRACT_ADDRESS,
      functionName: "updateAtomicRequest",
      args: [
        offer,
        want,
        {
          deadline: BigInt(deadline),
          atomicPrice: atomicPrice,
          offerAmount: offerAmount,
          inSolve: false,
        },
      ],
      chainId,
    });
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
}
