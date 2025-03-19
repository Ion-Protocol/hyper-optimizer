import { getVaultByKey, VaultKey } from "@molecularlabs/nucleus-frontend";
import { mainnet } from "viem/chains";
import { vaultGroupsConfig } from "../config/vaultGroupsConfig";
import { VaultGroup } from "../types";
import { fetchVaultAPY } from "../api/nucleus/fetchVaultAPY";

export class ApyService {
  // Private constructor to prevent instantiation.
  private constructor() {}

  /**
   * Get the APY for a vault by fetching it from the API
   * @param vaultKey - The key of the vault to get the APY for
   * @returns The APY for the vault
   */
  static async getApyByVault(vaultKey: VaultKey) {
    const vaultConfig = getVaultByKey(vaultKey);
    const { apy } = await fetchVaultAPY({
      tokenAddress: vaultConfig.token.addresses[mainnet.id as keyof typeof vaultConfig.token.addresses] ?? "0x",
    });
    return apy;
  }

  /**
   * Get the APY for a vault group by getting the highest APY of any of the vaults in the group
   * @param vaultGroup - The key of the vault group to get the APY for
   * @returns The APY for the vault group
   */
  static async getApyByVaultGroup(vaultGroup: VaultGroup) {
    const vaultGroupConfig = vaultGroupsConfig[vaultGroup];
    const vaultApys = await Promise.all(
      vaultGroupConfig.vaults.map(async (vaultKey) => {
        const apy = await this.getApyByVault(vaultKey);
        return apy;
      })
    );

    // The APY for a vault group is the highest APY of any of the vaults in the group
    const vaultGroupApy = Math.max(...vaultApys);
    return vaultGroupApy;
  }
}
