import { Address } from "./scaffold-eth";

interface ProjectCardProps {
  id: number;
  creator: string;
  title: string;
  description: string;
  fundingGoal: bigint;
  deadline: bigint;
  currentFunding: bigint;
  isActive: boolean;
  onContribute?: (id: number) => void;
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
  onContribute,
}: ProjectCardProps) => {
  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        <p className="text-sm text-gray-500 mb-2">
          Created by: <Address address={creator} />
        </p>
        <p className="mb-4">{description}</p>
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
        </div>
        {isActive && (
          <div className="card-actions justify-end mt-4">
            <button className="btn btn-primary" onClick={() => onContribute?.(id)}>
              Contribute
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
