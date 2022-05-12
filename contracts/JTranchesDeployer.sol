// SPDX-License-Identifier: MIT
/**
 * Created on 2021-02-11
 * @summary: Jibrel Aave Tranche Deployer
 * @author: Jibrel Team
 */
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "./JTrancheAToken.sol";
import "./JTrancheBToken.sol";
import "./interfaces/IJTranchesDeployer.sol";
import "./interfaces/IJAdminTools.sol";
import "./JTranchesDeployerStorage.sol";

contract JTranchesDeployer is OwnableUpgradeable, JTranchesDeployerStorage, IJTranchesDeployer {
    using SafeMathUpgradeable for uint256;

    function initialize() external initializer() {
        OwnableUpgradeable.__Ownable_init();
    }

    function setJYearnAddresses(address _jYearn, address _jATAddress) external onlyOwner {
        jYearnAddress = _jYearn;
        jAdminToolsAddress = _jATAddress;
    }

    modifier onlyProtocol() {
        require(msg.sender == jYearnAddress, "TrancheDeployer: caller is not JYearn");
        _;
    }

    function deployNewTrancheATokens(string memory _nameA, 
            string memory _symbolA, 
            uint256 _trNum) external override onlyProtocol returns (address) {
        JTrancheAToken jTrancheA = new JTrancheAToken(_nameA, _symbolA, _trNum);
        jTrancheA.setJYearnMinter(msg.sender);
        // add tranche address to admins!
        IJAdminTools(jAdminToolsAddress).addAdmin(address(jTrancheA));
        return address(jTrancheA);
    }

    function deployNewTrancheBTokens(string memory _nameB, 
            string memory _symbolB, 
            uint256 _trNum) external override onlyProtocol returns (address) {
        JTrancheBToken jTrancheB = new JTrancheBToken(_nameB, _symbolB, _trNum);
        jTrancheB.setJYearnMinter(msg.sender);
        // add tranche address to admins!
        IJAdminTools(jAdminToolsAddress).addAdmin(address(jTrancheB));
        return address(jTrancheB);
    }

    function setNewJYearnTokens(address _newJYearn, address _trAToken, address _trBToken) external onlyOwner {
        require((_newJYearn != address(0)) && (_trAToken != address(0)) && (_trBToken != address(0)), "TrancheDeployer: some address is not allowed");
        JTrancheAToken(_trAToken).setJYearnMinter(_newJYearn);
        JTrancheAToken(_trBToken).setJYearnMinter(_newJYearn);
    }

}