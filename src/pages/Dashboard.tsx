import { useNavigate } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboard";
import { VaultGroup } from "../types";
import { X, Map as MapIcon, Lock } from "lucide-react";
import dashboardMaskGroup from "../assets/dashboard-mask-group.png";
import { useState } from "react";
import { OptimizerCard } from "../components/OptimizerCard";
import { Skeleton } from "@/components/ui/skeleton";

export function Dashboard() {
  const navigate = useNavigate();
  const { totalTvl, vaultGroupData, loading } = useDashboard();
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  function handleClickExplore(vaultGroup: VaultGroup) {
    navigate(`/vault-group/${vaultGroup}`);
  }

  function handleClickCloseBanner() {
    console.log("clicked");
    setIsBannerVisible(false);
  }

  return (
    <div>
      {/* Title and Total Value Locked */}
      <div className="flex justify-between items-center py-12 gap-8">
        <div className="flex flex-col">
          <h1 className="text-[40px] font-semibold">Hemi Ecosystem Optimizer</h1>
          <p className="text-gray-600 text-[20px]">
            Deposit your assets on Hemi into an optimizer to deploy them into Hemi DeFi protocols
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

      {/* Banner */}
      {isBannerVisible && (
        <div className="flex flex-col p-5 gap-6 bg-white border border-[#DFDFDF] rounded-[18px] relative">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2 flex-1">
              <h2 className="text-2xl font-semibold">How It Works</h2>
              <p className="text-gray-700 text-[18px] max-w-[50%]">
                Deposit assets from the Hemi ecosystem into managed vaults with just one click! The vaults will automate
                the deployment of deposits across the Hemi DeFi ecosystem to optimize their yield performance and
                collect rewards
              </p>
            </div>
            <button
              className="p-2 hover:bg-gray-100 rounded-full relative z-10"
              onClick={handleClickCloseBanner}
              type="button"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-gray-700 text-[16px]">
            <span>Base Asset Yield</span>
            <span>+</span>
            <span>DeFi Yield</span>
            <span>+</span>
            <span>Nucleus Points + Hemi Rewards</span>
          </div>

          <img
            src={dashboardMaskGroup}
            alt="Dashboard illustration"
            className="absolute top-0 right-0 h-full object-contain z-0"
          />
        </div>
      )}

      {/* Vault Groups Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-8 mt-8">
        {vaultGroupData.map((vaultGroup) => (
          <OptimizerCard
            key={vaultGroup.vaultGroupKey}
            title={vaultGroup.vaultGroupKey}
            subtitle={vaultGroup.vaultGroupKey}
            tvl={vaultGroup.tvl}
            apy={vaultGroup.apy}
            loading={loading}
            onClickAction={() => handleClickExplore(vaultGroup.vaultGroupKey)}
            actionIcon={MapIcon}
            tertiaryMetric={{
              label: "Protocols",
              value: <div className="flex items-center gap-1.5">{/* Protocol icons */}</div>,
            }}
          />
        ))}
      </div>
    </div>
  );
}
