// SPDX-License-Identifier: MIT
/**
 * Created on 2020-11-26
 * @summary: Jibrel Loans storage
 * @author: Jibrel Team
 */
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import './interfaces/IUniswapV2Router02.sol';

contract JFeesCollectorStorage is OwnableUpgradeable {
/* WARNING: NEVER RE-ORDER VARIABLES! Always double-check that new variables are added APPEND-ONLY. Re-ordering variables can permanently BREAK the deployed proxy contract.*/
    uint256 public contractVersion;

    mapping(address => bool) public tokensAllowed;

    address public factory;
    IUniswapV2Router02 public uniV2Router02;

    address public adminToolsAddress;
}