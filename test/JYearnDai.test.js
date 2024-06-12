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

const timeMachine = require('ganache-time-traveler');

const fs = require('fs');
const yVault_ABI_V1 = JSON.parse(fs.readFileSync('./test/utils/yVaultV1.abi', 'utf8'));
const yVault_ABI_V2 = JSON.parse(fs.readFileSync('./test/utils/yVaultV2.abi', 'utf8'));
const DAI_ABI = JSON.parse(fs.readFileSync('./test/utils/Dai.abi', 'utf8'));
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
const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; //ETH
// const DAI_ADDRESS = '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e'; //FTM
const yWETH_Address = '0x87b1f4cf9BD63f7BBD3eE1aD04E8F52540349347'; //ETH
const yDAI_Address = '0xC2cB1040220768554cf699b0d863A3cd4324ce32';  //ETH
// const yvDAI_Address = '0x7e5406aacae9373412d0da1b7a17762aa5df485c';  //FTM

const UnBlockedAccount = '0x5ad3330aebdd74d7dda641d37273ac1835ee9330';  //ETH

let daiContract, jFCContract, jATContract, jTrDeplContract, jYearnContract;
let ethTrAContract, ethTrBContract, daiTrAContract, daiTrBContract;
let tokenOwner, user1;

const fromWei = (x) => web3.utils.fromWei(x.toString());
const toWei = (x) => web3.utils.toWei(x.toString());

contract("DAI JYearn", function(accounts) {
  it("ETH balances", async function () {
    tokenOwner = accounts[0];
    user1 = accounts[1];
    user2 = accounts[2];
    console.log(tokenOwner);
    console.log(await web3.eth.getBalance(tokenOwner));
    console.log(await web3.eth.getBalance(UnBlockedAccount));
  });

  it("DAI total Supply sent to user1", async function () {
    daiContract = new web3.eth.Contract(DAI_ABI, DAI_ADDRESS);
    result = await daiContract.methods.totalSupply().call();
    console.log(result.toString())
    console.log("UnBlockedAccount DAI balance: " + fromWei(await daiContract.methods.balanceOf(UnBlockedAccount).call()) + " DAI");
    // expect(fromWei(result.toString(), "ether")).to.be.equal(MYERC20_TOKEN_SUPPLY.toString());
    await daiContract.methods.transfer(user1, toWei(100)).send({from: UnBlockedAccount})
    console.log("UnBlockedAccount DAI balance: " + fromWei(await daiContract.methods.balanceOf(UnBlockedAccount).call()) + " DAI");
    console.log("user1 DAI balance: " + fromWei(await daiContract.methods.balanceOf(user1).call()) + " DAI");
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

  it("user1 buys some token daiTrA", async function () {
    trAddresses = await jYearnContract.trancheAddresses(1); //.cTokenAddress;
    console.log("addresses tranche A: " + JSON.stringify(trAddresses, ["buyerCoinAddress", "yTokenAddress", "ATrancheAddress", "BTrancheAddress"]));
    trParams = await jYearnContract.trancheParameters(1);
    console.log("param tranche A: " + JSON.stringify(trParams, ["trancheAFixedPercentage", "trancheALastActionBlock", "storedTrancheAPrice", "trancheACurrentRPS", "underlyingDecimals"]));
    tx = await jYearnContract.calcRPSFromPercentage(1, {from: user1});

    trParams = await jYearnContract.trancheParameters(1);
    console.log("rps tranche A: " + trParams[3].toString());
    console.log("price tranche A: " + fromWei(trParams[2].toString()));
    console.log("yvDAI price per full shares Normalized: " + fromWei(await jYearnContract.getYTokenNormPrice(1)))
    trAddress = await jYearnContract.trancheAddresses(1);
    expect(trAddress.buyerCoinAddress).to.be.equal(DAI_ADDRESS);
    expect(trAddress.yTokenAddress).to.be.equal(yDAI_Address);
    console.log("user1 DAI balance: " + fromWei(await daiContract.methods.balanceOf(user1).call()) + " DAI");

    tx = await daiContract.methods.approve(jYearnContract.address, toWei(100)).send({from: user1});

    tx = await jYearnContract.buyTrancheAToken(1, toWei(60), {from: user1});

    console.log("user1 New DAI balance: " + fromWei(await daiContract.methods.balanceOf(user1).call()) + " DAI");
    console.log("user1 trA tokens: " + fromWei(await daiTrAContract.balanceOf(user1)) + " ayDAI");
    console.log("JYearn DAI balance: " + fromWei(await daiContract.methods.balanceOf(jYearnContract.address).call()) + " DAI");
    console.log("JYearn yDAI balance: " + fromWei(await jYearnContract.getTokenBalance(yDAI_Address)) + " yDai");
    trParams = await jYearnContract.trancheParameters(1);
    console.log("TrA price: " + fromWei(trParams[2].toString()));
    console.log("JYearn TrA Value: " + fromWei(await jYearnContract.getTrAValue(1)) + "ayDAI");
    console.log("JYearn total Value: " + fromWei(await jYearnContract.getTotalValue(1)) + "yDAI");

    stkDetails = await jYearnContract.stakingDetailsTrancheA(user1, 1, 1);
    console.log("startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
  });

  it("user1 buys some token daiTrB", async function () {
    console.log("User1 DAI balance: " + fromWei(await daiContract.methods.balanceOf(user1).call()) + " DAI");
    trAddr = await jYearnContract.trancheAddresses(1);
    buyAddr = trAddr.buyerCoinAddress;
    console.log("Tranche Buyer Coin address: " + buyAddr);
    console.log("TrB value: " + fromWei(await jYearnContract.getTrBValue(1)));
    console.log("JYearn total Value: " + fromWei(await jYearnContract.getTotalValue(1)));
    console.log("TrB total supply: " + fromWei(await daiTrBContract.totalSupply()));
    console.log("JYearn TrA Value: " + fromWei(await jYearnContract.getTrAValue(1)));
    console.log("TrB price: " + fromWei(await jYearnContract.getTrancheBExchangeRate(1)));
    tx = await daiContract.methods.approve(jYearnContract.address, toWei(100)).send({from: user1});
    tx = await jYearnContract.buyTrancheBToken(1, toWei(10), {from: user1});
    console.log("User1 New DAI balance: " + fromWei(await daiContract.methods.balanceOf(user1).call()) + " DAI");
    console.log("User1 trB tokens: " + fromWei(await daiTrBContract.balanceOf(user1)) + " byDai");
    console.log("JYearn DAI balance: " + fromWei(await jYearnContract.getTokenBalance(yDAI_Address)) + " yDai");
    console.log("TrB price: " + fromWei(await jYearnContract.getTrancheBExchangeRate(1)));
    trParams = await jYearnContract.trancheParameters(1);
    console.log("TrA price: " + fromWei(trParams[2].toString()));
    console.log("JYearn TrA Value: " + fromWei(await jYearnContract.getTrAValue(1)));
    console.log("TrB value: " + fromWei(await jYearnContract.getTrBValue(1)));
    console.log("JYearn total Value: " + fromWei(await jYearnContract.getTotalValue(1)));

    console.log("staker counter trB: " + (await jYearnContract.stakeCounterTrB(user1, 1)).toString())
    stkDetails = await jYearnContract.stakingDetailsTrancheB(user1, 1, 1);
    console.log("startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
  });

  it('transferring Tranche A tokens should also transfer staking details', async function () {
    bal1 = await daiTrAContract.balanceOf(user1)
    console.log("user1 trA Balance: " + fromWei(bal1) + " ayDai")
    stkDetails = await jYearnContract.stakingDetailsTrancheA(user1, 1, 1);
    console.log("user1 stkDetails, startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
    bal2 = await daiTrAContract.balanceOf(user2)
    expect(bal2.toString()).to.be.equal("0")
    
    await daiTrAContract.transfer(user2, toWei(5), {from: user1});
    bal1 = await daiTrAContract.balanceOf(user1)
    bal2 = await daiTrAContract.balanceOf(user2)
    console.log("user1 trA Balance: " + fromWei(bal1) + " ayDai")
    stkDetails = await jYearnContract.stakingDetailsTrancheA(user1, 1, 1);
    console.log("user1 stkDetails, startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
    console.log("user2 trA Balance: " + fromWei(bal2) + " ayDai")
    stkDetails = await jYearnContract.stakingDetailsTrancheA(user2, 1, 1);
    console.log("user2 stkDetails, startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
  });

  it('transferring Tranche B tokens should also transfer staking details', async function () {
    bal1 = await daiTrBContract.balanceOf(user1)
    console.log("user1 trB Balance: " + fromWei(bal1) + " byDai")
    stkDetails = await jYearnContract.stakingDetailsTrancheB(user1, 1, 1);
    console.log("user1 stkDetails, startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
    bal2 = await daiTrBContract.balanceOf(user2)
    expect(bal2.toString()).to.be.equal("0")
    
    await daiTrBContract.transfer(user2, toWei(5), {from: user1});
    bal1 = await daiTrBContract.balanceOf(user1)
    bal2 = await daiTrBContract.balanceOf(user2)
    console.log("user1 trB Balance: " + fromWei(bal1) + " byDai")
    stkDetails = await jYearnContract.stakingDetailsTrancheB(user1, 1, 1);
    console.log("user1 stkDetails, startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
    console.log("user2 trB Balance: " + fromWei(bal2) + " byDai")
    stkDetails = await jYearnContract.stakingDetailsTrancheB(user2, 1, 1);
    console.log("user2 stkDetails, startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
  });

  it('users cannot burn their tranche tokens', async function () {
    await expectRevert(daiTrAContract.burn(toWei(1), {from: user1}), "JTrancheA: caller cannot burn tokens")
    await expectRevert(daiTrAContract.burn(toWei(1), {from: user2}), "JTrancheA: caller cannot burn tokens")
    await expectRevert(daiTrBContract.burn(toWei(1), {from: user1}), "JTrancheB: caller cannot burn tokens")
    await expectRevert(daiTrBContract.burn(toWei(1), {from: user2}), "JTrancheB: caller cannot burn tokens")
  })

  it('time passes...', async function () {
    let block = await web3.eth.getBlock("latest");
    console.log("Actual Block: " + block.number);
    newBlock = block.number + 10;
    await time.advanceBlockTo(newBlock);
    block = await web3.eth.getBlock("latest");
    console.log("New Actual Block: " + block.number);
  
    const maturity = Number(time.duration.seconds(1000));
    block = await web3.eth.getBlockNumber();
    await timeMachine.advanceTimeAndBlock(maturity);
    block = await web3.eth.getBlockNumber()
  })

  it("user1 redeems token daiTrA", async function () {
    oldBal = fromWei(await daiContract.methods.balanceOf(user1).call());
    console.log("User1 Dai balance: "+ oldBal + " DAI");
    bal = await daiTrAContract.balanceOf(user1);
    console.log("User1 trA tokens: "+ fromWei(bal) + " ayDai");
    tot = await daiTrAContract.totalSupply();
    console.log("trA tokens total: "+ fromWei(tot) + " ayDai");
    console.log("JYearn yDai balance: "+ fromWei(await jYearnContract.getTokenBalance(yDAI_Address)) + " yDai");
    tx = await daiTrAContract.approve(jYearnContract.address, bal, {from: user1});
    trParams = await jYearnContract.trancheParameters(1);
    console.log("TrA price: " + fromWei(trParams[2].toString()));
    console.log("yvDAI price per full shares Normalized: " + fromWei(await jYearnContract.getYTokenNormPrice(1)))

    tx = await jYearnContract.redeemTrancheAToken(1, bal, {from: user1});

    trParams = await jYearnContract.trancheParameters(1);
    console.log("Redemption TrA price: " + fromWei(trParams[2].toString()));
    newBal = fromWei(await daiContract.methods.balanceOf(user1).call());
    console.log("User1 New Dai balance: "+ newBal + " DAI");
    bal = await daiTrAContract.balanceOf(user1);
    console.log("User1 trA tokens: "+ fromWei(bal) + " ayDai");
    console.log("User1 trA interest: "+ (newBal - oldBal) + " DAI");
    console.log("JYearn new yDAI balance: "+ fromWei(await jYearnContract.getTokenBalance(yDAI_Address)) + " yDai");
    console.log("JYearn TrA Value: " + fromWei(await jYearnContract.getTrAValue(1)));
    console.log("JYearn total Value: " + fromWei(await jYearnContract.getTotalValue(1)));

    console.log("staker counter trA: " + (await jYearnContract.stakeCounterTrA(user1, 1)).toString())
    stkDetails = await jYearnContract.stakingDetailsTrancheA(user1, 1, 1);
    console.log("startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
    stkDetails = await jYearnContract.stakingDetailsTrancheA(user1, 1, 2);
    console.log("startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
  }); 

  it("user2 redeems token daiTrA", async function () {
    oldBal = fromWei(await daiContract.methods.balanceOf(user2).call());
    console.log("User2 Dai balance: "+ oldBal + " DAI");
    bal = await daiTrAContract.balanceOf(user2);
    console.log("User2 trA tokens: "+ fromWei(bal) + " ayDai");
    tot = await daiTrAContract.totalSupply();
    console.log("trA tokens total: "+ fromWei(tot) + " ayDai");
    console.log("JYearn yDai balance: "+ fromWei(await jYearnContract.getTokenBalance(yDAI_Address)) + " yDai");
    tx = await daiTrAContract.approve(jYearnContract.address, bal, {from: user2});
    trParams = await jYearnContract.trancheParameters(1);
    console.log("TrA price: " + fromWei(trParams[2].toString()));

    tx = await jYearnContract.redeemTrancheAToken(1, bal, {from: user2});

    trParams = await jYearnContract.trancheParameters(1);
    console.log("Redemption TrA price: " + fromWei(trParams[2].toString()));
    newBal = fromWei(await daiContract.methods.balanceOf(user2).call());
    console.log("User2 New Dai balance: "+ newBal + " DAI");
    bal = await daiTrAContract.balanceOf(user2);
    console.log("User2 trA tokens: "+ fromWei(bal) + " ayDai");
    console.log("User2 trA interest: "+ (newBal - oldBal) + " DAI");
    console.log("JYearn new DAI balance: "+ fromWei(await jYearnContract.getTokenBalance(yDAI_Address)) + " yDai");
    console.log("JYearn TrA Value: " + fromWei(await jYearnContract.getTrAValue(1)));
    console.log("JYearn total Value: " + fromWei(await jYearnContract.getTotalValue(1)));

    console.log("staker counter trA: " + (await jYearnContract.stakeCounterTrA(user2, 1)).toString())
    stkDetails = await jYearnContract.stakingDetailsTrancheA(user2, 1, 1);
    console.log("startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
    stkDetails = await jYearnContract.stakingDetailsTrancheA(user2, 1, 2);
    console.log("startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
  }); 

  it('time passes...', async function () {
    let block = await web3.eth.getBlock("latest");
    console.log("Actual Block: " + block.number);
    newBlock = block.number + 10;
    await time.advanceBlockTo(newBlock);
    block = await web3.eth.getBlock("latest");
    console.log("New Actual Block: " + block.number);
  });

  it("user1 redeems token daiTrB", async function () {
    oldBal = fromWei(await daiContract.methods.balanceOf(user1).call());
    console.log("User1 Dai balance: "+ oldBal + " DAI");
    bal = await daiTrBContract.balanceOf(user1);
    console.log("User1 trB tokens: "+ fromWei(bal) + " byDai");
    console.log("JYearn yDai balance: "+ fromWei(await jYearnContract.getTokenBalance(yDAI_Address)) + " yDai");
    tx = await daiTrBContract.approve(jYearnContract.address, bal, {from: user1});
    console.log("TrB price: " + fromWei(await jYearnContract.getTrancheBExchangeRate(1)));
    console.log("TrB value: " +  fromWei(await jYearnContract.getTrBValue(1)));

    tx = await jYearnContract.redeemTrancheBToken(1, bal, {from: user1});

    newBal = fromWei(await daiContract.methods.balanceOf(user1).call());
    console.log("User1 New Dai balance: "+ newBal + " DAI");
    bal = await daiTrBContract.balanceOf(user1);
    console.log("User1 trB tokens: "+ fromWei(bal) + " byDai");
    console.log("User1 trB interest: "+ (newBal - oldBal) + " DAI");
    console.log("JYearn new DAI balance: "+ fromWei(await jYearnContract.getTokenBalance(yDAI_Address)) + " yDai");
    console.log("TrA Value: " + fromWei(await jYearnContract.getTrAValue(1)));
    console.log("TrB value: " +  fromWei(await jYearnContract.getTrBValue(1)));
    console.log("JYearn total Value: " + fromWei(await jYearnContract.getTotalValue(1)));

    console.log("staker counter trB: " + (await jYearnContract.stakeCounterTrB(user1, 1)).toString())
    stkDetails = await jYearnContract.stakingDetailsTrancheB(user1, 1, 1);
    console.log("startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
  }); 

  it("user2 redeems token daiTrB", async function () {
    oldBal = fromWei(await daiContract.methods.balanceOf(user2).call());
    console.log("User2 Dai balance: "+ oldBal + " DAI");
    bal = await daiTrBContract.balanceOf(user2);
    console.log("User2 trB tokens: "+ fromWei(bal) + " byDai");
    console.log("JYearn yDai balance: "+ fromWei(await jYearnContract.getTokenBalance(yDAI_Address)) + " yDai");
    tx = await daiTrBContract.approve(jYearnContract.address, bal, {from: user2});
    console.log("TrB price: " + fromWei(await jYearnContract.getTrancheBExchangeRate(1)));
    console.log("TrB value: " +  fromWei(await jYearnContract.getTrBValue(1)));

    tx = await jYearnContract.redeemTrancheBToken(1, bal, {from: user2});
    
    newBal = fromWei(await daiContract.methods.balanceOf(user2).call());
    console.log("User2 New Dai balance: "+ newBal + " DAI");
    bal = await daiTrBContract.balanceOf(user2);
    console.log("User2 trB tokens: "+ fromWei(bal) + " byDai");
    console.log("User2 trB interest: "+ (newBal - oldBal) + " DAI");
    console.log("JYearn new DAI balance: "+ fromWei(await jYearnContract.getTokenBalance(yDAI_Address)) + " yDai");
    console.log("TrA Value: " + fromWei(await jYearnContract.getTrAValue(1)));
    console.log("TrB value: " +  fromWei(await jYearnContract.getTrBValue(1)));
    console.log("JYearn total Value: " + fromWei(await jYearnContract.getTotalValue(1)));

    console.log("staker counter trB: " + (await jYearnContract.stakeCounterTrB(user2, 1)).toString())
    stkDetails = await jYearnContract.stakingDetailsTrancheB(user2, 1, 1);
    console.log("startTime: " + stkDetails[0].toString() + ", amount: " + stkDetails[1].toString() )
  }); 

  describe('higher percentage for test coverage', function() {
    it('calling unfrequently functions', async function () {
      await jYearnContract.setNewEnvironment(jATContract.address, jFCContract.address, jTrDeplContract.address, {from: tokenOwner})

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

      await jYearnContract.transferTokenToFeesCollector(DAI_ADDRESS, 0)

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
