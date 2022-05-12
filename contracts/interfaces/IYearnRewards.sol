// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IYearnRewards{
    function claimable(address _claimer) external view returns (uint);
    function claim(uint _amount) external;
}