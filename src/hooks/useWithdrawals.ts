import { getVaultByKey, VaultKey } from "@molecularlabs/nucleus-frontend";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { mainnet } from "viem/chains";
import { useAccount } from "wagmi";
import { fetchWithdrawals, Order } from "../api/nucleus/fetchWithdrawals";
import { capitalizeFirstLetter } from "../utils/string";
import { format } from "date-fns";
import { formatEther } from "viem";

export function useWithdrawals() {
  //////////////////////////////
  // Hooks
  //////////////////////////////
  const { address } = useAccount();
  const { vaultKey } = useParams();

  //////////////////////////////
  // Setup
  //////////////////////////////
  const config = getVaultByKey(vaultKey as VaultKey);
  const vaultAddress = config.contracts.boringVault;

  //////////////////////////////
  // Data State
  //////////////////////////////
  const [withdrawalsState, setWithdrawalsState] = useState<Order[]>([]);

  //////////////////////////////
  // Effects for Loading Data
  //////////////////////////////
  useEffect(() => {
    if (!address) {
      setWithdrawalsState([]);
      return;
    }

    async function fetchData() {
      if (!vaultAddress) return;
      const withdrawals = await fetchWithdrawals({
        user: address as `0x${string}`,
        vaultAddress: vaultAddress,
        chainId: mainnet.id,
      });
      setWithdrawalsState(withdrawals);
    }
    fetchData();
  }, [address, vaultAddress]);

  //////////////////////////////
  // Derived Values
  //////////////////////////////
  const withdrawals = useMemo(() => {
    return withdrawalsState.map((withdrawal) => {
      const status = capitalizeFirstLetter(withdrawal.status);
      const date = format(new Date(Number(withdrawal.created_timestamp) * 1000), "MMM dd, yyyy");
      const time = format(new Date(Number(withdrawal.created_timestamp) * 1000), "HH:mm a");
      const amount = Number(formatEther(BigInt(withdrawal.amount))).toFixed(4);
      const vaultAssetSymbol = capitalizeFirstLetter(vaultKey as VaultKey);
      const depositTokens = Object.values(config.deposit.depositTokens[mainnet.id] ?? {}).map((x) => x.token);
      const wantAssetSymbol = depositTokens.find((x) => x.addresses[mainnet.id] === withdrawal.want_token)?.symbol;
      const minimumPrice = `${formatEther(BigInt(withdrawal.atomic_price))}`;
      const deadline = format(new Date(Number(withdrawal.deadline) * 1000), "MMM dd, yyyy, HH:mm a");
      const createdAt = format(new Date(Number(withdrawal.created_timestamp) * 1000), "MMM dd, yyyy, HH:mm a");
      return {
        status,
        date,
        time,
        amount,
        vaultAssetSymbol,
        wantAssetSymbol,
        minimumPrice,
        deadline,
        createdAt,
      };
    });
  }, [config.deposit.depositTokens, vaultKey, withdrawalsState]);

  return {
    withdrawals,
  };
}
