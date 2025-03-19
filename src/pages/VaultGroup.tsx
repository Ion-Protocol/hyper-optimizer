import { RewardsTooltip } from "@/components/RewardsTooltip";
import { OptimizerCard } from "@/components/OptimizerCard";
import { Skeleton } from "@/components/ui/skeleton";
import { VaultKey } from "@molecularlabs/nucleus-frontend";
import { ArrowLeft, CoinsIcon, Lock } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useVaultGroup } from "../hooks/useVaultGroup";

export function VaultGroup() {
  const { vaultGroup } = useParams();
  const navigate = useNavigate();
  const { vaultsData, totalTvl, loading } = useVaultGroup();

  function handleClickVault(vault: VaultKey) {
    navigate(`/vault-group/${vaultGroup}/${vault}`);
  }

  function handleClickBack() {
    navigate(`/`);
  }

  return (
    <div>
      {/* Back button */}
      <button
        onClick={handleClickBack}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[#DFDFDF] rounded-lg h-[48px] mt-6 transition-colors hover:border-[#BEBEBE] hover:bg-[#F7F7F7] active:border-[#A0A0A0] active:bg-[#EFEFEF]"
      >
        <ArrowLeft size={20} />
        <span className="text-sm">Back to Dashboard</span>
      </button>

      {/* Title and Total Value Locked Section */}
      <div className="flex justify-between items-center gap-8 mt-4">
        <div className="flex flex-col">
          <h1 className="text-[40px] font-semibold">{vaultGroup} Ecosystem Optimizers</h1>
          <p className="text-gray-600 text-[20px]">
            Deposit your {vaultGroup} into an optimizer to deploy them in the Hemi ecosystem
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#DFDFDF]">
          <div className="flex flex-col gap-1">
            {loading ? (
              <>
                <div className="flex flex-col items-center">
                  <Lock className="text-gray-600 mb-3" size={20} />
                  <Skeleton className="h-[32px] w-[180px]" />
                </div>
                <span className="text-gray-600">Total Value Locked</span>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center">
                  <Lock className="text-gray-600 mb-3" size={20} />
                  <span className="text-2xl font-semibold">{totalTvl}</span>
                </div>
                <span className="text-gray-600">Total Value Locked</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Vault Cards Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-8 mt-8">
        {vaultsData.map((vault) => (
          <OptimizerCard
            key={vault.key}
            vaultKey={vault.key}
            title={vault.key}
            subtitle={`${vaultGroup} leveraged looping`}
            tvl={vault.tvl}
            apy={vault.apy}
            loading={loading}
            onClickAction={() => handleClickVault(vault.key)}
            actionText="Deposit"
            actionIcon={CoinsIcon}
            tertiaryMetric={{
              label: "Benefits",
              value: (
                <RewardsTooltip
                  rewardsCount={vault.rewardsCount}
                  apy={vault.apy}
                  vaultKey={vault.key}
                  points={vault.points}
                />
              ),
            }}
          />
        ))}
      </div>
    </div>
  );
}
