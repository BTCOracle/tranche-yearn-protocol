// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IWETH {
  function deposit() external payable;
  function withdraw(uint256) external;
  function approve(address spender, uint256 amount) external returns (bool);
  function transfer(address to, uint value) external returns (bool);
  function transferFrom(address source, address receiver, uint256 amount) external returns (bool);
}
