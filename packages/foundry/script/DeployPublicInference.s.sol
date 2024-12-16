//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/PublicInference.sol";
import "./DeployHelpers.s.sol";

contract DeployPublicInference is ScaffoldETHDeploy {
    // use `deployer` from `ScaffoldETHDeploy`
    function run() external ScaffoldEthDeployerRunner {
        PublicInference pubinf = new PublicInference(250);
        console.logString(
            string.concat(
                "PublicInference deployed at: ",
                vm.toString(address(pubinf))
            )
        );
    }
}
