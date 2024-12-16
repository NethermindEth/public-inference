//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import {DeployYourContract} from "./DeployYourContract.s.sol";
import {DeployPublicInference} from "./DeployPublicInference.s.sol";

contract DeployScript is ScaffoldETHDeploy {
    function run() external {
        // deploy more contracts here
        DeployPublicInference deployPublicInference = new DeployPublicInference();
        deployPublicInference.run();
    }
}
