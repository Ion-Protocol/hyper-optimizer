import { useWithdrawals } from "../hooks/useWithdrawals";
import { ArrowUpRight } from "lucide-react";

export function Withdrawals() {
  const { withdrawals } = useWithdrawals();

  return (
    <div>
      <div className="container mx-auto">
        <h1 className="text-[#1f180f] text-3xl font-bold mb-6">Your transactions</h1>

        <div
          className="border border-[#dfdfdf] rounded-2xl overflow-hidden"
          style={{ maxHeight: "800px", overflowY: "auto" }}
        >
          <div className="sticky top-0 bg-white grid grid-cols-4 p-6 border-b border-[#dfdfdf]">
            <div className="text-[#7b7b7b] font-medium">Type</div>
            <div className="text-[#7b7b7b] font-medium">Status</div>
            <div className="text-[#7b7b7b] font-medium">Date & time</div>
            <div className="text-[#7b7b7b] font-medium text-right">Amount</div>
          </div>

          {withdrawals.length === 0 ? (
            <div className="p-[75px] flex items-center justify-center">
              <span className="text-[#7b7b7b] text-base font-normal leading-[130%] tracking-[-0.02em]">
                You haven't made any transactions yet.
              </span>
            </div>
          ) : (
            withdrawals.map((withdrawal, index) => (
              <div key={index} className="grid grid-cols-4 p-6 border-b border-[#dfdfdf]">
                <div className="flex items-center gap-1 text-[#1f180f] font-medium">
                  Withdrawal <ArrowUpRight className="h-4 w-4 inline" />
                </div>
                <div className="flex items-center">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      withdrawal.status === "Completed" ? "bg-[#00827b]" : "bg-[#dfdfdf]"
                    } mr-2`}
                  ></div>
                  <span className="text-[#1f180f]">{withdrawal.status}</span>
                </div>
                <div>
                  <div className="text-[#1f180f]">{withdrawal.date}</div>
                  <div className="text-[#7b7b7b]">{withdrawal.time}</div>
                </div>
                <div className="text-right">
                  <div className="text-[#1f180f] font-medium">
                    {withdrawal.amount} {withdrawal.vaultAssetSymbol}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
