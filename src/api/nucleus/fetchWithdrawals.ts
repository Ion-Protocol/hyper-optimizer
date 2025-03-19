import { Address } from "viem";

export type OrderStatus = "pending" | "fulfilled" | "cancelled" | "expired";

export interface Order {
  id: number;
  user: Address;
  offer_token: Address;
  want_token: Address;
  amount: string;
  deadline: string;
  atomic_price: string;
  created_timestamp: string;
  ending_timestamp: string;
  created_log_index: number;
  created_transaction_index: number;
  created_block_number: string;
  ending_log_index: number | null;
  ending_transaction_index: number | null;
  ending_block_number: string | null;
  status: OrderStatus;
  queue_address: string;
  chain_id: number;
  offer_amount_spent: string;
  want_amount_rec: string;
  created_transaction_hash: string;
  ending_transaction_hash: string | null;
}

export type WithdrawalParams = {
  user: Address;
  vaultAddress?: Address;
  chainId?: number;
  status?: OrderStatus | "all";
  all?: boolean;
  page?: number;
  limit?: number;
};

const BACKEND_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL;

export async function fetchWithdrawals({
  user,
  vaultAddress,
  chainId,
  status = "all",
  all = true,
  page,
  limit,
}: WithdrawalParams): Promise<Order[]> {
  const params = new URLSearchParams();
  params.append("user", user);
  if (vaultAddress) params.append("vault_address", vaultAddress);
  if (chainId) params.append("chain_id", chainId.toString());
  if (status) params.append("status", status);
  if (all) params.append("all", all.toString());
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());

  const response = await fetch(`${BACKEND_URL}/v1/protocol/withdrawals?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
