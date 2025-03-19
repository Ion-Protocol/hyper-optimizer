import { useCallback } from "react";
import { useAccount } from "wagmi";
import { switchChain } from "wagmi/actions";
import { wagmiConfig } from "../config/wagmi";

export const useChainManagement = () => {
  const { chainId } = useAccount();

  const switchToChain = useCallback(async (targetChainId: number) => {
    try {
      await switchChain(wagmiConfig, { chainId: targetChainId as 1 | 1329 });
    } catch (error) {
      console.error(error);
    }
  }, []);

  return {
    switchToChain,
    currentChainId: chainId,
  };
};
