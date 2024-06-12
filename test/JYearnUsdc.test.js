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
const USDC_ABI = JSON.parse(fs.readFileSync('./test/utils/Usdc.abi', 'utf8'));

const myERC20 = artifacts.require("myERC20");

const JAdminTools = artifacts.require('JAdminTools');
const JFeesCollector = artifacts.require('JFeesCollector');

const JYearn = artifacts.require('JYearn');
const JTranchesDeployer = artifacts.require('JTranchesDeployer');

const JTrancheAToken = artifacts.require('JTrancheAToken');
const JTrancheBToken = artifacts.require('JTrancheBToken');

const MYERC20_TOKEN_SUPPLY = 5000000;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';  //ETH
// const USDC_ADDRESS = '0x04068da6c83afcfa0e13ba15a6696662335d5b75';  //FTM
const yWETH_Address = '0x87b1f4cf9BD63f7BBD3eE1aD04E8F52540349347'; //ETH
// const WETH_ADDRESS = "0x74b23882a30290451A17c44f4F05243b6b58C76d";  //FTM
const yvUSDC_Address = '0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9';  //ETH
// const yvUSDC_Address = '0xef0210eb96c7eb36af8ed1c20306462764935607';  //FTM

const UnBlockedAccount = '0xAe2D4617c862309A3d75A0fFB358c7a5009c673F';  //ETH

let usdcContract, jFCContract, jATContract, jTrDeplContract, jYearnContract;
let ethTrAContract, ethTrBContract, usdcTrAContract, usdcTrBContract;
let tokenOwner, user1;

const fromWei = (x) => web3.utils.fromWei(x.toString());
const toWei = (x) => web3.utils.toWei(x.toString());
const fromWei6Dec = (x) => x / Math.pow(10, 6);
const toWei6Dec = (x) => x * Math.pow(10, 6);

contract("USDC JYearn", function(accounts) {
  it("ETH balances", async function () {
    //accounts = await web3.eth.getAccounts();
    tokenOwner = accounts[0];
    user1 = accounts[1];
    console.log(tokenOwner);
    console.log(await web3.eth.getBalance(tokenOwner));
    console.log(await web3.eth.getBalance(UnBlockedAccount));
  });

  it("USDC total Supply sent to user1", async function () {
    usdcContract = new web3.eth.Contract(USDC_ABI, USDC_ADDRESS);
    // result = await usdcContract.methods.totalSupply().call();
    // console.log(result.toString())
    console.log("UnBlockedAccount USDC balance: " + fromWei6Dec(await usdcContract.methods.balanceOf(UnBlockedAccount).call()) + " USDC");
    // expect(fromWei(result.toString(), "ether")).to.be.equal(MYERC20_TOKEN_SUPPLY.toString());
    await usdcContract.methods.transfer(user1, 100000000).send({from: UnBlockedAccount})
    console.log("UnBlockedAccount USDC balance: " + fromWei6Dec(await usdcContract.methods.balanceOf(UnBlockedAccount).call()) + " USDC");
    console.log("user1 USDC balance: " + fromWei6Dec(await usdcContract.methods.balanceOf(user1).call()) + " USDC");
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
    ethTrAContract = await JTrancheAToken.at(trParams0.ATrancheAddress);
    expect(ethTrAContract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(ethTrAContract.address).to.match(/0x[0-9a-fA-F]{40}/);
    console.log(ethTrAContract.address);

    ethTrBContract = await JTrancheBToken.at(trParams0.BTrancheAddress);
    expect(ethTrBContract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(ethTrBContract.address).to.match(/0x[0-9a-fA-F]{40}/);
    console.log(ethTrBContract.address);

    trParams1 = await jYearnContract.trancheAddresses(1);
    usdcTrAContract = await JTrancheAToken.at(trParams1.ATrancheAddress);
    expect(usdcTrAContract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(usdcTrAContract.address).to.match(/0x[0-9a-fA-F]{40}/);
    console.log(usdcTrAContract.address);

    usdcTrBContract = await JTrancheBToken.at(trParams1.BTrancheAddress);
    expect(usdcTrBContract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(usdcTrBContract.address).to.match(/0x[0-9a-fA-F]{40}/);
    console.log(usdcTrBContract.address);

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

  it("user1 buys some token usdcTrA", async function () {
    trAddresses = await jYearnContract.trancheAddresses(2); //.cTokenAddress;
    console.log("addresses tranche A: " + JSON.stringify(trAddresses, ["buyerCoinAddress", "yTokenAddress", "ATrancheAddress", "BTrancheAddress"]));
    trParams = await jYearnContract.trancheParameters(2);
    console.log("param tranche A: " + JSON.stringify(trParams, ["trancheAFixedPercentage", "trancheALastActionBlock", "storedTrancheAPrice", "trancheACurrentRPS", "underlyingDecimals"]));
    tx = await jYearnContract.calcRPSFromPercentage(2, {from: user1});

    trParams = await jYearnContract.trancheParameters(2);
    console.log("rps tranche A: " + trParams[3].toString());
    console.log("price tranche A: " + fromWei(trParams[2].toString()));
    console.log("yvUSDC price per full shares Normalized: " + fromWei(await jYearnContract.getYVaultNormPrice(2)))
    trAddress = await jYearnContract.trancheAddresses(2);
    expect(trAddress.buyerCoinAddress).to.be.equal(USDC_ADDRESS);
    expect(trAddress.yTokenAddress).to.be.equal(yvUSDC_Address);

    console.log("user1 USDC balance: " + fromWei6Dec(await usdcContract.methods.balanceOf(user1).call()) + " USDC");

    tx = await usdcContract.methods.approve(jYearnContract.address, toWei6Dec(100)).send({from: user1});

    tx = await jYearnContract.buyTrancheAToken(2, toWei6Dec(10), {from: user1});

    console.log("user1 New USDC balance: " + fromWei6Dec(await usdcContract.methods.balanceOf(user1).call()) + " USDC");
    console.log("user1 trA tokens: " + fromWei(await usdcTrAContract.balanceOf(user1)) + " ayUSDC");
    console.log("JYearn USDC balance: " + fromWei6Dec(await usdcContract.methods.balanceOf(jYearnContract.address).call()) + " USDC");
    console.log("JYearn yDAI balance: " + fromWei6Dec(await jYearnContract.getTokenBalance(yvUSDC_Address)) + " yUsdc");
    trParams = await jYearnContract.trancheParameters(2);
    console.log("TrA price: " + fromWei(trParams[2].toString()));
    console.log("JYearn TrA Value: " + fromWei6Dec(await jYearnContract.getTrAValue(2)) + " USDC");
    console.log("JYearn total Value: " + fromWei6Dec(await jYearnContract.getTotalValue(2)) + " USDC");

    stkDetails = await jYearnContract.stakingDetailsTrancheA(user1, 2, 1);
    console.log("startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
  });

  it("user1 buys some token usdcTrB", async function () {
    console.log("User1 USDC balance: " + fromWei6Dec(await usdcContract.methods.balanceOf(user1).call()) + " USDC");
    trAddr = await jYearnContract.trancheAddresses(2);
    buyAddr = trAddr.buyerCoinAddress;
    console.log("Tranche Buyer Coin address: " + buyAddr);
    console.log("TrB value: " + fromWei6Dec(await jYearnContract.getTrBValue(2)));
    console.log("JYearn total Value: " + fromWei6Dec(await jYearnContract.getTotalValue(2)) + " ayUSDC");
    console.log("TrB total supply: " + fromWei(await usdcTrBContract.totalSupply()));
    console.log("JYearn TrA Value: " + fromWei6Dec(await jYearnContract.getTrAValue(2)) + " USDC");
    console.log("TrB price: " + fromWei(await jYearnContract.getTrancheBExchangeRate(2)));
    tx = await usdcContract.methods.approve(jYearnContract.address, toWei(100)).send({from: user1});
    tx = await jYearnContract.buyTrancheBToken(2, toWei6Dec(10), {from: user1});
    console.log("User1 New USDC balance: " + fromWei6Dec(await usdcContract.methods.balanceOf(user1).call()) + " USDC");
    console.log("User1 trB tokens: " + fromWei(await usdcTrBContract.balanceOf(user1)) + " byUSDC");
    console.log("JYearn USDC balance: " + fromWei6Dec(await jYearnContract.getTokenBalance(yvUSDC_Address)) + " yUsdc");
    console.log("TrB price: " + fromWei(await jYearnContract.getTrancheBExchangeRate(2)));
    trParams = await jYearnContract.trancheParameters(2);
    console.log("TrA price: " + fromWei(trParams[2].toString()));
    console.log("JYearn TrA Value: " + fromWei6Dec(await jYearnContract.getTrAValue(2)));
    console.log("TrB value: " + fromWei6Dec(await jYearnContract.getTrBValue(2)));
    console.log("JYearn total Value: " + fromWei6Dec(await jYearnContract.getTotalValue(2)));

    console.log("staker counter trB: " + (await jYearnContract.stakeCounterTrB(user1, 2)).toString())
    stkDetails = await jYearnContract.stakingDetailsTrancheB(user1, 2, 1);
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

  it("user1 redeems token usdcTrA", async function () {
    oldBal = fromWei6Dec(await usdcContract.methods.balanceOf(user1).call());
    console.log("User1 Usdc balance: "+ oldBal + " USDC");
    bal = await usdcTrAContract.balanceOf(user1);
    console.log("User1 trA tokens: "+ fromWei(bal) + " ayUSDC");
    tot = await usdcTrAContract.totalSupply();
    console.log("trA tokens total: "+ fromWei(tot) + " ayUSDC");
    console.log("JYearn yUsdc balance: "+ fromWei6Dec(await jYearnContract.getTokenBalance(yvUSDC_Address)) + " yUsdc");
    console.log("yvUSDC price per full shares Normalized: " + fromWei(await jYearnContract.getYVaultNormPrice(2)))
    tx = await usdcTrAContract.approve(jYearnContract.address, bal, {from: user1});
    trParams = await jYearnContract.trancheParameters(2);
    console.log("TrA price: " + fromWei(trParams[2].toString()));

    tx = await jYearnContract.redeemTrancheAToken(2, bal, {from: user1});
    newBal = fromWei6Dec(await usdcContract.methods.balanceOf(user1).call());
    console.log("User1 New Usdc balance: "+ newBal + " USDC");
    bal = await usdcTrAContract.balanceOf(user1);
    console.log("User1 trA tokens: "+ fromWei(bal) + " ayUSDC");
    console.log("User1 trA interest: "+ (newBal - oldBal) + " USDC");
    console.log("JYearn new yUSDC balance: "+ fromWei6Dec(await jYearnContract.getTokenBalance(yvUSDC_Address)) + " yUsdc");
    console.log("JYearn TrA Value: " + fromWei6Dec(await jYearnContract.getTrAValue(2)));
    console.log("JYearn total Value: " + fromWei6Dec(await jYearnContract.getTotalValue(2)));

    console.log("staker counter trA: " + (await jYearnContract.stakeCounterTrA(user1, 2)).toString())
    stkDetails = await jYearnContract.stakingDetailsTrancheA(user1, 2, 1);
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

  it("user1 redeems token usdcTrB", async function () {
    oldBal = fromWei6Dec(await usdcContract.methods.balanceOf(user1).call());
    console.log("User1  Usdc balance: "+ oldBal + " USDC");
    bal = await usdcTrBContract.balanceOf(user1);
    console.log("User1 trB tokens: "+ fromWei(bal) + " byUSDC");
    console.log("JYearn yUSDC balance: "+ fromWei6Dec(await jYearnContract.getTokenBalance(yvUSDC_Address)) + " yUsdc");
    tx = await usdcTrBContract.approve(jYearnContract.address, bal, {from: user1});
    console.log("TrB price: " + fromWei(await jYearnContract.getTrancheBExchangeRate(2)));
    console.log("TrB value: " +  fromWei6Dec(await jYearnContract.getTrBValue(2)));

    tx = await jYearnContract.redeemTrancheBToken(2, bal, {from: user1});
    newBal = fromWei6Dec(await usdcContract.methods.balanceOf(user1).call());
    console.log("User1 New Usdc balance: "+ newBal + " USDC");
    bal = await usdcTrBContract.balanceOf(user1);
    console.log("User1 trB tokens: "+ fromWei(bal) + " byUSDC");
    console.log("User1 trB interest: "+ (newBal - oldBal) + " USDC");
    console.log("JYearn new yUSDC balance: "+ fromWei6Dec(await jYearnContract.getTokenBalance(yvUSDC_Address)) + " yUsdc");
    console.log("TrA Value: " + fromWei6Dec(await jYearnContract.getTrAValue(2)));
    console.log("TrB value: " +  fromWei6Dec(await jYearnContract.getTrBValue(2)));
    console.log("JYearn total Value: " + fromWei6Dec(await jYearnContract.getTotalValue(2)));

    console.log("staker counter trB: " + (await jYearnContract.stakeCounterTrB(user1, 2)).toString())
    stkDetails = await jYearnContract.stakingDetailsTrancheB(user1, 2, 1);
    console.log("startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
  }); 

  describe('higher percentage for test coverage', function() {
    it('calling unfrequently functions', async function () {
      await jYearnContract.setNewEnvironment(jATContract.address, jFCContract.address, jTrDeplContract.address, {from: tokenOwner})

      await jYearnContract.setNewYToken(0, "0xc00e94cb662c3520282e6f5717214004a7f26888", false, {from: tokenOwner})
      await jYearnContract.setNewYToken(0, yWETH_Address, false, {from: tokenOwner})

      await jYearnContract.getYTokenNormPrice(1)

      await jYearnContract.getTotalValue(1)

      await jYearnContract.setDecimals(1, 18)

      await jYearnContract.setTrancheRedemptionPercentage(1, 50)

      await jYearnContract.setRedemptionTimeout(3)

      await jYearnContract.setTrancheAFixedPercentage(1, web3.utils.toWei("0.03", "ether"))

      await jYearnContract.getTrancheACurrentRPS(1)

      await jYearnContract.setTrAStakingDetails(1, user1, 1, 0, 1634150567)
      await jYearnContract.getSingleTrancheUserStakeCounterTrA(user1, 1)
      await jYearnContract.getSingleTrancheUserSingleStakeDetailsTrA(user1, 1, 1)

      await jYearnContract.setTrBStakingDetails(1, user1, 1, 0, 1634150567)
      await jYearnContract.getSingleTrancheUserStakeCounterTrB(user1, 1)
      await jYearnContract.getSingleTrancheUserSingleStakeDetailsTrB(user1, 1, 1)

      await jYearnContract.transferTokenToFeesCollector(USDC_ADDRESS, 0)

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
