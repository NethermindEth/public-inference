import { useState } from "react";
import { Address } from "./scaffold-eth";
import { parseEther } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface ProjectCardProps {
  id: number;
  creator: `0x${string}`;
  title: string;
  description: string;
  fundingGoal: bigint;
  deadline: bigint;
  currentFunding: bigint;
  isActive: boolean;
  ipfsCid?: string;
  prompt?: string;
}

const formatDate = (timestamp: bigint) => {
  return new Date(Number(timestamp) * 1000).toLocaleDateString();
};

const formatEth = (wei: bigint) => {
  return Number(wei) / 1e18;
};

export const ProjectCard = ({
  id,
  creator,
  title,
  description,
  fundingGoal,
  deadline,
  currentFunding,
  isActive,
  ipfsCid,
  prompt,
}: ProjectCardProps) => {
  const [contributionAmount, setContributionAmount] = useState("");
  const [isContributing, setIsContributing] = useState(false);

  const { writeContractAsync: contributeAsync } = useScaffoldWriteContract("PublicInference");

  const handleContribute = async () => {
    if (!contributionAmount) return;

    try {
      setIsContributing(true);
      await contributeAsync({
        functionName: "contribute",
        args: [BigInt(id)],
        value: parseEther(contributionAmount),
      });
      setContributionAmount("");
    } catch (error) {
      console.error("Error contributing to project:", error);
    } finally {
      setIsContributing(false);
    }
  };

  const remainingTime = Number(deadline) * 1000 - Date.now();
  const isExpired = remainingTime <= 0;

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        <p className="text-sm text-gray-500 mb-2">
          Created by: <Address address={creator} />
        </p>
        <p className="mb-4">{description}</p>
        {ipfsCid && (
          <div className="mt-2">
            <span className="text-sm font-semibold">Workflow CID: </span>
            <span className="text-sm font-mono break-all">{ipfsCid}</span>
          </div>
        )}
        {prompt && (
          <div className="mt-2">
            <span className="text-sm font-semibold">Compute Prompt: </span>
            <div className="text-sm mt-1 bg-base-300 p-2 rounded-lg">{prompt}</div>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Funding Goal:</span>
            <span>{formatEth(fundingGoal)} ETH</span>
          </div>
          <div className="flex justify-between">
            <span>Current Funding:</span>
            <span>{formatEth(currentFunding)} ETH</span>
          </div>
          <div className="flex justify-between">
            <span>Deadline:</span>
            <span>{formatDate(deadline)}</span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={Number(currentFunding)}
            max={Number(fundingGoal)}
          ></progress>
          {!isExpired && (
            <div className="text-sm text-gray-500">
              Time remaining: {Math.ceil(remainingTime / (1000 * 60 * 60 * 24))} days
            </div>
          )}
        </div>
        {/* {isActive && !isExpired && ( */}
        <div className="card-actions flex-col mt-4">
          <div className="flex w-full gap-2">
            <input
              type="number"
              placeholder="Amount in ETH"
              className="input input-bordered flex-grow"
              value={contributionAmount}
              onChange={e => setContributionAmount(e.target.value)}
              min="0"
              step="0.01"
            />
            <button
              className={`btn btn-primary ${isContributing ? "loading" : ""}`}
              onClick={handleContribute}
              disabled={isContributing || !contributionAmount}
            >
              {isContributing ? "Contributing..." : "Contribute"}
            </button>
          </div>
        </div>
        {/* )} */}
        {isExpired && <div className="text-sm text-error mt-2">Project funding period has ended</div>}
      </div>
    </div>
  );
};
