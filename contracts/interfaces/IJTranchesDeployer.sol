// SPDX-License-Identifier: MIT
/**
 * Created on 2021-01-15
 * @summary: JProtocol Interface
 * @author: Jibrel Team
 */
pragma solidity ^0.8.0;

interface IJTranchesDeployer {
    function deployNewTrancheATokens(string calldata _nameA, string calldata _symbolA, /*address _sender,*/ uint256 _trNum) external returns (address);
    function deployNewTrancheBTokens(string calldata _nameB, string calldata _symbolB, /*address _sender,*/ uint256 _trNum) external returns (address);
}