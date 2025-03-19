import { Address } from "viem";

const BACKEND_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL;

interface RewardsAPYParams {
  tokenAddress: Address;
  blockNumber?: number;
  lookBackDays?: number;
}

interface RewardsAPYResponse {
  apy: number;
  error: string | null;
}

export async function fetchVaultAPY({
  tokenAddress,
  blockNumber,
  lookBackDays = 14,
}: RewardsAPYParams): Promise<RewardsAPYResponse> {
  const params = new URLSearchParams();
  params.append("token_address", tokenAddress);
  if (blockNumber) params.append("block_number", blockNumber.toString());
  if (lookBackDays) params.append("lookback_days", lookBackDays.toString());

  const response = await fetch(`${BACKEND_URL}/v1/vaults/apy?${params.toString()}`, {
    headers: {
      Accept: "application/json",
    },
    mode: "cors",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch APY data");
  }

  return response.json();
}
