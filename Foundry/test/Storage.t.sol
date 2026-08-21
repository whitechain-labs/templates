// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Storage} from "../src/Storage.sol";

contract StorageTest is Test {
    Storage public store;

    function setUp() public {
        store = new Storage();
    }

    function test_StartsAtZero() public view {
        assertEq(store.retrieve(), 0);
    }

    function test_StoreAndRetrieve() public {
        store.store(42);
        assertEq(store.retrieve(), 42);
    }

    function testFuzz_StoreAndRetrieve(uint256 x) public {
        store.store(x);
        assertEq(store.retrieve(), x);
    }
}
