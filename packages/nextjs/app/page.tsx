"use client";

import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fundingGoal, setFundingGoal] = useState("");
  const [deadline, setDeadline] = useState("");

  // Get contract instance
  const { data: publicInferenceContract } = useScaffoldContract({
    contractName: "PublicInference",
  });

  // Read total projects
  const { data: projectCount } = useScaffoldContract({
    contractName: "PublicInference",
    functionName: "projectCount",
  });

  const handleCreateProject = async () => {
    if (!publicInferenceContract) return;

    try {
      const tx = await publicInferenceContract.createProject(
        title,
        description,
        fundingGoal ? BigInt(fundingGoal) : BigInt(0),
        deadline ? BigInt(deadline) : BigInt(0),
        { ipfsCID: "0x" }, // Default ComputeSpec
      );
      await tx.wait();

      // Clear form
      setTitle("");
      setDescription("");
      setFundingGoal("");
      setDeadline("");
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <h1 className="text-center">
          <span className="block text-4xl font-bold">Public Inference Platform</span>
        </h1>
        <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
          <p className="my-2 font-medium">Connected Address:</p>
          <Address address={connectedAddress} />
        </div>

        {/* Project Creation Form */}
        <div className="max-w-md mx-auto mt-8">
          <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Project Title</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                className="textarea textarea-bordered w-full"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Funding Goal (in ETH)</label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={fundingGoal}
                onChange={e => setFundingGoal(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Deadline (Unix Timestamp)</label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
            </div>
            <button className="btn btn-primary w-full" onClick={handleCreateProject}>
              Create Project
            </button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="mt-8 text-center">
          <p className="text-xl">Total Projects: {projectCount ? projectCount.toString() : "Loading..."}</p>
        </div>
      </div>

      <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
        <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
          <Link href="/debug" className="btn btn-primary">
            Debug Contracts
          </Link>
          <Link href="/blockexplorer" className="btn btn-primary">
            Block Explorer
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
