import { useState } from "react";
import { X, EyeOff } from "lucide-react";

interface TransactionErrorModalProps {
  error: string;
  onClose: () => void;
  activeTab: string;
}

export function TransactionErrorModal({ error, onClose, activeTab }: TransactionErrorModalProps) {
  const [showDetails, setShowDetails] = useState(true);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-3xl bg-[#ffffff] shadow-lg max-h-[600px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[#dfdfdf] p-6 relative">
          <div className="flex flex-col items-center">
            <h2 className="text-[24px] font-bold text-[#1f180f]">Error</h2>
            <button onClick={onClose} className="absolute right-6 top-6 rounded-full p-1 hover:bg-[#dfdfdf]/50">
              <X className="h-6 w-6 text-[#4d4d4d]" />
            </button>
          </div>
          <p className="mt-2 text-center text-[16px] text-[#7b7b7b]">There was an error with this transaction</p>
        </div>

        {showDetails && (
          <div className="p-6 overflow-auto">
            <div className="rounded-lg bg-[#353535] p-6 text-[#ffffff]">
              <div className="mb-4">
                <div className="text-[16px] font-medium">
                  {activeTab === "deposit" ? "Deposit failed" : "Withdraw failed"}
                </div>
                <div className="text-[16px] break-words overflow-auto max-h-[200px]">{error}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 p-6 mt-auto">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-[#ff6c15] py-4 text-center text-[16px] font-medium text-white"
          >
            Close
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#dfdfdf] py-4 text-[16px] font-medium text-[#4d4d4d]"
          >
            <EyeOff className="h-5 w-5" />
            {showDetails ? "Hide" : "Show"} details
          </button>
        </div>
      </div>
    </div>
  );
}
