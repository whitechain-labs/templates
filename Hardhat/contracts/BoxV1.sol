// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/// @notice UUPS (EIP-1967) upgradeable implementation used by the proxy
/// verification guide. State lives in the proxy, code lives here.
contract BoxV1 is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    uint256 public value;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @dev Upgradeable contracts initialize instead of using a constructor,
    /// which is why the implementation takes no constructor arguments and can
    /// be verified without any.
    function initialize(uint256 initialValue, address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        value = initialValue;
    }

    function store(uint256 newValue) external {
        value = newValue;
    }

    function version() external pure virtual returns (string memory) {
        return "v1";
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
