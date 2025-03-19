import { getEthPrice, getVaultByKey, VaultKey } from "@molecularlabs/nucleus-frontend";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { mainnet } from "viem/chains";
import { vaultGroupsConfig } from "../config/vaultGroupsConfig";
import { ApyService } from "../services/ApyService";
import { TvlService } from "../services/TvlService";
import { VaultGroup } from "../types";

interface VaultData {
  key: VaultKey;
  tvl: string;
  apy: string;
  benefits: {
    multipliers: { token: string; value: number }[];
    tokens: { token: string; value: number }[];
  };
  rewardsCount: number;
  points: { key: VaultKey; name: string; multiplier: number }[];
}

export function useVaultGroup() {
  //////////////////
  // Hooks
  //////////////////
  const { vaultGroup } = useParams();

  //////////////////
  // Raw state
  //////////////////
  // Initialize vaults data with config values
  const initialVaultsData = useMemo(() => {
    if (!vaultGroup) return [];
    return vaultGroupsConfig[vaultGroup as VaultGroup].vaults.map((vaultKey) => ({
      key: vaultKey,
      tvl: "Loading...",
      apy: "Loading...",
      benefits: vaultGroupsConfig[vaultGroup as VaultGroup].benefits,
      rewardsCount: vaultGroupsConfig[vaultGroup as VaultGroup].benefits.tokens.length,
      points: getVaultByKey(vaultKey).points,
    }));
  }, [vaultGroup]);

  const [vaultsState, setVaultsState] = useState<{ key: VaultKey; tvl: string; apy: number }[]>([]);
  const [ethPrice, setEthPrice] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  //////////////////
  // Derived values
  //////////////////
  // Total TVL
  const totalTvl = useMemo(() => {
    const totalTvlAsBigInt = vaultsState.reduce((acc, vault) => acc + BigInt(vault.tvl), BigInt(0));
    const totalTvlInUsdAsBigInt = (totalTvlAsBigInt * BigInt(ethPrice)) / BigInt(1e18);
    const totalTvlInUsd = totalTvlInUsdAsBigInt / BigInt(1e8);
    const formattedTotalTvlInUsd = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(Number(totalTvlInUsd));

    return formattedTotalTvlInUsd;
  }, [ethPrice, vaultsState]);

  // Vaults data including TVL, APY, benefits, and rewards count
  const vaultsData: VaultData[] = useMemo(() => {
    if (vaultsState.length === 0) {
      return initialVaultsData;
    }

    return vaultsState.map((vaultState) => {
      const config = getVaultByKey(vaultState.key);

      // TVL
      const tvlAsBigInt = BigInt(vaultState.tvl);
      const tvlInUsdAsBigInt = (tvlAsBigInt * BigInt(ethPrice)) / BigInt(1e18);
      const tvlInUsd = tvlInUsdAsBigInt / BigInt(1e8);
      const formattedTvlInUsd = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(Number(tvlInUsd));

      // APY
      const formattedApy = `${vaultState.apy.toFixed(2)}%`;

      // Benefits
      const benefits = vaultGroupsConfig[vaultGroup as VaultGroup].benefits;

      // Rewards count
      const rewardsCount = config.points.length;

      return {
        key: vaultState.key,
        tvl: formattedTvlInUsd,
        apy: formattedApy,
        benefits,
        rewardsCount,
        points: config.points,
      };
    });
  }, [ethPrice, vaultGroup, vaultsState, initialVaultsData]);

  ///////////////////////////////
  // Effects for async operations
  ///////////////////////////////

  useEffect(() => {
    // Fetch and set vaults state
    async function fetchVaultsState() {
      try {
        setLoading(true);
        const vaults = vaultGroupsConfig[vaultGroup as VaultGroup].vaults;
        const promises = vaults.map(async (vaultKey) => {
          const apy = await ApyService.getApyByVault(vaultKey);
          const tvl = await TvlService.getTvlByVault(vaultKey);
          return {
            key: vaultKey,
            tvl: tvl.toString(),
            apy: apy,
          };
        });
        const rawVaultsState = await Promise.all(promises);
        setVaultsState(rawVaultsState);
      } catch (error) {
        console.error(error);
        setError(error as string);
      } finally {
        setLoading(false);
      }
    }
    fetchVaultsState();

    // Fetch and set ETH price state
    async function fetchEthPrice() {
      try {
        const price = await getEthPrice({ chain: mainnet });
        setEthPrice(price.toString());
      } catch (error) {
        console.error(error);
        setError(error as string);
      }
    }
    fetchEthPrice();
  }, [vaultGroup]);

  return {
    vaultsData,
    totalTvl,
    loading,
    error,
  };
}
