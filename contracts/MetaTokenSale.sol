pragma solidity ^0.8.0;

import "./MetaToken.sol";

contract MetaTokenSale{

    address admin;

    MetaToken public tokenContract;

    uint public tokenPrice;

    constructor(MetaToken _tokenContract, uint256 _tokenPrice){
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }
}