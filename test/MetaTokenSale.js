const MetaTokenSale = artifacts.require("MetaTokenSale");

let meta;

let tokenPrice = 1000000000000000; // in wei

contract("MetaTokenSale", accounts => {

    it('initializes the contract with the correct values', function(){
        return MetaTokenSale.deployed().then(instance => {
            meta = instance;
            return meta.address;
        })
        .then(address => {
            assert.notEqual(address, 0x0, 'has a contract address');
            return meta.tokenContract();
        })
        .then(address => {
            assert.notEqual(address, 0x0, 'has a token contract address');
            return meta.tokenPrice();
        })
        .then(price => {
            assert.equal(price, tokenPrice, 'token price is correct');
        })
    })

});