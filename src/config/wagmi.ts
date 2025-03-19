import { getDefaultConfig, getDefaultWallets } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { bitgetWallet, ledgerWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClient } from "@tanstack/react-query";
import { mainnet, sei } from "viem/chains";
import { fallback, http } from "wagmi";

const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;
const MAINNET_CHAINSTACK_URL = import.meta.env.VITE_PUBLIC_MAINNET_CHAINSTACK_URL;
const SEI_RPC_URL = import.meta.env.VITE_PUBLIC_SEI_RPC_URL;

export const chains = [mainnet, sei] as const;

const { wallets } = getDefaultWallets();

export const wagmiConfig = getDefaultConfig({
  appName: "Optimizer",
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: chains,
  wallets: [
    ...wallets,
    {
      groupName: "Other",
      wallets: [bitgetWallet, ledgerWallet],
    },
  ],
  ssr: false,
  transports: {
    [mainnet.id]: fallback([http(MAINNET_CHAINSTACK_URL)]),
    [sei.id]: fallback([http(SEI_RPC_URL)]),
  },
});

export const queryClient = new QueryClient();

export type SupportedChainId = (typeof chains)[number]["id"];
