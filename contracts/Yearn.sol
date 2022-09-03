// SPDX-License-Identifier: MIT
/**
 * Created on 2021-02-11
 * @summary: Jibrel Aave Tranche Protocol
 * @author: Jibrel Team
 */
pragma solidity ^0.8.0;


import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "./interfaces/IJAdminTools.sol";
import "./interfaces/IJTrancheTokens.sol";
import "./interfaces/IJTranchesDeployer.sol";
import "./JYearnStorage.sol";
import "./interfaces/IJYearn.sol";
import "./interfaces/IWETHGateway.sol";
import "./interfaces/IIncentivesController.sol";
import "./interfaces/IYToken.sol";
import "./interfaces/IYearnRewards.sol";


contract JYearn is OwnableUpgradeable, ReentrancyGuardUpgradeable, JYearnStorage, IJYearn {
    using SafeMathUpgradeable for uint256;

    /**
     * @dev contract initializer
     * @param _adminTools price oracle address
     * @param _feesCollector fees collector contract address
     * @param _tranchesDepl tranches deployer contract address
     */
    function initialize(address _adminTools, 
            address _feesCollector, 
            address _tranchesDepl) external initializer() {
        OwnableUpgradeable.__Ownable_init();
        adminToolsAddress = _adminTools;
        feesCollectorAddress = _feesCollector;
        tranchesDeployerAddress = _tranchesDepl;
        redeemTimeout = 3; //default
    }

    /**
     * @dev admins modifiers
     */
    modifier onlyAdmins() {
        require(IJAdminTools(adminToolsAddress).isAdmin(msg.sender), "JYearn: not an Admin");
        _;
    }

    fallback() external payable {
        revert('Fallback not allowed');
    }
    receive() external payable {
        revert('Receive not allowed');
    }

    /**
     * @dev set new addresses for price oracle, fees collector and tranche deployer 
     * @param _adminTools price oracle address
     * @param _feesCollector fees collector contract address
     * @param _tranchesDepl tranches deployer contract address
     */
    function setNewEnvironment(address _adminTools, 
            address _feesCollector, 
            address _tranchesDepl) external onlyOwner{
        require((_adminTools != address(0)) && (_feesCollector != address(0)) && (_tranchesDepl != address(0)), "JYearn: check addresses");
        adminToolsAddress = _adminTools;
        feesCollectorAddress = _feesCollector;
        tranchesDeployerAddress = _tranchesDepl;
    }

    /**
     * @dev set incentive rewards address
     * @param _incentivesController incentives controller contract address
     */
    function setincentivesControllerAddress(address _incentivesController) external onlyAdmins {
        incentivesControllerAddress = _incentivesController;
    }

    /**
     * @dev get incentive rewards address
     */
    function getSirControllerAddress() external view override returns (address) {
        return incentivesControllerAddress;
    }

    /**
     * @dev set YFI token and rewards on the specific blockchain
     * on Ethereum blockchain:
     * YFI_TOKEN_ADDRESS = 0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e;
     * YFI_REWARDS_ADDRESS = 0xcc9EFea3ac5Df6AD6A656235Ef955fBfEF65B862;
     * @param _yfiToken YFI token address
     * @param _yfiRewards YFI rewards address
     */
    function setYFIAddresses(address _yfiToken, address _yfiRewards) external onlyAdmins {
        require(_yfiToken != address(0) && _yfiRewards != address(0), "JYearn: not valid YFI addresses");
        yfiTokenAddress = _yfiToken;
        yfiRewardsAddress = _yfiRewards;
    }

    /**
     * @dev set decimals on the underlying token of a tranche
     * @param _trancheNum tranche number
     * @param _underlyingDec underlying token decimals
     */
    function setDecimals(uint256 _trancheNum, uint8 _underlyingDec) external onlyAdmins {
        require(_underlyingDec <= 18, "JYearn: too many decimals");
        trancheParameters[_trancheNum].underlyingDecimals = _underlyingDec;
    }

    /**
     * @dev set tranche redemption percentage
     * @param _trancheNum tranche number
     * @param _redeemPercent user redemption percent
     */
    function setTrancheRedemptionPercentage(uint256 _trancheNum, uint16 _redeemPercent) external onlyAdmins {
        trancheParameters[_trancheNum].redemptionPercentage = _redeemPercent;
    }

    /**
     * @dev set redemption timeout
     * @param _blockNum timeout (in block numbers)
     */
