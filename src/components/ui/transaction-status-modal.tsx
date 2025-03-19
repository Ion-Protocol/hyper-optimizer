import { getTokenIcon, getVaultIcon } from "@/lib/getIcons";
import { VaultKey } from "@molecularlabs/nucleus-frontend";
import { X, RefreshCw, ArrowUpRight, Clock, CheckCircle } from "lucide-react";
import CoinsStacked from "@/assets/svgs/coins-stacked.svg";

type StepStatus = "idle" | "processing" | "done" | "error";

interface Step {
  id: string;
  label: string;
  status: StepStatus;
}

export interface TransactionStatusCardProps {
  /**
   * The steps to display in the card
   */
  steps: Step[];

  /**
   * The amount being sent
   */
  sendAmount?: string;

  /**
   * The amount being received
   */
  receiveAmount?: string;

  /**
   * The token being sent
   */
  sendToken: string;

  /**
   * The token being received
   */
  receiveToken: string;

  /**
   * Callback when the close button is clicked
   */
  onClose?: () => void;

  /**
   * Callback when the refresh button is clicked
   */
  onRefresh?: () => void;
}

export default function TransactionStatusModal({
  steps,
  sendAmount,
  receiveAmount,
  sendToken,
  receiveToken,
  onClose,
}: TransactionStatusCardProps) {
  // Check if all steps are done
  const allStepsDone = steps.every((step) => step.status === "done");

  // Helper function to render status indicator
  const renderStatusIndicator = (status: StepStatus) => {
    switch (status) {
      case "idle":
        return (
          <div className="flex items-center text-[#7b7b7b]">
            <Clock size={14} className="mr-1" />
            <span className="text-xs">Not Started</span>
          </div>
        );
      case "processing":
        return (
          <div className="flex items-center text-[#7b7b7b]">
            <div className="w-3 h-3 border-2 border-[#7b7b7b] border-t-transparent rounded-full animate-spin mr-1"></div>
            <span className="text-xs">Processing</span>
          </div>
        );
      case "done":
        return (
          <div className="flex items-center text-[#35715C]">
            <CheckCircle size={14} className="mr-1" />
            <span className="text-xs">Done</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center text-red-500">
            <X size={14} className="mr-1" />
            <span className="text-xs">Error</span>
          </div>
        );
    }
  };

  const TokenIcon = ({ symbol }: { symbol: string }) => {
    if (!symbol) return <div className="w-[52px] h-[52px] rounded-full bg-gray-200" />;

    const tokenIconSrc = getTokenIcon(symbol.toLowerCase());
    const iconSrc = tokenIconSrc || getVaultIcon(symbol.toLowerCase() as VaultKey);
    return iconSrc ? (
      <img src={iconSrc} alt={`${symbol} icon`} className="w-[52px] h-[52px] rounded-full" />
    ) : (
      <div className="w-[52px] h-[52px] rounded-full bg-gray-200" />
    );
  };

  return (
    <div className="w-[450px] border border-[#dfdfdf] rounded-lg overflow-hidden bg-white py-3">
      {/* Header */}
      <div className="p-4 relative">
        <button
          className="absolute right-4 top-4 text-[#7b7b7b] hover:text-[#4d4d4d] transition-colors"
          onClick={onClose}
        >
          <X size={16} />
        </button>
        <div className="text-center">
          <h3 className="text-[#1f180f] text-[24px] font-medium">{allStepsDone ? "Success" : "Order Status"}</h3>
          <p className="text-[#7b7b7b] text-[16px] mt-1">
            {allStepsDone ? "Your transaction was made with success" : "Transaction processing..."}
          </p>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="bg-white py-6 px-10 flex items-center justify-between">
        <div className="border bg-[#F8F8F8] border-[#dfdfdf] rounded-lg flex items-center justify-between w-full py-8 px-[60px]">
          <div className="flex items-center flex-col gap-2">
            <TokenIcon symbol={sendToken} />
            <span className="text-sm font-medium text-[#1f180f] whitespace-nowrap">
              -{sendAmount} {sendToken}
            </span>
          </div>

          <RefreshCw size={16} className={allStepsDone ? "" : "animate-spin"} />

          <div className="flex items-center flex-col gap-2">
            <TokenIcon symbol={receiveToken} />
            <span className="text-sm font-medium text-[#1f180f] whitespace-nowrap">+{receiveAmount}</span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-col">
        {steps.map((step) => (
          <div key={step.id} className="p-4 px-6 flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`flex justify-center items-center w-[32px] h-[32px] p-2 bg-[#DFDFDF] rounded-[100px] mr-2 ${
                  step.status === "idle" ? "opacity-50" : ""
                }`}
              >
                {step.status === "done" ? (
                  <CheckCircle size={20} className="text-black" />
                ) : step.label.toLowerCase().includes("deposit") ? (
                  <img src={CoinsStacked} alt="Deposit" className="w-4 h-4" />
                ) : (
                  <span className="w-4 h-4 border-2 border-black rounded-full"></span>
                )}
              </div>
              <span className="text-sm text-[#1f180f]">{step.label}</span>
              {step.status === "done" && <ArrowUpRight size={14} className="ml-1 text-[#7b7b7b]" />}
            </div>

            <div className="flex items-center">{renderStatusIndicator(step.status)}</div>
          </div>
        ))}
      </div>

      {/* Done Button */}
      {allStepsDone && (
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full h-[48px] bg-[#FF6C15] text-white rounded-lg font-medium hover:bg-[#FF6C15]/90 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
