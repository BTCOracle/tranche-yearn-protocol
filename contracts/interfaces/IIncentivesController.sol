// SPDX-License-Identifier: MIT
/**
 * Created on 2021-06-18
 * @summary: Markets Interface
 * @author: Jibrel Team
 */
pragma solidity ^0.8.0;

interface IIncentivesController {
    function trancheANewEnter(address account, address trancheA) external; 
    function trancheBNewEnter(address account, address trancheB) external; 

    function claimRewardsAllMarkets(address _account) external returns (bool);
}
