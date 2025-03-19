import { VaultKey } from "@molecularlabs/nucleus-frontend";
import BobaEthIcon from "../assets/svgs/nucleus/bobaeth.svg";
import SSETHIcon from "../assets/svgs/nucleus/sseth.svg";
import FETHIcon from "../assets/svgs/nucleus/feth.svg";
import WethIcon from "../assets/svgs/tokens/weth.svg";
import EthIcon from "../assets/svgs/tokens/eth.svg";
import WstethIcon from "../assets/svgs/tokens/wsteth.svg";

// Add icon mapping
export const getVaultIcon = (vaultKey?: VaultKey) => {
  switch (vaultKey) {
    case "bobaeth":
      return BobaEthIcon;
    case "sseth":
      return SSETHIcon;
    case "feth":
      return FETHIcon;
    default:
      return null;
  }
};

export const getTokenIcon = (tokenSymbol?: string) => {
  switch (tokenSymbol) {
    case "weth":
      return WethIcon;
    case "eth":
      return EthIcon;
    case "wsteth":
      return WstethIcon;
    default:
      return null;
  }
};
