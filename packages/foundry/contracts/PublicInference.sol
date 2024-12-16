// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PublicInference is Ownable(msg.sender), ReentrancyGuard {
    // Structs
    struct ComputeSpec {
        bytes32 ipfsCID;
    }

    struct Project {
        string title;
        string description;
        address creator;
        uint256 fundingGoal;
        uint256 currentFunding;
        uint256 deadline;
        bool funded;
        bool completed;
        ComputeSpec computeSpec;
        mapping(address => uint256) contributions;
    }

    // State variables
    mapping(uint256 => Project) public projects;
    uint256 public projectCount;
    uint256 public platformFee; // basis points (e.g., 250 = 2.5%)
    mapping(address => bool) public approvedComputeProviders;

    // Events
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed creator,
        uint256 fundingGoal
    );
    event ContributionMade(
        uint256 indexed projectId,
        address indexed contributor,
        uint256 amount
    );
    event ProjectFunded(uint256 indexed projectId, uint256 totalAmount);
    event ProjectCompleted(uint256 indexed projectId);
    event FundsRefunded(
        uint256 indexed projectId,
        address indexed contributor,
        uint256 amount
    );

    constructor(uint256 _platformFee) {
        platformFee = _platformFee;
    }

    // Core functions
    function createProject(
        string memory _title,
        string memory _description,
        uint256 _fundingGoal,
        uint256 _deadline,
        ComputeSpec memory _computeSpec
    ) external returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in future");
        require(_fundingGoal > 0, "Funding goal must be positive");

        uint256 projectId = projectCount++;
        Project storage project = projects[projectId];

        project.title = _title;
        project.description = _description;
        project.creator = msg.sender;
        project.fundingGoal = _fundingGoal;
        project.deadline = _deadline;
        project.computeSpec = _computeSpec;

        emit ProjectCreated(projectId, msg.sender, _fundingGoal);
        return projectId;
    }

    function contribute(uint256 _projectId) external payable nonReentrant {
        Project storage project = projects[_projectId];

        require(
            block.timestamp < project.deadline,
            "Project funding period ended"
        );
        require(!project.funded, "Project already funded");
        require(msg.value > 0, "Must contribute something");

        project.contributions[msg.sender] += msg.value;
        project.currentFunding += msg.value;

        emit ContributionMade(_projectId, msg.sender, msg.value);

        if (project.currentFunding >= project.fundingGoal) {
            project.funded = true;
            emit ProjectFunded(_projectId, project.currentFunding);
        }
    }

    function requestRefund(uint256 _projectId) external nonReentrant {
        Project storage project = projects[_projectId];
        require(block.timestamp > project.deadline, "Project still active");
        require(!project.funded, "Project was successfully funded");

        uint256 contributionAmount = project.contributions[msg.sender];
        require(contributionAmount > 0, "No contribution found");

        project.contributions[msg.sender] = 0;
        project.currentFunding -= contributionAmount;

        (bool sent, ) = msg.sender.call{value: contributionAmount}("");
        require(sent, "Failed to send refund");

        emit FundsRefunded(_projectId, msg.sender, contributionAmount);
    }

    // Compute Provider Management
    function addComputeProvider(address _provider) external onlyOwner {
        approvedComputeProviders[_provider] = true;
    }

    function removeComputeProvider(address _provider) external onlyOwner {
        approvedComputeProviders[_provider] = false;
    }

    // Project Execution
    function executeProject(uint256 _projectId) external {
        require(approvedComputeProviders[msg.sender], "Not approved provider");
        Project storage project = projects[_projectId];
        require(project.funded, "Project not funded");
        require(!project.completed, "Project already completed");

        // Here we would implement the logic to:
        // 1. Transfer funds to compute provider
        // 2. Initiate compute job
        // 3. Handle results

        project.completed = true;
        emit ProjectCompleted(_projectId);
    }

    // View functions
    function getProject(
        uint256 _projectId
    )
        external
        view
        returns (
            string memory title,
            string memory description,
            address creator,
            uint256 fundingGoal,
            uint256 currentFunding,
            uint256 deadline,
            bool funded,
            bool completed
        )
    {
        Project storage project = projects[_projectId];
        return (
            project.title,
            project.description,
            project.creator,
            project.fundingGoal,
            project.currentFunding,
            project.deadline,
            project.funded,
            project.completed
        );
    }

    function getContribution(
        uint256 _projectId,
        address _contributor
    ) external view returns (uint256) {
        return projects[_projectId].contributions[_contributor];
    }
}
