// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {Storage} from "../src/Storage.sol";

contract DeployStorage is Script {
    function run() public {
        vm.startBroadcast();

        new Storage();

        vm.stopBroadcast();
    }
}
