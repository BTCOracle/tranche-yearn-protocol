require('dotenv').config();
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

var JFeesCollector = artifacts.require("JFeesCollector");
var JAdminTools = artifacts.require("JAdminTools");

var JYearn = artifacts.require('JYearn');
var JTranchesDeployer = artifacts.require('JTranchesDeployer');

var JTrancheAToken = artifacts.require('JTrancheAToken');
var JTrancheBToken = artifacts.require('JTrancheBToken');

var myERC20 = artifacts.require("./mocks/myERC20.sol");

var IncentivesController = artifacts.require('./IncentivesController');

const MYERC20_TOKEN_SUPPLY = 5000000;

const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

const yWETH_Address = '0x87b1f4cf9BD63f7BBD3eE1aD04E8F52540349347';
const yvWETH_Address = '0xa258C4606Ca8206D8aA700cE2143D7db854D168c';
const yDAI_Address = '0xC2cB1040220768554cf699b0d863A3cd4324ce32';
const yUSDC_Address = '0xd6aD7a6750A7593E092a9B218d66C0A814a3436e';
const yvUSDC_Address = '0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9';


module.exports = async (deployer, network, accounts) => {
  if (network == "development") {
    const factoryOwner = accounts[0];

    const mySLICEinstance = await deployProxy(myERC20, [MYERC20_TOKEN_SUPPLY], { from: factoryOwner });
    console.log('mySLICE Deployed: ', mySLICEinstance.address);

    const JATinstance = await deployProxy(JAdminTools, [], { from: factoryOwner });
    console.log('JAdminTools Deployed: ', JATinstance.address);

    const JFCinstance = await deployProxy(JFeesCollector, [JATinstance.address], { from: factoryOwner });
    console.log('JFeesCollector Deployed: ', JFCinstance.address);

    const JTDeployer = await deployProxy(JTranchesDeployer, [], { from: factoryOwner });
    console.log("Tranches Deployer: " + JTDeployer.address);

    const JYInstance = await deployProxy(JYearn, [JATinstance.address, JFCinstance.address, JTDeployer.address], { from: factoryOwner });
    console.log('JYearn Deployed: ', JYInstance.address);

    await JATinstance.addAdmin(JYInstance.address, { from: factoryOwner });
    await JATinstance.addAdmin(JTDeployer.address, { from: factoryOwner });

    await JTDeployer.setJYearnAddresses(JYInstance.address, JATinstance.address, { from: factoryOwner });

    await JYInstance.addTrancheToProtocol(WETH_ADDRESS, yvWETH_Address, true, "jWEthTrancheAToken", "ayvWEA",
      "jWEthTrancheBToken", "byvWEB", web3.utils.toWei("0.04", "ether"), 18, { from: factoryOwner });
    trParams = await JYInstance.trancheAddresses(0);
    let WEthTrA = await JTrancheAToken.at(trParams.ATrancheAddress);
    console.log("WETH Tranche A Token Address: " + WEthTrA.address);
    let WEthTrB = await JTrancheBToken.at(trParams.BTrancheAddress);
    console.log("WETH Tranche B Token Address: " + WEthTrB.address);

    await JYInstance.setTrancheDeposit(0, true);

    await JYInstance.addTrancheToProtocol(DAI_ADDRESS, yDAI_Address, false, "jDaiTrancheAToken", "ayDAI",
      "jDaiTrancheBToken", "byDAI", web3.utils.toWei("0.03", "ether"), 18, { from: factoryOwner });
    trParams = await JYInstance.trancheAddresses(1);
    let DaiTrA = await JTrancheAToken.at(trParams.ATrancheAddress);
    console.log("DAI Tranche A Token Address: " + DaiTrA.address);
    let DaiTrB = await JTrancheBToken.at(trParams.BTrancheAddress);
    console.log("DAI Tranche B Token Address: " + DaiTrB.address);

    await JYInstance.setTrancheDeposit(1, true);

    await JYInstance.addTrancheToProtocol(USDC_ADDRESS, yvUSDC_Address, true, "jUsdcTrancheAToken", "ayUSDC",
      "jUsdcTrancheBToken", "byUSDC", web3.utils.toWei("0.03", "ether"), 6, { from: factoryOwner });
    trParams = await JYInstance.trancheAddresses(2);
    let UsdcTrA = await JTrancheAToken.at(trParams.ATrancheAddress);
    console.log("USDC Tranche A Token Address: " + UsdcTrA.address);
    let UsdcTrB = await JTrancheBToken.at(trParams.BTrancheAddress);
    console.log("USDC Tranche B Token Address: " + UsdcTrB.address);

    await JYInstance.setTrancheDeposit(2, true);

    const JIController = await deployProxy(IncentivesController, [], { from: factoryOwner });
    console.log("Incentive Controller mock: " + JIController.address);

    await JYInstance.setincentivesControllerAddress(JIController.address);

  } else if (network === 'ftm') {
    let { JADMIN_TOOLS, FEE_COLLECTOR_ADDRESS, YEARN_DEPLOYER,
      TRANCHE_ONE_TOKEN_ADDRESS, TRANCHE_ONE_CTOKEN_ADDRESS, TRANCHE_TWO_TOKEN_ADDRESS, TRANCHE_TWO_CTOKEN_ADDRESS,
      TRANCHE_THREE_TOKEN_ADDRESS, TRANCHE_THREE_CTOKEN_ADDRESS, MOCK_INCENTIVE_CONTROLLER,
      TRANCHE_FOUR_TOKEN_ADDRESS, TRANCHE_FOUR_CTOKEN_ADDRESS, TRANCHE_FIVE_TOKEN_ADDRESS, TRANCHE_FIVE_CTOKEN_ADDRESS
    } = process.env;

    const factoryOwner = accounts[0];

    let JATinstance = null;
    let JFCinstance = null;
    let JTDeployerInstance = null;

    if (!JADMIN_TOOLS) {
      JATinstance = await deployProxy(JAdminTools, [], { from: factoryOwner });
      console.log('JADMIN_TOOLS=', JATinstance.address);
    } else {
      JATinstance = await JAdminTools.at(JADMIN_TOOLS)
    }

    if (!FEE_COLLECTOR_ADDRESS) {
      JFCinstance = await deployProxy(JFeesCollector, [JATinstance.address], { from: factoryOwner });
      console.log('FEE_COLLECTOR_ADDRESS=', JFCinstance.address);
    } else {
      JFCinstance = {
        address: FEE_COLLECTOR_ADDRESS
      }
    }

    if (!YEARN_DEPLOYER) {
      JTDeployerInstance = await deployProxy(JTranchesDeployer, [], { from: factoryOwner });
      console.log('YEARN_DEPLOYER=', JTDeployerInstance.address);
    } else {
      JTDeployerInstance = await JTranchesDeployer.at(YEARN_DEPLOYER);
    }

    const JYInstance = await deployProxy(JYearn, [JATinstance.address, JFCinstance.address, JTDeployerInstance.address], { from: factoryOwner });
    console.log('YEARN_TRANCHE_ADDRESS', JYInstance.address);
    await JATinstance.addAdmin(JYInstance.address, { from: factoryOwner })

    await JTDeployerInstance.setJYearnAddress(JYInstance.address, { from: factoryOwner });
    console.log('yearn address set in deployer');


    await JYInstance.addTrancheToProtocol(TRANCHE_ONE_TOKEN_ADDRESS, TRANCHE_ONE_CTOKEN_ADDRESS, true, "Tranche A - Yearn DAI", "ayvDAI", "Tranche B - Yearn DAI",
      "byvDAI", web3.utils.toWei("0.01825", "ether"), 18, { from: factoryOwner });
    console.log('added tranche 0')

    await JYInstance.setTrancheDeposit(0, true, { from: factoryOwner });
    console.log('enable tranches 0')

    await JYInstance.addTrancheToProtocol(TRANCHE_TWO_TOKEN_ADDRESS, TRANCHE_TWO_CTOKEN_ADDRESS, true, "Tranche A - Yearn MIM", "ayvMIM", "Tranche B - Yearn MIM",
      "byvMIM", web3.utils.toWei("0.008345", "ether"), 18, { from: factoryOwner });
    console.log('added tranche 1')

    await JYInstance.setTrancheDeposit(1, true, { from: factoryOwner });
    console.log('enable tranches 1')

    await JYInstance.addTrancheToProtocol(TRANCHE_THREE_TOKEN_ADDRESS, TRANCHE_THREE_CTOKEN_ADDRESS, true, "Tranche A - Yearn USDC", "ayvUSDC", "Tranche B - Yearn USDC",
      "byvUSDC", web3.utils.toWei("0.008929", "ether"), 6, { from: factoryOwner });
    console.log('added tranche 2')

    await JYInstance.setTrancheDeposit(2, true, { from: factoryOwner });
    console.log('enable tranches 2')


    await JYInstance.addTrancheToProtocol(TRANCHE_FOUR_TOKEN_ADDRESS, TRANCHE_FOUR_CTOKEN_ADDRESS, true, "Tranche A - Yearn WFTM", "ayvWFTM", "Tranche B - Yearn WFTM",
      "byvWFTM", web3.utils.toWei("0.02720", "ether"), 18, { from: factoryOwner });
    console.log('added tranche 3')

    await JYInstance.setTrancheDeposit(3, true, { from: factoryOwner });
    console.log('enable tranches 3')


    await JYInstance.addTrancheToProtocol(TRANCHE_FIVE_TOKEN_ADDRESS, TRANCHE_FIVE_CTOKEN_ADDRESS, true, "Tranche A - Yearn YFI", "ayvYFI", "Tranche B - Yearn YFI",
      "byvYFI", web3.utils.toWei("0.00", "ether"), 18, { from: factoryOwner });
    console.log('added tranche 4')

    await JYInstance.setTrancheDeposit(4, true, { from: factoryOwner });
    console.log('enable tranches 4')

    if (!MOCK_INCENTIVE_CONTROLLER) {
      const JIController = await deployProxy(IncentivesController, [], { from: factoryOwner });
      console.log("MOCK_INCENTIVE_CONTROLLER " + JIController.address);
      await JYInstance.setincentivesControllerAddress(JIController.address);
      console.log('incentive controller setup')
    } else {
      await JYInstance.setincentivesControllerAddress(MOCK_INCENTIVE_CONTROLLER);
      console.log('incentive controller setup')
    }

    trParams = await JYInstance.trancheAddresses(0);
    let daiTrA = await JTrancheAToken.at(trParams.ATrancheAddress);
    let daiTrB = await JTrancheBToken.at(trParams.BTrancheAddress);
    trParams = await JYInstance.trancheAddresses(1);
    let mimTrA = await JTrancheAToken.at(trParams.ATrancheAddress);
    let mimTrB = await JTrancheBToken.at(trParams.BTrancheAddress);

    trParams = await JYInstance.trancheAddresses(2);
    let usdcTrA = await JTrancheAToken.at(trParams.ATrancheAddress);
    let usdcTrB = await JTrancheBToken.at(trParams.BTrancheAddress);

    trParams = await JYInstance.trancheAddresses(3);
    let ftmTrA = await JTrancheAToken.at(trParams.ATrancheAddress);
    let ftmTrB = await JTrancheBToken.at(trParams.BTrancheAddress);

    trParams = await JYInstance.trancheAddresses(4);
    let yfiTrA = await JTrancheAToken.at(trParams.ATrancheAddress);
    let yfiTrB = await JTrancheBToken.at(trParams.BTrancheAddress);

    console.log(`REACT_APP_YEARN_TRANCHE_TOKENS=${daiTrA.address},${daiTrB.address},${yfiTrA.address},${yfiTrB.address},
    ${mimTrA.address},${mimTrB.address},${usdcTrA.address},${usdcTrB.address},${ftmTrA.address},${ftmTrB.address}`);
    console.log(`TRANCHE_A=${daiTrA.address},${mimTrA.address},${usdcTrA.address},${ftmTrA.address},${yfiTrA.address}`);
    console.log(`TRANCHE_B=${daiTrB.address},${mimTrB.address},${usdcTrB.address},${ftmTrB.address},${yfiTrB.address}`);

  }
}