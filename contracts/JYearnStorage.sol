// SPDX-License-Identifier: MIT
/**
 * Created on 2021-01-16
 * @summary: Jibrel Aave Tranches Protocol Storage
 * @author: Jibrel Team
 */
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract JYearnStorage is OwnableUpgradeable {
/* WARNING: NEVER RE-ORDER VARIABLES! Always double-check that new variables are added APPEND-ONLY. Re-ordering variables can permanently BREAK the deployed proxy contract.*/
    uint256 public constant PERCENT_DIVIDER = 10000;  // percentage divider
    uint256 public constant SECONDS_PER_YEAR = 31557600;  // 60 sec * 60 min * 24 h * 365.25 d (leap years included)

    struct TrancheAddresses {
        address buyerCoinAddress;       // ETH (ETH_ADDR) or DAI or other supported tokens
        address yTokenAddress;          // yETH or yDAI or other yToken
        address ATrancheAddress;
        address BTrancheAddress;
        bool isVault;                   // is yToken a vault or not
        // uint8 tokenType;                // yToken = 0, vault = 1, cream = 2
    }

    struct TrancheParameters {
        uint256 trancheAFixedPercentage;    // fixed percentage (i.e. 4% = 0.04 * 10^18 = 40000000000000000)
        uint256 trancheALastActionTime;
        uint256 storedTrancheAPrice;
        uint256 trancheACurrentRPS;
        uint16 redemptionPercentage;        // percentage with 2 decimals (divided by 10000, i.e. 95% is 9500)
        uint8 underlyingDecimals;
    }

    address public adminToolsAddress;
    address public feesCollectorAddress;
    address public tranchesDeployerAddress;

    address public yfiTokenAddress;
    address public yfiRewardsAddress;

    uint256 public tranchePairsCounter;

    uint32 public redeemTimeout;

    mapping(uint256 => TrancheAddresses) public trancheAddresses;
    mapping(uint256 => TrancheParameters) public trancheParameters;
    // last block number where the user withdrew/deposited tokens
    mapping(address => uint256) public lastActivity;
    // enabling / disabling tranches for fund deposit
    mapping(uint256 => bool) public trancheDepositEnabled;

    struct StakingDetails {
        uint256 startTime;
        uint256 amount;
    }

    address public incentivesControllerAddress;

    // user => trancheNum => counter
    mapping (address => mapping(uint256 => uint256)) public stakeCounterTrA;
    mapping (address => mapping(uint256 => uint256)) public stakeCounterTrB;
    // user => trancheNum => stakeCounter => struct
    mapping (address => mapping (uint256 => mapping (uint256 => StakingDetails))) public stakingDetailsTrancheA;
    mapping (address => mapping (uint256 => mapping (uint256 => StakingDetails))) public stakingDetailsTrancheB;
}