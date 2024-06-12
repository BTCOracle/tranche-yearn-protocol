require("dotenv").config();
const { expect } = require("chai");
const {
  BN,
  constants,
  ether,
  time,
  balance,
  expectEvent,
  expectRevert
} = require('@openzeppelin/test-helpers');

const Web3 = require('web3');
// Ganache UI on 8545
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const fs = require('fs');
const yVault_ABI_V1 = JSON.parse(fs.readFileSync('./test/utils/yVaultV1.abi', 'utf8'));
const yVault_ABI_V2 = JSON.parse(fs.readFileSync('./test/utils/yVaultV2.abi', 'utf8'));
const WETH_ABI = JSON.parse(fs.readFileSync('./test/utils/WETH.abi', 'utf8'));
// console.log(JSON.stringify(contract.abi));
// console.log(JSON.stringify(yVault_ABI_V2));

const myERC20 = artifacts.require("myERC20");

const JAdminTools = artifacts.require('JAdminTools');
const JFeesCollector = artifacts.require('JFeesCollector');

const JYearn = artifacts.require('JYearn');
const JTranchesDeployer = artifacts.require('JTranchesDeployer');

const JTrancheAToken = artifacts.require('JTrancheAToken');
const JTrancheBToken = artifacts.require('JTrancheBToken');

const MYERC20_TOKEN_SUPPLY = 5000000;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';  //ETH
// const WETH_ADDRESS = "0x74b23882a30290451A17c44f4F05243b6b58C76d";  //FTM
const yvWETH_ADDRESS = '0xa258C4606Ca8206D8aA700cE2143D7db854D168c';  //ETH
// const yvWETH_ADDRESS = "0xce2fc0bdc18bd6a4d9a725791a3dee33f3a23bb7";  //FTM

const UnBlockedAccount = '0x2fEb1512183545f48f6b9C5b4EbfCaF49CfCa6F3';  //ETH

let wethContract, jFCContract, jATContract, jTrDeplContract, jYearnContract;
let wethTrAContract, wethTrBContract;
let tokenOwner, user1;

const fromWei = (x) => web3.utils.fromWei(x.toString());
const toWei = (x) => web3.utils.toWei(x.toString());

contract("WETH JYearn", function(accounts) {
  it("ETH balances", async function () {
    //accounts = await web3.eth.getAccounts();
    tokenOwner = accounts[0];
    user1 = accounts[1];
    console.log(tokenOwner);
    console.log(await web3.eth.getBalance(tokenOwner));
    console.log(await web3.eth.getBalance(UnBlockedAccount));
  });

  it("WETH total Supply sent to user1", async function () {
    wethContract = new web3.eth.Contract(WETH_ABI, WETH_ADDRESS);
    // wethContract = await myERC20.deployed();
    result = await wethContract.methods.totalSupply().call();
    console.log(result.toString())
    console.log("UnBlockedAccount WETH balance: " + fromWei(await wethContract.methods.balanceOf(UnBlockedAccount).call()) + " WETH");
    // expect(fromWei(result.toString(), "ether")).to.be.equal(MYERC20_TOKEN_SUPPLY.toString());
    await wethContract.methods.transfer(user1, toWei(100)).send({from: UnBlockedAccount})
    console.log("UnBlockedAccount WETH balance: " + fromWei(await wethContract.methods.balanceOf(UnBlockedAccount).call()) + " WETH");
    console.log("user1 WETH balance: " + fromWei(await wethContract.methods.balanceOf(user1).call()) + " WETH");
  });

  it("All other contracts ok", async function () {
    jFCContract = await JFeesCollector.deployed();
    expect(jFCContract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(jFCContract.address).to.match(/0x[0-9a-fA-F]{40}/);
    console.log(jFCContract.address);

    jATContract = await JAdminTools.deployed();
    expect(jATContract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(jATContract.address).to.match(/0x[0-9a-fA-F]{40}/);
    console.log(jATContract.address);

    jTrDeplContract = await JTranchesDeployer.deployed();
    expect(jTrDeplContract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(jTrDeplContract.address).to.match(/0x[0-9a-fA-F]{40}/);
    console.log(jTrDeplContract.address);

    jYearnContract = await JYearn.deployed();
    expect(jYearnContract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(jYearnContract.address).to.match(/0x[0-9a-fA-F]{40}/);
    console.log(jYearnContract.address);

    trParams0 = await jYearnContract.trancheAddresses(0);
    wethTrAContract = await JTrancheAToken.at(trParams0.ATrancheAddress);
    expect(wethTrAContract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(wethTrAContract.address).to.match(/0x[0-9a-fA-F]{40}/);
    console.log(wethTrAContract.address);

    wethTrBContract = await JTrancheBToken.at(trParams0.BTrancheAddress);
    expect(wethTrBContract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(wethTrBContract.address).to.match(/0x[0-9a-fA-F]{40}/);
    console.log(wethTrBContract.address);

    trParams1 = await jYearnContract.trancheAddresses(0);
    daiTrAContract = await JTrancheAToken.at(trParams1.ATrancheAddress);
    expect(daiTrAContract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(daiTrAContract.address).to.match(/0x[0-9a-fA-F]{40}/);
    console.log(daiTrAContract.address);

    daiTrBContract = await JTrancheBToken.at(trParams1.BTrancheAddress);
    expect(daiTrBContract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(daiTrBContract.address).to.match(/0x[0-9a-fA-F]{40}/);
    console.log(daiTrBContract.address);

    trParams2 = await jYearnContract.trancheAddresses(2);
    usdcTrAContract = await JTrancheAToken.at(trParams2.ATrancheAddress);
    expect(usdcTrAContract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(usdcTrAContract.address).to.match(/0x[0-9a-fA-F]{40}/);
    console.log(usdcTrAContract.address);

    usdcTrBContract = await JTrancheBToken.at(trParams2.BTrancheAddress);
    expect(usdcTrBContract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(usdcTrBContract.address).to.match(/0x[0-9a-fA-F]{40}/);
    console.log(usdcTrBContract.address);
  });

  it("user1 buys some token WETHTrA", async function () {
    await jYearnContract.setTrancheRedemptionPercentage(0, 9990)

    trAddresses = await jYearnContract.trancheAddresses(0); //.cTokenAddress;
    console.log("addresses tranche A: " + JSON.stringify(trAddresses, ["buyerCoinAddress", "yTokenAddress", "ATrancheAddress", "BTrancheAddress"]));
    trParams = await jYearnContract.trancheParameters(0);
    console.log("param tranche A: " + JSON.stringify(trParams, ["trancheAFixedPercentage", "trancheALastActionBlock", "storedTrancheAPrice", "trancheACurrentRPB", "underlyingDecimals"]));
    tx = await jYearnContract.calcRPSFromPercentage(0, {from: user1});

    trParams = await jYearnContract.trancheParameters(0);
    console.log("rps tranche A: " + trParams[3].toString());
    console.log("price tranche A: " + fromWei(trParams[2].toString()));
    console.log("yvWETH price per full shares Normalized: " + fromWei(await jYearnContract.getYVaultNormPrice(0)))
    trAddress = await jYearnContract.trancheAddresses(0);
    expect(trAddress.buyerCoinAddress).to.be.equal(WETH_ADDRESS);
    expect(trAddress.yTokenAddress).to.be.equal(yvWETH_ADDRESS);
    console.log("user1 WETH balance: " + fromWei(await wethContract.methods.balanceOf(user1).call()) + " WETH");

    tx = await wethContract.methods.approve(jYearnContract.address, toWei(100)).send({from: user1});
    tx = await jYearnContract.buyTrancheAToken(0, toWei(10), {from: user1});

    console.log("user1 New WETH balance: " + fromWei(await wethContract.methods.balanceOf(user1).call()) + " WETH");
    console.log("user1 trA tokens: " + fromWei(await wethTrAContract.balanceOf(user1)) + " ayvWEA");
    console.log("JYearn WETH balance: " + fromWei(await wethContract.methods.balanceOf(jYearnContract.address).call()) + " WETH");
    console.log("JYearn yvWETH balance: " + fromWei(await jYearnContract.getTokenBalance(yvWETH_ADDRESS)) + " yvWETH");
    trParams = await jYearnContract.trancheParameters(0);
    console.log("TrA price: " + fromWei(trParams[2].toString()));
    trAddresses = await jYearnContract.trancheAddresses(0);
    trPars = await jYearnContract.trancheParameters(0);
    console.log("JYearn TrA Value: " + fromWei(await jYearnContract.getTrAValue(0)) + " WETH");
    console.log("JYearn total Value: " + fromWei(await jYearnContract.getTotalValue(0)) + " WETH");

    stkDetails = await jYearnContract.stakingDetailsTrancheA(user1, 0, 1);
    console.log("startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
  });

  it("user1 buys some token WETHTrB", async function () {
    console.log("User1 WETH balance: " + fromWei(await wethContract.methods.balanceOf(user1).call()) + " WETH");
    trAddr = await jYearnContract.trancheAddresses(0);
    buyAddr = trAddr.buyerCoinAddress;
    console.log("Tranche Buyer Coin address: " + buyAddr);
    console.log("TrB value: " + fromWei(await jYearnContract.getTrBValue(0)));
    console.log("JYearn total Value: " + fromWei(await jYearnContract.getTotalValue(0)));
    console.log("TrB total supply: " + fromWei(await wethTrBContract.totalSupply()));
    console.log("JYearn TrA Value: " + fromWei(await jYearnContract.getTrAValue(0)));
    console.log("TrB price: " + fromWei(await jYearnContract.getTrancheBExchangeRate(0)));

    tx = await jYearnContract.buyTrancheBToken(0, toWei(90), {from: user1});

    console.log("User1 New WETH balance: " + fromWei(await wethContract.methods.balanceOf(user1).call()) + " WETH");
    console.log("User1 trB tokens: " + fromWei(await wethTrBContract.balanceOf(user1)) + " byvWEB");
    console.log("JYearn WETH balance: " + fromWei(await jYearnContract.getTokenBalance(yvWETH_ADDRESS)) + " yvWETH");
    console.log("TrB price: " + fromWei(await jYearnContract.getTrancheBExchangeRate(0)));
    trAddresses = await jYearnContract.trancheAddresses(0);
    trParams = await jYearnContract.trancheParameters(0);
    console.log("TrA price: " + fromWei(trParams[2].toString()));
    console.log("JYearn TrA Value: " + fromWei(await jYearnContract.getTrAValue(0)));
    console.log("TrB value: " + fromWei(await jYearnContract.getTrBValue(0)));
    console.log("JYearn total Value: " + fromWei(await jYearnContract.getTotalValue(0)));

    console.log("staker counter trB: " + (await jYearnContract.stakeCounterTrB(user1, 0)).toString())
    stkDetails = await jYearnContract.stakingDetailsTrancheB(user1, 0, 1);
    console.log("startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
  });

  it('time passes...', async function () {
    let block = await web3.eth.getBlock("latest");
    console.log("Actual Block: " + block.number);
    newBlock = block.number + 100;
    await time.advanceBlockTo(newBlock);
    block = await web3.eth.getBlock("latest");
    console.log("New Actual Block: " + block.number);
  });

  it("user1 redeems token WETHTrA", async function () {
    oldBal = fromWei(await wethContract.methods.balanceOf(user1).call());
    console.log("User1 WETH balance: "+ oldBal + " WETH");
    bal = await wethTrAContract.balanceOf(user1);
    console.log("User1 trA tokens: "+ fromWei(bal) + " ayvWEA");
    tot = await wethTrAContract.totalSupply();
    console.log("trA tokens total: "+ fromWei(tot) + " ayvWEA");
    console.log("JYearn yvWETH balance: "+ fromWei(await jYearnContract.getTokenBalance(yvWETH_ADDRESS)) + " yvWETH");
    tx = await wethTrAContract.approve(jYearnContract.address, bal, {from: user1});
    trParams = await jYearnContract.trancheParameters(0);
    console.log("TrA price: " + fromWei(trParams[2].toString()));
    console.log("yvWETH price per full shares Normalized: " + fromWei(await jYearnContract.getYVaultNormPrice(0)))

    tx = await jYearnContract.redeemTrancheAToken(0, bal, {from: user1});

    newBal = fromWei(await wethContract.methods.balanceOf(user1).call());
    console.log("User1 New WETH balance: "+ newBal + " WETH");
    bal = await wethTrAContract.balanceOf(user1);
    console.log("User1 trA tokens: "+ fromWei(bal) + " ayvWEA");
    console.log("User1 trA interest: "+ (newBal - oldBal) + " WETH");
    console.log("JYearn new WETH balance: "+ fromWei(await jYearnContract.getTokenBalance(yvWETH_ADDRESS)) + " yvWETH");
    console.log("JYearn TrA Value: " + fromWei(await jYearnContract.getTrAValue(0)));
    console.log("JYearn total Value: " + fromWei(await jYearnContract.getTotalValue(0)));

    console.log("staker counter trA: " + (await jYearnContract.stakeCounterTrA(user1, 1)).toString())
    stkDetails = await jYearnContract.stakingDetailsTrancheA(user1, 0, 1);
    console.log("startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
    stkDetails = await jYearnContract.stakingDetailsTrancheA(user1, 0, 2);
    console.log("startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
  }); 

  it('time passes...', async function () {
    let block = await web3.eth.getBlock("latest");
    console.log("Actual Block: " + block.number);
    newBlock = block.number + 100;
    await time.advanceBlockTo(newBlock);
    block = await web3.eth.getBlock("latest");
    console.log("New Actual Block: " + block.number);
  });

  it("user1 redeems token WETHTrB", async function () {
    oldBal = fromWei(await wethContract.methods.balanceOf(user1).call());
    console.log("User1 WETH balance: "+ oldBal + " WETH");
    bal = await wethTrBContract.balanceOf(user1);
    console.log("User1 trB tokens: "+ fromWei(bal) + " byvWEB");
    console.log("JYearn yvWETH balance: "+ fromWei(await jYearnContract.getTokenBalance(yvWETH_ADDRESS)) + " yvWETH");
    tx = await wethTrBContract.approve(jYearnContract.address, bal, {from: user1});
    console.log("TrB price: " + fromWei(await jYearnContract.getTrancheBExchangeRate(0)));
    console.log("TrB value: " +  fromWei(await jYearnContract.getTrBValue(0)));

    tx = await jYearnContract.redeemTrancheBToken(0, bal, {from: user1});

    newBal = fromWei(await wethContract.methods.balanceOf(user1).call());
    console.log("User1 New WETH balance: "+ newBal + " WETH");
    bal = await wethTrBContract.balanceOf(user1);
    console.log("User1 trB tokens: "+ fromWei(bal) + " byvWEB");
    console.log("User1 trB interest: "+ (newBal - oldBal) + " WETH");
    console.log("JYearn new yvWETH balance: "+ fromWei(await jYearnContract.getTokenBalance(yvWETH_ADDRESS)) + " yvWETH");
    console.log("TrA Value: " + fromWei(await jYearnContract.getTrAValue(0)));
    console.log("TrB value: " +  fromWei(await jYearnContract.getTrBValue(0)));
    console.log("JYearn total Value: " + fromWei(await jYearnContract.getTotalValue(0)));

    console.log("staker counter trB: " + (await jYearnContract.stakeCounterTrB(user1, 0)).toString())
    stkDetails = await jYearnContract.stakingDetailsTrancheB(user1, 0, 1);
    console.log("startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
  }); 

  describe('higher percentage for test coverage', function() {
    it('calling unfrequently functions', async function () {
      await jYearnContract.setNewEnvironment(jATContract.address, jFCContract.address, jTrDeplContract.address, {from: tokenOwner})

      await jYearnContract.setDecimals(1, 18)

      await jYearnContract.setRedemptionTimeout(3)

      await jYearnContract.setTrancheAFixedPercentage(1, web3.utils.toWei("0.03", "ether"))

      await jYearnContract.getTrancheACurrentRPS(1)

      await jYearnContract.setTrAStakingDetails(1, user1, 1, 0, 1634150567)
      await jYearnContract.getSingleTrancheUserStakeCounterTrA(user1, 1)
      await jYearnContract.getSingleTrancheUserSingleStakeDetailsTrA(user1, 1, 1)

      await jYearnContract.setTrBStakingDetails(1, user1, 1, 0, 1634150567)
      await jYearnContract.getSingleTrancheUserStakeCounterTrB(user1, 1)
      await jYearnContract.getSingleTrancheUserSingleStakeDetailsTrB(user1, 1, 1)

      await jYearnContract.transferTokenToFeesCollector(WETH_ADDRESS, 0)

      await jYearnContract.getSirControllerAddress()
      
      const YFI_TOKEN_ADDRESS = '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e'; //ETH
      // const YFI_TOKEN_ADDRESS = '0x29b0Da86e484E1C0029B56e817912d778aC0EC69'; //FTM
      const YFI_REWARDS_ADDRESS = '0xcc9EFea3ac5Df6AD6A656235Ef955fBfEF65B862'; //ETH
      // const YFI_REWARDS_ADDRESS = ZERO_ADDRESS; //FTM
      await jYearnContract.setYFIAddresses(YFI_TOKEN_ADDRESS, YFI_REWARDS_ADDRESS)

      await jYearnContract.getYFIUnclaimedRewardShares()
      await expectRevert(jYearnContract.claimYearnRewards(10), "JYearn: not enough YFI tokens to claim rewards")

    });
  })
});
