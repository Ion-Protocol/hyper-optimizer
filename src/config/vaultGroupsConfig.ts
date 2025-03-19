import { VaultGroupsConfig, VaultGroup } from "../types";

export const vaultGroupsConfig: VaultGroupsConfig = {
  [VaultGroup.GroupOne]: {
    name: "Group 1",
    vaults: ["bobaeth", "sseth", "feth"],

    // Sample data
    benefits: {
      multipliers: [
        {
          token: "eth",
          value: 3,
        },
        {
          token: "btc",
          value: 1.5,
        },
      ],
      tokens: [
        {
          token: "mkr",
          value: 128.2,
        },
        {
          token: "tel",
          value: 67.9,
        },
        {
          token: "uni",
          value: 48.6,
        },
        {
          token: "ren",
          value: 48.6,
        },
      ],
    },
  },
};
