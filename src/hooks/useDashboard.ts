import { useEffect, useMemo, useState } from "react";
import { vaultGroupsConfig } from "../config/vaultGroupsConfig";
import { VaultGroup } from "../types";
import { TvlService } from "../services/TvlService";
import { ApyService } from "../services/ApyService";

export interface VaultGroupItem {
  vaultGroupKey: VaultGroup;
  tvl: string;
  apy: string;
  protocols: string[];
}

export function useDashboard() {
  //////////////////
  // Raw state
  //////////////////
  const [vaultGroupsState, setVaultGroupsState] = useState<{ key: VaultGroup; tvl: string; apy: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize vault group data with config values
  const initialVaultGroupData = useMemo(() => {
    return Object.entries(vaultGroupsConfig).map(([key, config]) => ({
      vaultGroupKey: key as VaultGroup,
      tvl: "Loading...",
      apy: "Loading...",
      protocols: config.vaults,
    }));
  }, []);

  //////////////////
  // Derived state
  //////////////////

  // Total TVL in USD: derived from the sum of the TVL values of all vault groups
  const totalTvl = useMemo(() => {
    const totalTvlAsBigInt = vaultGroupsState.reduce((acc, vault) => {
      return acc + BigInt(vault.tvl.toString());
    }, BigInt(0));
    const totalTvlInUsd = totalTvlAsBigInt / BigInt(1e8);
    const formattedTotalTvlInUsd = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(totalTvlInUsd));

    return formattedTotalTvlInUsd;
  }, [vaultGroupsState]);

  // Vault group data containing tvl values in usd and apy values
  const vaultGroupData = useMemo(() => {
    if (vaultGroupsState.length === 0) {
      return initialVaultGroupData;
    }

    return vaultGroupsState.map((vaultGroup) => {
      const protocols = vaultGroupsConfig[vaultGroup.key].vaults;

      // TVL calculation
      const tvlAsBigInt = BigInt(vaultGroup.tvl);
      const tvlInUsd = tvlAsBigInt / BigInt(1e8);
      const formattedTvlInUsd = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Number(tvlInUsd));

      // APY
      const formattedApy = `${vaultGroup.apy.toFixed(2)}%`;

      return {
        vaultGroupKey: vaultGroup.key,
        tvl: formattedTvlInUsd,
        apy: formattedApy,
        protocols: protocols,
      };
    });
  }, [vaultGroupsState, initialVaultGroupData]);

  ///////////////////////////////
  // Effects for async operations
  ///////////////////////////////
  useEffect(() => {
    // Fetch and set vault group state
    async function fetchVaultGroupState() {
      try {
        setLoading(true);
        const vaultGroups = Object.keys(vaultGroupsConfig) as VaultGroup[];
        const tvlPromises = vaultGroups.map(async (vaultGroup) => {
          const [tvl, apy] = await Promise.all([
            TvlService.getTvlByVaultGroup(vaultGroup),
            ApyService.getApyByVaultGroup(vaultGroup),
          ]);
          return {
            tvl: tvl.toString(),
            apy,
            key: vaultGroup,
          };
        });

        const rawVaultGroupData = await Promise.all(tvlPromises);
        setVaultGroupsState(rawVaultGroupData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchVaultGroupState();
  }, []);

  return {
    totalTvl,
    vaultGroupData,
    loading,
  };
}
