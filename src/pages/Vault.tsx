import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { DepositWithdraw } from "../components/DepositWithdraw";
import { Withdrawals } from "../components/Withdrawals";
import { useNavigate, useParams } from "react-router-dom";

export function Vault() {
  const navigate = useNavigate();
  const { vaultGroup } = useParams();

  function handleClickBack() {
    navigate(`/vault-group/${vaultGroup}`);
  }

  return (
    <div>
      {/* Back button */}
      <button
        onClick={handleClickBack}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[#DFDFDF] rounded-lg h-[48px] my-6 transition-colors hover:border-[#BEBEBE] hover:bg-[#F7F7F7] active:border-[#A0A0A0] active:bg-[#EFEFEF]"
      >
        <ArrowLeft size={20} />
        <span className="text-sm">Back to Vaults</span>
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 p-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[#FF6C15]" />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-[#1f180f] text-[40px] font-normal">bfBTC Zerolend Leverage Optimizer</h1>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[#4d4d4d] text-[20px]">Automated staked BTC leverage looping</p>
            <CheckCircle2 className="w-6 h-6 text-[#008aff]" />
          </div>
        </div>
      </div>

      <DepositWithdraw />
      <div className="h-[100px]" />
      <Withdrawals />
    </div>
  );
}
