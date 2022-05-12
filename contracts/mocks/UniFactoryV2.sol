// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '../interfaces/IUniswapV2Factory.sol';


contract UniFactoryV2 {
    function getInitCHPair(address _factory) external view returns (bytes32) {
        return IUniswapV2Factory(_factory).getInitCodeHashPair();
    }
}