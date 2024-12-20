"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ProjectCard } from "~~/components/ProjectCard";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface Project {
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

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fundingGoal, setFundingGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [projectCount, setProjectCount] = useState<bigint | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ipfsCid, setIpfsCid] = useState("");
  const [prompt, setPrompt] = useState("");

  const { data: publicInferenceContract } = useScaffoldContract({
    contractName: "PublicInference",
  });

  const handleContribute = async (projectId: number) => {
    console.log("Contributing to project:", projectId);
  };

  const fetchProjectCount = useCallback(async () => {
    if (!publicInferenceContract) return;
    try {
      const count = await publicInferenceContract.read.projectCount();
      setProjectCount(count);
    } catch (error) {
      console.error("Error fetching project count:", error);
    }
  }, [publicInferenceContract]);

  const fetchProjects = useCallback(async () => {
    if (!publicInferenceContract || projectCount === null) return;

    if (projects.length === 0) {
      setIsLoading(true);
    }
    try {
      const projectsArray: Project[] = [];
      for (let i = 0; i < projectCount; i++) {
        const project = await publicInferenceContract.read.projects([BigInt(i)]);
        const [title, description, creator, fundingGoal, currentFunding, deadline, isActive, , computeSpec] = project;

        projectsArray.push({
          id: i,
          creator: creator as `0x${string}`,
          title,
          description,
          fundingGoal,
          deadline,
          currentFunding,
          isActive,
          ipfsCid: computeSpec.ipfsCID,
          prompt: computeSpec.prompt,
        });
      }
      setProjects(projectsArray);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  }, [publicInferenceContract, projectCount]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchProjectCount();
      fetchProjects();
    }, 5000);

    fetchProjectCount();
    fetchProjects();

    return () => clearInterval(intervalId);
  }, [fetchProjectCount, fetchProjects]);

  const { writeContractAsync: createProjectAsync } = useScaffoldWriteContract("PublicInference");

  const handleCreateProject = async () => {
    try {
      // Convert IPFS CID to bytes32
      let cidBytes32 = ipfsCid;
      if (!cidBytes32.startsWith("0x")) {
        cidBytes32 = "0x" + cidBytes32;
      }
      // Pad with zeros if necessary
      cidBytes32 = cidBytes32.padEnd(66, "0");

      await createProjectAsync({
        functionName: "createProject",
        args: [
          title,
          description,
          BigInt(fundingGoal),
          BigInt(deadline),
          {
            ipfsCID: cidBytes32 as `0x${string}`,
            prompt: prompt,
          },
        ],
      });

      setTimeout(() => {
        fetchProjectCount();
        fetchProjects();
      }, 2000);

      setTitle("");
      setDescription("");
      setFundingGoal("");
      setDeadline("");
      setIpfsCid("");
      setPrompt("");
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <div className="max-w-7xl w-full mt-16 px-5">
          <h2 className="text-3xl font-bold mb-8">Active Projects</h2>
          {isLoading ? (
            <div className="flex justify-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          )}
          {!isLoading && projects.length === 0 && (
            <div className="text-center py-10">
              <p className="text-xl">No projects found. Be the first to create one!</p>
            </div>
          )}
        </div>
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
              <label className="label">Deadline</label>
              <input
                type="datetime-local"
                className="input input-bordered w-full"
                value={deadline ? new Date(parseInt(deadline) * 1000).toISOString().slice(0, 16) : ""}
                onChange={e => {
                  const selectedDate = new Date(e.target.value);
                  const unixTimestamp = Math.floor(selectedDate.getTime() / 1000).toString();
                  setDeadline(unixTimestamp);
                }}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div>
              <label className="label">Workflow ID</label>
              {/* TODO: look up workflows to populate a dropdown */}
              <input
                type="text"
                className="input input-bordered w-full"
                value={ipfsCid}
                onChange={e => setIpfsCid(e.target.value)}
                placeholder="Enter ID for workflow"
              />
            </div>

            <div>
              <label className="label">Compute Prompt</label>
              <textarea
                className="textarea textarea-bordered w-full"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Enter the prompt for the compute job"
                rows={3}
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
