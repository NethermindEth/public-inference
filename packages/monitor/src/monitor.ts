// packages/monitor/src/monitor.ts
import { createPublicClient, http, parseAbiItem } from "viem";
import { hardhat } from "viem/chains";
import deployedContracts from "@public-inference/nextjs/contracts/deployedContracts";
import type { PublicInferenceAbi } from "./types";

export class Monitor {
  private publicClient;
  private isRunning = false;
  private readonly abi: PublicInferenceAbi;

  constructor(private config: { contractAddress: string; rpcUrl: string }) {
    this.publicClient = createPublicClient({
      chain: hardhat,
      transport: http(config.rpcUrl),
    });

    this.abi = deployedContracts[31337]["PublicInference"]["abi"];
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log("Monitor started");

    // Watch for ProjectFunded events with type safety
    const unwatch = this.publicClient.watchContractEvent({
      address: this.config.contractAddress as `0x${string}`,
      abi: this.abi,
      eventName: "ProjectFunded",
      onLogs: async (logs) => {
        for (const log of logs) {
          const projectId = log.args.projectId;
          const totalAmount = log.args.totalAmount;

          console.log(`Project ${projectId} funded with ${totalAmount} wei`);
          await this.handleFundedProject(projectId!);
        }
      },
    });

    // Clean up on stop
    return () => unwatch();
  }

  private async handleFundedProject(projectId: bigint) {
    try {
      console.log("Reading project with ID:", projectId.toString());

      // First try to get the project count to verify range
      const count = await this.publicClient.readContract({
        address: this.config.contractAddress as `0x${string}`,
        abi: this.abi,
        functionName: "projectCount",
      });

      console.log("Total projects:", count.toString());

      if (projectId >= count) {
        console.error("Project ID out of range");
        return;
      }

      const project = (await this.publicClient.readContract({
        address: this.config.contractAddress as `0x${string}`,
        abi: this.abi,
        functionName: "getProject",
        args: [projectId],
      })) as any;

      console.log("Raw contract response:", project);

      // Destructure the response to see what we get
      const [
        title,
        description,
        creator,
        fundingGoal,
        currentFunding,
        deadline,
        funded,
        completed,
      ] = project;

      console.log("Project details:", {
        title,
        description,
        creator,
        fundingGoal: fundingGoal.toString(),
        currentFunding: currentFunding.toString(),
        deadline: deadline.toString(),
        funded,
        completed,
      });
    } catch (error: any) {
      console.error(`Error handling funded project ${projectId}:`, {
        error: error.message,
        cause: error.cause?.message,
        details: error.details,
        data: error.data,
      });
    }
  }
}
