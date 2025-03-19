import { VaultKey, getRate, getTotalSupply, getVaultByKey } from "@molecularlabs/nucleus-frontend";
import { Chain } from "viem";
import { mainnet } from "viem/chains";
import { vaultGroupsConfig } from "../config/vaultGroupsConfig";
import { VaultGroup } from "../types";

export class TvlService {
  // Private constructor to prevent instantiation.
  private constructor() {}

  /**
   * Internal helper function: Get the total supply for a vault on a specific chain.
   */
  private static async getTotalSupplyByVaultAndChain(vaultKey: VaultKey, chain: Chain) {
    const vaultConfig = getVaultByKey(vaultKey);
    const vaultAddress = vaultConfig.token.addresses[chain.id as keyof typeof vaultConfig.token.addresses] ?? "0x";
    const totalSupply = await getTotalSupply({ tokenAddress: vaultAddress, chain });
    return totalSupply;
  }

  /**
   * Internal helper function: Get the share rate for a vault on the mainnet.
   */
  private static async getShareRateByVault(vaultKey: VaultKey) {
    const vaultConfig = getVaultByKey(vaultKey);
    const accountantAddress = vaultConfig.contracts.accountant;
    const rate = await getRate({ accountantAddress, chain: mainnet });
    return rate;
  }

  /**
   * Internal helper function: Get the total supply for a vault across all chains.
   */
  private static async getTotalSupplyByVault(vaultKey: VaultKey) {
    const vaultConfig = getVaultByKey(vaultKey);
    const chains = Object.values(vaultConfig.deposit.sourceChains);
    const promises = chains.map((chain) => this.getTotalSupplyByVaultAndChain(vaultKey, chain));
    const results = await Promise.all(promises);
    return results.reduce((acc, supply) => acc + supply, BigInt(0));
  }

  /**
   * Public function: Get the TVL for a vault by multiplying the total supply by the share rate.
   */
  public static async getTvlByVault(vaultKey: VaultKey) {
    const vaultTotalSupply = await this.getTotalSupplyByVault(vaultKey);
    const vaultShareRate = await this.getShareRateByVault(vaultKey);
    const tvl = (vaultTotalSupply * vaultShareRate) / BigInt(1e18);
    return tvl;
  }

  /**
   * Public function: Get the TVL for a vault group by summing the TVLs of all vaults in the group.
   */
  public static async getTvlByVaultGroup(vaultGroup: VaultGroup) {
    const vaultGroupConfig = vaultGroupsConfig[vaultGroup];
    const vaultTvls = await Promise.all(vaultGroupConfig.vaults.map((vaultKey) => this.getTvlByVault(vaultKey)));
    const totalTvl = vaultTvls.reduce((acc, tvl) => acc + tvl, BigInt(0));
    return totalTvl;
  }
}
