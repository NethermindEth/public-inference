// packages/monitor/src/types.ts
import { GetContractReturnType } from "viem";
import deployedContracts from "@public-inference/nextjs/contracts/deployedContracts";

// Get the ABI type from deployed contracts
export type PublicInferenceAbi =
  (typeof deployedContracts)[31337]["PublicInference"]["abi"];

// Contract instance type
export type PublicInferenceContract = GetContractReturnType<PublicInferenceAbi>;
