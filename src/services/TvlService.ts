import { VaultKey, getRate, getTotalSupply, getVaultByKey } from "@molecularlabs/nucleus-frontend";
import { Chain } from "viem";
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
    const vaultAddress = vaultConfig.contracts.boringVault;
    const totalSupply = await getTotalSupply({ tokenAddress: vaultAddress, chain });
    return totalSupply;
  }

  /**
   * Internal helper function: Get the share rate for a vault on the mainnet.
   */
  private static async getShareRateByVault(vaultKey: VaultKey) {
    const vaultConfig = getVaultByKey(vaultKey);
    const accountantAddress = vaultConfig.contracts.accountant;
    const rate = await getRate({ accountantAddress, chain: vaultConfig.chain as Chain });
    return rate;
  }

  /**
   * Internal helper function: Get the total supply for a vault across all chains.
   */
  private static async getTotalSupplyByVault(vaultKey: VaultKey) {
    const vaultConfig = getVaultByKey(vaultKey);
    const totalSupply = await this.getTotalSupplyByVaultAndChain(vaultKey, vaultConfig.chain as Chain);
    return totalSupply;
  }

  /**
   * Public function: Get the TVL for a vault by multiplying the total supply by the share rate.
   */
  public static async getTvlByVault(vaultKey: VaultKey) {
    const vaultTotalSupply = await this.getTotalSupplyByVault(vaultKey);
    console.log(vaultKey, vaultTotalSupply);
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
