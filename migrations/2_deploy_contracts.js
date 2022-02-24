const MetaToken = artifacts.require("MetaToken");
const MetaTokenSale = artifacts.require("MetaTokenSale");

module.exports = function (deployer) {
  deployer.deploy(MetaToken, 1000000).then(function(){

    // price is 0.001 ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(MetaTokenSale, MetaToken.address, tokenPrice);
  });
  
};
