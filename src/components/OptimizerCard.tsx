import { VaultKey } from "@molecularlabs/nucleus-frontend";
import { LucideIcon } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { getVaultIcon } from "@/lib/getIcons";

interface OptimizerCardProps {
  vaultKey?: VaultKey;
  title: string;
  subtitle: string;
  tvl: string;
  apy: string;
  loading: boolean;
  onClickAction: () => void;
  actionText?: string;
  actionIcon?: LucideIcon;
  tertiaryMetric: {
    label: string;
    value: React.ReactNode;
  };
}

export function OptimizerCard({
  vaultKey,
  title,
  subtitle,
  tvl,
  apy,
  loading,
  onClickAction,
  actionText = "Explore",
  actionIcon: ActionIcon,
  tertiaryMetric,
}: OptimizerCardProps) {
  const VaultIcon = getVaultIcon(vaultKey);

  return (
    <div className="flex flex-col items-start p-5 gap-6 w-full bg-white border border-[#DFDFDF] rounded-[18px] max-w-[600px]">
      {/* Header Section */}
      <div className="flex flex-col gap-4 w-[219px]">
        {/* Icon */}
        {VaultIcon ? (
          <img src={VaultIcon} alt={title} className="h-12 w-12" />
        ) : (
          <div className="w-12 h-12 bg-[#FF6C15] rounded-[9.39px]" />
        )}

        {/* Title and Subtitle */}
        <div className="flex flex-col">
          <h3 className="text-2xl font-medium leading-[120%] tracking-[-0.02em] text-[#1F180F] m-0">{title}</h3>
          <p className="font-inter text-lg font-normal leading-[130%] tracking-[-0.02em] text-[#4D4D4D] m-0">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex flex-row gap-3 w-full">
        {/* TVL */}
        <div className="flex-1">
          <p className="text-[#7B7B7B] text-sm mb-[14px] m-0">TVL</p>
          {loading ? (
            <Skeleton className="h-[28px] w-[120px]" />
          ) : (
            <p className="text-xl font-medium text-[#1F180F] m-0">{tvl}</p>
          )}
        </div>

        {/* APY */}
        <div className="flex-1">
          <p className="text-[#7B7B7B] text-sm mb-[14px] m-0">APY</p>
          {loading ? (
            <Skeleton className="h-[28px] w-[80px]" />
          ) : (
            <p className="text-xl font-medium m-0 bg-gradient-to-r from-[#CF5711] to-[#6E2E09] bg-clip-text text-transparent">
              {apy}
            </p>
          )}
        </div>

        {/* Tertiary Metric (Protocols or Rewards) */}
        <div className="flex-1">
          <p className="text-[#7B7B7B] text-sm mb-1.5 m-0">{tertiaryMetric.label}</p>
          {tertiaryMetric.value}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onClickAction}
        className="w-full py-3 px-4 bg-white border border-[#DFDFDF] rounded-lg flex items-center justify-center gap-2 cursor-pointer font-inter text-base text-[#1F180F] transition-colors hover:border-[#BEBEBE] hover:bg-[#F7F7F7] active:border-[#A0A0A0] active:bg-[#EFEFEF]"
      >
        {ActionIcon && <ActionIcon className="h-4 w-4" />}
        {actionText}
      </button>
    </div>
  );
}
