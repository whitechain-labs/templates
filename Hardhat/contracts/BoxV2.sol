// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BoxV1} from "./BoxV1.sol";

/// @notice Second implementation, used to prove that an upgrade keeps the
/// proxy address and its stored state while swapping the code.
/// Storage layout is inherited from BoxV1 and must only be appended to.
contract BoxV2 is BoxV1 {
    function increment() external {
        value += 1;
    }

    function version() external pure override returns (string memory) {
        return "v2";
    }
}
