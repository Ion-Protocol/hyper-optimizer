import {
  ATOMIC_QUEUE_CONTRACT_ADDRESS,
  bigIntToNumberAsString,
  calculateRedeemAmount,
  DEFAULT_SLIPPAGE,
  getEthPrice,
  getVaultByKey,
  nucleusTokenConfig,
  NucleusTokenKey,
  TokenKey,
  VaultKey,
} from "@molecularlabs/nucleus-frontend";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { formatEther, parseEther } from "viem";
import { mainnet } from "viem/chains";
import { useAccount } from "wagmi";
import { approve, balanceOf, checkAllowance } from "../api/contracts/erc20";
import { SupportedChainId } from "../config/wagmi";
import { ApyService } from "../services/ApyService";
import { TvlService } from "../services/TvlService";
import { VaultService } from "../services/VaultService";
import { convertToBigIntString } from "../utils/bigint";
import { sanitizeDepositInput } from "../utils/number";

type TransactionStatus = "idle" | "processing" | "done" | "error";

export function useVault() {
  //////////////////////////////
  // Hooks
  //////////////////////////////
  const { vaultKey } = useParams();
  const { address } = useAccount();

  //////////////////////////////
  // Setup
  //////////////////////////////
  const config = useMemo(() => getVaultByKey(vaultKey as VaultKey), [vaultKey]);
  const availableDepositTokens = useMemo(() => Object.values(config.deposit.depositTokens[mainnet.id] || {}), [config]);
  const availableReceiveTokens = useMemo(() => Object.values(config.withdraw.wantTokens[mainnet.id] || {}), [config]);

  //////////////////////////////
  // Component State
  //////////////////////////////
  // Form State
  const [inputValue, setInputValue] = useState<string>("");
  const [depositTokenIndex, setDepositTokenIndex] = useState<number>(0);
  const [receiveTokenIndex, setReceiveTokenIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");

  // Deposit Transaction State
  const [depositApprovalStatus, setDepositApprovalStatus] = useState<TransactionStatus>("idle");
  const [depositStatus, setDepositStatus] = useState<TransactionStatus>("idle");
  const [depositApprovalTxHash, setDepositApprovalTxHash] = useState<`0x${string}` | null>(null);
  const [depositTxHash, setDepositTxHash] = useState<`0x${string}` | null>(null);

  // Withdraw Transaction State
  const [bridgeStatus, setBridgeStatus] = useState<TransactionStatus>("idle");
  const [updateAtomicRequestApprovalStatus, setUpdateAtomicRequestApprovalStatus] = useState<TransactionStatus>("idle");
  const [updateAtomicRequestStatus, setUpdateAtomicRequestStatus] = useState<TransactionStatus>("idle");
  const [bridgeTxHash, setBridgeTxHash] = useState<`0x${string}` | null>(null);
  const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | null>(null);
  const [updateAtomicRequestTxHash, setUpdateAtomicRequestTxHash] = useState<`0x${string}` | null>(null);

  // Other State
  const [error, setError] = useState<string>("");
  const [debouncedInputValue, setDebouncedInputValue] = useState<string>(inputValue);

  // Add specific loading states for different data types
  const [vaultMetricsLoading, setVaultMetricsLoading] = useState<boolean>(true);
  const [tokenMetricsLoading, setTokenMetricsLoading] = useState<boolean>(true);

  // Add cache at the component level
  const [tokenDataCache, setTokenDataCache] = useState<Record<string, { rate: string; balance: string }>>({});

  //////////////////////////////
  // Component Actions
  //////////////////////////////
  function changeSelectedDepositToken(tokenIndex: number) {
    setDepositTokenIndex(tokenIndex);
  }

  function changeSelectedReceiveToken(tokenIndex: number) {
    setReceiveTokenIndex(tokenIndex);
  }

  function changeInputValue(value: string) {
    setInputValue(sanitizeDepositInput(value, inputValue));
  }

  function changeSelectedTab(tab: "deposit" | "withdraw") {
    setInputValue("");
    setDepositTokenIndex(0);
    setReceiveTokenIndex(0);
    setActiveTab(tab);
  }

  //////////////////////////////
  // Data State
  //////////////////////////////
  // All bigints are 1e18 unless otherwise specified
  const [rateInQuote, setRateInQuote] = useState<string>("0");
  const [previewFee, setPreviewFee] = useState<string>("0");
  const [assetBalance, setAssetBalance] = useState<string>("0");
  const [vaultBalance, setVaultBalance] = useState<string>("0");
  const [vaultApy, setVaultApy] = useState<number>(0);
  const [vaultTvl, setVaultTvl] = useState<string>("0");
  const [ethPerVaultAssetRate, setEthPerVaultAssetRate] = useState<string>("0");
  const [ethPrice, setEthPrice] = useState<string>("0"); // ethPrice is 1e8

  //////////////////////////////
  // Effects for Loading Data
  //////////////////////////////

  // Data that changes when the selected deposit token changes
  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const tokenIndex = activeTab === "deposit" ? depositTokenIndex : receiveTokenIndex;
        const availableTokens = activeTab === "deposit" ? availableDepositTokens : availableReceiveTokens;
        const tokenAddress = availableDepositTokens[depositTokenIndex].token.addresses[mainnet.id];

        if (!tokenAddress || !address) {
          setAssetBalance("0");
          return;
        }

        // Create cache key
        const cacheKey = `${activeTab}-${tokenIndex}-${address}`;

        // Check cache first
        if (tokenDataCache[cacheKey]) {
          setRateInQuote(tokenDataCache[cacheKey].rate);
          setAssetBalance(tokenDataCache[cacheKey].balance);
          return;
        }

        // Only set loading if we need to fetch new data
        setTokenMetricsLoading(true);

        const [rateResult, balanceResult] = await Promise.all([
          VaultService.getRateInQuote(vaultKey as VaultKey, availableTokens[tokenIndex].token.key as TokenKey),
          balanceOf({
            balanceAddress: address as `0x${string}`,
            tokenAddress,
            chainId: mainnet.id,
          }),
        ]);

        // Update cache
        setTokenDataCache((prev) => ({
          ...prev,
          [cacheKey]: {
            rate: rateResult.toString(),
            balance: balanceResult.toString(),
          },
        }));

        setRateInQuote(rateResult.toString());
        setAssetBalance(balanceResult.toString());
      } catch (error) {
        const err = error as Error;
        console.error("Failed to fetch token data:", err.message);
        setError(err.message);
      } finally {
        setTokenMetricsLoading(false);
      }
    };

    fetchTokenData();
  }, [
    activeTab,
    address,
    availableDepositTokens,
    availableReceiveTokens,
    depositTokenIndex,
    receiveTokenIndex,
    vaultKey,
    tokenDataCache,
  ]);

  // Separate effect just for preview fee fetching.
  useEffect(() => {
    const fetchPreviewFee = async () => {
      try {
        const bridgeChainId = config.deposit.bridgeChainIdentifier;
        if (!address || bridgeChainId === 0 || debouncedInputValue === "") return;

        // Only set loading if we're actually going to fetch new data
        setTokenMetricsLoading(true);
        const previewFee = await VaultService.getPreviewFee({
          vaultKey: vaultKey as VaultKey,
          address: address as `0x${string}`,
          shareAmount: BigInt(convertToBigIntString(debouncedInputValue)),
        });
        setPreviewFee(previewFee.toString());
      } catch (error) {
        const err = error as Error;
        console.error("Failed to fetch preview fee:", err.message);
        setError(err.message);
      } finally {
        setTokenMetricsLoading(false);
      }
    };

    fetchPreviewFee();
  }, [address, config.deposit.bridgeChainIdentifier, vaultKey, debouncedInputValue]);

  // Data that remains constant with the vault key
  useEffect(() => {
    const fetchVaultData = async () => {
      try {
        const vaultTokenAddress = getVaultByKey(vaultKey as VaultKey).token.addresses[mainnet.id];

        if (!vaultTokenAddress || !address) {
          setVaultBalance("0");
          return;
        }

        setVaultMetricsLoading(true);
        const [balance, apy, tvl, ethRate, ethPriceResult] = await Promise.all([
          balanceOf({
            balanceAddress: address as `0x${string}`,
            tokenAddress: vaultTokenAddress,
            chainId: mainnet.id,
          }),
          ApyService.getApyByVault(vaultKey as VaultKey),
          TvlService.getTvlByVault(vaultKey as VaultKey),
          VaultService.getRateInQuote(vaultKey as VaultKey, "weth"),
          getEthPrice({ chain: mainnet }),
        ]);

        setVaultBalance(balance.toString());
        setVaultApy(apy);
        setVaultTvl(tvl.toString());
        setEthPerVaultAssetRate(ethRate.toString());
        setEthPrice(ethPriceResult.toString());
      } catch (error) {
        const err = error as Error;
        console.error("Failed to fetch vault data:", err.message);
        setError(err.message);
      } finally {
        setVaultMetricsLoading(false);
      }
    };

    fetchVaultData();
  }, [address, vaultKey]);

  //////////////////////////////
  // Side Effects
  //////////////////////////////

  // Reset the input value, deposit token index, receive token index, and active tab when the address changes
  useEffect(() => {
    if (!address) {
      setInputValue("");
      setDepositTokenIndex(0);
      setReceiveTokenIndex(0);
      setActiveTab("deposit");
      setAssetBalance("0");
      setVaultBalance("0");
    }
  }, [address]);

  // Create debounced effect for input value for updating the preview fee
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInputValue(inputValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue]);

  //////////////////////////////
  // Async Actions
  //////////////////////////////

  // Add this helper function inside useVault
  const getRequiredSteps = () => {
    if (activeTab === "deposit") {
      const depositTokenAddress = availableDepositTokens[depositTokenIndex].token.addresses[mainnet.id];
      const depositAmount = BigInt(convertToBigIntString(inputValue || "0"));
      const needsApproval = async () => {
        if (!depositTokenAddress || !address) return false;
        const allowance = await checkAllowance({
          tokenAddress: depositTokenAddress,
          spenderAddress: config.contracts.boringVault,
          userAddress: address as `0x${string}`,
        });
        return allowance < depositAmount;
      };

      return {
        approval: needsApproval,
        deposit: true,
      };
    } else {
      // Withdraw
      const isBridgeRequired = config.deposit.bridgeChainIdentifier !== 0;
      const shareAmount = BigInt(convertToBigIntString(inputValue || "0"));
      const sourceChain = Object.values(config.withdraw.sourceChains)[0];
      const shareAssetAddress =
        nucleusTokenConfig[vaultKey as NucleusTokenKey]?.addresses[sourceChain.id as SupportedChainId];

      const needsApproval = async () => {
        if (!shareAssetAddress || !address) return false;
        const allowance = await checkAllowance({
          tokenAddress: shareAssetAddress,
          spenderAddress: ATOMIC_QUEUE_CONTRACT_ADDRESS,
          userAddress: address as `0x${string}`,
        });
        return allowance < shareAmount;
      };

      return {
        bridge: isBridgeRequired,
        approval: needsApproval,
        updateAtomicRequest: true,
      };
    }
  };

  // Add this function to reset transaction states
  function resetTransactionStates() {
    // Reset deposit states
    setDepositApprovalStatus("idle");
    setDepositStatus("idle");
    setDepositApprovalTxHash(null);
    setDepositTxHash(null);

    // Reset withdraw states
    setBridgeStatus("idle");
    setUpdateAtomicRequestApprovalStatus("idle");
    setUpdateAtomicRequestStatus("idle");
    setBridgeTxHash(null);
    setApproveTxHash(null);
    setUpdateAtomicRequestTxHash(null);

    // Reset error
    setError("");
  }

  // Update handleDeposit function
  async function handleDeposit() {
    setError("");
    const config = getVaultByKey(vaultKey as VaultKey);
    const depositTokenAddress = availableDepositTokens[depositTokenIndex].token.addresses[mainnet.id];
    if (!depositTokenAddress) {
      setError("Deposit token address not found");
      resetTransactionStates();
      return;
    }

    const steps = getRequiredSteps();

    try {
      // 1. Check and handle approval if needed
      setDepositApprovalStatus("processing");
      if (await steps.approval()) {
        const approveTxHash = await approve({
          tokenAddress: depositTokenAddress,
          spenderAddress: config.contracts.boringVault,
          amount: BigInt(convertToBigIntString(inputValue)),
        });
        setDepositApprovalTxHash(approveTxHash);
      }
      setDepositApprovalStatus("done");

      // 2. Perform deposit
      setDepositStatus("processing");
      const depositTxHash = await VaultService.deposit({
        vaultKey: vaultKey as VaultKey,
        depositToken: availableDepositTokens[depositTokenIndex].token.key as TokenKey,
        depositAmount: BigInt(convertToBigIntString(inputValue)),
        address: address as `0x${string}`,
      });
      setDepositTxHash(depositTxHash);
      setDepositStatus("done");
    } catch (err) {
      const error = err as Error;
      console.error(error);
      setError(error.message);
      if (depositStatus === "processing") {
        setDepositStatus("error");
      } else {
        setDepositApprovalStatus("error");
      }
    }
  }

  // Update handleWithdraw function similarly
  async function handleWithdraw() {
    setError("");
    if (!vaultKey) {
      setError("Vault key not found");
      resetTransactionStates();
      return;
    }

    const steps = getRequiredSteps();
    const shareAmount = BigInt(convertToBigIntString(inputValue));

    try {
      // 1. Bridge if required
      if (steps.bridge) {
        setBridgeStatus("processing");
        const sourceChain = Object.values(config.withdraw.sourceChains)[0];
        const bridgeTxHash = await VaultService.bridge({
          vaultKey: vaultKey as VaultKey,
          address: address as `0x${string}`,
          shareAmount,
          sourceChainId: sourceChain.id as SupportedChainId,
        });
        setBridgeTxHash(bridgeTxHash);
        setBridgeStatus("done");
      }

      // 2. Handle approval if needed
      setUpdateAtomicRequestApprovalStatus("processing");
      if (await steps.approval()) {
        const sourceChain = Object.values(config.withdraw.sourceChains)[0];
        const shareAssetAddress =
          nucleusTokenConfig[vaultKey as NucleusTokenKey].addresses[sourceChain.id as SupportedChainId];

        if (!shareAssetAddress) {
          throw new Error("Share asset address not found");
        }

        const approveTxHash = await approve({
          tokenAddress: shareAssetAddress,
          spenderAddress: ATOMIC_QUEUE_CONTRACT_ADDRESS,
          amount: shareAmount,
        });
        setApproveTxHash(approveTxHash);
      }
      setUpdateAtomicRequestApprovalStatus("done");

      // 3. Update atomic request
      setUpdateAtomicRequestStatus("processing");
      const selectedReceiveToken = availableReceiveTokens[receiveTokenIndex].token.addresses[mainnet.id] || "0x0";
      const sourceChain = Object.values(config.withdraw.sourceChains)[0];
      const shareAssetAddress =
        nucleusTokenConfig[vaultKey as NucleusTokenKey].addresses[sourceChain.id as SupportedChainId];

      if (!shareAssetAddress) {
        throw new Error("Share asset address not found");
      }

      const updateAtomicRequestTxHash = await VaultService.updateAtomicRequest({
        offer: shareAssetAddress,
        want: selectedReceiveToken,
        chainId: mainnet.id as SupportedChainId,
        deadline: Date.now() + 1000 * 60 * 60 * 24 * 3,
        offerAmount: shareAmount,
        atomicPrice: BigInt(0),
      });
      setUpdateAtomicRequestTxHash(updateAtomicRequestTxHash);
      setUpdateAtomicRequestStatus("done");
    } catch (err) {
      const error = err as Error;
      console.error(error);
      setError(error.message);
      if (updateAtomicRequestStatus === "processing") {
        setUpdateAtomicRequestStatus("error");
      } else if (updateAtomicRequestApprovalStatus === "processing") {
        setUpdateAtomicRequestApprovalStatus("error");
      } else {
        setBridgeStatus("error");
      }
    }
  }

  //////////////////////////////
  // Derived Values
  //////////////////////////////
  // Available deposit and receive tokens for the select fields taken from the config
  const availableTokens = activeTab === "deposit" ? availableDepositTokens : availableReceiveTokens;

  // Exchange rate
  const formattedExchangeRate = `${
    rateInQuote ? bigIntToNumberAsString(BigInt(rateInQuote), { maximumFractionDigits: 4 }) : "0.00"
  } ${availableTokens[depositTokenIndex].token.symbol} / ${vaultKey}`;

  // Preview fee
  const previewFeeInUsd = (BigInt(previewFee) * BigInt(ethPrice)) / BigInt(1e8);
  const formattedPreviewFee = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(formatEther(previewFeeInUsd)));

  // User's asset balance that appears below the input field
  const formattedAssetBalance =
    activeTab === "deposit"
      ? `${bigIntToNumberAsString(BigInt(assetBalance), {
          maximumFractionDigits: 4,
        })} ${availableTokens[depositTokenIndex].token.symbol}`
      : `${bigIntToNumberAsString(BigInt(vaultBalance), {
          maximumFractionDigits: 4,
        })} ${vaultKey}`;

  // Vault balance in both the vault asset and USD that appears in the user's position section
  const usdPerVaultAssetRate = (BigInt(ethPrice) * BigInt(ethPerVaultAssetRate)) / BigInt(1e8);
  const vaultBalanceInUsd = (BigInt(vaultBalance) * usdPerVaultAssetRate) / BigInt(1e18);
  const formattedVaultBalance = bigIntToNumberAsString(BigInt(vaultBalance), {
    maximumFractionDigits: 2,
  });
  const formattedVaultBalanceInUsd = `$${bigIntToNumberAsString(vaultBalanceInUsd, {
    maximumFractionDigits: 2,
  })}`;

  // Receive amount in the vault asset when the deposit tab is selected
  const receiveAmountForDeposit =
    BigInt(rateInQuote) === BigInt(0)
      ? BigInt(0)
      : (BigInt(convertToBigIntString(inputValue)) * BigInt(1e18)) / BigInt(rateInQuote);
  const formattedReceiveAmountForDeposit = `${bigIntToNumberAsString(receiveAmountForDeposit, {
    maximumFractionDigits: 4,
  })} ${vaultKey}`;

  // Receive amount in the selected asset when the withdraw tab is selected
  const receiveAmountForWithdraw = calculateRedeemAmount(parseEther(inputValue), BigInt(rateInQuote), DEFAULT_SLIPPAGE);
  const formattedReceiveAmountForWithdraw = `${bigIntToNumberAsString(receiveAmountForWithdraw, {
    maximumFractionDigits: 4,
  })} ${availableTokens[receiveTokenIndex].token.symbol}`;
  const formattedReceiveAmount =
    activeTab === "deposit" ? formattedReceiveAmountForDeposit : formattedReceiveAmountForWithdraw;

  // Vault APY
  const formattedVaultApy = `${vaultApy.toFixed(2)}%`;

  // Vault TVL
  const tvlInUsdAsBigInt = (BigInt(vaultTvl) * BigInt(ethPrice)) / BigInt(1e18);
  const totalTvlInUsd = tvlInUsdAsBigInt / BigInt(1e8);
  const formattedVaultTvl = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(totalTvlInUsd));

  // Slippage
  const formattedSlippage = `${(DEFAULT_SLIPPAGE * 100).toFixed(2)}%`;

  // Redemption price (exchange rate with 0.2% withdraw fee applied)
  const WITHDRAW_FEE = 0.002; // 0.2%
  const redemptionRate =
    BigInt(rateInQuote) === BigInt(0)
      ? BigInt(0)
      : (BigInt(rateInQuote) * BigInt(1000 - WITHDRAW_FEE * 1000)) / BigInt(1000);

  const formattedRedemptionPrice = `${
    redemptionRate ? bigIntToNumberAsString(redemptionRate, { maximumFractionDigits: 4 }) : "0.00"
  } ${availableTokens[depositTokenIndex].token.symbol} / ${vaultKey}`;

  // Are buttons disabled
  const isDepositDisabled =
    inputValue === "" ||
    Number(inputValue) <= 0 ||
    BigInt(assetBalance) < BigInt(convertToBigIntString(inputValue)) ||
    depositApprovalStatus === "processing" ||
    depositStatus === "processing";

  const isWithdrawDisabled =
    inputValue === "" || Number(inputValue) <= 0 || BigInt(vaultBalance) < BigInt(convertToBigIntString(inputValue));

  // Update these derived values to check for error states
  const depositing =
    (depositApprovalStatus === "processing" || depositStatus === "processing") &&
    depositApprovalStatus !== "error" &&
    depositStatus !== "error";

  const withdrawing =
    (bridgeStatus === "processing" ||
      updateAtomicRequestApprovalStatus === "processing" ||
      updateAtomicRequestStatus === "processing") &&
    bridgeStatus !== "error" &&
    updateAtomicRequestApprovalStatus !== "error" &&
    updateAtomicRequestStatus !== "error";

  // Transaction status
  const transactionStatus = useMemo(() => {
    return {
      deposit: {
        approval: {
          txHash: depositApprovalTxHash,
          status: depositApprovalStatus,
        },
        deposit: {
          txHash: depositTxHash,
          status: depositStatus,
        },
      },
      withdraw: {
        bridge: {
          txHash: bridgeTxHash,
          status: bridgeStatus,
        },
        approval: {
          txHash: approveTxHash,
          status: updateAtomicRequestApprovalStatus,
        },
        updateAtomicRequest: {
          txHash: updateAtomicRequestTxHash,
          status: updateAtomicRequestStatus,
        },
      },
    };
  }, [
    approveTxHash,
    bridgeStatus,
    bridgeTxHash,
    depositApprovalStatus,
    depositApprovalTxHash,
    depositStatus,
    depositTxHash,
    updateAtomicRequestApprovalStatus,
    updateAtomicRequestStatus,
    updateAtomicRequestTxHash,
  ]);

  return {
    activeTab,
    availableTokens,
    changeInputValue,
    changeSelectedDepositToken,
    changeSelectedReceiveToken,
    changeSelectedTab,
    depositing,
    depositTokenIndex,
    error,
    formattedAssetBalance,
    formattedExchangeRate,
    formattedPreviewFee,
    formattedReceiveAmount,
    formattedSlippage,
    formattedVaultApy,
    formattedVaultBalance,
    formattedVaultBalanceInUsd,
    formattedVaultTvl,
    formattedRedemptionPrice,
    handleDeposit,
    handleWithdraw,
    inputValue,
    isDepositDisabled,
    isWithdrawDisabled,
    receiveTokenIndex,
    transactionStatus,
    withdrawing,
    vaultMetricsLoading,
    tokenMetricsLoading,
    resetTransactionStates,
  };
}
