const MetaTokenSale = artifacts.require("MetaTokenSale");
const MetaToken = artifacts.require("MetaToken");

let meta, metaToken;
let tokenPrice = 1000000000000000; // in wei
var numberOfTokens;

contract("MetaTokenSale", accounts => {
    var buyer = accounts[1];
    var admin = accounts[0];
    var tokensAvailable = 750000;
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
    });

    it('facilitates token buying', function(){
        return MetaToken.deployed().then(instance => {
            metaToken = instance;
            return MetaTokenSale.deployed();
        })
        .then(instance => {
            meta = instance;
            return metaToken.transfer(meta.address, tokensAvailable, {from : admin});
        })
        .then(receipt => {
            numberOfTokens = 10;
            return meta.buyTokens(numberOfTokens, { from : buyer, value: numberOfTokens * tokenPrice});
        })
        .then(receipt => {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
            return meta.tokensSold();
        })
        .then(amount => {
            assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
            return metaToken.balanceOf(buyer);
        })
        .then(balance => {
            assert.equal(balance.toNumber(), numberOfTokens, 'balance of the buyer');
            return metaToken.balanceOf(meta.address);
        })
        .then(balance =>{
            assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens, 'number of tokens available');
            return meta.buyTokens(numberOfTokens, { from : buyer, value: 1 });
        })
       .then(assert.fail).catch(error => {
            assert(error.message, 'msg.value must equal numberof tokens in wei');
            numberOfTokens = 800000;
            return meta.buyTokens(numberOfTokens, { from : buyer, value: numberOfTokens * tokenPrice});
        })
        .then(assert.fail).catch(error => {
            assert(error.message, 'cannot purchase tokens more than available');
        })
    })

    it('ends token sale', function() {
        return MetaToken.deployed().then(function(instance) {
          // Grab token instance first
          metaToken = instance;
          return MetaTokenSale.deployed();
        }).then(instance => {
          // Then grab token sale instance
          meta = instance;
          // Try to end sale from account other than the admin
          return meta.endSale({ from: buyer });
        }).then(assert.fail).catch(function(error) {
          assert(error.message, 'must be admin to end sale');
          // End sale as admin
          return meta.endSale({ from: admin });
        }).then(receipt => {
          return metaToken.balanceOf(admin);
        }).then(balance =>{
          assert.equal(balance.toNumber(), 999990, 'returns all unsold dapp tokens to admin');
          // Check that the contract has no balance
        //   balance = web3.eth.getBalance(meta.address)
        //   assert.equal(balance.toNumber(), 0);
        });
      });

});