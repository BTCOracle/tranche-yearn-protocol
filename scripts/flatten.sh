#!/usr/bin/env zsh

# This scripts can be used to create flat files which can be directly imported on Remix if needed.
echo "Clearing existing flats"
if [ -d dist ]; then
    rm -rf dist
fi

mkdir dist
# TO-DO: Comments (author, summary, Created On) should be handled better.
# Jyearn
echo "Flattening # Jyearn contract"
npx truffle-flattener ./contracts/JYearn.sol | awk '/SPDX-License-Identifier/&&c++>0 {next} 1' | awk '/pragma experimental ABIEncoderV2;/&&c++>0 {next} 1' | awk '/pragma solidity/&&c++>0 {next} 1' | awk '/author/&&c++>0 {next} 1' | awk '/summary/&&c++>0 {next} 1' | awk '/Created on/&&c++>0 {next} 1' | sed '/^[[:blank:]]*\/\/ File/d;s/#.*//' >./dist/JYearn.sol