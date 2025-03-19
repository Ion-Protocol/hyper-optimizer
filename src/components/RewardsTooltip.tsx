import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { VaultKey } from "@molecularlabs/nucleus-frontend";
import { Telescope } from "lucide-react";
import { getVaultIcon } from "@/lib/getIcons";
import diamond from "@/assets/svgs/icons/diamond.svg";

interface RewardsTooltipProps {
  rewardsCount: number;
  apy: string;
  vaultKey: string;
  points: {
    key: VaultKey;
    name: string;
    multiplier: number;
  }[];
}

export function RewardsTooltip({ rewardsCount, apy, vaultKey, points }: RewardsTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <span className="flex items-center justify-center px-2 py-1 text-[20px] font-sm text-[#1F180F] cursor-pointer rounded-[50px] bg-[#F8F8F8] border border-transparent hover:border-[#FF6C15] transition-colors whitespace-nowrap hover:bg-[linear-gradient(113.03deg,#FFC09A_14.91%,#FFDCC7_40.18%,#FFF8F3_40.88%,#FFDCC7_55.61%,#FFDCC7_57.72%,#FFC09A_85.09%)]">
            <img src={diamond} alt="diamond" className="w-5 h-5 mr-1" />
            {rewardsCount} {rewardsCount === 1 ? "Reward" : "Rewards"}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="w-[300px] p-0 bg-transparent border-none">
          <div className="max-w-sm rounded-3xl bg-white p-6 shadow-lg border border-[#DFDFDF]">
            <div className="space-y-6">
              <div className="p-2 rounded-lg bg-[#FAFAFA]">
                <h2 className="mb-4 text-base font-medium text-gray-900">Default Yield</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getVaultIcon(vaultKey as VaultKey) && (
                        <img src={getVaultIcon(vaultKey as VaultKey) || ""} alt={vaultKey} className="h-8 w-8" />
                      )}
                      <span className="text-sm text-gray-600">{vaultKey}</span>
                    </div>
                    <span className="text-sm font-medium text-orange-600">{apy}</span>
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-[#FAFAFA]">
                <h2 className="mb-4 text-base font-medium text-gray-900">Multipliers</h2>
                <div className="space-y-3">
                  {points.map((point) => (
                    <div key={point.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full bg-orange-600`} />
                        <span className="text-sm text-gray-600">{point.name}</span>
                      </div>
                      <span className="text-sm font-medium text-orange-600">x{point.multiplier}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-xl pl-[1px]">
                <div className="relative w-full h-[40px] overflow-hidden rounded-lg">
                  <div className="absolute w-[500px] h-[400px] top-1/2 left-[45%] -translate-x-1/2 -translate-y-1/2">
                    <div
                      className="absolute inset-0 rounded-full animate-spin-reverse-slow"
                      style={{
                        background: "conic-gradient(from 0deg, #FF6C15, transparent 50%)",
                      }}
                    />
                  </div>

                  <div className="absolute inset-[2px] bg-white rounded-lg border border-[#DFDFDF] ">
                    <div className="flex h-full items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <Telescope className="h-5 w-5 text-orange-600" />
                        <span className="text-sm font-medium text-gray-900">Net APY</span>
                      </div>
                      <span className="text-sm font-medium text-orange-600">9.92%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
